import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";
import { useAppModal } from "../../hooks/useAppModal";

export default function AgentEditPackage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAppModal();

  const [form, setForm] = useState({
    packageName: "",
    packageDescription: "",
    packageDestination: "",
    packageDays: "",
    packageNights: "",
    packageAccommodation: "",
    packageTransportation: "",
    packageMeals: "",
    packageActivities: "",
    packagePrice: "",
    packageDiscountPrice: "",
    packageOffer: false,
    keyAttractions: "",
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await API.get("/view-package");
        const pkg = (res.data || []).find(
          (item) => String(item._id) === String(id),
        );

        if (!pkg) {
          await showAlert({
            variant: "error",
            title: "Package not found",
            message: "The itinerary you want to edit could not be found.",
          });
          navigate("/agent-dashboard/my-packages");
          return;
        }

        if (pkg.status === "approved") {
          await showAlert({
            variant: "warning",
            title: "Editing locked",
            message:
              "Approved itineraries cannot be edited directly. Ask admin to reject or mark it for revision first.",
          });
          navigate("/agent-dashboard/my-packages");
          return;
        }

        setForm({
          packageName: pkg.packageName || "",
          packageDescription: pkg.packageDescription || "",
          packageDestination: pkg.packageDestination || "",
          packageDays: pkg.packageDays || "",
          packageNights: pkg.packageNights || "",
          packageAccommodation: pkg.packageAccommodation || "",
          packageTransportation: pkg.packageTransportation || "",
          packageMeals: pkg.packageMeals || "",
          packageActivities: pkg.packageActivities || "",
          packagePrice: pkg.packagePrice || "",
          packageDiscountPrice: pkg.packageDiscountPrice || "",
          packageOffer: Boolean(pkg.packageOffer),
          keyAttractions: Array.isArray(pkg.keyAttractions)
            ? pkg.keyAttractions.join(", ")
            : "",
        });

        setExistingImages(pkg.packageImages || []);
      } catch (err) {
        await showAlert({
          variant: "error",
          title: "Failed to load",
          message: "Unable to load itinerary details.",
        });
        navigate("/agent-dashboard/my-packages");
      } finally {
        setFetching(false);
      }
    };

    fetchPackage();
  }, [id, navigate, showAlert]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      await showAlert({
        variant: "warning",
        title: "Too many images",
        message: "You can upload a maximum of 5 images for a package.",
      });
      e.target.value = null;
      return;
    }
    setImages(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (key !== "keyAttractions") {
        formData.append(key, form[key]);
      }
    });

    const attractionsArray = form.keyAttractions
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    formData.append("keyAttractions", JSON.stringify(attractionsArray));

    images.forEach((file) => {
      formData.append("packageImages", file);
    });

    try {
      await API.put(`/update-package/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await showAlert({
        variant: "success",
        title: "Itinerary updated",
        message:
          "Your itinerary was updated and moved back to pending for admin review.",
      });

      navigate("/agent-dashboard/my-packages");
    } catch (err) {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;

      let friendlyMessage =
        "Unable to update the itinerary right now. Please try again.";

      if (status === 400) {
        friendlyMessage =
          serverMessage || "Please check the itinerary details and try again.";
      } else if (status === 403) {
        friendlyMessage =
          serverMessage || "You are not allowed to edit this itinerary.";
      } else if (status === 404) {
        friendlyMessage = "This itinerary was not found anymore.";
      }

      await showAlert({
        variant: "error",
        title: "Update failed",
        message: friendlyMessage,
      });
    }
  };

  if (fetching) {
    return <div className="p-10 text-center">Loading itinerary...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Itinerary</h2>
        <p className="text-sm text-gray-500 mt-1">
          Pending and rejected itineraries can be edited. After saving, the
          itinerary goes back to pending review.
        </p>
      </div>

      {existingImages.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-600 mb-2">
            Existing Images
          </p>
          <div className="flex flex-wrap gap-2">
            {existingImages.map((img, index) => (
              <span
                key={`${img}-${index}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
              >
                {img}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Upload new images only if you want to replace the current ones.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div className="col-span-2">
          <label className="text-sm font-semibold text-gray-600">
            Package Name
          </label>
          <input
            className="w-full border p-2.5 rounded-lg mt-1"
            value={form.packageName}
            onChange={(e) => setForm({ ...form, packageName: e.target.value })}
            required
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-semibold text-gray-600">
            Description
          </label>
          <textarea
            className="w-full border p-2.5 rounded-lg mt-1 h-24"
            value={form.packageDescription}
            onChange={(e) =>
              setForm({ ...form, packageDescription: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600">
            Destination
          </label>
          <input
            className="w-full border p-2.5 rounded-lg mt-1"
            value={form.packageDestination}
            onChange={(e) =>
              setForm({ ...form, packageDestination: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600">
            Accommodation
          </label>
          <input
            className="w-full border p-2.5 rounded-lg mt-1"
            value={form.packageAccommodation}
            onChange={(e) =>
              setForm({ ...form, packageAccommodation: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600">
            Transportation
          </label>
          <input
            className="w-full border p-2.5 rounded-lg mt-1"
            value={form.packageTransportation}
            onChange={(e) =>
              setForm({ ...form, packageTransportation: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600">Meals</label>
          <input
            className="w-full border p-2.5 rounded-lg mt-1"
            value={form.packageMeals}
            onChange={(e) => setForm({ ...form, packageMeals: e.target.value })}
            required
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-semibold text-gray-600">
            Activities
          </label>
          <input
            className="w-full border p-2.5 rounded-lg mt-1"
            value={form.packageActivities}
            onChange={(e) =>
              setForm({ ...form, packageActivities: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600">Days</label>
          <input
            type="number"
            className="w-full border p-2.5 rounded-lg mt-1"
            value={form.packageDays}
            onChange={(e) => setForm({ ...form, packageDays: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600">Nights</label>
          <input
            type="number"
            className="w-full border p-2.5 rounded-lg mt-1"
            value={form.packageNights}
            onChange={(e) =>
              setForm({ ...form, packageNights: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600">
            Price (Rs.)
          </label>
          <input
            type="number"
            className="w-full border p-2.5 rounded-lg mt-1"
            value={form.packagePrice}
            onChange={(e) => setForm({ ...form, packagePrice: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600">
            Discount Price (Rs.)
          </label>
          <input
            type="number"
            className="w-full border p-2.5 rounded-lg mt-1"
            value={form.packageDiscountPrice}
            onChange={(e) =>
              setForm({ ...form, packageDiscountPrice: e.target.value })
            }
            required
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-semibold text-gray-600">
            Upload New Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            className="w-full border p-2 rounded-lg mt-1"
            onChange={handleFileChange}
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-semibold text-gray-600">
            Key Attractions (comma separated)
          </label>
          <input
            className="w-full border p-2.5 rounded-lg mt-1"
            value={form.keyAttractions}
            onChange={(e) =>
              setForm({ ...form, keyAttractions: e.target.value })
            }
            required
          />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="offer"
            checked={form.packageOffer}
            onChange={(e) =>
              setForm({ ...form, packageOffer: e.target.checked })
            }
          />
          <label
            htmlFor="offer"
            className="text-sm font-semibold text-gray-600"
          >
            Is this a Special Offer?
          </label>
        </div>

        <button
          disabled={loading}
          className="col-span-2 bg-blue-600 text-white p-3.5 rounded-xl font-bold hover:bg-black transition-all disabled:bg-gray-400 mt-4"
        >
          {loading ? "Updating..." : "Update and Resubmit"}
        </button>

        {errors.length > 0 && (
          <div className="col-span-2 p-3 bg-red-100 text-red-700 rounded-lg">
            <ul className="list-disc ml-5 text-sm">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}
