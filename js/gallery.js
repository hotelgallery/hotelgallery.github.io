/* ============================================================
   HOTEL GALLERY ENGINE — one script, unlimited hotels.
   ============================================================
   This page loads hotels/<slug>/hotel.json (the real, published
   data for that hotel) based on the URL: hotel.html?hotel=<slug>
   If no ?hotel= is given, it defaults to "akari-inn".

   SAMPLE_DATA below is ONLY a fallback — used if hotel.json can't
   be fetched (e.g. testing by double-clicking the file, where
   browsers block loading local JSON files for security reasons —
   see the note near loadData() below for how to test properly).
   ============================================================ */
const SAMPLE_DATA = {
  name: "Akari Inn",
  eyebrow: "Kullu · Manali",
  tagline: "A quiet stay above the valley, five minutes from the mall road.",
  phone: "+91 00000 00000",
  phoneHref: "tel:+9100000000",
  whatsapp: "+91 00000 00000",
  whatsappHref: "https://wa.me/9100000000",
  email: "info@akariinn.com",
  mapsUrl: "https://maps.app.goo.gl/WhKhCBvqxmxEqqacA?g_st=ac",
  heroImage: "",
  contactEyebrow: "Get in touch",
  contactHeading: "Plan your stay",
  footerText: "© 2026 Hotel Gallery. All Rights Reserved.",
  categories: [
    { key:"exterior", label:"Exterior", image:"", images:[] },
    { key:"interior", label:"Interior", image:"", images:[] },
    { key:"rooms", label:"Rooms", image:"", images:[] },
    { key:"bathrooms", label:"Bathrooms", image:"", images:[] },
    { key:"amenities", label:"Amenities", image:"", images:[] },
    { key:"food", label:"Food & Drink", image:"", images:[] }
  ]
};
// each images[] entry: { src: "dataURL or url", cap: "caption text" }

const GRADIENTS = {
  rooms:"linear-gradient(150deg,#0a0a0a,#4a4a4a 60%,#8a8a8a)",
  bathrooms:"linear-gradient(150deg,#141414,#5c5c5c 60%,#c2c2c2)",
  exterior:"linear-gradient(150deg,#0a0a0a,#3d3d3d 55%,#9a9a9a)",
  interior:"linear-gradient(150deg,#101010,#565656 60%,#b0b0b0)",
  amenities:"linear-gradient(150deg,#151515,#4a4a4a 55%,#a8a8a8)",
  food:"linear-gradient(150deg,#9a9a9a,#4a4a4a 55%,#0a0a0a)"
};
const HERO_GRADIENT = "linear-gradient(150deg,#0a0a0a,#3d3d3d 55%,#6b6b6b 100%)";

/* ---------- Which hotel, and where its data lives ---------- */
const urlParams = new URLSearchParams(window.location.search);

const pathSlug = window.location.pathname
  .replace(/^\/+|\/+$/g, '')
  .split('/')[0];

const HOTEL_SLUG =
  urlParams.get('hotel') ||
  pathSlug ||
  'akari-inn';
const HOTEL_JSON_PATH = `hotels/${HOTEL_SLUG}/hotel.json`;
const STORAGE_KEY = `hg_preview_${HOTEL_SLUG}`; // local-only preview edits, per hotel

let DATA = null;

// Loads the REAL published data for this hotel from its hotel.json file.
// If you've made local edits in Edit Mode that haven't been exported yet,
// those are layered on top (from localStorage) so you can keep previewing them.
async function loadData(){
  let published = null;
  try{
    const res = await fetch(HOTEL_JSON_PATH, { cache: 'no-store' });
    if(res.ok) published = await res.json();
  }catch(e){ /* fetch blocked or file missing — handled below */ }

  if(!published){
    showFetchWarning();
    published = JSON.parse(JSON.stringify(SAMPLE_DATA));
  }

  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw); // unsaved local preview edits take priority
  }catch(e){}

  return published;
}

function showFetchWarning(){
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed; top:0; left:0; right:0; z-index:200; background:#e05b3c; color:#fff; font-family:Inter,sans-serif; font-size:0.78rem; padding:10px 16px; text-align:center;';
  bar.innerHTML = `Could not load <code>${HOTEL_JSON_PATH}</code> — showing sample placeholder data instead. ` +
    `This is normal if you opened this file directly (file://). Run it through a local server ` +
    `(e.g. <code>python3 -m http.server</code> in this folder, then open localhost) or publish it on ` +
    `GitHub Pages, and this warning will disappear.`;
  document.body.prepend(bar);
}

function saveData(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA)); }catch(e){
    alert("Could not save — your browser storage may be full. Try Export Backup, then remove a photo or two.");
  }
}

/* ---------- Render ---------- */
function bgStyle(catKeyOrHero){
  if(catKeyOrHero === 'hero'){
    return DATA.heroImage ? `url('${DATA.heroImage}')` : HERO_GRADIENT;
  }
  const cat = DATA.categories.find(c=>c.key===catKeyOrHero);
  if(cat && cat.image) return `url('${cat.image}')`;
  if(cat && cat.images.length) return `url('${cat.images[0].src}')`;
  return GRADIENTS[catKeyOrHero] || GRADIENTS.rooms;
}
// Real photos: blurred cover backdrop + the actual photo shown in full (contain), so
// vertical photos stay vertical and horizontal photos stay horizontal — nothing cropped.
// Placeholder gradients: just a single plain div, no photo to preserve.
function slideBgHTML(bg){
  if(bg.startsWith('url')){
    const esc = bg.replace(/"/g,'&quot;');
    return `<div class="cslide-bg" style="background-image:${esc}"></div><div class="cslide-img" style="background-image:${esc}"></div>`;
  }
  return `<div class="cslide-bg" style="background:${bg}"></div>`;
}

function render(){
  document.getElementById('fieldName').textContent = DATA.name;
  document.getElementById('fieldContactEyebrow').textContent = DATA.contactEyebrow || "Get in touch";
  document.getElementById('fieldContactHeading').textContent = DATA.contactHeading || "Plan your stay";
  document.getElementById('fieldFooter').textContent = DATA.footerText || "© 2026 Hotel Gallery. All Rights Reserved.";

  document.getElementById('cLocation').textContent = "View on map";
  document.getElementById('cLocationLink').href = DATA.mapsUrl;
  document.getElementById('cPhone').textContent = DATA.phone;
  document.getElementById('cPhoneLink').href = DATA.phoneHref;
  document.getElementById('cWhats').textContent = DATA.whatsapp;
  document.getElementById('cWhatsLink').href = DATA.whatsappHref;
  document.getElementById('cEmail').textContent = DATA.email;
  document.getElementById('cEmailLink').href = "mailto:" + DATA.email;
  document.getElementById('menuCall').href = DATA.phoneHref;
  document.getElementById('menuWhatsapp').href = DATA.whatsappHref;
  document.getElementById('menuEmail').href = "mailto:" + DATA.email;

  const track = document.getElementById('carTrack');
  const dotsEl = document.getElementById('carDots');
  const menuLinks = document.getElementById('menuLinks');
  track.innerHTML = '';
  dotsEl.innerHTML = '';
  menuLinks.innerHTML = '';

  const total = DATA.categories.length + 1; // +1 for hero/welcome slide
  document.getElementById('carCount').textContent = `${carIndex+1} / ${total}`;

  // slide 0: welcome
  const hero = document.createElement('div');
  hero.className = 'cslide';
  hero.dataset.slide = '0';
  hero.innerHTML = `
    ${slideBgHTML(bgStyle('hero'))}
    <div class="cslide-body">
      <div class="cslide-eyebrow" id="fieldEyebrow" contenteditable="false">${DATA.eyebrow}</div>
      <h2 id="fieldHeroName" contenteditable="false">${DATA.name}</h2>
      <p id="fieldTagline" contenteditable="false">${DATA.tagline}</p>
      <button class="see-gallery-pill" id="heroExploreBtn">Explore</button>
      <div style="margin-top:16px;">
        <button class="add-photo-btn" id="heroAddPhotoBtn" title="Type the filename you've already copied into hotels/&lt;slug&gt;/gallery/hero/ — no upload, no storage used">+ Register Cover Photo</button>
      </div>
    </div>
  `;
  track.appendChild(hero);
  const heroDot = document.createElement('span');
  dotsEl.appendChild(heroDot);

  DATA.categories.forEach((cat, i) => {
    const slide = document.createElement('div');
    slide.className = 'cslide';
    slide.dataset.slide = String(i+1);

    slide.innerHTML = `
      ${slideBgHTML(bgStyle(cat.key))}
      <div class="cslide-body">
        <h2 contenteditable="false" data-catlabel="${cat.key}">${cat.label}</h2>
        <button class="see-gallery-pill" data-cat="${cat.key}" ${cat.images.length ? '' : 'disabled'}>
          ${cat.images.length ? 'See Gallery' : 'No Photos Yet'}
        </button>
        <div style="margin-top:16px; display:flex; flex-direction:column; gap:8px; align-items:center;">
          <button class="add-photo-btn" data-registercat="${cat.key}" title="Recommended for production — no browser storage used">+ Register Existing Photo</button>
          <button class="add-photo-btn" data-addcat="${cat.key}" style="opacity:0.7; font-size:0.66rem;" title="Quick preview only — fills up browser storage fast, don't use for 10+ photos">+ Add Photo (quick preview only)</button>
        </div>
      </div>
    `;
    track.appendChild(slide);

    const dot = document.createElement('span');
    dotsEl.appendChild(dot);

    const a = document.createElement('a');
    a.href = "#";
    a.textContent = cat.label;
    a.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); goToSlide(i+1); });
    menuLinks.appendChild(a);
  });

  updateCarousel();
  wireEditableFields();
}

/* ---------- Carousel navigation ---------- */
let carIndex = 0;
function slideCount(){ return DATA.categories.length + 1; }
function updateCarousel(){
  const slides = document.querySelectorAll('.cslide');
  const dots = document.querySelectorAll('.car-dots span');
  slides.forEach((s,i) => s.classList.toggle('active', i===carIndex));
  dots.forEach((d,i) => d.classList.toggle('active', i===carIndex));
  const c = document.getElementById('carCount');
  if(c) c.textContent = `${carIndex+1} / ${slideCount()}`;
}
function goToSlide(i){
  carIndex = (i + slideCount()) % slideCount();
  updateCarousel();
}
document.getElementById('carPrev').addEventListener('click', () => goToSlide(carIndex - 1));
document.getElementById('carNext').addEventListener('click', () => goToSlide(carIndex + 1));
document.addEventListener('click', (e) => {
  if(e.target.closest('#heroExploreBtn')) goToSlide(carIndex + 1);
});
document.addEventListener('keydown', (e) => {
  if(lightbox.classList.contains('show') || document.body.classList.contains('edit-mode')) return;
  if(e.key === 'ArrowRight') goToSlide(carIndex + 1);
  if(e.key === 'ArrowLeft') goToSlide(carIndex - 1);
});
let carTouchStartX = 0;
const carouselEl = document.getElementById('carousel');
carouselEl.addEventListener('touchstart', e => carTouchStartX = e.touches[0].clientX);
carouselEl.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - carTouchStartX;
  if(Math.abs(dx) < 40) return;
  if(dx > 0) goToSlide(carIndex - 1); else goToSlide(carIndex + 1);
});

/* ============================================================
   WHO CAN EDIT — read this before publishing
   ============================================================
   This ONE engine (gallery.js) serves every hotel, so EDIT_KEY
   below is shared across all of them — it just controls whether
   the pencil icon appears at all in this browser. WHICH hotel's
   data you're editing is decided separately by ?hotel=<slug> in
   the URL.

   By default, NO ONE sees the edit pencil — it's hidden.
   It only appears if you open the page with the secret key in
   the URL, like:  hotel.html?hotel=akari-inn&edit=ownerkey2026

   Change EDIT_KEY below to your own secret word before you
   publish. The first time you visit with the correct ?edit=...
   link, this browser remembers you're the owner (saved locally)
   and keeps showing the pencil to you from then on for THAT
   hotel — even without ?edit= in the URL next time. Anyone else
   opening the plain URL never sees any edit controls.

   HONEST LIMITATION: this key lives in the page's own code, so
   it is NOT bank-grade security — a determined technical person
   could view the page source and find it. It's a lock on your
   front door, not a bank vault. For an ordinary hotel guest or
   visitor, they will never see or find the edit option. If you
   ever need real, unbreakable access control (e.g. multiple staff
   logins, can't-be-viewed-in-source protection), that requires a
   real backend/server — a bigger step we can take later.
   ============================================================ */
const EDIT_KEY = "ownerkey2026"; // <-- change this before publishing, keep it secret
const EDIT_UNLOCK_STORAGE = `hg_owner_unlocked_${HOTEL_SLUG}`;
(function checkEditAccess(){
  const params = new URLSearchParams(window.location.search);
  if(params.get('edit') === EDIT_KEY){
    try{ localStorage.setItem(EDIT_UNLOCK_STORAGE, '1'); }catch(e){}
  }
})();
function ownerIsUnlocked(){
  try{ return localStorage.getItem(EDIT_UNLOCK_STORAGE) === '1'; }catch(e){ return false; }
}

/* ---------- Edit mode ---------- */
const editToggle = document.getElementById('editToggle');
if(ownerIsUnlocked()){ editToggle.style.display = 'flex'; }
function setEditMode(on){
  document.body.classList.toggle('edit-mode', on);
  editToggle.classList.toggle('active', on);
  document.querySelectorAll('[contenteditable]').forEach(el => el.setAttribute('contenteditable', on ? 'true' : 'false'));
}
editToggle.addEventListener('click', () => setEditMode(!document.body.classList.contains('edit-mode')));
document.getElementById('doneBtn').addEventListener('click', () => setEditMode(false));

function wireEditableFields(){
  bindText('fieldName', v => DATA.name = v);
  bindText('fieldHeroName', v => DATA.name = v);
  bindText('fieldEyebrow', v => DATA.eyebrow = v);
  bindText('fieldTagline', v => DATA.tagline = v);
  bindText('fieldContactEyebrow', v => DATA.contactEyebrow = v);
  bindText('fieldContactHeading', v => DATA.contactHeading = v);
  bindText('fieldFooter', v => DATA.footerText = v);
  bindText('cPhone', v => { DATA.phone = v; DATA.phoneHref = "tel:" + v.replace(/[^0-9+]/g,''); });
  bindText('cWhats', v => { DATA.whatsapp = v; DATA.whatsappHref = "https://wa.me/" + v.replace(/[^0-9]/g,''); });
  bindText('cEmail', v => DATA.email = v);

  document.querySelectorAll('[data-catlabel]').forEach(h2 => {
    h2.addEventListener('blur', () => {
      const cat = DATA.categories.find(c=>c.key===h2.dataset.catlabel);
      if(cat){ cat.label = h2.textContent.trim(); saveData(); render(); }
    });
  });

  // keep hotel name in sync live between topbar and hero slide while typing
  ['fieldName','fieldHeroName'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el || el.dataset.inputBound === '1') return;
    el.dataset.inputBound = '1';
    el.addEventListener('input', e => {
      const v = e.target.textContent;
      const nameEl = document.getElementById('fieldName');
      const heroEl = document.getElementById('fieldHeroName');
      if(nameEl) nameEl.textContent = v;
      if(heroEl) heroEl.textContent = v;
    });
  });
}
function bindText(id, onSave){
  const el = document.getElementById(id);
  if(!el || el.dataset.bound === '1') return;
  el.dataset.bound = '1';
  el.addEventListener('blur', () => { onSave(el.textContent.trim()); saveData(); render(); });
}

/* ---------- Photo upload ---------- */
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

document.getElementById('editLocationBtn').addEventListener('click', () => {
  const current = DATA.mapsUrl && DATA.mapsUrl !== "https://maps.google.com" ? DATA.mapsUrl : "";
  const url = prompt("Paste this hotel's Google Maps link (from Google Maps app -> Share -> Copy link):", current);
  if(url && url.trim()){
    DATA.mapsUrl = url.trim();
    saveData(); render();
  }
});

function registerCoverPhoto(slideAt){
  const folderKey = slideAt === 0 ? 'hero' : DATA.categories[slideAt-1].key;
  let filename = prompt(
    `Filename of the cover photo you've already copied into hotels/${HOTEL_SLUG}/gallery/${folderKey}/\n` +
    `(e.g. "cover.webp" — just the filename)`,
    ""
  );
  if(!filename || !filename.trim()) return;
  filename = filename.trim();
  const path = filename.startsWith('hotels/') ? filename : `hotels/${HOTEL_SLUG}/gallery/${folderKey}/${filename}`;
  if(slideAt === 0){ DATA.heroImage = path; }
  else { DATA.categories[slideAt-1].image = path; }
  saveData(); render(); goToSlide(slideAt);
}

document.getElementById('heroCoverBtn').addEventListener('click', () => registerCoverPhoto(carIndex));

document.addEventListener('click', (e) => {
  if(e.target.closest('#heroAddPhotoBtn')){
    registerCoverPhoto(0);
  }
});

document.getElementById('menuClose').addEventListener('click', closeMenu);

document.addEventListener('click', (e) => {
  const registerBtn = e.target.closest('[data-registercat]');
  if(registerBtn){
    const key = registerBtn.dataset.registercat;
    const cat = DATA.categories.find(c=>c.key===key);
    let filename = prompt(
      `Filename of the photo you've already copied into hotels/${HOTEL_SLUG}/gallery/${key}/\n` +
      `(e.g. "exterior-1.webp" — just the filename, it'll be placed in the right folder automatically)`,
      ""
    );
    if(!filename || !filename.trim()) return;
    filename = filename.trim();
    // Allow pasting either a bare filename or a full "hotels/.../gallery/..." path — normalize to
    // the correct path relative to hotel.html (which lives at the project root, not inside the
    // hotel's own folder — so the path must include "hotels/<slug>/" or images won't load).
    const path = filename.startsWith('hotels/') ? filename : `hotels/${HOTEL_SLUG}/gallery/${key}/${filename}`;
    const label = prompt("Short label for this photo (e.g. 'Deluxe Room'):", cat.label) || cat.label;
    cat.images.push({ src: path, cap: label });
    saveData(); render();
  }

  const addBtn = e.target.closest('[data-addcat]');
  if(addBtn){
    const key = addBtn.dataset.addcat;
    pickImage(dataUrl => {
      const cat = DATA.categories.find(c=>c.key===key);
      const label = prompt("Short label for this photo (e.g. 'Deluxe Room'):", cat.label) || cat.label;
      cat.images.push({ src: dataUrl, cap: label });
      saveData(); render();
    });
  }
});

/* ---------- Menu ---------- */
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
menuBtn.addEventListener('click', () => { menuBtn.classList.toggle('open'); menuOverlay.classList.toggle('show'); });
function closeMenu(){ menuBtn.classList.remove('open'); menuOverlay.classList.remove('show'); }

/* ---------- Lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lbTrack = document.getElementById('lbTrack');
const lbTitle = document.getElementById('lbTitle');
const lbCount = document.getElementById('lbCount');
const lbDots = document.getElementById('lbDots');
let currentSlide = 0, currentCatKey = null;

function openGallery(catKey, startIndex){
  const cat = DATA.categories.find(c => c.key === catKey);
  if(!cat.images.length) return;
  currentCatKey = catKey;
  lbTitle.textContent = cat.label;
  renderLightbox();
  currentSlide = startIndex || 0;
  updateSlide();
  lightbox.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function renderLightbox(){
  const cat = DATA.categories.find(c => c.key === currentCatKey);
  lbTrack.innerHTML = ''; lbDots.innerHTML = '';
  cat.images.forEach((image, i) => {
    const slide = document.createElement('div');
    slide.className = 'lb-slide';
    const url = `url('${image.src}')`;
    slide.innerHTML = `<div class="lb-bg" style="background-image:${url}"></div><div class="lb-img" style="background-image:${url}"></div><span class="cap">${image.cap || ''}</span><button class="photo-remove" data-removeidx="${i}" title="Remove photo">✕</button>`;
    lbTrack.appendChild(slide);
    const dot = document.createElement('span');
    if(i===currentSlide) dot.className = 'active';
    lbDots.appendChild(dot);
  });
}
function updateSlide(){
  const cat = DATA.categories.find(c => c.key === currentCatKey);
  if(!cat.images.length){ closeLightbox(); return; }
  if(currentSlide >= cat.images.length) currentSlide = cat.images.length - 1;
  lbTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  lbCount.textContent = `${currentSlide+1} / ${cat.images.length}`;
  [...lbDots.children].forEach((d,i) => d.classList.toggle('active', i===currentSlide));
}
document.getElementById('lbPrev').addEventListener('click', () => {
  const cat = DATA.categories.find(c => c.key === currentCatKey);
  currentSlide = (currentSlide - 1 + cat.images.length) % cat.images.length; updateSlide();
});
document.getElementById('lbNext').addEventListener('click', () => {
  const cat = DATA.categories.find(c => c.key === currentCatKey);
  currentSlide = (currentSlide + 1) % cat.images.length; updateSlide();
});
document.getElementById('lbClose').addEventListener('click', closeLightbox);
function closeLightbox(){ lightbox.classList.remove('show'); document.body.style.overflow=''; }
document.getElementById('lbAddBtn').addEventListener('click', () => {
  pickImage(dataUrl => {
    const cat = DATA.categories.find(c => c.key === currentCatKey);
    const label = prompt("Short label for this photo:", cat.label) || cat.label;
    cat.images.push({ src: dataUrl, cap: label });
    saveData(); renderLightbox(); currentSlide = cat.images.length - 1; updateSlide(); render();
  });
});
lbTrack.addEventListener('click', (e) => {
  const rm = e.target.closest('[data-removeidx]');
  if(rm && document.body.classList.contains('edit-mode')){
    const cat = DATA.categories.find(c => c.key === currentCatKey);
    cat.images.splice(Number(rm.dataset.removeidx), 1);
    saveData(); renderLightbox(); updateSlide(); render();
  }
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.see-gallery-pill[data-cat]');
  if(btn && !btn.disabled) openGallery(btn.dataset.cat, 0);
});
document.addEventListener('keydown', (e) => {
  if(!lightbox.classList.contains('show')) return;
  if(e.key === 'Escape') closeLightbox();
  if(e.key === 'ArrowRight') document.getElementById('lbNext').click();
  if(e.key === 'ArrowLeft') document.getElementById('lbPrev').click();
});
let touchStartX = 0;
lbTrack.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
lbTrack.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if(dx > 50) document.getElementById('lbPrev').click();
  if(dx < -50) document.getElementById('lbNext').click();
});

/* ---------- Export / Import ---------- */
document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'hotel.json';
  a.click();
  URL.revokeObjectURL(url);
  alert(`Downloaded hotel.json. To make these changes live for everyone: replace the file at hotels/${HOTEL_SLUG}/hotel.json with this one, then commit & push (or re-upload on GitHub).`);
});
document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  try{
    const text = await file.text();
    const parsed = JSON.parse(text);
    DATA = parsed;
    saveData(); render();
    alert("Backup imported into your local preview (not yet published — use Export to get an updated hotel.json when you're ready to publish).");
  }catch(err){
    alert("Could not read that file — make sure it's a backup exported from this same tool.");
  }
});

document.getElementById('resetBtn').addEventListener('click', async () => {
  const ok = confirm(
    "This discards any local preview edits for this hotel (in this browser only) and reloads the " +
    "real, published hotel.json from the server. Your published file is never affected either way. Continue?"
  );
  if(!ok) return;
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  DATA = await loadData();
  render();
  goToSlide(0);
  alert("Local preview cleared — now showing the real published hotel.json.");
});

async function init(){
  DATA = await loadData();
  render();
}
init();
