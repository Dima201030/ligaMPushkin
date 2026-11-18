"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="border-y border-line py-10 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full border border-positive text-positive">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-lg">Сообщение отправлено</h3>
        <p className="mt-2 text-sm text-ink-muted">
          Спасибо! Организатор лиги свяжется с вами в течение рабочего дня.
        </p>
        <button type="button" className="btn btn-secondary mt-5" onClick={() => setSent(false)}>
          Отправить ещё одно
        </button>
      </div>
    );
  }

  return (
    <form
      className="border-y border-line py-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <h2 className="text-lg">Написать организатору</h2>
      <p className="mt-1.5 text-sm text-ink-muted">Вопрос по турнирам, рейтингу или участию в лиге.</p>
      <div className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <label>
          <span className="field-label">Имя</span>
          <input className="field" name="name" required placeholder="Как к вам обращаться" />
        </label>
        <label>
          <span className="field-label">Телефон</span>
          <input className="field" name="phone" type="tel" required placeholder="+7 (___) ___-__-__" />
        </label>
        <label className="sm:col-span-2">
          <span className="field-label">Email</span>
          <input className="field" name="email" type="email" placeholder="you@example.com" />
        </label>
        <label className="sm:col-span-2">
          <span className="field-label">Сообщение</span>
          <textarea className="field min-h-[110px] resize-y" name="message" required placeholder="Чем можем помочь?" />
        </label>
      </div>
      <label className="mt-5 flex items-start gap-2 text-[0.68rem] leading-relaxed text-ink-muted">
        <input type="checkbox" required className="mt-0.5 size-3.5 accent-[var(--color-ink)]" />
        Согласен на обработку персональных данных
      </label>
      <button type="submit" className="btn btn-primary mt-5">
        <Send className="size-4" aria-hidden="true" />
        Отправить сообщение
      </button>
      <p className="mt-4 text-[0.65rem] text-ink-faint">Демо-форма: сообщение не отправляется на сервер.</p>
    </form>
  );
}
