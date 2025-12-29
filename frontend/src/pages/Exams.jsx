import React, { useState, useEffect } from "react";
import { Award, FileText, Download, Upload, Plus, Search, Calendar, Clock, BookOpen, Trash2, Edit, Save, X } from "lucide-react";
import { API_BASE_URL } from "../config";
import Modal from "../components/Modal";

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({ name: "", subject: "", class_id: "", date: "", time: "", total_marks: "100" });

    // Results Data
    const [selectedExam, setSelectedExam] = useState(null);
    const [resultsData, setResultsData] = useState([]); // [{ student_id, name, marks, grade, remarks }]
    const [isLoadingResults, setIsLoadingResults] = useState(false);

    // Results Search & Add
    const [resultsSearchTerm, setResultsSearchTerm] = useState("");
    const [allStudents, setAllStudents] = useState([]); // For searching outside the class
    const [isAddingStudent, setIsAddingStudent] = useState(false);

    const API_URL = `${API_BASE_URL}/api`;

    useEffect(() => {
        fetchExams();
        fetchClasses();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await fetch(`${API_URL}/exams`);
            if (res.ok) setExams(await res.json());
        } catch (e) {
            console.error("Error fetching exams", e);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await fetch(`${API_URL}/classes`);
            if (res.ok) setClasses(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleAddExam = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/exams`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchExams();
                setIsModalOpen(false);
                setFormData({ name: "", subject: "", class_id: "", date: "", time: "", total_marks: "100" });
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm("Delete this exam? Results will also be deleted.")) return;
        try {
            const res = await fetch(`${API_URL}/exams/${id}`, { method: "DELETE" });
            if (res.ok) fetchExams();
        } catch (e) { console.error(e); }
    };

    // --- Results Logic ---

    const openResultsModal = async (exam) => {
        setSelectedExam(exam);
        setIsResultsModalOpen(true);
        setIsLoadingResults(true);
        setResultsSearchTerm("");
        setIsAddingStudent(false);
        try {
            const res = await fetch(`${API_URL}/exams/${exam.id}/results`);
            if (res.ok) {
                const data = await res.json();
                setResultsData(data.students);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingResults(false);
        }
    };

    const handleMarkChange = (studentId, field, value) => {
        setResultsData(prev => prev.map(s => {
            if (s.student_id === studentId) {
                return { ...s, [field]: value };
            }
            return s;
        }));
    };

    const handleAddStudentToResult = async (student) => {
        // Check if already in list
        if (resultsData.find(s => s.student_id === student.id)) {
            alert("Student already in list");
            return;
        }

        // Add to local list (will be saved when "Save Results" is clicked)
        setResultsData(prev => [...prev, {
            student_id: student.id,
            name: student.name,
            marks: "",
            grade: "",
            remarks: ""
        }]);
        setIsAddingStudent(false);
        setResultsSearchTerm("");
    };

    const fetchAllStudentsForSearch = async () => {
        if (allStudents.length > 0) return;
        try {
            const res = await fetch(`${API_URL}/students`);
            if (res.ok) setAllStudents(await res.json());
        } catch (e) { console.error(e); }
    };

    const saveResults = async () => {
        try {
            const marksPayload = resultsData.filter(s => s.marks !== null && s.marks !== undefined && s.marks !== "").map(s => ({
                student_id: s.student_id,
                marks: s.marks,
                grade: s.grade,
                remarks: s.remarks
            }));

            const res = await fetch(`${API_URL}/exams/${selectedExam.id}/results`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ results: marksPayload })
            });

            if (res.ok) {
                alert("Results saved!");
                setIsResultsModalOpen(false);
            } else {
                alert("Failed to save results.");
            }
        } catch (e) { console.error(e); }
    };

    const filteredExams = exams.filter(exam =>
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter results inside modal
    const filteredResults = resultsData.filter(s =>
        s.name.toLowerCase().includes(resultsSearchTerm.toLowerCase())
    );

    // Filter global students for adding
    const filteredGlobalStudents = allStudents.filter(s =>
        (s.class_id === selectedExam.class_id) &&
        (s.name.toLowerCase().includes(resultsSearchTerm.toLowerCase()) ||
            (s.grade && s.grade.toLowerCase().includes(resultsSearchTerm.toLowerCase()))) &&
        !resultsData.find(existing => existing.student_id === s.id)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exams & Results</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage examination schedules and marks.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        New Exam
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search exams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Exams List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map(exam => (
                    <div key={exam.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col relative group">
                        <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Exam"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {exam.status || "Draft"}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{exam.subject}</h3>
                        <p className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-4">{exam.name}</p>

                        <div className="space-y-2 mb-6 flex-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <BookOpen className="w-4 h-4" /> {exam.class_name || "Unknown Class"}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4" /> {new Date(exam.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-4 h-4" /> {exam.time}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-gray-700 mt-auto">
                            <button
                                onClick={() => openResultsModal(exam)}
                                className="flex-1 py-2 text-sm font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                            >
                                Manage Results
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredExams.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No exams found. Click "New Exam" to create one.
                </div>
            )}

            {/* Create Exam Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Exam">
                <form onSubmit={handleAddExam} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Exam Title</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g. Mid-Term 2024" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Subject</label>
                            <input required type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g. Math" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Class</label>
                            <select
                                required
                                value={formData.class_id}
                                onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                                className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
                            <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                        </div>
                        <div className="space-y-1.5">
                            <input required type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Marks</label>
                        <input required type="number" value={formData.total_marks} onChange={e => setFormData({ ...formData, total_marks: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="100" />
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-500/20">Schedule</button>
                    </div>
                </form>
            </Modal>

            {/* Results Entry Modal (Full Screen-ish) */}
            {isResultsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Results Entry</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedExam?.name} - {selectedExam?.subject} ({selectedExam?.class_name})
                                </p>
                            </div>
                            <button onClick={() => setIsResultsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search & Toolbar */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={isAddingStudent ? "Search all students to add..." : "Search in this list..."}
                                    value={resultsSearchTerm}
                                    onChange={e => setResultsSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-brand-500/20"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setIsAddingStudent(!isAddingStudent);
                                    if (!isAddingStudent) fetchAllStudentsForSearch();
                                }}
                                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 ${isAddingStudent ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'bg-white border text-gray-700 border-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'}`}
                            >
                                {isAddingStudent ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {isAddingStudent ? "Cancel Adding" : "Add Other Student"}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            {isAddingStudent ? (
                                <div className="p-4 space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase px-2 mb-2">Select Student to Add</h4>
                                    {filteredGlobalStudents.length === 0 ? (
                                        <p className="p-4 text-center text-gray-500">No matching students found.</p>
                                    ) : (
                                        filteredGlobalStudents.map(student => (
                                            <div key={student.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600" onClick={() => handleAddStudentToResult(student)}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                                                        {student.name.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                                        <p className="text-xs text-gray-500">{student.grade}</p>
                                                    </div>
                                                </div>
                                                <Plus className="w-4 h-4 text-brand-600" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                isLoadingResults ? (
                                    <p className="text-center text-gray-500 p-8">Loading student list...</p>
                                ) : filteredResults.length === 0 ? (
                                    <p className="text-center text-gray-500 p-8">No students found.</p>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
                                            <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                                <th className="py-3 pl-6 font-medium">Student Name</th>
                                                <th className="py-3 w-32 font-medium">Marks</th>
                                                <th className="py-3 w-32 font-medium">Grade</th>
                                                <th className="py-3 pr-6 font-medium">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {filteredResults.map(student => (
                                                <tr key={student.student_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                                    <td className="py-3 pl-6 font-medium text-gray-900 dark:text-white">
                                                        {student.name}
                                                    </td>
                                                    <td className="py-3">
                                                        <input
                                                            type="number"
                                                            value={student.marks || ""}
                                                            onChange={e => handleMarkChange(student.student_id, 'marks', e.target.value)}
                                                            className="w-24 px-3 py-1.5 border rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-brand-500/20 outline-none text-center font-medium"
                                                            placeholder="-"
                                                        />
                                                    </td>
                                                    <td className="py-3">
                                                        <input
                                                            type="text"
                                                            value={student.grade || ""}
                                                            onChange={e => handleMarkChange(student.student_id, 'grade', e.target.value)}
                                                            className="w-24 px-3 py-1.5 border rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-brand-500/20 outline-none uppercase text-center font-medium"
                                                            placeholder="-"
                                                        />
                                                    </td>
                                                    <td className="py-3 pr-6">
                                                        <input
                                                            type="text"
                                                            value={student.remarks || ""}
                                                            onChange={e => handleMarkChange(student.student_id, 'remarks', e.target.value)}
                                                            className="w-full px-3 py-1.5 border rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                                                            placeholder="Optional..."
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                            <button onClick={() => setIsResultsModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                            <button onClick={saveResults} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                                <Save className="w-5 h-5" /> Save Results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Exams;
