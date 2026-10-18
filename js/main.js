(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  var form = document.querySelector("#service-form");
  var fields = document.querySelector("#form-fields");
  var success = document.querySelector("#form-success");
  var again = document.querySelector("#form-again");
  var help = document.querySelector("#help");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileQuery = window.matchMedia("(max-width: 1040px)");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    if (!nav || !toggle) return;
    var mobile = mobileQuery.matches;
    if (!mobile) open = false;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
    if (mobile) nav.setAttribute("aria-hidden", open ? "false" : "true");
    else nav.removeAttribute("aria-hidden");
    document.body.classList.toggle("nav-open", open);
  }

  if (toggle && nav) {
    setMenu(false);
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setMenu(false);
    });
    mobileQuery.addEventListener("change", function () {
      setMenu(false);
    });
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });

    var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']")) : [];
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.removeAttribute("aria-current");
          });
          var current = nav.querySelector('a[href="#' + entry.target.id + '"]:not(.button)');
          if (current) current.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -48% 0px", threshold: 0 }
    );
    document.querySelectorAll("main section[id]").forEach(function (section) {
      spy.observe(section);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  document.querySelectorAll("[data-service]").forEach(function (link) {
    link.addEventListener("click", function () {
      if (!help) return;
      help.value = link.getAttribute("data-service") || "";
      if (success && fields) {
        success.hidden = true;
        fields.hidden = false;
      }
    });
  });

  function fieldError(input, message) {
    var error = document.getElementById(input.id + "-error");
    if (message) {
      input.setAttribute("aria-invalid", "true");
      if (error) {
        error.hidden = false;
        error.textContent = message;
      }
      return false;
    }
    input.removeAttribute("aria-invalid");
    if (error) {
      error.hidden = true;
      error.textContent = "";
    }
    return true;
  }

  function validate(formEl) {
    var name = formEl.querySelector("#name");
    var phone = formEl.querySelector("#phone");
    var email = formEl.querySelector("#email");
    var brand = formEl.querySelector("#brand");
    var problem = formEl.querySelector("#problem");
    var ok = true;
    var firstInvalid = null;

    function check(input, good, message) {
      var passed = fieldError(input, good ? "" : message);
      if (!passed && !firstInvalid) firstInvalid = input;
      if (!passed) ok = false;
    }

    check(name, name.value.trim().length > 1, "Enter your name.");
    check(phone, phone.value.replace(/\D/g, "").length >= 7, "Enter a phone number with at least 7 digits.");
    check(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), "Enter a valid email address.");
    check(brand, brand.value !== "", "Select a motor brand.");
    check(problem, problem.value.trim().length >= 8, "Describe the problem in a few words.");

    if (firstInvalid) firstInvalid.focus();
    return ok;
  }

  if (form && fields && success) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validate(form)) return;
      form.reset();
      fields.hidden = true;
      success.hidden = false;
      success.focus();
    });

    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") fieldError(input, "");
      });
    });
  }

  if (again && form && fields && success) {
    again.addEventListener("click", function () {
      form.reset();
      success.hidden = true;
      fields.hidden = false;
      var name = document.querySelector("#name");
      if (name) name.focus();
    });
  }
})();
