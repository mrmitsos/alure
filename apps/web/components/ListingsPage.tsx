"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mountain, Waves, SlidersHorizontal, X } from "lucide-react";
import api from "@/lib/axios";
import PropertyCard from "./PropertyCard";

interface Props {
  brand: "skiAlure" | "seaAlure";
}

interface Property {
  _id: string;
  title: string;
  description: string;
  brand: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  location: {
    city: string;
    region: string;
  };
}

export default function ListingsPage({ brand }: Props) {
  const isSea = brand === "seaAlure";

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxGuests, setMaxGuests] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams({ brand });
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (maxGuests) params.append("maxGuests", maxGuests);
        const { data } = await api.get(`/properties?${params}`);
        setProperties(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [brand, maxPrice, maxGuests]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filtered = properties.filter(
    (p: Property) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.city?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className={`min-h-screen ${isSea ? "bg-blue-50/30" : "bg-slate-50/30"}`}
    >
      {/* Hero Banner */}
      <div
        className={`relative py-20 px-4 text-center overflow-hidden ${
          isSea
            ? "bg-linear-to-br from-blue-900 via-blue-800 to-cyan-700"
            : "bg-linear-to-br from-slate-900 via-slate-800 to-slate-700"
        }`}
      >
        {/* Glow */}
        <div
          className={`absolute inset-0 opacity-20 ${
            isSea
              ? "bg-[radial-gradient(circle_at_50%_50%,#06b6d4,transparent_60%)]"
              : "bg-[radial-gradient(circle_at_50%_50%,#f59e0b,transparent_60%)]"
          }`}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {isSea ? (
            <Waves className="text-cyan-300 mx-auto mb-4" size={40} />
          ) : (
            <Mountain className="text-amber-400 mx-auto mb-4" size={40} />
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {isSea ? "Sea" : "Ski"}
            <span className={isSea ? "text-cyan-300" : "text-amber-400"}>
              Alure
            </span>
          </h1>
          <p className="text-white/70 max-w-md mx-auto text-sm">
            {isSea
              ? "Discover stunning island villas across the Greek archipelago"
              : "Find your perfect mountain retreat for the ultimate winter escape"}
          </p>
        </motion.div>
      </div>

      {/* Search + Filter Bar */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${isSea ? "islands" : "mountains"}...`}
            className="flex-1 text-sm border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors ${
              showFilter
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto px-4 pb-3 flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Max Price (€)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 300"
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-28 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Min Guests</label>
              <input
                type="number"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                placeholder="e.g. 4"
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-28 focus:outline-none focus:border-blue-400"
              />
            </div>
            {(maxPrice || maxGuests) && (
              <button
                onClick={() => {
                  setMaxPrice("");
                  setMaxGuests("");
                }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              >
                <X size={12} /> Clear
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Properties Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center text-slate-400 py-20">
            Loading properties...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">{isSea ? "🏝️" : "🏔️"}</p>
            <p className="text-slate-400">No properties found.</p>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-6">
              {filtered.length} propert{filtered.length > 1 ? "ies" : "y"} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((property: Property, i: number) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  index={i}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
