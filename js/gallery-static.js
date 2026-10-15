// 4 вручну вибрані X-пости. Без API, завантаження стрічки чи сторонніх віджетів.
// Якщо photos/post1.jpg...post4.jpg додані, ці файли використовуються назавжди.
(function () {
  "use strict";
  const figures = Array.from(document.querySelectorAll("#gallery figure[data-art-index]"));
  const message = document.getElementById("art-message");
  if (!figures.length) return;

  let missing = 0;
  let checked = 0;
  function finished(loaded) {
    if (!loaded) missing += 1;
    checked += 1;
    if (checked === figures.length && message) {
      // Не показуємо попередження відвідувачам опублікованого сайту,
      // якщо вже налаштовані всі картинки.
      message.hidden = missing === 0;
    }
  }

  figures.forEach((figure) => {
    const n = Number(figure.dataset.artIndex);
    const button = figure.querySelector(".art-tile");
    const img = button && button.querySelector("img");
    if (!Number.isInteger(n) || n < 1 || n > 4 || !button || !img) {
      finished(false);
      return;
    }
    const src = `images/posts/post${n}.jpg`;
    const imageProbe = new Image();
    imageProbe.onload = () => {
      img.src = src;
      img.alt = `Арт ${n} з поста @poyo_a1`;
      button.dataset.imageSrc = src;
      button.dataset.hasPhoto = "true";
      figure.classList.add("art-loaded");
      finished(true);
    };
    imageProbe.onerror = () => {
      // Картинка залишається стильним SVG-заповнювачем.
      // Натискання на рамку без локального JPG веде прямо до поста X.
      button.dataset.hasPhoto = "false";
      button.dataset.caption = `Пост ${n} у X`;
      button.title = `Відкрити оригінальний пост ${n} у X`;
      img.alt = `Пост ${n}: відкрити оригінальний арт у X`;
      figure.classList.add("art-missing");
      finished(false);
    };
    imageProbe.src = src;
  });
})();
