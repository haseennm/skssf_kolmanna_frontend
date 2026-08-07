import React, { useEffect, useState } from "react";
import { useuserStore, type User, type UserRole } from "../store/useUserStore";
import { useAuthStore } from "../store/useAuthStore";
import { User as UserIcon, Mail, Phone, MapPin, Lock, Save, X, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { checkPermission } from "../utils/checkPermission";

interface UserFormModalProps {
    open: boolean;
    editingUser: User | null;
    onClose: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
    open,
    editingUser,
    onClose,
}) => {
    const { createUser, editUser, isLoading, error } = useuserStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Form Field States
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [formError, setFormError] = useState<string | null>(null);

    const availableRoles: UserRole[] = [
        "all handle",
        "ledger handle",
        "program handle",
        "sahachari handle",
        "stock handle",
    ];

    // Auth Guard Effect
    useEffect(() => {
        if (!(checkPermission(user, ["user handle", "all handle"], navigate))) return;

    }, [user, navigate, open]);

    // Sync state with editing user or reset on open
    useEffect(() => {
        if (editingUser) {
            setName(editingUser.name || "");
            setUsername(editingUser.username || "");
            setEmail(editingUser.email || "");
            setPhoneNumber(editingUser.phone_number || "");
            setAddress(editingUser.address || "");
            setPassword(""); // Password remains empty unless changing
            setRoles(editingUser.role || []);
        } else {
            setName("");
            setUsername("");
            setEmail("");
            setPhoneNumber("");
            setAddress("");
            setPassword("");
            setRoles([]);
        }
        setFormError(null);
    }, [editingUser, open]);

    if (!open) return null;

    // Role checkbox toggle handler
    const handleRoleToggle = (roleToToggle: UserRole) => {
        if (roles.includes(roleToToggle)) {
            setRoles(roles.filter((r) => r !== roleToToggle));
        } else {
            setRoles([...roles, roleToToggle]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        if (!(await checkPermission(user, ["user handle", "all handle"], navigate))) return;

        e.preventDefault();
        setFormError(null);

        // Client-side Validations
        // Client-side Validations
        if (!name.trim()) return setFormError("Full Name is required.");
        if (!email.trim()) return setFormError("Email address is required.");
        
        // Mobile number: exactly 10 digits
        if (phoneNumber.trim() && !/^\d{10}$/.test(phoneNumber.trim())) {
            return setFormError("Mobile number must be exactly 10 digits.");
        }
        
        // Password: 6-12 characters (letters only)
        if (!editingUser) {
            if (!username.trim()) return setFormError("Username is required.");
            if (!password.trim()) {
                return setFormError("Password is required.");
            }

            if (!/^[A-Za-z0-9]{6,12}$/.test(password.trim())) {
                return setFormError(
                    "Password must be 6-12 characters and contain only letters and numbers."
                );
            }
        }

        if (roles.length === 0) {
            return setFormError("Please select at least one role.");
        }

        let success = false;

        if (editingUser) {
            success = await editUser({
                id: editingUser.id,
                name: name.trim(),
                email: email.trim(),
                phone_number: phoneNumber.trim() || undefined,
                address: address.trim() || undefined,
                role: roles,
                active_year_id: user!.active_year_id,
                action_by: user!.id,
            });
        } else {
            success = await createUser({
                name: name.trim(),
                username: username.trim(),
                email: email.trim(),
                phone_number: phoneNumber.trim() || undefined,
                address: address.trim() || undefined,
                password: password.trim(),
                role: roles,
                active_year_id: user!.active_year_id,
                action_by: user!.id,
            });
        }

        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <div className="flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">
                            {editingUser ? "Edit User Account" : "Create New User"}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {editingUser
                                ? "Update permissions and contact information for this user."
                                : "Register a new user and assign operational roles."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between overflow-y-auto">
                    <div className="space-y-4 p-6">
                        {formError && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                                {formError}
                            </div>
                        )}
                        {error && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                                {error}
                            </div>
                        )}

                        {/* Name Input */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                Full Name <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition dark:focus:bg-last-800 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                />
                            </div>
                        </div>

                        {/* Username & Email Grid */}
                        {editingUser ?
                            <></> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        Username <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="johndoe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-last-800"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-last-800 dark:text-slate-100"
                                        />
                                    </div>
                                </div>
                            </div>}

                        {/* Phone & Password Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="+91 9876543210"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-last-800"
                                    />
                                </div>
                            </div>
                            {!editingUser ?
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        Password {!editingUser && <span className="text-rose-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            placeholder={editingUser ? "Leave blank to keep current" : "••••••••"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-last-800"
                                        />
                                    </div>
                                </div> : <></>}
                        </div>

                        {/* Address */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                Residential / Work Address
                            </label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                                <textarea
                                    rows={2}
                                    placeholder="Enter address details..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-last-800 dark:text-slate-100"
                                />
                            </div>
                        </div>

                        {/* Roles Selection */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                Assigned System Roles <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {availableRoles.map((role) => {
                                    const isChecked = roles.includes(role);
                                    return (
                                        <label
                                            key={role}
                                            onClick={() => handleRoleToggle(role)}
                                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${isChecked
                                                ? "border-indigo-500 bg-indigo-50/60 dark:border-indigo-500/80 dark:bg-indigo-950/40"
                                                : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                                                }`}
                                        >
                                            <span className="text-xs font-medium capitalize text-slate-800 dark:text-slate-200">
                                                {role}
                                            </span>
                                            <ShieldCheck
                                                size={16}
                                                className={isChecked ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300 dark:text-slate-600"}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {isLoading ? "Saving..." : editingUser ? "Update User" : "Save User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};