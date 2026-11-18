/* ====== ССЫЛКИ — меняйте только здесь ====== */
const BOT_URL = "https://t.me/your_bot";            // ссылка на Telegram-бота
const CHANNEL_URL = "https://t.me/your_channel";    // ссылка на Telegram-канал
const INSTAGRAM_URL = "https://instagram.com/your_account"; // ссылка на Instagram

/* ====== ОПЛАТА — платёжные ссылки из кабинета вашего платёжного сервиса ====== */
const PAY_URLS = {
  start: { month: "https://pay.example.com/start-month", year: "https://pay.example.com/start-year" }, // «Старт»
  pro:   { month: "https://pay.example.com/pro-month",   year: "https://pay.example.com/pro-year" },   // «Бизнес»
  max:   { month: "https://pay.example.com/max-month",   year: "https://pay.example.com/max-year" },   // «Профи»
};
/* ========================================== */

(() => {
  const urls = { bot: BOT_URL, channel: CHANNEL_URL, instagram: INSTAGRAM_URL };
  document.querySelectorAll("[data-link]").forEach((a) => {
    const u = urls[a.dataset.link];
    if (u) a.href = u;
  });

  // Заглушки юридических ссылок: не прыгаем вверх страницы
  document.querySelectorAll("[data-stub]").forEach((a) =>
    a.addEventListener("click", (e) => e.preventDefault())
  );

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Плавное появление блоков
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-in"));
  }

  // Диалог: стартует, когда виден, и проигрывается по кругу, пока блок на экране
  const tg = document.querySelector(".tg");
  if (tg) {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false, timer = null;
    const play = () => {
      tg.classList.remove("is-live");
      tg.classList.add("is-reset");
      void tg.offsetWidth;                 // сброс анимаций
      tg.classList.remove("is-reset");
      tg.classList.add("is-live");
    };
    const loop = () => { clearInterval(timer); timer = setInterval(() => { if (visible && !document.hidden) play(); }, 13000); };
    if ("IntersectionObserver" in window && !still) {
      new IntersectionObserver((es) => {
        const was = visible; visible = es[0].isIntersecting;
        if (visible && !was) { if (!tg.classList.contains("is-live")) tg.classList.add("is-live"); loop(); }
      }, { threshold: 0.35 }).observe(tg);
    } else tg.classList.add("is-live");
  }

  // Липкая кнопка: показываем, когда основные CTA вне экрана
  const sticky = document.getElementById("sticky");
  const heroCta = document.getElementById("hero-cta");
  const finalCta = document.getElementById("final-cta");
  if (sticky && heroCta && finalCta && "IntersectionObserver" in window) {
    const seen = new Set();
    const link = sticky.querySelector("a");
    const update = () => {
      const on = seen.size === 0;
      sticky.classList.toggle("is-on", on);
      sticky.setAttribute("aria-hidden", String(!on));
      link.tabIndex = on ? 0 : -1;
    };
    const so = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      update();
    });
    so.observe(heroCta);
    so.observe(finalCta);
    const plans = document.getElementById("plans");
    if (plans) so.observe(plans); // не показываем липкую кнопку над самими тарифами
  }
})();

// Анимация карточек «сам / через сервис»: линия рисуется, точка бежит по ней, число считается
(() => {
  const cards = document.querySelectorAll(".peak");
  if (!cards.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const prep = (card) => {
    const path = card.querySelector(".line");
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    return { path, len, dot: card.querySelector(".dot"), halo: card.querySelector(".halo"),
             num: card.querySelector("[data-count]") };
  };
  const place = (o, p) => {
    const pt = o.path.getPointAtLength(p * o.len);
    o.dot.setAttribute("cx", pt.x); o.dot.setAttribute("cy", pt.y);
    o.halo.setAttribute("cx", pt.x); o.halo.setAttribute("cy", pt.y);
  };
  const run = (card, delay) => {
    const o = prep(card);
    const total = +o.num.dataset.final;
    if (reduce) {
      o.path.style.strokeDashoffset = 0; place(o, 1); o.num.textContent = total;
      card.classList.add("is-run", "is-done"); return;
    }
    o.path.style.strokeDashoffset = o.len; place(o, 0); o.num.textContent = 0;
    const dur = 2000;
    setTimeout(() => {
      card.classList.add("is-run");
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur), e = ease(t);
        o.path.style.strokeDashoffset = o.len * (1 - e);
        place(o, e);
        o.num.textContent = Math.round(total * e);
        if (t < 1) requestAnimationFrame(step); else card.classList.add("is-done");
      };
      requestAnimationFrame(step);
    }, delay);
  };

  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        io.unobserve(e.target);
        run(e.target, e.target.classList.contains("peak--ours") ? 450 : 0);
      }
    });
  }, { threshold: 0.4 });
  cards.forEach((c) => {
    // до появления показываем «пустое» состояние, без JS остаётся готовая картинка
    const o = prep(c); o.path.style.strokeDashoffset = o.len; place(o, 0); o.num.textContent = 0;
    io.observe(c);
  });
})();

// Тарифы: переключатель месяц / год, плавная смена цен, ссылки оплаты
(() => {
  const sw = document.getElementById("period");
  const tiers = document.querySelectorAll(".tier");
  if (!sw || !tiers.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (n) => Math.round(n).toLocaleString("ru-RU");
  let period = "month";

  const render = (animate) => {
    tiers.forEach((t) => {
      const m = +t.dataset.m, y = +t.dataset.y, n = +t.dataset.n;
      const year = period === "year";
      const total = year ? y : m;
      const monthly = year ? y / 12 : m;
      const el = t.querySelector("[data-price]");
      const from = +el.dataset.shown || m;
      el.dataset.shown = total;
      if (animate && !reduce) {
        const t0 = performance.now();
        const step = (now) => {
          const k = Math.min(1, (now - t0) / 450), e = 1 - Math.pow(1 - k, 3);
          el.textContent = fmt(from + (total - from) * e);
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      } else el.textContent = fmt(total);
      t.querySelector("[data-per]").textContent = year ? "в год" : "в месяц";
      t.querySelector("[data-day]").textContent = "Всего " + fmt(year ? y / 365 : m / 30) + " ₽ в день";
      t.querySelector("[data-each]").textContent = n ? "≈ " + fmt(monthly / n) + " ₽ за подборку" : "Подборки без ограничений";
      t.querySelector("[data-yearnote]").textContent = year ? "Это " + fmt(monthly) + " ₽ в месяц, на 50% дешевле" : "";
      const a = t.querySelector("[data-pay]");
      const u = (PAY_URLS[a.dataset.pay] || {})[period];
      if (u) a.href = u;
    });
  };

  sw.querySelectorAll("button").forEach((b) =>
    b.addEventListener("click", () => {
      if (period === b.dataset.period) return;
      period = b.dataset.period;
      sw.dataset.p = period;
      sw.querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      render(true);
    })
  );
  render(false);
})();
