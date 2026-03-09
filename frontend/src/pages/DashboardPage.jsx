import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';
import api from '../api/client';

const DashboardPage = () => {
    const { user } = useAuth();
    const { notifications, clearNotifications } = useNotifications();
    const [uploads, setUploads] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(null); // null = idle, 0-100 = uploading

    const fetchUploads = async () => {
        try {
            const { data } = await api.get('/uploads');
            // Assuming data contains { data: [...] } for pagination
            setUploads(data.data || []);
        } catch (err) {
            console.error('Failed to fetch uploads:', err);
        }
    };

    useEffect(() => {
        fetchUploads();
    }, []);

    // Also refresh uploads if a notification arrives (optional but good for UX)
    useEffect(() => {
        if (notifications.length > 0) {
            fetchUploads();
        }
    }, [notifications]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploadProgress(0);
        try {
            await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                },
            });
            toast.success('File uploaded! Processing in background…');
            fetchUploads();
        } catch (err) {
            console.error('Failed to upload file:', err);
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploadProgress(null);
            e.target.value = ''; // Reset input
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
            case 'processing':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">Processing</span>;
            case 'error':
            case 'failed':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Error</span>;
            default:
                return null;
        }
    };

    const getFileIcon = (status) => {
        const baseClass = "p-2 rounded";
        switch (status) {
            case 'completed':
                return (
                    <div className={`${baseClass} bg-green-50 text-green-700`}>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                );
            case 'processing':
                return (
                    <div className={`${baseClass} bg-blue-50 text-blue-700`}>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                );
            case 'error':
            case 'failed':
                return (
                    <div className={`${baseClass} bg-red-50 text-red-700`}>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                );
            default:
                return null;
        }
    };

    const getActionIcon = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Download">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </button>
                );
            case 'processing':
                return (
                    <svg className="h-5 w-5 ml-auto animate-spin text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                );
            case 'error':
            case 'failed':
                return (
                    <button className="text-red-500 hover:text-red-700 transition-colors p-1" title="View Error Details">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
                <h1 className="text-lg font-semibold text-slate-800">Salary Upload Dashboard</h1>
                <div className="flex items-center gap-4">
                    <button
                        className="text-slate-500 hover:text-slate-700 p-2 relative"
                        onClick={clearNotifications}
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                            </span>
                        )}
                    </button>
                    <div className="h-8 w-[1px] bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </header>

            {/* Content Wrapper */}
            <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
                {/* Upload Section */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-slate-900">Upload Salary Data</h2>
                        <p className="text-sm text-slate-500">Upload your monthly salary Excel (.xlsx) file to process payroll.</p>
                    </div>

                    <div
                        className="border-2 border-dashed border-slate-300 rounded-xl bg-white p-12 text-center transition-all hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer"
                        onClick={() => uploadProgress === null && document.getElementById('fileInput').click()}
                    >
                        <div className="flex flex-col items-center">
                            {uploadProgress !== null ? (
                                /* ── Progress View ── */
                                <>
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                        <svg className="h-8 w-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-700 font-medium mb-3">Uploading… {uploadProgress}%</p>
                                    <div className="w-64 bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-slate-400 text-xs mt-2">Please wait — large files may take a moment</p>
                                </>
                            ) : (
                                /* ── Idle / Drop View ── */
                                <>
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                    </div>
                                    <p className="text-slate-700 font-medium mb-1">Click to upload or drag and drop</p>
                                    <p className="text-slate-500 text-xs">Excel/CSV Files Only (max. 100MB)</p>
                                    <input type="file" accept=".xlsx, .xls, .csv" className="hidden" id="fileInput" onChange={handleFileUpload} />
                                    <button
                                        className="mt-6 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                                        onClick={(ev) => { ev.stopPropagation(); document.getElementById('fileInput').click(); }}
                                    >
                                        Select Files
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* History Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-slate-900">Upload History</h2>
                        <button className="text-sm text-blue-600 hover:underline font-medium">Export Logs</button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">File Name</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {uploads.map((upload) => (
                                    <tr key={upload.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(upload.status)}
                                                <span className="font-medium text-slate-800">{upload.original_name || upload.file_name || upload.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 italic">{new Date(upload.created_at || upload.date).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(upload.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {getActionIcon(upload.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Showing {uploads.length} of {uploads.length} uploads</span>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                                <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50" disabled>Next</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default DashboardPage;
