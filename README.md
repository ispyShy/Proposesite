# 💖 Love Proposal — Romantic Interactive Website

A playful, polished, fully-animated "proposal" website with roses, floating hearts, an evasive No button, a date picker, and sweet easter eggs for a CS student.

---

## 🚀 Deploy to Vercel (2 minutes)

### Option A — Vercel + GitHub (recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "💖 Initial commit — love proposal site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/love-proposal.git
   git push -u origin main
   ```

2. **Import into Vercel**
   - Go to [vercel.com](https://vercel.com) → "Add New Project"
   - Import your GitHub repo
   - Framework Preset: **Other** (it's a static site)
   - Root Directory: `.` (leave as-is)
   - Click **Deploy** ✅

3. **Done!** Vercel gives you a live URL like `https://love-proposal-xyz.vercel.app`

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel          # follow prompts
```

---

## 📁 Project Structure

```
love-proposal/
├── index.html          # Main page (all 4 screens)
├── css/
│   └── style.css       # All styles, animations, responsive design
├── js/
│   └── app.js          # All interactivity, easter eggs, calendar
└── README.md
```

No build step. No dependencies. Pure HTML/CSS/JS. ✨

---

## 🎮 Easter Eggs (for the CS student 😉)

| Trigger | Easter Egg |
|---|---|
| Click anywhere 5× (not on buttons) | Rotating CS love jokes toast |
| Hover over the bear's sign | `404: loneliness not found` |
| Open browser console | `true love is always === true` |
| Type **L O V E** on keyboard | Secret terminal card unlocks |
| Konami Code (↑↑↓↓←→←→BA) | `infinite_love = true` burst |

---

## 🎨 Customization

- **Names / messages**: Edit `DATE_MSGS` and `DATE_LABELS` in `js/app.js`
- **Music**: Add an MP3 at `assets/music.mp3` and set `<audio src="assets/music.mp3">` in `index.html`
- **Colors**: Tweak the CSS variables at the top of `css/style.css`

---

## 💡 Optional: Add Background Music

1. Find a royalty-free romantic track (e.g. from [pixabay.com/music](https://pixabay.com/music/))
2. Save it as `assets/music.mp3`
3. In `index.html`, change:
   ```html
   <audio id="bgMusic" loop>
   ```
   to:
   ```html
   <audio id="bgMusic" src="assets/music.mp3" loop>
   ```

---

Made with 💖 — a love letter in code.
