import React, { useState, useEffect } from "react";
import { useSchool } from "../context/SchoolContext";
import { API_BASE_URL } from "../config";
import { DollarSign, Download, Filter, TrendingUp, CreditCard, Search, PieChart, Users, ArrowUpRight, ArrowDownRight, Briefcase, Eye, Printer, X, FileText, School, Share2, ExternalLink, ArrowDownLeft, ArrowRightLeft, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import Modal from "../components/Modal";
import PaymentModal from "../components/PaymentModal";
import ActionMenu from "../components/ActionMenu";

// Mock data removed in favor of API

const StatsCard = ({ title, value, icon: Icon, color, trend, trendUp }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            )}
        </div>
    </div>
);

// Invoice Template Component
const InvoiceTemplate = ({ invoice, schoolProfile }) => {
    const { formatCurrency } = useSchool();
    if (!invoice) return null;
    return (
        <div className="p-8 bg-white text-gray-900 border border-gray-200 shadow-sm rounded-xl max-w-2xl mx-auto" id="invoice-print">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-brand-700">{schoolProfile?.school_name || "Hayan School"}</h1>
                    <p className="text-sm text-gray-500 mt-1">{schoolProfile?.address || "123 Education Street, Mogadishu"}</p>
                    <p className="text-sm text-gray-500">{schoolProfile?.email || "contact@hayan.edu"} | {schoolProfile?.phone || "+252 61 555 0000"}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold text-gray-200">INVOICE</h2>
                    <p className="font-semibold text-gray-700 mt-1">#{invoice.id}</p>
                    <p className="text-sm text-gray-500">Date: {invoice.date}</p>
                </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Bill To</h3>
                <h2 className="text-lg font-bold">{invoice.student}</h2>
                <p className="text-gray-600">
                    {invoice.student_class_name || invoice.student_grade_level || 'Student'}
                </p>
            </div>

            {/* Line Items */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-3 font-bold text-gray-600">Description</th>
                        <th className="text-right py-3 font-bold text-gray-600">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="py-4 border-b border-gray-50">{invoice.type}</td>
                        <td className="py-4 border-b border-gray-50 text-right font-semibold">{formatCurrency(invoice.amount)}</td>
                    </tr>
                    <tr>
                        <td className="py-4 text-gray-500 italic">Fee Surcharge (if applicable)</td>
                        <td className="py-4 text-right text-gray-500">-</td>
                    </tr>
                </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-end mb-8">
                <div className="w-1/2">
                    <div className="flex justify-between py-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-100">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-lg font-bold text-brand-600">{formatCurrency(invoice.amount)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-400 pt-8 border-t">
                <p>Thank you for your timely payment.</p>
            </div>
        </div>
    );
};

// Report Template Component
const FinanceReportTemplate = ({ data, activeTab, filters, schoolProfile }) => {
    const { formatCurrency } = useSchool();
    const totalAmount = data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const paidCount = data.filter(i => i.status === 'Paid').length;
    const pendingCount = data.filter(i => i.status === 'Pending').length;

    return (
        <div className="bg-white text-gray-900 w-full max-w-4xl mx-auto min-h-[29.7cm] flex flex-col shadow-none" id="report-print">
            {/* Header Section */}
            <div className="bg-brand-900 text-white p-10 print:bg-brand-900 print:text-white">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 overflow-hidden">
                            {schoolProfile?.logo_url ? (
                                <img src={`${API_BASE_URL}${schoolProfile.logo_url}`} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <School className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{schoolProfile?.school_name || "Hayan School System"}</h1>
                            <p className="text-brand-100 opacity-90">{schoolProfile?.motto || "Excellence in Education Management"}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold uppercase tracking-widest opacity-90">Financial Report</h2>
                        <p className="text-brand-100 font-mono mt-1 opacity-75">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-10 flex-1">
                {/* Meta & Summary */}
                <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Report Context</p>
                        <h3 className="text-xl font-bold text-gray-800 capitalize">{activeTab} Record Analysis</h3>
                        <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Applied Filters</p>
                        <div className="flex gap-2 justify-end">
                            {filters.class !== 'All' && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">Class: {filters.class}</span>}
                            {filters.status !== 'All' && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">Status: {filters.status}</span>}
                            {(filters.class === 'All' || !filters.class) && (filters.status === 'All' || !filters.status) && <span className="text-sm text-gray-500 italic">No specific filters applied</span>}
                        </div>
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Total Records</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{data.length}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <p className="text-xs text-green-700 uppercase font-bold tracking-wide">Fully Paid</p>
                        <p className="text-2xl font-bold text-green-800 mt-1">{paidCount}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-xs text-amber-700 uppercase font-bold tracking-wide">Pending</p>
                        <p className="text-2xl font-bold text-amber-800 mt-1">{pendingCount}</p>
                    </div>
                    <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                        <p className="text-xs text-brand-700 uppercase font-bold tracking-wide">Total Volume</p>
                        <p className="text-2xl font-bold text-brand-800 mt-1">{formatCurrency(totalAmount)}</p>
                    </div>
                </div>

                {/* Data Table */}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-brand-900">
                            <th className="py-3 px-2 font-bold text-xs uppercase tracking-wider text-gray-600">ID</th>
                            <th className="py-3 px-2 font-bold text-xs uppercase tracking-wider text-gray-600">Title / Student</th>
                            <th className="py-3 px-2 font-bold text-xs uppercase tracking-wider text-gray-600">Category</th>
                            <th className="py-3 px-2 font-bold text-xs uppercase tracking-wider text-gray-600">Date</th>
                            <th className="py-3 px-2 font-bold text-xs uppercase tracking-wider text-gray-600 text-center">Status</th>
                            <th className="py-3 px-2 font-bold text-xs uppercase tracking-wider text-gray-600 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {data.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 break-inside-avoid">
                                <td className="py-3 px-2 font-mono text-gray-500">#{item.id}</td>
                                <td className="py-3 px-2 font-semibold text-gray-800">{item.title}</td>
                                <td className="py-3 px-2 text-gray-600 capitalize">{item.type || item.category}</td>
                                <td className="py-3 px-2 text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="py-3 px-2 text-center">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${item.status === 'Paid' ? 'bg-green-100 text-green-700' : item.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-right font-mono font-bold text-gray-800">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Section */}
            <div className="p-10 mt-auto border-t border-gray-100 bg-gray-50 print:bg-gray-50">
                <div className="flex justify-between items-center text-xs text-gray-400">
                    <p>Â© {new Date().getFullYear()} Hayan School System. Confidential Report.</p>
                    <div className="flex gap-8">
                        <div className="text-center">
                            <div className="w-32 border-b border-gray-300 mb-1"></div>
                            <p>Authorized Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="w-24 border-b border-gray-300 mb-1"></div>
                            <p>Date</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Finance = () => {
    const { formatCurrency, currencySymbol } = useSchool();
    const [activeTab, setActiveTab] = useState("income");
    const [financeData, setFinanceData] = useState([]);
    const [schoolProfile, setSchoolProfile] = useState(null);

    // Filtering State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterClass, setFilterClass] = useState("All");

    // Date Filtering
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Data for lookups
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false); // For Expenses/Salaries
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // For Income
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentPrefill, setPaymentPrefill] = useState(null);

    // Dynamic Form Data (For Expenses/Salaries)
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        category: 'income', type: '', amount: '', title: '', status: 'Pending', student: '', staff: '', customType: '', role: '', date: '',
        // Bank specific
        account_name: '', account_number: '', bank_name: '', currency: 'USD',
        payment_method: 'Cash' // Default
    });



    const [bankAccounts, setBankAccounts] = useState([]);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionData, setTransactionData] = useState({
        type: 'Deposit', accountId: null, amount: '', toAccountId: '', description: ''
    });


    const API_URL = `${API_BASE_URL}/api/finance`;

    useEffect(() => {
        fetchFinance();
        fetchStudents();
        fetchClasses();
        fetchSchoolProfile();
        if (activeTab === 'salaries') fetchTeachers();
        fetchBankAccounts();
    }, [activeTab]);

    const fetchBankAccounts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/banks`);
            if (res.ok) setBankAccounts(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchSchoolProfile = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/school-profile`);
            if (res.ok) setSchoolProfile(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchFinance = async () => {
        try {
            const res = await fetch(`${API_URL}?category=${activeTab}`);
            if (res.ok) setFinanceData(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/students`);
            if (res.ok) setStudents(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchClasses = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/classes`);
            if (res.ok) setClasses(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchTeachers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/teachers`);
            if (res.ok) setTeachers(await res.json());
        } catch (e) { console.error(e); }
    };

    const getPayrollStatus = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return teachers.map(teacher => {
            // Safe check for financeData being an array
            if (!Array.isArray(financeData)) return { ...teacher, salaryRecords: [], totalPaid: 0, remaining: teacher.salary || 0, paymentStatus: 'Unpaid' };

            const salaryRecords = financeData.filter(record => {
                if (!record.date) return false;
                const recordDate = new Date(record.date);
                return record.category === 'salaries' &&
                    record.title === teacher.name &&
                    recordDate.getMonth() === currentMonth &&
                    recordDate.getFullYear() === currentYear;
            });

            const totalPaid = salaryRecords.reduce((sum, record) => sum + parseFloat(record.amount || 0), 0);
            const teacherSalary = parseFloat(teacher.salary || 0);

            let status = 'Unpaid';
            if (totalPaid === 0) status = 'Unpaid';
            else if (totalPaid >= teacherSalary) status = 'Paid';
            else status = 'Partially Paid';

            return {
                ...teacher,
                salaryRecords, // Array of records
                totalPaid,
                remaining: Math.max(0, teacherSalary - totalPaid),
                paymentStatus: status
            };
        });
    };
    const getFilteredData = () => {
        if (!Array.isArray(financeData)) return [];

        return financeData.filter(item => {
            // 1. Search Logic
            const matchesSearch = Object.values(item).some(val =>
                String(val || "").toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (!matchesSearch) return false;

            // 2. Status Filter
            if (filterStatus !== "All") {
                // Map UI status "Unpaid" to data status "Pending" or "Overdue" if needed
                if (filterStatus === "Paid" && item.status !== "Paid") return false;
                if (filterStatus === "Unpaid" && item.status === "Paid") return false;
            }

            // 3. Class Filter
            if (filterClass !== "All" && activeTab === 'income') {
                // Find student
                const student = students.find(s => s.name === item.title);
                if (!student || student.grade !== filterClass) return false;
            }

            // 4. Date Range Filter
            if (startDate || endDate) {
                if (!item.date) return false;
                const itemDate = item.date.split('T')[0]; // Consistent with render logic

                if (startDate && itemDate < startDate) return false;
                if (endDate && itemDate > endDate) return false;
            }

            return true;
        });
    };

    const handleAddEntry = async (e) => {
        e.preventDefault();

        // Prepare payload correctly based on tab
        const payload = {
            category: activeTab,
            amount: Number(formData.amount),
            status: formData.status || (activeTab === 'salaries' ? 'Paid' : 'Pending'),
            date: formData.date || new Date().toISOString().split('T')[0]
        };

        if (activeTab === 'expenses') {
            payload.title = formData.title;
            // Use customType if available (from form), fallback to category input if legacy, but ideally use separate field
            payload.type = formData.customType || formData.category;
        } else if (activeTab === 'salaries') {
            payload.title = formData.staff;
            payload.type = formData.role;
        }

        if (activeTab === 'banks') {
            payload.account_name = formData.account_name;
            payload.account_number = formData.account_number;
            payload.bank_name = formData.bank_name;
            payload.currency = formData.currency;
            payload.balance = Number(formData.amount);
            delete payload.category; // Banks table doesn't have category
            delete payload.date; // or might handle date differently if transaction
        } else {
            // Handle Payment Method & Account Linking
            const selectedBank = bankAccounts.find(b => String(b.id) === String(formData.payment_method));
            if (selectedBank) {
                payload.payment_method = selectedBank.bank_name; // Store name for display
                payload.account_id = selectedBank.id; // Store ID for logic
            } else {
                payload.payment_method = formData.payment_method;
                payload.account_id = null;
            }
        }

        try {
            let res;
            if (editingId) {
                const url = activeTab === 'banks' ? `${API_BASE_URL}/api/banks/${editingId}` : `${API_URL}/${editingId}`;
                res = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                const url = activeTab === 'banks' ? `${API_BASE_URL}/api/banks` : API_URL;
                res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                // alert(`${activeTab === 'expenses' ? 'Expense' : 'Entry'} saved successfully!`);
                if (activeTab === 'banks') fetchBankAccounts();
                else fetchFinance();
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ category: 'income', type: '', amount: '', title: '', status: 'Pending', student: '', staff: '', customType: '', role: '', date: '', account_name: '', account_number: '', bank_name: '', currency: 'USD', payment_method: 'Cash' });
            } else {
                const errorText = await res.text();
                alert(`Failed to save: ${errorText}`);
            }
        } catch (e) {
            console.error(e);
            alert(`Error saving record: ${e.message}`);
        }
    };


    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/banks/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData)
            });

            if (res.ok) {
                alert("Transaction successful!");
                setIsTransactionModalOpen(false);
                fetchBankAccounts();
                fetchFinance(); // Refresh history
            } else {
                const err = await res.json();
                alert(`Transaction failed: ${err.error}`);
            }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            const url = activeTab === 'banks' ? `${API_BASE_URL}/api/banks/${id}` : `${API_URL}/${id}`;
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                if (activeTab === 'banks') fetchBankAccounts();
                else fetchFinance();
            }
        } catch (e) { console.error(e); }
    };



    const handleEdit = (item) => {
        setEditingId(item.id);
        if (activeTab === 'banks') {
            setFormData({
                account_name: item.account_name,
                bank_name: item.bank_name,
                account_number: item.account_number,
                amount: item.balance,
                currency: item.currency,
                status: item.status,
                date: new Date().toISOString().split('T')[0]
            });
        } else {
            const isSalary = item.category === 'salaries';
            // Try to resolve bank name to ID for the select input
            const matchedBank = bankAccounts.find(b => b.bank_name === item.payment_method);
            const paymentMethodValue = matchedBank ? matchedBank.id : (item.payment_method || 'Cash');

            setFormData({
                category: item.category,
                amount: item.amount,
                status: item.status,
                date: item.date ? item.date.split('T')[0] : '',
                title: item.title, // For Expense Title
                staff: isSalary ? item.title : '', // For Salary Staff
                type: item.type || '', // Expense Category
                role: isSalary ? item.type : '', // Salary Role
                payment_method: paymentMethodValue
            });
        }
        setIsModalOpen(true);
    };

    const handleViewInvoice = (item) => {
        if (activeTab !== 'income') return;
        setSelectedInvoice({
            id: `INV-${item.id}`,
            student: item.title,
            amount: item.amount,
            date: item.date,
            status: item.status,
            type: item.type
        });
        setIsInvoiceModalOpen(true);
    };

    const openActionModal = () => {
        if (activeTab === 'income') {
            setPaymentPrefill(null); // Clear any prefill data
            setIsPaymentModalOpen(true);
        } else {
            setEditingId(null);
            setFormData({
                category: activeTab, type: '', amount: '', title: '', status: activeTab === 'salaries' ? 'Paid' : 'Pending', student: '', staff: '', customType: '', role: '', date: new Date().toISOString().split('T')[0], payment_method: 'Cash'
            });
            setIsModalOpen(true);
        }
    };

    const getStudentFeeStatus = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return students.filter(s => s.status === 'Active').map(student => {
            // Safe check for financeData being an array
            if (!Array.isArray(financeData)) return { ...student, totalPaid: 0, paymentStatus: 'Unpaid' };

            const feeRecords = financeData.filter(record => {
                if (!record.date) return false;
                const recordDate = new Date(record.date);
                return record.category === 'income' &&
                    // Check by ID if reference_id exists, otherwise fallback to name matching
                    ((record.reference_id && String(record.reference_id) === String(student.id)) ||
                        (!record.reference_id && record.title === student.name)) &&
                    recordDate.getMonth() === currentMonth &&
                    recordDate.getFullYear() === currentYear;
            });

            const totalPaid = feeRecords.reduce((sum, record) => sum + parseFloat(record.amount || 0), 0);

            // Determine status - simplistic logic: if any payment > 0, assume paid for now or partial
            // In a real system, you'd compare against a specific fee structure (e.g. $50/month)
            // For now, let's assume if they paid anything this month, they are "Paid", else "Unpaid"
            // Or if they are free (Scholarship), mark as Paid/Free

            let status = 'Unpaid';
            if (student.is_free) status = 'Scholarship';
            else if (totalPaid > 0) status = 'Paid';

            return {
                ...student,
                totalPaid,
                paymentStatus: status
            };
        });
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance & Fees</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage income, expenses, and staff salaries.</p>
                    </div>
                    <button
                        onClick={openActionModal}
                        className={`flex items-center gap-2 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg ${activeTab === 'income'
                            ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30'
                            : activeTab === 'expenses'
                                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                                : activeTab === 'banks'
                                    ? 'bg-gradient-to-tr from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-indigo-500/30'
                                    : 'bg-gradient-to-tr from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/30'
                            }`}
                    >
                        <DollarSign className="w-5 h-5" />
                        {activeTab === 'income' ? 'Record Payment' : activeTab === 'expenses' ? 'Add Expense' : activeTab === 'banks' ? 'Add Account' : 'Process Salary'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl w-full sm:w-fit border border-gray-100 dark:border-gray-700 shadow-sm">
                    {['income', 'expenses', 'salaries', 'banks'].map((tab) => {
                        const isActive = activeTab === tab;
                        const getTabStyle = () => {
                            if (!isActive) return "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 border-transparent";
                            switch (tab) {
                                case 'income': return "bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 border-transparent transform scale-105";
                                case 'expenses': return "bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 border-transparent transform scale-105";
                                case 'salaries': return "bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 border-transparent transform scale-105";
                                case 'banks': return "bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 border-transparent transform scale-105";
                                default: return "bg-gray-900 text-white";
                            }
                        };
                        return (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setFilterClass("All"); setFilterStatus("All"); }}
                                className={`px-6 py-2.5 rounded-xl text-base font-bold transition-all duration-300 capitalize border ${getTabStyle()}`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {/* Stats Cards (Dynamic) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activeTab === 'income' && (
                        <>
                            <StatsCard
                                title="Total Collected"
                                value={formatCurrency(financeData.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + Number(curr.amount), 0))}
                                icon={TrendingUp}
                                color="bg-green-500"
                                trend="Based on current records"
                                trendUp={true}
                            />
                            <StatsCard
                                title="Pending Fees"
                                value={formatCurrency(financeData.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + Number(curr.amount), 0))}
                                icon={PieChart}
                                color="bg-amber-500"
                            />
                            <StatsCard
                                title="Monthly Collection Rate"
                                value={`${Math.round((getStudentFeeStatus().filter(s => s.paymentStatus === 'Paid' || s.paymentStatus === 'Scholarship').length / (getStudentFeeStatus().length || 1)) * 100)}%`}
                                icon={CreditCard}
                                color="bg-blue-500"
                            />
                        </>
                    )}
                    {activeTab === 'expenses' && (
                        <>
                            <StatsCard
                                title="Total Expenses"
                                value={formatCurrency(financeData.reduce((acc, curr) => acc + Number(curr.amount), 0))}
                                icon={ArrowDownRight}
                                color="bg-red-500"
                            />
                            <StatsCard
                                title="Approved"
                                value={formatCurrency(financeData.filter(i => i.status === 'Approved' || i.status === 'Paid').reduce((acc, curr) => acc + Number(curr.amount), 0))}
                                icon={Briefcase}
                                color="bg-blue-500"
                            />
                            <StatsCard
                                title="Pending Approvals"
                                value={formatCurrency(financeData.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + Number(curr.amount), 0))}
                                icon={PieChart}
                                color="bg-amber-500"
                            />
                        </>
                    )}
                    {activeTab === 'salaries' && (
                        <>
                            <StatsCard
                                title="Total Salaries Paid"
                                value={formatCurrency(financeData.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + Number(curr.amount), 0))}
                                icon={Users}
                                color="bg-violet-500"
                            />
                            <StatsCard
                                title="Pending Payments"
                                value={formatCurrency(financeData.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + Number(curr.amount), 0))}
                                icon={PieChart}
                                color="bg-amber-500"
                            />
                            <StatsCard
                                title="Staff Count"
                                value={new Set(financeData.map(i => i.title)).size.toString()}
                                icon={Briefcase}
                                color="bg-indigo-500"
                            />
                        </>
                    )}
                    {activeTab === 'banks' && (
                        <>
                            <StatsCard
                                title="Total Liquidity"
                                value={formatCurrency(bankAccounts.reduce((acc, curr) => acc + Number(curr.balance), 0))}
                                icon={DollarSign}
                                color="bg-emerald-600"
                            />
                            <StatsCard
                                title="Active Accounts"
                                value={bankAccounts.filter(a => a.status === 'Active').length}
                                icon={CreditCard}
                                color="bg-blue-600"
                            />
                            <StatsCard
                                title="Total Accounts"
                                value={bankAccounts.length}
                                icon={Briefcase}
                                color="bg-gray-600"
                            />
                        </>
                    )}
                </div>

                {/* Content Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">

                        {/* Search Bar */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                            />
                        </div>

                        {/* Filter Dropdowns - Only show strict filters for Income tab */}
                        {activeTab === 'income' && (
                            <div className="flex flex-1 w-full md:w-auto gap-3 overflow-x-auto pb-2 md:pb-0">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium outline-none focus:border-brand-500 whitespace-nowrap"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Unpaid">Unpaid/Pending</option>
                                </select>

                                <select
                                    value={filterClass}
                                    onChange={(e) => setFilterClass(e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium outline-none focus:border-brand-500 whitespace-nowrap"
                                >
                                    <option value="All">All Classes</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.name}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Date Filters */}
                        <div className="flex gap-2 items-center">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 outline-none focus:border-brand-500"
                                placeholder="Start Date"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 outline-none focus:border-brand-500"
                                placeholder="End Date"
                            />
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(""); setEndDate(""); }}
                                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                    title="Clear Dates"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                        >
                            <FileText className="w-4 h-4" />
                            Export Report
                        </button>
                    </div>

                    {/* Monthly Fee Status View for INCOME Tab */}
                    {activeTab === 'income' && (
                        <div className="mb-0 bg-emerald-50 dark:bg-emerald-900/10 p-4 border-b border-emerald-100 dark:border-emerald-900/30">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Monthly Fee Status ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-700">
                                            <th className="px-4 py-3 text-sm font-semibold">Student</th>
                                            <th className="px-4 py-3 text-sm font-semibold">Class</th>
                                            <th className="px-4 py-3 text-sm font-semibold">Fee Status</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700 max-h-64 overflow-y-auto block w-full">
                                        {/* Note: Block display on tbody for scrolling might break grid alignment in basic tables, 
                                        keeping standard layout but limiting rows if too many via pagination later. 
                                        For now, assume manageable list or basic scroll. 
                                        To properly scroll body only, standard CSS table layout needed.
                                        Reverting to standard table and relying on container overflow.
                                    */}
                                    </tbody>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {getStudentFeeStatus()
                                            .filter(s => {
                                                // Apply local filters if needed, e.g., class filter
                                                if (filterClass !== 'All' && s.grade !== filterClass) return false;
                                                if (filterStatus === 'Paid' && s.paymentStatus !== 'Paid' && s.paymentStatus !== 'Scholarship') return false;
                                                if (filterStatus === 'Unpaid' && (s.paymentStatus === 'Paid' || s.paymentStatus === 'Scholarship')) return false;
                                                // Search name
                                                if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                                                return true;
                                            })
                                            .map(student => (
                                                <tr key={student.id}>
                                                    <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{student.grade}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`w-fit px-2 py-1 rounded-full text-xs font-bold 
                                                    ${student.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                                                student.paymentStatus === 'Scholarship' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-red-100 text-red-700'}`}>
                                                            {student.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {student.paymentStatus === 'Unpaid' && (
                                                            <button
                                                                onClick={() => {
                                                                    setPaymentPrefill({ student: student.name });
                                                                    setIsPaymentModalOpen(true);
                                                                }}
                                                                className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                                            >
                                                                Pay Now
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Payroll View Toggle or Split View for Salaries */}
                    {
                        activeTab === 'salaries' && (
                            <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Monthly Payroll Status ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                                <th className="px-4 py-3 text-sm font-semibold">Teacher</th>
                                                <th className="px-4 py-3 text-sm font-semibold">Role</th>
                                                <th className="px-4 py-3 text-sm font-semibold">Default Salary</th>
                                                <th className="px-4 py-3 text-sm font-semibold">Paid Status</th>
                                                <th className="px-4 py-3 text-sm font-semibold text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                            {getPayrollStatus().map(teacher => (
                                                <tr key={teacher.id}>
                                                    <td className="px-4 py-3 text-sm font-medium">{teacher.name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{teacher.subject}</td>
                                                    <td className="px-4 py-3 text-sm font-mono">{formatCurrency(teacher.salary)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`w-fit px-2 py-1 rounded-full text-xs font-bold 
                                                        ${teacher.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                                                    teacher.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-red-100 text-red-700'}`}>
                                                                {teacher.paymentStatus}
                                                            </span>
                                                            {teacher.totalPaid > 0 && (
                                                                <span className="text-xs text-gray-500 font-medium">
                                                                    Paid: {formatCurrency(teacher.totalPaid)} / {formatCurrency(teacher.salary)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex flex-col items-end gap-2">
                                                            {teacher.remaining > 0 && (
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingId(null);
                                                                        setFormData({
                                                                            category: 'salaries',
                                                                            staff: teacher.name,
                                                                            amount: teacher.remaining, // Suggest remaining amount
                                                                            role: teacher.subject + ' Teacher',
                                                                            status: 'Paid',
                                                                            date: new Date().toISOString().split('T')[0]
                                                                        });
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                                                >
                                                                    Pay Remaining ({formatCurrency(teacher.remaining)})
                                                                </button>
                                                            )}

                                                            {teacher.salaryRecords?.length > 0 && (
                                                                <div className="flex gap-2 flex-wrap justify-end">
                                                                    {teacher.salaryRecords?.map((record, index) => (
                                                                        <div key={record.id} className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                                                                            <span className="text-[10px] text-gray-500 font-mono">{formatCurrency(record.amount)}</span>
                                                                            <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                                                            <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }

                    {/* Banks List View */}
                    {
                        activeTab === 'banks' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bankAccounts.map((account) => (
                                    <div key={account.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-blue-500/10 transition-colors"></div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <School className="w-6 h-6" />
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${account.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {account.status}
                                                    </div>
                                                    <ActionMenu
                                                        onEdit={() => handleEdit(account)}
                                                        onDelete={() => handleDelete(account.id)}
                                                        additionalActions={[
                                                            { label: 'Deposit', onClick: () => { setTransactionData({ type: 'Deposit', accountId: account.id, amount: '', toAccountId: '', description: '' }); setIsTransactionModalOpen(true); }, icon: ArrowDownCircle, className: 'text-green-600 dark:text-green-400', iconClassName: 'text-green-500' },
                                                            { label: 'Withdraw', onClick: () => { setTransactionData({ type: 'Withdrawal', accountId: account.id, amount: '', toAccountId: '', description: '' }); setIsTransactionModalOpen(true); }, icon: ArrowUpCircle, className: 'text-red-600 dark:text-red-400', iconClassName: 'text-red-500' },
                                                            { label: 'Transfer', onClick: () => { setTransactionData({ type: 'Transfer', accountId: account.id, amount: '', toAccountId: '', description: '' }); setIsTransactionModalOpen(true); }, icon: ArrowRightLeft, className: 'text-blue-600 dark:text-blue-400', iconClassName: 'text-blue-500' }
                                                        ]}
                                                    />
                                                </div>
                                            </div>
                                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{account.bank_name}</h3>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white truncate mb-4">{account.account_name}</p>

                                            <div className="mb-4">
                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1">Account Number</p>
                                                <p className="font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded w-fit">{account.account_number}</p>
                                            </div>

                                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1">Balance</p>
                                                    <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{formatCurrency(account.balance)}</p>
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                ))}
                                {bankAccounts.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-400">
                                        <School className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No bank accounts added yet.</p>
                                    </div>
                                )}
                            </div>
                        )
                    }
                    {/* History Log */}
                    <div className="overflow-x-auto">
                        <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 px-4 pt-4 mb-2">History Log</h3>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {getFilteredData().length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    getFilteredData().map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                                {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title || item.account_name}</p>
                                                <p className="text-xs text-gray-400">{item.type || item.bank_name || item.category}</p>
                                                {item.payment_method && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded ml-1">{item.payment_method}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.status === 'Paid' || item.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className={`text-sm font-bold font-mono ${item.category === 'income' || activeTab === 'banks' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                                                    {activeTab === 'expenses' || activeTab === 'salaries' ? '-' : '+'}
                                                    {formatCurrency(item.amount || item.balance)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {activeTab === 'income' && (
                                                        <button onClick={() => handleViewInvoice(item)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Modal */}


                {/* Add/Edit Modal */}
                < Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Add'} ${activeTab === 'banks' ? 'Account' : activeTab === 'salaries' ? 'Salary Payment' : activeTab === 'expenses' ? 'Expense' : 'Entry'}`}>
                    <form onSubmit={handleAddEntry} className="space-y-4">
                        {/* Common Fields */}
                        {activeTab !== 'banks' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                                    <input
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-16 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Expense Fields */}
                        {activeTab === 'expenses' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title / Description</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="e.g. Office Supplies"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formData.customType}
                                        onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="e.g. Utilities, Maintenance"
                                    />
                                </div>
                            </>
                        )}

                        {/* Salary Fields */}
                        {activeTab === 'salaries' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Staff Member</label>
                                    <select
                                        value={formData.staff}
                                        onChange={(e) => {
                                            const selectedName = e.target.value;
                                            const staffMember = teachers.find(t => t.name === selectedName);
                                            setFormData({
                                                ...formData,
                                                staff: selectedName,
                                                role: staffMember ? (staffMember.role || staffMember.subject) : '',
                                                amount: staffMember ? staffMember.salary : formData.amount
                                            });
                                        }}
                                        className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">Select Staff</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.name}>{t.name} ({t.subject})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role / Position</label>
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="e.g. Math Teacher"
                                    />
                                </div>
                            </>
                        )}

                        {/* Bank Fields */}
                        {activeTab === 'banks' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.account_name}
                                        onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="e.g. Main Operations"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.bank_name}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="e.g. Chase Bank"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.account_number}
                                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                                        placeholder="**************"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Balance</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="BIRR">BIRR</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                {activeTab === 'banks' && <option value="Active">Active</option>}
                                {activeTab === 'banks' && <option value="Inactive">Inactive</option>}
                                {activeTab !== 'banks' && <option value="Unpaid">Unpaid</option>}
                            </select>
                        </div>

                        {activeTab !== 'banks' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Mode</label>
                                <select
                                    value={formData.payment_method}
                                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="Cash">Cash</option>
                                    {bankAccounts.map(bank => (
                                        <option key={bank.id} value={bank.id}>
                                            {bank.bank_name} {bank.account_name ? `(${bank.account_name})` : ''}
                                        </option>
                                    ))}
                                    <option value="Check">Check</option>
                                </select>
                            </div>
                        )}

                        <div className="pt-4 flex gap-3 justify-end">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-500/20">Submit</button>
                        </div>
                    </form>
                </Modal >

                {/* Modals */}
                < PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={() => { fetchFinance(); }}
                    prefillData={paymentPrefill}
                />
                {/* View Invoice Modal */}
                < Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Invoice Details" maxWidth="max-w-3xl" >
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                        <InvoiceTemplate invoice={selectedInvoice} />
                        <div className="flex justify-end mt-6 gap-3">
                            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity">
                                <Printer className="w-5 h-5" />
                                Print Invoice
                            </button>
                        </div>
                    </div>
                </Modal >

                {/* Report Export Modal using window.print */}
                < Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Export Finance Report" maxWidth="max-w-5xl" >
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-6 rounded-xl">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 no-print gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Previewing report for <b>{getFilteredData().length}</b> records.</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                                    Cancel
                                </button>

                                {/* Open in New Tab */}
                                <button
                                    onClick={() => {
                                        const reportElement = document.getElementById('report-print');
                                        if (reportElement) {
                                            const newWindow = window.open('', '_blank');
                                            newWindow.document.write(`
                                            <!DOCTYPE html>
                                            <html>
                                                <head>
                                                    <title>Hayan School Report - Preview</title>
                                                    <meta charset="UTF-8">
                                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                    <script src="https://cdn.tailwindcss.com"></script>
                                                    <style>
                                                        @media print { .no-print { display: none !important; } }
                                                        body { background-color: #52525b; margin: 0; padding: 40px; min-height: 100vh; }
                                                        .print-container { 
                                                            background: white; 
                                                            max-width: 21cm; 
                                                            min-height: 29.7cm;
                                                            margin: 0 auto; 
                                                            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); 
                                                            overflow: hidden; /* Ensure no overflow */
                                                        }
                                                    </style>
                                                </head>
                                                <body>
                                                    <div class="print-container">
                                                        ${reportElement.innerHTML}
                                                    </div>
                                                    <div class="fixed bottom-6 right-6 no-print flex gap-2">
                                                        <button onclick="window.close()" class="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium shadow-lg hover:bg-gray-900 transition-colors">Close Viewer</button>
                                                        <button onclick="window.print()" class="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium shadow-lg hover:bg-brand-700 transition-colors">Print PDF</button>
                                                    </div>
                                                </body>
                                            </html>
                                        `);
                                            newWindow.document.close();
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Open Preview
                                </button>

                                {/* Share */}
                                <button
                                    onClick={async () => {
                                        if (navigator.share) {
                                            try {
                                                await navigator.share({
                                                    title: 'Hayan School Finance Report',
                                                    text: `Financial Report Summary - ${activeTab}\nRecords: ${getFilteredData().length}\nDate: ${new Date().toLocaleDateString()}`,
                                                    url: window.location.href
                                                });
                                            } catch (err) { console.log('Error sharing:', err); }
                                        } else {
                                            navigator.clipboard.writeText(`Hayan School Financial Report\nCategory: ${activeTab}\nRecords: ${getFilteredData().length}\nDate: ${new Date().toLocaleDateString()}`);
                                            alert('Report summary copied to clipboard!');
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>

                                {/* Print */}
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white rounded-lg font-medium shadow-lg hover:bg-brand-700 transition-colors"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print / Save PDF
                                </button>
                            </div>
                        </div>

                        {/* Printable Area Wrapper */}
                        <div className="shadow-2xl print-wrapper">
                            <FinanceReportTemplate
                                data={getFilteredData()}
                                activeTab={activeTab}
                                filters={{ status: filterStatus, class: filterClass }}
                                schoolProfile={schoolProfile}
                            />
                        </div>

                        {/* CSS for printing - Hides everything but the report */}
                        <style>{`
                        @media print {
                            @page { margin: 0; size: auto; }
                            
                            /* Hide everything heavily */
                            body {
                                visibility: hidden;
                                background: white !important;
                            }
                            
                            /* But make report and children visible */
                            #report-print, #report-print * {
                                visibility: visible;
                            }
                            
                            /* Position report over everything */
                            #report-print {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                min-height: 100vh;
                                margin: 0;
                                padding: 20px;
                                background: white;
                                z-index: 9999;
                            }
                        }
                    `}</style>
                    </div>
                </Modal >
                {/* Bank Transaction Modal */}
                <Modal
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    title={
                        <div className="flex items-center gap-3 text-indigo-900 dark:text-indigo-100">
                            <div className={`p-2 rounded-lg ${transactionData.type === 'Type' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                {transactionData.type === 'Withdraw' ? <ArrowDownCircle className="w-6 h-6" /> : transactionData.type === 'Deposit' ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowRightLeft className="w-6 h-6" />}
                            </div>
                            <span>{transactionData.type} Transaction</span>
                        </div>
                    }
                >
                    <form onSubmit={handleTransactionSubmit} className="space-y-6 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Amount</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-indigo-500 transition-colors">{currencySymbol}</span>
                                <input
                                    type="number"
                                    required
                                    value={transactionData.amount}
                                    onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                                    className="w-full pl-16 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-lg font-semibold text-gray-800 dark:text-white"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {transactionData.type === 'Transfer' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">To Account</label>
                                <div className="relative">
                                    <ArrowRightLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    <select
                                        required
                                        value={transactionData.toAccountId}
                                        onChange={(e) => setTransactionData({ ...transactionData, toAccountId: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 dark:text-white appearance-none"
                                    >
                                        <option value="">Select Target Account</option>
                                        {bankAccounts.filter(b => b.id !== transactionData.accountId).map(bank => (
                                            <option key={bank.id} value={bank.id}>
                                                {bank.bank_name} - {bank.account_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Description (Optional)</label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    value={transactionData.description}
                                    onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 dark:text-white"
                                    placeholder="Reason for transaction..."
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-700 mt-4">
                            <button
                                type="button"
                                onClick={() => setIsTransactionModalOpen(false)}
                                className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 transform active:scale-95"
                            >
                                {transactionData.type === 'Withdraw' ? <ArrowDownCircle className="w-5 h-5 text-indigo-100" /> : <ArrowUpCircle className="w-5 h-5 text-indigo-100" />}
                                Confirm {transactionData.type}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div >
        </>
    );
};

export default Finance;
