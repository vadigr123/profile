// Фото @poyo_a1 з локального кешу GitHub Actions. Без віджетів X і без API-токенів.
(function () {
  "use strict";
  const cfg = window.SITE_CONFIG || {};
  const username = /^[A-Za-z0-9_]{1,15}$/.test(cfg.twitterUsername || "") ? cfg.twitterUsername : "poyo_a1";
  const gallery = document.getElementById("gallery");
  const message = document.getElementById("art-message");
  const description = document.getElementById("art-description");
  const shuffleButton = document.getElementById("art-shuffle");
  if (!gallery || !message || !shuffleButton) return;

  const frameCount = Math.max(1, Math.min(12, parseInt(cfg.twitterVisibleFrames, 10) || 4));
  const placeholder = "images/art/art1.svg";
  let allPhotos = [];
  let previousSet = "";

  function safeImageUrl(raw) {
    if (typeof raw !== "string") return null;
    // Картинки, скачані GitHub Actions у цей репозиторій, — найбільш надійний варіант.
    if (/^images\/twitter\/[a-f0-9]{24}\.webp$/.test(raw)) return raw;
    try {
      const url = new URL(raw);
      return url.protocol === "https:" && url.hostname === "pbs.twimg.com" && url.pathname.startsWith("/media/") ? url.href : null;
    } catch (_) { return null; }
  }
  function safePostUrl(raw) {
    if (typeof raw !== "string") return null;
    try {
      const url = new URL(raw);
      return url.protocol === "https:" && (url.hostname === "x.com" || url.hostname === "twitter.com") &&
        new RegExp("^/" + username + "/status/[0-9]+/?$").test(url.pathname) ? url.href : null;
    } catch (_) { return null; }
  }
  function pickRandom(items, count) {
    // Fisher–Yates, міняємо лише індекси, джерела посилань не модифікуємо.
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  }
  function showRandom() {
    if (!allPhotos.length) return;
    let picked = pickRandom(allPhotos, frameCount);
    let signature = picked.map(p => p.post_url + "|" + p.image_url).join(";");
    // При достатній кількості картинок кнопка змінює добірку, а не повторює її.
    if (allPhotos.length > 1 && signature === previousSet) {
      for (let i = 0; i < 6 && signature === previousSet; i++) {
        picked = pickRandom(allPhotos, frameCount);
        signature = picked.map(p => p.post_url + "|" + p.image_url).join(";");
      }
    }
    previousSet = signature;
    const fragment = document.createDocumentFragment();
    for (const post of picked) {
      const figure = document.createElement("figure");
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "art-tile";
      tile.dataset.imageSrc = post.image_url;
      tile.dataset.postUrl = post.post_url;
      tile.dataset.caption = typeof post.text === "string" ? post.text.slice(0, 500) : "";
      tile.setAttribute("aria-label", "Відкрити арт із X на весь екран");
      const img = document.createElement("img");
      img.src = post.image_url;
      img.alt = (typeof post.alt === "string" && post.alt.trim()) || "Арт з X @" + username;
      img.loading = "lazy";
      img.decoding = "async";
      // Якщо локальна картинка видалена, залишаємо посилання на пост та зрозумілу картинку заміни.
      img.addEventListener("error", function () {
        if (!img.classList.contains("art-error")) {
          img.classList.add("art-error");
          img.src = placeholder;
          tile.dataset.imageSrc = placeholder;
        }
      }, { once: true });
      const corner = document.createElement("span");
      corner.className = "art-zoom";
      corner.setAttribute("aria-hidden", "true");
      corner.textContent = "↗";
      tile.append(img, corner);
      const link = document.createElement("a");
      link.className = "art-origin";
      link.href = post.post_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Пост у X ↗";
      figure.append(tile, link);
      fragment.appendChild(figure);
    }
    gallery.replaceChildren(fragment);
  }
  async function init() {
    try {
      if (location.protocol === "file:") {
        message.textContent = "Для завантаження артів відкрий сайт через GitHub Pages або локальний HTTP-сервер (не просто файл index.html).";
        return;
      }
      const response = await fetch(cfg.twitterGalleryFile || "data/twitter-art.json", { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (!data || data.username !== username || !Array.isArray(data.posts)) throw new Error("Невірні дані галереї");
      const seen = new Set();
      allPhotos = data.posts.filter(post => {
        if (!post || typeof post !== "object") return false;
        const url = safeImageUrl(post.image_url);
        const source = safePostUrl(post.post_url);
        if (!url || !source) return false;
        const id = source + "|" + url;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      if (!allPhotos.length) {
        message.textContent = "Ще немає отриманих фото. Локально запусти UPDATE_ARTS.bat або у GitHub Actions — Update X art gallery. Якщо обидва джерела тимчасово недоступні, рамки-заглушки залишаться.";
        return;
      }
      showRandom();
      message.hidden = true;
      shuffleButton.hidden = allPhotos.length <= 1;
      if (description) description.textContent = "Випадкові арти з моїх постів у X. Натисни, щоб збільшити, або ↻ щоб перемішати.";
      shuffleButton.addEventListener("click", showRandom);
    } catch (error) {
      message.textContent = "Не вдалося завантажити фотографії з локального кешу. Спробуй UPDATE_ARTS.bat або GitHub Actions → Update X art gallery.";
      console.info("X photo gallery:", error.message);
    }
  }
  init();
})();
