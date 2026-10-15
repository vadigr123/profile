// Про мене / інтерфейс з підсвіченими словами. Без зовнішніх API.
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const nameButton = $("about-name");
  const ageButton = $("about-age");
  const countdown = $("about-countdown");
  const whiteTrigger = $("about-married");
  const whitePreview = $("about-white-preview");
  const whiteDialog = $("white-character-dialog");
  const whiteClose = $("white-character-close");
  if (!nameButton || !ageButton || !countdown || !whiteTrigger || !whiteDialog) return;

  // Спочатку "Вадім" → poyo → mikus → Вадим → Вадім ...
  const names = ["Вадім", "poyo", "mikus", "Вадим"];
  let nameIndex = 0;
  nameButton.addEventListener("click", () => {
    nameIndex = (nameIndex + 1) % names.length;
    nameButton.textContent = names[nameIndex];
    nameButton.classList.remove("name-swap");
    void nameButton.offsetWidth;
    nameButton.classList.add("name-swap");
  });

  // Вік та відлік за локальним часом відвідувача.
  function updateBirthday() {
    const now = new Date();
    const year = now.getFullYear();
    let age = year - 2007;
    if (now.getMonth() < 5 || (now.getMonth() === 5 && now.getDate() < 27)) age--;
    ageButton.textContent = String(age);
    let nextYear = year;
    const thisBirthday = new Date(year, 5, 27, 0, 0, 0, 0);
    if (now >= thisBirthday) nextYear = year + 1;
    const next = new Date(nextYear, 5, 27, 0, 0, 0, 0);
    let sec = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
    const days = Math.floor(sec / 86400); sec %= 86400;
    const hours = Math.floor(sec / 3600); sec %= 3600;
    const minutes = Math.floor(sec / 60); const seconds = sec % 60;
    countdown.textContent = `${days} дн. ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    if (now.getMonth() === 5 && now.getDate() === 27) {
      countdown.textContent = `Сьогодні свято! 🎉 Наступний: ${nextYear}`;
    }
  }
  updateBirthday();
  const countdownTimer = window.setInterval(updateBirthday, 1000);
  window.addEventListener("pagehide", () => window.clearInterval(countdownTimer), { once: true });

  // На телефонах тап показує відлік без залежності від hover.
  ageButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const anchor = ageButton.closest(".about-birthday-anchor");
    if (!anchor) return;
    const opened = anchor.dataset.open === "true";
    anchor.dataset.open = opened ? "false" : "true";
    ageButton.setAttribute("aria-expanded", String(!opened));
  });
  function closeBirthday() {
    const anchor = ageButton.closest(".about-birthday-anchor");
    if (anchor) anchor.dataset.open = "false";
    ageButton.setAttribute("aria-expanded", "false");
  }
  document.addEventListener("click", (event) => {
    const anchor = ageButton.closest(".about-birthday-anchor");
    if (anchor && !anchor.contains(event.target)) closeBirthday();
  });
  document.querySelectorAll(".about-interactive:not(#about-age)").forEach((el) => {
    el.addEventListener("pointerenter", closeBirthday);
    el.addEventListener("focus", closeBirthday);
  });

  // Character Sheet White: на ПК лише біля слова, а на клік — повноекранний діалог.
  const mouseHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  // Затримка дозволяє перейти курсором зі слова до підказки та натиснути на посилання.
  let whitePreviewHideTimer = null;
  function cancelWhitePreviewHide() {
    if (whitePreviewHideTimer !== null) {
      window.clearTimeout(whitePreviewHideTimer);
      whitePreviewHideTimer = null;
    }
  }
  function hideWhitePreview() {
    cancelWhitePreviewHide();
    if (whitePreview) {
      whitePreview.hidden = true;
      whitePreview.setAttribute("aria-hidden", "true");
    }
  }
  function scheduleWhitePreviewHide() {
    cancelWhitePreviewHide();
    whitePreviewHideTimer = window.setTimeout(hideWhitePreview, 350);
  }
  function moveWhitePreview(event) {
    if (!whitePreview || whitePreview.hidden) return;
    const gap = 16, padding = 10;
    const rect = whitePreview.getBoundingClientRect();
    let x = event.clientX + gap;
    let y = event.clientY + gap;
    if (x + rect.width + padding > innerWidth) x = event.clientX - rect.width - gap;
    if (y + rect.height + padding > innerHeight) y = event.clientY - rect.height - gap;
    whitePreview.style.left = `${Math.max(padding, Math.min(x, innerWidth - rect.width - padding))}px`;
    whitePreview.style.top = `${Math.max(padding, Math.min(y, innerHeight - rect.height - padding))}px`;
  }
  function showWhitePreview(event) {
    if (!mouseHover.matches || event.pointerType === "touch" || whiteDialog.open || !whitePreview) return;
    cancelWhitePreviewHide();
    whitePreview.hidden = false;
    whitePreview.setAttribute("aria-hidden", "false");
    moveWhitePreview(event);
  }
  whiteTrigger.addEventListener("pointerenter", showWhitePreview);
  whiteTrigger.addEventListener("pointermove", moveWhitePreview);
  whiteTrigger.addEventListener("pointerleave", scheduleWhitePreviewHide);
  whiteTrigger.addEventListener("pointercancel", hideWhitePreview);
  if (whitePreview) {
    whitePreview.addEventListener("pointerenter", cancelWhitePreviewHide);
    whitePreview.addEventListener("pointerleave", scheduleWhitePreviewHide);
    whitePreview.addEventListener("focusin", cancelWhitePreviewHide);
    whitePreview.addEventListener("focusout", (event) => {
      if (!whitePreview.contains(event.relatedTarget)) scheduleWhitePreviewHide();
    });
  }
  window.addEventListener("scroll", hideWhitePreview, { passive: true, capture: true });
  window.addEventListener("resize", hideWhitePreview);
  window.addEventListener("blur", hideWhitePreview);
  whiteTrigger.addEventListener("click", () => {
    hideWhitePreview();
    if (typeof whiteDialog.showModal === "function") {
      whiteDialog.showModal();
      whiteClose.focus();
    }
  });
  whiteClose.addEventListener("click", () => whiteDialog.close());
  whiteDialog.addEventListener("click", (event) => { if (event.target === whiteDialog) whiteDialog.close(); });
  whiteDialog.addEventListener("close", () => whiteTrigger.focus({ preventScroll: true }));
})();
