import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [isAgent, setIsAgent] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    agencyName: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const err = {};

    if (!form.username) err.username = "Username required";
    if (!form.email) err.email = "Email required";
    if (!form.phone) err.phone = "Phone required";

    if (isAgent) {
      if (!form.agencyName) err.agencyName = "Agency required";
      if (!form.address) err.address = "Address required";
    }

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    setErrors(err);

    if (Object.keys(err).length > 0) return;

    try {
      const endpoint = isAgent ? "/agents/register" : "/users/register";

      await API.post(endpoint, form);

      navigate("/login");
    } catch (error) {
      setServerError(error?.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e')",
      }}
    >
      <div className="backdrop-blur-lg bg-white/20 p-8 rounded-2xl shadow-2xl w-[420px] border border-white/30">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create Account 🌍
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Username"
            className="w-full p-3 rounded-lg bg-white/80"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          {errors.username && (
            <p className="text-red-300 text-sm">{errors.username}</p>
          )}

          <input
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-white/80"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && (
            <p className="text-red-300 text-sm">{errors.email}</p>
          )}

          <input
            placeholder="Phone"
            className="w-full p-3 rounded-lg bg-white/80"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {errors.phone && (
            <p className="text-red-300 text-sm">{errors.phone}</p>
          )}

          {/* AGENT EXTRA */}
          {isAgent && (
            <>
              <input
                placeholder="Agency Name"
                className="w-full p-3 rounded-lg bg-white/80"
                onChange={(e) =>
                  setForm({
                    ...form,
                    agencyName: e.target.value,
                  })
                }
              />
              {errors.agencyName && (
                <p className="text-red-300 text-sm">{errors.agencyName}</p>
              )}

              <textarea
                placeholder="Address"
                className="w-full p-3 rounded-lg bg-white/80"
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
              />
              {errors.address && (
                <p className="text-red-300 text-sm">{errors.address}</p>
              )}
            </>
          )}

          {/* TOGGLE */}
          <button
            type="button"
            onClick={() => setIsAgent(!isAgent)}
            className="text-white text-sm underline  hover:text-black"
          >
            {isAgent ? "Register as User" : "Are you an agent? Register here"}
          </button>

          {serverError && (
            <p className="text-red-300 text-center text-sm">{serverError}</p>
          )}

          <button className="w-full bg-blue-950 text-white py-3 rounded-lg font-semibold hover:bg-black">
            Register
          </button>
        </form>

        <p className="text-white text-sm text-center mt-4  hover:text-black">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
