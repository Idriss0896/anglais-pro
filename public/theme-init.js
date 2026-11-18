// Applique le thème avant le premier rendu pour éviter tout clignotement.
// Fichier séparé (et non script inline) pour rester compatible avec la CSP.
(function () {
  try {
    var raw = localStorage.getItem("anglais-pro-settings");
    var saved = raw ? JSON.parse(raw).state || {} : {};
    var theme = saved.theme || "system";
    var isLanding = !location.hash || location.hash === "#" || location.hash === "#/";
    var dark =
      !isLanding &&
      (theme === "dark" ||
        (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches));
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  } catch (error) {
    document.documentElement.dataset.theme = "light";
  }
})();
