import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-screen overflow-hidden transition-colors duration-200 bg-gray-50 dark:bg-gray-950 font-sans">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 md:ml-52 ml-0 h-screen overflow-hidden relative transition-all duration-300">
                {/* Background Blobs for Glassmorphism */}
                <div className="absolute top-0 left-0 w-full h-96 bg-brand-500/10 dark:bg-brand-500/5 blur-3xl -z-10 rounded-full transform -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-full h-96 bg-accent-500/10 dark:bg-accent-500/5 blur-3xl -z-10 rounded-full transform translate-y-1/2"></div>

                <Header toggleSidebar={() => setIsSidebarOpen(true)} />
                <main className="flex-1 px-4 md:px-8 pb-8 overflow-y-auto scrollbar-hide">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
