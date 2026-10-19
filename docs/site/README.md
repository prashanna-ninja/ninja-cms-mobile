# Ninja CMS website — brief for the build agent

Give the agent this whole folder (`docs/site/`), then paste the prompt below.

| File | What |
|---|---|
| `README.md` | This prompt: stack, pages, rules, definition of done |
| `DESIGN.md` | Colours, fonts, logo, layout. The default Ninja CMS blue, with no organisation branding |
| `LANDING-PAGE.md` | Copy and layout for `/` and `/support` |
| `PRIVACY-POLICY.md` | The full text for `/privacy`, which App Store and Google Play review read |
| `assets/` | `ninja-cms-logo-white.png` (white wordmark, 838×477, transparent), `app-icon.png` (1024², the default app icon), `favicon.png` (196²) |

---

## Prompt

> Build the public website for **Ninja CMS** at **https://ninjacms.com.au**. Ninja CMS is an adviser portal for
> Australian financial services licensees and their advice practices, with an iPhone and Android app.
> The site exists mainly so App Store and Google Play review have a real **marketing page**, **support page** and
> **privacy policy**. Keep it small, calm and fast. It is not a sales site.
>
> Read every file in this folder before you start: `DESIGN.md`, `LANDING-PAGE.md`, `PRIVACY-POLICY.md`.
> They are the source of truth for copy and design. Don't invent features, prices, testimonials, customer
> names, statistics or legal promises.
>
> ### Stack
> - **Next.js**, latest **stable** version (check `npm view next dist-tags`), App Router, TypeScript, Tailwind
>   CSS. Read the docs for the installed version and don't rely on memory.
> - Fully static: every page prerendered, with no API routes, server actions, database or auth.
> - Font: **Bricolage Grotesque** through `next/font/google`.
> - Hosting: **Vercel**, with the apex domain `ninjacms.com.au` and `www` redirecting to the apex.
>   Write the DNS steps in the README; don't change DNS yourself.
>
> ### Pages
> | Route | Content | Used as |
> |---|---|---|
> | `/` | Landing page (LANDING-PAGE.md §1) | App Store **Marketing URL** |
> | `/support` | Support page (LANDING-PAGE.md §2) | App Store **Support URL** |
> | `/privacy` | Privacy policy, verbatim from PRIVACY-POLICY.md | App Store and Play **Privacy Policy URL** |
> | `/privacy#delete-account` | The "Deleting your account" section, `id="delete-account"` | Google Play **account-deletion URL** |
> | `/account-deletion` | Permanent redirect (308) to `/privacy#delete-account` | A clean link for Play, if needed |
> | 404 | A short not-found page with a link home | |
>
> ### Hard rules (the privacy policy depends on them)
> - **No analytics, tracking pixels, cookies, cookie banner, chat widgets, embedded videos, or third-party
>   scripts.** The policy says the website collects nothing, so it has to stay true. No Vercel Analytics or
>   Speed Insights either.
> - **No forms.** Contact is a `mailto:support@ninjacms.com.au` link only.
> - The support email is **support@ninjacms.com.au** everywhere. Never use any other address.
> - **No licensee or customer names or logos** (no Cobalt, Beryllium, AIAFSL, CLS, or practice names). The site
>   is the neutral Ninja CMS brand. Naming one customer makes the app look like a single company's internal
>   tool, which App Store review rejects.
> - Don't use Apple or Google store badge artwork until the app is live and the store links are known. Use the
>   plain text in LANDING-PAGE.md.
> - The privacy policy text is legal copy. Render it **word for word**: headings, lists and the providers
>   table. Fix only typography, never the meaning. If a value still says `[TO CONFIRM …]`, **stop and ask me**
>   for it. Don't invent an ABN, address or date, and don't publish with a placeholder.
>
> ### Quality
> - Mobile first, readable at 360px wide, no horizontal scroll. Light theme only.
> - Accessibility: semantic landmarks, one `h1` per page, visible focus rings, AA contrast, alt text on the logo,
>   and `prefers-reduced-motion` respected.
> - SEO and meta: a title and description per page, Open Graph image (navy plus wordmark, generated with
>   `next/og` or a static PNG), favicon and apple-touch-icon from `assets/`, `robots.txt`, `sitemap.xml`,
>   and canonical URLs on `https://ninjacms.com.au`.
> - Lighthouse at least 95 on Performance, Accessibility, Best Practices and SEO, on mobile.
>
> ### Definition of done
> 1. `npm run build` passes with no type or lint errors, and every route is static (○ in the build output).
> 2. `/`, `/support` and `/privacy` look right at 360px, 768px and 1280px. `/privacy#delete-account` scrolls to the
>    section, and `/account-deletion` redirects there.
> 3. Searching the built output finds no other email address, no `[TO CONFIRM`, and no customer names.
> 4. Write a README with: running locally, deploying to Vercel, connecting `ninjacms.com.au` (apex A or ALIAS
>    record, `www` CNAME), and **how to update the privacy policy** (edit the text, then bump the effective date).
> 5. Tell me the three URLs to paste into App Store Connect and Google Play once it's deployed.
