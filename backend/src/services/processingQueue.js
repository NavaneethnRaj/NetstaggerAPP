const xlsx = require('xlsx');
const fs = require('fs');
const csv = require('csv-parser');
const crypto = require('crypto');
const path = require('path');
const pool = require('../db/mysql');
const socketService = require('./socketService');
const { sendProcessingComplete } = require('./emailService');

class ProcessingQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    addJob(job) {
        this.queue.push(job);
        console.log(`Job added to queue: ${job.uploadId}. Queue length: ${this.queue.length}`);
        this.processNext();
    }

    async processNext() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const job = this.queue.shift();
        const ext = path.extname(job.originalName).toLowerCase();

        try {
            console.log(`Starting processing for uploadId: ${job.uploadId} (${ext})`);

            if (ext === '.csv') {
                await this.processCSV(job);
            } else {
                await this.processXLSX(job);
            }

            // Mark Upload as completed
            await pool.query(
                `UPDATE uploads SET status = 'completed' WHERE id = ?`,
                [job.uploadId]
            );

            console.log(`Successfully completed uploadId: ${job.uploadId}`);

            // Notify User via WebSocket
            socketService.notifyUser(job.userId, {
                uploadId: job.uploadId,
                status: 'completed',
                fileName: job.originalName,
                processedAt: new Date().toISOString()
            });

            // Send email notification
            const [[userRow]] = await pool.query('SELECT email FROM users WHERE id = ?', [job.userId]);
            if (userRow) {
                await sendProcessingComplete(userRow.email, job.originalName, 'completed', job.uploadId);
            }

        } catch (error) {
            console.error(`Error processing uploadId ${job.uploadId}:`, error);

            // Mark Upload as failed
            await pool.query(
                `UPDATE uploads SET status = 'failed' WHERE id = ?`,
                [job.uploadId]
            ).catch(e => console.error('Failed to update upload status to failed:', e));

            // Notify User via WebSocket
            socketService.notifyUser(job.userId, {
                uploadId: job.uploadId,
                status: 'failed',
                error: error.message,
                fileName: job.originalName,
                processedAt: new Date().toISOString()
            });

            // Send email notification
            const [[userRow]] = await pool.query('SELECT email FROM users WHERE id = ?', [job.userId]).catch(() => [[null]]);
            if (userRow) {
                await sendProcessingComplete(userRow.email, job.originalName, 'failed', job.uploadId);
            }
        } finally {
            this.isProcessing = false;
            // Recursively process the next item in the queue
            this.processNext();
        }
    }

    async processCSV(job) {
        return new Promise((resolve, reject) => {
            const BATCH_SIZE = 5000;
            let batch = [];

            const stream = fs.createReadStream(job.filePath).pipe(csv());

            stream.on('data', async (row) => {
                batch.push(this.parseRow(row));

                if (batch.length >= BATCH_SIZE) {
                    stream.pause();
                    const currentBatch = batch;
                    batch = []; // reset batch

                    try {
                        await this.insertBatch(job.uploadId, currentBatch);
                        stream.resume();
                    } catch (err) {
                        stream.destroy();
                        reject(err);
                    }
                }
            });

            stream.on('end', async () => {
                try {
                    if (batch.length > 0) {
                        await this.insertBatch(job.uploadId, batch);
                    }
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });

            stream.on('error', (error) => {
                reject(error);
            });
        });
    }

    async processXLSX(job) {
        // Read file asynchronously so we don't block the event loop
        const buffer = await fs.promises.readFile(job.filePath);
        // Yield briefly so any pending socket/DB callbacks can run
        await new Promise(resolve => setImmediate(resolve));
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            throw new Error("Excel file is empty");
        }

        const BATCH_SIZE = 5000;
        let batch = [];

        for (const row of data) {
            batch.push(this.parseRow(row));

            if (batch.length >= BATCH_SIZE) {
                const currentBatch = batch;
                batch = []; // reset batch
                await this.insertBatch(job.uploadId, currentBatch);
                // Yield to event loop
                await new Promise(resolve => setImmediate(resolve));
            }
        }

        if (batch.length > 0) {
            await this.insertBatch(job.uploadId, batch);
        }
    }

    async insertBatch(uploadId, rowsToInsert) {
        if (rowsToInsert.length === 0) return;

        const values = rowsToInsert.map(row => [
            crypto.randomUUID(), uploadId, row.empId, row.name, row.basicPay, row.variablePay, row.allowance, row.bonus, row.ctc, 'active'
        ]);

        await pool.query(
            `INSERT INTO employees 
            (id, upload_id, employee_id, name, basic_pay, variable_pay, allowance, bonus, ctc, status) 
            VALUES ?`,
            [values]
        );
    }

    parseRow(row) {
        // Strip out hidden BOM characters or erratic trimming
        const empId = String(row['EmployeeID'] || row['Employee ID'] || row['empid'] || row['id'] || crypto.randomUUID().slice(0, 8)).trim();
        const name = String(row['EmployeeName'] || row['Employee Name'] || row['Name'] || row['name'] || 'Unknown').trim();

        const basicPay = parseFloat(row['BasicPay'] || row['Basic Pay'] || row['basic_pay']) || 0;
        const variablePay = parseFloat(row['VariablePay'] || row['Variable Pay'] || row['variable_pay']) || 0;
        const allowance = parseFloat(row['Allowance'] || row['allowances']) || 0;
        const bonus = parseFloat(row['Bonus'] || row['Bonus / Other'] || row['bonus']) || 0;

        // Calculate derived value
        const ctc = basicPay + variablePay + allowance + bonus;

        return { empId, name, basicPay, variablePay, allowance, bonus, ctc };
    }
}

module.exports = new ProcessingQueue();
