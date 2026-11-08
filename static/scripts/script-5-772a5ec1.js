
document.addEventListener("nav", () => {
  const $ = (s, r) => (r || document).querySelector(s)
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s))
  const nEl = $("#dk-n")
  if (!nEl) return
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
  const slides = $$(".slide").filter((s) => !s.parentElement.closest(".slide"))
  const tEl = $("#dk-title"), bar = $("#dk-bar"), prev = $("#dk-prev"), next = $("#dk-next"), total = $("#dk-total")
  if (!slides.length) { const nav = $(".decknav"); if (nav) nav.hidden = true; const p = $(".dk-progress"); if (p) p.hidden = true; return }
  let cur = 0
  const pad = (n) => String(n).padStart(2, "0")
  function current() {
    const y = innerHeight * 0.35
    let i = 0
    slides.forEach((s, k) => { if (s.getBoundingClientRect().top <= y) i = k })
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) i = slides.length - 1
    return i
  }
  function update() {
    cur = current()
    nEl.textContent = pad(cur + 1)
    tEl.textContent = slides[cur].dataset.title || ""
    prev.disabled = cur === 0
    const last = cur === slides.length - 1
    next.classList.toggle("last", last)
    next.setAttribute("aria-label", last ? "回到第一頁" : "下一頁")
    bar.style.transform = "scaleX(" + (cur + 1) / slides.length + ")"
  }
  const behavior = reduce ? "auto" : "smooth"
  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i))
    if (i === 0) { scrollTo({ top: 0, behavior }); return }
    slides[i].scrollIntoView({ behavior, block: "start" })
  }
  function forward() {
    if (cur === slides.length - 1) { go(0); return }
    const r = slides[cur].getBoundingClientRect()
    if (r.bottom > innerHeight + 40) scrollBy({ top: Math.min(r.bottom - innerHeight + 8, innerHeight * 0.85), behavior })
    else go(cur + 1)
  }
  function back() {
    const r = slides[cur].getBoundingClientRect()
    if (r.top < -40) scrollBy({ top: Math.max(r.top - 8, -innerHeight * 0.85), behavior })
    else go(cur - 1)
  }
  function onKey(e) {
    const t = e.target
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (t.closest && t.closest("input,textarea,select,video,[data-keys-own]")) return
    if (e.key === " " && t.closest && t.closest("button,a,[role=button]")) return
    if (["ArrowDown", "ArrowRight", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey)) { e.preventDefault(); forward() }
    else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) { e.preventDefault(); back() }
    else if (e.key === "Home") { e.preventDefault(); go(0) }
    else if (e.key === "End") { e.preventDefault(); go(slides.length - 1) }
  }
  let ticking = false
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false }) } }
  total.textContent = pad(slides.length)
  addEventListener("scroll", onScroll, { passive: true })
  addEventListener("resize", update)
  addEventListener("keydown", onKey)
  next.addEventListener("click", forward)
  prev.addEventListener("click", back)
  if (window.addCleanup) {
    window.addCleanup(() => {
      removeEventListener("scroll", onScroll)
      removeEventListener("resize", update)
      removeEventListener("keydown", onKey)
    })
  }
  update()
})
