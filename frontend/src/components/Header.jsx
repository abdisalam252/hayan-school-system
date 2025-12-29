import React from "react";
import { Bell, User, UserPlus, DollarSign, Calendar, LogOut, RotateCw, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const Header = ({ toggleSidebar }) => {
    const location = useLocation();
    const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';
    const navigate = useNavigate();

    // User State
    const [user, setUser] = React.useState({ name: "Admin User", role: "Administrator" });

    // Notification State
    const [showNotifications, setShowNotifications] = React.useState(false);
    const notificationRef = React.useRef(null);
    const [notifications, setNotifications] = React.useState([]);

    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/notifications`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setNotifications(data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications");
            }
        };

        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        // Load User Info
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser({
                    name: parsedUser.name || "Admin User",
                    role: parsedUser.role || "Administrator"
                });
            } catch (e) {
                console.error("Failed to parse user data");
            }
        }
    }, []); // Removed isDashboard dependency

    // Click Outside listener
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const quickActions = [
        { label: "New Student", icon: UserPlus, path: "/students", onClick: () => navigate('/students') },
        { label: "Payment", icon: DollarSign, path: "/finance", onClick: () => navigate('/finance') },
        { label: "Attendance", icon: Calendar, path: "/attendance", onClick: () => navigate('/attendance') },
    ];

    return (
        <header className={`h-20 glass mb-6 rounded-2xl sticky top-4 md:top-8 z-40 px-4 md:px-8 flex items-center justify-between transition-all duration-300 mx-4 md:mx-8 mt-4 md:mt-5 overflow-hidden !bg-white/40 dark:!bg-gray-900/40`}>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden p-2 mr-2 text-gray-600 dark:text-gray-300 hover:bg-white/50 rounded-lg"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Quick Actions Toolbar */}
            <div className="flex items-center gap-3 flex-1 relative z-10">
                <div className="hidden md:flex items-center bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-white/20 backdrop-blur-sm shadow-sm">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all hover:shadow-sm"
                        >
                            <action.icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-6 relative z-10">
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => window.location.reload()}
                        className="relative p-3 rounded-xl transition-all duration-300 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-black/20 mr-2"
                        title="Refresh"
                    >
                        <RotateCw className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-3 rounded-xl transition-all duration-300 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-black/20`}
                    >
                        <Bell className="w-6 h-6" />
                        {/* Debug Indicator */}
                        {notifications.length > 0 && notifications.filter(n => !n.is_read).length > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-1 rounded-full">
                                    {notifications.filter(n => !n.is_read).length} New
                                </span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        No notifications
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-50 dark:border-gray-700/50 last:border-0 transition-colors ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                            onClick={async () => {
                                                if (!notif.is_read) {
                                                    try {
                                                        await fetch(`${API_BASE_URL}/notifications/${notif.id}/read`, { method: 'PUT' });
                                                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                                                    } catch (e) {
                                                        console.error("Failed to mark as read");
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="flex gap-3 cursor-pointer">
                                                <div className={`w-2 h-2 mt-1.5 rounded-full ${notif.type === 'warning' ? 'bg-amber-500' : notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                                <div>
                                                    <p className={`text-sm ${!notif.is_read ? 'font-bold' : 'font-semibold'} text-gray-800 dark:text-gray-200`}>{notif.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 text-center">
                                <button
                                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                                    onClick={async () => {
                                        try {
                                            await fetch(`${API_BASE_URL}/notifications/read-all`, { method: 'PUT' });
                                            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                                        } catch (e) {
                                            console.error("Failed to mark all as read");
                                        }
                                    }}
                                >
                                    Mark all as read
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`flex items-center gap-3 pl-6 border-l border-gray-300/50 dark:border-gray-600/50`}>
                    <div className="text-right hidden sm:block">
                        <p className={`text-sm font-bold text-gray-800 dark:text-white`}>{user.name}</p>
                        <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5 bg-brand-500/10 text-brand-700 dark:text-brand-300`}>{user.role}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900 dark:to-brand-800 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-700/50 shadow-sm transition-transform hover:scale-105 cursor-pointer">
                        <User className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
