import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Headset, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "@/utils/apiError";

const schema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof schema>;

export default function Register() {
  const { register: registerUser, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async ({ name, email, password }: RegisterForm) => {
    try {
      setSubmitting(true);
      await registerUser({ name, email, password });
      toast.success("Account created successfully!");
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Registration failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { name: "name" as const, label: "Full name", type: "text", placeholder: "Your name" },
    { name: "email" as const, label: "Email address", type: "email", placeholder: "you@company.com" },
    { name: "password" as const, label: "Password", type: "password", placeholder: "Minimum 8 characters" },
    { name: "confirmPassword" as const, label: "Confirm password", type: "password", placeholder: "Re-enter password" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7faf9] px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <Headset size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Join your team's support workspace.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {field.label}
              </label>
              <input
                {...register(field.name)}
                type={field.type}
                placeholder={field.placeholder}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-600">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}

          <button
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting && <LoaderCircle className="animate-spin" size={18} />}
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-teal-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}