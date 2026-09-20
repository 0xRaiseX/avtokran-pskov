/* =====================================================================
   АВТОКРАН ПСКОВ — поведение страницы
   Контакты берутся из js/config.js
   ===================================================================== */

(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  /* --------------------------- контакты ---------------------------- */

  function messengerHref() {
    var text = encodeURIComponent(cfg.messageText || "");
    switch (cfg.messenger) {
      case "whatsapp":
        return "https://wa.me/" + (cfg.whatsapp || "") + "?text=" + text;
      case "telegram":
        return "https://t.me/" + (cfg.telegram || "");
      case "vk":
        return cfg.vk || "";
      case "max":
        return cfg.max || "";
      case "sms":
        return "sms:" + (cfg.phoneRaw || "") + "?body=" + text;
      default:
        return "";
    }
  }

  function applyContacts() {
    var call = "tel:" + (cfg.phoneRaw || "");
    var write = messengerHref();

    document.querySelectorAll('[data-action="call"]').forEach(function (el) {
      el.href = call;
    });

    if (write) {
      document.querySelectorAll('[data-action="write"]').forEach(function (el) {
        el.href = write;
        el.target = "_blank";
        el.rel = "noopener";
      });
    } else {
      document.documentElement.classList.add("no-messenger");
    }
    document.querySelectorAll("[data-phone]").forEach(function (el) {
      if (cfg.phoneDisplay) el.textContent = cfg.phoneDisplay;
    });
    document.querySelectorAll("[data-hours]").forEach(function (el) {
      if (cfg.workHours) el.textContent = cfg.workHours;
    });
    document.querySelectorAll("[data-business]").forEach(function (el) {
      if (cfg.businessName) el.textContent = cfg.businessName;
    });
    document.querySelectorAll("[data-owner]").forEach(function (el) {
      if (cfg.ownerName) el.textContent = cfg.ownerName;
    });
  }

  /* ---------------------- появление при скролле --------------------- */

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var seen = new WeakMap();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var group = el.parentElement;
        var order = seen.get(group) || 0;
        el.style.transitionDelay = Math.min(order, 5) * 70 + "ms";
        seen.set(group, order + 1);
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------ шапка и нижняя панель связи ------------------- */

  function initSticky() {
    var header = document.getElementById("header");
    var dock = document.getElementById("dock");
    var hero = document.getElementById("top");

    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!dock || !hero || !("IntersectionObserver" in window)) return;

    dock.hidden = false;
    new IntersectionObserver(function (entries) {
      dock.classList.toggle("is-open", !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(hero);
  }

  /* -------------------------- просмотр фото ------------------------- */

  function initLightbox() {
    var box = document.getElementById("lightbox");
    var gallery = document.getElementById("gallery");
    if (!box || !gallery) return;

    var triggers = Array.prototype.slice.call(gallery.querySelectorAll("[data-lightbox]"));
    if (!triggers.length) return;

    var img = box.querySelector(".lightbox__img");
    var counter = box.querySelector(".lightbox__counter");
    var btnClose = box.querySelector(".lightbox__close");
    var btnPrev = box.querySelector(".lightbox__nav--prev");
    var btnNext = box.querySelector(".lightbox__nav--next");
    var index = 0;
    var opener = null;

    function show(i) {
      index = (i + triggers.length) % triggers.length;
      var source = triggers[index].querySelector("img");
      img.src = source.currentSrc || source.src;
      img.alt = source.alt;
      counter.textContent = (index + 1) + " / " + triggers.length;
    }

    function open(i, trigger) {
      opener = trigger;
      show(i);
      box.hidden = false;
      document.body.classList.add("is-locked");
      requestAnimationFrame(function () { box.classList.add("is-open"); });
      btnClose.focus();
    }

    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      window.setTimeout(function () { box.hidden = true; }, 200);
      if (opener) opener.focus();
    }

    triggers.forEach(function (trigger, i) {
      trigger.addEventListener("click", function () { open(i, trigger); });
    });

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () { show(index - 1); });
    btnNext.addEventListener("click", function () { show(index + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });

    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  applyContacts();
  initReveal();
  initSticky();
  initLightbox();
})();
