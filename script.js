const header = document.querySelector("[data-header]");
const hero = document.querySelector("[data-hero]");
const heroLinks = [...document.querySelectorAll("[data-hero-color]")];
const worksSection = document.querySelector("[data-horizontal-section]");
const track = document.querySelector("[data-project-track]");
const cards = [...document.querySelectorAll("[data-project-card]")];
const headerContext = document.querySelector("[data-header-context]");
const sectionLinks = [...document.querySelectorAll("[data-section-link]")];
const pageSections = [...document.querySelectorAll("[data-nav-section]")];
const lightboxLinks = [...document.querySelectorAll("[data-lightbox]")];
const lightbox = document.querySelector("[data-lightbox-dialog]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const workProgress = document.querySelector("[data-work-progress]");
const mobileWorkProgress = document.querySelector("[data-mobile-work-progress]");
const placeholderLinks = [...document.querySelectorAll("[data-placeholder-link]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobile = window.matchMedia("(max-width: 767px)");

document.querySelector("[data-year]").textContent = new Date().getFullYear();

let ticking = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setWorkProgress(progress) {
  const percentage = `${clamp(progress, 0, 1) * 100}%`;
  workProgress.style.width = percentage;
  mobileWorkProgress.style.transform = `scaleX(${clamp(progress, 0, 1)})`;
}

function measureWorks() {
  if (mobile.matches) {
    worksSection.style.height = "";
    return;
  }
  const horizontalTravel = Math.max(0, track.scrollWidth - window.innerWidth);
  worksSection.style.height = `${window.innerHeight + horizontalTravel}px`;
}

function updatePage() {
  ticking = false;
  header.classList.toggle("is-visible", window.scrollY > Math.max(80, window.innerHeight * 0.56));

  const sectionLine = window.innerHeight * 0.36;
  const activeSection = pageSections.find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= sectionLine && rect.bottom > sectionLine;
  });
  const activeId = activeSection?.dataset.navSection || "top";

  sectionLinks.forEach((link) => {
    const active = link.dataset.sectionLink === activeId;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  headerContext.textContent = "";
  header.classList.toggle("show-mobile-progress", activeSection === worksSection);
  if (mobile.matches) return;

  const rect = worksSection.getBoundingClientRect();
  const travelY = worksSection.offsetHeight - window.innerHeight;
  const progress = clamp(-rect.top / travelY, 0, 1);
  const maxX = Math.max(0, track.scrollWidth - window.innerWidth);
  const x = progress * maxX;
  track.style.transform = `translate3d(${-x}px, -50%, 0)`;
  setWorkProgress(progress);

  const center = window.innerWidth / 2;
  let closestIndex = 0;
  let closestDistance = Infinity;

  cards.forEach((card, index) => {
    const cardCenter = card.offsetLeft - x + card.offsetWidth / 2;
    const normalized = clamp((cardCenter - center) / center, -1.25, 1.25);
    const distance = Math.abs(cardCenter - center);

    if (!reducedMotion.matches) {
      const rotation = normalized * -1.35;
      const lift = Math.abs(normalized) * 16;
      const scale = 1 - Math.min(Math.abs(normalized) * 0.025, 0.035);
      card.style.transform = `translateY(${lift}px) rotate(${rotation}deg) scale(${scale})`;
    }

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

}

function requestUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updatePage);
}

function updateMobileWorks() {
  if (!mobile.matches) return;
  const maxScroll = Math.max(1, track.scrollWidth - track.clientWidth);
  setWorkProgress(track.scrollLeft / maxScroll);
}

heroLinks.forEach((link) => {
  const applyColor = () => hero.style.setProperty("--hero-color", link.dataset.heroColor);
  link.addEventListener("pointerenter", applyColor);
  link.addEventListener("focus", applyColor);
});
hero.querySelector(".hero-nav").addEventListener("pointerleave", () => {
  hero.style.setProperty("--hero-color", "#191b19");
});
hero.querySelector(".hero-nav").addEventListener("focusout", (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) hero.style.setProperty("--hero-color", "#191b19");
});

lightboxLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const sourceImage = link.querySelector("img");
    lightboxImage.src = link.getAttribute("href");
    lightboxImage.alt = sourceImage?.alt || "Project image";
    lightboxCaption.textContent = link.dataset.caption || "";
    lightbox.showModal();
  });
});

lightboxClose.addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("load", () => {
  measureWorks();
  requestUpdate();
  updateMobileWorks();
});
window.addEventListener("pageshow", () => {
  measureWorks();
  requestUpdate();
});
window.addEventListener("resize", () => {
  measureWorks();
  requestUpdate();
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
placeholderLinks.forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));

setWorkProgress(0);
measureWorks();
updatePage();
