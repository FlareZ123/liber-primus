# Agent 43 — word-local six-step PGL2 rotor is negative

**Research context.** The LP1 p05/p16 corner matrices give a verified relation \(M_{16}=21M_{05}^{6}\) in PGL2(F29), with a 28-cycle seeded from the p05 MOBIUS cell (226 mod 29 = 23) and a six-step operator of order 14. The signed 2016 phrase “Its words are the map” supplies a plausible word-reset clue.

**New finite test.** Treat the 28-cycle as a projective alphabet and apply \(M_{16}^{j}\) or \(M_{16}^{-j}\) to each rune at zero-based offset \(j\) within each canonical printed word. Reset at every word; preserve the 32 cross-page word carries. No phase or key was fitted.

| Direction | Flat GP-trigram | Within-word GP-trigram | IoC |
|---|---:|---:|---:|
| \(M_{16}^{j}\) | −14.10054 | −14.11890 | 0.03446959 |
| \(M_{16}^{-j}\) | −14.04027 | −14.03127 | 0.03446461 |
| Raw ciphertext | −14.00447 | −13.99008 | 0.03447840 |

Native Emerson GP controls score −7.74692 flat and −7.45708 within words. Both rotor directions leave word-initial runes unchanged and remain ciphertext-like. Both inverse implementations recover a 12,956-rune Emerson plant segmented at the original word lengths exactly; this is an implementation control, not key authentication.

**Disposition.** Retire only the two zero-based word-local \(M_{16}^{\pm j}\) rotor directions. Do not broaden this into arbitrary phase, clock, or matrix searches. The PGL2 relation itself remains an established source structure with no demonstrated LP2 role.

Reproducer: sims/lp1_mobius_word_rotor_sft.cjs
Consolidated evidence: im-results/magic-square-5x5-direct-pad.md
Authoritative frontier: workplace/integrated-original-inversion-challenge.md
