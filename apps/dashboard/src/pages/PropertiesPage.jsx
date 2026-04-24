import { useEffect, useState } from "react";
import api from "../lib/axios";
import {
  Plus,
  Pencil,
  Trash2,
  Mountain,
  Waves,
  BedDouble,
  Bath,
  Users,
  EuroIcon,
} from "lucide-react";

// ── Brand Badge ───────────────────────────────────────────────────────────────
const BrandBadge = ({ brand }) =>
  brand === "skiAlure" ? (
    <span className="flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
      <Mountain size={12} /> SkiAlure
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
      <Waves size={12} /> SeaAlure
    </span>
  );

// ── Property Card ─────────────────────────────────────────────────────────────
const PropertyCard = ({ property, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    {/* Image */}
    <div className="h-48 bg-slate-200 relative">
      {property.images?.[0] ? (
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400">
          No image
        </div>
      )}
      <div className="absolute top-3 left-3">
        <BrandBadge brand={property.brand} />
      </div>
    </div>

    {/* Content */}
    <div className="p-4">
      <h3 className="font-semibold text-slate-800 mb-1 truncate">
        {property.title}
      </h3>
      <p className="text-slate-400 text-xs mb-3">
        {property.location?.city}, {property.location?.region}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="flex flex-col items-center text-center">
          <EuroIcon size={14} className="text-slate-400 mb-1" />
          <span className="text-xs font-medium text-slate-700">
            €{property.pricePerNight}
          </span>
          <span className="text-xs text-slate-400">night</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Users size={14} className="text-slate-400 mb-1" />
          <span className="text-xs font-medium text-slate-700">
            {property.maxGuests}
          </span>
          <span className="text-xs text-slate-400">guests</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <BedDouble size={14} className="text-slate-400 mb-1" />
          <span className="text-xs font-medium text-slate-700">
            {property.bedrooms}
          </span>
          <span className="text-xs text-slate-400">beds</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Bath size={14} className="text-slate-400 mb-1" />
          <span className="text-xs font-medium text-slate-700">
            {property.bathrooms}
          </span>
          <span className="text-xs text-slate-400">baths</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(property)}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm py-2 rounded-lg transition-colors"
        >
          <Pencil size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(property._id)}
          className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm py-2 rounded-lg transition-colors"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Property Form Modal ───────────────────────────────────────────────────────
const PropertyModal = ({ property, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: property?.title || "",
    description: property?.description || "",
    brand: property?.brand || "seaAlure",
    pricePerNight: property?.pricePerNight || "",
    maxGuests: property?.maxGuests || "",
    bedrooms: property?.bedrooms || "",
    bathrooms: property?.bathrooms || "",
    city: property?.location?.city || "",
    region: property?.location?.region || "",
    address: property?.location?.address || "",
    amenities: property?.amenities?.join(", ") || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState(property?.images || []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        brand: form.brand,
        pricePerNight: Number(form.pricePerNight),
        maxGuests: Number(form.maxGuests),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        location: {
          city: form.city,
          region: form.region,
          address: form.address,
        },
        amenities: form.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        images: uploadedUrls,
      };

      if (property?._id) {
        await api.put(`/properties/${property._id}`, payload);
      } else {
        await api.post("/properties", payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));

      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/upload/multiple",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const data = await response.json();
      setUploadedUrls((prev) => [...prev, ...data.urls]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => {
    setUploadedUrls((prev) => prev.filter((u) => u !== url));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {property ? "Edit Property" : "Add New Property"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Brand */}
          <div>
            <label className="text-slate-600 text-sm font-medium mb-1 block">
              Brand
            </label>
            <select
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="seaAlure">🏝️ SeaAlure</option>
              <option value="skiAlure">🏔️ SkiAlure</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-slate-600 text-sm font-medium mb-1 block">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Beautiful Villa in Mykonos"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-slate-600 text-sm font-medium mb-1 block">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Describe the property..."
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 text-sm font-medium mb-1 block">
                City
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Mykonos"
              />
            </div>
            <div>
              <label className="text-slate-600 text-sm font-medium mb-1 block">
                Region
              </label>
              <input
                name="region"
                value={form.region}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Cyclades"
              />
            </div>
            <div>
              <label className="text-slate-600 text-sm font-medium mb-1 block">
                Address
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Street address"
              />
            </div>
          </div>

          {/* Price + Guests */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 text-sm font-medium mb-1 block">
                Price per Night (€)
              </label>
              <input
                name="pricePerNight"
                type="number"
                value={form.pricePerNight}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="250"
              />
            </div>
            <div>
              <label className="text-slate-600 text-sm font-medium mb-1 block">
                Max Guests
              </label>
              <input
                name="maxGuests"
                type="number"
                value={form.maxGuests}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="6"
              />
            </div>
          </div>

          {/* Bedrooms + Bathrooms */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 text-sm font-medium mb-1 block">
                Bedrooms
              </label>
              <input
                name="bedrooms"
                type="number"
                value={form.bedrooms}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="3"
              />
            </div>
            <div>
              <label className="text-slate-600 text-sm font-medium mb-1 block">
                Bathrooms
              </label>
              <input
                name="bathrooms"
                type="number"
                value={form.bathrooms}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="2"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-slate-600 text-sm font-medium mb-1 block">
              Amenities{" "}
              <span className="text-slate-400 font-normal">
                (comma separated)
              </span>
            </label>
            <input
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="pool, wifi, parking, sea view"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-slate-600 text-sm font-medium mb-1 block">
              Property Images
            </label>

            {/* Upload button */}
            <label
              className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg px-3 py-4 cursor-pointer transition-colors ${
                uploading
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <span className="text-sm text-blue-500">Uploading...</span>
              ) : (
                <span className="text-sm text-slate-400">
                  Click to upload images (max 10)
                </span>
              )}
            </label>

            {/* Image previews */}
            {uploadedUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {uploadedUrls.map((url, i) => (
                  <div key={i} className="relative group aspect-video">
                    <img
                      src={url}
                      alt={`Property ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : property
                  ? "Save Changes"
                  : "Add Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchProperties = async () => {
    try {
      const { data } = await api.get("/properties");
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/properties");
        setProperties(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = (property) => {
    setEditProperty(property);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;
    try {
      await api.delete(`/properties/${id}`);
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setEditProperty(null);
    fetchProperties();
  };

  const filtered =
    filter === "all"
      ? properties
      : properties.filter((p) => p.brand === filter);

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-slate-400">Loading properties...</div>
      </div>
    );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Properties</h1>
          <p className="text-slate-400 text-sm mt-1">
            {properties.length} total listings
          </p>
        </div>
        <button
          onClick={() => {
            setEditProperty(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Property
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "seaAlure", "skiAlure"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f === "all"
              ? "🏠 All"
              : f === "seaAlure"
                ? "🏝️ SeaAlure"
                : "🏔️ SkiAlure"}
          </button>
        ))}
      </div>

      {/* Properties Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-100">
          <p className="text-slate-400">No properties found.</p>
          <button
            onClick={() => {
              setEditProperty(null);
              setShowModal(true);
            }}
            className="mt-4 text-blue-600 text-sm hover:underline"
          >
            Add your first property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <PropertyModal
          property={editProperty}
          onClose={() => {
            setShowModal(false);
            setEditProperty(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
