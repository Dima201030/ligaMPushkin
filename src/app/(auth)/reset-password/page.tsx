import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/domain/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Новый пароль",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token.trim() : "";

  return <ResetPasswordForm token={token} />;
}
