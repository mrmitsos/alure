"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  CalendarCheck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";

interface Booking {
  _id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  property: {
    _id: string;
    title: string;
    brand: string;
    images: string[];
    location: {
      city: string;
      region: string;
    };
  };
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] || styles.pending}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function ProfilePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    const load = async () => {
      try {
        const { data } = await api.get("/bookings/my");
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, router]);

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const totalSpent = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Back to home
          </button>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl font-serif text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-serif mb-1">{user?.name}</h1>
              <p className="text-white/50 text-sm">{user?.email}</p>
              <span className="inline-block mt-2 text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-white/10">
            {[
              { label: "Total Bookings", value: bookings.length },
              {
                label: "Confirmed",
                value: bookings.filter((b) => b.status === "confirmed").length,
              },
              { label: "Total Spent", value: `€${totalSpent}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-serif font-bold">{value}</p>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Personal Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8"
        >
          <h2 className="font-serif text-xl text-slate-800 mb-6">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <User size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Full Name</p>
                <p className="text-sm font-medium text-slate-800">
                  {user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <Mail size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Email</p>
                <p className="text-sm font-medium text-slate-800">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <CheckCircle size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Email Status</p>
                <p className="text-sm font-medium text-green-600">Verified</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <User size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Account Type</p>
                <p className="text-sm font-medium text-slate-800 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-slate-800">
              My Reservations
            </h2>
            {/* Filter tabs */}
            <div className="flex gap-2">
              {["all", "pending", "confirmed", "completed", "cancelled"].map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors capitalize ${
                      filter === f
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {f}
                  </button>
                ),
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
              <CalendarCheck
                size={40}
                className="text-slate-200 mx-auto mb-4"
              />
              <p className="text-slate-400 text-sm">No reservations found.</p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Browse properties
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((booking, i) => {
                const checkIn = new Date(booking.checkIn).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                );
                const checkOut = new Date(booking.checkOut).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                );
                const nights = Math.ceil(
                  (new Date(booking.checkOut).getTime() -
                    new Date(booking.checkIn).getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                const isSea = booking.property?.brand === "seaAlure";

                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Property Image */}
                      <div className="md:w-48 h-40 md:h-auto shrink-0 bg-slate-100 relative">
                        {booking.property?.images?.[0] ? (
                          <img
                            src={booking.property.images[0]}
                            alt={booking.property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center text-4xl ${
                              isSea ? "bg-blue-50" : "bg-slate-100"
                            }`}
                          >
                            {isSea ? "🏝️" : "🏔️"}
                          </div>
                        )}
                        {/* Brand tag */}
                        <div
                          className={`absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full ${
                            isSea
                              ? "bg-cyan-400 text-blue-900"
                              : "bg-amber-400 text-slate-900"
                          }`}
                        >
                          {isSea ? "🏝️ SeaAlure" : "🏔️ SkiAlure"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-800 mb-1">
                              {booking.property?.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                              <MapPin size={11} />
                              {booking.property?.location?.city},{" "}
                              {booking.property?.location?.region}
                            </div>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">
                              Check In
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {checkIn}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">
                              Check Out
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {checkOut}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">
                              Duration
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {nights} night{nights > 1 ? "s" : ""}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Total</p>
                            <p className="text-sm font-bold text-slate-800">
                              €{booking.totalPrice}
                            </p>
                          </div>
                        </div>

                        {/* Payment status */}
                        <div className="mt-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full ${
                              booking.paymentStatus === "paid"
                                ? "bg-green-50 text-green-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            Payment: {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
