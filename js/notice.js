(() => {
  const translations = {
    uk: {
      eyebrow: "ВАЖЛИВА ІНФОРМАЦІЯ",
      title: "Сповіщення",
      start: "Привіт! Перед переглядом сайту зверни увагу: цей сайт ніяк не пов’язаний з автором ",
      end: ". Mikus лише допомагає з хостингом на GitHub. Дякую за розуміння!",
      button: "Ок",
    },
    ru: {
      eyebrow: "ВАЖНАЯ ИНФОРМАЦИЯ",
      title: "Уведомление",
      start: "Привет! Перед просмотром сайта обрати внимание: этот сайт никак не связан с его автором ",
      end: ". Mikus лишь помогает с хостингом на GitHub. Спасибо за понимание!",
      button: "ОК",
    },
    en: {
      eyebrow: "IMPORTANT INFORMATION",
      title: "Notice",
      start: "Hi! Before viewing this site, please note: this site is not affiliated with its author, ",
      end: ". Mikus only helps with GitHub hosting. Thanks for understanding!",
      button: "OK",
    },
    be: {
      eyebrow: "ВАЖНАЯ ІНФАРМАЦЫЯ",
      title: "Паведамленне",
      start: "Прывітанне! Перад праглядам сайта звярні ўвагу: гэты сайт ніяк не звязаны з аўтарам ",
      end: ". Mikus толькі дапамагае з хостынгам на GitHub. Дзякуй за разуменне!",
      button: "Добра",
    },
    cs: {
      eyebrow: "DŮLEŽITÉ INFORMACE",
      title: "Oznámení",
      start: "Ahoj! Před prohlédnutím webu upozorňujeme, že tento web nijak nesouvisí s jeho autorem ",
      end: ". Mikus pouze pomáhá s hostingem na GitHubu. Děkujeme za pochopení!",
      button: "OK",
    },
    pl: {
      eyebrow: "WAŻNA INFORMACJA",
      title: "Informacja",
      start: "Cześć! Zanim obejrzysz stronę, zwróć uwagę: ta strona nie jest w żaden sposób powiązana z jej autorem ",
      end: ". Mikus pomaga jedynie w hostowaniu jej na GitHubie. Dziękujemy za zrozumienie!",
      button: "OK",
    },
    vi: {
      eyebrow: "THÔNG TIN QUAN TRỌNG",
      title: "Thông báo",
      start: "Xin chào! Trước khi xem trang web, xin lưu ý: trang web này không liên quan đến tác giả ",
      end: ". Mikus chỉ hỗ trợ lưu trữ trang web trên GitHub. Cảm ơn bạn đã thông cảm!",
      button: "Được",
    },
    zh: {
      eyebrow: "重要信息",
      title: "通知",
      start: "你好！浏览网站前请注意：本网站与作者 ",
      end: " 没有任何关联。Mikus 仅协助在 GitHub 上托管网站。感谢理解！",
      button: "好的",
    },
    ja: {
      eyebrow: "重要なお知らせ",
      title: "お知らせ",
      start: "こんにちは！サイトをご覧になる前にご確認ください。このサイトは作者の ",
      end: " とは一切関係ありません。Mikus は GitHub でのホスティングを手伝っているだけです。ご理解ありがとうございます！",
      button: "確認",
    },
  };

  const notice = document.getElementById("site-notice");
  if (!notice) return;

  const browserLanguage = (navigator.language || "en").toLowerCase().split(/[-_]/)[0];
  const language = translations[browserLanguage] ? browserLanguage : "en";
  const copy = translations[language];

  notice.lang = language;
  document.getElementById("site-notice-eyebrow").textContent = copy.eyebrow;
  document.getElementById("site-notice-title").textContent = copy.title;
  document.getElementById("site-notice-copy-start").textContent = copy.start;
  document.getElementById("site-notice-copy-end").textContent = copy.end;
  document.getElementById("site-notice-button").textContent = copy.button;

  if (typeof notice.showModal === "function") {
    if (notice.open) notice.close();
    notice.showModal();
  }
})();
