# Forma: Product Requirements (PRD)

## 1.1 Product
Forma is a web app that lets non-developer tech creatives get a professional portfolio website without writing any code. An AI model talks to the user by voice or chat, asks a few questions about them and their work, then builds the portfolio itself while the user watches it being constructed live. The user can edit everything afterward and receives one shareable link to send to anyone who wants to contact them.

## 1.2 Problem
Every creative and tech professional needs a portfolio on a URL so people can reach them. Most cannot build one because they are not developers. Hiring a developer is expensive, and website builders are still too technical and slow. Their work stays invisible.

## 1.3 Target users
Tech professionals and creatives in niches that are not web development, plus web developers who want a fast portfolio. Launch focus: Nigeria and Africa, then global.

Niches (each gets 20 templates):
UI/UX Design, Product Design, UX Research, Graphic Design, Brand Identity, Motion Design, Video Editing, 3D Art, Illustration, Photography, Data Science, Data Analysis, ML/AI Engineering, Cybersecurity, Cloud/DevOps, Mobile Development, Game Development, Technical Writing, Product Management, QA Testing, Blockchain, Embedded/IoT, AR/VR, Social Media Management, Copywriting, Web Development. Research must add any niche missing from this list.

## 1.4 Goals
- A user goes from signup to a live portfolio in under 10 minutes.
- The user never touches code or design tools.
- Every portfolio looks premium, clean and unique to its niche.
- One link per user to share.

## 1.5 Core user flow
1. Landing page, then sign up (email or Google).
2. Pick a niche, or let the AI detect it from the conversation.
3. AI interview by voice or chat. The AI asks short, adaptive questions: who they are, what they do, skills, projects, experience, contact details, tone.
4. AI builds the portfolio live. Sections assemble on screen as the AI works.
5. User reviews, then edits anything by hand or by telling the AI.
6. Publish and receive one link (name.forma.app or similar), with optional custom domain.
7. Share the link. View analytics.

## 1.6 Features
- Auth (email, Google)
- Niche picker and AI niche detection
- AI interview (voice and text)
- AI builder with live construction animation
- AI edit commands ("make my bio shorter", "add a project", "change the colors")
- Template gallery (20 per niche) with live previews
- Manual editor for every field, section order, colors, fonts
- Image and file upload (projects, profile photo, CV)
- Live preview, mobile and desktop
- One-click publish to a subdomain
- Custom domain connection
- Contact form and contact buttons on the portfolio
- Analytics (views, clicks, contact actions)
- Free and Pro plans
- Admin panel (templates, users, niches)

## 1.7 Non-goals for v1
Blogs, e-commerce, multi-page custom apps, team accounts.

## 1.8 Plans
Free: 1 portfolio, forma subdomain, Forma badge, limited AI edits per month.
Pro: custom domain, remove badge, unlimited AI edits, all templates, analytics, priority.

## 1.9 Success metrics
Signups, interview completion rate, time to first publish, published portfolios, share link visits, free to Pro conversion.

## 1.10 Risks
- Copyright: scouted portfolios are inspiration only. Never copy anyone's design, code, images or text. Templates must be original.
- AI cost: cap usage per plan, cache, stream, keep prompts tight.
- AI output quality: validate all AI output against schemas and fall back safely.
- Voice support varies by browser, so always provide a text fallback.
