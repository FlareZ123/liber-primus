# Agent27 predeclared original floral 3,299-runic primitive-root receiver

**Date:** 2026-11-22 22:50 UTC. **Status:** original-source hypothesis frozen before inspecting decoded language. Unverified as an authored mechanism.

## Distinct observed source inputs

1. The original page-15 numeric square has the **red integer 3299** at its spiral center. The same source puzzle identifier is **3301**. Their difference is **2**.
2. The original floral section pp40–53 has **3008 GP29 runes** and a **red introductory eight-rune heading** on p40. The final floral section pp54–55 has **308 GP29 runes** and a **red introductory nine-rune heading** on p54. Removing just these two introductory headings gives **3000+299=3299** runes, including the original p53 red51 runes as chapter body. The two preserved subregisters are joined in natural page/rune order. Their original boundary is at register offset3000; printed word breaks are read only for outcome validation. Physical p50 has no GP29 runes and is not inserted.
3. The two floral headings have high-first GF29 polynomial value zero at original 3301 mod29=24, a prior documented relation, but this receiver **does not use fitted heading coefficients as a key**.
4. The integer **3299 is prime**, **2 is a primitive root mod3299**, so doubling visits all 3298 nonzero indices once. This supplies one *mathematically complete* index schedule. The native GP29 alphabet and source integers fully fix the field and coefficient.

## Frozen one-shot inverse

Let `C[0..3298]` be the concatenated **unaltered original** GP29 indices after the p40 first8 and p54 first9. Test the single linear circular multiplexer

`C_i = P_i + 2 P_(2*i mod3299) mod29`

for all 3299 positions, with natural original 0-based indexed order, no skips, no key, no fitted symbols and no reset at p50. The coefficient2 is fixed as 3301−3299. For index0, `P0 = 10*C0 mod29` because 3 inverse =10. On the nonzero length3298 orbit, the inverse is unique since `(-2)^3298=5 mod29`, hence `1−(-2)^3298 =25` is invertible with inverse7 mod29. Compute the exact full inverse via circular recurrence and verify every one of 3299 original runes by forward replay.

No variant of signs/coefficients/phases is admitted in this test. A separate positive control encrypts a repetition of authentic solved-p57 GP rune sequence to length3299, decodes it, and verifies each rune exactly. Outcome metric is plaintext IoC and whether the full original 3299 GP runes contain a ≥200 coherent contiguous native-GP run with correctly carried text across original physical pages. Native whole-register IoC in authentic solved-GP controls ~.06; original ciphertext baseline ~.0345. Exact forward replay alone cannot demonstrate decipherment.

## Interpretation guard

This is a genuinely source-constrained and *fully reversible* operation with independently specified receiver length and full-cycle index map. The original manuscript does **not explicitly state** that one should merge these floral contents, multiply indices by2, or apply the displayed linear mixer. The 3299 length relation was identified after substantial LP2 source research and is subject to selection bias. A failed output retires only the frozen rule. No further tunable 3299 circulant or phase sweeps follow absent a real author-visible opcode.
