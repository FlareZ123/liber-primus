# GIMP Dissolve fixed pseudorandom field is not a direct page-7/23 rune pad under the tested mapping

**Agent 28, 2026-11-10. Status:** source-informed bounded negative screen with authentic English-register control. **Zero LP2 plaintext, keys, or destinations recovered.**

## Source-derived reason to test

The GIMP 2.8-series Dissolve mode, available before the 2014 Liber Primus distribution, initializes a GLib `GRand` Mersenne Twister with the hard-coded integer seed **314159265**. It stores **4,096** random 32-bit outputs as per-row seeds, and restarts the generator for each row of the composited image. The independent [SECRA image-artwork analysis](https://secra.tech/research/liber-primus-strongest-findings/) associates the dot-dissolve rendering of the *solved* LP2 last-page insect with the historical GIMP deterministic field. The GIMP algorithm is established public software behavior; the artwork identification is from that separate investigation and is not independently reproduced here.

Separately, original LP2 `24.jpg` (p7) and `40.jpg` (p23) contain the same five-dot stencil in vertically mirrored orientation ([source-derived geometry](black-dot-template-reflections.md)). These clues motivate a **specific reversible candidate**: take GIMP's pseudorandom 32-bit values `k_i`, reduce modulo29, and attempt `P_i = C_i ± (k_i mod29) mod29`; test both physical and reverse rune order on each of the two decorated unsolved pages. For candidate stream origins, use the root generator directly and GIMP's independently seeded rows 0, 7, 23, and 56. The selected row indices are obvious page/zero/solved-page candidates, not a comprehensive set of 4,096 rows.

The GLib output is checked against direct native `libglib-2.0.so` generation and NumPy's `RandomState` (MT19937): for root seed 314159265, the first ten uint32 values are

```
3721122731 618219707 807213306 3144837749 3447982176
3230631767 755972506 1398685501 3196876378 1337812403
```

GIMP's first row seed is thus 3721122731, producing `505524582, 4277517655, 1702989131, 912900261, 1432505218, ...`. The exact program asserts these sequences.

## Page-level inversion screen

Finite family: **2 original LP2 pages × 5 source streams × 65 offsets (0–64) × 2 signs × 2 directions = 1,300** tested decodes. All 208 runes on p7 and 213 on p23 are independently preserved, with GP indices 0–28 fixed by `resources/liber-primus/lp2-corpus.json`.

The score is a mean GP-rune trigram log likelihood, with a 0.2-count pseudocount, from 217,644 GP tokens of the tracked 300-kB Shakespeare reference. Higher is more language-like. As a genuine-register control, the 95 published **cleartext** runes of LP2 p57 score **−2.453946**; the first 900 reference runes after offset300 score **−2.216361**. A synthetic encryption of *those real solved runes* using the exact GIMP root output fully round-trips to original plaintext, proving the decoder direction and PRNG implementation without assuming a guessed LP2 sentence.

| GIMP source | Best p7 score | Best p23 score |
| --- | ---: | ---: |
| Root seed 314159265 stream | −4.183608 | −4.188541 |
| Dissolve row 0 | −4.218850 | −4.193859 |
| Dissolve row 7 | −4.222756 | −4.201081 |
| Dissolve row 23 | **−4.142848** | −4.223635 |
| Dissolve row 56 | −4.162373 | −4.244993 |

The **highest of all 1,300 configurations is −4.142848**, scored on p7 under row23, offset48, subtract key, forward rune order. Its transcript is unrecognizable GP text; it is markedly weaker than the authentic solved reference. Candidate maxima are selected from their corresponding 260 trials per page/source; interpreting the winning numerical score as evidence without the selection multiplicity is unwarranted.

## What is constrained

These results reject a straightforward *fixed, short-offset, uint32-mod29 additive* reuse of the historical GIMP Dissolve root or the four chosen row streams for LP2 pages7/23 in either physical reading direction under the declared GP-English score. The screen **does not** assess the full GIMP pixel field, alternative image coordinate mappings, any other of the 4,096 row seeds, nonadditive/word-aware transforms, independent hidden keys, or non-English intermediate codes. There is no recovered plaintext or candidate worth promotion to established cryptographic findings.

Executable: [`sims/gimp_dissolve_directpad.cjs`](../sims/gimp_dissolve_directpad.cjs), Node.js/CommonJS with no external packages. The script reads only tracked corpus/reference material and asserts true GLib PRNG vectors, correctly decoded genuine solved text, the planted exact reencryption, and absence of scores beyond the predeclared positive threshold.

Research lesson: independent evidence of GIMP used **for artwork** supplies a realistic source key and implementation, but does not itself establish that the **text cipher** draws from that same random field. Any future test should specify how the image raster's (x,y) field maps to rune positions and derive predictive constraints before a larger computational sweep.
