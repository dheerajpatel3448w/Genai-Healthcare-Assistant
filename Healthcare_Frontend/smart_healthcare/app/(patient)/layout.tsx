import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRole="patient">{children}</RoleGuard>;
}
