// Public browser-side settings. Never put bot tokens or secrets here.
window.SITE_CONFIG = {
  discordId: "837064341315911741",
  statusRefreshMs: 15000,
  // Fill these TWO public values after deploying Cloudflare Worker / Turnstile:
  anonymousWorkerUrl: "https://poyo-anonymous-inbox.poyo-ai.workers.dev",  // e.g. https://poyo-anonymous-inbox.YOUR-SUBDOMAIN.workers.dev
  turnstileSiteKey: "0x4AAAAAAFYWNnQPX0pv4kON"      // sitekey (PUBLIC), not the Turnstile secret!
};
