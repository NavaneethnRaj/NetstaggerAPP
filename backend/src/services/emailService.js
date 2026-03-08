const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a notification email when file processing completes or fails.
 * @param {string} toEmail  - Recipient's email address
 * @param {string} fileName - Original name of the uploaded file
 * @param {string} status   - 'completed' or 'failed'
 * @param {string} uploadId - The upload ID
 */
async function sendProcessingComplete(toEmail, fileName, status, uploadId) {
    const isSuccess = status === 'completed';

    const subject = isSuccess
        ? `✅ File Processing Complete — ${fileName}`
        : `❌ File Processing Failed — ${fileName}`;

    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: ${isSuccess ? '#2563eb' : '#dc2626'}; padding: 28px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">
                ${isSuccess ? 'Processing Complete' : '❌ Processing Failed'}
            </h1>
        </div>
        <div style="padding: 28px 32px; background: #ffffff;">
            <p style="color: #475569; font-size: 15px; line-height: 24px;">
                ${isSuccess
            ? 'Your payroll file has been successfully processed and all employee records are now available in SalarySync.'
            : 'Your payroll file could not be processed. Please check the file format and try again.'}
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">File Details</p>
                <p style="margin: 4px 0; font-size: 15px; color: #1e293b;"><strong>File:</strong> ${fileName}</p>
                <p style="margin: 4px 0; font-size: 15px; color: #1e293b;"><strong>Status:</strong> ${isSuccess ? 'Completed' : 'Failed'}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #94a3b8;"><strong>Upload ID:</strong> ${uploadId}</p>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">This is an automated message from SalarySync. Please do not reply to this email.</p>
        </div>
        <div style="padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">© ${new Date().getFullYear()} SalarySync. All rights reserved.</p>
        </div>
    </div>`;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"SalarySync" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject,
            html,
        });
        console.log(`📧 Email sent to ${toEmail} for uploadId: ${uploadId} (${status})`);
    } catch (err) {
        console.error(`❌ Failed to send email to ${toEmail}:`, err.message);
    }
}

module.exports = { sendProcessingComplete };
