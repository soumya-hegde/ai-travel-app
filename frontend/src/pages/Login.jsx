import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../slices/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState([]);

  const validate = () => {
    const err = {};
    if (!form.email) err.email = "Email is required";
    if (!form.password) err.password = "Password is required";
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    setServerError([]);
    if (Object.keys(err).length > 0) return;

    dispatch(loginUser(form))
      .unwrap()
      .then((res) => {
        if (from) {
          navigate(from, { replace: true });
          return;
        }
        if (res.role === "agent") navigate("/agent-dashboard");
        else navigate("/dashboard");
      })
      .catch((err) => {
        const apiError = err?.error;

        if (Array.isArray(apiError)) {
          setServerError(apiError);
        } else if (typeof apiError === "string") {
          setServerError([apiError]);
        } else {
          setServerError(["Login failed"]);
        }
      });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470')",
      }}
    >
      <div className="backdrop-blur-lg bg-white/20 p-8 rounded-2xl shadow-2xl w-96 border border-white/30">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && (
              <p className="mt-2 rounded-md border border-red-200 bg-red-50/95 px-3 py-2 text-sm font-medium text-red-700 shadow-sm">
                {errors.email}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 pr-20 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-900"
            >
              {showPass ? "Hide" : "Show"}
            </button>
            {errors.password && (
              <p className="mt-2 rounded-md border border-red-200 bg-red-50/95 px-3 py-2 text-sm font-medium text-red-700 shadow-sm">
                {errors.password}
              </p>
            )}
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-white underline hover:text-black"
            >
              Forgot password?
            </button>
          </div>

          {serverError.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-700 shadow-sm">
              <ul className="list-disc pl-5 space-y-1">
                {serverError.map((msg, index) => (
                  <li key={index} className="font-medium">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button className="w-full bg-blue-950 text-white py-2 rounded-lg font-semibold hover:bg-black">
            Login
          </button>
        </form>

        <p className="text-white text-sm text-center mt-4 hover:text-black">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="underline cursor-pointer font-medium"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
