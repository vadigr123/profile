// Discord статус через Lanyard API: https://github.com/phineas/lanyard
(function () {
  const cfg = window.SITE_CONFIG || {};
  const badge = document.getElementById("discord-status");
  const text = document.getElementById("status-text");
  if (!badge || !text) return;

  const LABELS = {
    online: "Online",
    idle: "Idle",
    dnd: "DND",
    offline: "Offline"
  };

  function setStatus(status, label, tooltip) {
    badge.dataset.status = status;
    text.textContent = label;
    badge.title = tooltip || "Discord статус";
  }

  if (!cfg.discordId || cfg.discordId === "YOUR_DISCORD_ID") {
    setStatus("offline", "Вкажи Discord ID", "Відкрий js/config.js і встав свій Discord ID");
    return;
  }

  function activityText(data) {
    const acts = (data.activities || []).filter(function (a) { return a.type !== 4; });
    const custom = (data.activities || []).find(function (a) { return a.type === 4; });
    const parts = [];
    if (custom && custom.state) parts.push(custom.state);
    if (acts.length) parts.push(acts[0].name);
    return parts.join(" · ");
  }

  async function loadStatus() {
    try {
      const res = await fetch("https://api.lanyard.rest/v1/users/" + cfg.discordId);
      const json = await res.json();
      if (!json.success) {
        setStatus("offline", "Не знайдено", "Зайди на сервер discord.gg/lanyard, щоб статус працював");
        return;
      }
      const status = json.data.discord_status || "offline";
      const extra = activityText(json.data);
      setStatus(status, LABELS[status] || status, extra || "Discord статус");
    } catch (e) {
      setStatus("offline", "Немає зв'язку", "Не вдалося отримати статус");
    }
  }

  loadStatus();
  setInterval(loadStatus, cfg.statusRefreshMs || 15000);
})();
