# GIMP Dissolve row-seed key tests on original LP2 pages 7 and 23

**Agents 28 and 11, November 10, 2026. Evidence status:** finite original-source direct-pad model exclusions with authentic-English and independent-author planted controls. No unknown LP2 plaintext, key or destination recovered.

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


## Complete 4,096-row original-source inversion (Agent 11, November 10)

The previous five-stream experiment left most historical row seeds unchecked. This new source-native experiment tests **all 4,096 authentic GIMP 2.8 GRand row seeds** under exactly 65 starting offsets (0–64), both additive GP29 signs, and forward/reversed rune traversal on original LP2 physical pages7 and23. That is **1,064,960 models per original page, 2,129,920 actual candidate decodes in total**. The initial root outputs agree with the GLib historical reference. The model still specifically uses full 32-bit GRand integer output reduced modulo29 rather than the source 2D raster's thresholded pixel field.

The first **104 runes of each original page** select a candidate using 29-symbol bigram negative log evidence from the independently pinned Shakespeare first300k source (217,644 GP runes; add-0.3 smoothing). The 32 best training candidates continue unchanged onto the remaining suffix, which does not enter model selection.

| Original source | Best train row, offset, sign, traversal | Train GP-bigram score | That frozen candidate heldout score | Strongest heldout among top 32 training |
| --- | --- | ---: | ---: | ---: |
| p7, 208 runes | **2191, 29, negative, reversed** | **−3.89898842** | **−4.88066377** | **−4.54842250** |
| p23, 213 runes | **59, 51, negative, forward** | **−3.92122631** | **−4.72448629** | **−4.44491006** |

The decoded original strings are unreadable. Under this *same bigram* reference, **published cleartext LP2 p57 scores −2.54208943**. These scores are not directly comparable to the older **trigram** numbers above, and ciphertext p56 should not be treated as a cleartext score.

**Authentic-language independent positive controls:** Two independent **Gibran, The Prophet** plaintext spans (outside the Shakespeare training reference) were GP encoded to exactly the original p7 and p23 lengths. The first is genuinely encrypted with hidden row277, offset31, negative sign, forward traversal; the second with hidden row3901, offset53, positive sign, reversed traversal. The same complete 1,064,960-candidate search ranks each **exact hidden row, offset, sign and direction first from its training prefix**, then reproduces **208/208 and 213/213 runes**, with exact original-length reencryption. Frozen heldout scores are **−2.72763154** and **−2.56521645**, respectively. This validates the exhaustive model search on two entirely separate authors' text registers, without supplying planted keys to the selector.

**Consequence and unresolved scope:** A fixed short-offset single GIMP row table used as an ordinary modulo29 additive GP pad does not reveal p7 or p23 plaintext, even after exhaustively eliminating the initially arbitrary selection of row seeds. This says nothing decisive about *2D* pixel-coordinate sampling, alternative starting positions, changing row indices, skip clocks, nonlinear substitutions or a different plaintext register. No authentic unknown LP2 plaintext/key recovered. A different candidate must supply a justified new source coordinate/state rule and an original-suffix prediction, rather than repeating the old row/pad family.

[Exact executable](../sims/gimp_dissolve_all_row_seed_inversion.cjs) and [successful original-source CI run 42803722412](https://github.com/FlareZ123/liber-primus/actions/runs/42803722412), including the archived raw JSON output. Existing on-demand five-dot mirror workflow was reused; no extra CI wrapper was created.

## What is constrained

The initial 1,300 cases rejected a straightforward *fixed, short-offset, uint32-mod29 additive* use of the GIMP root or four selected row streams. The independently planted and fully source-enumerated 2,129,920-case extension above rejects the same model for **all 4,096 row seeds** on pages7/23 in either physical reading direction under the declared GP-English score. Neither screen assesses the full **2D GIMP pixel field**, alternate image coordinate mappings, beyond-64 offsets, nonadditive/word-aware transforms, independent hidden keys or non-English intermediate codes. There is no recovered plaintext or candidate worth promotion to established cryptographic findings.

Executable: [`sims/gimp_dissolve_directpad.cjs`](../sims/gimp_dissolve_directpad.cjs), Node.js/CommonJS with no external packages. The script reads only tracked corpus/reference material and asserts true GLib PRNG vectors, correctly decoded genuine solved text, the planted exact reencryption, and absence of scores beyond the predeclared positive threshold.

Research lesson: independent evidence of GIMP used **for artwork** supplies a realistic source key and implementation, but does not itself establish that the **text cipher** draws from that same random field. Any future test should specify how the image raster's (x,y) field maps to rune positions and derive predictive constraints before a larger computational sweep.
