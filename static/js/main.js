(function () {
  "use strict";

  /* ---------- lazy autoplay clips: load when near the viewport, pause offscreen ---------- */
  const clips = Array.from(document.querySelectorAll("video[data-lazy]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function load(video) {
    if (video.dataset.loaded) return;
    video.querySelectorAll("source[data-src]").forEach((s) => { s.src = s.dataset.src; });
    video.load();
    video.dataset.loaded = "1";
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
          load(v);
          if (!reduceMotion) v.play().catch(() => {});
        } else if (v.dataset.loaded) {
          v.pause();
        }
      });
    }, { rootMargin: "200px 0px" });
    clips.forEach((v) => io.observe(v));
  } else {
    clips.forEach(load);
  }
  if (reduceMotion) {
    document.querySelectorAll("video[autoplay]").forEach((v) => {
      v.removeAttribute("autoplay"); v.pause(); v.controls = true;
    });
  }

  /* ---------- A/B/C map <-> readiness table linking ---------- */
  const starts = Array.from(document.querySelectorAll(".start"));
  const rows = Array.from(document.querySelectorAll(".prior-table tr[data-row]"));
  function hot(key) {
    starts.forEach((s) => s.classList.toggle("is-hot", s.dataset.start === key));
    rows.forEach((r) => r.classList.toggle("is-hot", r.dataset.row === key));
  }
  starts.concat(rows).forEach((el) => {
    const key = el.dataset.start || el.dataset.row;
    el.addEventListener("mouseenter", () => hot(key));
    el.addEventListener("mouseleave", () => hot(null));
  });

  /* ---------- copy BibTeX ---------- */
  const copy = document.querySelector(".copy");
  if (copy) {
    copy.addEventListener("click", () => {
      const text = document.getElementById("bibtex-text").textContent;
      const done = () => { copy.textContent = "Copied"; copy.classList.add("done");
        setTimeout(() => { copy.textContent = "Copy"; copy.classList.remove("done"); }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done).catch(() => {});
    });
  }
})();
