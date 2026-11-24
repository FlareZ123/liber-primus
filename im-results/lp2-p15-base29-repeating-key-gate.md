# p15 BASE29-expanded repeating-key gate

**Decision:** reject the tested direct repeated-key Vigenère interpretations of the p15 Fibonacci-prime construction. The source-ordered keys are not distinguishable from shuffled digit orders under the frozen English score, and the primary 47-digit printed-value key has no legal inverse under the authentic LP1 plaintext-F rule on the source-pointed p15 body. These are bounded exclusions, not a new established decryption.

## Why a human solver might try it

LP2 p15 (original archive image **32.jpg**) presents a 4×4 Fibonacci-prime spiral whose clockwise values are:

3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516.

The established construction is abs(3301 - p_(F_n+1)), with the 16 underlying primes:

2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817.

The page also has an infinity/arrow ornament pointing toward its 150-rune body. Separately, the signed 2013 TCP source records the command BASE29 3301 with output 3QO. A plausible, compact human route is therefore: convert the p15 numbers (or their underlying primes) into base 29, interpret the digit values as GP29 indices, concatenate in spiral order, and repeat the resulting key over the body. The infinity mark motivates repetition; the arrow motivates applying it to the body. None of this establishes that the author intended Vigenère or this digit-to-rune mapping; those are the hypothesis being tested.

## Frozen operation and inputs

For ciphertext rune value C[i], key K, and sign s in {-1,+1}, test only:

P[i] = (C[i] + s*K[i mod |K|]) mod 29.

The primary target is p15's **150 runes after its nine-rune red heading**, with key phase zero at the body. A fixed phase-nine sensitivity check allows the heading to consume the first nine key positions. The p15–22 visually selected chapter (1,903 runes) is a secondary target. The nine original visual chapter cuts are also tested as a reset clock and compared with one continuous key clock; the visual segmentation is a candidate reading structure, not an authenticated cipher reset. No free phase, offset, digit reordering, language correction, or key fitting is allowed.

Three source-derived keys were tested:

| Candidate | Construction | Key length |
|---|---|---:|
| Printed grid | Each printed spiral value converted to standard most-significant-first base 29; concatenate | 47 |
| Underlying primes | Each recovered Fibonacci-indexed prime converted to base 29; concatenate | 30 |
| Seed itself | BASE29(3301)=3QO, digit values [3,26,24] | 3 |

The 47-digit printed-grid key is 3QM3QL3QJ3QH3QB3Q13PA3O33LK3HM3AP2R724MOC1CH5AL. The base-29 digit alphabet is 0–9,A–S; mapping its numeric digit values directly to GP29 indices is an explicit assumption, not a source fact.

Inputs are the canonical repository GP29 corpus and Duko English quadgram counts. The p15 grid values are anchored to the original image and the established p15 reconstruction. The 2013 BASE29 command is an external source clue, not a direct instruction to use the output as a key.

## Results

The score is mean natural-log frequency per overlapping A–Z quadgram after expanding GP29 runes through the corpus transliteration. Higher is more English-like. It is a comparative diagnostic, not a calibrated plaintext probability.

| Target / control | Raw or key | Mean log score |
|---|---|---:|
| p15 150-rune body, raw | — | **−17.159648** |
| p15 body, printed-grid BASE29 key, best sign (−) | 47 digits | −16.945739 |
| p15 body, prime-values BASE29 key, best sign (+) | 30 digits | −17.540011 |
| p15 body, 3QO key, best sign (−) | 3 digits | −17.148366 |
| p15 1,903-rune chapter, raw | — | **−17.273554** |
| p15 chapter, printed-grid BASE29 key, best sign (−) | 47 digits | −17.231172 |
| p15 chapter, prime-values BASE29 key, best sign (−) | 30 digits | −17.282655 |
| p15 chapter, 3QO key, best sign (−) | 3 digits | −17.236516 |
| Whole 12,956-rune book, raw | — | **−17.131577** |
| Whole book, printed key, continuous phase, best sign (−) | 47 digits | −17.291838 |
| Whole book, printed key, original visual chapter resets, best sign (+) | 47 digits | −17.243502 |
| Known solved p57 text | positive reference | −10.178885 |
| Shakespeare control corpus | native-English reference | −10.000569 |

The best p15-body output under the 47-digit key begins BREAGHNXEOYYAOEIAPMMEAIYFLOMNIOEGAEOTHJEOEAERUY...; it is not readable plaintext. The slight score improvement over raw does not survive the key-order null.

### Key-order null

For each 47- and 30-digit key, 5,000 deterministic random permutations preserve the exact digit multiset and key length. Each permutation is scored under both signs; the better sign is retained. For the source spiral order at body phase zero:

| Key | Observed best score | Null mean | Null 95th percentile | Add-one permutation p |
|---|---:|---:|---:|---:|
| Printed values, base 29 | −16.945739 | −17.067675 | −16.429429 | **0.36373** |
| Underlying primes, base 29 | −17.540011 | −16.989803 | −16.323543 | **0.92521** |

The phase-nine sensitivity is also unpromising: printed-values key −17.228059 (permutation p=0.65407); prime-values key −17.820541 (p=0.98800). The source-ordered key is not an exceptional ordering of its own digits. These permutation ranks are conditional diagnostics for this fixed family, not claims about every possible use of the p15 grid.

The 2013 seed key 3QO is essentially at raw score (−17.148366 versus −17.159648) and has no readable output. The full-book printed-key outputs are both worse than raw, whether continuous or reset at the nine original visual chapters.

## Authentic LP1 plaintext-F-transparent inverse on the source-pointed p15 body (bounded negative)

The earlier sensitivity described as "literal-F" in this report treats a ciphertext F as literal. That is not the exact historical LP1 rule: the original encoder makes **plaintext F** literal and non-consuming, while a ciphertext F may also be the encryption of a non-F plaintext rune. Agent1's independently validated lexical Viterbi implements that plaintext-driven rule. The present test uses its exact inverse feasibility condition; because every possible bypass branch dies before the 150-rune body ends, no language-model choice or Viterbi ranking can rescue this key.

The source-natural target is p15's 150-rune body, not the red heading: the original 4×4 spiral has 16 printed values, and the infinity/arrow ornament points toward the body. Convert each printed value to standard BASE29, concatenate the 47 digits in clockwise spiral order, and interpret those digit values as GP29 shifts. This digit-to-GP29 mapping is an assumption, but it is the same fixed key tested by the earlier all-consuming/ciphertext-F controls. Start the key at phase zero on the first body rune; do not fit a phase.

Original p15 segmentation is exact: 159 runes / 37 words, with a 9-rune red heading in two words and a 150-rune body in 35 words. The authentic plaintext-F inverse enumerates both legal choices at every ciphertext F. The first two ciphertext-F events leave a unique consumed-key state of 33. At body offset 34 (physical p15 local rune 43; original corpus global rune 3646), word 8 (zero-based) OEXIATHHEA has ciphertext TH (2). Key digit 33 is also TH (2), so subtraction would produce plaintext F (0) from a non-F ciphertext. The authentic encoder cannot produce that output: plaintext F would have appeared as ciphertext F without consuming the key. No legal state survives.

A synthetic plant with the exact original p15 word-length vector and three interior plaintext-F bypasses round-trips exactly under the same 47-digit key, so the feasibility check is exercising the intended rule. The earlier all-consuming and ciphertext-F-literal outputs remain nonlinguistic as reported above.

**Decision:** retire the exact 47-digit printed-value BASE29 key on p15 body at source-natural phase zero under the authentic LP1 plaintext-F rule. This is a hard inverse-feasibility contradiction for that composition, not merely a low language score. It does not exclude other source-selected uses of p15, another target, or a different key derivation; no phase or key sweep is licensed by this result.

**Reproduction:** node sims/lp2_p15_base29_ftransparent_viterbi_sft.cjs


## Collision-suppressed key-skip extension (24 November 2026; bounded negative)

The preceding BASE29 tests assume rigid one-rune/one-key alignment. A distinct, motivated alternative is the collision-skip encoder: when the next candidate ciphertext rune would repeat the previous emitted ciphertext rune, reject that key position and try the next. This is a plausible response to LP2's unusually low adjacent-doublet rate, but it is **not** a first-party-authenticated LP2 instruction. The independently published Campaign XVIII implementation is pinned at [Dukotah/cicada3301, commit f63501d8f2d835b80c30230eb89a1110fb9197d2](https://github.com/Dukotah/cicada3301/tree/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/campaign18_skip); this local test independently implements its skip-validity condition.

The target is the source-natural 150-rune p15 body: the 16-cell Fibonacci-prime spiral is above it, and the infinity/arrow ornament points toward it. The clockwise spiral starts at the red 3299 cell. The signed 2013 server's BASE29 operation motivates the number-to-base29 conversion, while identifying the resulting digit values with GP29 shifts remains an assumption. Key phase is fixed at zero on the first body rune. There are no word/page resets, offset search, Atbash, reversal, or fitted exceptions. The beam allows at most three rejected key symbols per emitted rune and has width 400. It checks that every rejected key position would have emitted the preceding ciphertext rune; the fitted 0.83 suppression probability is used only to plant the positive control, not to rank candidate paths.

Five fixed source-derived key constructions were tested in both arithmetic directions:

| Key construction | Length | Key (BASE29 digits or mod-29 values) | Best sign | Best quadgram score |
|---|---:|---|---:|---:|
| Printed grid values, BASE29 | 47 | 3QM3QL3QJ3QH3QB3Q13PA3O33LK3HM3AP2R724MOC1CH5AL | − | −7.443365 |
| Underlying Fibonacci-indexed primes, BASE29 | 30 | 2357DN1E2L5492FSSH1M232C5AC98G | + | −7.123658 |
| 3301, BASE29 | 3 | 3QO | + | −7.360630 |
| Fibonacci-indexed primes mod 29 | 16 | 2357DNEL42SH2CCG | + | −7.341666 |
| Printed grid values mod 29 | 16 | MLJHB1A3KMY7MCHL | − | −7.429665 |

The raw p15 body scores −7.452341 on the same quadgram scale; the clear p57 control scores −4.420633. The least-poor candidate is the 30-digit prime BASE29 key, but its output is not readable prose (prefix OERYTEAEDENGYXIEOTNGAEAUEONTAEANHWYBIANGJAENPJTICSJEABHMRDEOUGEASIAAXHOECCFBYTHE...). A 200-permutation, digit-multiset-preserving null gives this key an add-one p=0.268657 (null mean −7.215624, 95th percentile −6.988501, maximum −6.763658). The 16-symbol prime-residue key has p=0.800995 (null mean −7.208185, 95th percentile −6.911622, maximum −6.688882). Neither source order is exceptional.

**Decoder validation:** a 150-rune known-English plant, encrypted under the 16-symbol prime-residue key with the same collision-skip rule, sign −, suppression 0.83, and deterministic seed 3301, planted three key skips. The beam recovered all 150/150 runes exactly (score −4.237386). This validates the implementation on a synthetic control; it does not authenticate the cipher.

**Decision:** reject only these five p15 key constructions under this fixed collision-skip model. The result does not invalidate the p15 Fibonacci-prime construction or the historical BASE29 operation, and it does not exclude a different nonlinear, matrix, transposition, stateful, or externally keyed use of p15. Do not tune phases, skip limits, digit order, or encodings without a new independent source selector.

**Reproduction:** node sims/lp2_p15_base29_keyskip_sft.cjs. The script asserts the original p15 segmentation and the pinned quadgram Git blob, validates a synthetic collision-skip plant, reproduces the five source-key scores, and runs the two 200-permutation nulls.

## Conclusion and scope

Reject only the tested **direct periodic additive/subtractive GP29** interpretations, the exact authentic plaintext-F-transparent inverse of the primary 47-digit key on p15 body phase zero, and the five fixed p15 key constructions under the collision-skip extension above:

1. BASE29 expansion of the 16 printed p15 values;
2. BASE29 expansion of the 16 underlying primes;
3. the literal BASE29 representation 3QO of 3301.

The 47-digit printed key's small local score lift is ordinary under the shuffled-order null. No authentic plaintext, key, or new reversible mechanism was recovered. This does **not** invalidate the p15 Fibonacci-prime construction, the 2013 BASE29 command, or other nonlinear, matrix, stateful, transposition, or externally keyed uses of the page. Do not continue by tuning offsets, phases, digit orders, or arbitrary encodings without a new independent source selector.

## Reproduction

Run with Node 22:

node sims/lp2_p15_base29_repeating_key_gate.cjs
node sims/lp2_p15_base29_ftransparent_viterbi_sft.cjs
node sims/lp2_p15_base29_keyskip_sft.cjs

The script asserts the 12,956-rune unknown stream, p15's 3,603 global start, its nine-rune red heading and 150-rune body, the 1,903-rune p15–22 chapter, and the nine original visual cuts. It performs the exact inverse plant on solved p57 plaintext under each key (an arithmetic positive control, not evidence that the key is correct) and reproduces the quadgram scores and 5,000-permutation nulls.

Source snapshot at the time of analysis: b300a6e3e135d041602f4aec59a12c95c098773e.

- Original p15 image resources/liber-primus/32.jpg, blob f380a4771461ad74eddf5b4e3e366c28ebc827c5.
- Canonical corpus resources/liber-primus/lp2-corpus.json, blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165.
- Quadgram counts resources/control/duko_round27_english_quadgrams.txt, blob da56c2e11e004ad24454750dba8fbe2e19abbc71.
- Shakespeare control resources/control/shakespeare_first300k.txt, blob 94c677ad9dd50771c6670e0c4e4dad9052b46d85.
- p15 construction: results/lp2-p15-fibonacci-prime-spiral.md, blob 208b7e7ec97a62e593f202144689c8c150136cba.
- Original visual chapter map: im-results/lp2-global-original-visual-section-map.md, blob ca6b24aba8e525607e4315c010a5c81ad0469e23.
- Signed 2013 BASE29 source: resources/external/2013-tcp-server-signed-source.md, blob 75fb7d95e90e4a920328ed645de930f68b71c22a.
