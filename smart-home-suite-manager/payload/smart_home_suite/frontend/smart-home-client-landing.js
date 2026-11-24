/*
 * Smart Home Suite - Client landing (alpha)
 *
 * Loaded on every Home Assistant page through frontend.add_extra_js_url.
 * For NON-administrator users, while Client Mode is enabled on the server, any
 * route that is not one of the panels Home Assistant lists for that user
 * (native Home/Overview, History, a stale bookmark, "/") is redirected to the
 * client's landing panel (Smart Home by default).
 *
 * Home Assistant resolves a route it cannot show to: system default dashboard
 * -> "home" -> "notfound". "notfound" (the "Sin acceso" screen) is registered as
 * a panel for every user, so it must NOT count as an allowed destination.
 *
 * Fail-safe: administrators are never touched, and if the status call fails or
 * Client Mode is off, this script does nothing.
 */
(() => {
  "use strict";
  if (window.__smartHomeClientLanding) return;
  window.__smartHomeClientLanding = true;

  const STATUS = { type: "smart_home_suite/client_mode/status" };
  // Panels that exist for everyone but are never a valid place for a client.
  const NEVER_ALLOWED = ["notfound"];
  // Paths saved in older configurations that never existed as panels (alpha.4 and earlier
  // shipped "/smart-energy-advanced" as a default navigation target).
  const LEGACY_PANEL_PATHS = { "smart-energy-advanced": "energy-advanced" };
  const MAX_REDIRECTS = 5; // loop guard if HA keeps bouncing the user back
  const MAX_WAIT_MS = 60000;
  const POLL_MS = 250;

  const getHass = () => document.querySelector("home-assistant")?.hass;
  const firstSegment = () => (window.location.pathname.split("/")[1] || "").trim();

  // Pure decision, exported for tests: where should this user be sent, if anywhere?
  function landingTarget(panels, currentSegment, homePanel, blocked) {
    if (!panels || typeof panels !== "object") return null;
    const denied = new Set([...NEVER_ALLOWED, ...(Array.isArray(blocked) ? blocked : [])]);
    const usable = (k) => Boolean(k) && Boolean(panels[k]) && !denied.has(k);
    if (usable(currentSegment)) return null; // allowed panel
    const legacy = LEGACY_PANEL_PATHS[currentSegment];
    if (legacy && usable(legacy)) return legacy; // old saved link: send to the real panel
    const fallbacks = [homePanel, ...Object.keys(panels).filter((k) => k !== "profile")];
    const target = fallbacks.find(usable);
    if (!target || target === currentSegment) return null; // nowhere safe to go: do nothing
    return target;
  }
  window.__smartHomeClientLandingTarget = landingTarget;

  function go(panel) {
    window.history.replaceState(window.history.state, "", `/${panel}`);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: true } }));
  }

  async function start() {
    const began = Date.now();
    let hass = getHass();
    while (!(hass && hass.user && hass.panels && hass.callWS)) {
      if (Date.now() - began > MAX_WAIT_MS) return;
      await new Promise((r) => setTimeout(r, POLL_MS));
      hass = getHass();
    }
    if (hass.user.is_admin) return; // the installer keeps the full interface

    let status;
    try {
      status = await hass.callWS(STATUS);
    } catch (_err) {
      return; // integration not loaded or command unavailable: do nothing
    }
    if (!status || status.enabled !== true) return;

    let redirects = 0;
    const check = () => {
      const current = getHass();
      if (!current || !current.panels || redirects >= MAX_REDIRECTS) return;
      const target = landingTarget(
        current.panels, firstSegment(), status.home_panel, status.blocked_panels);
      if (target) {
        redirects += 1;
        go(target);
      }
    };
    window.addEventListener("location-changed", () => setTimeout(check, 0));
    window.addEventListener("popstate", () => setTimeout(check, 0));
    check();
  }

  start().catch(() => {});
})();
