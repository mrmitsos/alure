"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Users,
  BedDouble,
  Bath,
  Star,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
  Waves,
  Mountain,
} from "lucide-react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import { DayPicker, DateRange } from "react-day-picker";
import { format, differenceInCalendarDays } from "date-fns";
import "react-day-picker/dist/style.css";
import Loader from "./Loader";

const calendarStyles = `
  .rdp { --rdp-cell-size: 40px; margin: 0; font-family: inherit; }
  .rdp-day_selected:not([disabled]), .rdp-day_selected:focus:not([disabled]) { 
    background-color: #1a1a1a !important; color: white; border-radius: 4px;
  }
  .rdp-day_selected.rdp-day_range_middle {
    background-color: #f8f5f2 !important; color: #1a1a1a !important; border-radius: 0;
  }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: #fdfcfb; color: #1a1a1a;
  }
  .rdp-nav_button { color: #1a1a1a; }
  @media (max-width: 350px) { .rdp { --rdp-cell-size: 32px; } }
`;

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
  amenities: string[];
  location: {
    address: string;
    city: string;
    region: string;
  };
  host: {
    name: string;
    email: string;
  };
}

const amenityIcons: Record<string, string> = {
  wifi: "📶",
  pool: "🏊",
  parking: "🚗",
  "sea view": "🌊",
  fireplace: "🔥",
  kitchen: "🍳",
  gym: "💪",
  balcony: "🌅",
  ac: "❄️",
  pets: "🐾",
};

export default function PropertyDetail({ id }: { id: string }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [guests, setGuests] = useState(1);
  const [bookingLoad, setBookingLoad] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadBookedDates = async () => {
      if (!id) return;
      try {
        const { data } = await api.get(`/bookings/booked-dates/${id}`);
        setBookedDates(data.map((d: string) => new Date(d)));
      } catch (err) {
        console.error(err);
      }
    };
    loadBookedDates();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const nights =
    range?.from && range?.to
      ? differenceInCalendarDays(range.to, range.from)
      : 0;

  const total = nights * (property?.pricePerNight || 0);

  const handleBook = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!range?.from || !range?.to) {
      setBookingError("Please select check-in and check-out dates");
      return;
    }
    setBookingLoad(true);
    setBookingError("");
    try {
      const { data: booking } = await api.post("/bookings", {
        propertyId: id,
        checkIn: format(range.from, "yyyy-MM-dd"),
        checkOut: format(range.to, "yyyy-MM-dd"),
        guests,
      });

      const { data: session } = await api.post(
        "/payments/create-checkout-session",
        { bookingId: booking._id },
      );

      window.location.href = session.url;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setBookingError(error.response?.data?.message || "Something went wrong");
    } finally {
      setBookingLoad(false);
    }
  };

  if (loading) return <Loader />;

  if (!property)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="text-slate-300 text-sm uppercase tracking-widest">
          Property not found.
        </div>
      </div>
    );

  const isSea = property.brand === "seaAlure";

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 selection:bg-amber-100">
      <style>{calendarStyles}</style>

      {/* ── Top Navigation ── */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 hover:text-black transition-all"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Return to Collection
        </button>
        <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-300">
          {isSea ? (
            <>
              <Waves size={12} className="text-cyan-400" /> SeaAlure
            </>
          ) : (
            <>
              <Mountain size={12} className="text-amber-400" /> SkiAlure
            </>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        {/* ── Hero Gallery ── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
          {/* Main Image */}
          <div className="md:col-span-8 relative aspect-[16/10] md:aspect-auto md:h-[600px] overflow-hidden rounded-sm bg-slate-100">
            {property.images?.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={imageIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  src={property.images[imageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-8xl ${
                  isSea ? "bg-blue-50" : "bg-slate-100"
                }`}
              >
                {isSea ? "🏝️" : "🏔️"}
              </div>
            )}

            {/* Image Navigation */}
            {property.images?.length > 1 && (
              <>
                <div className="absolute bottom-8 right-8 flex gap-3">
                  <button
                    onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                    className="p-2 md:p-3 bg-white/90 hover:bg-white backdrop-blur shadow-sm transition-all"
                  >
                    <ChevronLeft size={14} className="md:hidden" />
                    <ChevronLeft size={18} className="hidden md:block" />
                  </button>
                  <button
                    onClick={() =>
                      setImageIndex((i) =>
                        Math.min(property.images.length - 1, i + 1),
                      )
                    }
                    className="p-2 md:p-3 bg-white/90 hover:bg-white backdrop-blur shadow-sm transition-all"
                  >
                    <ChevronRight size={14} className="md:hidden" />
                    <ChevronRight size={18} className="hidden md:block" />
                  </button>
                </div>

                {/* Dot indicators */}
                <div className="absolute bottom-8 left-8 flex gap-1.5">
                  {property.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === imageIndex ? "bg-white w-4" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Side Title Stack */}
          <div className="md:col-span-4 flex flex-col justify-center space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.4em] text-amber-600 font-bold">
                {isSea ? "SeaAlure Escape" : "SkiAlure Retreat"}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif italic leading-tight">
                {property.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <MapPin size={13} />
              <span className="text-xs uppercase tracking-widest">
                {property.location?.city}, {property.location?.region}
              </span>
            </div>

            <div className="flex items-center gap-1.5 pt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className="text-amber-400 fill-amber-400"
                />
              ))}
              <span className="text-xs text-slate-400 ml-1">4.9</span>
            </div>

            {/* Host */}
            <div className="pt-6 border-t border-slate-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3">
                Your Host
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-serif text-lg">
                  {property.host?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{property.host?.name}</p>
                  <p className="text-xs text-slate-400">Alure Host</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left — Narrative */}
          <div className="lg:col-span-7 space-y-16">
            {/* Stats */}
            <section className="grid grid-cols-3 gap-8 border-y border-slate-100 py-10">
              {[
                {
                  label: "Guests",
                  value: property.maxGuests,
                  icon: <Users size={16} />,
                },
                {
                  label: "Bedrooms",
                  value: property.bedrooms,
                  icon: <BedDouble size={16} />,
                },
                {
                  label: "Bathrooms",
                  value: property.bathrooms,
                  icon: <Bath size={16} />,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center md:text-left space-y-1"
                >
                  <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400">
                    {stat.icon}
                    <span className="text-[9px] uppercase tracking-widest font-bold">
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-2xl font-serif">{stat.value}</p>
                </div>
              ))}
            </section>

            {/* Description */}
            <section className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400">
                The Experience
              </h3>
              <p className="text-lg font-light leading-relaxed text-slate-600 italic font-serif">
                &ldquo;{property.description}&rdquo;
              </p>
            </section>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <section className="space-y-8">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400">
                  Amenities
                </h3>
                <div className="grid grid-cols-2 gap-y-4">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 text-sm font-light"
                    >
                      <span className="text-lg">
                        {amenityIcons[amenity.toLowerCase()] || "•"}
                      </span>
                      <span className="capitalize tracking-wide">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right — Booking Desk */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 bg-white border border-slate-100 p-8 md:p-10 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
              {/* Price */}
              <div className="flex justify-between items-baseline mb-10">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">
                  Rates from
                </p>
                <p className="text-4xl font-serif italic">
                  €{property.pricePerNight}
                  <span className="text-xs uppercase tracking-widest not-italic text-slate-300 ml-2">
                    / night
                  </span>
                </p>
              </div>

              {/* Calendar */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold">
                    Select Dates
                  </label>
                  {range?.from && (
                    <button
                      onClick={() => setRange(undefined)}
                      className="text-[9px] uppercase font-bold text-red-400 underline underline-offset-4"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex justify-center bg-[#FDFCFB] rounded-sm py-2">
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    disabled={[{ before: new Date() }, ...bookedDates]}
                    className="mx-auto"
                  />
                </div>

                {/* Selected range display */}
                {range?.from && (
                  <div className="text-xs text-slate-400 text-center">
                    {format(range.from, "dd MMM yyyy")}
                    {range.to && ` → ${format(range.to, "dd MMM yyyy")}`}
                  </div>
                )}
              </div>

              {/* Guests */}
              <div className="mt-8 space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold px-1">
                  Travelers
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-transparent border-b border-slate-200 py-4 text-sm focus:outline-none focus:border-black transition-colors"
                >
                  {Array.from(
                    { length: property.maxGuests },
                    (_, i) => i + 1,
                  ).map((n) => (
                    <option key={n} value={n}>
                      {n} Guest{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Breakdown */}
              {nights > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 pt-8 border-t border-slate-100 space-y-3"
                >
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-slate-400">
                    <span>Stay Duration</span>
                    <span>{nights} Nights</span>
                  </div>
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-slate-400">
                    <span>Rate per Night</span>
                    <span>€{property.pricePerNight}</span>
                  </div>
                  <div className="flex justify-between text-xl font-serif italic pt-3 border-t border-slate-100">
                    <span>Total Amount</span>
                    <span>€{total}</span>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {bookingError && (
                <p className="text-red-400 text-xs mt-4 text-center">
                  {bookingError}
                </p>
              )}

              {/* Book Button */}
              <button
                onClick={handleBook}
                disabled={bookingLoad}
                className={`w-full mt-10 py-5 text-[10px] uppercase tracking-[0.4em] font-bold transition-all ${
                  isSea
                    ? "bg-slate-900 text-white hover:bg-cyan-900"
                    : "bg-slate-900 text-white hover:bg-amber-900"
                } disabled:opacity-50 flex items-center justify-center gap-3`}
              >
                {bookingLoad ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : user ? (
                  "Request Reservation"
                ) : (
                  "Login to Request"
                )}
              </button>

              <p className="text-center text-[9px] uppercase tracking-[0.2em] text-slate-300 mt-6 flex items-center justify-center gap-2">
                <Info size={12} /> Flexible cancellation available
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
