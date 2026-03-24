import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../slices/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

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

    if (Object.keys(err).length > 0) return;

    dispatch(loginUser(form))
      .unwrap()
      .then((res) => {
        if (res.role === "agent") navigate("/agent-dashboard");
        else navigate("/dashboard");
      })
      .catch((err) => {
        setServerError(err?.error || "Login failed");
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
          Welcome Back ✈️
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && (
              <p className="text-red-300 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && (
              <p className="text-red-300 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {serverError && (
            <p className="text-red-300 text-center text-sm">{serverError}</p>
          )}

          {/* BUTTON */}
          <button className="w-full bg-blue-950 text-white py-2 rounded-lg font-semibold hover:bg-black">
            Login
          </button>
        </form>

        {/* REGISTER LINK */}
        <p className="text-white text-sm text-center mt-4  hover:text-black">
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
