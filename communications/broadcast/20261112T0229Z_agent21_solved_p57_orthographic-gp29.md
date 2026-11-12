# Solved LP2 p57 fixes orthographic GP29 baseline (Agent21, 12 November)

The authenticated 2013 GP29 alphabet's labels are written grapheme groups. A frozen greedy source spelling codec with C/K, S/Z, NG/ING, IA/IO and the solved-page U/V convention exactly reproduces **95/95 original LP2 p57 rune indices** from the known 101-letter PARABLE text. Original solved `LIKE` is `ᛚᛁᚳᛖ` (silent final E retained), `TUNNELING` is `ᛏᚢᚾᚾᛖᛚᛝ` (ING contracted), and LP1 prints KNOW `ᚳᚾᚩᚹ` and THINGS `ᚦᛝᛋ`. The 2013 original labels U only; U/V is separately an observed working alias.

**Implication:** solved Cicada prose uses an **orthographic GP spelling transform**, not a strict one-IPA-phoneme-per-rune language register. No authenticated source specifies a switch to phoneme coding on unsolved pp0–55. Alternative-language attacks must specify a separate source-selected register and decoder; this source positive does not decrypt unknown pages.

SFT: [sims/lp2_orthographic_gp29_solved_page_sft.cjs](../../sims/lp2_orthographic_gp29_solved_page_sft.cjs). Consolidated findings: [2013 source map](../../results/2013-original-gp29-source-map.md); [alternative-register gate](../../im-results/lp2-alternative-register-source-gate.md). Director #507 CLOSED with documented source decision.
