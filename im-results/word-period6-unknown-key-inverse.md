# Word-restarted unknown six-rune additive key with exact T-overwrite inversion

**Status: bounded original-ciphertext negative with planted positive, no LP2 plaintext/key recovered.** Agent 39, 2026-11-10.

## Why a six-rune key is a distinct test

The original unsolved LP2 ciphertext has a sparse within-word relation \`C[i]=(24-2C[i-6]) mod29\`. Previous work inverted a **five-rune** word-restarted additive key allowing arbitrary collision rewriting (see [period-five result](word-period5-unknown-key-exact-inverse.md)). This test asks whether a separate, entirely unknown **six-rune** modulo29 additive key for **every** word could explain the genuine ciphertext's 109 longest rune words.

The model permits \`X[i] = (P[i]+K[i mod 6]) mod29\` with six independent key symbols **per word**. A proposal equal to the preceding *published* cipher rune may be rewritten with probability .81, publishing an arbitrary different rune for word-local positions 0–5 or the specific \`T(C[i-6])=(24-2C[i-6]) mod29\` at positions six onward. Published cipher state continues across words. Probability .81 affects only the planted positive control; the real feasibility test admits **every** physically possible occurrence of each rewrite, irrespective of its probability.

For a proposed source rune \`P[i]\`, the observable tentative symbol must be either the current \`C[i]\` or, if the applicable rewrite allows it, the preceding published \`C[i-1]\`. Therefore each original rune permits exactly one or two values for the corresponding unknown key digit \`K[i mod6]\`. The program intersects bit masks for all positions with the same key phase, yielding an **exhaustive exact decision** for the declared key family. There is no enumeration of 29^6 possible keys, no language-model hallucination, and no fitted soft errors.

The source candidates are the canonical, approximately GP-encoded English word-frequency lexicon, one unique GP spelling per candidate sequence. Test every complete LP2 ciphertext word with ten or more runes, using the actual preceding cipher rune even across printed page wraps.

## Original ciphertext result

[Successful manual Actions run **42769423907**](https://github.com/FlareZ123/liber-primus/actions/runs/42769423907) checked all 109 original ten-or-longer words, comprising 52 of length10, 32 of length11, 18 of length12, 4 of length13, and 3 of length14:

| Word length | Checked | At least one dictionary-compatible source under any six-key/rewrite pattern |
| --- | ---: | ---: |
| 10 | 52 | 3 |
| 11 | 32 | 1 |
| 12 | 18 | 0 |
| 13 | 4 | 0 |
| 14 | 3 | 0 |
| **Total** | **109** | **4** |

There are only four source-word positions with any viable dictionary candidate. They are word indices 1167 (11-rune, candidate *madmoiselle*, frequency1), 2102 (10-rune, candidate *interested*, frequency65), 2475 (10-rune, *promenades* or *propounded*, each frequency1), and 2572 (10-rune, *latissimus*, frequency2). These are **not proposed plaintext** because their keys have no independently validated global consistency, and accidental candidate matches are expected.

A complete seeded **positive control** generated independent six-digit pad keys for all 2,896 GP-English source words matched to the manuscript's word-length sequence. It performed **351 genuine ciphertext rewrites**, including **28** inside long words. The exact algebraic inverse accepted the **true six key digits in all 2,896 words**, and recovered at least one dictionary candidate for **88/109 long words**, including **all 87 long source words present in the external dictionary**. The two remaining hits have incidental dictionary matches. This checks actual T-overwrite handling and the word-start predecessor.

Thirty independent-pad source controls had between **zero and nine** compatible long words, mean **3.33**, versus the real original's **four**. The original therefore lies inside the expected false-candidate range for unrelated pads. The only source-supported original long-word matches are chance-scale, while a genuine unknown period-six system produces roughly 88.

## Interpretation

The 109 original long rune words are incompatible with *ordinary GP-English dictionary words encrypted under independently arbitrary six-rune word-periodic additive pads*, except in four isolated, statistically unsurprising instances. This is evidence against the exact tested generator even while allowing every physically possible specified T rewrite. It does **not** refute unrelated source languages, multiple enciphering stages, variable word boundaries or independent per-character pad values.

The test is a key-independent analogue of the positive-control candidate recovery in [the known-key contextual inverse](lag6-keyed-rewrite-inversion.md); the former eliminates entire six-period hypotheses, while the latter can recover most original source runes given the correct externally recovered key. Neither currently supplies that key.

**Reproduce:** [\`sims/word_period6_exact_T_inverse.cjs\`](../sims/word_period6_exact_T_inverse.cjs), Node22; [manual CI workflow](../.github/workflows/word-period6-T-inverse.yml). Seed \`0x396291\`. Original input preserved in \`resources/lp2-transcription.txt\`, dictionary in \`resources/control/english_wordfreq_textblob.txt\`, synthetic source in the last60k Shakespeare characters with only three rare-length fallbacks. The CI artifact includes the exact four original candidate positions, all full-length tally counts, the complete 2,896-word key feasibility plant and thirty null counts.
