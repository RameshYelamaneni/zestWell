# zestWell

Mobile-first personal health tracking for meals, WHOOP, weight, and labs. Tracking only — it does not set a calorie deficit, diet plan, or exercise plan.

Persistent note in the app: **Tracking only — check pace and targets with your transplant team.**

## Run locally

```bash
npm install
npm run dev
```

The Vite dev server listens on **port 4867**. Open the printed local URL (typically `http://localhost:4867`).

- First visit: create a name and PIN (stored hashed on this device only).
- Scan Meal uses an OpenAI key you paste in Settings. The key is never hardcoded. Without a key, enter meals by hand.
- Example meal for testing: sweet potato chunks (~300g) + 3 boiled egg whites ≈ 370 kcal.
- Baseline data is preloaded: 86 kg on 15 Nov 2026 (BMI 28.8) and the Evolt 360 scan from that morning.
- WHOOP fields are manual. Steps are entered from the WHOOP mobile app (they do not appear on the WHOOP website). Calorie-burn is not shown.
- Export / import JSON is in Settings. The PIN and OpenAI key are not included in the export.
- iPhone: Safari → Share → Add to Home Screen.

```bash
npm run build
npm run preview
```

Preview also uses port 4867.

## Stack

React, Vite, TypeScript, Tailwind CSS, Recharts, PWA (manifest + service worker).
