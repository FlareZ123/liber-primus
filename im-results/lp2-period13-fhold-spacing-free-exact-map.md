# Period-13 F-hold without printed word boundaries (#2548)

## Decision

The source-defined p54–55 chapter was selected by the pre-existing period-13 collision relaxation (2/96 native-control windows passed, versus p23–26's 1/96). Fixed training/holdout split 208/100 runes. No observed spaces enter key inference or continuation. The best **global trigram MAP key** across every legal training F mask scores worse than all three matched shuffled controls and cannot legally decrypt its untouched continuation. Thus the spacing-free finite model fails here. This is not an all-key/all-language exclusion.

## New constructive solver

For a fixed F mask, consuming position determines phase j mod q. Each non-held ciphertext c removes shift c from its phase domain; each held zero is fixed plaintext F. The smoothed native unigram, bigram and trigram factors involve at most three consecutive cyclic key variables. Conditioning on the smallest adjacent domain pair gives an exact cyclic max-sum dynamic program for the whole key. All masks are searched under bigram score; when there are <=5 visible Fs, all masks receive exact trigram optimization, otherwise the top 16 bigram masks are optimized. Above 13 visible Fs the declared implementation declines the case. This is a bounded search across masks, not heuristic local key optimization. Toy q3 brute-force comparison agrees for both orders. For the chosen key, a forward log-sum-exp prefix filter integrates all legal latent F paths and contexts; the fixed-key suffix is evaluated from that distribution without fitting. The displayed prediction uses a MAP boundary/suffix path with exact ciphertext replay if legal.

The rune-only language model is trained on the nine solved native sections, excluding each control's entire target section. Arbitrary replacement spaces are inserted and removed; the input is unchanged. A separate post-decode lexicon segmentation dynamic program does not affect selection. Its objective is +length-2 for lexicon tokens, -2 for unknown singletons; this is illustrative, not a calibrated word posterior.

## Positive controls

| Control | Prefix F count | Masks scored by trigram | Recovered key | Prefix | Held |
|---|---:|---:|---|---:|---:|
| Authentic KOAN2, period 13 | 5 | 32/32 | 0,10,4,0,1,19,0,18,4,18,9,0,18 | 208/208 | 111/111 |
| KOAN1, seeded independent key | 7 | 16/128 | 27,14,3,21,3,26,2,17,25,20,25,20,3 | 208/208 | 100/100 |
| WELCOME, seeded independent key | 14 | Declined by cap | — | — | — |

Both recovered controls have full replay and exact predicted continuation. Their held conditional log evidence per rune is -2.45983 and -2.28010, respectively.

## Frozen original and nulls

| Tape | Optimal prefix score/rune | Best-vs-next mask optimum gap | Frozen continuation |
|---|---:|---:|---|
| p54–55 | -4.394018 | 0.795890 | Impossible at zero-based rune 233 |
| frequency-preserving shuffle 0 | -4.331310 | 6.301871 | Legal, -6.947360/rune, gibberish |
| frequency-preserving shuffle 1 | -4.312086 | 14.182506 | Legal, -5.266641/rune, gibberish |
| frequency-preserving shuffle 2 | -4.332807 | 7.020532 | Impossible at rune 216 |

All eight masks are legal in the training segment and all receive exact trigram MAP. The selected original shift vector is [20,6,8,22,9,27,27,24,12,23,26,25,19], mask 4. The 208-rune prefix segmentation contains only 17 runes in words of >=4 runes, including isolated "HEAL" and "GLINT". Its 136 inferred boundaries intersect 26 of 45 observed breaks (19.1% precision, 57.8% recall); no connected readable text. The fixed key's prefix state is unique and no legal path survives beyond 25 held runes. No runner-up is rescued by the holdout. A narrow score gap between mask optima is not a unique-key certificate, and the three nulls do not estimate a population false-positive rate.

## Reproduction

`node sims/lp2_fhold_spacing_free_sft.cjs controls` and `node sims/lp2_fhold_spacing_free_sft.cjs target`. Both executed in JS with checked-in source strings and no file changes. Solver: `sims/lp2_fhold_cyclic_ngram_map.cjs` (d067786b6cae606ce7b9ea8447196e2b9dde7a16). Driver: a2acadd43e968394e1efdaaa05431237e5064993. Exact conditional cyclic optimization is reusable; this failed native period-13 transfer does not justify arbitrary resegmentation or key rescue. No unknown plaintext or key claimed.
