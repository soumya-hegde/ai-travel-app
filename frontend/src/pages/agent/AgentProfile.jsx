import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AgentProfile() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    agencyName: "",
    phone: "",
    address: "",
    _id: "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await API.get("/users/account");
      setForm(res.data);
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await API.put(`/agents/${form._id}`, form);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border shadow-sm space-y-4">
      <h2 className="text-2xl font-bold">Agent Profile</h2>
      <div className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded bg-gray-50"
          placeholder="Email"
          value={form.email}
          readOnly
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Agency Name"
          value={form.agencyName}
          onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold"
        >
          {saving ? "Saving..." : "Update Details"}
        </button>
        {message && (
          <p className="text-center text-sm text-blue-600">{message}</p>
        )}
      </div>
    </div>
  );
}
