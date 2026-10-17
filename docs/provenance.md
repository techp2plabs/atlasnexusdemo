# Prototype provenance notes

- Product context: Atlas Nexus has a live internal product. The owner stated it has not yet been publicly released.
- This Nuxt app is a standalone competition demo and is not connected to the internal backend. Organization and channel listing fields in `demo/seed.mjs` are a read-only snapshot of the P2P Labs workspace on October 17, 2026. Channel subscriber/view counts abbreviated as K/M in Atlas Nexus are stored as rounded values.
- Campaigns, creator topic descriptions, video rows and per-video metrics are demo fixtures. They are not live campaign records or YouTube video analytics. Fit scores in sample mode are examples only; topic fit should be reviewed against current public videos.
- Sibling FE/BE repositories remain product references. The retired legacy HTML prototype was removed after the Nuxt demo became the active prototype.
- Channel names and their organization/partner mapping in the seed reflect the cited P2P Labs organization snapshot. Creator-fit metadata and per-video titles/metrics remain synthetic fixtures.
- The homepage includes public channel thumbnails sourced by the existing Atlas Nexus organization preview; remaining prototype visuals are CSS-native.
- Gemini summaries are generated from server-owned fixture evidence only when the key is configured. The no-key local mode uses explicit sample results.
- Competition freshness and source-reuse eligibility remain unconfirmed; the prototype implementation alone does not resolve organizer rules.
