"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Users, BedDouble, Bath, Star } from "lucide-react";

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

interface Props {
  property: Property;
  index: number;
}

export default function PropertyCard({ property, index }: Props) {
  const isSea = property.brand === "seaAlure";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/${property.brand}/${property._id}`}>
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          {/* Image */}
          <div className="h-52 relative overflow-hidden bg-slate-200">
            {property.images?.[0] ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-5xl ${
                  isSea ? "bg-blue-50" : "bg-slate-100"
                }`}
              >
                {isSea ? "🏝️" : "🏔️"}
              </div>
            )}

            {/* Price badge */}
            <div
              className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
                isSea
                  ? "bg-cyan-400 text-blue-900"
                  : "bg-amber-400 text-slate-900"
              }`}
            >
              €{property.pricePerNight} / night
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-slate-800 text-sm leading-tight">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-xs text-slate-500">4.9</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
              <MapPin size={11} />
              {property.location?.city}, {property.location?.region}
            </div>

            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
              {property.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <Users size={12} /> {property.maxGuests} guests
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <BedDouble size={12} /> {property.bedrooms} beds
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <Bath size={12} /> {property.bathrooms} baths
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
