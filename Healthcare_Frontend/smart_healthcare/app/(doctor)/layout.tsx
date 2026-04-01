import { ReactNode } from "react";
import { DoctorDashboardProvider } from "@/context/doctor-dashboard.context";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
     <RoleGuard allowedRole="doctor">
        <DoctorDashboardProvider>
           {children}
        </DoctorDashboardProvider>
     </RoleGuard>
  );
}
