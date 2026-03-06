import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FileDetailPage = () => {
    const { id } = useParams();

    const [fileInfo, setFileInfo] = useState(null);
    const [summary, setSummary] = useState({ totalRecords: 0, totalTax: 0, totalNetPayout: 0 });
    const [employees, setEmployees] = useState([]);

    // Pagination & Search state
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // UI state
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);

    const fetchFileData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch generic file info
            const fileRes = await axios.get(`${BACKEND_URL}/api/uploads/${id}`, { headers });
            setFileInfo(fileRes.data);

            // Fetch summary stats
            const summaryRes = await axios.get(`${BACKEND_URL}/api/uploads/${id}/summary`, { headers });
            setSummary({
                totalRecords: summaryRes.data.totalRecords || 0,
                totalTax: summaryRes.data.totalTax || 0,
                totalNetPayout: summaryRes.data.totalNetPayout || 0
            });

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch file detail:', error);
            setLoading(false);
        }
    }, [id]);

    const fetchEmployees = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BACKEND_URL}/api/uploads/${id}/employees`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, limit, search: searchTerm }
            });

            setEmployees(res.data.data);
            setTotalPages(res.data.pagination.totalPages);
            setTotalItems(res.data.pagination.total);

            // Show toast if just finished loading for the first time or if search succeeds
            if (res.data.data.length > 0 && page === 1 && !searchTerm) {
                setShowToast(true);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    }, [id, page, limit, searchTerm]);

    useEffect(() => {
        fetchFileData();
    }, [fetchFileData]);

    // Handle debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEmployees();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchEmployees]);

    // Toast Timer
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading details...</div>;
    }

    if (!fileInfo) {
        return <div className="p-8 text-center text-red-500">File not found or access denied.</div>;
    }

    // Determine Status Badge Colors
    const isCompleted = fileInfo.status === 'completed';
    const badgeColor = isCompleted ? 'bg-green-100 text-green-800' :
        fileInfo.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';
    const dotColor = isCompleted ? 'text-green-400' : fileInfo.status === 'failed' ? 'text-red-400' : 'text-amber-400';

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 font-sans text-gray-900 overflow-hidden relative">
            {/* Main Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10" data-purpose="navigation-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Back button and File Title */}
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors" title="Back to Dashboard">
                            <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" clipRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"></path>
                            </svg>
                            Dashboard
                        </Link>
                        <div className="h-6 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-gray-900 truncate max-w-sm" title={fileInfo.original_name}>
                                {fileInfo.original_name}
                            </h1>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`} data-purpose="status-badge">
                                <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${dotColor}`} fill="currentColor" viewBox="0 0 8 8">
                                    <circle cx="4" cy="4" r="3"></circle>
                                </svg>
                                {fileInfo.status.charAt(0).toUpperCase() + fileInfo.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button id="export-button" type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Export Processed Data
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">

                {/* Data Summary Section */}
                <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6" data-purpose="summary-cards">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 truncate">Total Records</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{summary.totalRecords.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 truncate">Total Tax Calculated</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalTax)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 truncate">Total Net Payout</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalNetPayout)}</p>
                    </div>
                </section>

                {/* Data Table Section */}
                <section className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[600px]" data-purpose="employee-records-table">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
                        <h2 className="text-lg font-semibold text-gray-800">Employee Records</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200" id="employee-records">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Base Salary</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Tax Deduction</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Net Pay</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map((emp) => {
                                    const taxDeduction = emp.basic_pay * 0.2; // Derived from mock logic

                                    return (
                                        <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.employee_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(emp.basic_pay)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">-{formatCurrency(taxDeduction)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(emp.ctc)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {emp.status === 'active' ? 'Success' : emp.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {employees.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                                            No employee records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{totalItems === 0 ? 0 : (page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalItems)}</span> of <span className="font-medium">{totalItems.toLocaleString()}</span> results
                        </div>
                        <div className="inline-flex shadow-sm rounded-md border border-slate-300 overflow-hidden" aria-label="Pagination">
                            <button
                                onClick={handlePreviousPage}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-3 py-2 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 border-r border-slate-300 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="relative inline-flex items-center px-4 py-2 bg-white text-sm font-medium text-gray-700 border-r border-slate-300">
                                Page {page} of {totalPages || 1}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={page >= totalPages}
                                className="relative inline-flex items-center px-3 py-2 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Toast Notification */}
            {showToast && (
                <div id="completion-toast" className="fixed bottom-5 right-5 z-50 animate-[slideIn_0.3s_ease-out_forwards]">
                    <div className="bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 border border-gray-700">
                        <div className="bg-green-500 p-1 rounded-full">
                            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold">Processing Complete</h4>
                            <p className="text-xs text-gray-400">All {summary.totalRecords.toLocaleString()} records have been calculated.</p>
                        </div>
                        <button className="ml-4 text-gray-500 hover:text-white transition-colors" onClick={() => setShowToast(false)}>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default FileDetailPage;
