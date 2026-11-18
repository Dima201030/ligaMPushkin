import type { Metadata } from "next";
import { RegisterForm } from "@/components/domain/AuthForms";

export const metadata: Metadata = { title: "Заявка в лигу" };

export default function RegisterPage() {
  return <RegisterForm />;
}
