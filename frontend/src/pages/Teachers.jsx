import React, { useState, useEffect } from "react";
import { Mail, Phone, Plus, Search, BookOpen, User, Upload, FileText, Download, Briefcase, GraduationCap, PenTool } from "lucide-react";
import { API_BASE_URL } from "../config";
import Modal from "../components/Modal";
import ActionMenu from "../components/ActionMenu";

const Teachers = () => {
    const [staff, setStaff] = useState([]);
    const [activeTab, setActiveTab] = useState("Teacher"); // Teacher, Principal, Worker
    const [searchTerm, setSearchTerm] = useState("");
    const [isHireModalOpen, setIsHireModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [formData, setFormData] = useState({ name: "", subject: "", email: "", phone: "", bio: "", salary: "", role: "Teacher" });
    const [imageFile, setImageFile] = useState(null);
    const [docFile, setDocFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);

    const API_URL = `${API_BASE_URL}/api/teachers`;

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setError(null);
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Failed to fetch staff");
            const data = await res.json();
            // Ensure compatibility if role is missing in older records
            const normalizedData = data.map(s => ({ ...s, role: s.role || 'Teacher' }));
            setStaff(normalizedData);
        } catch (e) {
            console.error("Error fetching staff:", e);
            setError("Failed to load staff. Please ensure the backend is running.");
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("name", formData.name);
        data.append("subject", formData.subject); // Used as Job Title for non-teachers
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        data.append("role", formData.role);
        data.append("bio", formData.bio);
        data.append("salary", formData.salary);
        if (imageFile) data.append("image", imageFile);
        if (docFile) data.append("document", docFile);

        try {
            if (editingId) {
                const res = await fetch(`${API_URL}/${editingId}`, {
                    method: 'PUT',
                    body: data
                });
                if (res.ok) {
                    const updated = await res.json();
                    setStaff(staff.map(t => t.id === editingId ? { ...updated, role: updated.role || 'Teacher' } : t));
                }
            } else {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    body: data
                });
                if (res.ok) {
                    const newStaff = await res.json();
                    setStaff([{ ...newStaff, role: newStaff.role || 'Teacher' }, ...staff]);
                }
            }
            closeModal();
        } catch (e) {
            console.error("Error saving staff:", e);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this staff member permanently?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setStaff(staff.filter(t => t.id !== id));
            }
        } catch (e) { console.error("Error deleting staff:", e); }
    };

    const openEdit = (member) => {
        setEditingId(member.id);
        setFormData({
            name: member.name,
            subject: member.subject,
            email: member.email || "",
            phone: member.phone,
            bio: member.bio || "",
            salary: member.salary || "",
            role: member.role || "Teacher"
        });
        setImageFile(null);
        setDocFile(null);
        setIsHireModalOpen(true);
    };

    const closeModal = () => {
        setIsHireModalOpen(false);
        setEditingId(null);
        setFormData({ name: "", subject: "", email: "", phone: "", bio: "", salary: "", role: "Teacher" });
        setImageFile(null);
        setDocFile(null);
    };

    const handleViewProfile = (member) => {
        setSelectedMember(member);
        setIsProfileModalOpen(true);
    };

    const filteredStaff = staff.filter(member =>
        member.role === activeTab &&
        ((member.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.subject || "").toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const tabs = [
        { id: "Teacher", label: "Teachers", icon: GraduationCap },
        { id: "Principal", label: "Principals", icon: User },
        { id: "Worker", label: "Workers", icon: Briefcase }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage teachers, principals, and support staff.</p>
                </div>
                <button
                    onClick={() => { setFormData({ ...formData, role: activeTab }); setIsHireModalOpen(true); }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Hire {activeTab}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-full max-w-md mx-auto sm:mx-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={fetchStaff} className="text-sm font-semibold underline hover:no-underline">Retry</button>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab.toLowerCase()}s...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStaff.map((member) => (
                    <div key={member.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative flex flex-col items-center text-center hover:z-20">
                        <div className="absolute top-4 right-4 z-10">
                            <ActionMenu
                                onEdit={() => openEdit(member)}
                                onDelete={() => handleDelete(member.id)}
                            />
                        </div>

                        <div className="relative mb-3">
                            <img
                                src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                                alt={member.name}
                                className="w-20 h-20 rounded-full border-4 border-brand-50 dark:border-brand-900/40 group-hover:border-brand-100 dark:group-hover:border-brand-900/60 transition-colors object-cover"
                            />
                            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${member.role === 'Principal' ? 'bg-purple-500' : member.role === 'Worker' ? 'bg-orange-500' : 'bg-green-500'
                                }`}></div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">{member.role}</p>

                        <div className="flex items-center justify-center gap-2 mt-1 mb-4">
                            <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-sm font-semibold flex items-center gap-1.5 border border-brand-100 dark:border-brand-800">
                                {member.role === 'Teacher' ? <BookOpen className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                                {member.subject || (member.role === 'Teacher' ? "General Subject" : "Staff Member")}
                            </span>
                        </div>

                        <div className="w-full space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 justify-center">
                                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="truncate">{member.phone}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleViewProfile(member)}
                            className="mt-auto w-full py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                            View Profile
                        </button>
                    </div>
                ))}
            </div>

            {filteredStaff.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No {activeTab.toLowerCase()}s found. Click "Hire {activeTab}" to add one.
                </div>
            )}

            {/* Hire/Edit Modal */}
            <Modal isOpen={isHireModalOpen} onClose={closeModal} title={editingId ? "Edit Staff Member" : "Hire Staff Member"}>
                <form onSubmit={handleAddStaff} className="space-y-4">
                    {/* Photo Upload */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                            {imageFile ? (
                                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <label className="cursor-pointer bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            Change Photo
                            <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                        </label>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Role</label>
                        <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                            {['Teacher', 'Principal', 'Worker'].map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: r })}
                                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.role === r ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g. John Doe" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {formData.role === 'Teacher' ? 'Subject' : 'Job Title'}
                            </label>
                            <input required type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder={formData.role === 'Teacher' ? "e.g. Math" : "e.g. Cleaner"} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email (Optional)</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="email@example.com" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</label>
                            <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="+252..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Salary ($)</label>
                            <input type="number" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">File Upload (CV / Document)</label>
                        <div className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                            {docFile ? (
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                    <FileText className="w-5 h-5" />
                                    {docFile.name}
                                </div>
                            ) : (
                                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Click to upload document</span>
                                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setDocFile(e.target.files[0])} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bio (Optional)</label>
                        <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" rows="3" placeholder="Short biography..."></textarea>
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-500/20">{editingId ? 'Update Staff' : 'Hire Staff'}</button>
                    </div>
                </form>
            </Modal>


            {/* Profile View Modal */}
            <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Staff Profile">
                {selectedMember && (
                    <div className="flex flex-col items-center">
                        <img
                            src={selectedMember.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&background=random`}
                            alt={selectedMember.name}
                            className="w-24 h-24 rounded-full border-4 border-brand-100 dark:border-brand-900/60 mb-4 object-cover shadow-lg"
                        />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedMember.name}</h2>
                        <span className="text-brand-600 dark:text-brand-400 font-medium mb-1">{selectedMember.role} - {selectedMember.subject}</span>

                        {selectedMember.document_path && (
                            <div className="mt-3">
                                <a href={selectedMember.document_path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                                    <Download className="w-4 h-4" />
                                    Download CV/Document
                                </a>
                            </div>
                        )}

                        <div className="w-full mt-6 space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Contact Info</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        {selectedMember.phone}
                                    </div>
                                    {selectedMember.email && (
                                        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {selectedMember.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Short Bio</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {selectedMember.bio || 'No biography details provided.'}
                                </p>
                            </div>
                        </div>

                        <div className="w-full mt-6 flex justify-end">
                            <button onClick={() => setIsProfileModalOpen(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                Close Profile
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Teachers;
