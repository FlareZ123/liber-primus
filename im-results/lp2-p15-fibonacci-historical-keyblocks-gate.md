# Fibonacci-word composition of the two authentic LP1 key blocks

**Agent36, 27 November 2026.** Original-input decision: the exact source-motivated concatenation of the historical 8-rune DIVINITY and 13-rune FIRFUMFERENFE blocks fails under all four frozen literal-F-clock variants. No unknown LP2 plaintext, key or continuation is recovered.

## Motivation and exact receiver

The two actual LP1 Vigenère key lengths are consecutive Fibonacci numbers; the p15 original spiral explicitly contains Fibonacci-indexed prime differences. A human can therefore notice 8 and 13 without inventing a new numeric constant. The binary Fibonacci word is a standard way to generate an expanding nonperiodic word: starting at 0, iterate 0→01 and 1→0. Replace each complete bit by a **whole** historical key block in original spelling, not a per-rune rail or word-boundary mask:

- D = [23,10,1,10,9,10,16,26].
- F = [0,10,4,0,1,19,0,18,4,18,9,0,18].

Map 0→D and 1→F or the complementary assignment; consume successive key runes in physical order, starting at the first black p15 rune (offset20). Use authentic plaintext F=0 bypass: emit 0 without advancing; otherwise emit P+sK mod29, s=+1 (historical) or −1 (direction control). No phase, key spelling, page reset, boundary or arithmetic tuning. The original source does **not** direct this particular recurrence; it is a bounded exploratory connection, distinct from [per-rune Fibonacci rail clocks](lp2-p15-fibonacci-word-two-prime-clocks.md) and [ABAAB boundary merging](lp2-abaab-word-boundary-circumference-divinity-gate.md).

Exact inverse reachability keeps every possible consuming cursor. For observed C=0 it grants both the hold and a nonzero inverse consuming choice when legal; at C≠0 only the nonzero consuming inverse is legal. At a dead set no plaintext can produce the original ciphertext under that law, irrespective of language.

## Original result

| First block | Sign | Complete original prefix before failure (of 1883) | Ordinary-consuming full IoC (diagnostic) | Ordinary held p22 IoC |
|---|---:|---:|---:|---:|
| D | + | 38 | .0346062962 | .0321785085 |
| D | − | 36 | .0344889083 | .0353493834 |
| F | + | 59 | .0344211845 | .0359365825 |
| F | − | 16 | .0345639688 | .0347621844 |

The fixed p15–21 fit has 1752 runes; p22 has 131 untouched runes. Every strict variant dies within the fit. The separate no-hold diagnostic gives near-uniform GP29 readouts; it replays all 1883 runes but gives no legible prose. Authentic direct p56 prime-minus-one replays 85/85. All 36 native-source planted cases (9 solved records × 2 assignments × 2 signs) retain the true inverse path; this is not unique blind plaintext recovery. The external first-KOAN control has the legacy 780-rune version and is used only as a plant, not a physical source-length assertion.

## Reproduction and scope

[Read-only standalone Node SFT](../sims/lp2_p15_fibonacci_historical_keyblocks_sft.cjs), executed as equivalent connected JavaScript against corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and native control blob 1b064ef6d85819b7d96adaff31a82d1ec551598f. Standalone CI not yet run. Retire the literal keys under this schedule, not every possible nonperiodic clock. No source instruction selects new block values; any constructive unknown-block receiver must be calibrated on independently encrypted native donors and freeze its selected key on p15–21 before p22. Do not treat fitting a synthetic plant as an original solution.

## Blind recovery of arbitrary 8+13 key blocks

The historical-block rejection is exact, but arbitrary 21-coordinate blocks require a constructive receiver. The two block assignments are fixed as above; the additive sign is absorbed into the unknown coordinates. Each prefix hypothesis is a literal-F hold history with a consuming cursor and 21 independent posterior distributions over 29 shifts. Uniform independent key prior. At each ciphertext zero, branch transparent hold or legal non-F consumption. Between zeros, multiply emission likelihoods per slot. Integrate each independent shift exactly conditional on the hold history, and retain the top beam histories by marginal unigram likelihood. Rerank only the top retained histories by bigram score of their coordinatewise MAP-key plaintexts. Train on native records 0,2,5,6,7,8 with 0.5 unigram pseudocount and 5 unigram-weighted bigram pseudocount; plant on concatenated records 1,3,4 truncated to 1883. Two independently seeded keys (MT19937 seeds 20261127 and 20261128); **same held-out donor tape**, not two independent prose samples. The original and plants fit exactly 1752 runes, freeze key and prefix history, and evaluate last 131.

| Beam/rerank | Native A key/held | Native B key/held | Original A fit | Original B fit |
|---|---|---|---:|---:|
| 1024/256 | 21/21, 131/131 | 21/21, 131/131 | -4.533660 | -4.550907 |
| 4096/1024 | 21/21, no path from selected history | 21/21, 131/131 | -4.515800 | -4.527217 |

The native A wider beam selected a slightly higher-scoring but incorrect prefix hold history despite recovering the exact key. This is a real limitation of hard cursor commitment. Both original selected histories have no legal suffix at either width. To avoid falsely rejecting a good key based solely on that ambiguity, final test runs an exact bigram forward recursion over **all** possible prefix (cursor, last plaintext) states with the selected key frozen. Suffix likelihood is log P(full ciphertext|key)-log P(prefix ciphertext|key), without suffix-based key selection. At width4096:

| Input | Reachable prefix state count | Held predictive log likelihood per rune | First dead position (zero-based) |
|---|---:|---:|---:|
| Native A | 7 | -2.77522589 | none |
| Native B | 5 | -2.76997878 | none |
| Original A | 3 | -4.42122732 | none |
| Original B | 4 | -infinity | 1857 |

Original A is a low-likelihood legal completion, not an exact exclusion. Original B's particular fitted key is exactly excluded, not all possible 21-coordinate keys. Original fit outputs are non-prose. No unknown plaintext or authentic key. Beam search is approximate, and its unigram ranking may prune the true history. Do not enlarge the beam or vary the schedule without independent source instruction; use the posterior receiver on a genuinely supported slot clock.

Reproduction: [C++ receiver](../sims/lp2_fib_keyblocks_blind.cpp), [source-pinned build wrapper](../sims/lp2_fib_keyblocks_blind_sft.cjs) (g++ C++17). Local C++ compiled and executed against FNV-checked source tapes; wrapper not separately run in CI. The full predictive calculation was added after the hard-cursor diagnostic identified the control failure; this is method correction, not a new source-selected hypothesis.
