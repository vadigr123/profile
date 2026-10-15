// Персонажі з локальними Character Sheets — без API та зовнішніх бібліотек.
(() => {
  "use strict";
  const characters = {
  "poyo": {
    "name": "Poyo",
    "eng": "Sweet Mouse",
    "status": "Головна фуросна",
    "species": "Антропоморфна миша",
    "traits": [
      "Сором’язлива",
      "Мила",
      "Добра"
    ],
    "personality": "Спочатку може соромитися нових знайомств, але швидко розкривається поруч із тими, кому довіряє. Доброзичлива, уважна до почуттів інших і завжди рада підтримати.",
    "vibe": "Затишок • дружба • спокій",
    "fun": "Замість гучних слів Poyo частіше показує турботу маленькими жестами."
  },
  "mikus": {
    "name": "Mikus",
    "eng": "Silent Ocelot",
    "status": "Фурсона для публічного англомовного комюніті",
    "species": "Гібрид оцелота",
    "traits": [
      "Серйозний",
      "Сором’язливий",
      "Інтроверт"
    ],
    "personality": "Серйозний, вдумливий і небагатослівний. Не любить зайвого шуму, але вміє зосереджуватись на складних ідеях і доводити творчі задуми до результату.",
    "vibe": "Технології • тиша • креатив",
    "fun": "Виглядає відсторонено, проте найчастіше просто думає над новим проєктом.",
    "role": "Розробник AI Інструментів",
    "links": [
      [
        "Telegram ↗",
        "https://t.me/ai_mikus"
      ],
      [
        "Civitai ↗",
        "https://civitai.red/user/vadigr123_"
      ]
    ]
  },
  "merp": {
    "name": "Merp",
    "eng": "Hidden Fox",
    "status": "система не знайдена",
    "species": "Цундере лис",
    "traits": [
      "Цундере",
      "Загадковий",
      "Колючий"
    ],
    "personality": "На перший погляд різкий і трохи впертий. Насправді за цим характером може приховуватися турбота, про яку він ніколи не скаже прямо.",
    "vibe": "Секрети • сарказм • теплі вчинки",
    "fun": "Повне досьє персонажа тимчасово недоступне.",
    "glitch": true
  }
};
  const dialog = document.getElementById("character-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const $ = (id) => document.getElementById(id);
  const title = $("character-modal-title");
  const subtitle = $("character-modal-subtitle");
  const status = $("character-modal-status");
  const species = $("character-modal-species");
  const tags = $("character-modal-tags");
  const role = $("character-modal-role");
  const personality = $("character-modal-personality");
  const vibe = $("character-modal-vibe");
  const fact = $("character-modal-fact");
  const glitch = $("character-modal-glitch");
  const links = $("character-modal-links");
  const sheet = $("character-modal-sheet");
  const sheetLink = $("character-sheet-link");
  const close = $("character-dialog-close");
  let lastTrigger = null;

  // Preview прив’язаний лише до області зображення, не до всього профілю.
  // Це незалежний елемент поверх сторінки: вміст картки ніколи не змінюється.
  const preview = $("char-cursor-preview");
  const previewTitle = $("char-cursor-title");
  const previewSheet = $("char-cursor-sheet");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  function hidePreview() {
    if (preview) preview.hidden = true;
  }

  function movePreview(event) {
    if (!preview || preview.hidden) return;
    const offset = 18;
    const margin = 8;
    const rect = preview.getBoundingClientRect();
    let x = event.clientX + offset;
    let y = event.clientY + offset;
    // Якщо мало простору праворуч/знизу — відобразити з іншого боку.
    if (x + rect.width + margin > innerWidth) x = event.clientX - rect.width - offset;
    if (y + rect.height + margin > innerHeight) y = event.clientY - rect.height - offset;
    x = Math.max(margin, Math.min(x, innerWidth - rect.width - margin));
    y = Math.max(margin, Math.min(y, innerHeight - rect.height - margin));
    preview.style.left = `${Math.round(x)}px`;
    preview.style.top = `${Math.round(y)}px`;
  }

  function showPreview(event, key) {
    if (!preview || !canHover.matches || event.pointerType === "touch" || dialog.open) return;
    const c = characters[key];
    if (!c) return;
    previewTitle.textContent = `CHARACTER SHEET / ${c.name.toUpperCase()}`;
    previewSheet.src = `images/character-sheets/${key}.png`;
    preview.hidden = false;
    movePreview(event);
  }


  function openCharacter(key, trigger) {
    const c = characters[key];
    if (!c) return;
    lastTrigger = trigger;
    hidePreview();
    title.textContent = c.name;
    subtitle.textContent = c.eng;
    status.textContent = c.status;
    status.classList.toggle("char-modal-status-glitch", Boolean(c.glitch));
    species.textContent = c.species;
    tags.replaceChildren();
    c.traits.forEach((trait) => {
      const chip = document.createElement("span");
      chip.textContent = trait;
      tags.appendChild(chip);
    });
    role.hidden = !c.role;
    role.textContent = c.role || "";
    personality.textContent = c.personality;
    vibe.textContent = c.vibe;
    fact.textContent = c.fun;
    glitch.hidden = !c.glitch;
    links.replaceChildren();
    links.hidden = !c.links?.length;
    (c.links || []).forEach(([label, url]) => {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = label;
      links.appendChild(anchor);
    });
    const sheetPath = `images/character-sheets/${key}.png`;
    sheet.src = sheetPath;
    sheet.alt = `Character Sheet персонажа ${c.name}: вигляд спереду, ззаду та збоку`;
    sheetLink.href = sheetPath;
    dialog.dataset.character = key;
    dialog.showModal();
    close.focus();
  }

  document.querySelectorAll(".char-profile-trigger[data-character]").forEach((btn) => {
    btn.addEventListener("click", () => openCharacter(btn.dataset.character, btn));
    const picture = btn.querySelector(".char-pic-frame");
    if (!picture) return;
    picture.addEventListener("pointerenter", (event) => showPreview(event, btn.dataset.character));
    picture.addEventListener("pointermove", movePreview);
    picture.addEventListener("pointerleave", hidePreview);
    picture.addEventListener("pointercancel", hidePreview);
  });
  window.addEventListener("scroll", hidePreview, {passive: true, capture: true});
  window.addEventListener("resize", hidePreview);
  window.addEventListener("blur", hidePreview);

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    // Клік по затемненому фону закриває діалог; всередині не закриває.
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    sheet.removeAttribute("src");
    if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus({preventScroll: true});
  });
})();
