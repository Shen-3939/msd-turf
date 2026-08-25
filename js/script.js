/* =========================================================
   MSD TURF - SITE CONFIGURATION
   Change business details here first when handing over.
   ========================================================= */
const SITE_CONFIG = {
  BUSINESS_NAME: "MSD Turf",
  ADDRESS: "136/1, KTC Nagar, Thoothukudi, Tamil Nadu - 628002",
  WHATSAPP_NUMBER: "919488123939",
  GOOGLE_MAPS_URL: "https://maps.app.goo.gl/bMRCggUukLYskbFF9",
  // Modify operating hours here. The UI generates 30-minute time slots from these values.
  OPERATING_HOURS: {
    START: "06:00",
    END: "23:00",
  },
  SLOT_INTERVAL_MINUTES: 30,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function timeToMinutes(value) {
  if (!value) return NaN;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function generateTimeOptions(startValue, endValue, intervalMinutes = 30) {
  const options = [];
  let minutes = timeToMinutes(startValue);
  const endMinutes = timeToMinutes(endValue);
  while (minutes <= endMinutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    options.push({
      value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      label: formatTime(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      ),
    });
    minutes += intervalMinutes;
  }
  return options;
}

function populateSelect(select, options, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  options.forEach(({ value, label }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  });
}

function openWhatsApp(message) {
  const url = `https://wa.me/${SITE_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function scrollToBooking(sport = "") {
  const booking = $("#booking");
  if (sport) $("#sport").value = sport;
  booking?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(
    () =>
      sport
        ? $("#sport").focus({ preventScroll: true })
        : $("#name").focus({ preventScroll: true }),
    550,
  );
}

function formatDateForMessage(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function validateMobile(value) {
  return /^[6-9]\d{9}$/.test(value.replace(/\D/g, ""));
}

function clearErrors(form) {
  $$(".error", form).forEach((el) => (el.textContent = ""));
  $$('input[aria-invalid="true"], select[aria-invalid="true"]', form).forEach(
    (el) => el.removeAttribute("aria-invalid"),
  );
}

function setError(fieldId, message) {
  const field = $(`#${fieldId}`);
  const error = $(`[data-error-for="${fieldId}"]`);
  field?.setAttribute("aria-invalid", "true");
  if (error) error.textContent = message;
}

function setupNavigation() {
  const header = $("#siteHeader");
  const nav = $("#primaryNav");
  const toggle = $(".nav-toggle");

  const handleScroll = () =>
    header.classList.toggle("scrolled", window.scrollY > 20);
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
  });

  $$('a[href^="#"]', nav).forEach((link) =>
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    }),
  );
}

function setupScrollReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" },
  );
  items.forEach((item) => observer.observe(item));
}

function setupBookingForm() {
  const form = $("#bookingForm");
  const dateInput = $("#date");
  const startSelect = $("#startTime");
  const endSelect = $("#endTime");
  const players = $("#players");
  const allTimes = generateTimeOptions(
    SITE_CONFIG.OPERATING_HOURS.START,
    SITE_CONFIG.OPERATING_HOURS.END,
    SITE_CONFIG.SLOT_INTERVAL_MINUTES,
  );

  populateSelect(startSelect, allTimes, "Select start time");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const updateEndOptions = () => {
    const start = startSelect.value;
    if (!start) {
      endSelect.disabled = true;
      populateSelect(endSelect, [], "Select end time");
      return;
    }
    const startMinutes = timeToMinutes(start);
    const endOptions = allTimes.filter(
      (time) => timeToMinutes(time.value) > startMinutes,
    );
    populateSelect(endSelect, endOptions, "Select end time");
    endSelect.disabled = endOptions.length === 0;
  };

  startSelect.addEventListener("change", updateEndOptions);

  $$(".step-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.step);
      const next = Math.max(1, Number(players.value || 1) + direction);
      players.value = String(next);
      players.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });

  players.addEventListener("input", () => {
    const value = Math.max(1, parseInt(players.value || "1", 10));
    players.value = String(value);
  });

  const submitHandler = (event) => {
    event.preventDefault();
    clearErrors(form);

    const values = {
      name: $("#name").value.trim(),
      mobile: $("#mobile").value.replace(/\D/g, ""),
      sport: $("#sport").value,
      date: dateInput.value,
      startTime: startSelect.value,
      endTime: endSelect.value,
      players: Math.max(1, parseInt(players.value || "0", 10)),
    };

    let valid = true;
    if (!values.name) {
      setError("name", "Please enter your name.");
      valid = false;
    }
    if (!validateMobile(values.mobile)) {
      setError("mobile", "Enter a valid 10-digit Indian mobile number.");
      valid = false;
    }
    if (!values.sport) {
      setError("sport", "Select a sport.");
      valid = false;
    }
    if (!values.date) {
      setError("date", "Select a booking date.");
      valid = false;
    } else {
      const selected = new Date(`${values.date}T00:00:00`);
      if (selected < today) {
        setError("date", "Previous dates are not available.");
        valid = false;
      }
    }
    if (!values.startTime) {
      setError("startTime", "Select a starting time.");
      valid = false;
    }
    if (!values.endTime) {
      setError("endTime", "Select an ending time.");
      valid = false;
    }
    if (
      values.startTime &&
      values.endTime &&
      timeToMinutes(values.endTime) <= timeToMinutes(values.startTime)
    ) {
      setError("endTime", "Ending time must be later than starting time.");
      valid = false;
    }
    if (!Number.isFinite(values.players) || values.players < 1) {
      setError("players", "Players must be at least 1.");
      valid = false;
    }

    if (!valid) return;

    const message = [
      "Hello MSD Turf!",
      "",
      "I would like to book a turf slot.",
      "",
      `Name: ${values.name}`,
      `Mobile Number: ${values.mobile}`,
      `Sport: ${values.sport}`,
      `Date: ${formatDateForMessage(values.date)}`,
      `Starting Time: ${formatTime(values.startTime)}`,
      `Ending Time: ${formatTime(values.endTime)}`,
      `Number of Players: ${values.players}`,
      "",
      "Please let me know the availability and booking details.",
      "",
      "Thank you!",
    ].join("\n");

    openWhatsApp(message);
  };

  form.addEventListener("submit", submitHandler);
}

function setupWhatsAppActions() {
  const directMessage = [
    "Hello MSD Turf!",
    "",
    "I would like to know more about your turf availability.",
    "",
    "Please share the available details.",
    "",
    "Thank you!",
  ].join("\n");
  $$(".whatsapp-direct").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (element.tagName === "A") event.preventDefault();
      openWhatsApp(directMessage);
    });
  });

  $("#customSubscriptionBtn")?.addEventListener("click", () => {
    const message = [
      "Hello MSD Turf!",
      "",
      "I would like to enquire about a custom subscription package.",
      "",
      "Please share the available options and details.",
      "",
      "Thank you!",
    ].join("\n");
    openWhatsApp(message);
  });

  $("#tournamentBtn")?.addEventListener("click", () => {
    const message = [
      "Hello MSD Turf!",
      "",
      "I would like to enquire about renting MSD Turf for a tournament.",
      "",
      "Please share the availability and details.",
      "",
      "Thank you!",
    ].join("\n");
    openWhatsApp(message);
  });

  $$(".coaching-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const sport = button.dataset.coaching;
      const message = [
        "Hello MSD Turf!",
        "",
        `I would like to enquire about ${sport} coaching.`,
        "",
        "Please share the available options and details.",
        "",
        "Thank you!",
      ].join("\n");
      openWhatsApp(message);
    });
  });
}

function setupSportButtons() {
  $$(".sport-book").forEach((button) =>
    button.addEventListener("click", () =>
      scrollToBooking(button.dataset.sport),
    ),
  );
  $$("[data-footer-sport]").forEach((link) =>
    link.addEventListener("click", () => {
      setTimeout(() => scrollToBooking(link.dataset.footerSport), 80);
    }),
  );
}

function setupDirections() {
  const link = $("#directionsBtn");
  if (link) link.href = SITE_CONFIG.GOOGLE_MAPS_URL;
}

function setupGallery() {
  const items = $$(".gallery-item");
  const lightbox = $("#lightbox");
  const image = $("#lightboxImage");
  const caption = $("#lightboxCaption");
  const close = $("#lightboxClose");
  const prev = $("#lightboxPrev");
  const next = $("#lightboxNext");
  let index = 0;

  const render = () => {
    const item = items[index];
    image.src = item.dataset.image;
    image.alt = item.dataset.alt || "MSD Turf gallery image";
    caption.textContent = item.querySelector("span")?.textContent || "MSD Turf";
  };

  const open = (newIndex) => {
    index = (newIndex + items.length) % items.length;
    render();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    close.focus({ preventScroll: true });
  };
  const hide = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };
  items.forEach((item, i) => item.addEventListener("click", () => open(i)));
  close.addEventListener("click", hide);
  prev.addEventListener("click", () => open(index - 1));
  next.addEventListener("click", () => open(index + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) hide();
  });
  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") hide();
    if (event.key === "ArrowLeft") open(index - 1);
    if (event.key === "ArrowRight") open(index + 1);
  });
}

function setupActiveNav() {
  const sections = $$("main section[id]");
  const links = $$(".primary-nav a");
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) =>
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`,
          ),
        );
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupScrollReveal();
  setupBookingForm();
  setupWhatsAppActions();
  setupSportButtons();
  setupDirections();
  setupGallery();
  setupActiveNav();
});
