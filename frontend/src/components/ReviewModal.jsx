import { useState } from "react";
import API from "../api/axios";
import { Star, X } from "lucide-react";
import { useAppModal } from "../hooks/useAppModal";

export default function ReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAppModal();

  const handleSubmit = async () => {
    if (!comment.trim()) {
      await showAlert({
        variant: "warning",
        title: "Comment required",
        message: "Please add a comment before submitting your review.",
      });
      return;
    }
    setLoading(true);
    try {
      await API.post("/reviews", {
        packageId: booking.packageId._id,
        bookingId: booking._id,
        rating,
        comment,
      });
      onSuccess();
      onClose();
    } catch (err) {
      await showAlert({
        variant: "error",
        title: "Review submission failed",
        message: err.response?.data?.error || "Failed to submit review.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={24} />
        </button>

        <h3 className="text-xl font-bold mb-1">Rate your trip</h3>
        <p className="text-gray-500 text-sm mb-6">
          {booking.packageId.packageName}
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)}>
              <Star
                size={32}
                fill={rating >= star ? "#f59e0b" : "none"}
                color={rating >= star ? "#f59e0b" : "#d1d5db"}
              />
            </button>
          ))}
        </div>

        <textarea
          className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 mb-4"
          placeholder="How was your experience? Tell us about the hotels, food, and guide..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-black transition disabled:bg-gray-300"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
