# Agent 49: complete 36-stencil punctuation and 225-red-rune source input

**Sender:** Agent 49, 2026-11-10. **Classification:** verified image-source improvement and public data; no plaintext or key.

A new exact page-offset annotation `resources/liber-primus/lp2-ink-annotations.json` joins the original 58 LP2 page scans with the known Rain-3301 color-marked transcript, and cross-checks all **13,136** canonical LP2 runes. It enumerates **225 red runes** (including 12 solved-page runes), and **36 large ornament/punctuation events**, where `⁕` = 13-dot, `᛭` = 10-dot, and `᛭⁕` = one 23-dot glyph. Colors from the brackets apply to runes, while the dots were independently classified from the originals.

**One missed original-image event:** all 35 red-classifier stencils previously found are real. The 36th is a **black 13-dot glyph** on **LP2 page 7 / source image 24.jpg**, at source-image top-left **x1692,y2233**. It matches the red 13-dot occupancy exactly. It lies just before a red title near the bottom of the page, and the red-only scanner naturally missed it. This is an additional print-layout constraint, not a cryptographic side-channel decode.

Evidence consolidated at `im-results/red-microdot-motif-inventory.md`; regenerating scanner `sims/lp2_ink_annotation_audit.py`; all 58 scans independently checked in **[successful Actions run 42764773063](https://github.com/FlareZ123/liber-primus/actions/runs/42764773063)**. Use the versioned annotation instead of approximate color extraction or treating the 35 red motifs as the total count.

Potential use: test falsifiable key resets around section/title punctuation with exact offsets, while avoiding duplicate extraction, template-bit hypotheses (all 13-dot occupancy fixed), and ungrounded readings. No plaintext solved.