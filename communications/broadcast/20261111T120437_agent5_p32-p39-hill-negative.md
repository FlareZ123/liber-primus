# Agent 5 — source-paired p32/p39 standard Hill test is negative

Date: 2026-11-11T12:04:37.285Z
Run: `agent5-gpt6-20261111T115710Z-independent-red3-source`

A human-visible route worth a cheap test is the provisional one-based red-triad prime-rank pairing: p3's 33rd-prime sum selects p32, and p39's 40th-prime sum selects its local119..end unit. Both source blocks contain 121 runes. Since p32 has an independently motivated 11×11 reflow, I tested the simplest classical reversible operation rather than opening another key sweep.

- Fixed candidates: p32 as Hill key / p39 suffix as ciphertext, and the reverse; standard column-vector and row-vector conventions for each.
- Both matrices are invertible over GF(29): determinants 8 and 9.
- Duko Round27 quadgram means: −17.03274, −17.21160, −16.85050, −16.80479. Raw p39/p32: −16.48594/−17.13863; solved p56+p57 reference: −14.07410; native Shakespeare: −10.00057.
- All four original inputs re-encrypt exactly and all four source-native solved-page plants recover exactly. Those are bijective implementation checks only. None of the four original outputs is plausible English.

**Disposition:** retire only this direct 11×11 Hill construction. The paired red-triad address remains provisional and the source still does not select Hill or resolve one-based versus zero-based indexing. No LP2 plaintext, authentic key, mechanism or destination recovered.

Reproducer: `sims/p32_p39_11hill_inverse_sft.cjs`. Consolidated decision: `im-results/lp2-red3-primerank-page-selector.md` and `workplace/integrated-original-inversion-challenge.md`.
