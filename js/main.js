// Рік у футері
document.getElementById("year").textContent = new Date().getFullYear();

// Повертаємо сторінку до самого початку, незалежно від sticky-навігації.
document.querySelector(".to-top")?.addEventListener("click", (event) => {
  event.preventDefault();
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  window.scrollTo({ top: 0, behavior });
});

// Підсвічування активного пункту меню
const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("main section[id]");

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id)
        );
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((s) => navObserver.observe(s));

// Плавна поява карток під час прокрутки
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Лайтбокс — події делеговано: працює і для динамічно завантажених фото.
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxSource = document.getElementById("lightbox-source");
let previousFocus = null;

function openLightbox(button) {
  const img = button.querySelector("img");
  if (!img) return;
  previousFocus = document.activeElement;
  lightboxImg.src = button.dataset.imageSrc || img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = button.dataset.caption || "";
  const postUrl = button.dataset.postUrl;
  lightboxSource.hidden = !postUrl;
  if (postUrl) lightboxSource.href = postUrl;
  lightbox.hidden = false;
  lightboxClose.focus();
}

const galleryRoot = document.getElementById("gallery");
if (galleryRoot) {
  galleryRoot.addEventListener("click", (event) => {
    const button = event.target.closest(".art-tile");
    if (button && galleryRoot.contains(button)) {
      if (button.dataset.hasPhoto === "false") {
        // За відсутності локальної картинки переходимо одразу до джерела.
        const url = button.dataset.postUrl;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      } else {
        openLightbox(button);
      }
    }
  });
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.removeAttribute("src");
  lightboxSource.hidden = true;
  if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
}
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "Tab") {
    const items = [lightboxClose, ...(!lightboxSource.hidden ? [lightboxSource] : [])];
    const current = items.indexOf(document.activeElement);
    if (e.shiftKey && current <= 0) { items[items.length - 1].focus(); e.preventDefault(); }
    else if (!e.shiftKey && current === items.length - 1) { items[0].focus(); e.preventDefault(); }
  }
});
