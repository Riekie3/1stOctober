# A Day Made for You

An interactive birthday website: a welcome invitation with a shy NO button, a menu of four surprises, a birthday "passport" itinerary that reveals itself through the day, a hand-opened love letter, a floating memory gallery and a list of things you love about her. The song plays throughout.

Built with React, Vite, TypeScript, Tailwind CSS, Framer Motion and Lucide icons. Fonts (Cormorant Garamond, DM Sans, Mrs Saint Delafield) are bundled locally, so nothing loads from Google.

---

## 1. Install

You need **Node.js 20 or newer**.

```bash
npm install
```

## 2. Run while editing

```bash
npm run dev
```

Open the address it prints (usually http://localhost:5173). Changes appear as soon as you save.
To try it on your phone over the same Wi-Fi, open the "Network" address it prints.

## 3. Build for the real thing

```bash
npm run build
```

The finished site is in `dist/`. To check the build locally:

```bash
npm run preview
```

**Hosting:** upload `dist/` to Netlify, Vercel, Cloudflare Pages or any static host. The site uses real page URLs (`/menu`, `/itinerary`, …), so the host has to send every path to `index.html`. `public/_redirects` (Netlify) and `public/vercel.json` (Vercel) already do this. On other hosts, enable "SPA fallback" or "rewrite all to index.html".

### GitHub Pages (how this site is published)

The site is live at **https://riekie3.github.io/1stOctober/**.

Every time you push to `main`, the workflow in `.github/workflows/deploy.yml` builds the site for the `/1stOctober/` sub-path and publishes it to the `gh-pages` branch. It's live a minute or two later. So updating it is just:

```bash
git add -A
git commit -m "Add our photos"
git push
```

Progress shows under the repository's **Actions** tab. If the page ever shows GitHub's 404, check **Settings → Pages**: the source should be **Deploy from a branch → gh-pages → / (root)**.

### Admin page — edit everything without code

Open **https://riekie3.github.io/1stOctober/admin** on your laptop.

1. **Sign in (once).** Paste a GitHub key. The sign-in page shows how to create it: a *fine-grained token* with access to only the `1stOctober` repository, with **Contents: Read and write** and **Actions: Read-only**. The key stays in that browser.
2. **Edit** in the sidebar:
   - **General:** names, date, welcome text, NO teases, menu, sealed cards and their opening time, page titles, final message, song info.
   - **Itinerary:** stops with time, icon, title, location, description, clue.
   - **Letter:** the opening line, paragraphs and sign-off.
   - **Love notes:** reasons with short lines and secret notes.
   - **Memories:** drop photos and videos (HEIC works), drag to reorder, write captions and dates, replace or remove items.
3. **Preview** opens any page in a new tab with your changes (with times like 19:31 so sealed pages open). A "Preview · not published" ribbon marks it.
4. **Publish** saves everything to GitHub in one go. The bar at the top follows the rebuild, and the site is live in about 2 minutes.

Good to know:
- **Drafts save as you type.** Close the tab and they come back next time. Nothing reaches the site until you press Publish.
- **Mistakes are caught first.** Empty names, broken times and missing captions are listed, and Publish waits until they're fixed.
- **Photos** are resized and their location data removed automatically. A photo and a clip of up to about 4 seconds with the same name (an iPhone Live Photo) become one Live Photo.
- **Videos** are uploaded as they are: keep them under about 50 MB (GitHub's hard limit is 100 MB). Use iPhone *Most Compatible* format so they play everywhere.
- **Removing** a memory also deletes its files on the next publish.
- **Conflicts are caught.** If something else changed the same content since you opened the admin page, it asks before overwriting.

Behind the scenes the content lives in `src/content/*.json`. You can still edit those by hand, and the admin page reads and writes the same files.

### It's a PWA

It can be installed like an app. On an iPhone, open the link in Safari, tap **Share → Add to Home Screen**. On Android or desktop Chrome, use **Install app** / **Add to Home screen**. Once opened, the app shell works offline. Photos are kept after she's viewed them. The song and videos need a connection.

---

## 4. Where everything lives

```
public/
  assets/
    music/    sempurna.mp3             ← the song (you add this)
    photos/   your photos              ← jpg / png / webp
    videos/   your videos              ← mp4 (webm, mov*)
src/
  config/birthday.ts                   ← names, date, song, all page wording
  data/itinerary.ts                    ← the day's plan
  data/letter.ts                       ← the love letter
  data/memories.ts                     ← which photos/videos appear
  data/loveNotes.ts                    ← "Things I Love About You"
  components/                          ← reusable pieces (music player, timeline, gallery…)
  pages/                               ← the six pages
```

You should never need to touch `components/` or `pages/` to personalise the site.

---

## 5. Customising

### Her name, your name and the date
`src/config/birthday.ts`

```ts
girlfriendName: "HER NAME",   // shown on the welcome seal, menu, passport, envelope & finale
boyfriendName: "YOUR NAME",   // signs the letter and the finale
birthdayDate: "2026-10-01",   // YYYY-MM-DD; the itinerary unlocks on this date
```

Write her name with normal capitalisation ("Aisyah", not "AISYAH"). It is written in a script font on the envelope and in the finale, and all-caps script is hard to read.

Every other line of text on the site (welcome message, the NO-button teases, menu cards, page titles, the finale) is in the same file.

### The song (Sempurna)
1. Put your legally obtained file at **`public/assets/music/sempurna.mp3`**. The name must match exactly.
2. That's it. The song fades in **as soon as the site opens**, loops forever and never restarts as she moves between pages.

How it plays:
* **Autoplay:** browsers decide whether a site may play sound before the visitor has interacted with it. Many phones and fresh browsers say no. In that case the song starts on her **first tap, click or key press anywhere** (tapping "Yes" counts), and a small "Tap anywhere to play our song" note appears by the player until then. No website can get around this rule.
* **It never stops by itself.** If something else pauses it (a phone call, locking the screen, switching apps), it resumes as soon as she's back, or at her next tap if the browser requires one.
* **Only she can pause it**, with the record button. It then stays paused on every page until she presses play again. Volume and mute are behind the sliders icon.
* While she watches a memory video, the song only gets quieter; it doesn't stop.

A different file name or format (e.g. `.m4a`) works too: change `music.src` in `config/birthday.ts`. You can also change the displayed title/artist and the starting volume there.

If the file is missing, the player shows a hint while you run `npm run dev`, and hides itself completely on the built site.

### Photos
1. Copy photos into **`public/assets/photos/`**. JPG, PNG and WEBP all work. Around 1600px on the long side is plenty, and smaller files load faster on her phone.
2. List them in **`src/data/memories.ts`**:

```ts
{ type: "image", src: "/assets/photos/first-trip.jpg", caption: "Our first trip", date: "12 Apr 2024" },
```

Delete the `placeholder-XX.svg` lines and files when you're done. (`scripts/make-placeholders.mjs` only generated them and can be deleted too.)

### Videos
1. Copy videos into **`public/assets/videos/`**. **MP4 (H.264)** plays everywhere. `.mov` only plays in Safari unless it's H.264, so convert to MP4 if in doubt.
2. Add them to the same list:

```ts
{ type: "video", src: "/assets/videos/silly-day.mp4", caption: "That silly day", poster: "/assets/photos/silly-day-cover.jpg" },
```

`poster` is optional. Without it, the first frame is used. Videos load only when they scroll near the screen. When she taps one, it opens and plays with sound, and the song quietly dips while it plays. Closing it pauses and rewinds it.

Mix photos and videos in any order. The gallery arranges itself for any number of items and any screen size.

### The itinerary
`src/data/itinerary.ts`: one entry per stop:

```ts
{
  id: 2,
  time: "10:00",                    // 24-hour time on the birthday
  title: "Aquaria KLCC",
  location: "Kuala Lumpur",
  description: "A marine adventure awaits.",
  icon: "sea",                      // car | food | coffee | activity | sea | snow | rest | evening | dinner | gift | camera
  clue: "Somewhere cool and blue.", // optional, shown while it's still locked
  alwaysVisible: false,             // true only for the first stop
},
```

* The first stop (`alwaysVisible: true`) is always visible.
* Every other stop stays sealed (blurred, with a countdown) until **10 minutes before** its time on the birthday, using her phone's clock. To change the lead time, set `unlockMinutesBefore` in `config/birthday.ts`.
* Before the birthday, everything after the first stop stays sealed. After the birthday, everything is open.
* The plan is filled in (Aquaria KLCC → Serai → Blue Ice Snow Park → Home → Back out → Dinner at Ginger). Locations for Blue Ice Snow Park, Home, Back out we go and Ginger are empty; fill them in if you'd like a location line to show.

### Sealed cards (Wish, Memories, Love)
Until **7:30 PM on 1 October**, "A Little Wish", "Our Memories" and "Why I Love You" are blurred, show a lock and a countdown, and can't be clicked. Typing their address (e.g. `/wish`) just returns to the menu. At 7:30 PM they unlock by themselves with a little sparkle, even if she's looking at the menu. "The Day Ahead" is open all day.

Change the time or which cards are sealed in `config/birthday.ts` → `menu.sealed` (`cards` and `opensAt`). To seal nothing, use `cards: []`.

This is a lock on the *experience*, not a security vault. Someone determined enough to read the site's code could still find the text, so don't put anything truly secret in it.

### The love letter
`src/data/letter.ts`. Edit `salutation`, the `paragraphs` list (one string per paragraph; `\n` makes a line break) and `closing`. Your signature comes from `boyfriendName`.

### Things I Love About You
`src/data/loveNotes.ts`. Each reason has:
* `title`: the reason
* `line`: the short line always visible
* `note`: the longer secret note she sees when she taps it

Add, remove or reorder freely. Numbering is automatic. The closing message (“Thank you for being you…”) is under `finale` in `config/birthday.ts`.

---

## 6. Testing the itinerary before the day

Add `?testTime=` to any URL to pretend it is that time on the birthday. The clock then keeps ticking from there, so you can watch unlocks happen.

```
http://localhost:5173/itinerary?testTime=09:49
```

At 09:49 the 10:00 stop is locked. About a minute later it unlocks with its reveal and the "Your next surprise has been revealed" message.

In test mode a small **developer panel** appears (bottom-left):

| Button | Does |
|---|---|
| Reset | back to the `testTime` you opened with, and replays the reveal animations |
| Jump to next event | skips to 3 seconds before the next unlock |
| Unlock all | opens every stop |
| +10 min | moves the clock forward 10 minutes |
| Cards open | skips to 5 seconds before the sealed menu cards open (7:30 PM) |
| Exit | turns test mode off |

Other options: `&testDate=2026-10-01` simulates a different date, `?dev` shows the panel with the real clock, and `?testTime=off` switches test mode off. Test mode is remembered only in that browser tab. She will never see the panel unless her link contains these parameters.

**Preview full animations:** if your computer has "reduce motion" turned on, the site shows calmer versions of its animations (on purpose, for accessibility). Add `?motion=full` to preview everything, and `?motion=auto` to go back.

---

## 7. Checks already done

* NO can't be pressed. It moves on hover, tap, click and keyboard, stays on screen, and changes a little with each try.
* YES plays the light-bloom transition to the menu.
* The song autoplays on open (or on the first tap if the browser blocks it), keeps playing across all pages, never restarts, resumes after being paused by anything other than her, and stays paused when she pauses it.
* Stops unlock exactly 10 minutes before their time, and the dev panel buttons work.
* Photo and video views open and close. Videos play with sound after a tap and pause when closed.
* The love notes open and close.
* There's no sideways scrolling on phone, tablet or desktop.
* Reduced-motion mode works, and there are no console errors.

Before you send the link, add the real song, photos and itinerary, then open the site on your own phone once.
