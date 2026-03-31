import { useState } from "react";
import API from "../../api/axios";

export default function CreatePackage() {
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
    keyAttractions: "", // Comma separated string
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      alert("You can only upload a maximum of 5 images");
      e.target.value = null;
      return;
    }
    setImages(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors([]);

    if (images.length === 0) {
      alert("Please upload at least 1 image");
      setLoading(false);
      return;
    }

    const formData = new FormData();

    // 1. Append all fields except keyAttractions from the loop
    Object.keys(form).forEach((key) => {
      if (key !== "keyAttractions") {
        formData.append(key, form[key]);
      }
    });

    // 2. Format Attractions correctly as a JSON string
    const attractionsArray = form.keyAttractions
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== ""); // Remove empty strings

    formData.append("keyAttractions", JSON.stringify(attractionsArray));

    // 3. Append images
    images.forEach((file) => {
      formData.append("packageImages", file);
    });

    try {
      await API.post("/create-package", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Itinerary created successfully and sent for approval!");

      // Reset form
      setForm({
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
      setImages([]);
    } catch (err) {
      const serverErr = err.response?.data?.error;
      setErrors(Array.isArray(serverErr) ? serverErr : [err.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create Smart Itinerary
      </h2>

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
            placeholder="e.g. 3 Star Hotel"
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
            placeholder="e.g. AC Bus, Flight"
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
            placeholder="e.g. Breakfast & Dinner"
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
            placeholder="e.g. Sightseeing, Trekking"
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
            Price (₹)
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
            Discount Price (₹)
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
            Upload Images (1-5 images)
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
            placeholder="e.g. Mysore Palace, Chamundi Hills, Zoo"
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
          {loading ? "Processing..." : "Submit Itinerary for Approval"}
        </button>

        {message && (
          <div className="col-span-2 p-3 bg-green-100 text-green-700 rounded-lg text-center font-medium">
            {message}
          </div>
        )}

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
