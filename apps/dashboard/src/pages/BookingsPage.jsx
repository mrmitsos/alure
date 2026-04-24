import { useEffect, useState } from "react";
import api from "../lib/axios";
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-slate-100 text-slate-700",
  };
  const icons = {
    pending: <Clock size={12} />,
    confirmed: <CheckCircle size={12} />,
    cancelled: <XCircle size={12} />,
    completed: <CalendarCheck size={12} />,
  };
  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${styles[status]}`}
    >
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ── Payment Badge ─────────────────────────────────────────────────────────────
const PaymentBadge = ({ status }) => {
  const styles = {
    unpaid: "bg-red-100 text-red-700",
    paid: "bg-green-100 text-green-700",
    refunded: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ── Booking Row ───────────────────────────────────────────────────────────────
const BookingRow = ({ booking, onStatusChange }) => {
  const checkIn = new Date(booking.checkIn).toLocaleDateString("en-GB");
  const checkOut = new Date(booking.checkOut).toLocaleDateString("en-GB");
  const nights = Math.ceil(
    (new Date(booking.checkOut) - new Date(booking.checkIn)) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-4 px-4">
        <p className="text-sm font-medium text-slate-800">
          {booking.property?.title || "N/A"}
        </p>
        <p className="text-xs text-slate-400">
          {booking.property?.brand === "seaAlure"
            ? "🏝️ SeaAlure"
            : "🏔️ SkiAlure"}
        </p>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm text-slate-800">{booking.guest?.name || "N/A"}</p>
        <p className="text-xs text-slate-400">{booking.guest?.email}</p>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm text-slate-800">
          {checkIn} → {checkOut}
        </p>
        <p className="text-xs text-slate-400">
          {nights} night{nights > 1 ? "s" : ""}
        </p>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm font-semibold text-slate-800">
          €{booking.totalPrice}
        </p>
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={booking.status} />
      </td>
      <td className="py-4 px-4">
        <PaymentBadge status={booking.paymentStatus} />
      </td>
      <td className="py-4 px-4">
        <div className="relative inline-flex items-center">
          <select
            value={booking.status}
            onChange={(e) => onStatusChange(booking._id, e.target.value)}
            className={`
        appearance-none cursor-pointer text-[11px] font-bold uppercase tracking-wider
        px-3 py-1.5 pr-8 rounded-full border-0 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-1
        ${
          booking.status === "confirmed"
            ? "bg-emerald-100 text-emerald-700 focus:ring-emerald-500"
            : booking.status === "pending"
              ? "bg-amber-100 text-amber-700 focus:ring-amber-500"
              : booking.status === "cancelled"
                ? "bg-rose-100 text-rose-700 focus:ring-rose-500"
                : "bg-slate-100 text-slate-700 focus:ring-slate-500"
        }
      `}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          {/* Refined Chevron for better alignment */}
          <ChevronDown
            size={14}
            className={`absolute right-2.5 pointer-events-none opacity-60 ${
              booking.status === "confirmed"
                ? "text-emerald-700"
                : booking.status === "pending"
                  ? "text-amber-700"
                  : booking.status === "cancelled"
                    ? "text-rose-700"
                    : "text-slate-700"
            }`}
          />
        </div>
      </td>
    </tr>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/bookings");
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  // Summary counts
  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-slate-400">Loading bookings...</div>
      </div>
    );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage and track all property bookings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total", key: "all", color: "bg-slate-800" },
          { label: "Pending", key: "pending", color: "bg-amber-500" },
          { label: "Confirmed", key: "confirmed", color: "bg-green-500" },
          { label: "Completed", key: "completed", color: "bg-blue-500" },
          { label: "Cancelled", key: "cancelled", color: "bg-red-500" },
        ].map(({ label, key, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-xl p-4 text-left transition-all ${
              filter === key
                ? `${color} text-white shadow-md`
                : "bg-white border border-slate-100 text-slate-700 hover:border-slate-300"
            }`}
          >
            <p className="text-2xl font-bold">{counts[key]}</p>
            <p className="text-xs mt-1 opacity-80">{label}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">
                    Property
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">
                    Guest
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">
                    Dates
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">
                    Total
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">
                    Payment
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">
                    Update
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <BookingRow
                    key={booking._id}
                    booking={booking}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
