import React, { useState, useEffect } from "react";
import { BookOpen, Users, Clock, Plus, Search, MapPin, UserCircle } from "lucide-react";
import { API_BASE_URL } from "../config";
import Modal from "../components/Modal";
import ActionMenu from "../components/ActionMenu";

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initial State including structured fields
    const initialFormState = {
        teacher: "",
        room: "",
        level: "Primary",
        grade: "Grade 1",
        section: "A"
    };
    const [formData, setFormData] = useState(initialFormState);
    const [editingClass, setEditingClass] = useState(null);

    const API_URL = `${API_BASE_URL}/api/classes`;

    // Constants for Dropdowns
    const LEVELS = ["Primary", "Intermediate"];
    const PRIMARY_GRADES = ["KG 1", "KG 2", "KG 3", "Grade 1", "Grade 2", "Grade 3", "Grade 4"];
    const INTERMEDIATE_GRADES = ["Grade 5", "Grade 6", "Grade 7", "Grade 8"];
    const SECTIONS = ["A", "B", "C"];

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
            } else {
                console.error("Failed to fetch classes");
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLevelChange = (newLevel) => {
        setFormData({
            ...formData,
            level: newLevel,
            // Reset grade to first available when switching levels to avoid invalid dates
            grade: newLevel === "Primary" ? PRIMARY_GRADES[0] : INTERMEDIATE_GRADES[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClass) {
                const response = await fetch(`${API_URL}/${editingClass.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (response.ok) {
                    const updatedClass = await response.json();
                    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
                }
            } else {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (response.ok) {
                    const newClass = await response.json();
                    setClasses([...classes, newClass]);
                }
            }
            closeModal();
        } catch (error) {
            console.error("Error saving class:", error);
            alert("Error: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this class?")) return;
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (response.ok) {
                setClasses(classes.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Error deleting class:", error);
        }
    };

    const openEditModal = (cls) => {
        setEditingClass(cls);
        setFormData({
            teacher: cls.teacher || "",
            room: cls.room || "",
            level: cls.level || "Primary",
            grade: cls.grade || "Grade 1",
            section: cls.section || "A"
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClass(null);
        setFormData(initialFormState);
    };

    const filteredClasses = classes.filter(c =>
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.teacher || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Classes & Academics</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage class sections and schedules.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Create New Class
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by class name or teacher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading classes...</p>
                    </div>
                ) : filteredClasses.length > 0 ? (
                    filteredClasses.map((cls) => {
                        const isPrimary = cls.level === 'Primary';
                        const theme = isPrimary ? {
                            gradient: 'from-emerald-500 to-teal-500',
                            light: 'bg-emerald-50 dark:bg-emerald-900/10',
                            text: 'text-emerald-700 dark:text-emerald-400',
                            border: 'hover:border-emerald-200 dark:hover:border-emerald-800'
                        } : {
                            gradient: 'from-indigo-500 to-violet-500',
                            light: 'bg-indigo-50 dark:bg-indigo-900/10',
                            text: 'text-indigo-700 dark:text-indigo-400',
                            border: 'hover:border-indigo-200 dark:hover:border-indigo-800'
                        };

                        return (
                            <div key={cls.id} className={`group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden ${theme.border}`}>
                                {/* Decorative Top Bar */}
                                <div className={`h-2 w-full bg-gradient-to-r ${theme.gradient}`}></div>

                                <div className="p-6">
                                    <div className="absolute top-6 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ActionMenu
                                            onEdit={() => openEditModal(cls)}
                                            onDelete={() => handleDelete(cls.id)}
                                        />
                                    </div>

                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${theme.light}`}>
                                            <BookOpen className={`w-7 h-7 ${theme.text}`} />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.light} ${theme.text}`}>
                                            {cls.level}
                                        </span>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">{cls.name}</h3>
                                        <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400 text-sm">
                                            <MapPin className="w-4 h-4" />
                                            <span>{cls.room || "No Room Assigned"}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50 dark:border-gray-700">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Students</span>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{cls.student_count || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Teacher</span>
                                            <div className="flex items-center gap-2">
                                                <UserCircle className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{cls.teacher || "Unassigned"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                            <BookOpen className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Classes Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                            Get started by creating your first class section to manage students and schedules.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Class
                        </button>
                    </div>
                )}
            </div>

            {/* Add Class Modal - Updated with specific hierarchy */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingClass ? "Edit Class Details" : "Create New Class"}>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Level</label>
                            <select value={formData.level} onChange={e => handleLevelChange(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Grade</label>
                            <select value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                                {(formData.level === "Primary" ? PRIMARY_GRADES : INTERMEDIATE_GRADES).map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Section</label>
                        <div className="flex gap-4">
                            {SECTIONS.map(section => (
                                <label key={section} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="section"
                                        value={section}
                                        checked={formData.section === section}
                                        onChange={e => setFormData({ ...formData, section: e.target.value })}
                                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Section {section}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Class Teacher</label>
                        <input required type="text" value={formData.teacher} onChange={e => setFormData({ ...formData, teacher: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g. Mr. Ahmed" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Room Location</label>
                        <input required type="text" value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g. Block C - 204" />
                    </div>

                    <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-700 mt-6">
                        <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-500/20">
                            {editingClass ? "Update Class" : "Create Class"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Classes;
