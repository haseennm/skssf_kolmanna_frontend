import React, { useState } from "react";
import axios from "axios";
import {
    Mail,
    KeyRound,
    Lock,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useuserStore } from "../store/useUserStore";
import { verifyOtpUrl } from "../store/api";

type Step = "EMAIL" | "OTP" | "PASSWORD" | "SUCCESS";

export const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const { verifyUserForPassword, changePassword, isLoading, error: storeError } = useuserStore();

    // Form States
    const [step, setStep] = useState<Step>("EMAIL");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI Status States
    const [formError, setFormError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [isOtpLoading, setIsOtpLoading] = useState(false);

    // Step 1: Request OTP / Verify Email using verifyUserForPassword store action
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setInfoMessage(null);

        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            return setFormError("Please enter a valid email address.");
        }

        const success = await verifyUserForPassword({
            email: email.trim(),
        });

        if (success) {
            setInfoMessage(`Verification code sent to ${email}.`);
            setStep("OTP");
        }
    };

    // Step 2: Verify OTP via API endpoint
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!otp.trim() || otp.trim().length !== 6) {
            return setFormError("OTP must be exactly 6 digits.");
        }

        setIsOtpLoading(true);
        try {
            // Backend schema payload: { user_id, otp }
          await axios.post(verifyOtpUrl, {
                email: email,
                otp: otp.trim(),
            });

            setInfoMessage("OTP verified successfully. Please set your new password.");
            setStep("PASSWORD");
        } catch (err: any) {
            setFormError(
                err.response?.data?.error?.message || "Invalid or expired OTP. Please try again."
            );
        } finally {
            setIsOtpLoading(false);
        }
    };

    // Step 3: Change Password using changePassword store action
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!password.trim() || password.trim().length < 6) {
            return setFormError("Password must be at least 6 characters long.");
        }

        if (password !== confirmPassword) {
            return setFormError("Passwords do not match.");
        }

        const success = await changePassword({
            email: email,
            password: password.trim(),
        });

        if (success) {
            setStep("SUCCESS");
        }
    };

    const currentError = formError || storeError;
    const loading = isLoading || isOtpLoading;

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-6">
            <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">

                {/* Navigation & Header */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => {
                            if (step === "OTP") setStep("EMAIL");
                            else if (step === "PASSWORD") setStep("OTP");
                            else navigate("/login");
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <ArrowLeft size={16} />
                        {step === "SUCCESS" || step === "EMAIL" ? "Back to Login" : "Back"}
                    </button>

                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Security
                    </span>
                </div>

                {/* Dynamic Title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {step === "EMAIL" && "Forgot Password?"}
                        {step === "OTP" && "Enter Security Code"}
                        {step === "PASSWORD" && "Set New Password"}
                        {step === "SUCCESS" && "Password Reset Complete"}
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {step === "EMAIL" && "Enter your email address to receive a 6-digit verification code."}
                        {step === "OTP" && "Check your inbox for the 6-digit code sent to your account."}
                        {step === "PASSWORD" && "Choose a strong password containing at least 6 characters."}
                        {step === "SUCCESS" && "Your password has been updated. You can now log in."}
                    </p>
                </div>

                {/* Error Notification */}
                {currentError && (
                    <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{currentError}</span>
                    </div>
                )}

                {/* Info Notification */}
                {infoMessage && step !== "SUCCESS" && (
                    <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{infoMessage}</span>
                    </div>
                )}

                {/* STEP 1: EMAIL VERIFICATION */}
                {step === "EMAIL" && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                Email Address <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
                        >
                            <Send size={16} />
                            {loading ? "Verifying..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {/* STEP 2: OTP VERIFICATION */}
                {step === "OTP" && (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                6-Digit Verification OTP <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-center text-lg font-bold tracking-widest text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
                        >
                            <ShieldCheck size={16} />
                            {loading ? "Verifying Code..." : "Verify OTP"}
                        </button>
                    </form>
                )}

                {/* STEP 3: RESET PASSWORD */}
                {step === "PASSWORD" && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                New Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                Confirm New Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
                        >
                            <Lock size={16} />
                            {loading ? "Updating..." : "Reset Password"}
                        </button>
                    </form>
                )}

                {/* STEP 4: SUCCESS SCREEN */}
                {step === "SUCCESS" && (
                    <div className="space-y-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <CheckCircle2 size={32} />
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-95"
                        >
                            Proceed to Login
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};