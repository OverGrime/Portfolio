const header = document.querySelector("[data-header]");
const section = document.querySelector("[data-horizontal-section]");
const track = document.querySelector("[data-project-track]");
const cards = [...document.querySelectorAll("[data-project-card]")];
const headerContext = document.querySelector("[data-header-context]");
const sectionLinks = [...document.querySelectorAll("[data-section-link]")];
const pageSections = [...document.querySelectorAll("#works, #references, #contact")];
const referenceTrack = document.querySelector("[data-reference-track]");
const referenceItems = [...referenceTrack.children];
const referenceWindow = referenceTrack.parentElement;
const referencePrevious = document.querySelector("[data-reference-prev]");
const referenceNext = document.querySelector("[data-reference-next]");
const lightboxLinks = [...document.querySelectorAll("[data-lightbox]")];
const lightbox = document.querySelector("[data-lightbox-dialog]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const mobileProgress = document.querySelector("[data-mobile-progress]");
const mobileCount = document.querySelector("[data-mobile-count]");
const workIndex = document.querySelector("[data-work-index-dialog]");
const workIndexOpen = document.querySelector("[data-work-index-open]");
const workIndexClose = document.querySelector("[data-work-index-close]");
const workIndexGrid = document.querySelector("[data-work-index-grid]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobile = window.matchMedia("(max-width: 760px)");

document.querySelector("[data-year]").textContent = new Date().getFullYear();
let ticking = false;
let workCounter = `01 — ${String(cards.length).padStart(2, "0")}`;
let referenceOffset = 0;
let referenceWidth = 0;
let referenceTarget = null;
let referenceHover = false;
let referenceDragging = false;
let dragStartX = 0;
let dragStartOffset = 0;
let resumeAt = 0;
let mobileWorkIndex = 0;

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

function measureWorks() {
  if (mobile.matches) {
    section.style.height = "";
    return;
  }
  const horizontalTravel = Math.max(0, track.scrollWidth - window.innerWidth);
  section.style.height = `${window.innerHeight + horizontalTravel}px`;
}

function updatePage() {
  ticking = false;
  const heroThreshold = Math.max(80, window.innerHeight * 0.56);
  header.classList.toggle("is-visible", window.scrollY > heroThreshold);

  const sectionLine = window.innerHeight * 0.36;
  const activeSection = pageSections.find((item) => {
    const rect = item.getBoundingClientRect();
    return rect.top <= sectionLine && rect.bottom > sectionLine;
  });
  const activeId = activeSection?.id || "top";

  sectionLinks.forEach((link) => {
    const active = link.dataset.sectionLink === activeId;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  headerContext.textContent = activeId === "works" ? workCounter : "";
  header.classList.toggle("show-mobile-progress", activeId === "works");

  if (mobile.matches) return;

  const rect = section.getBoundingClientRect();
  const travelY = section.offsetHeight - window.innerHeight;
  const progress = clamp(-rect.top / travelY, 0, 1);
  const maxX = Math.max(0, track.scrollWidth - window.innerWidth);
  const x = progress * maxX;
  track.style.transform = `translate3d(${-x}px, -50%, 0)`;

  const center = window.innerWidth / 2;
  let closestIndex = 0;
  let closestDistance = Infinity;

  cards.forEach((card, index) => {
    const cardCenter = card.offsetLeft - x + card.offsetWidth / 2;
    const normalized = clamp((cardCenter - center) / center, -1.4, 1.4);
    const distance = Math.abs(cardCenter - center);
    const rotation = normalized * -4.5;
    const lift = Math.abs(normalized) * 34;
    const scale = 1 - Math.min(Math.abs(normalized) * 0.055, 0.08);
    if (!reducedMotion.matches) card.style.transform = `translateY(${lift}px) rotate(${rotation}deg) scale(${scale})`;
    if (distance < closestDistance) { closestDistance = distance; closestIndex = index; }
  });

  workCounter = `${String(closestIndex + 1).padStart(2, "0")} — ${String(cards.length).padStart(2, "0")}`;
  if (activeId === "works") headerContext.textContent = workCounter;
}

referenceItems.forEach((item) => {
  const clone = item.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  referenceTrack.appendChild(clone);
});

function measureReferences() {
  referenceWidth = referenceItems.reduce((total, item) => total + item.getBoundingClientRect().width, 0);
}

function normalizeReferenceOffset() {
  if (!referenceWidth) return;
  while (referenceOffset <= -referenceWidth) referenceOffset += referenceWidth;
  while (referenceOffset > 0) referenceOffset -= referenceWidth;
}

function animateReferences() {
  if (referenceTarget !== null) {
    const distance = referenceTarget - referenceOffset;
    referenceOffset += distance * 0.11;
    if (Math.abs(distance) < 0.5) {
      referenceOffset = referenceTarget;
      referenceTarget = null;
      resumeAt = performance.now() + 1400;
    }
  } else if (!reducedMotion.matches && !referenceHover && !referenceDragging && performance.now() > resumeAt) {
    referenceOffset -= 0.42;
  }

  normalizeReferenceOffset();
  referenceTrack.style.transform = `translate3d(${referenceOffset}px, 0, 0)`;
  requestAnimationFrame(animateReferences);
}

function moveReferences(direction) {
  const itemWidth = referenceItems[0]?.getBoundingClientRect().width || 0;
  if (direction > 0 && referenceOffset + itemWidth > 0) referenceOffset -= referenceWidth;
  if (direction < 0 && referenceOffset - itemWidth <= -referenceWidth) referenceOffset += referenceWidth;
  referenceTarget = referenceOffset + direction * itemWidth;
}

function requestUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updatePage);
}

function updateMobileWorks() {
  if (!mobile.matches) return;
  const trackCenter = track.scrollLeft + track.clientWidth / 2;
  let closestIndex = 0;
  let closestDistance = Infinity;

  cards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const distance = Math.abs(cardCenter - trackCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  if (closestIndex === mobileWorkIndex && mobileCount.textContent) return;
  mobileWorkIndex = closestIndex;
  mobileProgress.style.width = `${((closestIndex + 1) / cards.length) * 100}%`;
  mobileCount.textContent = `${String(closestIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
}

window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("load", () => {
  measureWorks();
  requestUpdate();
});
window.addEventListener("pageshow", () => {
  measureWorks();
  requestUpdate();
});
window.addEventListener("resize", () => {
  measureWorks();
  requestUpdate();
  measureReferences();
  normalizeReferenceOffset();
  updateMobileWorks();
});
mobile.addEventListener("change", () => {
  cards.forEach((card) => { card.style.transform = ""; });
  track.style.transform = "";
  measureWorks();
  requestUpdate();
  updateMobileWorks();
});
track.addEventListener("scroll", updateMobileWorks, { passive: true });

referencePrevious.addEventListener("click", () => {
  moveReferences(1);
});

referenceNext.addEventListener("click", () => {
  moveReferences(-1);
});

referenceWindow.addEventListener("mouseenter", () => { referenceHover = true; });
referenceWindow.addEventListener("mouseleave", () => { referenceHover = false; resumeAt = performance.now() + 700; });
referenceWindow.addEventListener("pointerdown", (event) => {
  referenceDragging = true;
  referenceTarget = null;
  dragStartX = event.clientX;
  dragStartOffset = referenceOffset;
  referenceWindow.classList.add("is-dragging");
  referenceWindow.setPointerCapture(event.pointerId);
});
referenceWindow.addEventListener("pointermove", (event) => {
  if (!referenceDragging) return;
  referenceOffset = dragStartOffset + event.clientX - dragStartX;
  normalizeReferenceOffset();
});
referenceWindow.addEventListener("pointerup", (event) => {
  referenceDragging = false;
  resumeAt = performance.now() + 1600;
  referenceWindow.classList.remove("is-dragging");
  referenceWindow.releasePointerCapture(event.pointerId);
});
referenceWindow.addEventListener("pointercancel", () => {
  referenceDragging = false;
  referenceWindow.classList.remove("is-dragging");
});

lightboxLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const sourceImage = link.querySelector("img");
    const projectTitle = link.closest(".project-card").querySelector("h2")?.textContent || "Proje görseli";
    lightboxImage.src = link.getAttribute("href");
    lightboxImage.alt = sourceImage.alt;
    lightboxCaption.textContent = projectTitle;
    lightbox.showModal();
  });
});

lightboxClose.addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

cards.forEach((card, index) => {
  const button = document.createElement("button");
  button.type = "button";
  const image = card.querySelector("img");
  const title = card.querySelector("h2")?.textContent || `İş ${index + 1}`;
  if (image) {
    const thumbnail = image.cloneNode();
    thumbnail.alt = "";
    button.appendChild(thumbnail);
  } else {
    const placeholder = document.createElement("span");
    placeholder.className = "work-index-placeholder";
    placeholder.textContent = "+";
    button.appendChild(placeholder);
  }
  const label = document.createElement("span");
  label.textContent = `${String(index + 1).padStart(2, "0")} — ${title}`;
  button.appendChild(label);
  button.addEventListener("click", () => {
    workIndex.close();
    const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left, behavior: reducedMotion.matches ? "auto" : "smooth" });
  });
  workIndexGrid.appendChild(button);
});

workIndexOpen.addEventListener("click", () => workIndex.showModal());
workIndexClose.addEventListener("click", () => workIndex.close());
workIndex.addEventListener("click", (event) => {
  if (event.target === workIndex) workIndex.close();
});

measureWorks();
updatePage();
measureReferences();
updateMobileWorks();
requestAnimationFrame(animateReferences);
