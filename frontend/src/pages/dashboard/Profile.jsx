import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import API from "../../api/axios";
import { updateUserInfo } from "../../slices/authSlice";

export default function Profile() {
  const [form, setForm] = useState({ username: "", email: "", _id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  const [passForm, setPassForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passMessage, setPassMessage] = useState("");
  const [passSaving, setPassSaving] = useState(false);

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

      // Update Redux state immediately
      dispatch(updateUserInfo({ username: form.username, email: form.email }));

      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setPassSaving(true);
      setPassMessage("");
      await API.put(`/update-password/${form._id}`, passForm);
      setPassMessage("Password updated successfully.");
      setPassForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setPassMessage(err.response?.data?.message || err.message);
    } finally {
      setPassSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading profile...</div>
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

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-900">
              Update Password
            </h3>

            <div className="mt-3 space-y-3">
              <div className="relative">
                <input
                  type={showOld ? "text" : "password"}
                  placeholder="Old Password"
                  value={passForm.oldPassword}
                  onChange={(e) =>
                    setPassForm((p) => ({ ...p, oldPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-20 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowOld((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-700"
                >
                  {showOld ? "Hide" : "Show"}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="New Password"
                  value={passForm.newPassword}
                  onChange={(e) =>
                    setPassForm((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-20 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-700"
                >
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>

              <button
                onClick={handlePasswordUpdate}
                disabled={
                  passSaving || !passForm.oldPassword || !passForm.newPassword
                }
                className="w-full rounded-lg bg-slate-900 py-2 text-white font-semibold hover:bg-black disabled:bg-gray-300"
              >
                {passSaving ? "Updating..." : "Update Password"}
              </button>

              {passMessage && (
                <div className="rounded-md bg-blue-50 px-3 py-2 text-blue-700 text-sm">
                  {passMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
