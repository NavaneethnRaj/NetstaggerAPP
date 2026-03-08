import { useState, useEffect } from 'react';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

const EmployeePage = () => {
    const { notifications, clearNotifications } = useNotifications();
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/employees?page=${page}&limit=10&search=${searchTerm}`);
            setEmployees(data.data || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalEmployees(data.pagination?.total || 0);
        } catch (err) {
            console.error('Failed to fetch employees:', err);
            setEmployees([]);
            setTotalPages(1);
            setTotalEmployees(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchEmployees();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [page, searchTerm]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value || 0);
    };

    return (
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
                <h1 className="text-lg font-semibold text-slate-800">Employee Directory</h1>
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
                </div>
            </header>

            {/* Content Wrapper */}
            <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-slate-900">All Employees</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm"
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">ID</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">Name</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">Base Salary</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">Total CTC</th>
                                        {/* <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">Status</th> */}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                                Loading employees...
                                            </td>
                                        </tr>
                                    ) : employees.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                                    </svg>
                                                    <p>No employees found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        employees.map((emp) => (
                                            <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                    {emp.employee_id || emp.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {emp.name !== 'Unknown' ? emp.name : `Employee ${emp.employee_id.substring(0, 8)}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {formatCurrency(parseFloat(emp.basic_pay) > 0 ? emp.basic_pay : parseFloat(emp.ctc) > 0 ? emp.ctc : emp.allowance)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {formatCurrency(emp.ctc)}
                                                </td>
                                                {/* <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                </td> */}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Showing {employees.length} records out of  {totalEmployees}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
                                    disabled={page === 1 || isLoading}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    Previous
                                </button>
                                <button
                                    className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
                                    disabled={page === totalPages || totalPages === 0 || isLoading}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default EmployeePage;
