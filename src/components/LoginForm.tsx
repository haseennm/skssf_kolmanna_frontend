import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/useAuthStore";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { loginUser, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();

    const success = await loginUser(data);

    if (success) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <section
      className="
    w-full
    rounded-3xl
    border
    border-slate-200
    bg-white
    p-8
    shadow-xl
    shadow-slate-200/40
    transition-all
    dark:border-slate-700
    dark:bg-slate-900
    dark:shadow-black/30
  "
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/40">
          <Lock className="h-8 w-8 text-primary-600 dark:text-primary-300" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome Back
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Sign in to continue to your account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6"
      >
        {/* Error */}
        {error && (
          <div
            className="
          flex
          items-center
          justify-between
          rounded-xl
          border
          border-red-200
          bg-red-50
          px-4
          py-3
          text-sm
          text-red-700
          dark:border-red-900
          dark:bg-red-950/40
          dark:text-red-300
        "
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={clearError}
              className="font-bold hover:text-red-500"
            >
              ×
            </button>
          </div>
        )}

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Username
          </label>

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              disabled={isLoading || isSubmitting}
              {...register("username")}
              className={`
            w-full rounded-xl border  bg-white py-3 pl-12 pr-4 text-slate-900 outline-none transition-all dark:border-slate-700
            dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 focus:dark:bg-last-800
            ${errors.username
                  ? "border-red-500 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900/40"
                  : "border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/40"
                }
          `}
            />
          </div>

          {errors.username && (
            <p className="mt-2 text-sm text-red-500">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Password
          </label>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading || isSubmitting}
              {...register("password")}
              className={`
            w-full
            rounded-xl
            border
            bg-white
            py-3
            pl-12
            pr-12
            text-slate-900
            outline-none
            transition-all

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-white
            dark:placeholder:text-slate-400

            ${errors.password
                  ? "border-red-500 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900/40"
                  : "border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/40"
                }
          `}
            />

            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-slate-400
            transition
            hover:text-primary-600
            dark:hover:text-primary-400
          "
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-2 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={!isValid || isLoading || isSubmitting}
          className="
        w-full
        rounded-xl
        bg-primary-600
        py-3.5
        font-semibold
        text-white
        shadow-lg
        shadow-primary-600/20
        transition-all

        hover:bg-primary-700
        hover:shadow-primary-600/40

        disabled:cursor-not-allowed
        disabled:bg-slate-400
        disabled:shadow-none
      "
        >
          {isLoading || isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </section>
  );
};