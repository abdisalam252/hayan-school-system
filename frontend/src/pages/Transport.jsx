import React, { useState, useEffect } from "react";
import { Bus, User, Phone, Plus, Search, Trash2, Edit2, DollarSign } from "lucide-react";
import { API_BASE_URL } from "../config";
import Modal from "../components/Modal";
import ActionMenu from "../components/ActionMenu";

const Transport = () => {
    const [routes, setRoutes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ route_name: "", bus_number: "", driver_name: "", driver_phone: "", price_per_month: "" });
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = `${API_BASE_URL}/api/transport`;

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const data = await res.json();
                setRoutes(data);
            }
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const handleSaveRoute = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const res = await fetch(`${API_URL}/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    const updated = await res.json();
                    setRoutes(routes.map(r => r.id === editingId ? updated : r));
                    closeModal();
                    fetchRoutes();
                } else {
                    alert("Failed to update route.");
                }
            } else {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    const newRoute = await res.json();
                    setRoutes([newRoute, ...routes]);
                    closeModal();
                    fetchRoutes();
                } else {
                    const err = await res.json();
                    console.error("Failed to create route:", err);
                    alert(`Failed to create route: ${err.error || "Unknown error"}`);
                }
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this route?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setRoutes(routes.filter(r => r.id !== id));
            }
        } catch (e) { console.error(e); }
    };

    const openEdit = (route) => {
        setEditingId(route.id);
        setFormData({
            route_name: route.route_name,
            bus_number: route.bus_number,
            driver_name: route.driver_name,
            driver_phone: route.driver_phone,
            price_per_month: route.price_per_month || ""
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ route_name: "", bus_number: "", driver_name: "", driver_phone: "", price_per_month: "" });
    };

    const filteredRoutes = routes.filter(r =>
        r.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.driver_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.bus_number || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transport & Logistics</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage buses, routes, drivers, and transport fees.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add New Route
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search routes, drivers, or buses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading routes...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoutes.length > 0 ? filteredRoutes.map((route) => (
                        <div key={route.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
                                        <Bus className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{route.route_name}</h3>
                                        <p className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 rounded inline-block mt-1">
                                            {route.bus_number}
                                        </p>
                                    </div>
                                </div>
                                <ActionMenu
                                    onEdit={() => openEdit(route)}
                                    onDelete={() => handleDelete(route.id)}
                                />
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-700">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{route.driver_name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{route.driver_phone}</span>
                                </div>
                                {route.price_per_month > 0 && (
                                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 p-3 rounded-lg mt-3 border border-green-100 dark:border-green-900/30">
                                        <span className="text-xs font-bold uppercase text-green-700 dark:text-green-400">Monthly Fee</span>
                                        <span className="text-sm font-bold text-green-800 dark:text-green-300">${route.price_per_month}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No transport routes found. Add one to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Route" : "Add New Route"}>
                <form onSubmit={handleSaveRoute} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Route Name</label>
                        <input required type="text" value={formData.route_name} onChange={e => setFormData({ ...formData, route_name: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g. City Center Route" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bus Number</label>
                            <input required type="text" value={formData.bus_number} onChange={e => setFormData({ ...formData, bus_number: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g. B-101" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Monthly Fee ($)</label>
                            <input type="number" value={formData.price_per_month} onChange={e => setFormData({ ...formData, price_per_month: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Driver Name</label>
                            <input required type="text" value={formData.driver_name} onChange={e => setFormData({ ...formData, driver_name: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Full Name" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</label>
                            <input required type="text" value={formData.driver_phone} onChange={e => setFormData({ ...formData, driver_phone: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="+252..." />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-500/20">{editingId ? 'Update Route' : 'Add Route'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Transport;
