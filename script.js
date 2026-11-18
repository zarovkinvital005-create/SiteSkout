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

// Данные демо (вымышленные): используются на первом экране и на странице подбора
const DEMO = [
  { q: "строительные компании, Москва", rows: [["СтройВектор","+7 (495) 000-00-01","bad","нет сайта"],["Домостроитель-М","+7 (495) 000-00-02","bad","нет сайта"],["Кирпичный двор","+7 (495) 000-00-03","bad","сайт не работает"],["МонолитПлюс","+7 (495) 000-00-04","warn","старый сайт"],["СтройАльянс-Н","+7 (495) 000-00-05","bad","нет сайта"]] },
  { q: "автосервисы, Самара", rows: [["МоторХаус","+7 (846) 000-00-11","bad","нет сайта"],["Гараж 63","+7 (846) 000-00-12","bad","нет сайта"],["Колесо+","+7 (846) 000-00-13","bad","сайт не работает"],["Круиз-Лайн","+7 (846) 000-00-14","warn","старый сайт"],["АвтоДом-С","+7 (846) 000-00-15","bad","нет сайта"]] },
  { q: "стоматологии, Новосибирск", rows: [["Белый Клён","+7 (383) 000-00-21","bad","нет сайта"],["Улыбка-Мед","+7 (383) 000-00-22","bad","нет сайта"],["ДентаПлюс","+7 (383) 000-00-23","bad","сайт не работает"],["Зубной Дом","+7 (383) 000-00-24","warn","старый сайт"],["Дента-Люкс","+7 (383) 000-00-25","bad","нет сайта"]] },
  { q: "салоны красоты, Казань", rows: [["Шёлк","+7 (843) 000-00-31","bad","нет сайта"],["Студия Мята","+7 (843) 000-00-32","bad","нет сайта"],["Лилак","+7 (843) 000-00-33","bad","сайт не работает"],["Beauty-Лофт","+7 (843) 000-00-34","warn","старый сайт"],["Эстет-К","+7 (843) 000-00-35","bad","нет сайта"]] },
];

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
  const tg = document.querySelector(".hero .srch");
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
    const loop = () => { clearInterval(timer); timer = setInterval(() => { if (visible && !document.hidden) play(); }, 9000); };
    // «Попробуй»: другие ниши в том же демо (данные вымышлены)
    const chipBox = document.querySelector(".tryit");
    if (chipBox) chipBox.querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => {
        const d = DEMO[+btn.dataset.i];
        chipBox.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        const typed = tg.querySelector("[data-typed]");
        typed.textContent = d.q; typed.style.setProperty("--n", d.q.length);
        tg.querySelectorAll("tbody tr").forEach((tr, i) => {
          const r = d.rows[i];
          tr.querySelector(".name b").textContent = r[0];
          tr.querySelector(".phone").textContent = r[1];
          const t = tr.querySelector(".tag");
          t.textContent = r[3]; t.className = "tag tag--" + r[2];
        });
        tg.classList.add("is-live"); play(); loop();
      })
    );

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

// Графики «сам / через сервис»: стрелка идёт по линии по кругу, число считается заново
const plural = (n, f) => {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? f[0] : a >= 2 && a <= 4 && !(b >= 12 && b <= 14) ? f[1] : f[2];
};
(() => {
  const cards = [...document.querySelectorAll(".peak")];
  if (!cards.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const W = 300, N = 72, FADE = 0.45;
  // слева медленный почти ровный путь, справа быстрый непрерывный рост вверх; цикл у обоих 5,25 с
  const CFG = {
    solo: { base: (x) => 168 - 7 * x, amp: 1.6, draw: 3.4, hold: 1.4 },
    ours: { base: (x) => 176 - 150 * Math.pow(x, 0.9), amp: 3, draw: 1.4, hold: 3.4 },
  };
  const build = (cfg, t, prog) => {
    const M = Math.max(3, Math.round(N * prog)), pts = [];
    for (let i = 0; i <= M; i++) {
      const x = (i / M) * prog, w = Math.pow(x, 0.6);
      const n = cfg.amp * w * (Math.sin(x * 8 + t * 1.4) * 0.55 + Math.sin(x * 19 - t * 2.3) * 0.3 + Math.sin(x * 37 + t * 3.1) * 0.15);
      pts.push([x * W, cfg.base(x) + n]);
    }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(2)}`;
    for (let i = 1; i < M; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += `Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(2)} ${mx.toFixed(1)} ${my.toFixed(2)}`;
    }
    return { d: d + `L${pts[M][0].toFixed(1)} ${pts[M][1].toFixed(2)}`, end: pts[M] };
  };

  const st = cards.map((card) => {
    const o = { card, cfg: card.classList.contains("peak--ours") ? CFG.ours : CFG.solo,
      path: card.querySelector(".line"), dot: card.querySelector(".dot"), halo: card.querySelector(".halo"),
      num: card.querySelector("[data-count]"), unit: card.querySelector("[data-unit]"), t: 0, visible: false, started: false };
    if (o.unit) o.forms = o.unit.dataset.unit.split("|");
    o.total = +o.num.dataset.final;
    return o;
  });
  const put = (o, x, y, a) => {
    for (const el of [o.dot, o.halo]) { el.setAttribute("cx", x); el.setAttribute("cy", y); }
    o.path.style.opacity = a; o.dot.style.opacity = a;
  };

  if (reduce || !("IntersectionObserver" in window)) {
    st.forEach((o) => { const r = build(o.cfg, 0, 1); o.path.setAttribute("d", r.d); put(o, r.end[0], r.end[1], 1); o.num.textContent = o.total; o.card.classList.add("is-run", "is-done"); });
    return;
  }
  st.forEach((o) => { o.path.style.opacity = 0; o.num.textContent = 0; });

  let raf = 0, last = 0;
  const frame = (now) => {
    raf = 0;
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
    let busy = false;
    for (const o of st) {
      if (!o.started || !o.visible || document.hidden) continue;
      busy = true; o.t += dt;
      const { draw, hold } = o.cfg, cyc = draw + hold + FADE, t = o.t % cyc;
      const prog = t < draw ? ease(t / draw) : 1;
      const alpha = t >= draw + hold ? Math.max(0, 1 - (t - draw - hold) / FADE) : 1;
      const r = build(o.cfg, o.t, Math.max(prog, 0.02));
      o.path.setAttribute("d", r.d);
      put(o, r.end[0], r.end[1], alpha);
      const cnt = Math.round(o.total * prog);
      o.num.textContent = cnt;
      if (o.unit) o.unit.textContent = plural(cnt, o.forms);
      o.card.classList.toggle("is-done", t >= draw);
    }
    if (busy) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      const o = st.find((x) => x.card === e.target);
      o.visible = e.isIntersecting;
      if (e.isIntersecting) { if (!o.started) { o.started = true; o.card.classList.add("is-run"); } kick(); }
    });
  }, { threshold: 0.4 });
  st.forEach((o) => io.observe(o.card));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
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
      t.querySelector("[data-yearnote]").textContent = year ? "Это " + fmt(monthly) + " ₽ в месяц, на " + Math.floor(100 - (y / (m * 12)) * 100) + "% дешевле" : "";
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

// Страница подбора: поиск показывает ПРИМЕР подборки, телефоны скрыты до выбора тарифа
(() => {
  const form = document.getElementById("pform");
  if (!form) return;
  const input = document.getElementById("pq"), res = document.getElementById("pres"), body = document.getElementById("pbody");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KEYS = [["строител", 0], ["авто", 1], ["стомат", 2], ["салон", 3], ["красот", 3]];
  const pick = (q) => { q = q.toLowerCase(); for (const [k, i] of KEYS) if (q.includes(k)) return DEMO[i]; return DEMO[0]; };
  const mask = (ph) => ph.replace(/\d{3}-\d{2}-(\d{2})$/, "•••-••-$1");
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const show = (q) => {
    const d = pick(q);
    body.innerHTML = d.rows.map((r, i) =>
      `<tr class="fx" style="--r:${(0.1 + i * 0.12).toFixed(2)}s"><td class="name"><b>${esc(r[0])}</b></td><td class="phone">${esc(mask(r[1]))}</td><td class="site"><span class="tag tag--${r[2]}" style="--t:${(0.25 + i * 0.12).toFixed(2)}s">${esc(r[3])}</span></td></tr>`
    ).join("");
    res.hidden = false;
    res.classList.remove("is-live"); res.classList.add("is-reset");
    void res.offsetWidth;
    res.classList.remove("is-reset"); res.classList.add("is-live");
    if (!reduce) res.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  form.addEventListener("submit", (e) => { e.preventDefault(); if (input.value.trim()) show(input.value); });
  document.querySelectorAll(".pod__chips button").forEach((b) =>
    b.addEventListener("click", () => { input.value = b.dataset.q; show(b.dataset.q); })
  );
})();
