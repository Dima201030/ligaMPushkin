import type { CategorySlug } from "@/lib/types";

/**
 * Прототип хранилища аккаунтов.
 *
 * Настоящая авторизация появится на сервере: PostgreSQL, Argon2id, серверные
 * сессии. Здесь данные лежат в localStorage только чтобы показать полный
 * сценарий «регистрация → проверка администратором → вход» без бэкенда.
 * Пароль не хранится в открытом виде — только SHA-256 от email и пароля.
 */

export type AccountStatus = "pending" | "approved" | "rejected";

export interface LeagueAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  level: CategorySlug;
  status: AccountStatus;
  passwordHash: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface NewAccountInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  level: CategorySlug;
  passwordHash: string;
}

const STORAGE_KEY = "mp-league-accounts-v1";

const SEED_ACCOUNTS: LeagueAccount[] = [
  {
    id: "acc-demo-1",
    firstName: "Дмитрий",
    lastName: "Орлов",
    email: "d.orlov@example.com",
    phone: "+7 (921) 000-11-22",
    level: "challenger",
    status: "pending",
    passwordHash: "",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "acc-demo-2",
    firstName: "Анна",
    lastName: "Белова",
    email: "a.belova@example.com",
    phone: "+7 (911) 000-33-44",
    level: "rookies",
    status: "pending",
    passwordHash: "",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
];

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read(): LeagueAccount[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ACCOUNTS));
      return [...SEED_ACCOUNTS];
    }
    const parsed = JSON.parse(raw) as LeagueAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(accounts: LeagueAccount[]) {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function listAccounts(): LeagueAccount[] {
  return read().sort(
    (a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt),
  );
}

export function findAccountByEmail(email: string): LeagueAccount | undefined {
  const needle = email.trim().toLowerCase();
  return read().find((account) => account.email === needle);
}

export function createAccount(input: NewAccountInput): { ok: true; account: LeagueAccount } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, error: "Укажите email" };

  const accounts = read();
  if (accounts.some((account) => account.email === email)) {
    return { ok: false, error: "Аккаунт с таким email уже зарегистрирован" };
  }

  const account: LeagueAccount = {
    id: `acc-${Date.now().toString(36)}`,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email,
    phone: input.phone?.trim() || undefined,
    level: input.level,
    status: "pending",
    passwordHash: input.passwordHash,
    submittedAt: new Date().toISOString(),
  };

  write([account, ...accounts]);
  return { ok: true, account };
}

export function approveAccount(
  id: string,
  data: { firstName: string; lastName: string; level: CategorySlug },
): LeagueAccount | undefined {
  const accounts = read();
  const index = accounts.findIndex((account) => account.id === id);
  if (index === -1) return undefined;

  const updated: LeagueAccount = {
    ...accounts[index],
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    level: data.level,
    status: "approved",
    reviewedAt: new Date().toISOString(),
    reviewedBy: "Ирина Волкова",
  };
  accounts[index] = updated;
  write(accounts);
  return updated;
}

export function rejectAccount(id: string): LeagueAccount | undefined {
  const accounts = read();
  const index = accounts.findIndex((account) => account.id === id);
  if (index === -1) return undefined;

  const updated: LeagueAccount = {
    ...accounts[index],
    status: "rejected",
    reviewedAt: new Date().toISOString(),
    reviewedBy: "Ирина Волкова",
  };
  accounts[index] = updated;
  write(accounts);
  return updated;
}

/** SHA-256(email + password). Только для демо: в продакшене Argon2id на сервере. */
export async function hashPassword(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(
    `mr-pushkin-league:${email.trim().toLowerCase()}:${password}`,
  );
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
