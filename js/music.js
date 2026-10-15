// Топ пісень: вкладки + SoundCloud плейлисти
(function () {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".player-panel");
  const openLink = document.getElementById("sc-open");
  if (!tabs.length) return;

  function embed(panel) {
    if (panel.dataset.loaded) return;
    const params = new URLSearchParams({
      url: panel.dataset.playlist,
      color: "#111111",
      auto_play: "false",
      hide_related: "true",
      show_comments: "false",
      show_user: "true",
      show_reposts: "false",
      show_teaser: "false",
      visual: "false"
    });
    const iframe = document.createElement("iframe");
    iframe.src = "https://w.soundcloud.com/player/?" + params.toString();
    iframe.title = "SoundCloud плейлист";
    iframe.allow = "autoplay";
    iframe.loading = "lazy";
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("frameborder", "0");
    panel.appendChild(iframe);
    panel.dataset.loaded = "1";
  }

  function activate(name) {
    tabs.forEach(function (t) {
      const on = t.dataset.target === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(function (p) {
      const on = p.id === "panel-" + name;
      p.classList.toggle("active", on);
      if (on) {
        embed(p);
        if (openLink) openLink.href = p.dataset.playlist;
      }
    });
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () { activate(t.dataset.target); });
  });

  activate("dreamcore");
})();
