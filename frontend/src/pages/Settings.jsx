import React, { useState } from "react";
import { User, Bell, Lock, Palette, Moon, Sun, Database, Download, Upload, AlertTriangle, DollarSign } from "lucide-react";
import { API_BASE_URL } from "../config";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
    const [activeTab, setActiveTab] = useState("appearance");
    const { theme, toggleTheme } = useTheme();
    const [financeSettings, setFinanceSettings] = useState({
        REGISTRATION_FEE: "0",
        TUITION_FEE_PRIMARY: "0",
        TUITION_FEE_INTERMEDIATE: "0"
    });
    const [schoolProfile, setSchoolProfile] = useState({
        school_name: "", address: "", phone: "", email: "", website: "", motto: "", principal_name: "", established_date: "", currency: "USD"
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch settings based on active tab
    React.useEffect(() => {
        if (activeTab === 'finance') {
            fetch(`${API_BASE_URL}/api/settings`)
                .then(res => res.json())
                .then(data => {
                    if (data.REGISTRATION_FEE || data.TUITION_FEE_PRIMARY || data.TUITION_FEE_INTERMEDIATE) {
                        setFinanceSettings(prev => ({ ...prev, ...data }));
                    }
                })
                .catch(err => console.error("Failed to fetch settings:", err));
        } else if (activeTab === 'school_profile') {
            fetch(`${API_BASE_URL}/api/school-profile`)
                .then(res => res.json())
                .then(data => {
                    if (data.school_name) {
                        setSchoolProfile(data);
                        if (data.logo_url) setLogoPreview(`${API_BASE_URL}${data.logo_url}`);
                    }
                })
                .catch(err => console.error("Failed to fetch profile:", err));
        }
    }, [activeTab]);

    const handleFinanceSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/settings/batch`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(financeSettings)
            });
            if (response.ok) {
                alert("Finance settings saved successfully!");
            } else {
                alert("Failed to save settings.");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Error saving settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            Object.keys(schoolProfile).forEach(key => formData.append(key, schoolProfile[key]));
            if (logoFile) formData.append('logo', logoFile);
            if (schoolProfile.bannerFile_1) formData.append('banner1', schoolProfile.bannerFile_1);
            if (schoolProfile.bannerFile_2) formData.append('banner2', schoolProfile.bannerFile_2);
            if (schoolProfile.bannerFile_3) formData.append('banner3', schoolProfile.bannerFile_3);

            const res = await fetch(`${API_BASE_URL}/api/school-profile`, {
                method: 'PUT',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setSchoolProfile(data);
                if (data.logo_url) setLogoPreview(`${API_BASE_URL}${data.logo_url}`);
                alert("School profile updated successfully!");
            } else {
                alert("Failed to update profile.");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and system settings.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden min-h-[500px] flex flex-col md:flex-row">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 border-r border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 p-4 space-y-2">
                    <button onClick={() => setActiveTab("appearance")} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'appearance' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-700 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>
                        <Palette className="w-5 h-5" />
                        Appearance
                    </button>
                    <button onClick={() => setActiveTab("finance")} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'finance' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-700 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>
                        <DollarSign className="w-5 h-5" />
                        Finance Defaults
                    </button>
                    <button onClick={() => setActiveTab("school_profile")} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'school_profile' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-700 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>
                        <div className="w-5 h-5 flex items-center justify-center font-bold border border-current rounded-full text-xs">S</div>
                        School Profile
                    </button>
                    <button onClick={() => setActiveTab("profile")} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-700 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>
                        <User className="w-5 h-5" />
                        Profile Settings
                    </button>
                    <button onClick={() => setActiveTab("notifications")} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'notifications' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-700 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>
                        <Bell className="w-5 h-5" />
                        Notifications
                    </button>
                    <button onClick={() => setActiveTab("security")} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-700 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>
                        <Lock className="w-5 h-5" />
                        Security
                    </button>
                    <button onClick={() => setActiveTab("data")} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'data' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-700 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>
                        <Database className="w-5 h-5" />
                        Data Management
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8">
                    {activeTab === 'appearance' && (
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Theme Preferences</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Choose how the application looks to you.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
                                            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{theme === 'dark' ? 'On' : 'Off'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-brand-600' : 'bg-gray-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'finance' && (
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Finance Defaults</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Set default charging amounts for system operations.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Default Registration Fee ($)</label>
                                    <input
                                        type="number"
                                        value={financeSettings.REGISTRATION_FEE}
                                        onChange={(e) => setFinanceSettings({ ...financeSettings, REGISTRATION_FEE: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-gray-500">Auto-filled amount when registering a new student.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Primary Tuition Fee (Grades 1-6) ($)</label>
                                    <input
                                        type="number"
                                        value={financeSettings.TUITION_FEE_PRIMARY}
                                        onChange={(e) => setFinanceSettings({ ...financeSettings, TUITION_FEE_PRIMARY: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-gray-500">Monthly tuition for lower grades.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Intermediate Tuition Fee (Grades 7+) ($)</label>
                                    <input
                                        type="number"
                                        value={financeSettings.TUITION_FEE_INTERMEDIATE}
                                        onChange={(e) => setFinanceSettings({ ...financeSettings, TUITION_FEE_INTERMEDIATE: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-gray-500">Monthly tuition for higher grades.</p>
                                </div>
                                <button
                                    onClick={handleFinanceSave}
                                    disabled={isSaving}
                                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <DollarSign className="w-4 h-4" />
                                            Save Finance Defaults
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'school_profile' && (
                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">School Profile</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage school identity and contact information.</p>
                            </div>

                            <form onSubmit={handleProfileSave} className="space-y-8">
                                <div className="bg-gradient-to-r from-brand-50 to-transparent dark:from-brand-900/10 p-6 rounded-2xl border border-brand-100 dark:border-brand-900/20">
                                    <div className="flex items-center gap-8">
                                        <div className="relative group">
                                            <div className="w-28 h-28 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl transition-transform group-hover:scale-105">
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center text-gray-400">
                                                        <Upload className="w-8 h-8 mb-1" />
                                                        <span className="text-[10px] uppercase font-bold tracking-wider">Upload</span>
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                                <Upload className="w-8 h-8 text-white drop-shadow-md" />
                                                <input type="file" onChange={handleLogoChange} className="hidden" accept="image/*" />
                                            </label>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">School Logo</h4>
                                            <p className="text-sm text-gray-500 mb-4 max-w-xs">
                                                Upload your school's official emblem. Recommended size: 200x200px.
                                            </p>
                                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors shadow-sm">
                                                <Upload className="w-4 h-4" />
                                                Choose Image
                                                <input type="file" onChange={handleLogoChange} className="hidden" accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">School Name</label>
                                        <div className="relative">
                                            <input required type="text" value={schoolProfile.school_name} onChange={(e) => setSchoolProfile({ ...schoolProfile, school_name: e.target.value })} className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400" placeholder="e.g. Hayan Academy" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Currency</label>
                                        <div className="relative">
                                            <select
                                                value={schoolProfile.currency || 'USD'}
                                                onChange={(e) => setSchoolProfile({ ...schoolProfile, currency: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white appearance-none cursor-pointer"
                                            >
                                                <option value="USD">US Dollar ($)</option>
                                                <option value="ETB">Ethiopian Birr (ETB)</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                                                <DollarSign className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Principal Name</label>
                                        <input type="text" value={schoolProfile.principal_name} onChange={(e) => setSchoolProfile({ ...schoolProfile, principal_name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400" placeholder="Full Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Phone Number</label>
                                        <input type="text" value={schoolProfile.phone} onChange={(e) => setSchoolProfile({ ...schoolProfile, phone: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                                        <input type="email" value={schoolProfile.email} onChange={(e) => setSchoolProfile({ ...schoolProfile, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Address</label>
                                        <input type="text" value={schoolProfile.address} onChange={(e) => setSchoolProfile({ ...schoolProfile, address: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Website</label>
                                        <input type="text" value={schoolProfile.website} onChange={(e) => setSchoolProfile({ ...schoolProfile, website: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400" placeholder="https://" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Established Date</label>
                                        <input type="date" value={schoolProfile.established_date ? schoolProfile.established_date.split('T')[0] : ''} onChange={(e) => setSchoolProfile({ ...schoolProfile, established_date: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Motto / Tagline</label>
                                        <input type="text" value={schoolProfile.motto} onChange={(e) => setSchoolProfile({ ...schoolProfile, motto: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400" placeholder="e.g. Excellence in Education" />
                                    </div>
                                </div>

                                {/* Banner Upload Section */}
                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="font-bold text-gray-900 dark:text-white">Dashboard Banners</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[1, 2, 3].map((num) => (
                                            <div key={num} className="space-y-2">
                                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Banner {num}</label>
                                                <div className="relative group aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                    {schoolProfile[`banner_${num}`] ? (
                                                        <img
                                                            src={schoolProfile[`banner_${num}`]?.startsWith('blob') ? schoolProfile[`banner_${num}`] : `${API_BASE_URL}${schoolProfile[`banner_${num}`]}`}
                                                            alt={`Banner ${num}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-full h-full text-gray-400">
                                                            <Upload className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium">
                                                        Change
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    setSchoolProfile(prev => ({
                                                                        ...prev,
                                                                        [`banner_${num}`]: URL.createObjectURL(file), // Preview
                                                                        [`bannerFile_${num}`]: file // File to upload
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving Changes...
                                            </>
                                        ) : (
                                            <>
                                                <span>Save School Profile</span>
                                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Information</h3>
                            <p className="text-gray-500 dark:text-gray-400">Update your account details here.</p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</label>
                                    <input type="text" defaultValue="Admin" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
                                    <input type="text" defaultValue="User" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                                    <input type="email" defaultValue="admin@hayan.edu" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bio</label>
                                    <textarea rows="4" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" defaultValue="School administrator with access to all modules."></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Notification Preferences</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage how you receive alerts.</p>
                            </div>
                            <div className="space-y-4">
                                {['Email Notifications', 'SMS Alerts', 'Daily Summary', 'Event Reminders'].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                                        <span className="font-medium text-gray-900 dark:text-white">{item}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={idx % 2 === 0} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Security Settings</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Keep your account secure.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-500/20">
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Data Management</h3>
                                <p className="text-gray-500 dark:text-gray-400">Securely backup your system data or restore from a previous point.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Backup Section */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Database className="w-32 h-32 text-blue-500" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                                            <Download className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Export Backup</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                            Create a full JSON backup of all students, teachers, finance records, and system settings.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => window.open(`${API_BASE_URL}/api/backup/export`, '_blank')}
                                        className="relative z-10 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Backup File
                                    </button>
                                </div>

                                {/* Restore Section */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col">
                                    <div className="mb-4">
                                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Import & Restore</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Upload a backup file to restore system data. <span className="text-amber-600 font-medium">This wipes current data.</span>
                                        </p>
                                    </div>

                                    <div className="flex-1">
                                        <RestoreZone />
                                    </div>
                                </div>

                                {/* Reset Finance Section */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-1">
                                    <div>
                                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Reset Finance Data</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                            Permanently delete all invoices, payments, and expense records. This action cannot be undone.
                                        </p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm("Are you sure you want to delete ALL finance records? This cannot be undone!")) {
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/finance/reset-all`, { method: 'DELETE' });
                                                    if (res.ok) {
                                                        alert("Finance data cleared successfully.");
                                                        window.location.reload();
                                                    } else {
                                                        alert("Failed to clear data.");
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Error connecting to server.");
                                                }
                                            }
                                        }}
                                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        Reset Finance Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RestoreZone = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [analysis, setAnalysis] = useState(null); // { tables: { name: count }, originalData: json }
    const [selectedTables, setSelectedTables] = useState({});
    const [status, setStatus] = useState('idle'); // idle, analyzing, ready, uploading, success, error
    const [message, setMessage] = useState('');

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            setStatus('error');
            setMessage('Only JSON backup files are accepted.');
            return;
        }

        setStatus('analyzing');
        setFile(file);

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target.result);
                if (!json.tables || !json.metadata) throw new Error("Invalid backup format");

                // Analyze content
                const stats = {};
                const initialSelection = {};
                Object.keys(json.tables).forEach(key => {
                    stats[key] = json.tables[key].length;
                    initialSelection[key] = true; // Default to all selected
                });

                setAnalysis({ stats, originalData: json });
                setSelectedTables(initialSelection);
                setStatus('ready');
                setMessage(`Found ${Object.keys(stats).length} categories in backup.`);

            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage("Failed to parse backup file.");
            }
        };
        reader.readAsText(file);
    };

    const toggleTable = (table) => {
        setSelectedTables(prev => ({ ...prev, [table]: !prev[table] }));
    };

    const handleRestore = async () => {
        if (!analysis) return;

        // Filter data based on selection
        const tablesToRestore = {};
        Object.keys(selectedTables).forEach(key => {
            if (selectedTables[key]) {
                tablesToRestore[key] = analysis.originalData.tables[key];
            }
        });

        if (Object.keys(tablesToRestore).length === 0) {
            setStatus('error');
            setMessage("Please select at least one item to restore.");
            return;
        }

        setStatus('uploading');
        try {
            const res = await fetch(`${API_BASE_URL}/api/backup/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tables: tablesToRestore })
            });

            if (res.ok) {
                setStatus('success');
                setMessage('Selected data restored successfully! Reloading...');
                setTimeout(() => window.location.reload(), 2000);
            } else {
                const err = await res.json();
                throw new Error(err.error || "Server rejected restore");
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage(err.message || 'Restoration failed.');
        }
    };

    const reset = () => {
        setFile(null);
        setAnalysis(null);
        setStatus('idle');
        setMessage('');
    };

    return (
        <div className="h-full flex flex-col">
            {status === 'idle' || status === 'error' ? (
                <div
                    className={`relative flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all ${dragActive ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleChange} accept=".json" />

                    <div className="w-12 h-12 mb-3 text-gray-400">
                        <Upload className="w-full h-full" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">JSON files only</p>

                    {status === 'error' && (
                        <div className="mt-4 text-red-500 text-sm font-medium flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" /> {message}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={reset} className="text-xs text-gray-500 hover:text-red-500 transition-colors">Change File</button>
                    </div>

                    {status === 'analyzing' && (
                        <div className="flex-1 flex items-center justify-center">
                            <span className="text-sm text-gray-500 animate-pulse">Analyzing backup file...</span>
                        </div>
                    )}

                    {(status === 'ready' || status === 'uploading' || status === 'success') && analysis && (
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[200px] scrollbar-thin">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select content to restore</p>
                            {Object.keys(analysis.stats).map(table => (
                                <label key={table} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedTables[table] ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-60'}`}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedTables[table]}
                                            onChange={() => toggleTable(table)}
                                            disabled={status !== 'ready'}
                                            className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">{table}</span>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-white/50 dark:bg-black/20 rounded font-mono text-gray-600 dark:text-gray-400">
                                        {analysis.stats[table]} records
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {status === 'success' && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-lg text-center font-medium">
                    {message}
                </div>
            )}

            {(status === 'ready' || status === 'uploading') && (
                <button
                    onClick={handleRestore}
                    disabled={status === 'uploading'}
                    className={`mt-4 w-full py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                        ${status === 'uploading'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20'
                        }`}
                >
                    {status === 'uploading' ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Restore Selected Data'
                    )}
                </button>
            )}
        </div>
    );
};

export default Settings;
