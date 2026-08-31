/* ═══════════════════════════════════════════
   WASHLY — interactions & animation
   ═══════════════════════════════════════════ */
(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Navbar scroll state ─────────────────── */
  const navbar = document.getElementById("navbar");
  const floatingCta = document.getElementById("floatingCta");
  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
    floatingCta.classList.toggle("show", window.scrollY > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ─────────────────────────── */
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  const navOverlay = document.getElementById("navOverlay");
  const setMenu = (open) => {
    navLinks.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    if (navOverlay) navOverlay.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
  };
  burger.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") setMenu(false);
  });
  if (navOverlay) navOverlay.addEventListener("click", () => setMenu(false));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) setMenu(false);
  });

  /* ── Language toggle (EN / FR) ───────────── */
  const langToggle = document.getElementById("langToggle");
  if (langToggle) {
    const nodes = document.querySelectorAll("[data-fr]");
    const meta = document.querySelector('meta[name="description"]');
    const TITLE = {
      en: document.title,
      fr: "Washly MTL — Collecte et livraison de lessive à Montréal | Prêt en 24 h",
    };
    const DESC = {
      en: meta ? meta.content : "",
      fr: "Washly récupère, lave, plie et livre votre lessive partout à Montréal en 24 heures. Assuré, écologique et suivi de porte à porte. Sac standard 34,99 $, grand sac 39,99 $ — ou économisez avec un forfait mensuel.",
    };
    const applyLang = (lang) => {
      nodes.forEach((el) => {
        if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
        el.innerHTML = lang === "fr" ? el.dataset.fr : el.dataset.en;
      });
      document.documentElement.lang = lang;
      document.title = TITLE[lang];
      if (meta) meta.content = DESC[lang];
      langToggle.textContent = lang === "fr" ? "EN" : "FR";
      langToggle.setAttribute("aria-label", lang === "fr" ? "Switch to English" : "Passer en français");
      try { localStorage.setItem("washly-lang", lang); } catch (e) {}
    };
    let saved = "en";
    try { saved = localStorage.getItem("washly-lang") || "en"; } catch (e) {}
    if (saved === "fr") applyLang("fr");
    langToggle.addEventListener("click", () => {
      applyLang(document.documentElement.lang === "fr" ? "en" : "fr");
    });
  }

  /* ── Bubble generator ────────────────────── */
  function spawnBubbles(containerId, count, opts = {}) {
    const el = document.getElementById(containerId);
    if (!el || reducedMotion) return;
    const { minSize = 10, maxSize = 46, minDur = 9, maxDur = 22 } = opts;
    for (let i = 0; i < count; i++) {
      const b = document.createElement("span");
      b.className = "bubble";
      const size = minSize + Math.random() * (maxSize - minSize);
      b.style.width = b.style.height = size.toFixed(1) + "px";
      b.style.left = (Math.random() * 100).toFixed(2) + "%";
      b.style.setProperty("--sway", ((Math.random() - 0.5) * 120).toFixed(0) + "px");
      b.style.animationDuration = (minDur + Math.random() * (maxDur - minDur)).toFixed(1) + "s";
      b.style.animationDelay = (-Math.random() * maxDur).toFixed(1) + "s";
      el.appendChild(b);
    }
  }
  spawnBubbles("heroBubbles", 26);
  spawnBubbles("serviceBubbles", 12, { maxSize: 30, minDur: 14, maxDur: 26 });
  spawnBubbles("b2bBubbles", 12, { maxSize: 30, minDur: 14, maxDur: 26 });
  spawnBubbles("bookBubbles", 12, { maxSize: 30, minDur: 14, maxDur: 26 });
  spawnBubbles("ctaBubbles", 18, { maxSize: 38 });

  /* ── Scroll reveal ───────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ── Animated counters ───────────────────── */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || "0", 10);
    const suffix = el.dataset.suffix || "";
    const dur = 1800;
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const val = target * easeOut(t);
      el.textContent =
        (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-CA")) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll(".stat-num").forEach((el) => counterObserver.observe(el));

  /* ── 3D tilt cards ───────────────────────── */
  if (!reducedMotion && matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".tilt").forEach((card) => {
      let raf = null;
      card.addEventListener("mousemove", (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          const rx = (0.5 - py) * 10;
          const ry = (px - 0.5) * 12;
          card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
          card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
          raf = null;
        });
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      });
    });
  }

  /* ── Testimonial slider ──────────────────── */
  const track = document.getElementById("sliderTrack");
  const dotsWrap = document.getElementById("sliderDots");
  if (track && dotsWrap) {
    const slides = track.children.length;
    let index = 0;
    let timer = null;

    for (let i = 0; i < slides; i++) {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", "Go to review " + (i + 1));
      dot.addEventListener("click", () => {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    }
    const dots = [...dotsWrap.children];

    function goTo(i) {
      index = (i + slides) % slides;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle("active", j === index));
    }
    function restart() {
      clearInterval(timer);
      if (!reducedMotion) timer = setInterval(() => goTo(index + 1), 5500);
    }

    // swipe support
    let startX = null;
    track.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
    track.addEventListener(
      "touchend",
      (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
        startX = null;
        restart();
      },
      { passive: true }
    );

    goTo(0);
    restart();
  }

  /* ── FAQ: close others when one opens ────── */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) faqItems.forEach((other) => other !== item && (other.open = false));
    });
  });

  /* ── Payment return banner (?paid=1) ─────── */
  if (/[?&]paid=1/.test(location.search)) {
    const bar = document.createElement("div");
    bar.textContent = "🎉 Payment received — your pickup is confirmed! Check your phone for details.";
    bar.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:300;background:#15181A;color:#C9F53C;" +
      "font-family:'Archivo',sans-serif;font-weight:700;text-align:center;padding:14px 16px;font-size:.95rem;";
    document.body.appendChild(bar);
    setTimeout(() => bar.remove(), 7000);
    history.replaceState({}, "", location.pathname);
  }

  /* ── Scroll progress bar ─────────────────── */
  const progress = document.getElementById("scrollProgress");
  if (progress) {
    const updateProgress = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  /* ── Instant quote widget ────────────────── */
  const qCount = document.getElementById("qCount");
  const qTotal = document.getElementById("qTotal");
  const qSeg = document.getElementById("qSeg");
  if (qCount && qTotal && qSeg) {
    let count = 1;
    let price = 34.99;
    const fmt = (n) =>
      document.documentElement.lang === "fr"
        ? n.toFixed(2).replace(".", ",") + " $"
        : "$" + n.toFixed(2);
    const render = () => {
      qCount.textContent = count;
      qTotal.textContent = fmt(price * count);
    };
    qSeg.addEventListener("click", (e) => {
      const btn = e.target.closest(".seg-btn");
      if (!btn) return;
      qSeg.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      price = parseFloat(btn.dataset.price);
      render();
    });
    document.getElementById("qPlus").addEventListener("click", () => {
      count = Math.min(count + 1, 8);
      render();
    });
    document.getElementById("qMinus").addEventListener("click", () => {
      count = Math.max(count - 1, 1);
      render();
    });
    // re-render on language switch so currency format follows
    const lt = document.getElementById("langToggle");
    if (lt) lt.addEventListener("click", () => setTimeout(render, 0));
    render();
  }

  /* ── Live social-proof toasts ────────────── */
  const toastStack = document.getElementById("toastStack");
  if (toastStack && !reducedMotion) {
    const areas = ["Le Plateau", "Mile End", "Griffintown", "Verdun", "NDG", "Outremont", "Rosemont", "Villeray", "Saint-Henri", "Westmount", "Côte-des-Neiges", "Ville-Marie"];
    const mins = () => Math.floor(Math.random() * 12) + 2;
    const msg = () => {
      const area = areas[Math.floor(Math.random() * areas.length)];
      const fr = document.documentElement.lang === "fr";
      const emojis = ["🧺", "✨", "🚗", "💚"];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const actionEn = ["just booked a pickup", "scheduled a 24h wash", "got fresh laundry delivered"][Math.floor(Math.random() * 3)];
      const actionFr = ["vient de réserver une collecte", "a planifié un lavage 24h", "a reçu son linge frais"][Math.floor(Math.random() * 3)];
      return {
        emoji,
        title: fr ? `Quelqu'un à ${area}` : `Someone in ${area}`,
        sub: fr ? `${actionFr} · il y a ${mins()} min` : `${actionEn} · ${mins()} min ago`,
      };
    };
    const show = () => {
      const d = msg();
      const el = document.createElement("div");
      el.className = "toast";
      el.innerHTML = `<span class="toast-emoji">${d.emoji}</span><span class="toast-body"><strong>${d.title}</strong><small>${d.sub}</small></span>`;
      toastStack.appendChild(el);
      setTimeout(() => el.classList.add("show"), 40);
      setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => el.remove(), 600);
      }, 5000);
    };
    setTimeout(show, 4000);
    setInterval(show, 11000);
  }

  /* ── Booking wizard ──────────────────────── */
  const wizard = document.getElementById("wizard");
  if (wizard) {
    const panels = wizard.querySelectorAll(".wiz-panel");
    const stepEls = wizard.querySelectorAll(".wiz-step");
    const barFill = document.getElementById("wizBarFill");
    const state = { bag: "standard", price: 34.99, address: "", unit: "", notes: "", date: "", time: "", name: "", email: "", phone: "" };
    let step = 1;

    const money = (n) =>
      document.documentElement.lang === "fr" ? n.toFixed(2).replace(".", ",") + " $" : "$" + n.toFixed(2);

    const go = (n) => {
      step = n;
      panels.forEach((p) => p.classList.toggle("active", p.dataset.panel === String(n)));
      stepEls.forEach((s, i) => {
        s.classList.toggle("active", i === n - 1);
        s.classList.toggle("done", i < n - 1);
      });
      if (typeof n === "number") barFill.style.width = (n / 3) * 100 + "%";
      if (n === 3) renderSummary();
    };

    const renderTotals = () => {
      document.getElementById("wTotal").textContent = money(state.price);
    };

    const renderSummary = () => {
      const fr = document.documentElement.lang === "fr";
      const bagName = state.bag === "large" ? (fr ? "Grand sac" : "Large bag") : (fr ? "Sac standard" : "Standard bag");
      const addr = state.address + (state.unit ? " #" + state.unit : "");
      const rows = [
        [fr ? "Sac" : "Bag", bagName],
        [fr ? "Adresse" : "Address", addr || "—"],
        [fr ? "Quand" : "When", `${state.date || "—"} · ${state.time || "—"}`],
      ];
      const el = document.getElementById("wSummary");
      el.innerHTML =
        rows.map((r) => `<div><span>${r[0]}</span><span>${r[1]}</span></div>`).join("") +
        `<div class="ws-total"><span>${fr ? "Total" : "Total"}</span><span>${money(state.price)}</span></div>`;
    };

    // bag selection
    wizard.querySelectorAll(".bagpick-card").forEach((card) => {
      card.addEventListener("click", () => {
        wizard.querySelectorAll(".bagpick-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        state.bag = card.dataset.bag;
        state.price = parseFloat(card.dataset.price);
        renderTotals();
      });
    });
    // time chips
    wizard.querySelectorAll("#wTime .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        wizard.querySelectorAll("#wTime .chip").forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
        state.time = chip.dataset.val;
      });
    });

    // date min = today
    const wDate = document.getElementById("wDate");
    wDate.min = new Date().toISOString().split("T")[0];

    // nav buttons
    wizard.querySelectorAll("[data-next]").forEach((b) =>
      b.addEventListener("click", () => {
        const target = parseInt(b.dataset.next);
        if (target === 3) {
          // validate step 2
          state.address = document.getElementById("wAddress").value.trim();
          state.unit = document.getElementById("wUnit").value.trim();
          state.notes = document.getElementById("wNotes").value.trim();
          state.date = wDate.value;
          const ok = state.address && state.date && state.time;
          document.getElementById("wErr2").hidden = !!ok;
          document.getElementById("wAddress").classList.toggle("bad", !state.address);
          wDate.classList.toggle("bad", !state.date);
          if (!ok) return;
        }
        go(target);
      })
    );
    wizard.querySelectorAll("[data-back]").forEach((b) =>
      b.addEventListener("click", () => go(parseInt(b.dataset.back)))
    );

    // submit
    const submitBtn = document.getElementById("wSubmit");
    submitBtn.addEventListener("click", async () => {
      const fr = document.documentElement.lang === "fr";
      state.name = document.getElementById("wName").value.trim();
      state.email = document.getElementById("wEmail").value.trim();
      state.phone = document.getElementById("wPhone").value.trim();
      const emailOk = /.+@.+\..+/.test(state.email);
      const ok = state.name && emailOk && state.phone;
      document.getElementById("wErr3").hidden = !!ok;
      document.getElementById("wName").classList.toggle("bad", !state.name);
      document.getElementById("wEmail").classList.toggle("bad", !emailOk);
      document.getElementById("wPhone").classList.toggle("bad", !state.phone);
      if (!ok) return;

      submitBtn.disabled = true;
      submitBtn.textContent = fr ? "Un instant…" : "One moment…";

      const payload = {
        customer_name: state.name,
        customer_email: state.email,
        customer_phone: state.phone,
        pickup_address: state.address,
        apartment_unit: state.unit,
        pickup_instructions: state.notes,
        pickup_date: state.date,
        pickup_time_range: state.time,
        bag_size: state.bag,
      };

      const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);
      const done = (msg) => {
        document.getElementById("wDoneMsg").textContent = msg;
        go("done");
        stepEls.forEach((s) => s.classList.add("done"));
        barFill.style.width = "100%";
      };

      if (isLocal) {
        done(fr
          ? "Aperçu local : sur le site en ligne, vous seriez maintenant redirigé vers le paiement sécurisé Stripe. Tout le reste fonctionne ! 🎉"
          : "Local preview: on the live site you'd now go to secure Stripe checkout. Everything else works! 🎉");
        return;
      }
      try {
        const res = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.url) { window.location.href = data.url; return; }
        throw new Error(data.error || "error");
      } catch (e) {
        done(fr
          ? "Nous avons bien reçu votre demande — nous vous contactons pour finaliser. Merci !"
          : "We've got your request — we'll reach out to finalize. Thank you!");
      }
    });

    // prefill from the instant-quote widget
    const quoteReserve = document.getElementById("quoteReserve");
    if (quoteReserve) {
      quoteReserve.addEventListener("click", () => {
        const activeSeg = document.querySelector("#qSeg .seg-btn.active");
        if (activeSeg) {
          const price = parseFloat(activeSeg.dataset.price);
          const bag = price >= 39 ? "large" : "standard";
          wizard.querySelectorAll(".bagpick-card").forEach((c) => c.classList.toggle("selected", c.dataset.bag === bag));
          state.bag = bag; state.price = price;
          renderTotals();
        }
      });
    }

    // re-render currency/summary on language switch
    const lt2 = document.getElementById("langToggle");
    if (lt2) lt2.addEventListener("click", () => setTimeout(() => { renderTotals(); if (step === 3) renderSummary(); }, 0));

    renderTotals();
  }

  /* ── Magnetic buttons (desktop) ──────────── */
  if (!reducedMotion && matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".btn-primary.btn-lg, .btn-invert.btn-lg").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.15}px, ${my * 0.22}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }
})();
