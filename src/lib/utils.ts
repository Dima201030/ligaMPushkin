import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function fullName(player: { firstName: string; lastName: string }) {
  return `${player.firstName} ${player.lastName}`;
}

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateShort(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${formatDate(date)}, ${formatTime(date)}`;
}

export function formatTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function weekday(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return WEEKDAYS[date.getDay()];
}

export function formatDayMonth(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export function plural(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function winRate(wins: number, losses: number) {
  const total = wins + losses;
  if (!total) return 0;
  return Math.round((wins / total) * 100);
}

export function daysUntil(value: string) {
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  return diff;
}

export function relativeDeadline(value: string) {
  const days = daysUntil(value);
  if (days < 0) return "регистрация закрыта";
  if (days === 0) return "последний день";
  if (days === 1) return "остался 1 день";
  if (days < 5) return `осталось ${days} дня`;
  return `осталось ${days} дней`;
}

export function timeAgo(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const minutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.round(hours / 24);
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн назад`;
  return formatDateShort(date);
}

export function pluralizePlayers(count: number) {
  return `${count} ${plural(count, "игрок", "игрока", "игроков")}`;
}

export function toISODate(date: Date) {
  return date.toISOString();
}
