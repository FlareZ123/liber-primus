# Solved p57 word exteriors as a 19-rune key candidate for original p55

**15 November 2026, Agent 46. Intermediate source-constrained negative.** No unknown LP2 plaintext, authentic cryptographic key, cipher mechanism or continuation was recovered. The original-cipher test and its matched familywise controls are reproducible in [the standalone CommonJS SFT](../sims/lp2_p57_wordedge19_p55_source_sft.cjs), validated on the original GitHub repository in [manual Node22 run 43660890126](https://github.com/FlareZ123/liber-primus/actions/runs/43660890126).

## Why this human-readable clue permits a finite test

The independently solved final LP2 physical page **p57** has **95 original GP29 runes** in **20 visible words**, starting with the 7-rune title **PARABLE**. Its **19 poem-body words** refer to shedding circumferences. If a reader removes exactly one boundary rune from **each body word**, leaving the title unchanged, the surviving body-plus-title text has **95 − 19 = 76 runes**, equal to the exact length of adjacent **unsolved physical p55**. Equivalently, p55 has **76 = 4 × 19** runes, allowing exactly four periods of a 19-symbol key constructed from either removed body-word edge.

This is an exact **source-text length relation**, distinct from the earlier three non-dropcap-red-passage 14+11+51=76 candidate. The original poem does not literally instruct solvers to remove just one rather than both edges, to preserve the PARABLE heading, to use the removed exteriors as a key, or to transfer that key backward to p55. Those choices remain hypotheses. The test deliberately requires the source-authentic p55 stream including its first carried rune from p54 and does not alter the printed original ciphertext.

There are just two candidate 19-symbol keys, in p57 visible poem order: first rune of each body word, or final rune of each body word. Test each as a repeated GP29 additive key with both signs, either printed or reversed key order, and two natural key clock origins: p55 physical rune 0 or the first complete printed word following the carried rune (clock offset 18 mod19). This defines **16** predeclared source-geometry variants. There is no secret phase search, adjustable word selection or fitted plaintext.

## Exact original-input result

| Original and candidate readout | GP29 index of coincidence |
| --- | ---: |
| Unmodified p55 ciphertext (76 runes) | 0.0378947368 |
| Best of the 16 source-based decoders: **subtract p57 body-word last runes, printed order, clock zero** | **0.0424561404** |
| Independently clear p57, with one last rune removed from each body word and heading retained (76 runes) | 0.0564912281 |
| Independently clear p57, with one first rune removed from each body word and heading retained (76 runes) | 0.0754385965 |

The highest-scoring candidate begins `OWSERYEAAEONGHYHHWOEUEATEOOEOXIJA...` in canonical GP transliteration. It supplies no grammatical plaintext or recognized source instruction; coincidence alone is insufficient at just 76 symbols. All 16 inverses round-trip the **76/76 original ciphertext glyphs exactly**, a required operation check that is not itself evidence of the correct cipher. A separate source-native plant encrypts the real 76-rune solved p57 boundary-trimmed sequence using the proposed genuine poem-word key and recovers all 76 symbols exactly.

A matched wrong-source-order test preserves the *complete original 19 body-word inventory*, each word's length and both its initial and final glyphs, but uniformly shuffles whole p57 body words. Each of **50,000** fixed-seed trials (`0x33015719`) re-evaluates the **same complete 16-model family** on the unchanged original p55 ciphertext, taking its highest IoC. **24,037** wrong-order families equal or exceed the original source-order score, producing a plus-one upper tail **24,038/50,001 = 0.48075038**. The wrong-order *mean best-family IoC* is **0.04249829**, indistinguishable from the real source-order 0.04245614.

## Decision and scope

The p57 **19 words / 76 surviving glyphs / four periods** relation deserves preservation as a potential human-visible bridge between the final solved poem and final unknown page. However the most direct, reversible use of those exteriors as a 19-period GP29 key is rejected by the actual output and a source-matched familywise null. The original manuscript supplies no independent choice of the one-edge construction or Vigenère addition. Further phase, rotation, substitution or PRNG variants would be unfounded without a new author-visible operation or withheld unknown-page prediction.

Retire this **specific 16-variant 19-edge-key GP29 additive decoder**, retain the exact source-length observation as conditional, and do not use it to promote a p55 decryption or reopen waiting Director Issue #41. The wider Liber Primus solution status in [results/README.md](../results/README.md) remains unchanged.
