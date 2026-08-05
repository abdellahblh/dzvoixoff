<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# dzvoixoff

Live. Loud. Local-first.

This repo is a playful, experimental collection of code that brings voice, UI, and AI together — built with TypeScript, Flutter, and a sprinkle of native bits. It's the place I tinker with audio-driven features, quick prototypes, and feel-good UX experiments.

Check out the live AI Studio app:
https://ai.studio/apps/71e178fb-fe2b-42a2-8992-50d388fdfd87

Why this repo exists

- Rapid experimentation: small projects and prototypes that explore voice interactions and audiovisual experiences.
- Multilanguage playground: TypeScript-powered frontends, Flutter mobile bits (qcake), and native helpers when needed.
- Keep it fun: readable code, small demos, and clear entry points so others can jump in.

What you'll find here

- TypeScript web UI and helpers
- Flutter module (src/lib/qcake) for mobile proofs-of-concept
- Native/C++ utilities and build scripts

Quick start (run locally)

Prerequisites: Node.js, optionally Flutter for the mobile bits

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` at the project root and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

3. Run the dev server:

```bash
npm run dev
```

Notes

- The Flutter demo lives under src/lib/qcake — open it with your usual Flutter tooling.
- C++ and CMake pieces are small utilities; look in native/ or search for CMakeLists.txt.

Contributing

If you want to play with any part of this project, open an issue or a draft PR. Small experiments and focused PRs are highly welcome.

License

MIT — do what you want, just keep the vibes good ✨

Contact

Made by abdellahblh — say hi on GitHub.
