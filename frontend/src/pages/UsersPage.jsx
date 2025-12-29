import React, { useState, useEffect } from "react";
import { Shield, Plus, Lock, Search, CheckCircle, XCircle } from "lucide-react";
import { API_BASE_URL } from "../config";
import Modal from "../components/Modal";
import ActionMenu from "../components/ActionMenu";

const UsersPage = () => {
    console.log("UsersPage Component Loaded - V2");
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", role: "Teacher", password: "" });
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = `${API_BASE_URL}/api/auth/users`;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                const res = await fetch(`${API_URL}/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    const updated = await res.json();
                    setUsers(users.map(u => u.id === editingId ? { ...updated, status: 'Active', lastLogin: 'Just now' } : u));
                }
            } else {
                // Create
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    const newUser = await res.json();
                    setUsers([{ ...newUser, status: 'Active', lastLogin: 'Never' }, ...users]);
                } else {
                    const error = await res.json();
                    alert(error.error || "Failed to add user");
                    return;
                }
            }
            closeModal();
            fetchUsers();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== id));
            }
        } catch (e) { console.error(e); }
    };

    const openEdit = (user) => {
        setEditingId(user.id);
        setFormData({ name: user.name, email: user.email, role: user.role, password: "" }); // Password empty on edit
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: "", email: "", role: "Teacher", password: "" });
    };

    const filteredUsers = users.filter(user =>
        (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.role || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage system access and specialized roles.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add User
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500">Loading users...</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">User</th>
                                    <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Role</th>
                                    <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Status</th>
                                    <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold uppercase">
                                                    {user.name ? user.name.charAt(0) : 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                <Shield className="w-4 h-4 text-gray-400" />
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                <CheckCircle className="w-3 h-3" />
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <ActionMenu
                                                onEdit={() => openEdit(user)}
                                                onDelete={() => handleDelete(user.id)}
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit User" : "Add New User"}>
                <form onSubmit={handleSaveUser} className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20" placeholder="e.g. John Doe" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20" placeholder="john@hayan.edu" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Role</label>
                            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20">
                                <option>Administrator</option>
                                <option>Teacher</option>
                                <option>Accountant</option>
                                <option>Librarian</option>
                                <option>Staff</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {editingId ? "New Password (Optional)" : "Password"}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    required={!editingId}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20"
                                    placeholder={editingId ? "Leave blank to keep current" : "••••••"}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3 justify-end">
                        <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-500/20">{editingId ? 'Update User' : 'Create User'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UsersPage;
