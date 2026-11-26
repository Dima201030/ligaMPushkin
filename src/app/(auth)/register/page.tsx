import type { Metadata } from "next";
import { RegisterForm } from "@/components/domain/AuthForms";

export const metadata: Metadata = { title: "Регистрация на платформе" };

export default function RegisterPage() {
  return <RegisterForm />;
}
