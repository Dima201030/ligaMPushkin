import type { Metadata } from "next";
import { ConfirmEmailForm } from "@/components/domain/ConfirmEmailForm";

export const metadata: Metadata = {
  title: "Подтверждение email",
};

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token.trim() : "";

  return <ConfirmEmailForm token={token} />;
}
