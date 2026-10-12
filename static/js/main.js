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
          if (!reduceMotion && !v.dataset.userPaused) v.play().catch(() => {});
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

  /* ---------- keyboard / click control for clips without native controls ----------
     click: play/pause · ←/→: seek ±2 s · space/k: play/pause (focused or hovered clip) */
  const SEEK = 2;
  const bare = clips.filter((v) => !v.controls);
  let hovered = null;
  function toggle(v) {
    load(v);
    if (v.paused) { delete v.dataset.userPaused; v.play().catch(() => {}); }
    else { v.dataset.userPaused = "1"; v.pause(); }
  }
  function seek(v, dt) {
    if (!v.dataset.loaded || !isFinite(v.duration)) return;
    const t = v.currentTime + dt, d = v.duration;
    v.currentTime = ((t % d) + d) % d;  // wrap, since clips loop
  }
  bare.forEach((v) => {
    v.tabIndex = 0;
    v.setAttribute("role", "button");
    v.setAttribute("aria-label", (v.getAttribute("aria-label") || "Clip") +
      " (click or space to play/pause, arrow keys to seek)");
    v.addEventListener("click", () => toggle(v));
    v.addEventListener("mouseenter", () => { hovered = v; });
    v.addEventListener("mouseleave", () => { if (hovered === v) hovered = null; });
    v.addEventListener("play", () => v.closest(".clip")?.classList.remove("is-paused"));
    v.addEventListener("pause", () => v.closest(".clip")?.classList.toggle("is-paused", !!v.dataset.userPaused));
  });
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const a = document.activeElement;
    const v = bare.includes(a) ? a
      : (hovered && (!a || a === document.body)) ? hovered : null;
    if (!v) return;
    if (e.key === "ArrowLeft") seek(v, -SEEK);
    else if (e.key === "ArrowRight") seek(v, SEEK);
    else if (e.key === " " || e.key === "k") toggle(v);
    else return;
    e.preventDefault();
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
