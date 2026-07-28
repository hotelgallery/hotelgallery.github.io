/* ============================================================
   HOMEPAGE ENGINE
   Loads data/homepage.json, renders every section of index.html,
   and provides the same secret-key edit mode used by hotel.html.
   ============================================================ */

/* ---------- Config ---------- */
const HOME_JSON_PATH = "data/homepage.json";
const HOME_STORAGE_KEY = "hg_home_preview";
const EDIT_KEY = "ownerkey2026"; // keep in sync with js/gallery.js's EDIT_KEY if sharing one password
const EDIT_UNLOCK_STORAGE = "hg_home_owner_unlocked";

/* ---------- State ---------- */
let DATA = null;

/* ============================================================
   DATA LOADING / SAVING
   ============================================================ */

async function loadHomeData() {
  let published = null;
  try {
    const res = await fetch(HOME_JSON_PATH, { cache: "no-store" });
    if (res.ok) published = await res.json();
  } catch (err) {
    /* fetch blocked (e.g. file://) or file missing — handled below */
  }

  if (!published) {
    showFetchWarning();
    published = {}; // no bundled sample data — homepage.json is the single source of truth
  }

  try {
    const raw = localStorage.getItem(HOME_STORAGE_KEY);
    if (raw) return JSON.parse(raw); // unsaved local preview edits take priority
  } catch (err) {
    /* ignore */
  }

  return published;
}

function saveHomeData() {
  try {
    localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(DATA));
  } catch (err) {
    alert("Could not save — your browser storage may be full.");
  }
}

function showFetchWarning() {
  const bar = document.createElement("div");
  bar.style.cssText =
    "position:fixed; top:0; left:0; right:0; z-index:200; background:#e05b3c; color:#fff; " +
    "font-family:Inter,sans-serif; font-size:0.78rem; padding:10px 16px; text-align:center;";
  bar.innerHTML =
    `Could not load <code>${HOME_JSON_PATH}</code>. This is normal if you opened this file ` +
    `directly (file://). Run <code>python3 -m http.server</code> in this folder, then open ` +
    `localhost, or publish it on GitHub Pages.`;
  document.body.prepend(bar);
}

/* ============================================================
   EDIT ACCESS (?edit=ownerkey2026)
   ============================================================ */

(function checkEditAccess() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("edit") === EDIT_KEY) {
    try {
      localStorage.setItem(EDIT_UNLOCK_STORAGE, "1");
    } catch (err) {
      /* ignore */
    }
  }
})();

function ownerIsUnlocked() {
  try {
    return localStorage.getItem(EDIT_UNLOCK_STORAGE) === "1";
  } catch (err) {
    return false;
  }
}

/* ============================================================
   SMALL DOM HELPERS (kept generic to avoid repetition)
   ============================================================ */

const $ = (id) => document.getElementById(id);

function setText(id, value) {
  const el = $(id);
  if (el && value !== undefined) el.textContent = value;
}

function setHTML(id, value) {
  const el = $(id);
  if (el && value !== undefined) el.innerHTML = value;
}

/** Escapes single quotes so a value can be safely dropped into an inline url('...') */
function escUrl(str) {
  return String(str).replace(/'/g, "\\'");
}

/* ============================================================
   RENDER — one function per section of index.html
   ============================================================ */

function render() {
  renderHero();
  renderBenefits();
  renderCompare();
  renderDemo();
  renderPricing();
  renderCta();
  setText("homeFooter", DATA.footerText);
  wireEditableFields();
}

function renderHero() {
  setText("homeHeroEyebrow", DATA.heroEyebrow);
  setHTML("homeHeroTitle", DATA.heroTitleHTML);
  setText("homeHeroSubtitle", DATA.heroSubtitle);
  setText("homeCtaPrimary", DATA.ctaPrimaryLabel);
  setText("homeCtaSecondary", DATA.ctaSecondaryLabel);
  setText("homeTrustLine", DATA.trustLine);
  setText("homePhoneCaption", DATA.phoneCaption);
  applyDemoSlug(DATA.demoHotelSlug);
}

/** The demo hotel slug drives both the phone-frame iframe and the "Open Full Demo" link. */
function applyDemoSlug(slug) {
  const iframe = $("homeDemoFrame");
  if (iframe) iframe.src = `hotel.html?hotel=${slug}`;
  document.querySelectorAll("[data-demo-link]").forEach((a) => {
    a.href = `hotel.html?hotel=${slug}`;
  });
}

function renderBenefits() {
  setText("homeBenefitsEyebrow", DATA.benefitsEyebrow);
  setText("homeBenefitsTitle", DATA.benefitsTitle);
  setText("homeBenefitsSub", DATA.benefitsSub);

  const grid = $("homeBenefitsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  (DATA.benefits || []).forEach((benefit, i) => {
    const card = document.createElement("div");
    card.className = "benefit";
    card.innerHTML = `
      <div class="num" contenteditable="false" data-bfield="label" data-bi="${i}">${benefit.label}</div>
      <h3 contenteditable="false" data-bfield="title" data-bi="${i}">${benefit.title}</h3>
      <p contenteditable="false" data-bfield="desc" data-bi="${i}">${benefit.desc}</p>
    `;
    grid.appendChild(card);
  });
}

function renderCompare() {
  setText("homeCompareEyebrow", DATA.compareEyebrow);
  setText("homeCompareTitle", DATA.compareTitle);

  setText("homeCompareBadTag", DATA.compareBadTag);
  setText("homeCompareBadNote", DATA.compareBadNote);
  renderCompareVisual("homeCompareBadVisual", DATA.compareBadImage, null);
  renderCompareActions("homeCompareBadActions", "compareBadImage");

  setText("homeCompareGoodTag", DATA.compareGoodTag);
  setText("homeCompareGoodNote", DATA.compareGoodNote);
  renderCompareVisual("homeCompareGoodVisual", DATA.compareGoodImage, DATA.compareGoodLabel);
  renderCompareActions("homeCompareGoodActions", "compareGoodImage");
}

/**
 * Renders a compare card's visual area.
 * - If an image path is set: show that real photo (never base64 — just the path from JSON).
 * - Otherwise: show the CSS placeholder (grey tiles for "bad", gradient + label for "good").
 * labelText is null for the "bad" card (no label) and a string for the "good" card.
 */
function renderCompareVisual(elId, imagePath, labelText) {
  const el = $(elId);
  if (!el) return;

  if (imagePath) {
    const overlay = labelText !== null ? `<div class="compare-photo-overlay"></div>` : "";
    const label =
      labelText !== null
        ? `<span id="homeCompareGoodLabel" contenteditable="false">${labelText}</span>`
        : "";
    el.innerHTML = `<div class="compare-photo" style="background-image:url('${escUrl(imagePath)}')"></div>${overlay}${label}`;
    el.style.background = "none";
    el.style.padding = "0";
    el.style.display = "flex";
  } else if (labelText !== null) {
    el.innerHTML = `<span id="homeCompareGoodLabel" contenteditable="false">${labelText}</span>`;
    el.style.background = "";
    el.style.padding = "";
    el.style.display = "";
  } else {
    el.innerHTML = `<div class="tile"></div><div class="tile"></div><div class="tile"></div>`;
    el.style.background = "";
    el.style.padding = "";
    el.style.display = "";
  }
}

/** Builds the edit-only "change photo path" / "remove photo" controls for a compare card. */
function renderCompareActions(elId, dataField) {
  const el = $(elId);
  if (!el) return;
  const hasImage = !!DATA[dataField];
  el.innerHTML = `
    <button class="compare-photo-btn" data-photofield="${dataField}">${hasImage ? "Change Photo" : "+ Add Photo Path"}</button>
    ${hasImage ? `<button class="compare-photo-btn remove" data-removephotofield="${dataField}">Remove Photo</button>` : ""}
  `;
}

function renderDemo() {
  setText("homeDemoEyebrow", DATA.demoEyebrow);
  setText("homeDemoTitle", DATA.demoTitle);
  setText("homeDemoSub", DATA.demoSub);
  setText("homeDemoButtonLabel", DATA.demoButtonLabel);
  // homeDemoButtonLabel's href is handled by applyDemoSlug() via [data-demo-link]
}

function renderPricing() {
  setText("homePricingEyebrow", DATA.pricingEyebrow);
  setText("homePricingTitle", DATA.pricingTitle);
  setText("homePricingSub", DATA.pricingSub);

  const grid = $("homePricingGrid");
  if (!grid) return;
  grid.innerHTML = "";
  (DATA.pricing || []).forEach((plan, i) => {
    const card = document.createElement("div");
    card.className = "price-card" + (plan.featured ? " featured" : "");

    const featuresHTML = (plan.features || [])
      .map(
        (feature, fi) => `
      <li>
        <span contenteditable="false" data-pfeature="1" data-pi="${i}" data-fi="${fi}" style="flex:1;">${feature}</span>
        <button class="feature-remove" data-removefeature data-pi="${i}" data-fi="${fi}" title="Remove">✕</button>
      </li>`
      )
      .join("");

    card.innerHTML = `
      <div class="tier" contenteditable="false" data-pfield="tier" data-pi="${i}">${plan.tier}</div>
      <div class="amount" contenteditable="false" data-pfield="amount" data-pi="${i}">${plan.amount}</div>
      <p class="desc" contenteditable="false" data-pfield="desc" data-pi="${i}">${plan.desc}</p>
      <ul>${featuresHTML}</ul>
      <button class="add-feature-btn" data-addfeature data-pi="${i}">+ Add line</button>
      <a href="#contact" class="btn ${plan.featured ? "btn-primary" : "btn-ghost-dark"}"
         style="${plan.featured ? "" : "border-color:var(--ink);"} margin-top:16px;"
         contenteditable="false" data-pfield="ctaLabel" data-pi="${i}">${plan.ctaLabel}</a>
    `;
    grid.appendChild(card);
  });
}

function renderCta() {
  setText("homeCtaEyebrow", DATA.ctaEyebrow);
  setText("homeCtaTitle", DATA.ctaTitle);
  setText("homeCtaSub", DATA.ctaSub);

  const call = $("homeCallLink");
  const wa = $("homeWaLink");
  const email = $("homeEmailLink");
  if (call) call.href = DATA.phoneHref;
  if (wa) wa.href = DATA.whatsappHref;
  if (email) email.href = "mailto:" + DATA.email;
}

/* ============================================================
   EDIT MODE — toggling + wiring contenteditable fields
   ============================================================ */

const editToggle = $("homeEditToggle");
if (editToggle && ownerIsUnlocked()) editToggle.style.display = "flex";

function setEditMode(on) {
  document.body.classList.toggle("edit-mode", on);
  if (editToggle) editToggle.classList.toggle("active", on);
  document.querySelectorAll("[contenteditable]").forEach((el) => {
    el.setAttribute("contenteditable", on ? "true" : "false");
  });
}

if (editToggle) {
  editToggle.addEventListener("click", () => setEditMode(!document.body.classList.contains("edit-mode")));
}
const doneBtn = $("homeDoneBtn");
if (doneBtn) doneBtn.addEventListener("click", () => setEditMode(false));

/** Binds a simple text field once (guarded so re-render doesn't stack duplicate listeners). */
function bindText(id, onSave) {
  const el = $(id);
  if (!el || el.dataset.bound === "1") return;
  el.dataset.bound = "1";
  el.addEventListener("blur", () => {
    onSave(el.textContent.trim());
    saveHomeData();
    render();
  });
}

/** Same as bindText but reads/writes innerHTML (used for heroTitleHTML, which contains <em>/<br>). */
function bindHTML(id, onSave) {
  const el = $(id);
  if (!el || el.dataset.bound === "1") return;
  el.dataset.bound = "1";
  el.addEventListener("blur", () => {
    onSave(el.innerHTML.trim());
    saveHomeData();
    render();
  });
}

function wireEditableFields() {
  // Hero
  bindHTML("homeHeroTitle", (v) => (DATA.heroTitleHTML = v));
  bindText("homeHeroEyebrow", (v) => (DATA.heroEyebrow = v));
  bindText("homeHeroSubtitle", (v) => (DATA.heroSubtitle = v));
  bindText("homeCtaPrimary", (v) => (DATA.ctaPrimaryLabel = v));
  bindText("homeCtaSecondary", (v) => (DATA.ctaSecondaryLabel = v));
  bindText("homeTrustLine", (v) => (DATA.trustLine = v));
  bindText("homePhoneCaption", (v) => (DATA.phoneCaption = v));

  // Benefits (dynamic — freshly created each render, so binding is always on new elements)
  document.querySelectorAll("[data-bfield]").forEach((el) => {
    el.addEventListener("blur", () => {
      const i = Number(el.dataset.bi);
      DATA.benefits[i][el.dataset.bfield] = el.textContent.trim();
      saveHomeData();
      render();
    });
  });

  // Compare
  bindText("homeCompareEyebrow", (v) => (DATA.compareEyebrow = v));
  bindText("homeCompareTitle", (v) => (DATA.compareTitle = v));
  bindText("homeCompareBadTag", (v) => (DATA.compareBadTag = v));
  bindText("homeCompareBadNote", (v) => (DATA.compareBadNote = v));
  bindText("homeCompareGoodTag", (v) => (DATA.compareGoodTag = v));
  bindText("homeCompareGoodLabel", (v) => (DATA.compareGoodLabel = v));
  bindText("homeCompareGoodNote", (v) => (DATA.compareGoodNote = v));

  // Demo
  bindText("homeDemoEyebrow", (v) => (DATA.demoEyebrow = v));
  bindText("homeDemoTitle", (v) => (DATA.demoTitle = v));
  bindText("homeDemoSub", (v) => (DATA.demoSub = v));
  bindText("homeDemoButtonLabel", (v) => (DATA.demoButtonLabel = v));

  // Pricing
  bindText("homePricingEyebrow", (v) => (DATA.pricingEyebrow = v));
  bindText("homePricingTitle", (v) => (DATA.pricingTitle = v));
  bindText("homePricingSub", (v) => (DATA.pricingSub = v));

  document.querySelectorAll("[data-pfield]").forEach((el) => {
    el.addEventListener("blur", () => {
      const i = Number(el.dataset.pi);
      DATA.pricing[i][el.dataset.pfield] = el.textContent.trim();
      saveHomeData();
      render();
    });
  });
  document.querySelectorAll("[data-pfeature]").forEach((el) => {
    el.addEventListener("blur", () => {
      const pi = Number(el.dataset.pi);
      const fi = Number(el.dataset.fi);
      DATA.pricing[pi].features[fi] = el.textContent.trim();
      saveHomeData();
      render();
    });
  });

  // CTA / footer
  bindText("homeCtaEyebrow", (v) => (DATA.ctaEyebrow = v));
  bindText("homeCtaTitle", (v) => (DATA.ctaTitle = v));
  bindText("homeCtaSub", (v) => (DATA.ctaSub = v));
  bindText("homeFooter", (v) => (DATA.footerText = v));
}

/* ============================================================
   BUTTON ACTIONS (event delegation — works for dynamically
   rendered pricing/compare buttons too, since it's on document)
   ============================================================ */

document.addEventListener("click", (e) => {
  handleAddFeature(e);
  handleRemoveFeature(e);
  handleCompareRegisterPhoto(e);
  handleCompareRemovePhoto(e);
  handleChangeDemoHotel(e);
  handleEditContactDetails(e);
});

function handleAddFeature(e) {
  const btn = e.target.closest("[data-addfeature]");
  if (!btn) return;
  const pi = Number(btn.dataset.pi);
  const text = prompt("New line for this pricing card:", "");
  if (text && text.trim()) {
    DATA.pricing[pi].features.push(text.trim());
    saveHomeData();
    render();
  }
}

function handleRemoveFeature(e) {
  const btn = e.target.closest("[data-removefeature]");
  if (!btn || !document.body.classList.contains("edit-mode")) return;
  const pi = Number(btn.dataset.pi);
  const fi = Number(btn.dataset.fi);
  DATA.pricing[pi].features.splice(fi, 1);
  saveHomeData();
  render();
}

/** Sets a compare image field to a relative path — never base64, exactly as required. */
function handleCompareRegisterPhoto(e) {
  const btn = e.target.closest("[data-photofield]");
  if (!btn) return;
  const field = btn.dataset.photofield;
  const current = DATA[field] || "";
  const path = prompt(
    "Relative path to the photo (already placed under images/homepage/), e.g.\n" +
      "images/homepage/ota.webp",
    current
  );
  if (path === null || !path.trim()) return;
  DATA[field] = path.trim();
  saveHomeData();
  render();
}

function handleCompareRemovePhoto(e) {
  const btn = e.target.closest("[data-removephotofield]");
  if (!btn) return;
  const field = btn.dataset.removephotofield;
  DATA[field] = "";
  saveHomeData();
  render();
}

function handleChangeDemoHotel(e) {
  const btn = e.target.closest("#homeChangeDemoBtn");
  if (!btn) return;
  const slug = prompt("Which hotel slug should the homepage showcase? (e.g. akari-inn)", DATA.demoHotelSlug);
  if (slug && slug.trim()) {
    DATA.demoHotelSlug = slug.trim();
    saveHomeData();
    render();
  }
}

function handleEditContactDetails(e) {
  const btn = e.target.closest("#homeEditContactBtn");
  if (!btn) return;

  const phone = prompt("Phone number (shown to visitors):", DATA.phone);
  if (phone === null) return;
  const whatsapp = prompt("WhatsApp number:", DATA.whatsapp);
  if (whatsapp === null) return;
  const email = prompt("Email:", DATA.email);
  if (email === null) return;

  DATA.phone = phone.trim();
  DATA.phoneHref = "tel:" + phone.replace(/[^0-9+]/g, "");
  DATA.whatsapp = whatsapp.trim();
  DATA.whatsappHref = "https://wa.me/" + whatsapp.replace(/[^0-9]/g, "");
  DATA.email = email.trim();

  saveHomeData();
  render();
}

/* ============================================================
   EXPORT / IMPORT / RESET
   ============================================================ */

const exportBtn = $("homeExportBtn");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "homepage.json";
    a.click();
    URL.revokeObjectURL(url);
    alert("Downloaded homepage.json. Replace data/homepage.json with this file, then commit & push to make it live.");
  });
}

const importBtn = $("homeImportBtn");
const importFile = $("homeImportFile");
if (importBtn) importBtn.addEventListener("click", () => importFile.click());
if (importFile) {
  importFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      DATA = JSON.parse(text);
      saveHomeData();
      render();
      alert("Imported into local preview. Use Export when ready to publish.");
    } catch (err) {
      alert("Could not read that file.");
    }
  });
}

const resetBtn = $("homeResetBtn");
if (resetBtn) {
  resetBtn.addEventListener("click", async () => {
    const ok = confirm(
      "This discards any local preview edits for the homepage (in this browser only) and reloads " +
        "the real, published homepage.json from the server. Your published file is never affected " +
        "either way. Continue?"
    );
    if (!ok) return;
    try {
      localStorage.removeItem(HOME_STORAGE_KEY);
    } catch (err) {
      /* ignore */
    }
    DATA = await loadHomeData();
    render();
    alert("Local preview cleared — now showing the real published homepage.json.");
  });
}

/* ============================================================
   INIT
   ============================================================ */

async function init() {
  DATA = await loadHomeData();
  render();
}
init();
