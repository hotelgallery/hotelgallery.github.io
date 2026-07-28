/* ============================================================
   HOMEPAGE ENGINE — same philosophy as js/gallery.js, but
   completely separate so the hotel engine is never touched.
   Loads data/homepage.json (the real, published homepage content).
   ============================================================ */

const SAMPLE_HOME = {
  heroEyebrow: "For Hotels Across India",
  heroTitleHTML: "Your rooms look <em>incredible</em>.<br>Does your listing?",
  heroSubtitle: "Hotel Gallery gives your property a fast, premium, mobile-first photo showcase.",
  ctaPrimaryLabel: "See The Live Demo →",
  ctaSecondaryLabel: "Get Your Hotel Listed",
  trustLine: "No app to install, no dashboard to learn — you send us photos, we handle the rest.",
  demoHotelSlug: "akari-inn",
  phoneCaption: "↑ That's a real, live page — not a mockup.",
  benefitsEyebrow: "Why It Works",
  benefitsTitle: "Built around how guests actually browse",
  benefitsSub: "",
  benefits: [
    { label: "Photography", title: "Full-screen, not cropped", desc: "" },
    { label: "Direct Contact", title: "Straight to you", desc: "" },
    { label: "Mobile First", title: "Made for the phone", desc: "" },
    { label: "Zero Effort", title: "You send photos, we do the rest", desc: "" }
  ],
  compareEyebrow: "The Difference",
  compareTitle: "What guests see today vs. what they could see",
  compareBadTag: "Typical OTA Listing",
  compareBadImage: "",
  compareBadNote: "",
  compareGoodTag: "Hotel Gallery Page",
  compareGoodImage: "",
  compareGoodLabel: "Your Hotel",
  compareGoodNote: "",
  demoEyebrow: "See It Yourself",
  demoTitle: "Open the live demo hotel",
  demoSub: "",
  demoButtonLabel: "Open Full Demo ↗",
  pricingEyebrow: "Pricing",
  pricingTitle: "Simple, one-time setup",
  pricingSub: "",
  pricing: [
    { tier: "Starter", amount: "₹2,999", desc: "", features: ["Feature 1","Feature 2"], ctaLabel: "Choose Starter", featured: false },
    { tier: "Premium", amount: "₹6,999", desc: "", features: ["Feature 1","Feature 2"], ctaLabel: "Choose Premium", featured: true },
    { tier: "Elite", amount: "₹14,999", desc: "", features: ["Feature 1","Feature 2"], ctaLabel: "Choose Elite", featured: false }
  ],
  ctaEyebrow: "Get In Touch",
  ctaTitle: "Let's get your hotel online this week",
  ctaSub: "",
  phone: "+91 00000 00000", phoneHref: "tel:+9100000000",
  whatsapp: "+91 00000 00000", whatsappHref: "https://wa.me/9100000000",
  email: "info@hotelgallery.in",
  footerText: "© 2026 Hotel Gallery. All Rights Reserved."
};

const HOME_JSON_PATH = "data/homepage.json";
const HOME_STORAGE_KEY = "hg_home_preview";
let DATA = null;

async function loadHomeData(){
  let published = null;
  try{
    const res = await fetch(HOME_JSON_PATH, { cache: 'no-store' });
    if(res.ok) published = await res.json();
  }catch(e){}
  if(!published){
    showFetchWarning();
    published = JSON.parse(JSON.stringify(SAMPLE_HOME));
  }
  try{
    const raw = localStorage.getItem(HOME_STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return published;
}
function saveHomeData(){
  try{ localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(DATA)); }catch(e){
    alert("Could not save — your browser storage may be full.");
  }
}
function showFetchWarning(){
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed; top:0; left:0; right:0; z-index:200; background:#e05b3c; color:#fff; font-family:Inter,sans-serif; font-size:0.78rem; padding:10px 16px; text-align:center;';
  bar.innerHTML = `Could not load <code>${HOME_JSON_PATH}</code> — showing sample placeholder data instead. ` +
    `This is normal if you opened this file directly (file://). Run <code>python3 -m http.server</code> in this folder, then open localhost — see README.md.`;
  document.body.prepend(bar);
}

/* ---------- Edit access (same philosophy as hotel.html) ---------- */
const EDIT_KEY = "ownerkey2026"; // <-- keep in sync with js/gallery.js's EDIT_KEY if you want one shared password
const EDIT_UNLOCK_STORAGE = "hg_home_owner_unlocked";
(function checkEditAccess(){
  const params = new URLSearchParams(window.location.search);
  if(params.get('edit') === EDIT_KEY){
    try{ localStorage.setItem(EDIT_UNLOCK_STORAGE, '1'); }catch(e){}
  }
})();
function ownerIsUnlocked(){
  try{ return localStorage.getItem(EDIT_UNLOCK_STORAGE) === '1'; }catch(e){ return false; }
}

/* ---------- Render ---------- */
function setText(id, val){ const el = document.getElementById(id); if(el && val !== undefined) el.textContent = val; }
function setHTML(id, val){ const el = document.getElementById(id); if(el && val !== undefined) el.innerHTML = val; }

function fileToDataUrl(file){
  return new Promise((resolve,reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function pickImage(onPicked){
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.addEventListener('change', async () => {
    if(input.files && input.files[0]){
      const dataUrl = await fileToDataUrl(input.files[0]);
      onPicked(dataUrl);
    }
  });
  input.click();
}

function renderCompareVisual(elId, imageUrl, labelText){
  const el = document.getElementById(elId);
  if(!el) return;
  if(imageUrl){
    const esc = imageUrl.replace(/"/g,'&quot;');
    const overlay = labelText !== null ? `<div class="compare-photo-overlay"></div>` : '';
    const label = labelText !== null ? `<span id="homeCompareGoodLabel" contenteditable="false">${labelText}</span>` : '';
    el.innerHTML = `<div class="compare-photo" style="background-image:url('${esc}')"></div>${overlay}${label}`;
    el.style.background = 'none';
    el.style.padding = '0';
    el.style.display = 'flex';
  } else if(labelText !== null){
    el.innerHTML = `<span id="homeCompareGoodLabel" contenteditable="false">${labelText}</span>`;
    el.style.background = '';
    el.style.padding = '';
    el.style.display = '';
  } else {
    el.innerHTML = `<div class="tile"></div><div class="tile"></div><div class="tile"></div>`;
    el.style.background = '';
    el.style.padding = '';
    el.style.display = '';
  }
}

function renderCompareActions(elId, dataField){
  const el = document.getElementById(elId);
  if(!el) return;
  const hasImage = !!DATA[dataField];
  el.innerHTML = `
    <button class="compare-photo-btn" data-registerphotofield="${dataField}" title="Recommended for production — no browser storage used">+ Register Existing Photo</button>
    <button class="compare-photo-btn" data-photofield="${dataField}" style="opacity:0.7; font-size:0.66rem;" title="Quick preview only">${hasImage ? 'Change (quick preview)' : '+ Add Photo (quick preview only)'}</button>
    ${hasImage ? `<button class="compare-photo-btn remove" data-removephotofield="${dataField}">Remove Photo</button>` : ''}
  `;
}

function render(){
  setHTML('homeHeroTitle', DATA.heroTitleHTML);
  setText('homeHeroEyebrow', DATA.heroEyebrow);
  setText('homeHeroSubtitle', DATA.heroSubtitle);
  setText('homeCtaPrimary', DATA.ctaPrimaryLabel);
  setText('homeCtaSecondary', DATA.ctaSecondaryLabel);
  setText('homeTrustLine', DATA.trustLine);
  setText('homePhoneCaption', DATA.phoneCaption);

  const iframe = document.getElementById('homeDemoFrame');
  if(iframe) iframe.src = `hotel.html?hotel=${DATA.demoHotelSlug}`;
  document.querySelectorAll('[data-demo-link]').forEach(a => a.href = `hotel.html?hotel=${DATA.demoHotelSlug}`);

  setText('homeBenefitsEyebrow', DATA.benefitsEyebrow);
  setText('homeBenefitsTitle', DATA.benefitsTitle);
  setText('homeBenefitsSub', DATA.benefitsSub);
  const bGrid = document.getElementById('homeBenefitsGrid');
  if(bGrid){
    bGrid.innerHTML = '';
    DATA.benefits.forEach((b, i) => {
      const div = document.createElement('div');
      div.className = 'benefit';
      div.innerHTML = `
        <div class="num" contenteditable="false" data-bfield="label" data-bi="${i}">${b.label}</div>
        <h3 contenteditable="false" data-bfield="title" data-bi="${i}">${b.title}</h3>
        <p contenteditable="false" data-bfield="desc" data-bi="${i}">${b.desc}</p>
      `;
      bGrid.appendChild(div);
    });
  }

  setText('homeCompareEyebrow', DATA.compareEyebrow);
  setText('homeCompareTitle', DATA.compareTitle);
  setText('homeCompareBadTag', DATA.compareBadTag);
  setText('homeCompareBadNote', DATA.compareBadNote);
  setText('homeCompareGoodTag', DATA.compareGoodTag);
  setText('homeCompareGoodNote', DATA.compareGoodNote);
  renderCompareVisual('homeCompareBadVisual', DATA.compareBadImage, null);
  renderCompareVisual('homeCompareGoodVisual', DATA.compareGoodImage, DATA.compareGoodLabel);
  renderCompareActions('homeCompareBadActions', 'compareBadImage');
  renderCompareActions('homeCompareGoodActions', 'compareGoodImage');

  setText('homeDemoEyebrow', DATA.demoEyebrow);
  setText('homeDemoTitle', DATA.demoTitle);
  setText('homeDemoSub', DATA.demoSub);
  setText('homeDemoButtonLabel', DATA.demoButtonLabel);

  setText('homePricingEyebrow', DATA.pricingEyebrow);
  setText('homePricingTitle', DATA.pricingTitle);
  setText('homePricingSub', DATA.pricingSub);
  const pGrid = document.getElementById('homePricingGrid');
  if(pGrid){
    pGrid.innerHTML = '';
    DATA.pricing.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'price-card' + (p.featured ? ' featured' : '');
      const featuresHTML = p.features.map((f, fi) => `
        <li>
          <span contenteditable="false" data-pfeature="1" data-pi="${i}" data-fi="${fi}" style="flex:1;">${f}</span>
          <button class="feature-remove" data-removefeature data-pi="${i}" data-fi="${fi}" title="Remove">✕</button>
        </li>`).join('');
      card.innerHTML = `
        <div class="tier" contenteditable="false" data-pfield="tier" data-pi="${i}">${p.tier}</div>
        <div class="amount" contenteditable="false" data-pfield="amount" data-pi="${i}">${p.amount}</div>
        <p class="desc" contenteditable="false" data-pfield="desc" data-pi="${i}">${p.desc}</p>
        <ul>${featuresHTML}</ul>
        <button class="add-feature-btn" data-addfeature data-pi="${i}">+ Add line</button>
        <a href="#contact" class="btn ${p.featured ? 'btn-primary' : 'btn-ghost-dark'}" style="${p.featured?'':'border-color:var(--ink);'} margin-top:16px;" contenteditable="false" data-pfield="ctaLabel" data-pi="${i}">${p.ctaLabel}</a>
      `;
      pGrid.appendChild(card);
    });
  }

  setText('homeCtaEyebrow', DATA.ctaEyebrow);
  setText('homeCtaTitle', DATA.ctaTitle);
  setText('homeCtaSub', DATA.ctaSub);
  const call = document.getElementById('homeCallLink');
  const wa = document.getElementById('homeWaLink');
  const em = document.getElementById('homeEmailLink');
  if(call){ call.href = DATA.phoneHref; call.textContent = 'Call Us'; }
  if(wa){ wa.href = DATA.whatsappHref; }
  if(em){ em.href = 'mailto:' + DATA.email; }
  setText('homeFooter', DATA.footerText);

  wireEditableFields();
}

/* ---------- Edit mode ---------- */
const editToggle = document.getElementById('homeEditToggle');
if(editToggle && ownerIsUnlocked()){ editToggle.style.display = 'flex'; }

function setEditMode(on){
  document.body.classList.toggle('edit-mode', on);
  if(editToggle) editToggle.classList.toggle('active', on);
  document.querySelectorAll('[contenteditable]').forEach(el => el.setAttribute('contenteditable', on ? 'true' : 'false'));
}
if(editToggle) editToggle.addEventListener('click', () => setEditMode(!document.body.classList.contains('edit-mode')));
const doneBtn = document.getElementById('homeDoneBtn');
if(doneBtn) doneBtn.addEventListener('click', () => setEditMode(false));

function bindText(id, onSave){
  const el = document.getElementById(id);
  if(!el || el.dataset.bound === '1') return;
  el.dataset.bound = '1';
  el.addEventListener('blur', () => { onSave(el.textContent.trim()); saveHomeData(); render(); });
}
function bindHTML(id, onSave){
  const el = document.getElementById(id);
  if(!el || el.dataset.bound === '1') return;
  el.dataset.bound = '1';
  el.addEventListener('blur', () => { onSave(el.innerHTML.trim()); saveHomeData(); render(); });
}

function wireEditableFields(){
  bindHTML('homeHeroTitle', v => DATA.heroTitleHTML = v);
  bindText('homeHeroEyebrow', v => DATA.heroEyebrow = v);
  bindText('homeHeroSubtitle', v => DATA.heroSubtitle = v);
  bindText('homeCtaPrimary', v => DATA.ctaPrimaryLabel = v);
  bindText('homeCtaSecondary', v => DATA.ctaSecondaryLabel = v);
  bindText('homeTrustLine', v => DATA.trustLine = v);
  bindText('homePhoneCaption', v => DATA.phoneCaption = v);

  bindText('homeBenefitsEyebrow', v => DATA.benefitsEyebrow = v);
  bindText('homeBenefitsTitle', v => DATA.benefitsTitle = v);
  bindText('homeBenefitsSub', v => DATA.benefitsSub = v);

  document.querySelectorAll('[data-bfield]').forEach(el => {
    el.addEventListener('blur', () => {
      const i = Number(el.dataset.bi);
      DATA.benefits[i][el.dataset.bfield] = el.textContent.trim();
      saveHomeData(); render();
    });
  });

  bindText('homeCompareEyebrow', v => DATA.compareEyebrow = v);
  bindText('homeCompareTitle', v => DATA.compareTitle = v);
  bindText('homeCompareBadTag', v => DATA.compareBadTag = v);
  bindText('homeCompareBadNote', v => DATA.compareBadNote = v);
  bindText('homeCompareGoodTag', v => DATA.compareGoodTag = v);
  bindText('homeCompareGoodLabel', v => DATA.compareGoodLabel = v);
  bindText('homeCompareGoodNote', v => DATA.compareGoodNote = v);

  bindText('homeDemoEyebrow', v => DATA.demoEyebrow = v);
  bindText('homeDemoTitle', v => DATA.demoTitle = v);
  bindText('homeDemoSub', v => DATA.demoSub = v);
  bindText('homeDemoButtonLabel', v => DATA.demoButtonLabel = v);

  bindText('homePricingEyebrow', v => DATA.pricingEyebrow = v);
  bindText('homePricingTitle', v => DATA.pricingTitle = v);
  bindText('homePricingSub', v => DATA.pricingSub = v);

  document.querySelectorAll('[data-pfield]').forEach(el => {
    el.addEventListener('blur', () => {
      const i = Number(el.dataset.pi);
      const field = el.dataset.pfield;
      const val = el.tagName === 'A' ? el.textContent.trim() : el.textContent.trim();
      DATA.pricing[i][field] = val;
      saveHomeData(); render();
    });
  });
  document.querySelectorAll('[data-pfeature]').forEach(el => {
    el.addEventListener('blur', () => {
      const pi = Number(el.dataset.pi), fi = Number(el.dataset.fi);
      DATA.pricing[pi].features[fi] = el.textContent.trim();
      saveHomeData(); render();
    });
  });

  bindText('homeCtaEyebrow', v => DATA.ctaEyebrow = v);
  bindText('homeCtaTitle', v => DATA.ctaTitle = v);
  bindText('homeCtaSub', v => DATA.ctaSub = v);
  bindText('homeFooter', v => DATA.footerText = v);
}

document.addEventListener('click', (e) => {
  const addF = e.target.closest('[data-addfeature]');
  if(addF){
    const pi = Number(addF.dataset.pi);
    const text = prompt("New line for this pricing card:", "");
    if(text && text.trim()){
      DATA.pricing[pi].features.push(text.trim());
      saveHomeData(); render();
    }
  }
  const rmF = e.target.closest('[data-removefeature]');
  if(rmF && document.body.classList.contains('edit-mode')){
    const pi = Number(rmF.dataset.pi), fi = Number(rmF.dataset.fi);
    DATA.pricing[pi].features.splice(fi, 1);
    saveHomeData(); render();
  }
  const registerPhotoBtn = e.target.closest('[data-registerphotofield]');
  if(registerPhotoBtn){
    const field = registerPhotoBtn.dataset.registerphotofield;
    let filename = prompt(
      `Filename of the photo you've already copied into images/homepage/\n` +
      `(e.g. "ota-example.webp" — just the filename)`,
      ""
    );
    if(!filename || !filename.trim()) return;
    filename = filename.trim();
    const path = filename.startsWith('images/') ? filename : `images/homepage/${filename}`;
    DATA[field] = path;
    saveHomeData(); render();
  }

  const photoBtn = e.target.closest('[data-photofield]');
  if(photoBtn){
    const field = photoBtn.dataset.photofield;
    pickImage(dataUrl => { DATA[field] = dataUrl; saveHomeData(); render(); });
  }
  const removePhotoBtn = e.target.closest('[data-removephotofield]');
  if(removePhotoBtn){
    const field = removePhotoBtn.dataset.removephotofield;
    DATA[field] = "";
    saveHomeData(); render();
  }

  const demoBtn = e.target.closest('#homeChangeDemoBtn');
  if(demoBtn){
    const slug = prompt("Which hotel slug should the homepage showcase? (e.g. akari-inn)", DATA.demoHotelSlug);
    if(slug && slug.trim()){
      DATA.demoHotelSlug = slug.trim();
      saveHomeData(); render();
    }
  }
  const phoneBtn = e.target.closest('#homeEditContactBtn');
  if(phoneBtn){
    const phone = prompt("Phone number (shown to visitors):", DATA.phone);
    if(phone === null) return;
    const wa = prompt("WhatsApp number:", DATA.whatsapp);
    if(wa === null) return;
    const email = prompt("Email:", DATA.email);
    if(email === null) return;
    DATA.phone = phone.trim();
    DATA.phoneHref = "tel:" + phone.replace(/[^0-9+]/g,'');
    DATA.whatsapp = wa.trim();
    DATA.whatsappHref = "https://wa.me/" + wa.replace(/[^0-9]/g,'');
    DATA.email = email.trim();
    saveHomeData(); render();
  }
});

/* ---------- Export / Import ---------- */
const exportBtn = document.getElementById('homeExportBtn');
if(exportBtn) exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'homepage.json';
  a.click();
  URL.revokeObjectURL(url);
  alert("Downloaded homepage.json. Replace data/homepage.json with this file, then commit & push to make it live.");
});
const importBtn = document.getElementById('homeImportBtn');
const importFile = document.getElementById('homeImportFile');
if(importBtn) importBtn.addEventListener('click', () => importFile.click());
if(importFile) importFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  try{
    const text = await file.text();
    DATA = JSON.parse(text);
    saveHomeData(); render();
    alert("Imported into local preview. Use Export when ready to publish.");
  }catch(err){
    alert("Could not read that file.");
  }
});

const resetBtn = document.getElementById('homeResetBtn');
if(resetBtn) resetBtn.addEventListener('click', async () => {
  const ok = confirm(
    "This discards any local preview edits for the homepage (in this browser only) and reloads the " +
    "real, published homepage.json from the server. Your published file is never affected either way. Continue?"
  );
  if(!ok) return;
  try{ localStorage.removeItem(HOME_STORAGE_KEY); }catch(e){}
  DATA = await loadHomeData();
  render();
  alert("Local preview cleared — now showing the real published homepage.json.");
});

async function init(){
  DATA = await loadHomeData();
  render();
}
init();
