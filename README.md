# Cloud-Native CV & Interactive Portfolio: Project Blueprint

## Core Objective & Strategy

The overarching goal is to create a CV website that captures recruiters' attention, stands out as highly memorable ("like nothing else they've seen that week"), and serves as a literal showcase of your abilities as a software engineer. Because you are a trans woman navigating a competitive and sometimes biased market, simply being the strongest candidate isn't enough; the site must be undeniably exceptional and authentic to ensure you are remembered.

The site needs to project four key takeaways within the first ten seconds:

1. You know exactly what you are doing.
2. You are highly creative.
3. You are warm and approachable.
4. You are someone they would genuinely enjoy working with.

---

## The Developer Persona

The website's tone and content will reflect your unique working style and personality:

* **The "Out-of-the-Box" Architect:** You are a big-picture thinker who prefers zooming out to design a flawless architecture first, ensuring the smaller pieces fit together elegantly. You approach hard problems from multiple angles by pacing and thinking deeply.
* **The Elegant Coder:** You are a perfectionist who values simplicity. Your pride comes from writing clean, elegant code—like refactoring a 2k-line prototype to pack in tons of new features while maintaining the exact same footprint.
* **The Multi-Faceted Engineer:** You break the stereotype of the antisocial coder. You are warm, highly social, and have passions for dancing, playing instruments, and writing poetry. You are a lifelong tech enthusiast who also loves discussing psychology, physics, and astronomy.
* **Work Rhythm:** Driven by ADHD, your workflow balances intense hyperfocus with necessary strategic pauses. You are an endless generator of ideas, always seeing ways to build upon and improve your work.

---

## UX & Design Philosophy

The site will not hold the viewer highlighter hostage. It will respect their time while inviting curiosity.

* **The "Inverted Pyramid" Delivery:** Like a well-written news article, the most critical information (who you are, what you do) lives at the very top. Recruiters can skim the surface and leave with a complete picture, or they can choose to dig deep into your projects, architectural decisions, and code.
* **Aesthetic Vibe:** Clean, minimalist, and harmonized with a classic 60-30-10 color rule, utilizing a 10% accent color specifically for key interactive elements like calls to action.
* **Atmosphere:** Analog and warm. It should evoke the calm feeling of being connected to nature or a peaceful bedroom, completely free of visual clutter and noise.
* **Frictionless Contact:** No clunky contact forms. A highly visible, polished `mailto:` link (with a "Copy to Clipboard" feature) allows recruiters to use their preferred enterprise email clients instantly.

---

## UI Layout & Global Navigation

* **Top-Left Logo:** A clean, professional text-based logo of your name/initials to establish an immediate, serious corporate anchor.
* **Top-Right Navigation & CTA:** A seamless, static navbar integrated directly into the hero background featuring navigation links and a prominent `mailto:` call-to-action button highlighted in your 10% accent color.
* **The Bottom-Right Portal ("Mirror to Another World"):** A static circular mask (`clip-path`) in the bottom-right corner acting as a permanent window into your interactive side. As the user scrolls, the character inside moves dynamically with spring physics, acting as a reward without ever distracting from the reading experience. Clicking the portal triggers an expanding-circle transition into the game world, where the camera pans to center the character.

---

## The "Stand-Out" Feature: The RPG Easter Egg & Phaser Engine

To contrast the clean, dark, minimalist corporate aesthetic, the site features a fully integrated retro Zelda-style pixel art experience.

* **The Concept:** A bright, green, 8-bit retro pixel art world running natively in the browser via an independent game engine.
* **The Technology (Phaser.js):** Decoupled completely from the React DOM tree to ensure zero layout thrashing or lag. It runs on a hardware-accelerated HTML5 Canvas, utilizing an optimized render loop and built-in camera controls to guarantee pristine 60 FPS performance across desktops, tablets, and mobile phones.
* **The Execution:** Entirely optional. Users can toggle back and forth seamlessly between the serious corporate CV and the interactive dungeon crawler, satisfying traditional recruiters while blowing away engineering managers who appreciate the technical implementation.

---

## Technical Architecture (The "Flex")

The site is a masterclass in modern frontend development, cloud infrastructure, and DevOps.

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend & UI** | Next.js (React), TypeScript, Tailwind CSS, shadcn/ui | Delivers a robust, lightning-fast, and accessible user interface using highly demanded industry standards. |
| **Game Engine** | Phaser.js | Powers the retro 8-bit RPG portal and interactive dungeon crawler via HTML5 Canvas with buttery-smooth camera tracking. |
| **Cloud Hosting** | AWS S3, Amazon CloudFront | Hosts the static export with a global CDN for sub-second worldwide load times and automatic HTTPS/SSL management. |
| **CI/CD Pipeline** | GitHub Actions | Automates deployment. Pushing code to the main branch automatically builds the site. |
| **Domain & Routing** | AWS Route 53, Zoho Mail (SaaS) | Manages custom DNS, MX, and TXT records to ensure 100% reliable, enterprise-grade email delivery without backend overhead. |