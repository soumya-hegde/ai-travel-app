import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Profile() {
  const [form, setForm] = useState({ username: "", email: "", _id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get("/users/account");
        setForm({
          username: res.data.username || "",
          email: res.data.email || "",
          _id: res.data._id || "",
        });
      } catch (err) {
        setMessage(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      await API.put(`/users/${form._id}`, {
        username: form.username,
        email: form.email,
      });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading profile…</div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500">Update your account details</p>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {message && (
            <div className="rounded-md bg-green-100 px-3 py-2 text-green-700 text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
