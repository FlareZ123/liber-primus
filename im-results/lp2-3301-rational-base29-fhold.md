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


## Predecessor-excluding differential receiver (Agent30, 26 November, draw1)

This distinct receiver combines the same historical BASE29/3301 conjecture with the original 86 adjacent equalities, rather than adding the digits directly to independent GP29 symbols. It asks whether rational long-division digits are a key in a 28-way nonrepeat representation. No source independently selects this combination or reserves EA for repeats; it is an exploratory finite inverse, not an authenticated mechanism.

Use one initial ciphertext rune as public IV per tested chapter. At each next position take `delta=(C_i-C_(i-1)) mod29`. If delta=0 decode GP29 index28 (EA); otherwise rank delta by either delta−1 or its discrete log to primitive root15, and subtract sign×(floor(29r/3301) mod28), modulo28. Advance remainder r→29r mod3301 on all events or only nonrepeat events. All 3,300 nonzero states, 2 ranks, 2 signs and 2 clock policies, 26,400 tuples per range, are exact. Encode by adding the shift and reversing the rank operation. No separator/word constraint. All nine chapters include their red material; the whole-tape experiment begins with p0's first rune as IV. No arbitrary denominator tuning.

A model trained on six native solved sections excluding WELCOME/KOAN1/LOSS scores the nonmarker ranks by smoothed unigram log likelihood relative to uniform28. Fit 67% of three distinct native source plants, freeze *all* tied maximum candidates, and decode the rest without refitting.

| Native plant | Training correct | First fit-tie candidate withheld | All-fit-ties consensus correct / withheld | Distinct withheld tapes | True tape in fit tie |
|---|---:|---:|---:|---:|---:|
| 0_welcome | 345/345 | 170/170 | 170/170 | 1 | true |
| 0_koan_1 | 522/522 | 243/258 | 243/258 | 2 | true |
| 0_loss_of_divinity | 505/505 | 250/250 | 250/250 | 1 | true |

There is an exact identifiability symmetry: r and 3301−r advance as complements; their BASE29 digits sum to 28 because 29r/3301 is not integral. Modulo28 the two projected digits are additive inverses. Simultaneously flipping sign gives identical plaintext for every ciphertext. KOAN1 has no EA marker in its fit prefix, so all-event and nonrepeat clocks are indistinguishable there; two distinct suffixes are possible. The true suffix is present, but choosing it from the reference would leak held-out data. First fit-tie point predictions recover 2,035/2,050 total source runes. No claim of unique key recovery.

The strongest original result grants independent chapter initial states, receiver choices and even arbitrary fixed per-chapter permutations of the 28 nonmarker symbols. Their two most common decoded ranks can attain no more than:

| Physical pages | Nonmarkers | Repeat markers | Maximum top-two concentration | Best fixed-label unigram log ratio/rune |
|---|---:|---:|---:|---:|
| 0–2 | 724 | 4 | 12.293% | -0.457149 |
| 3–7 | 1138 | 6 | 11.248% | -0.502635 |
| 8–14 | 1719 | 9 | 10.471% | -0.524555 |
| 15–22 | 1892 | 10 | 10.307% | -0.529234 |
| 23–26 | 1009 | 11 | 11.893% | -0.508766 |
| 27–32 | 1419 | 13 | 10.782% | -0.504859 |
| 33–39 | 1667 | 12 | 10.498% | -0.536432 |
| 40–53 | 2989 | 18 | 9.936% | -0.561682 |
| 54–55 | 304 | 3 | 15.132% | -0.377189 |

The minimum top-two fraction in the nine full native reference sections (EA excluded) is 18.065%. This is a finite-reference comparison, not an exact universal bound for all prose or matched-length windows. The exact maximum is invariant under a fixed alphabet relabeling; dynamic substitution escapes it. The full continuous fit p0–39 selects seed 2725/log15/nonrepeat/+ and its exact complement 576/log15/nonrepeat/−, yielding a single distinct prediction. Fit nonmarker score -0.607984, p40–55 held score -0.665271, held top-two 270/3295 (8.194%). It is nonprose and re-encrypts exactly, as any correctly implemented inverse does. This is a reused manuscript split, not a newly blinded original ciphertext.

**Decision:** retire this precise 3301/BASE29 differential receiver, including private chapter seeds and static alphabet permutations, as an original plaintext route. The native frequency comparison is conditional and the operation was not source-selected. Do not extend it through arbitrary denominator or rank searches. No unknown plaintext/key. [SFT](../sims/lp2_3301_rational_differential_sft.cjs) · [full output](lp2-3301-rational-differential-output.json). Exact JS core executed on the same corpus/native blobs above; standalone Node wrapper not separately executed.

## Reproduce

[Read-only CommonJS SFT](../sims/lp2_3301_rational_base29_fhold_sft.cjs), [complete output](lp2-3301-rational-base29-fhold-output.json). Source blobs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native controls 1b064ef6d85819b7d96adaff31a82d1ec551598f. The exact JS core was executed in the connected runtime on the repository inputs; the Node file wrapper was not separately run and no CI run is claimed.
