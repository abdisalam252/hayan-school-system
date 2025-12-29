import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useSchool } from '../context/SchoolContext';
import { API_BASE_URL } from '../config';

const PaymentModal = ({ isOpen, onClose, onSuccess, prefillData }) => {
    const { currencySymbol } = useSchool();
    const [students, setStudents] = useState([]);
    const [settings, setSettings] = useState({});
    const [formData, setFormData] = useState({
        student: '',
        type: '',
        amount: '',
        customType: '',
        customType: '',
        status: 'Pending',
        payment_method: 'Cash',
        date: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [bankAccounts, setBankAccounts] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
            fetchSettings();
            fetchBanks();
            // Reset form when opening, using prefillData if available
            setFormData({
                student: prefillData?.student || '',
                type: prefillData?.type || '',
                amount: prefillData?.amount || '',
                customType: '',
                status: 'Pending',
                payment_method: 'Cash',
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [isOpen, prefillData]);

    const fetchBanks = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/banks`);
            if (res.ok) setBankAccounts(await res.json());
        } catch (e) { console.error("Error fetching banks", e); }
    };

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/students`);
            if (res.ok) setStudents(await res.json());
        } catch (e) { console.error("Error fetching students", e); }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/settings`);
            if (res.ok) setSettings(await res.json());
        } catch (e) { console.error("Error fetching settings", e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            category: 'income',
            amount: formData.amount,
            status: 'Paid', // Default to Paid for quick payments
            date: formData.date,
            title: formData.student,
            type: formData.type === 'Other' ? formData.customType : formData.type,
            payment_method: formData.payment_method
        };

        const selectedBank = bankAccounts.find(b => String(b.id) === String(formData.payment_method));
        if (selectedBank) {
            payload.payment_method = selectedBank.bank_name;
            payload.account_id = selectedBank.id;
        } else {
            payload.account_id = null;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/finance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Payment recorded successfully!");
                if (onSuccess) onSuccess();
                onClose();
            } else {
                alert("Failed to record payment.");
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Student Name</label>
                    <select
                        required
                        value={formData.student}
                        onChange={e => setFormData({ ...formData, student: e.target.value })}
                        className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                        <option value="">Select Student</option>
                        {students.map(student => (
                            <option key={student.id} value={student.name}>{student.name} - {student.grade}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Type</label>
                    <select
                        required
                        value={formData.type}
                        onChange={e => {
                            const type = e.target.value;
                            let amount = formData.amount;

                            const selectedStudent = students.find(s => s.name === formData.student);

                            if (type === 'Monthly Fee') {
                                if (selectedStudent && selectedStudent.grade) {
                                    // Parse grade number (e.g. "Grade 5" -> 5)
                                    const gradeNum = parseInt(selectedStudent.grade.replace(/\D/g, '')) || 0;

                                    // Logic: Grade 7+ is Intermediate, otherwise Primary
                                    // Also check for explicit "Intermediate" string in grade name
                                    const isIntermediate = gradeNum >= 7 || selectedStudent.grade.toLowerCase().includes('intermediate');

                                    if (isIntermediate && settings.TUITION_FEE_INTERMEDIATE) {
                                        amount = settings.TUITION_FEE_INTERMEDIATE;
                                    } else if (settings.TUITION_FEE_PRIMARY) {
                                        amount = settings.TUITION_FEE_PRIMARY;
                                    }
                                } else if (settings.TUITION_FEE_PRIMARY) {
                                    // Fallback if no student selected yet
                                    amount = settings.TUITION_FEE_PRIMARY;
                                }
                            }
                            else if (type === 'Registration Fee' && settings.REGISTRATION_FEE) amount = settings.REGISTRATION_FEE;

                            setFormData({ ...formData, type, amount });
                        }}
                        className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                        <option value="">Select Type</option>
                        <option value="Monthly Fee">Monthly Fee</option>
                        <option value="Registration Fee">Registration Fee</option>
                        <option value="Transport Fee">Transport Fee</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Mode</label>
                    <select
                        required
                        value={formData.payment_method}
                        onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                        className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
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

                {formData.type === 'Other' && (
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Specify Type</label>
                        <input
                            required
                            type="text"
                            value={formData.customType}
                            onChange={e => setFormData({ ...formData, customType: e.target.value })}
                            className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            placeholder="e.g. Uniform"
                        />
                    </div>
                )}

                <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Amount ({currencySymbol?.trim()})</label>
                    <input
                        required
                        type="number"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Recording...' : 'Record Payment'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default PaymentModal;
