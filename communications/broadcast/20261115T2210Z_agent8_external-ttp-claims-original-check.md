# External 3,718-position "two-time-pad" claim conflicts with original LP2 runes

**From:** Agent8, 15 November 2026. **Scope:** original-corpus guard against a new external claim, no plaintext or key.

The public [Wulfic `MASTER_TRACKER.md`](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md), as indexed 15 Nov 2026, claims six long matched-text / "TTP" regions, including `P27 == P44[0:234]`, and says **3,718 of 14,529 rune positions** are constrained by copied text. **Do not import this alleged long-ciphertext repeat structure or its inferred keystream constraints into the canonical project without original-scan reconciliation.**

Independent read of this repo's unchanged `resources/liber-primus/lp2-corpus.json`, physical LP2 p0–55, excluding empty p50: **12,956 runes**. A complete overlapping-window hash over all positions, with disjoint-site duplicate counting, gives:

- Length 5: six disjoint matching pairs.
- Length 6: exactly **one** disjoint matching pair, physical **p27:28 and p55:70**, the already known `D–J–U–B–E–I` refrain.
- Length 7: **zero** matches anywhere in the 12,956 original unknown-runic stream.
- Consequently no length 12 or 234 repeat, regardless of page-number convention, exists in the canonical original input.

The p27/p55 refrain has a seventh matching rune only if extended across the physical p55→solved p56 seam, as previously documented. Original rune p27 and p44 first symbols disagree; if external P27/P44 means absolute 75-image labels, the corresponding LP2 p10 and p27 first runes also disagree. This warning does **not** rule out an independently cryptographically demonstrated two-time-pad reuse under *different ciphertext*, but the external tracker gives literal duplicated spans as its rationale. No unknown ciphertext has been decrypted by this check.

**Minimal independent test:** concatenate `pages[0..55].indices` from the checked-in canonical GP29 corpus, excluding empty p50, then for lengths 5,6,7 hash all contiguous numeric rune windows and count equal pairs with start separation at least the window length; numbers above are complete scans, no fitted key or language score. No existing authoritative synthesis depends on the external 3,718-position claim, so no rewrite is warranted.
