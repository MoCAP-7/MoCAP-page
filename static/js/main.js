(function () {
  "use strict";

  /* ---------- method tabs ---------- */
  const tabs = Array.from(document.querySelectorAll(".tab"));
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    });
  });

  /* ---------- rollout keyframe tabs ---------- */
  const seqTabs = Array.from(document.querySelectorAll(".seq-tab"));
  seqTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      seqTabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      document.querySelectorAll("[data-seq-panel]").forEach((p) => {
        p.hidden = p.dataset.seqPanel !== tab.dataset.seq;
      });
    });
  });

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

  /* ---------- bars grow in when the table scrolls into view ---------- */
  const tables = Array.from(document.querySelectorAll("table.results"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    tables.forEach((t) => t.classList.add("is-waiting"));
    const tio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.remove("is-waiting"); tio.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    tables.forEach((t) => tio.observe(t));
  }

  /* ---------- tooltip on bars ---------- */
  const tip = document.querySelector(".tip");
  document.querySelectorAll(".bar[data-tip]").forEach((bar) => {
    bar.addEventListener("mousemove", (ev) => {
      tip.textContent = bar.dataset.tip;
      tip.hidden = false;
      tip.style.left = ev.clientX + 12 + "px";
      tip.style.top = ev.clientY - 34 + "px";
    });
    bar.addEventListener("mouseleave", () => { tip.hidden = true; });
  });

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

  /* ---------- local-preparation grid illustration ---------- */
  const g = document.getElementById("prep-grid");
  if (g) {
    const NS = "http://www.w3.org/2000/svg";
    const n = 7, cell = 26, gap = 4, x0 = 180 - (n * (cell + gap) - gap) / 2, y0 = 14;
    // Rows are forward offsets (top = +0.20 m), columns lateral (-0.15..0.15 m).
    // Feasible set is illustrative: reachable when slightly forward and to one side.
    const ok = (r, c) => r <= 3 && c >= 3 && !(r === 0 && c === 6);
    const curR = 4, curC = 3, selR = 3, selC = 3;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const rect = document.createElementNS(NS, "rect");
        rect.setAttribute("x", x0 + c * (cell + gap));
        rect.setAttribute("y", y0 + r * (cell + gap));
        rect.setAttribute("width", cell);
        rect.setAttribute("height", cell);
        rect.setAttribute("rx", 4);
        let cls = "prep-cell";
        if (ok(r, c)) cls += " ok";
        if (r === selR && c === selC) cls += " sel";
        rect.setAttribute("class", cls);
        g.appendChild(rect);
      }
    }
    const cur = document.createElementNS(NS, "rect");
    cur.setAttribute("x", x0 + curC * (cell + gap) - 2);
    cur.setAttribute("y", y0 + curR * (cell + gap) - 2);
    cur.setAttribute("width", cell + 4);
    cur.setAttribute("height", cell + 4);
    cur.setAttribute("rx", 5);
    cur.setAttribute("class", "prep-cur");
    g.appendChild(cur);
    const lab = document.createElementNS(NS, "text");
    lab.setAttribute("x", x0 - 8);
    lab.setAttribute("y", y0 + 12);
    lab.setAttribute("text-anchor", "end");
    lab.setAttribute("class", "d-small");
    lab.textContent = "fwd";
    g.appendChild(lab);
  }

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
