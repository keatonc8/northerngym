/* Scroll Snap Pagination (no page-jumping) */
(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const BREAKPOINTS = {
    sm: "(min-width: 640px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
    xl: "(min-width: 1280px)",
    "2xl": "(min-width: 1536px)"
  };

  function getBpMQ(scroller) {
    const bp = scroller.getAttribute("data-snap-breakpoint") || "md";
    const mq = BREAKPOINTS[bp];
    return mq ? window.matchMedia(mq) : window.matchMedia("(min-width: 768px)");
  }

  function isDesktopMode(scroller) {
    return getBpMQ(scroller).matches;
  }

  function scrollToItem(scroller, item, behavior = "auto") {
    // Scroll horizontally *within* the scroller; never scroll the page
    const left = item.offsetLeft - scroller.offsetLeft;
    scroller.scrollTo({
      left,
      behavior: prefersReduced.matches ? "auto" : behavior
    });
  }

  function initSnapCarousel(scroller) {
    if (!scroller || scroller.dataset.snapInit === "true") return;

    const root = scroller.closest("section") || document;
    const dotsWrap = root.querySelector("[data-snap-dots]");
    if (!dotsWrap) return;

    const items = Array.from(scroller.querySelectorAll(".snap-start"));
    if (!items.length) return;

    scroller.dataset.snapInit = "true";
    dotsWrap.innerHTML = "";

    const dots = items.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className =
        "h-2 w-2 rounded-full bg-zinc-300 transition-all aria-[current=true]:w-10 aria-[current=true]:bg-zinc-800";
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);

      b.addEventListener("click", (e) => {
        e.preventDefault();
        // optionally prevent focus scroll on some browsers:
        if (b.focus) b.focus({ preventScroll: true });

        scrollToItem(scroller, items[i], "smooth");
      });

      dotsWrap.appendChild(b);
      return b;
    });

    const setActive = (idx) => {
      dots.forEach((d, i) =>
        d.setAttribute("aria-current", i === idx ? "true" : "false")
      );
    };

    // Active dot tracking
    const io = new IntersectionObserver(
      (entries) => {
        if (isDesktopMode(scroller)) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActive(items.indexOf(visible.target));
      },
      { root: scroller, threshold: [0.4, 0.6, 0.8] }
    );

    items.forEach((el) => io.observe(el));
    setActive(0);

    const startIndex =
      parseInt(scroller.getAttribute("data-snap-start-index") || "0", 10) || 0;

    const resetToStartIfMobile = () => {
      if (!isDesktopMode(scroller)) {
        const target = items[startIndex] || items[0];
        // Only horizontal reset; no scrollIntoView()
        scroller.scrollTo({ left: 0, behavior: "auto" });
        scrollToItem(scroller, target, "auto");
        setActive(startIndex);
      } else {
        setActive(startIndex);
      }
    };

    // Run now
    resetToStartIfMobile();

    // IMPORTANT: don't use window.resize on mobile (it fires during scroll).
    // Instead, reset only when the breakpoint mode actually changes:
    const mq = getBpMQ(scroller);
    const onModeChange = () => resetToStartIfMobile();

    if (mq.addEventListener) mq.addEventListener("change", onModeChange);
    else mq.addListener(onModeChange);

    document.addEventListener("shopify:section:load", resetToStartIfMobile);
  }

  function boot() {
    document.querySelectorAll("[data-snap-carousel]").forEach(initSnapCarousel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("shopify:section:load", boot);
})();