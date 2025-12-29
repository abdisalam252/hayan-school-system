import React, { useState, useEffect } from "react";
import { Calendar, Check, X, Clock, Save, Search, User, Filter, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../config";
import Modal from "../components/Modal";

const Attendance = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: "", phone: "", parent: "" });

    const API_URL = `${API_BASE_URL}/api`;

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass && selectedDate) {
            fetchAttendanceData();
        } else {
            setStudents([]);
        }
    }, [selectedClass, selectedDate]);

    const fetchClasses = async () => {
        try {
            const res = await fetch(`${API_URL}/classes`);
            if (res.ok) {
                const data = await res.json();
                setClasses(data);
                if (data.length > 0) setSelectedClass(data[0].id.toString());
            }
        } catch (e) {
            console.error("Error fetching classes", e);
        }
    };

    const fetchAttendanceData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/attendance?date=${selectedDate}&class_id=${selectedClass}`);
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (e) {
            console.error("Error fetching data", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
    };

    const handleSave = async () => {
        const records = students
            .filter(s => s.status) // Only send marked records
            .map(s => ({
                student_id: s.id,
                status: s.status,
                class_id: s.class_id // Required for backend
            }));

        try {
            const res = await fetch(`${API_URL}/attendance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: selectedDate,
                    // class_id is now inside records
                    records
                })
            });

            if (res.ok) {
                alert("Attendance saved successfully!");
                fetchAttendanceData(); // Refresh
            } else {
                alert("Failed to save attendance.");
            }
        } catch (e) {
            console.error("Error saving attendance", e);
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student permanently?")) return;
        try {
            const res = await fetch(`${API_URL}/students/${id}`, { method: "DELETE" });
            if (res.ok) {
                setStudents(prev => prev.filter(s => s.id !== id));
            } else {
                alert("Failed to delete student.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Delete Attendance for current date and class
    const handleDeleteAttendance = async () => {
        if (!selectedClass || !selectedDate) return;

        if (!window.confirm("Are you sure you want to RESET/DELETE attendance for this class and date? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/attendance`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: selectedDate,
                    class_id: selectedClass
                })
            });

            if (res.ok) {
                alert("Attendance reset successfully!");
                fetchAttendanceData(); // Refresh to show empty/default state
            } else {
                const data = await res.json();
                alert(data.message || "Failed to reset attendance.");
            }
        } catch (e) {
            console.error("Error deleting attendance", e);
        }
    };


    const openEditModal = (student) => {
        setEditingStudent(student);
        setEditFormData({
            name: student.name,
            phone: student.phone || "",
            parent: student.parent || ""
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/students/${editingStudent.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editFormData)
            });

            if (res.ok) {
                setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...editFormData } : s));
                setIsEditModalOpen(false);
                setEditingStudent(null);
            } else {
                alert("Failed to update student.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Filter by search term
    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        present: filteredStudents.filter(s => s.status === "Present").length,
        absent: filteredStudents.filter(s => s.status === "Absent").length,
        late: filteredStudents.filter(s => s.status === "Late").length,
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Present</p>
                        <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.present}</h3>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Absent</p>
                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.absent}</h3>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Late</p>
                        <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.late}</h3>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-2 items-center">

                {/* Date Picker */}
                <div className="relative w-full md:w-auto">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full md:w-40 pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-none rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

                {/* Class Selector */}
                <div className="relative w-full md:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-700/50 border-none rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">All Grades</option>
                        <option value="Primary">Primary Level</option>
                        <option value="Intermediate">Intermediate Level</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        {classes.length === 0 && <option value="">No classes found</option>}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                <div className="flex-1 w-full">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search student by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-transparent border-none focus:ring-0 outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
                        />
                    </div>
                </div>

            </div>

            {/* Student List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading class data...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Students Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                            No students found for this class and date. Try changing your filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {filteredStudents.map((student) => (
                            <div key={student.id} className="group bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-4">

                                {/* Student Info */}
                                <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg shadow-inner">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{student.name}</h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {student.grade}</span>
                                            {student.phone && <span className="flex items-center gap-1"><Edit2 className="w-3 h-3" /> {student.phone}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end bg-gray-50 dark:bg-gray-700/30 p-1.5 rounded-xl">
                                    <button
                                        onClick={() => handleStatusChange(student.id, "Present")}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${student.status === 'Present' ? 'bg-white dark:bg-gray-600 shadow text-green-600 dark:text-green-400 ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        <Check className="w-4 h-4" />
                                        <span className="hidden sm:inline">Present</span>
                                    </button>

                                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-600"></div>

                                    <button
                                        onClick={() => handleStatusChange(student.id, "Absent")}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${student.status === 'Absent' ? 'bg-white dark:bg-gray-600 shadow text-red-600 dark:text-red-400 ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="hidden sm:inline">Absent</span>
                                    </button>

                                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-600"></div>

                                    <button
                                        onClick={() => handleStatusChange(student.id, "Late")}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${student.status === 'Late' ? 'bg-white dark:bg-gray-600 shadow text-amber-600 dark:text-amber-400 ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        <Clock className="w-4 h-4" />
                                        <span className="hidden sm:inline">Late</span>
                                    </button>
                                </div>


                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Save Button */}
            <div className="sticky bottom-6 flex justify-center pointer-events-none mt-8">
                <button
                    onClick={handleSave}
                    className="pointer-events-auto flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    <Save className="w-5 h-5" />
                    Save Attendance Changes
                </button>

                {stats.present + stats.absent + stats.late > 0 && (
                    <button
                        onClick={handleDeleteAttendance}
                        className="pointer-events-auto ml-4 flex items-center gap-3 bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <Trash2 className="w-5 h-5" />
                        Reset Attendance
                    </button>
                )}
            </div>

            {/* Quick Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Student">
                <form onSubmit={handleUpdateStudent} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            type="text"
                            value={editFormData.name}
                            onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parent Name</label>
                        <input
                            type="text"
                            value={editFormData.parent}
                            onChange={e => setEditFormData({ ...editFormData, parent: e.target.value })}
                            className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                        <input
                            type="text"
                            value={editFormData.phone}
                            onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                            className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700">Update</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Attendance;
