import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/domain/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Сброс пароля",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
