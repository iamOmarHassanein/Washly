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
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

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
})();
