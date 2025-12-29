import React, { useState, useEffect } from "react";
import { Trash2, RefreshCw, AlertTriangle, RefreshCcw } from "lucide-react";
import Modal from "../components/Modal";
import { API_BASE_URL } from "../config";

const RecycleBin = () => {
    const [deletedItems, setDeletedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeletedItems();
    }, []);

    const fetchDeletedItems = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/recycle-bin`);
            if (res.ok) {
                const data = await res.json();
                setDeletedItems(data);
            }
        } catch (error) {
            console.error("Error fetching recycle bin:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (type, id) => {
        if (!window.confirm("Are you sure you want to restore this item?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/recycle-bin/restore`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, id }),
            });
            if (res.ok) {
                fetchDeletedItems();
                alert("Restored successfully!");
            }
        } catch (error) {
            console.error("Error restoring item:", error);
        }
    };

    const handleForceDelete = async (type, id) => {
        if (!window.confirm("WARNING: This will permanently delete the item. This action cannot be undone. Continue?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/recycle-bin/${type}/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchDeletedItems();
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Trash2 className="w-8 h-8 text-red-500" />
                        Recycle Bin
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and restore deleted records.</p>
                </div>
                <button
                    onClick={fetchDeletedItems}
                    className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                    <RefreshCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Deleted At</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {deletedItems.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                    <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Recycle bin is empty.</p>
                                </td>
                            </tr>
                        ) : (
                            deletedItems.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.type === 'Student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {item.deleted_at ? new Date(item.deleted_at).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleRestore(item.type, item.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                                                title="Restore"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Restore
                                            </button>
                                            <button
                                                onClick={() => handleForceDelete(item.type, item.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                                                title="Delete Forever"
                                            >
                                                <AlertTriangle className="w-4 h-4" />
                                                Delete
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
    );
};

export default RecycleBin;
