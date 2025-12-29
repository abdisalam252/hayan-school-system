import React, { useState, useEffect } from "react";
import { FileText, Download, TrendingUp, Users, Calendar, Award, Printer, X, Share2, ExternalLink, User, CheckCircle, AlertCircle, Phone, Filter, PieChart, Briefcase, DollarSign } from "lucide-react";
import { API_BASE_URL } from "../config";
import Modal from "../components/Modal";
// Utility to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// --- Print Template Logic ---
const ReportPrintTemplate = ({ type, data, schoolProfile, filters }) => {
    return (
        <div className="bg-white text-gray-900 w-full max-w-4xl mx-auto min-h-[29.7cm] flex flex-col shadow-none" id="report-print">
            {/* Header Section */}
            <div className="bg-brand-900 text-white p-10 print:bg-brand-900 print:text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{schoolProfile?.school_name || "Hayan School System"}</h1>
                        <p className="text-brand-100 opacity-90">{schoolProfile?.motto || "System Generated Report"}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold uppercase tracking-widest opacity-90">{type}</h2>
                        <p className="text-brand-100 font-mono mt-1 opacity-75">{new Date().toLocaleDateString()}</p>
                        {filters && (
                            <p className="text-xs text-brand-200 mt-2">
                                Filter: {filters.month}/{filters.year}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-10 flex-1">
                {type === 'Financial Statement' && <FinancialStatementTable data={data} />}
                {type === 'Attendance Report' && <AttendanceReportTable data={data} />}
                {type === 'Student Grades' && <GradesReportTable data={data} />}
                {type === 'Expense Report' && <ExpenseReportTable data={data} />}
                {type === 'Salary Report' && <SalaryReportTable data={data} />}
                {type === 'Staff Directory' && <StaffDirectoryTable data={data} />}
                {type === 'Fee Collection' && <FeeCollectionTable data={data} printMode={true} />}
                {type === 'Student Report Card' && <StudentReportCard data={data} />}
            </div>

            <div className="p-10 mt-auto border-t border-gray-100 bg-gray-50 print:bg-gray-50">
                <div className="flex justify-between items-center text-xs text-gray-400">
                    <p>© {new Date().getFullYear()} Hayan School System. Confidential.</p>
                </div>
            </div>
        </div>
    );
};

const ExpenseReportTable = ({ data }) => {
    if (!data.summary) return <p>No data available</p>;
    const { summary, byCategory, transactions } = data;
    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6">
                <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-sm font-bold text-red-700 uppercase tracking-wide">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-900 mt-2">{formatCurrency(summary.total)}</p>
                </div>
                <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                    <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">Avg. Daily Expense</p>
                    <p className="text-3xl font-bold text-orange-900 mt-2">{formatCurrency(summary.avgDaily)}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Top Category</p>
                    <p className="text-xl font-bold text-gray-900 mt-2 truncate">{summary.topCategory}</p>
                    <p className="text-xs text-gray-400 mt-1">Highest spending area</p>
                </div>
            </div>

            {/* Category Analysis */}
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-gray-400" />
                        Category Breakdown
                    </h3>
                    <div className="space-y-4">
                        {byCategory.map((cat, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{cat.name}</span>
                                    <span className="font-mono text-gray-500">{formatCurrency(cat.amount)} ({cat.percentage}%)</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 group-hover:bg-red-400 transition-colors" style={{ width: `${cat.percentage}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visual Placeholder (Optional real chart later) */}
                <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center border border-gray-100 dashed">
                    <p className="text-gray-400 text-sm">Category distribution visualization</p>
                </div>
            </div>

            {/* Detailed Transaction List */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Expense Transactions</h3>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-4 font-semibold text-gray-700">Date</th>
                            <th className="py-3 px-4 font-semibold text-gray-700">Description</th>
                            <th className="py-3 px-4 font-semibold text-gray-700">Category</th>
                            <th className="py-3 px-4 text-right font-semibold text-gray-700">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.map((t, i) => (
                            <tr key={i} className="hover:bg-gray-50/50">
                                <td className="py-3 px-4 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="py-3 px-4 font-medium text-gray-900">{t.title}</td>
                                <td className="py-3 px-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs uppercase font-bold">{t.type || 'General'}</span></td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-red-600">-{formatCurrency(t.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SalaryReportTable = ({ data }) => {
    if (!data.summary) return <p>No data available</p>;
    const { summary, payroll } = data;
    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6">
                <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                    <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Total Payroll</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">{formatCurrency(summary.totalPaid)}</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">Staff Paid</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{summary.staffCount}</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                    <p className="text-sm font-bold text-purple-700 uppercase tracking-wide">Avg. Salary</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">{formatCurrency(summary.avgSalary)}</p>
                </div>
            </div>

            {/* Payroll Table */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    Payroll Details
                </h3>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-4 font-semibold text-gray-700">Staff Name</th>
                            <th className="py-3 px-4 font-semibold text-gray-700">Role</th>
                            <th className="py-3 px-4 font-semibold text-gray-700">Payment Date</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700">Status</th>
                            <th className="py-3 px-4 text-right font-semibold text-gray-700">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payroll.map((p, i) => (
                            <tr key={i} className="hover:bg-gray-50/50">
                                <td className="py-3 px-4 font-medium text-gray-900">{p.staffName}</td>
                                <td className="py-3 px-4 text-gray-500">{p.role}</td>
                                <td className="py-3 px-4 text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Paid</span>
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-gray-800">{formatCurrency(p.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Sub-Tables for Reports ---

const StudentReportCard = ({ data }) => {
    if (!data.student) return <p>Loading...</p>;
    const { student, results, attendance } = data;

    return (
        <div className="space-y-8">
            {/* Student Info */}
            <div className="flex justify-between items-start border-b pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
                    <p className="text-gray-500">Student ID: <span className="font-mono text-gray-800">#{student.id}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-bold text-lg">{student.class_name}</p>
                </div>
            </div>

            {/* Attendance Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wide border-b pb-2">Attendance Summary</h3>
                <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Total Days</p>
                        <p className="text-xl font-bold">{attendance.total}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center border border-green-100">
                        <p className="text-xs text-green-700 uppercase font-bold">Present</p>
                        <p className="text-xl font-bold text-green-800">{attendance.present}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg text-center border border-red-100">
                        <p className="text-xs text-red-700 uppercase font-bold">Absent</p>
                        <p className="text-xl font-bold text-red-800">{attendance.absent}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-100">
                        <p className="text-xs text-blue-700 uppercase font-bold">Att. Rate</p>
                        <p className="text-xl font-bold text-blue-800">{attendance.rate}%</p>
                    </div>
                </div>
            </div>

            {/* Academic Results */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wide border-b pb-2">Academic Performance</h3>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3">Exam</th>
                            <th className="p-3">Subject</th>
                            <th className="p-3 text-right">Marks</th>
                            <th className="p-3 text-center">Grade</th>
                            <th className="p-3">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {results.length > 0 ? results.map((res, i) => (
                            <tr key={i}>
                                <td className="p-3 font-medium">{res.exam_name}</td>
                                <td className="p-3">{res.subject}</td>
                                <td className="p-3 text-right font-mono font-bold">{res.marks}/{res.total_marks}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${['A', 'A+'].includes(res.grade) ? 'bg-green-100 text-green-800' :
                                        ['B', 'B+'].includes(res.grade) ? 'bg-blue-100 text-blue-800' :
                                            ['F'].includes(res.grade) ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {res.grade}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-500 italic">{res.remarks}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-500">No exam results recorded.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t pt-8 mt-8">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-sm text-gray-500 mb-8">Principal's Signature:</p>
                        <div className="w-48 border-b-2 border-gray-300"></div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-8">Class Teacher's Signature:</p>
                        <div className="w-48 border-b-2 border-gray-300"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FinancialStatementTable = ({ data }) => {
    const total = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
    return (
        <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{data.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs font-bold text-green-700 uppercase">Net Volume</p>
                    <p className="text-2xl font-bold text-green-900">${total.toLocaleString()}</p>
                </div>
            </div>
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b-2 border-brand-900">
                        <th className="py-2">Date</th>
                        <th className="py-2">Title</th>
                        <th className="py-2">Category</th>
                        <th className="py-2 text-right">Amount</th>
                        <th className="py-2 text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100">
                            <td className="py-3">{new Date(item.date).toLocaleDateString()}</td>
                            <td className="py-3 font-medium">{item.title}</td>
                            <td className="py-3 capitalize">{item.category}</td>
                            <td className="py-3 text-right font-mono">${item.amount}</td>
                            <td className="py-3 text-center"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{item.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AttendanceReportTable = ({ data }) => {
    if (!data.by_class) return <p>No data available</p>;
    return (
        <div>
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">{data.total_records}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs font-bold text-green-700 uppercase">Present</p>
                    <p className="text-2xl font-bold text-green-900">{data.present}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs font-bold text-red-700 uppercase">Absent</p>
                    <p className="text-2xl font-bold text-red-900">{data.absent}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <p className="text-xs font-bold text-yellow-700 uppercase">Late</p>
                    <p className="text-2xl font-bold text-yellow-900">{data.late}</p>
                </div>
            </div>
            <h3 className="font-bold mb-4">Breakdown by Class</h3>
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b-2 border-brand-900">
                        <th className="py-2">Class Name</th>
                        <th className="py-2 text-center">Total Entries</th>
                        <th className="py-2 text-center">Present Count</th>
                        <th className="py-2 text-center">Method</th>
                        <th className="py-2 text-center">Attendance Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {data.by_class.map((item, i) => {
                        const rate = item.total > 0 ? ((item.present / item.total) * 100).toFixed(1) : 0;
                        return (
                            <tr key={i} className="border-b border-gray-100">
                                <td className="py-3 font-medium">{item.class_name}</td>
                                <td className="py-3 text-center">{item.total}</td>
                                <td className="py-3 text-center">{item.present}</td>
                                <td className="py-3 text-center text-xs text-gray-500">-</td>
                                <td className="py-3 text-center font-bold">{rate}%</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const StaffDirectoryTable = ({ data }) => (
    <table className="w-full text-left text-sm">
        <thead>
            <tr className="border-b-2 border-brand-900">
                <th className="py-2">Name</th>
                <th className="py-2">Subject</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Email</th>
            </tr>
        </thead>
        <tbody>
            {data.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3">{item.subject}</td>
                    <td className="py-3">{item.phone}</td>
                    <td className="py-3 text-gray-500">{item.email}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const GradesReportTable = ({ data }) => (
    <table className="w-full text-left text-sm">
        <thead>
            <tr className="border-b-2 border-brand-900">
                <th className="py-2">Exam Title</th>
                <th className="py-2">Subject</th>
                <th className="py-2">Class</th>
                <th className="py-2">Date</th>
                <th className="py-2 text-center">Total Marks</th>
            </tr>
        </thead>
        <tbody>
            {data.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3">{item.subject}</td>
                    <td className="py-3 text-gray-500">{item.class_name || 'N/A'}</td>
                    <td className="py-3">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="py-3 text-center">{item.total_marks || 100}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

// --- UPDATED FEE COLLECTION TABLE ---
const FeeCollectionTable = ({ data, printMode = false }) => {
    // data contains { paid, unpaid, summary, byClass, byLevel } passed from parent
    const [view, setView] = useState('overview'); // 'overview', 'paid', 'unpaid'

    if (!data || !data.summary) return <p>No data available</p>;
    const { summary, paid, unpaid, byClass, byLevel } = data;

    // Use print styles for the table wrapper
    const containerClass = printMode ? "" : "bg-white rounded-xl shadow-sm p-6 border border-gray-100";

    return (
        <div className={containerClass}>
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Active Students</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalStudents}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs font-bold text-green-700 uppercase">Paid Count</p>
                    <p className="text-2xl font-bold text-green-900">{summary.paidCount}</p>
                    <p className="text-xs text-green-600 mt-1">{summary.collectionRate}% Collected</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs font-bold text-red-700 uppercase">Unpaid Count</p>
                    <p className="text-2xl font-bold text-red-900">{summary.unpaidCount}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-700 uppercase">Total Collected</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.totalCollected)}</p>
                </div>
            </div>

            {/* Navigation Tabs (Hidden in Print Mode) */}
            {!printMode && (
                <div className="flex gap-2 mb-6 border-b border-gray-100 pb-1">
                    <button onClick={() => setView('overview')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${view === 'overview' ? 'text-brand-700 bg-brand-50 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}>Overview & Breakdown</button>
                    <button onClick={() => setView('paid')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${view === 'paid' ? 'text-green-700 bg-green-50 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>Paid List ({paid.length})</button>
                    <button onClick={() => setView('unpaid')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${view === 'unpaid' ? 'text-red-700 bg-red-50 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Unpaid List ({unpaid.length})</button>
                </div>
            )}

            {/* Views */}
            <div className="space-y-8">
                {/* OVERVIEW SECTION */}
                {(view === 'overview' || printMode) && (
                    <>
                        {/* Class Breakdown */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-400" />
                                Breakdown by Class
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="py-3 px-4 font-semibold text-gray-700">Class Name</th>
                                            <th className="py-3 px-4 text-center font-semibold text-gray-700">Total Students</th>
                                            <th className="py-3 px-4 text-center font-semibold text-green-700 bg-green-50">Paid</th>
                                            <th className="py-3 px-4 text-center font-semibold text-red-700 bg-red-50">Unpaid</th>
                                            <th className="py-3 px-4 text-center font-semibold text-blue-700">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {byClass.map((item, i) => (
                                            <tr key={i} className="hover:bg-gray-50/50">
                                                <td className="py-3 px-4 font-medium">{item.className}</td>
                                                <td className="py-3 px-4 text-center">{item.total}</td>
                                                <td className="py-3 px-4 text-center text-green-700 font-medium bg-green-50/30">{item.paid}</td>
                                                <td className="py-3 px-4 text-center text-red-700 font-medium bg-red-50/30">{item.unpaid}</td>
                                                <td className="py-3 px-4 text-center font-bold text-gray-700">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-brand-500" style={{ width: `${item.rate}%` }}></div>
                                                        </div>
                                                        {item.rate}%
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Level Breakdown */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-400" />
                                Breakdown by Level
                            </h3>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="py-3 px-4 font-semibold text-gray-700">Level</th>
                                        <th className="py-3 px-4 text-center font-semibold text-gray-700">Total Students</th>
                                        <th className="py-3 px-4 text-center font-semibold text-green-700">Paid</th>
                                        <th className="py-3 px-4 text-center font-semibold text-red-700">Unpaid</th>
                                        <th className="py-3 px-4 text-center font-semibold text-blue-700">Collection Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {byLevel.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-medium">{item.level}</td>
                                            <td className="py-3 px-4 text-center">{item.total}</td>
                                            <td className="py-3 px-4 text-center text-green-700 font-medium">{item.paid}</td>
                                            <td className="py-3 px-4 text-center text-red-700 font-medium">{item.unpaid}</td>
                                            <td className="py-3 px-4 text-center font-bold text-gray-700">{item.rate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* PAID LIST SECTION */}
                {(view === 'paid' || (printMode && paid.length > 0 && false)) && ( // In print mode, currently only showing breakdowns to save paper unless requested
                    <div className="bg-green-50/30 rounded-xl p-4 border border-green-100">
                        <h3 className="text-lg font-bold text-green-800 mb-4">Paid Students List</h3>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-green-200">
                                    <th className="py-2 px-2">Student Name</th>
                                    <th className="py-2 px-2">Class</th>
                                    <th className="py-2 px-2 text-right">Amount</th>
                                    <th className="py-2 px-2 text-right">Date Paid</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paid.map((p, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-white transition-colors">
                                        <td className="py-3 px-2 font-medium">{p.student_name || p.title}</td>
                                        <td className="py-3 px-2 text-gray-600">{p.class_name || '-'}</td>
                                        <td className="py-3 px-2 text-right font-mono text-green-700 font-bold">{formatCurrency(p.amount)}</td>
                                        <td className="py-3 px-2 text-right text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* UNPAID LIST SECTION */}
                {(view === 'unpaid' || (printMode && unpaid.length > 0 && false)) && (
                    <div className="bg-red-50/30 rounded-xl p-4 border border-red-100">
                        <h3 className="text-lg font-bold text-red-800 mb-4">Unpaid Students List</h3>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-red-200">
                                    <th className="py-2 px-2">Student Name</th>
                                    <th className="py-2 px-2">Class</th>
                                    <th className="py-2 px-2">Parent Contact</th>
                                    <th className="py-2 px-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unpaid.map((u, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-white transition-colors">
                                        <td className="py-3 px-2 font-medium">{u.name}</td>
                                        <td className="py-3 px-2 text-gray-600">{u.class_name}</td>
                                        <td className="py-3 px-2 flex items-center gap-2 text-gray-600">
                                            <Phone className="w-3 h-3" />
                                            {u.phone || u.parent_phone || 'N/A'}
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">Unpaid</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


const ReportCard = ({ title, type, date, icon: Icon, color, onClick }) => (
    <div onClick={onClick} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                {type}
            </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{date}</p>

        <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FileText className="w-4 h-4" /> View
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-sm font-medium text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">
                <Download className="w-4 h-4" /> Export
            </button>
        </div>
    </div>
);

const Reports = () => {
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // --- Date Filter State ---
    const [dateRangePreset, setDateRangePreset] = useState('thisMonth'); // 'thisMonth', 'lastMonth', 'halfYear', 'lastYear', 'custom'
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // For Fee Report
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // For Fee Report

    const [schoolProfile, setSchoolProfile] = useState(null);

    // --- States for Student Selection ---
    const [isStudentSelectModalOpen, setIsStudentSelectModalOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [financeData, setFinanceData] = useState([]); // Cache for finance
    const [searchTerm, setSearchTerm] = useState("");

    const API_URL = `${API_BASE_URL}/api`;

    // Helper to set dates based on preset
    useEffect(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();

        if (dateRangePreset === 'thisMonth') {
            setStartDate(new Date(y, m, 1).toISOString().split('T')[0]);
            setEndDate(new Date(y, m + 1, 0).toISOString().split('T')[0]);
        } else if (dateRangePreset === 'lastMonth') {
            setStartDate(new Date(y, m - 1, 1).toISOString().split('T')[0]);
            setEndDate(new Date(y, m, 0).toISOString().split('T')[0]);
        } else if (dateRangePreset === 'halfYear') {
            // Last 6 months
            setStartDate(new Date(y, m - 5, 1).toISOString().split('T')[0]);
            setEndDate(new Date(y, m + 1, 0).toISOString().split('T')[0]);
        } else if (dateRangePreset === 'lastYear') {
            setStartDate(new Date(y - 1, 0, 1).toISOString().split('T')[0]);
            setEndDate(new Date(y - 1, 12, 0).toISOString().split('T')[0]);
        } else if (dateRangePreset === 'custom') {
            // Keep existing values or reset if empty
            if (!startDate) setStartDate(new Date(y, m, 1).toISOString().split('T')[0]);
            if (!endDate) setEndDate(new Date(y, m + 1, 0).toISOString().split('T')[0]);
        }
    }, [dateRangePreset]);

    useEffect(() => {
        // Pre-fetch students and classes
        const loadGlobals = async () => {
            try {
                const [resStudents, resClasses, resProfile] = await Promise.all([
                    fetch(`${API_URL}/students`),
                    fetch(`${API_URL}/classes`),
                    fetch(`${API_URL}/school-profile`)
                ]);

                if (resStudents.ok) setStudents(await resStudents.json());
                if (resClasses.ok) setClasses(await resClasses.json());
                if (resProfile.ok) setSchoolProfile(await resProfile.json());

            } catch (e) { console.error("Error loading globals", e); }
        };
        loadGlobals();
    }, []);

    // --- Advanced Filter State ---
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'class', 'level'
    const [filterId, setFilterId] = useState(''); // Selected Class ID or Level Name
    const [reportStatus, setReportStatus] = useState('all'); // 'all', 'paid', 'unpaid'

    // --- Expense & Salary Filter State ---
    const [expenseCategory, setExpenseCategory] = useState('All');
    const [salaryRole, setSalaryRole] = useState('All');

    // --- EXPENSE PROCESSING LOGIC ---
    const processExpenseReport = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/finance`);
            const allFinance = res.ok ? await res.json() : [];
            setFinanceData(allFinance);

            // Filter Expenses
            let expenses = allFinance.filter(f => f.category === 'expense');

            // Apply Date Filter
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                expenses = expenses.filter(e => {
                    const d = new Date(e.date);
                    return d >= start && d <= end;
                });
            }

            // Apply Category Filter
            if (expenseCategory !== 'All') {
                expenses = expenses.filter(e => e.type === expenseCategory);
            }

            const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

            // Category Breakdown
            const byCat = {};
            expenses.forEach(e => {
                const type = e.type || 'Uncategorized';
                if (!byCat[type]) byCat[type] = 0;
                byCat[type] += Number(e.amount);
            });

            const byCategoryArray = Object.entries(byCat).map(([name, amount]) => ({
                name,
                amount,
                percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0
            })).sort((a, b) => b.amount - a.amount);

            // Summary Stats
            const dayCount = (startDate && endDate) ? Math.max(1, (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 30;

            const expenseData = {
                summary: {
                    total,
                    avgDaily: total / dayCount,
                    topCategory: byCategoryArray.length > 0 ? byCategoryArray[0].name : 'N/A'
                },
                byCategory: byCategoryArray,
                transactions: expenses.sort((a, b) => new Date(b.date) - new Date(a.date))
            };

            setReportData(expenseData);
            setIsLoading(false);
        } catch (e) { console.error(e); setIsLoading(false); }
    };

    // --- SALARY PROCESSING LOGIC ---
    const processSalaryReport = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/finance`);
            const allFinance = res.ok ? await res.json() : [];
            setFinanceData(allFinance);

            const targetMonth = parseInt(selectedMonth);
            const targetYear = parseInt(selectedYear);
            console.log("Processing Salary for:", targetMonth, targetYear);

            // Fetch teachers for role mapping if needed (already have 'students', 'classes', need 'teachers'?)
            // We can fetch teachers just in case to get precise roles if not in finance record
            let teachersList = [];
            const resTeachers = await fetch(`${API_URL}/teachers`);
            if (resTeachers.ok) teachersList = await resTeachers.json();

            // Filter Salaries
            let salaries = allFinance.filter(f => {
                if (f.category !== 'salary') return false;
                const d = new Date(f.date);
                return d.getMonth() + 1 === targetMonth && d.getFullYear() === targetYear;
            });

            // Map details
            let payroll = salaries.map(s => {
                const teacher = teachersList.find(t => t.name === s.title || String(t.id) === String(s.reference_id));
                return {
                    ...s,
                    staffName: s.title,
                    role: teacher ? (teacher.role || teacher.subject) : (s.type || 'Staff'),
                    amount: Number(s.amount)
                };
            });

            // Apply Role Filter
            if (salaryRole !== 'All') {
                payroll = payroll.filter(p => p.role === salaryRole);
            }

            const totalPaid = payroll.reduce((sum, p) => sum + p.amount, 0);

            const salaryData = {
                summary: {
                    totalPaid,
                    staffCount: payroll.length,
                    avgSalary: payroll.length > 0 ? totalPaid / payroll.length : 0
                },
                payroll: payroll.sort((a, b) => new Date(b.date) - new Date(a.date))
            };

            setReportData(salaryData);
            setIsLoading(false);
        } catch (e) { console.error(e); setIsLoading(false); }
    };

    // --- FEE PROCESSING LOGIC ---
    const processFeeReport = async () => {
        setIsLoading(true);
        try {
            // Fetch finance if not already or force refresh
            const res = await fetch(`${API_URL}/finance`);
            const allFinance = res.ok ? await res.json() : [];
            setFinanceData(allFinance);

            // Filter Income & Type = Tuition
            const targetMonth = parseInt(selectedMonth);
            const targetYear = parseInt(selectedYear);
            console.log("Processing Fees for:", targetMonth, targetYear);

            // 1. Get Base Students (Active Only)
            let baseStudents = students.filter(s => s.status === 'Active' && !s.is_deleted);

            // 2. Apply Scope Filters (Class / Level)
            const classMap = classes.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});

            if (filterMode === 'class' && filterId) {
                baseStudents = baseStudents.filter(s => String(s.class_id) === String(filterId));
            } else if (filterMode === 'level' && filterId) {
                baseStudents = baseStudents.filter(s => classMap[s.class_id]?.level === filterId);
            }

            // Map class names to students
            const enrichedStudents = baseStudents.map(s => ({
                ...s,
                class_name: classMap[s.class_id]?.name || 'Unknown Class',
                class_level: classMap[s.class_id]?.level || 'Unknown Level'
            }));

            // 3. Identify Payments
            const paidTransactions = allFinance.filter(f => {
                if (f.category !== 'income') return false;
                const d = new Date(f.date);
                return d.getMonth() + 1 === targetMonth && d.getFullYear() === targetYear;
            });

            const paidStudentIds = new Set();
            let paidList = [];

            // Match transactions to enriched students
            paidTransactions.forEach(t => {
                let student = null;
                if (t.reference_id) {
                    student = enrichedStudents.find(s => String(s.id) === String(t.reference_id));
                } else if (t.title) {
                    student = enrichedStudents.find(s => s.name.toLowerCase() === t.title.toLowerCase());
                }

                if (student) {
                    paidStudentIds.add(String(student.id));
                    paidList.push({
                        ...t,
                        student_name: student.name,
                        class_name: student.class_name,
                        student_id: student.id
                    });
                }
            });

            // 4. Identify Unpaid
            let unpaidList = enrichedStudents.filter(s => !paidStudentIds.has(String(s.id)));

            // 5. Apply Status Filter (Paid vs Unpaid)
            // Note: If we filter by 'Paid', we exclude Unpaid students from the report entirely?
            // User requested "paid unpaid na la report garaynayo" - usually means seeing lists.
            // If they select 'Paid', we show only Paid list. If 'Unpaid', only Unpaid list.
            // However, for the SUMMARY stats, it makes sense to reflect the *Selected Scope*.
            // But if "Status: Paid" is selected, Unpaid Count should probably be 0 in the summary?
            // Let's implement it such that the LISTS are filtered, and the SUMMARY reflects the *filtered* lists.

            if (reportStatus === 'paid') {
                unpaidList = []; // clear unpaid list
                // We keep paidList as is
                // enrichedStudents (total scope) should theoretically be just the paid ones for the summary to make sense?
                // Or do we show: Total Students: 100, Paid: 50, Unpaid: 0 (Hidden)?
                // Let's filter enrichedStudents effectively to just paid ones for consistency
                // Actually, let's keep enrichedStudents as the "Total Scope" (e.g. Grade 1), and just hide the lists.
                // BUT, if I want to print a "Unpaid Report", I don't want Paid people in it.
            } else if (reportStatus === 'unpaid') {
                paidList = [];
                // summary total should probably still be the class total, but paid count 0?
                // No, a "Unpaid Report" should typically list who is unpaid.
            }

            // Calculate Breakdowns
            const byClass = {};
            const byLevel = {};

            // Initialize Groupings based on filtered students
            // We iterate enrichedStudents to build the structure.
            enrichedStudents.forEach(s => {
                // If reportStatus is 'paid', skip if not paid
                if (reportStatus === 'paid' && !paidStudentIds.has(String(s.id))) return;
                // If reportStatus is 'unpaid', skip if paid
                if (reportStatus === 'unpaid' && paidStudentIds.has(String(s.id))) return;

                const cName = s.class_name;
                const level = s.class_level;
                const isPaid = paidStudentIds.has(String(s.id));

                // Update Class Stats
                if (!byClass[cName]) byClass[cName] = { className: cName, total: 0, paid: 0, unpaid: 0, level };
                byClass[cName].total++;
                if (isPaid) byClass[cName].paid++; else byClass[cName].unpaid++;

                // Update Level Stats
                if (!byLevel[level]) byLevel[level] = { level, total: 0, paid: 0, unpaid: 0 };
                byLevel[level].total++;
                if (isPaid) byLevel[level].paid++; else byLevel[level].unpaid++;
            });

            // Convert and Sort
            const byClassArray = Object.values(byClass).map(c => ({
                ...c,
                rate: c.total > 0 ? ((c.paid / c.total) * 100).toFixed(0) : 0
            })).sort((a, b) => a.className.localeCompare(b.className));

            const byLevelArray = Object.values(byLevel).map(l => ({
                ...l,
                rate: l.total > 0 ? ((l.paid / l.total) * 100).toFixed(0) : 0
            }));

            // Final Summary Calculation (based on valid students after status filter)
            const validStudents = enrichedStudents.filter(s => {
                if (reportStatus === 'paid') return paidStudentIds.has(String(s.id));
                if (reportStatus === 'unpaid') return !paidStudentIds.has(String(s.id));
                return true;
            });

            const totalCollected = paidList.reduce((sum, p) => sum + Number(p.amount), 0);
            // If reportStatus is 'unpaid', totalCollected should technically be 0 or irrelevant? We'll leave it as is.

            const feeReportData = {
                summary: {
                    totalStudents: validStudents.length,
                    paidCount: (reportStatus === 'unpaid') ? 0 : (reportStatus === 'paid' ? validStudents.length : paidStudentIds.size), // Simplified logic
                    // Actually, let's just count from the breakdowns or lists
                    paidCount: reportStatus === 'unpaid' ? 0 : paidList.length,
                    unpaidCount: reportStatus === 'paid' ? 0 : unpaidList.length,
                    amountExpected: validStudents.length * 15, // Approximation or 0
                    totalCollected: reportStatus === 'unpaid' ? 0 : totalCollected,
                    // accurate collection rate
                    collectionRate: validStudents.length > 0 ?
                        ((reportStatus === 'unpaid' ? 0 : paidList.length) / validStudents.length * 100).toFixed(1) : 0
                },
                paid: paidList,
                unpaid: unpaidList,
                byClass: byClassArray,
                byLevel: byLevelArray
            };

            setReportData(feeReportData);
            setIsLoading(false);

        } catch (e) {
            console.error(e);
            setIsLoading(false);
            alert("Error generating fee report");
        }
    };


    const handleReportClick = async (type) => {
        if (type === 'Student Report Card') {
            setSelectedReport(type);
            setIsStudentSelectModalOpen(true);
            return;
        }

        setSelectedReport(type);
        setReportData([]);
        setIsExportModalOpen(true);

        // Special handling for Fee Collection to trigger the logic above
        if (type === 'Fee Collection') {
            await processFeeReport();
            return;
        }

        if (type === 'Expense Report') {
            await processExpenseReport();
            return;
        }

        if (type === 'Salary Report') {
            await processSalaryReport();
            return;
        }

        setIsLoading(true);
        try {
            let data = [];
            switch (type) {
                case 'Financial Statement':
                    const res = await fetch(`${API_URL}/finance`);
                    if (res.ok) data = await res.json();
                    break;
                case 'Attendance Report':
                    const resAtt = await fetch(`${API_URL}/attendance/summary`);
                    if (resAtt.ok) data = await resAtt.json();
                    break;
                case 'Student Grades':
                    const resExam = await fetch(`${API_URL}/exams`);
                    if (resExam.ok) data = await resExam.json();
                    break;
                case 'Staff Directory':
                    const resStaff = await fetch(`${API_URL}/teachers`);
                    if (resStaff.ok) data = await resStaff.json();
                    break;
                default:
                    data = [];
            }
            setReportData(data);
        } catch (e) {
            console.error(e);
            alert("Failed to load report data");
        } finally {
            setIsLoading(false);
        }
    };

    const generateStudentReport = async (student) => {
        setIsStudentSelectModalOpen(false);
        setIsExportModalOpen(true);
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/exams/student/${student.id}/report`);
            if (res.ok) {
                const data = await res.json();
                setReportData(data);
            } else {
                throw new Error("Failed to fetch student report");
            }
        } catch (e) {
            console.error(e);
            alert("Error generating report card.");
            setIsExportModalOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Re-run fee report when date changes AND modal is open on Fee Collection
    useEffect(() => {
        if (isExportModalOpen) {
            if (selectedReport === 'Fee Collection') processFeeReport();
            if (selectedReport === 'Expense Report') processExpenseReport();
            if (selectedReport === 'Salary Report') processSalaryReport();
        }
    }, [selectedMonth, selectedYear, filterMode, filterId, reportStatus, isExportModalOpen, selectedReport, startDate, endDate, expenseCategory, salaryRole, dateRangePreset]);


    // Filter students for search
    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Reports</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Generate and export insights across all departments.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard onClick={() => handleReportClick('Student Report Card')} title="Student Report Card" type="Academic" date="Individual Transcripts" icon={User} color="bg-indigo-600" />
                <ReportCard onClick={() => handleReportClick('Financial Statement')} title="Financial Statement" type="Finance" date="All Records" icon={TrendingUp} color="bg-green-500" />
                <ReportCard onClick={() => handleReportClick('Attendance Report')} title="Attendance Report" type="Academic" date="Summary" icon={Calendar} color="bg-blue-500" />
                <ReportCard onClick={() => handleReportClick('Expense Report')} title="Expense Report" type="Finance" date="Spending Analysis" icon={PieChart} color="bg-red-500" />
                <ReportCard onClick={() => handleReportClick('Salary Report')} title="Salary Report" type="HR & Finance" date="Payroll Summary" icon={DollarSign} color="bg-emerald-600" />
                <ReportCard onClick={() => handleReportClick('Student Grades')} title="Student Grades" type="Analysis" date="Exam List" icon={Award} color="bg-violet-500" />
                <ReportCard onClick={() => handleReportClick('Staff Directory')} title="Staff Directory" type="HR" date="Active Staff" icon={Users} color="bg-orange-500" />
                <ReportCard onClick={() => handleReportClick('Fee Collection')} title="Fee Collection" type="Finance" date="Fees Status & Unpaid" icon={FileText} color="bg-amber-500" />
                <ReportCard onClick={() => handleReportClick('Attendance Report')} title="Attendance Report" type="Academic" date="Summary" icon={Calendar} color="bg-blue-500" />
            </div>

            {/* Student Selection Modal */}
            <Modal isOpen={isStudentSelectModalOpen} onClose={() => setIsStudentSelectModalOpen(false)} title="Select Student" maxWidth="max-w-xl">
                <div className="p-4 space-y-4">
                    <input
                        type="text"
                        placeholder="Search student by name or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-600 outline-none"
                        autoFocus
                    />
                    <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                        {filteredStudents.length > 0 ? filteredStudents.map(student => (
                            <button
                                key={student.id}
                                onClick={() => generateStudentReport(student)}
                                className="w-full text-left p-3 hover:bg-gray-50 flex justify-between items-center group transition-colors"
                            >
                                <div>
                                    <p className="font-semibold text-gray-800">{student.name}</p>
                                    <p className="text-xs text-gray-500">ID: {student.id} • Class: {student.class_id}</p>
                                </div>
                                <div className="text-brand-600 opacity-0 group-hover:opacity-100 font-medium text-sm">Select</div>
                            </button>
                        )) : (
                            <div className="p-4 text-center text-gray-500">No students found.</div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Export/View Modal */}
            <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title={`Report: ${selectedReport}`} maxWidth="max-w-5xl">
                <div className="bg-gray-100 dark:bg-gray-900/50 p-6 rounded-xl">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            {/* Standard Date Filters - Use if NOT Fee Collection */}
                            {selectedReport !== 'Fee Collection' && selectedReport !== 'Salary Report' ? (
                                <>
                                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-2">Period:</span>
                                        <select
                                            value={dateRangePreset}
                                            onChange={(e) => setDateRangePreset(e.target.value)}
                                            className="px-2 py-1 text-sm bg-transparent outline-none cursor-pointer font-bold text-brand-600"
                                        >
                                            <option value="thisMonth">This Month</option>
                                            <option value="lastMonth">Last Month</option>
                                            <option value="halfYear">Last 6 Months</option>
                                            <option value="lastYear">Last Year</option>
                                            <option value="custom">Custom Range</option>
                                        </select>
                                    </div>

                                    {dateRangePreset === 'custom' && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">From:</span>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</span>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (selectedReport === 'Fee Collection' || selectedReport === 'Salary Report') ? (
                                /* Month/Year Filter for Fee & Salary */
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Date Controls */}
                                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-center px-2 border-r border-gray-200">
                                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                className="text-sm font-medium bg-transparent outline-none cursor-pointer"
                                            >
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            className="px-2 text-sm font-medium bg-transparent outline-none cursor-pointer"
                                        >
                                            <option value={2024}>2024</option>
                                            <option value={2025}>2025</option>
                                            <option value={2026}>2026</option>
                                        </select>
                                    </div>

                                    {/* Salary Specific Role Filter */}
                                    {selectedReport === 'Salary Report' && (
                                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                                            <select
                                                value={salaryRole}
                                                onChange={(e) => setSalaryRole(e.target.value)}
                                                className="px-2 py-1 text-sm bg-transparent outline-none cursor-pointer font-medium"
                                            >
                                                <option value="All">All Roles</option>
                                                <option value="Teacher">Teachers</option>
                                                <option value="Admin">Admins</option>
                                                <option value="Worker">Workers</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Scope & Status Controls for Fee Only */}
                                    {selectedReport === 'Fee Collection' && (
                                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                                            {/* Filter Mode */}
                                            <div className="border-r border-gray-200 pr-2">
                                                <select
                                                    value={filterMode}
                                                    onChange={(e) => {
                                                        setFilterMode(e.target.value);
                                                        setFilterId(''); // Reset selection
                                                    }}
                                                    className="px-2 py-1 text-sm bg-transparent outline-none cursor-pointer font-medium"
                                                >
                                                    <option value="all">All Grades</option>
                                                    <option value="class">Specific Class</option>
                                                    <option value="level">Specific Level</option>
                                                </select>
                                            </div>

                                            {/* Dynamic Second Dropdown */}
                                            {filterMode !== 'all' && (
                                                <div className="border-r border-gray-200 pr-2">
                                                    <select
                                                        value={filterId}
                                                        onChange={(e) => setFilterId(e.target.value)}
                                                        className="px-2 py-1 text-sm bg-transparent outline-none cursor-pointer min-w-[120px]"
                                                    >
                                                        <option value="">Select {filterMode === 'class' ? 'Class' : 'Level'}</option>
                                                        {filterMode === 'class' ? (
                                                            classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                                        ) : (
                                                            [...new Set(classes.map(c => c.level).filter(Boolean))].map(l => (
                                                                <option key={l} value={l}>{l}</option>
                                                            ))
                                                        )}
                                                    </select>
                                                </div>
                                            )}

                                            {/* Status Filter */}
                                            <div className="pl-2">
                                                <select
                                                    value={reportStatus}
                                                    onChange={(e) => setReportStatus(e.target.value)}
                                                    className={`px-2 py-1 text-sm outline-none cursor-pointer font-bold rounded-md ${reportStatus === 'paid' ? 'text-green-600 bg-green-50' : reportStatus === 'unpaid' ? 'text-red-600 bg-red-50' : 'text-gray-600'}`}
                                                >
                                                    <option value="all">Status: All</option>
                                                    <option value="paid">Show Paid Only</option>
                                                    <option value="unpaid">Show Unpaid Only</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Refresh/Apply Button */}
                                    <button
                                        onClick={selectedReport === 'Fee Collection' ? processFeeReport : processSalaryReport}
                                        className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors shadow-sm"
                                        title="Generate Report"
                                    >
                                        <Filter className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : null}

                            {selectedReport === 'Expense Report' && (
                                <div className="flex items-center gap-3">
                                    {/* Category Filter for Expenses */}
                                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <select
                                            value={expenseCategory}
                                            onChange={(e) => setExpenseCategory(e.target.value)}
                                            className="px-2 py-1 text-sm bg-transparent outline-none cursor-pointer font-medium"
                                        >
                                            <option value="All">All Categories</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Supplies">Supplies</option>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={processExpenseReport}
                                        className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors shadow-sm"
                                        title="Generate Report"
                                    >
                                        <Filter className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
                            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-colors">
                                <Printer className="w-4 h-4" /> Print / Save PDF
                            </button>
                        </div>
                    </div>

                    {/* Report Preview */}
                    <div className="shadow-2xl print-wrapper bg-white min-h-[500px] max-h-[70vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64 text-gray-400 flex-col gap-2">
                                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                <p>Generating Report...</p>
                            </div>
                        ) : (
                            <ReportPrintTemplate
                                type={selectedReport}
                                data={
                                    selectedReport === 'Fee Collection' ? reportData :
                                        (Array.isArray(reportData) && (startDate || endDate) ? reportData.filter(item => {
                                            if (!item.date) return true;
                                            const itemDate = new Date(item.date);
                                            const start = startDate ? new Date(startDate) : new Date('1900-01-01');
                                            const end = endDate ? new Date(endDate) : new Date('2100-01-01');
                                            end.setHours(23, 59, 59, 999);
                                            return itemDate >= start && itemDate <= end;
                                        }) : reportData)
                                }
                                schoolProfile={schoolProfile}
                                filters={selectedReport === 'Fee Collection' ? { month: selectedMonth, year: selectedYear } : null}
                            />
                        )}
                    </div>

                    {/* Print CSS */}
                    <style>{`
                        @media print {
                            @page { margin: 0; size: auto; }
                            body > * { display: none !important; }
                            body { background: white !important; }
                            #report-print {
                                display: flex !important;
                                position: absolute;
                                top: 0; left: 0;
                                width: 100%;
                                min-height: 100vh;
                                margin: 0; padding: 40px;
                                z-index: 9999;
                                background: white;
                            }
                            #report-print * { visibility: visible !important; }
                        }
                    `}</style>
                </div>
            </Modal>
        </div>
    );
};

export default Reports;

