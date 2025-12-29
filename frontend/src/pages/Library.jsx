import React, { useState, useEffect } from "react";
import { Book, Plus, Search, Trash2, Edit2, CheckCircle, XCircle } from "lucide-react";
import { API_BASE_URL } from "../config";
import Modal from "../components/Modal";
import ActionMenu from "../components/ActionMenu";

const Library = () => {
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: "", author: "", isbn: "", status: "Available", borrower_name: "" });
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = `${API_BASE_URL}/api/library`;

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const data = await res.json();
                setBooks(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveBook = async (e) => {
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
                    setBooks(books.map(b => b.id === editingId ? updated : b));
                }
            } else {
                // Create
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    const newBook = await res.json();
                    setBooks([newBook, ...books]);
                }
            }
            closeModal();
            fetchBooks();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setBooks(books.filter(b => b.id !== id));
            }
        } catch (e) { console.error(e); }
    };

    const openEdit = (book) => {
        setEditingId(book.id);
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            status: book.status || "Available",
            borrower_name: book.borrower_name || ""
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ title: "", author: "", isbn: "", status: "Available", borrower_name: "" });
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Library Manager</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track books, manage inventory, and monitor borrowing status.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add New Book
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for books by title or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Book Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading library...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.length > 0 ? filteredBooks.map((book) => (
                        <div key={book.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4 hover:shadow-md transition-all group">
                            <div className={`w-14 h-18 text-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${book.status === 'Available' ? 'bg-indigo-500' : 'bg-orange-500'}`}>
                                <Book className="w-8 h-8 opacity-90" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2 text-lg" title={book.title}>{book.title}</h3>
                                    <ActionMenu
                                        onEdit={() => openEdit(book)}
                                        onDelete={() => handleDelete(book.id)}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">{book.author}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">ISBN: {book.isbn}</p>

                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${book.status === 'Available'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${book.status === 'Available' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                        {book.status}
                                    </span>

                                    {book.status === 'Borrowed' && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded" title={`Borrowed by: ${book.borrower_name}`}>
                                            By: {book.borrower_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No books found. Add one to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Book Details" : "Add New Book"}>
                <form onSubmit={handleSaveBook} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Book Title</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g. Introduction to Physics" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Author</label>
                            <input required type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g. Dr. A. Einstein" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">ISBN</label>
                            <input type="text" value={formData.isbn} onChange={e => setFormData({ ...formData, isbn: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Optional" />
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Availability Status</h4>
                        <div className="flex gap-4">
                            <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.status === 'Available' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                <input type="radio" name="status" value="Available" checked={formData.status === 'Available'} onChange={() => setFormData({ ...formData, status: 'Available', borrower_name: '' })} className="hidden" />
                                <CheckCircle className="w-4 h-4" /> Available
                            </label>
                            <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.status === 'Borrowed' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                <input type="radio" name="status" value="Borrowed" checked={formData.status === 'Borrowed'} onChange={() => setFormData({ ...formData, status: 'Borrowed' })} className="hidden" />
                                <XCircle className="w-4 h-4" /> Borrowed
                            </label>
                        </div>
                    </div>

                    {formData.status === 'Borrowed' && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Borrower Name</label>
                            <input required type="text" value={formData.borrower_name} onChange={e => setFormData({ ...formData, borrower_name: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Student or Teacher Name" />
                        </div>
                    )}

                    <div className="pt-4 flex gap-3 justify-end">
                        <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-500/20">{editingId ? 'Update Book' : 'Add Book'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Library;
