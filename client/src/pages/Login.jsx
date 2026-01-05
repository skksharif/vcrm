import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Email is required";
    if (!password.trim()) errs.password = "Password is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);

    try {
      const user = await login(email, password);
      console.log(user);
      // redirect by role
      switch (user.role) {
        case "CEO":
          nav("/admin");
          break;
        case "TL-1":
          console.log("redirecting to tl");
          nav("/tl");
          break;
        case "TL-2":
          nav("/tl");
          break;
        case "Employee":
          nav("/employee");
          break;
        case "Social Media Manager":
          nav("/smm");
          break;
        default:
          nav("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(2,108,138,0.15) 0%, rgba(163,208,66,0.15) 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-3xl font-semibold text-gray-800">VCRM</span>
          <div className="mt-1 text-sm text-gray-500">
            Project & Client Management
          </div>
        </div>

        <form
          onSubmit={submit}
          className="bg-white shadow-lg rounded-lg p-6 sm:p-8 transition-transform transform hover:scale-[1.002]"
        >
          <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-4">
            Sign in to continue to your dashboard
          </p>

          {error && (
            <div
              className="mb-4 px-3 py-2 bg-red-50 border border-red-100 text-red-700 rounded"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email or Username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                  fieldErrors.email
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-200 focus:ring-primary"
                }`}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                    fieldErrors.password
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-200 focus:ring-primary"
                  }`}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4.03 3.97a.75.75 0 10-1.06 1.06l1.41 1.41A9.21 9.21 0 001 10c2.5 4 6.5 6 9 6 1.1 0 2.09-.24 2.9-.66l2.12 2.12a.75.75 0 101.06-1.06L4.03 3.97zM7.02 8.05a3 3 0 104.24 4.24L7.02 8.05z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 3C6 3 2.73 5.11 1 9c1.73 3.89 5 6 9 6s7.27-2.11 9-6c-1.73-3.89-5-6-9-6zm0 10a4 4 0 110-8 4 4 0 010 8z" />
                      <path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-sm text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-white font-medium transition ${loading ? 'opacity-70 cursor-not-allowed' : 'bg-[#026c8a] hover:bg-[#025f78] focus:outline-none focus:ring-2 focus:ring-[#026c8a]'}`}
              >
                {loading && (
                  <svg
                    className="h-5 w-5 mr-2 animate-spin text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                )}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <span className="font-medium text-primary">Contact admin</span>
        </p>
      </div>
    </div>
  );
}
