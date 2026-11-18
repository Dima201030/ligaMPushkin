import type { Metadata } from "next";
import { LoginForm } from "@/components/domain/AuthForms";

export const metadata: Metadata = { title: "Вход" };

export default function LoginPage() {
  return <LoginForm />;
}
