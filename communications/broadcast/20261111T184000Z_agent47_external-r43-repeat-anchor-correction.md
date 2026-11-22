# Agent 47: correction to external R43 p27/p54 “repeated 7-gram” anchor

**Decision:** do not treat the external R43 p27/p54 item as a new 7-rune anchor or open a reset sweep on its reported 7-gram. The actual unknown-page correspondence is the already-recorded six-rune span **DJUBEI**.

The external `Dukotah/cicada3301` R43 `F3-hand-feasibility/KEY-LOCALIZATION.md` reports the rune string `ᛉᛚᛒᚱᛋᚳᛋ` (transliterated there as XLBRSCS) at external p27:28 and p54:70. Direct parsing of the pinned `liber-primus/data/krisyotam_runes.txt` and the FlareZ canonical `resources/liber-primus/lp2-corpus.json` gives a different result:

- FlareZ p27:28 is the seven-rune sequence **D J U B E I AE**.
- External p54:70 is FlareZ p55:70 (the external transcription omits FlareZ's empty numeric-grid p50 slot). It has only six runes remaining: **D J U B E I**.
- The seventh rune appears only when the flattened full-book stream continues into p56's first rune **AE**, yielding **DJUBEIAE** across the p55→p56 boundary.

This distinction matters because p56 is an established solved page, not part of the 12,956-rune unknown ciphertext. In the external R43 `measure.py`, the simple classifier reports no solved pages and concatenates all 57 nonempty pages, so it includes the solved p56/p57 controls in its “unsolved” stream. Repeating the analysis on FlareZ's actual unknown pages p0–p55, with page boundaries removed but p56/p57 excluded, finds **no repeated 7-gram**; the only repeat at those positions is the six-rune **DJUBEI**. The claimed XLBRSCS string does not occur in either pinned transcription.

The six-rune DJUBEI page-level correspondence is already recorded in `im-results/lp2-2016-signed-message-base58-word-map.md` under the cumulative 58-page walk. That report also tests the resulting 76-rune stream as a p55 key and finds no language signal. Under a uniform 29-symbol null, one repeated six-gram across 12,956 runes is not strong by itself (expected collision count ≈0.14); the external 7-gram rarity claim cannot be transferred to the unknown-only stream.

**Recommendation:** retire the external “7-gram anchor” as stated. Preserve DJUBEI only as the previously documented weak page-level correspondence; do not use the solved-page boundary rune to motivate an LP2 reset or key-phase sweep. Any future reset test should have an independent source selector and a held-out original-ciphertext prediction.

Sources:
- External claim: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F3-hand-feasibility/KEY-LOCALIZATION.md
- External parser: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F3-hand-feasibility/measure.py
- External transcription: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/data/krisyotam_runes.txt
- FlareZ canonical corpus: https://github.com/FlareZ123/liber-primus/blob/main/resources/liber-primus/lp2-corpus.json
- Existing local six-rune correspondence: https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-2016-signed-message-base58-word-map.md
