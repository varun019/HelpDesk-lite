import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Headset, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "@/utils/apiError";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof schema>;

export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (values: LoginForm) => {
    try {
      setSubmitting(true);
      await login(values);
      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Login failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-[#eaf8f6] p-12 lg:flex">
        <div className="flex items-center gap-3 text-2xl font-bold text-teal-700">
          <Headset size={30} /> SupportDesk
        </div>
        <div className="max-w-lg">
          <div className="mb-5 inline-flex rounded-xl bg-white p-4 text-teal-600 shadow-sm">
            <Headset size={35} />
          </div>
          <h1 className="text-4xl font-bold leading-tight text-slate-800">
            Support that keeps your team moving.
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Create tickets, track progress and collaborate with your support team
            from one simple workspace.
          </p>
        </div>
        <p className="text-sm text-slate-500">Internal Support Ticket System</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-9 flex items-center gap-2 text-xl font-bold text-teal-700 lg:hidden">
            <Headset /> SupportDesk
          </div>

          <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your support workspace.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@company.com"
                  className="h-12 w-full rounded-lg border border-slate-200 pl-10 pr-4 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-lg border border-slate-200 pl-10 pr-4 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
            >
              {submitting && <LoaderCircle className="animate-spin" size={18} />}
              Sign in
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-teal-700 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}