# PARABLE-derived 2013 MT19937 seed with collision-conditioned key rejection

**Classification (Agent 8, 11 November 2026): completed original-ciphertext negative within a source-fixed 16-model family. No unknown LP2 plaintext, original key, cipher rule, or final destination recovered.** This is an independently executed combination of a historical source seed and a collision-conditioned key clock, with an exact planted positive.

## Human-solver hypothesis

The 2013 Cicada `761.MP3` ID3 value **1,595,277,641** is exactly **1,259 × 1,031 × 1,229**, the three GP-prime sums of the solved LP2 *PARABLE*. The numerical connection motivates treating this independently specified value as a direct PRNG seed. The original LP2 ciphertext also suppresses immediate same-rune repetitions (86 within-page doubles in 12,901 eligible pairs); one motivated attempt to reconcile uniform source-random keys with this observation is to *consume another key draw* when the tentative ciphertext would repeat the previous published rune.

Previous source-seeded CPython MT studies tested the 28-output predecessor-step / EA-transparent inverse rather than this GP29 additive plus rejected-draw construction; previous skip-Viterbi work used the printed numeric grid, source-modular-squaring pads, and historical OpenPuff seeds rather than this particular source-seeded MT composite. No claim is made that Cicada actually implemented Python or PHP, or that the observed repeat deficit is known to result from key redraw.

## Exact frozen family

For each of eight original manuscript text sections, restart MT19937 at integer seed **1595277641**, consume a new reduced digit `K_j∈[0,28]` per rune, and compute `tentative=(P_i + sign*K_j) mod29`. If `tentative` equals the preceding *actually published* ciphertext rune, the encoder may discard that draw and use exactly one next draw for the same plaintext symbol; otherwise it must publish the tentative rune. One rejection per position is permitted. Every inferred rejection has the preceding-ciphertext equality checked before it can be accepted. Source fixed settings:

- Historical runtime emulation: CPython 2.7 `Random` MT or PHP 5.6 legacy `mt_rand`, using checked-in independently tested generators.
- Four byte-to-GP29 reductions: 31-bit word modulo 29; scaled 31-bit word to 0–28; low eight bits modulo29; integer 0–28 bounded draw (Python rejection-sampled 5 bits or PHP's historical bounded RNG).
- Both additive signs, producing **2 × 4 × 2 = 16 configurations**.
- Eight section starts from original LP2's full lengths **[729,1145,1738,1894,1021,1433,1680,3316]**. Score only the **first 400 original runes of each section**, preserving the remaining unknown runes; the first four sections select the best model and the last four score it without refitting.

The source data are the entire `resources/liber-primus/lp2-corpus.json` original rune sequence (12,956 unsolved runes) and an independent GP-English trigram language model trained on the early portion of pinned `resources/control/shakespeare_first300k.txt`. The exact Viterbi infers any admissible one-draw skips, with a 3.5-nat penalty per skip. An independent forward-path reachability check, without relying on the Viterbi traceback, verifies each decoded original section *can reproduce every original GP ciphertext glyph* under the inferred key and collision-only policy. Re-encipherability alone is a model-consistency property, not proof of authentic plaintext.

## Native-plaintext planted positive

An independent last-section Shakespeare source sample was GP-encoded and split into eight 400-rune sections, then encrypted with **CPython 2.7 MT, bounded 0–28 reduction, positive sign**, the same public audio-derived seed, and 81%-probability collision rejection. The planted encoder actually discarded **[10,16,14,11,5,10,6,15]** draws. The blind 16-model scan selected the true generator, reduction and sign **rank #1** on the first four sections, with **3,200/3,200 original GP runes recovered** across all eight. Mean language scores were **−2.477526 nats/rune** train and **−2.471578** heldout. This demonstrates the inverse has the power to recover a planted source-true message, even with unknown rejected draws.

## Executed original LP2 result

**Train-selected original model:** PHP 5.6 MT, 31-bit word modulo29, positive sign. Mean language logscore **−5.710331** on the first four original sections; **−5.835222** on four untouched original sections. The best decoder's original skip counts for each 400-rune section were **[8,9,2,0,5,10,8,10]**. The fifth-section prediction opens `UTMSEEAOEWSEOXINAERUTOEUAEMEAFOECUISPEEAFDGUXGEMTSHLDFOERWWRIDWYSEOJYXATWRYLEDLAN` in canonical GP transliteration, with no coherent known message. Scores remain radically below the genuine planted same-model reference.

| Original model selected by first four sections | Train logscore/rune | Independent heldout logscore/rune |
| --- | ---: | ---: |
| PHP 5.6, 31-bit word modulo29, sign + | −5.710331 | **−5.835222** |
| Python 2.7, rejection-sampled bounded GP29, sign + | −5.757557 | −5.852695 |
| PHP 5.6, low byte modulo29, sign + | −5.774852 | −5.715803 |

The second/third rows are shown for context; their heldout values were **not** selected or refitted as separate winners. Four nearby arbitrary seeds `1595277642` through `1595277645` were each refitted over the same 16 models. Their train/heldout pairs respectively were **(−5.702402, −5.871645), (−5.750221, −5.859813), (−5.732400, −5.853557), (−5.676075, −5.853062)**. Source-seed results are not convincingly separated from these comparison seeds, and no readable native-GP text is reconstructed.

## Decisive scope and reproducibility

This retires precisely **direct integer-seeded CPython2/PHP5 GP29 additive source-key streams with at most one collision-only discarded MT draw per rune**, under the declared section resets, reductions, model and 400-rune section prefixes. This does **not** test password-based KDFs, other RNGs, an encrypted interstage, non-GP plaintext, changed section-clock phases, repeated rejection until success, unknown nonce/IVs, or novel stateful output transducers. There is no reason to enlarge a source-unconstrained MT seed brute force based on these data.

- [Reproducer](../sims/instar2013_mt_collision_skip_sft.cjs): Node.js 22 CommonJS; all original inputs checked in and assertions executable, no external fetch.
- [Successful independent Windows GitHub Actions run 42957411860](https://github.com/FlareZ123/liber-primus/actions/runs/42957411860); manual-only [workflow](../.github/workflows/instar2013-mt-collision-skip-manual.yml). Original model scores, all control assertions, and exact recipher are printed in that run.
