import React, { useState, useEffect } from "react";
import { Users, GraduationCap, School, Calendar, TrendingUp, ArrowUpRight, DollarSign, Activity, Clock, MoreHorizontal } from "lucide-react";
import ActionMenu from "../components/ActionMenu";
import PaymentModal from "../components/PaymentModal";
import { useSchool } from "../context/SchoolContext";

import { API_BASE_URL } from "../config";

const StatsCard = ({ title, value, label, icon: Icon, colorFrom, colorTo, trend }) => (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
            <Icon className="w-24 h-24" />
        </div>

        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorFrom} ${colorTo} shadow-lg shadow-${colorFrom.split('-')[1]}/30`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">
                <TrendingUp className="w-3 h-3" />
                {trend}
            </div>
        </div>

        <div className="relative z-10">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{value}</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{title}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center relative z-10">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                {label}
            </span>
        </div>
    </div>
);

const RecentActivityItem = ({ title, time, type }) => (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
            type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
            {type === 'success' ? <DollarSign className="w-5 h-5" /> :
                type === 'warning' ? <Clock className="w-5 h-5" /> :
                    <Activity className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
        </div>
        <div className="p-2 rounded-full hover:bg-white dark:hover:bg-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
            <ArrowUpRight className="w-4 h-4 text-gray-400 dark:text-gray-300" />
        </div>
    </div>
);

const Dashboard = () => {
    const [counts, setCounts] = useState({ students: 0, teachers: 0, classes: 0, revenue: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [schoolName, setSchoolName] = useState("Hayan School");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, teachersRes, classesRes, financeRes, eventsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/students`).then(r => r.json()),
                    fetch(`${API_BASE_URL}/api/teachers`).then(r => r.json()),
                    fetch(`${API_BASE_URL}/api/classes`).then(r => r.json()),
                    fetch(`${API_BASE_URL}/api/finance?category=income`).then(r => r.json()),
                    fetch(`${API_BASE_URL}/api/events`).then(r => r.json())
                ]);

                const activeStudents = Array.isArray(studentsRes) ? studentsRes.filter(s => s.status !== 'Left') : [];

                const totalRevenue = Array.isArray(financeRes)
                    ? financeRes.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
                    : 0;

                setCounts({
                    students: activeStudents.length || 0,
                    teachers: teachersRes.length || 0,
                    classes: classesRes.length || 0,
                    revenue: totalRevenue
                });

                if (Array.isArray(financeRes)) {
                    const sorted = financeRes.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
                    setRecentActivity(sorted);
                }

                if (Array.isArray(eventsRes)) {
                    // Filter only upcoming and sort by date
                    const future = eventsRes.filter(e => new Date(e.date) >= new Date().setHours(0, 0, 0, 0))
                        .sort((a, b) => new Date(a.date) - new Date(b.date));
                    setUpcomingEvents(future);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchSchoolProfile = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/school-profile`);
                const data = await res.json();
                if (data.school_name) setSchoolName(data.school_name);
            } catch (error) {
                console.error("Failed to fetch school profile", error);
            }
        };

        fetchData();
        fetchSchoolProfile();
    }, []);

    const { formatCurrency } = useSchool();

    const stats = [
        { title: "Total Students", value: counts.students, label: "Registered Students", icon: Users, colorFrom: "from-blue-500", colorTo: "to-cyan-500", trend: "+12%" },
        { title: "Active Teachers", value: counts.teachers, label: "Full-time & Part-time", icon: GraduationCap, colorFrom: "from-violet-500", colorTo: "to-purple-500", trend: "+2" },
        { title: "Total Classes", value: counts.classes, label: "Active Classes", icon: School, colorFrom: "from-amber-400", colorTo: "to-orange-500", trend: "0" },
        { title: "Total Revenue", value: formatCurrency(counts.revenue), label: "Collected this year", icon: DollarSign, colorFrom: "from-emerald-400", colorTo: "to-teal-500", trend: "+8.5%" },
    ];

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Upgrade Banner - Optional Promotional Area */}
            {/* <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden hidden lg:block">
                <div className="relative z-10 max-w-xl">
                    <h1 className="text-3xl font-bold mb-2">Welcome to {schoolName}</h1>
                    <p className="text-blue-100 text-lg mb-6">Manage your school efficiently with our modern tools.</p>
                    <button className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg active:scale-95 transform duration-150">
                        View Updates
                    </button>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
            </div> */}

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">Welcome back, here's what's happening at {schoolName} today.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <DollarSign className="w-4 h-4" />
                        Record Pay
                    </button>
                    <select className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <option>This Academic Year</option>
                        <option>Last Semester</option>
                        <option>Last Year</option>
                        <option>All Time</option>
                    </select>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Upcoming Events (Moved Up) */}
                <div className="lg:col-span-2 glass-card p-6 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-brand-600" />
                            Upcoming Events
                        </h2>
                        <a href="/events" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">View All</a>
                    </div>

                    <div className="space-y-4">
                        {upcomingEvents.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p>No upcoming events scheduled.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {upcomingEvents.slice(0, 4).map(event => (
                                    <div key={event.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:shadow-sm transition-shadow">
                                        <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-gray-700 rounded-xl flex flex-col items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm">
                                            <span className="text-xs font-bold text-red-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">{new Date(event.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{event.title}</h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {event.time}
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                        {event.location}
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                ${event.type === 'Exams' ? 'bg-red-100 text-red-600' :
                                                    event.type === 'Holiday' ? 'bg-green-100 text-green-600' :
                                                        'bg-blue-100 text-blue-600'}`}>
                                                {event.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Card */}
                <div className="glass-card p-0 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Recent Activity
                        </h2>
                        <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[400px]">
                        {recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500">
                                <Clock className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
                                <p className="text-sm font-medium">No recent activity</p>
                            </div>
                        ) : (
                            recentActivity.map((activity, idx) => (
                                <RecentActivityItem
                                    key={idx}
                                    title={`Payment from ${activity.title}`}
                                    time={new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    type={activity.status === 'Paid' ? 'success' : 'warning'}
                                />
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                        <a href="/finance" className="block w-full text-center py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-sm transition-all">
                            View All Transactions
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Attendance & Calendar */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Attendance Overview (Moved Down) */}
                <div className="glass-card p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Overview</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly student attendance trends</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-1 rounded-lg border border-gray-100 dark:border-gray-700">
                            <button className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-gray-700 shadow-sm rounded-md text-gray-900 dark:text-white">Monthly</button>
                            <button className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700">Weekly</button>
                        </div>
                    </div>

                    {/* Enhanced CSS Bar Chart */}
                    <div className="h-72 flex items-end justify-between gap-3 sm:gap-4 box-border">
                        {[65, 45, 75, 55, 85, 90, 70, 60, 80, 50, 65, 75].map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end group h-full relative">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                                    {height}%
                                </div>
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500/80 to-cyan-400/80 hover:from-blue-600 hover:to-cyan-500 rounded-t-xl transition-all duration-300 relative overflow-hidden"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* X-Axis Labels */}
                    <div className="grid grid-cols-12 gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                            <div key={i} className="text-center">
                                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block">{month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* School Notice Board (Placeholder / Static for now, can be dynamic later) */}
                <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 border-amber-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-amber-600" />
                            Notice Board
                        </h2>
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="space-y-6">
                            {[
                                { title: "Staff Meeting", desc: "Mandatory meeting for all teaching staff.", time: "Tomorrow, 2:00 PM", color: "bg-blue-500" },
                                { title: "School Holiday", desc: "The school will be closed for National Day.", time: "Next Monday", color: "bg-red-500" },
                                { title: "Exam Results", desc: "Mid-term results will be published.", time: "In 3 Days", color: "bg-green-500" }
                            ].map((notice, i) => (
                                <div key={i} className="relative pl-10">
                                    <div className={`absolute left-[11px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${notice.color} z-10`}></div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{notice.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{notice.desc}</p>
                                    <span className="text-xs font-semibold text-gray-400 mt-1 block">{notice.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Shared Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                    // Update dashboard numbers
                    window.location.reload();
                }}
            />
        </div>
    );
};

export default Dashboard;
