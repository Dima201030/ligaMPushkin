/** Shared club field limits — keep in sync with ligaBackend/internal/limits. */

export const CLUB_LIMITS = {
  nameMin: 3,
  nameMax: 80,
  slugMin: 3,
  slugMax: 40,
  cityMax: 80,
} as const;

export const COVER_LIMITS = {
  maxBytes: 5 * 1024 * 1024,
  accept: "image/jpeg,image/png,image/webp",
  allowedMime: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;

export const AGE_LIMITS = {
  minYears: 5,
  maxYears: 100,
} as const;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateClubFields(input: {
  name: string;
  slug?: string;
  city?: string;
  requireSlug?: boolean;
}): Partial<Record<"name" | "slug" | "city", string>> {
  const L = CLUB_LIMITS;
  const errors: Partial<Record<"name" | "slug" | "city", string>> = {};
  const name = input.name.trim();
  if (name.length < L.nameMin) {
    errors.name = `Укажите название (минимум ${L.nameMin} символа)`;
  } else if (name.length > L.nameMax) {
    errors.name = `Название слишком длинное — максимум ${L.nameMax} символов`;
  }

  if (input.requireSlug !== false && input.slug !== undefined) {
    const slug = input.slug.trim().toLowerCase();
    if (!slug || !SLUG_RE.test(slug)) {
      errors.slug = "Slug латиницей: my-club";
    } else if (slug.length < L.slugMin) {
      errors.slug = `Slug слишком короткий — минимум ${L.slugMin} символа`;
    } else if (slug.length > L.slugMax) {
      errors.slug = `Slug слишком длинный — максимум ${L.slugMax} символов`;
    }
  }

  if (input.city !== undefined) {
    const city = input.city.trim();
    if (city.length > L.cityMax) {
      errors.city = "Город слишком длинный";
    }
  }

  return errors;
}

export function validateCoverFile(file: File): string | null {
  if (file.size > COVER_LIMITS.maxBytes) {
    return "Файл слишком большой — максимум 5 МБ";
  }
  const mime = file.type.toLowerCase();
  if (
    mime &&
    !COVER_LIMITS.allowedMime.includes(mime as (typeof COVER_LIMITS.allowedMime)[number])
  ) {
    return "Допустимы JPEG, PNG, WebP";
  }
  const lower = file.name.toLowerCase();
  const okExt =
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp");
  if (!mime && !okExt) {
    return "Допустимы JPEG, PNG, WebP";
  }
  return null;
}

/** Age in full years from YYYY-MM-DD birth date. */
export function ageYearsFromBirthDate(birthDate: string, asOf = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const [y, m, d] = birthDate.split("-").map(Number);
  const birth = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(birth.getTime())) return null;
  let years = asOf.getUTCFullYear() - birth.getUTCFullYear();
  const anniversary = new Date(
    Date.UTC(asOf.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate()),
  );
  if (asOf.getTime() < anniversary.getTime()) years -= 1;
  return years;
}

export function validateBirthAge(birthDate: string, asOf = new Date()): string | null {
  const age = ageYearsFromBirthDate(birthDate, asOf);
  if (age === null) return "Дата рождения: ГГГГ-ММ-ДД";
  if (age < AGE_LIMITS.minYears || age > AGE_LIMITS.maxYears) {
    return `Возраст должен быть от ${AGE_LIMITS.minYears} до ${AGE_LIMITS.maxYears} лет`;
  }
  return null;
}
