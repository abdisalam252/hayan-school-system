import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Edit, Trash2, Eye, ArrowUpCircle } from "lucide-react";

/**
 * Reusable Action Menu Component
 * @param {Function} onEdit - Handler for edit action
 * @param {Function} onDelete - Handler for delete action
 * @param {Function} onView - Handler for view action (optional)
 */
const ActionMenu = ({ onEdit, onDelete, onView, onPromote, additionalActions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1 rounded-lg transition-colors ${isOpen ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
            >
                <MoreHorizontal className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="p-1.5 space-y-0.5">
                        {onView && (
                            <button
                                onClick={() => { onView(); setIsOpen(false); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                            >
                                <Eye className="w-4 h-4 text-gray-400" />
                                View Details
                            </button>
                        )}
                        {/* Custom Actions */}
                        {additionalActions && additionalActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => { action.onClick(); setIsOpen(false); }}
                                className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left ${action.className || 'text-gray-700 dark:text-gray-300'}`}
                            >
                                {action.icon && <action.icon className={`w-4 h-4 ${action.iconClassName || 'text-gray-400'}`} />}
                                {action.label}
                            </button>
                        ))}
                        {onEdit && (
                            <button
                                onClick={() => { onEdit(); setIsOpen(false); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                            >
                                <Edit className="w-4 h-4 text-gray-400" />
                                Edit
                            </button>
                        )}
                        {onPromote && (
                            <button
                                onClick={() => { onPromote(); setIsOpen(false); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors text-left"
                            >
                                <ArrowUpCircle className="w-4 h-4 text-brand-500" />
                                Promote
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => { onDelete(); setIsOpen(false); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionMenu;
