import React, { useState } from "react";
import { Plus, Calendar as CalendarIcon, MapPin, Clock, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "../config";
import Modal from "../components/Modal";
import ActionMenu from "../components/ActionMenu";

const MOCK_EVENTS = [
    { id: 1, title: "Parent-Teacher Conference", date: "2024-12-20", time: "09:00 AM - 12:00 PM", location: "Main Hall", type: "Meeting", status: "Upcoming" },
    { id: 2, title: "Winter Sports Day", date: "2024-12-22", time: "08:00 AM - 04:00 PM", location: "Sports Ground", type: "Sports", status: "Upcoming" },
    { id: 3, title: "Final Exams Start", date: "2025-01-05", time: "08:00 AM", location: "All Classrooms", type: "Academic", status: "Scheduled" },
    { id: 4, title: "Staff Development Workshop", date: "2024-12-25", time: "10:00 AM - 02:00 PM", location: "Conference Room B", type: "Workshop", status: "Upcoming" },
];

const Events = () => {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: "", date: "", time: "", location: "", type: "Meeting", status: "Upcoming", notes: "" });
    const API_URL = `${API_BASE_URL}/api/events`;

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    // Rate limit ref
    const isFetching = React.useRef(false);

    const [editingId, setEditingId] = useState(null);



    const [activeTab, setActiveTab] = useState("Upcoming"); // 'Upcoming' | 'Reports'

    // Status Options
    const STATUS_OPTIONS = ["Upcoming", "Completed", "Cancelled"];

    React.useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        if (isFetching.current) return;
        isFetching.current = true;
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (e) { console.error(e); }
        finally { isFetching.current = false; }
    };

    const handleSaveEvent = async (e) => {
        e.preventDefault();
        console.log("Submitting event data:", formData);
        try {
            const method = editingId ? "PUT" : "POST";
            const url = editingId ? `${API_URL}/${editingId}` : API_URL;

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                console.log("Event saved successfully.");
                fetchEvents();
                closeModal();
            } else {
                const errData = await res.json();
                console.error("Failed to save event:", errData);
                alert(`Error: ${errData.error || "Failed to save event"}`);
            }
        } catch (e) {
            console.error("Network or logic error:", e);
            alert("Unexpected error occurred while saving the event.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this event?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (res.ok) fetchEvents();
        } catch (e) { console.error(e); }
    };

    const openEdit = (event) => {
        setEditingId(event.id);
        setFormData({
            title: event.title,
            date: event.date.split('T')[0], // Ensure date format matches input type="date"
            time: event.time,
            location: event.location,
            type: event.type,
            status: event.status || "Upcoming",
            notes: event.notes || ""
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ title: "", date: "", time: "", location: "", type: "Meeting", status: "Upcoming", notes: "" });
    };

    // Calendar Logic
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const getEventsForDay = (day) => {
        return events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const filteredEvents = events.filter(ev => {
        const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ev.type.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === "Reports") {
            return matchesSearch && ev.status === "Completed";
        }
        // Upcoming tab shows everything NOT completed (Upcoming, Scheduled, etc.)
        return matchesSearch && ev.status !== "Completed";
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Events & Reports</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage academic calendar and view meeting reports.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
                >
                    <Plus className="w-5 h-5" />
                    New Event
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                {["Upcoming", "Reports"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Events List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search Bar */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={activeTab === 'Reports' ? "Search reports..." : "Search events..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredEvents.length > 0 ? filteredEvents.map((event) => (
                            <div key={event.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-4 hover:shadow-md transition-all group">
                                <div className={`w-full sm:w-20 h-20 rounded-xl flex flex-col items-center justify-center border flex-shrink-0
                                    ${event.status === 'Completed'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50'
                                        : 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-brand-100 dark:border-brand-800/50'}`}>
                                    <span className="text-xs font-bold uppercase tracking-wider">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-2xl font-bold">{new Date(event.date).getDate()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">{event.title}</h3>
                                        <ActionMenu
                                            onEdit={() => openEdit(event)}
                                            onDelete={() => handleDelete(event.id)}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {event.time}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {event.location}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                                            {event.type}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${event.status === 'Upcoming' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                            event.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                            {event.status || 'Upcoming'}
                                        </span>
                                    </div>

                                    {/* Display Notes if in Reports Tab or if checked */}
                                    {event.notes && (
                                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Meeting Notes / Outcome:</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                                                {event.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500">
                                {activeTab === 'Reports' ? "No completed events or reports found." : "No upcoming events found. Create one!"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Functional Calendar Widget */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{monthName}</h3>
                            <div className="flex gap-1">
                                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                <div key={i}>{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center text-sm">
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                const hasEvents = getEventsForDay(day).length > 0;
                                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                                return (
                                    <div key={day} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all relative ${isToday
                                        ? 'bg-brand-600 text-white font-bold shadow-md'
                                        : hasEvents
                                            ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-bold'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}>
                                        {day}
                                        {hasEvents && !isToday && <div className="absolute bottom-1 w-1 h-1 bg-brand-500 rounded-full"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/30">
                        <h3 className="text-lg font-bold mb-2">Upcoming Holiday</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                <CalendarIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-white/90">Winter Break</p>
                                <p className="text-sm text-white/70">Dec 20 - Jan 5</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">School will be closed for winter holidays. Make sure to submit all grades before the break starts.</p>
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId ? "Edit Event & Notes" : "Create New Event"}
            >
                <form onSubmit={handleSaveEvent} className="space-y-4">
                    {/* ... Inputs ... */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Event Title</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20" placeholder="e.g. Staff Meeting" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
                            <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Time</label>
                            <input required type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Location</label>
                        <input required type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g. Main Hall" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Event Type</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                                <option>Meeting</option>
                                <option>Sports</option>
                                <option>Academic</option>
                                <option>Workshop</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                            <span>Meeting Notes / Outcome</span>
                        </label>
                        <textarea
                            rows="4"
                            value={formData.notes || ""}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-2 mt-1 border rounded-xl outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 resize-none"
                            placeholder="Write the meeting minutes, decisions, or results here..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-500/20">
                            {editingId ? "Update Event" : "Create Event"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Events;
