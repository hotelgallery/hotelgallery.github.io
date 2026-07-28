# Hotel Gallery — V2 (JSON-driven engine)

This is Phase 1 of the blueprint from your ChatGPT conversation, built for real:
**one engine, unlimited hotels**, real photo files instead of base64, and a
JSON file per hotel instead of a separate HTML file per hotel.

## Quick answers to the 3 things you asked

**"How do I edit the homepage text (headline, contact, pricing, demo hotel)?"**
The homepage now works exactly like a hotel page: its content lives in
`data/homepage.json`, and you can edit it in the browser. Open:
```
index.html?edit=ownerkey2026
```
A pencil icon appears (top right). Click it, then click any text — headline,
subtitle, benefits, pricing, contact links, footer — to edit it directly.
There's also a **"Change Demo Hotel"** button under the phone preview (only
visible in edit mode) to switch which hotel the homepage showcases, and an
**"Edit Contact Details"** button in the contact section for phone/WhatsApp/
email. When you're happy, click **Export homepage.json** in the toolbar at
the bottom, and replace `data/homepage.json` with the downloaded file, then
commit & push — same publish workflow as hotel pages. You can still open
`index.html` in a text editor and hand-edit `data/homepage.json` directly if
you prefer that over the browser UI — both work.

**"How do I edit Akari Inn's name/contact/photos so it looks real?"**
Open `hotels/akari-inn/hotel.json` in a text editor and change the values —
`name`, `phone`, `phoneHref`, `whatsapp`, `whatsappHref`, `email`, `mapsUrl`.
Save, refresh the page (through a local server or GitHub Pages — see
"How to test" below, plain `file://` won't load it). For photos, drop real
files into `hotels/akari-inn/gallery/<category>/` and list them in that
category's `images` array in `hotel.json` — full example further down in
this file under "How to add real photos". Or just use Edit Mode in the
browser (pencil icon, `hotel.html?hotel=akari-inn&edit=ownerkey2026`) if
you'd rather not touch JSON directly.

**"How do I add a few more demo hotels — not on the homepage, just as a
URL — to learn the process?"**
Already done for you, as a working example: **Snow Peak** and **River Pine**
were added exactly the way you'll add every future hotel — copy the
`akari-inn` folder, rename it, edit its `hotel.json`. Try them now:
```
hotel.html?hotel=snowpeak
hotel.html?hotel=riverpine
```
They're deliberately **not** linked from the homepage — the homepage stays
focused on selling with one flagship demo (Akari Inn), exactly as recommended.
These two exist purely so you can see/practice the add-a-hotel workflow.
Neither has real photos yet (same placeholder gradients as a fresh hotel) —
add real photos the same way described above whenever you're ready.

## What's in this folder

```
hotel-gallery-v2/
├── index.html                ← the sales/landing page (reads data/homepage.json)
├── hotel.html                 ← the ONE engine that renders any hotel
├── data/
│   └── homepage.json          ← ALL homepage content (headline, pricing, contact...)
├── css/style.css              ← all hotel-page design/styling
├── js/
│   ├── gallery.js              ← all hotel-page behavior (carousel, gallery, edit mode)
│   └── homepage.js             ← homepage behavior (loads homepage.json, edit mode)
├── hotels/
│   ├── index.json             ← directory of all hotels (see note below)
│   ├── akari-inn/
│   │   ├── hotel.json         ← this hotel's data (name, phone, photos list...)
│   │   └── gallery/
│   │       ├── exterior/      ← put real photos here
│   │       ├── interior/
│   │       ├── rooms/
│   │       ├── bathrooms/
│   │       ├── amenities/
│   │       └── food/
│   ├── snowpeak/               ← 2nd demo hotel (same structure)
│   └── riverpine/              ← 3rd demo hotel (same structure)
└── README.md                  ← this file
```

`hotel.html` never changes between hotels. Only the `hotels/<slug>/` folder
changes. That's the "One Engine, Unlimited Hotels" idea from your blueprint.
The homepage now follows the exact same idea: `index.html` never changes —
only `data/homepage.json` does.

**About `hotels/index.json`:** this is a plain list of every hotel that
exists (slug, name, place) — think of it as a directory/reference file, not
something the homepage currently reads. The homepage intentionally does
*not* auto-list every hotel (it's a sales page focused on one flagship
demo, not a directory page) — so this file isn't wired into anything yet.
It's there for you to keep track of what exists, and it's exactly what
you'd hand to an admin panel later if you build one, without needing to
change this file's format.

## How to test it on your computer

**Important:** you cannot just double-click `hotel.html` and have it work
fully. Browsers block a local page from loading a local `.json` file for
security reasons (this is called a CORS restriction) — so `fetch()` of
`hotel.json` will silently fail and you'll see an orange warning banner
telling you sample data is showing instead.

To test it properly, run a tiny local server (one line, no install needed
if you have Python, which Macs already have):

```
cd path/to/hotel-gallery-v2
python3 -m http.server 8000
```

Then open **http://localhost:8000/index.html** (or **http://localhost:8000/hotel.html?hotel=akari-inn**)
in your browser. Now `fetch()` works properly and everything behaves exactly
like it will once published.

Once you publish this on GitHub Pages, it works correctly for everyone too —
this local-file limitation only affects testing via `file:///...`.

## How to add real photos (the production-recommended way — no browser storage limits)

This is the workflow to use for a hotel's full gallery (30, 50, 100+ photos).
The in-browser "+ Add Photo" button is fine for a quick 1-2 photo preview,
but it embeds the image as text (base64) into your browser's local storage,
which has a hard ~5-10MB limit — you'll hit "storage may be full" after just
a handful of photos. That's not a bug, it's just not what that button is
for. This is the real, scalable way:

1. Copy your hotel's photos into the matching folder, e.g.
   `hotels/akari-inn/gallery/rooms/room1.jpg`.
2. Either:
   - **In the browser (recommended):** turn on Edit Mode, go to that
     category's slide, click **"+ Register Existing Photo"**, and type just
     the filename (e.g. `room1.jpg`) — it records a tiny text reference,
     not the image itself, so there's no storage limit. Repeat for each
     photo (works fine for 50-100+ photos).
   - **Or by hand:** open `hotels/akari-inn/hotel.json` and add to that
     category's `images` list directly:
     ```json
     "rooms": {
       "key": "rooms", "label": "Rooms", "image": "",
       "images": [
         { "src": "hotels/akari-inn/gallery/rooms/room1.jpg", "cap": "Deluxe Room" },
         { "src": "hotels/akari-inn/gallery/rooms/room2.jpg", "cap": "Room with Balcony" }
       ]
     }
     ```
     **Important:** the path must start with `hotels/<slug>/gallery/...` —
     not just `gallery/...` — because `hotel.html` itself lives at the
     project root, not inside the hotel's own folder, so image paths are
     always resolved from the root. The "Register Existing Photo" button
     builds this correctly for you automatically.
   (`image` is optional — if set, it's used as that category's cover photo;
   otherwise the first photo in `images` is used automatically.)
3. Keep photos reasonably small (under ~500KB each, JPG or WebP) so pages
   load fast — this matches the "Performance" rule in your blueprint.
   This applies regardless of whether you're testing locally or the page is
   live on GitHub Pages — the storage limit is about the browser's local
   storage, not about hosting.

## Homepage comparison photos

Real photos for the "Typical OTA Listing" vs "Hotel Gallery Page" section go
in `images/homepage/` (a separate folder from any hotel's gallery, since
these belong to the sales page, not a specific hotel). Same idea as hotel
photos: turn on Edit Mode, scroll to that section, click **"+ Register
Existing Photo"**, type the filename — no browser storage used. The
"quick preview" upload button still exists for a fast one-off test, but
isn't meant for the real published version.

## Troubleshooting: "I registered a photo but it's not showing"

This is never a local-vs-live thing — if it's broken locally, it'll be
broken on GitHub Pages too, and vice versa. Check these in order:

1. **Does the URL's hotel slug exactly match the folder name?**
   `hotel.html?hotel=akari-inn` only works if the folder is literally
   `hotels/akari-inn/` — same spelling, same case, hyphens matching. If you
   renamed the folder after first creating it, double check the URL still
   matches.
2. **Does the filename you typed match the real file exactly?** Case
   matters (`Room1.webp` ≠ `room1.webp`), and so does the extension
   (`.webp` vs `.jpg`).
3. **Open DevTools and look.** Right-click the page → Inspect → **Network**
   tab → refresh the page. The broken image will show as a red/404 row —
   click it to see the exact URL it tried to load. That tells you exactly
   what's mismatched, in seconds.
4. **Is your browser showing an old local preview instead of the real
   file?** If you renamed a folder or downloaded an updated version of this
   project, your browser may still be showing edits it saved earlier under
   the old name. Click **"Reset to Published"** in the edit toolbar (see
   below) to clear that and reload the real file fresh.

## Cover photos (the welcome slide, and any category's cover)

The camera icon (top-right of any slide, in Edit Mode) now registers a real
file instead of uploading — same no-storage-limit idea as gallery photos.
For the welcome/hero slide's cover, put the photo in
`hotels/<slug>/gallery/hero/` and type its filename when prompted. For a
category's cover (optional — otherwise the first gallery photo is used
automatically), put it in that category's own gallery folder. The small
"+ Add Cover Photo" text button on the welcome slide is now the quick-preview
(base64) fallback, same trade-off as the gallery "quick preview" button.

## "My edits don't match what I expect" — use Reset to Published

Edit Mode always prioritizes whatever's saved in *this browser* over the
real published file, so you can preview changes before committing them.
This is very convenient, but it means old local edits can linger and look
confusing after you've renamed folders, changed defaults, or downloaded an
updated version of this project. If something looks stale or wrong, click
**"Reset to Published"** in the edit toolbar (both on hotel pages and the
homepage) — it discards this browser's local preview for that page and
reloads the real file fresh. Nothing published is ever affected either way;
this only clears your local browser's temporary preview data.

## How to edit in the browser instead (no JSON editing)

Open the page with the secret key, for example:
```
http://localhost:8000/hotel.html?hotel=akari-inn&edit=ownerkey2026
```
This unlocks a pencil icon (top-right) — click any text to edit it, click
"+ Add Photo" to upload a photo from your computer for instant preview.

**Read this part carefully — it's the honest bit:**
Edits made this way save to *your browser only* (not the real file), so you
can preview changes before committing to them. When you're happy, click
**Export Backup** in the edit toolbar — it downloads an updated `hotel.json`.
Replace the real file at `hotels/akari-inn/hotel.json` with that download,
then commit & push (or re-upload on GitHub) to make it live for everyone.

Photos uploaded this way are stored as base64 (embedded directly in the
data) for quick preview — that's fine for testing, but for the real
published `hotel.json`, replace those with actual photo files in the
`gallery/<category>/` folders and reference their file paths instead (see
"How to add real photos" above). Base64 photos bloat the JSON file and slow
the page down — real files with proper paths is the right way to publish.

Change `EDIT_KEY` inside `js/gallery.js` to your own secret word before you
publish, and don't share it publicly. Full explanation of what this does
and doesn't protect against is in the comment above `EDIT_KEY` in that file.

## How to add another hotel

1. Duplicate `hotels/akari-inn/` and rename the copy, e.g. `hotels/snow-paradise/`.
2. Edit that folder's `hotel.json` with the new hotel's details.
3. Add its real photos into that folder's `gallery/<category>/` folders.
4. (Optional but recommended) add a line for it in `hotels/index.json` so you
   have a record of every hotel that exists.
5. It's live at `hotel.html?hotel=snow-paradise` — no new HTML file, no code
   changes. It won't appear on the homepage automatically — the homepage is
   a sales page, not a directory (see the `hotels/index.json` note above) —
   so link to it directly, or from wherever makes sense (WhatsApp, Instagram
   bio, a proposal you send that specific hotel owner, etc).

Snow Peak and River Pine in this project are worked examples of exactly
these steps — open their `hotel.json` files to see what a freshly-copied,
not-yet-photographed hotel looks like.

## Publishing (free, forever)

Push this whole folder to a GitHub repository and turn on GitHub Pages —
that's genuinely free hosting with no time limit. The one cost that's
unavoidable anywhere is a custom domain (e.g. `hotelgallery.in`), which
costs a small yearly renewal fee no matter which registrar you use — that's
just how domain registration works, not something specific to this project.

## Honest note on the 7-volume blueprint

The document you shared is ambitious — it goes all the way to "Version 5:
Self-service platform" with hotel logins and an admin dashboard. That's real
software-company territory and needs a proper backend/database, which is a
much bigger (and not free-forever) step.

What's actually built here matches **Phase 1 → Phase 2** of that blueprint:
one reusable engine, JSON-driven data, ready for unlimited hotels, real
photo files, no per-hotel HTML duplication. That's enough to publish a
polished demo hotel and start approaching real hotel owners — which is
exactly what the blueprint itself recommends doing next, rather than
building the admin panel and hotel logins before you have paying customers.
