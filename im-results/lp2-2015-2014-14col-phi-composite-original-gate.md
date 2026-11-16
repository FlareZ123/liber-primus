# An authentic 2014 column route after the witnessed 2015 prime differences

**Agent5, 16 November 2026. Scoped original-cipher obstruction; no unknown plaintext or key recovered.**

## The proposed human solve path and its weak point

The independently dated 4–5 February 2015 Cicada-solver transcript specifies subtracting successive primes from the original p0–2 rune tape, imagining a preceding GP29 F, and taking differences. Its first output D has **40 adjacent equalities among 729 runes**, exactly as the original participant reported. A second historical participant operation forms E by one further difference. Both are fully reversible, yet uniform-like and not plaintext. This stage and its exact original source are established by [the existing source report](lp2-2015-prime-delta-40-doublet-source-inversion.md).

An independently earlier 2014 Cicada stage **actually used 14 columns in the order**
`[2,8,9,1,12,13,11,4,5,7,3,0,6,10]`.
Its ciphertext was written across 14-column rows, the columns were reordered, and **each resulting row** was read across to yield `GOODWORKULTIMATETRUTH...`. This is a precise original-period precedent for an authored transposition; it does **not** establish that LP2 applies the same 14-column route. [Preserved contemporary 2014 solution, “The 5 Gram Message”](https://embeddedsw.net/doc/Openpuff_for_experts_Cicada_3301_recruitment_puzzle_2014.pdf).

The source-authenticated p56 GP29 cipher supplies an actual **value-changing second-stage consumer**: `C=P±(prime−1) mod29`, with plaintext F literal and **not consuming a key**. To test the unusually concrete 2015 participant clue without inventing new keys, compose the historical D or E register, the genuine 2014 row permutation, then the genuine p56 F-transparent inverse with its initial prime2 state. The p0 image's large 13-dot mark comes **after both red title words, rune offset13**. Freeze that source boundary: retain D/E's complete 729-rune title-plus-body initial state, permute/decrypt only the subsequent **716-rune black body**, and reset the p56 second-stage clock at that mark. The original p3–7 1,145-rune visual chapter is an independent unrelated holdout with its own prime and F-clock initialization and no p0-title exclusion.

The weakest assumption is **the composition**: none of these three actual historical inputs tells a solver to chain them. Failure excludes only the exact chain, not the 2015 observation, unrelated permutations, or an as-yet-unknown key.

## Exact source inverse and necessary-symbol gate

Let the GP29 ciphertext indices of a chapter be `C[0..N−1]`; let `p[j]` be consecutive ordinary primes starting with `p[0]=2`. Fix `S[-1]=(0−2) mod29`, `S[i]=(C[i]−p[i+1]) mod29`, and `D[i]=(S[i]−S[i−1]) mod29`. The participant's extra difference is `E[0]=D[0]`, `E[i]=(D[i]−D[i−1]) mod29`. Each stage has an exact stated inverse.

The fixed 2014 transformation applies its 14-column order **to each consecutive row**, omitting nonexistent columns in the final short row. The test checks the exact original 70-character 2014 cipher to **70-character historically reported plaintext**, and inverts every row, including the original chapter's ragged terminal row.

For each subsequent original GP29 symbol, strict p56 inversion allows a nonadvancing plaintext F only when the transformed ciphertext is F; all consuming paths must decode to **non-F plaintext** and advance the prime clock. The dynamic program retains all possible consumed-key counts. Its first position with **no remaining legal F-path** is a deterministic obstruction independent of any dictionary, guessed F mask or language score.

| Original chapter / second-stage input | `C=P+φ(prime)` first impossible at | `C=P−φ(prime)` first impossible at |
| --- | ---: | ---: |
| p0–2 body, 716 GP runes, D then 14-column route | **1** | **8** |
| p0–2 body, 716 GP runes, E then 14-column route | **89** | **1** |
| p3–7 whole chapter, 1,145 GP runes, D then 14-column route | **178** | **0** |
| p3–7 whole chapter, 1,145 GP runes, E then 14-column route | **5** | **26** |

All indices are zero-based from the beginning of their **second-stage transformed body**. Every original negative occurs before the end of its chapter. Native p57 GP29 English plants of the **complete 716-/1,145-rune lengths** encode through the exact F-transparent key clock, invert the 14-column route and the 2015 prime-difference stage, then return to exactly their planted second-stage ciphertext. The *same all-legal-F-path inverse* reaches the end of every plant in both signs. Thus the original early deaths are real source-specific necessary-symbol contradictions; the positive checks are complete original-cipher round trips, rather than short artificial demonstrations.

The unaffected first-pass D p0–2 40/728 adjacent equality witness is asserted independently. D and E are full-length bijections, and no source original runes or page joins were edited. The two full original second-stage streams have IoCs **0.034511856858225574** (D body) and **0.034882994100871194** (E body); the holdout values are **0.0344138394356735** (D) and **0.03494518581854826** (E). The permutation alone leaves the IoC unchanged, as required.

**Reproduce:** [single-file Node22 CommonJS original-data + historical positive SFT](../sims/lp2_2015_prime_delta_2014col14_phi_sft.cjs), [passing original-cipher Windows job](https://github.com/FlareZ123/liber-primus/actions/runs/43873511412), in the existing [Agent5 manual workflow](../.github/workflows/agent5-red256-byteindex-manual.yml).

**Decision:** The original 2015 D/E stream followed by the literal 2014 row permutation and the authentic p56 F-transparent prime-totient cipher is **algebraically incompatible** with the untouched p0–2 original body and fails independently on p3–7, for both arithmetic signs. No unknown GP prose, secret key or destination appears. Retire this exact composite and do not tune additional 14-column orders, clock phases, keyword offsets or alternate arbitrary additions unless a separate source clue supplies them.