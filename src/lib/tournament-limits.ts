/** Shared create/edit limits — keep in sync with ligaBackend parseTournamentWrite / content limits. */

export const TOURNAMENT_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  descriptionMax: 2000,
  regulationsMin: 20,
  regulationsMax: 10000,
  venueNameMax: 120,
  venueAddressMax: 240,
  maxParticipantsMin: 4,
  maxParticipantsMax: 128,
  startMaxMonthsAhead: 6,
  maxDurationDays: 60,
} as const;

export const CONTENT_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  excerptMax: 500,
  newsBodyMax: 20000,
  eventDescriptionMax: 4000,
  eventLocationMax: 200,
  startMaxMonthsAhead: 6,
} as const;

export function monthsAheadLimit(months: number, from = new Date()): Date {
  const limit = new Date(from);
  limit.setMonth(limit.getMonth() + months);
  return limit;
}

export function validateTournamentFields(input: {
  title: string;
  description: string;
  regulations: string;
  startsAt: string;
  endsAt?: string;
  registrationClosesAt: string;
  registrationOpensAt?: string;
  maxParticipants: string | number;
  venueName?: string;
  venueAddress?: string;
  requireRegulations?: boolean;
}): Partial<Record<string, string>> {
  const L = TOURNAMENT_LIMITS;
  const errors: Partial<Record<string, string>> = {};
  const title = input.title.trim();
  const description = input.description.trim();
  const regulations = input.regulations.trim();
  const requireRegs = input.requireRegulations !== false;

  if (title.length < L.titleMin) {
    errors.title = "Укажите название турнира (минимум 3 символа)";
  } else if (title.length > L.titleMax) {
    errors.title = "Название турнира слишком длинное — максимум 120 символов";
  }

  if (description.length > L.descriptionMax) {
    errors.description = "Описание слишком длинное — максимум 2000 символов";
  }

  if (requireRegs || regulations.length > 0) {
    if (regulations.length < L.regulationsMin) {
      errors.regulations = "Опишите регламент — минимум 20 символов";
    } else if (regulations.length > L.regulationsMax) {
      errors.regulations = "Регламент слишком длинный — максимум 10000 символов";
    }
  }

  if (!input.startsAt) {
    errors.startsAt = "Выберите дату и время старта";
  } else {
    const start = new Date(input.startsAt);
    if (Number.isNaN(start.getTime())) {
      errors.startsAt = "Укажите корректную дату старта";
    } else if (start > monthsAheadLimit(L.startMaxMonthsAhead)) {
      errors.startsAt = "Дата старта не может быть больше чем через 6 месяцев";
    }
  }

  if (!input.registrationClosesAt) {
    errors.registrationClosesAt = "Укажите дедлайн регистрации";
  } else if (
    input.startsAt &&
    input.registrationClosesAt &&
    new Date(input.registrationClosesAt) >= new Date(input.startsAt)
  ) {
    errors.registrationClosesAt = "Регистрация должна закрыться до старта турнира";
  }

  if (
    input.registrationOpensAt &&
    input.registrationClosesAt &&
    new Date(input.registrationOpensAt) > new Date(input.registrationClosesAt)
  ) {
    errors.registrationOpensAt = "Открытие регистрации не может быть позже дедлайна";
  }

  if (input.endsAt) {
    const start = new Date(input.startsAt);
    const end = new Date(input.endsAt);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      if (end < start) {
        errors.endsAt = "Дата окончания не может быть раньше старта";
      } else {
        const maxEnd = new Date(start);
        maxEnd.setDate(maxEnd.getDate() + L.maxDurationDays);
        if (end > maxEnd) {
          errors.endsAt = "Турнир не может длиться больше 60 дней";
        }
      }
    }
  }

  const capacity = Number(input.maxParticipants);
  if (!capacity || capacity < L.maxParticipantsMin || capacity > L.maxParticipantsMax) {
    errors.maxParticipants = `Допустимо от ${L.maxParticipantsMin} до ${L.maxParticipantsMax} участников`;
  }

  if (input.venueName !== undefined && input.venueName.trim().length > L.venueNameMax) {
    errors.venueName = "Название площадки слишком длинное — максимум 120 символов";
  }
  if (input.venueAddress !== undefined && input.venueAddress.trim().length > L.venueAddressMax) {
    errors.venueAddress = "Адрес площадки слишком длинный — максимум 240 символов";
  }

  return errors;
}

export function validateNewsFields(input: {
  title: string;
  excerpt: string;
  body: string;
}): Partial<Record<"title" | "excerpt" | "body", string>> {
  const L = CONTENT_LIMITS;
  const errors: Partial<Record<"title" | "excerpt" | "body", string>> = {};
  const title = input.title.trim();
  if (title.length < L.titleMin) errors.title = "Заголовок слишком короткий";
  else if (title.length > L.titleMax) errors.title = "Заголовок слишком длинный — максимум 120 символов";
  if (input.excerpt.trim().length > L.excerptMax) {
    errors.excerpt = "Лид слишком длинный — максимум 500 символов";
  }
  if (input.body.trim().length > L.newsBodyMax) {
    errors.body = "Текст новости слишком длинный — максимум 20000 символов";
  }
  return errors;
}

export function validateEventFields(input: {
  title: string;
  description: string;
  location: string;
  startsAt: string;
}): Partial<Record<"title" | "description" | "location" | "startsAt", string>> {
  const L = CONTENT_LIMITS;
  const errors: Partial<Record<"title" | "description" | "location" | "startsAt", string>> = {};
  const title = input.title.trim();
  if (title.length < L.titleMin) errors.title = "Заголовок слишком короткий";
  else if (title.length > L.titleMax) errors.title = "Заголовок слишком длинный — максимум 120 символов";
  if (input.description.trim().length > L.eventDescriptionMax) {
    errors.description = "Описание слишком длинное — максимум 4000 символов";
  }
  if (input.location.trim().length > L.eventLocationMax) {
    errors.location = "Место слишком длинное — максимум 200 символов";
  }
  if (!input.startsAt) {
    errors.startsAt = "Укажите дату и время";
  } else {
    const start = new Date(input.startsAt);
    if (Number.isNaN(start.getTime())) errors.startsAt = "Некорректная дата";
    else if (start > monthsAheadLimit(L.startMaxMonthsAhead)) {
      errors.startsAt = "Дата события не может быть больше чем через 6 месяцев";
    }
  }
  return errors;
}
