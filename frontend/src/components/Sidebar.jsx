import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, GraduationCap, Settings, BookOpen, DollarSign, Calendar, Award, Book, Bus, FileText, UserCheck, X, Trash2 } from "lucide-react";

import { API_BASE_URL, SERVER_URL } from "../config";

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role || "Guest";
    const [schoolData, setSchoolData] = React.useState({ name: "Hayan", logo: null });

    React.useEffect(() => {
        fetch(`${API_BASE_URL}/school-profile`)
            .then(res => res.json())
            .then(data => {
                if (data.school_name) {
                    setSchoolData({
                        name: data.school_name,
                        logo: data.logo_url ? `${SERVER_URL}${data.logo_url}` : null
                    });
                }
            })
            .catch(err => console.error("Failed to fetch school info:", err));
    }, []);

    const allNavItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ["Administrator", "Admin", "Teacher", "Accountant", "Librarian", "Staff"] },
        { icon: Users, label: "Students", path: "/students", roles: ["Administrator", "Admin", "Teacher", "Accountant"] },
        { icon: GraduationCap, label: "Staff", path: "/teachers", roles: ["Administrator", "Admin"] },
        { icon: BookOpen, label: "Classes", path: "/classes", roles: ["Administrator", "Admin", "Teacher"] },
        { icon: Calendar, label: "Attendance", path: "/attendance", roles: ["Administrator", "Admin", "Teacher"] },

        { icon: Award, label: "Exams", path: "/exams", roles: ["Administrator", "Admin", "Teacher"] },
        { icon: Calendar, label: "Events", path: "/events", roles: ["Administrator", "Admin", "Teacher", "Staff"] },
        { icon: Book, label: "Library", path: "/library", roles: ["Administrator", "Admin", "Librarian", "Teacher", "Student"] },
        { icon: Bus, label: "Transport", path: "/transport", roles: ["Administrator", "Admin", "Accountant", "Transport"] },
        { icon: DollarSign, label: "Finance", path: "/finance", roles: ["Administrator", "Admin", "Accountant"] },
        { icon: FileText, label: "Reports", path: "/reports", roles: ["Administrator", "Admin", "Accountant", "Teacher"] },
        { icon: UserCheck, label: "Users", path: "/users", roles: ["Administrator", "Admin"] },
        { icon: Settings, label: "Settings", path: "/settings", roles: ["Administrator", "Admin"] },
        { icon: Trash2, label: "Recycle Bin", path: "/recycle-bin", roles: ["Administrator"] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(role));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside className={`
                fixed top-0 bottom-0 left-0 z-50 w-48 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 shadow-2xl
                md:translate-x-0 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 bg-brand-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-xl"></div>
                            <div className="relative w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl ring-1 ring-white/20 overflow-hidden">
                                {schoolData.logo ? (
                                    <img src={schoolData.logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{schoolData.name.charAt(0)}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="font-bold text-lg text-white tracking-tight block truncate" title={schoolData.name}>{schoolData.name}</span>
                            <p className="text-[10px] text-brand-400 font-medium tracking-wide uppercase">School System</p>
                        </div>
                    </div>
                    {/* Close Button for Mobile */}
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2 scrollbar-none">
                    <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Main Menu</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 768 && onClose()} // Auto-close on mobile nav
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden ${isActive
                                    ? "text-white bg-gradient-to-r from-brand-600 to-brand-500 shadow-md shadow-brand-900/20"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50 rounded-r-full"></div>}
                                    <item.icon
                                        className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-105 drop-shadow-sm' : 'group-hover:scale-105'}`}
                                    />
                                    <span className={`font-medium tracking-wide text-sm ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-brand-900/50 to-gray-800/50 border border-white/10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/20 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-brand-500/30 transition-colors"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-medium text-gray-400 mb-0.5">Logged in as</p>
                            <p className="font-bold text-sm text-white truncate">{user.name || "User"}</p>
                            <p className="text-[10px] text-brand-300 capitalize">{role}</p>
                            <button
                                onClick={handleLogout}
                                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-300 hover:text-red-200 transition-colors"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
