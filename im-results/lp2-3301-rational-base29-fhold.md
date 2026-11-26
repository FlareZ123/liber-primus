# Rational fraction receivers: GP29 clock and 256-cell numeric panel

**Agent30, 26 November 2026. No recovered unknown plaintext or authenticated key.**

The signed 2013 BASE29 protocol and the author's 3301 prime identifier (also the anchor of the solved p15 numerical spiral) motivate one compact historical-operation hypothesis: use successive base-29 fractional digits of a rational number with denominator 3301 as the GP29 additive key. This is an analyst-selected combination. There is no first-party instruction selecting division or the denominator as a key-stream operand. The previous [Fibonacci-limit fractional base29 test](lp2-p15-phi-fraction-base29-key-gate.md) uses an irrational constant and is a distinct receiver. The present experiment searches the whole finite rational-state domain instead of a finite prefix of that irrational stream.

## Exact inverse

For initial numerator/remainder r in 1..3300, let d=floor(29r/3301), r' = 29r mod 3301. For sign s in {+1,-1}, plaintext F (index 0) emits 0 and holds r; any other plaintext rune emits (P+s*d) mod29 and advances to r'. This is the authentic native F-hold convention with a conjectural key generator. At observed c=0 retain the literal hold; additionally retain the consuming branch whenever (c-s*d) mod29 is nonzero. At nonzero c only that consuming branch can exist. The gate retains the complete reachable remainder set per initial seed, without scoring, pruning or printed-word assumptions. All 3300 states partition into six disjoint cycles of length 550, with smallest representatives 1,2,3,4,6,8; thus all phases of every nonzero rational numerator are included. Zero numerator is the trivial identity and is outside the nonzero model.

## Calibration

The unchanged p56 ciphertext replays exactly from the source-native 85-rune plaintext under the actual successive prime-minus-one key, with 84 consuming shifts. For three distinct source-native synthetic rational-stream controls, with seeds and signs hidden from the receiver, the exact gate enumerates all initial states and both signs on the first 67%. A smoothed rune bigram model trained only on the other six solved sections (excluding all three control texts) ranks legal paths. The highest-scoring training key/sign and end state are frozen before decoding the suffix.

| Control | Seed/sign recovered | Training correct | Withheld correct |
|---|---|---:|---:|
| KOAN1 | 3299/+ | 522/522 | 258/258 |
| WELCOME | 463/− | 345/345 | 168/170 |
| LOSS OF DIVINITY | 1033/+ | 505/505 | 250/250 |

All three re-encrypt exactly. Held-out errors illustrate the residual F ambiguity even when the state is correct. This is calibration of this receiver, not independent evidence that the original author used the key generator.

## Original ciphertext

Allow each chapter to start at any independent nonzero remainder and either sign. Continuous across physical pages within each tested range; no punctuation consumption or latent word segmentation restrictions. The p0, p15 and p54 starts exclude the indicated opening red material. Other chapters begin at offset zero.

| Physical pages | First-page offset | Runes | Complete seeds + / − | Longest failed legal prefix + / − |
|---|---:|---:|---:|---:|
| p0–2 | 13 | 716 | 0 / 0 | 540 / 702 |
| p3–7 | 0 | 1145 | 0 / 0 | 629 / 591 |
| p8–14 | 0 | 1729 | 0 / 0 | 585 / 428 |
| p15–22 | 20 | 1883 | 0 / 0 | 413 / 554 |
| p23–26 | 0 | 1021 | 0 / 0 | 812 / 642 |
| p27–32 | 0 | 1433 | 0 / 0 | 644 / 537 |
| p33–39 | 0 | 1680 | 0 / 0 | 528 / 363 |
| p40–53 | 0 | 3008 | 0 / 0 | 628 / 648 |
| p54–55 | 9 | 299 | 4 / 2 | 278 / 281 |

The first eight ranges have no legal path for any sign or seed, an exact language-independent rejection of this continuous chapter clock. Terminal p54–55 leaves seeds 17,37,512,1814 (+) and 1138,2375 (−). The full-tape Viterbi readouts for all six are in the raw output; all re-encrypt but none is coherent. Full-tape best scores are about −3.749 (+) and −3.711 (−) nats/rune, versus control continuation scores −2.844, −2.795 and −2.833. The score is diagnostic only.

A separate frozen physical split preserves p54's ten-rune incoming-to-p55 carry prefix in the 223 training runes and withholds all 76 physical p55 runes. The best + training state 172 cannot continue through p55. The best − state 2375 continues and replays, but its p55 readout is incoherent at −3.686 nats/rune. Finally all nine native reference sections contain no EO or OE glyphs; adding that **conditional GP27 register restriction** leaves 0/3300 terminal starts per sign, with longest prefixes 94 and 107. The unrestricted GP29 terminal survivors are not mathematically excluded by that conditional result.

## Independent numeric-panel rational reconstruction

The original p49–51 panel has 256 printed two-character tokens whose decoded values fit the byte alphabet under conventional base60 and the drop-f base59 alternative. A distinct possible generator is ordinary base256 fractional long division of one rational number. If true, an exact small denominator could be recovered directly from the printed byte prefix and tested on the remainder, supplying a concrete external operand without guessing numerator or denominator. Neither the original panel nor BASE29 authenticates this interpretation.

Freeze 129 bytes for inference and 127 for prediction; allow all denominators (1\le q\le 2^{512}), including non-prime q and terminating expansions. If the first 129 bytes form integer N and D=256^129, the rational p/q must lie in the half-open interval [N/D,(N+1)/D). Its distance from the midpoint (2N+1)/(2D) is at most 1/(2D), strictly less than 1/(2q²) in this denominator domain. Legendre's continued-fraction theorem therefore guarantees that every reduced candidate is a convergent of that midpoint. Enumerate those convergents with exact BigInt arithmetic, test interval membership by cross-multiplication, then predict the 127 unseen bytes by integer long division. There is at most one admissible reduced fraction per read order, since distinct fractions with denominators at most 2^512 differ by at least 2^-1024, larger than the interval width 2^-1032.

Four synthetic fractions, including 3299/3301, 1/2^511, a nonterminating reduced 512-bit denominator and zero, recover exactly and predict 508/508 withheld bytes. Original source: both radices, eight standard rectangular row/column traversal directions (independent forward/reverse axes), 16 fixed readouts total. **No rational candidate survives the 129-byte inference interval in any readout.** The remaining 127 cells were not used to fit or select a denominator. This excludes every literal constant-rational base256 digit generator with q≤2^512 in these fixed readings, without brute-forcing primes or assuming linguistic content. It does not exclude large denominators, nonlinear state or keyed transformations of the table. No evidence warrants multiplying arbitrary transforms.

[Exact panel SFT](../sims/lp2_grid_rational_reconstruction_sft.cjs) · [raw output](lp2-grid-rational-reconstruction-output.json) · canonical token grid blob 2550eae357442912220e05dc51147523a61dd75a. Executed connected JS core; wrapper not separately invoked.

**Decision:** retire direct base-29 fractional-digit clocks with denominator 3301, nonzero numerator, both signs, native F hold, and this continuous framing. No justification for tuning arbitrary denominators, radix, or post-selection offsets. Reset-per-page, different arithmetic consumers, and unrestricted GP29 terminal paths are outside the exact all-state exclusions. No original ciphertext was used for training the bigram model; this is not a fresh manuscript-wide blind test because the project's original pages are already exposed.

## Reproduce

[Read-only CommonJS SFT](../sims/lp2_3301_rational_base29_fhold_sft.cjs), [complete output](lp2-3301-rational-base29-fhold-output.json). Source blobs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native controls 1b064ef6d85819b7d96adaff31a82d1ec551598f. The exact JS core was executed in the connected runtime on the repository inputs; the Node file wrapper was not separately run and no CI run is claimed.
