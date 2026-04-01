"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { DoctorCard } from "../../../components/patient/doctors/DoctorCard";
import { DoctorFilters, DoctorFiltersState } from "../../../components/patient/doctors/DoctorFilters";
import { BookAppointmentModal } from "../../../components/patient/dashboard/BookAppointmentModal";

const DOCTOR_API = process.env.NEXT_PUBLIC_API_DOCTOR;
const api = axios.create({ withCredentials: true });

export default function DoctorDirectoryPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<DoctorFiltersState>({
    specialization: "",
    consultationType: "",
    minExperience: "",
  });

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Debounce fetching
    const fetchTimer = setTimeout(() => {
      fetchDoctors();
    }, 400);
    return () => clearTimeout(fetchTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.specialization) params.append("specialization", filters.specialization);
      if (filters.consultationType) params.append("consultationType", filters.consultationType);
      if (filters.minExperience) params.append("minExperience", filters.minExperience);

      const res = await api.get(`${DOCTOR_API}/doctor/all?${params.toString()}`);
      
      setDoctors(res.data.doctors || []);
      setError(null);
    } catch (err) {
      setError("Failed to load doctor directory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setBookingModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-10">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Find a Doctor</h1>
        <p className="text-zinc-400 text-sm mt-2 max-w-2xl leading-relaxed">
          Search and book appointments with our network of highly qualified medical professionals. Filter by specialty, experience, or preferred consultation method.
        </p>
      </header>

      {/* Filters Component */}
      <DoctorFilters filters={filters} setFilters={setFilters} />

      {/* Loading Indicator for Search */}
      {loading && doctors.length > 0 && (
         <div className="w-full flex justify-center mt-[-1rem]">
             <div className="h-1 w-24 bg-blue-500/50 rounded-full animate-pulse" />
         </div>
      )}

      {/* Doctors Grid */}
      <section>
        {error ? (
           <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex gap-3 items-center">
             <span>⚠️</span> {error}
           </div>
        ) : loading && doctors.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[360px] bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-2xl mb-4 text-zinc-500">
              🔍
            </div>
            <h3 className="text-lg font-bold text-white">No doctors found</h3>
            <p className="text-zinc-400 text-sm mt-1">Try adjusting your filters or searching for a different specialty.</p>
            <button 
              onClick={() => setFilters({ specialization: "", consultationType: "", minExperience: "" })}
              className="mt-4 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white rounded-lg text-sm font-medium transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} onBook={handleBook} />
            ))}
          </div>
        )}
      </section>

      {/* Reused Booking Modal */}
      <BookAppointmentModal 
        isOpen={bookingModalOpen}
        onClose={() => {
            setBookingModalOpen(false);
            // Delay removing selected doctor so the modal dropdown doesn't flicker during close animation
            setTimeout(() => setSelectedDoctorId(undefined), 300);
        }}
        initialDoctorId={selectedDoctorId}
        onBooked={() => fetchDoctors()} 
      />
    </div>
  );
}
