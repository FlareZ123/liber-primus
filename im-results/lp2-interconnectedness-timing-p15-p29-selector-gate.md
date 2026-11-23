# 2014 Interconnectedness timing: cross-artifact LP2 selector hypothesis and p15→p29 key gate

**23 November 2026, Agent 29.** Classification: a new, source-constrained navigation hypothesis plus exact negative results for two plausible p15-to-p29 uses of the solved p56 cipher. **No unknown plaintext or key was recovered.**

## Executive result

A secondary forensic report of the 2014 Cicada audio Interconnectedness gives a total decoded duration of **277.1591837 s** and an exact repeated-noise start-to-start lag of **11,559,607 samples**, or **262.1226077 s** at 44.1 kHz. The duration, lag, and trailing interval align unusually closely with three LP2 page indices or rune counts:

| Audio-derived value | Original LP2 correspondence |
|---|---|
| Total duration rounded to nearest second: **277** | p29 contains exactly **277 runes** |
| Reverse of the title's GP-prime sum: **772 → 277** | Same p29 length |
| Repeated-noise lag rounded to nearest second: **262** | p0 contains exactly **262 runes** |
| Prime-counting value **π(262)=55** | p55 is the final unknown LP2 page |
| Total duration minus repeat lag: **15.036576 s**, rounded: **15** | p15 is the Fibonacci-prime spiral page |
| Repeat-lag samples divided by 1,152 samples/MP3 frame: remainder **439** | **π(439)=85**, exactly the p56 rune count |

The matching lengths 262, 277, and 85 are each unique among the 58 LP2 pages p0–57 in resources/liber-primus/lp2-corpus.json. The arithmetic is reproduced by sims/lp2_interconnectedness_timing_p15_p29_selector_gate.cjs.

This suggests a possible human solve path in which the audio is a page selector connecting p0, p15, p29, p55, and p56. It is not evidence that any particular cipher has been solved. The choice to round time values, apply prime counting, and interpret an MP3-frame remainder as a selector is an inferred operation, not an explicit instruction recovered from the audio.

## Inputs and provenance

### Audio measurements

SECRA's [Liber Primus — Strongest Findings](https://secra.tech/research/liber-primus-strongest-findings) report describes the 2014 Interconnectedness MP3 as reconstructed from an archived signed message, with its signature verified and the bytes matched against a second archive. It reports:

- 44,100 samples per second per channel;
- 12,222,720 decoded samples per channel (277.1591837 s);
- an exact repeated forward-noise waveform separated by 11,559,607 samples (262.1226077 s);
- a 1,152-sample MPEG audio frame size;
- source MP3 SHA-256 1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6.

**Scope limitation:** the MP3 binary and the signed Stage 7 carrier are not currently in this repository's stable resources corpus. This investigation has not independently downloaded, signature-verified, or decoded the audio. It treats the sample counts and provenance as a secondary-source measurement and independently checks only their arithmetic against the repository's original LP2 corpus. SECRA's own audio analysis reports no supported additional audible message or key; this investigation does not reopen unconstrained audio-channel decoding.

### Manuscript data

Rune counts come from the canonical original-source transcription resources/liber-primus/lp2-corpus.json. Relevant original images are:

- p0: resources/liber-primus/17.jpg — 262 runes and two infinity ornaments;
- p15: resources/liber-primus/32.jpg — the red-origin 4×4 Fibonacci-prime spiral and an infinity ornament;
- p29: resources/liber-primus/46.jpg — 277 runes;
- p55: resources/liber-primus/72.jpg — the tree/butterfly illustration and final unknown page;
- p56: resources/liber-primus/73.jpg — the solved 85-rune page.

The exact p15 grid mechanism is independently established in results/lp2-p15-fibonacci-prime-spiral.md. Its 16 source-derived prime values and ordinals are not conjectural; using them as a key for p29 is.

## Exact arithmetic

Let the reported total sample count be D=12,222,720, the repeated-noise lag be R=11,559,607, the sample rate be fs=44,100, and the MPEG frame length be m=1,152.

\[
D/f_s = 277.159183673\ldots,\quad
R/f_s = 262.122607709\ldots
\]

\[
(D-R)/f_s = 15.036575963\ldots
\]

Nearest-integer selectors are therefore 277, 262, and 15. The GP-prime-weight sum of INTERCONNECTEDNESS is 772; reversing its decimal digits gives 277. The canonical corpus confirms:

- p0 has 262 runes, uniquely among p0–57;
- p29 has 277 runes, uniquely among p0–57;
- p56 has 85 runes, uniquely among p0–57.

The frame decomposition is:

\[
11,559,607 = 1,152 \times 10,034 + 439.
\]

The prime-counting values are:

\[
\pi(277)=59,\quad \pi(262)=55,\quad \pi(439)=85.
\]

Thus the most economical selector interpretation is:
- duration/title reversal → p29;
- repeated-noise lag → p0;
- duration-minus-lag → p15;
- prime-count of the p0-length value → p55;
- prime-count of the MP3-frame remainder → p56.

The frame quotient also factors as \(10,034=29\times2\times173\). This is recorded as an observation only; no source-selected instruction currently justifies using that factorization or assigning 173 to a particular page.

## Human solve-path hypothesis

The possible clue sequence is:

1. A solver notices the 2014 track's repeated waveform rather than searching its audible content for a hidden sentence.
2. The measured repeat lag is close to 262 seconds, matching the exact 262-rune length of p0. The two infinity ornaments on p0 are a visual thematic match for a repeated/looped waveform.
3. The track's total duration is close to 277 seconds, matching p29's 277-rune length. Independently, the GP-prime-weight sum of the title reverses to 277.
4. The 15-second trailing interval points to p15, whose source-visible Fibonacci-prime spiral is a plausible key source.
5. Applying the manuscript's prime theme to 262 gives π(262)=55, selecting the final unknown page p55.
6. The MP3-frame remainder 439 gives π(439)=85, matching the 85-rune p56 boundary page.

The p0 and p15 infinity ornaments, the p55 tree/butterfly, and the track title Interconnectedness make this sequence thematically coherent. They do not independently prove it. In particular, p29's 277-rune length and p0's 262-rune length are exact source facts, while the audio-to-page association depends on the reported measurement and the inferred rounding/prime-count operations.

## Decisive test: does p15 supply a p29 key under the known p56 cipher?

The timing pattern makes p15→p29 the most direct test: the audio's 15-second tail selects p15, and its total duration selects p29. The known p56 decryption supplies a historically demonstrated primitive: consecutive prime totients p_n−1 as a GP29 additive stream, with plaintext F bypassing the key and consuming no key symbol.

The inverse must honor the exact F ambiguity. For each ciphertext F, it may be either:
- literal plaintext F, with no key consumed; or
- a key-consuming encrypted non-F.

A key-consuming branch that decodes to plaintext F is forbidden, because genuine plaintext F must bypass. Every ciphertext F mask is exhaustively enumerated; no language score or guessed mask is used.

### Gate A — p15 Fibonacci-prime ordinals as initial prime ranks

The sixteen p15 source-derived one-based prime ordinals are:

[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988].

For each start, test both cipher signs and every one of p29's **256** ciphertext-F masks: 16 × 2 × 256 = **8,192** original-cipher candidates.

**Result: 0 of 32 start/sign configurations has even one legal F-mask inverse.** The original p29 ciphertext is outside the forward-image language of this exact p15-started p56 cipher, regardless of plaintext language.

### Gate B — p15's sixteen prime-totient values as a repeating key

The source-derived period-16 GP29 key is:

[1,2,4,6,12,22,13,20,3,1,27,16,1,11,11,15].

Test every cyclic phase and both signs, again allowing all 256 original ciphertext-F masks: 16 × 2 × 256 = **8,192** original-cipher candidates.

**Result: 0 of 32 phase/sign configurations has a legal F-mask inverse.**

Together, the two exact gates test **16,384** original-cipher masks and recover no p29 plaintext. This extends the existing p15-to-p56-key work specifically to p29, the page singled out by the audio-duration relation.

### Same p15 consumers on the other audio-selected pages

The same two p15 key families were also tested on p0 (selected by the repeated-noise lag) and p55 (selected by π(262)). All ciphertext-F masks were enumerated, with both signs and all sixteen p15 starts or phases.

| Target | Rune count / ciphertext Fs | p15 ordinal-start family | p15 period-16 family | Highest candidate IoC |
|---|---:|---:|---:|---:|
| p0 | 262 / 14 Fs | 32 legal masks across 32 configurations | 540 legal masks across 32 configurations | 0.03922 |
| p55 | 76 / 3 Fs | 12 legal masks across 32 configurations | 17 legal masks across 32 configurations | 0.04316 |

For p0, the only viable ordinal-start/sign configuration is start ordinal 611 (first prime 4507), sign −1; its best candidate IoC is 0.03779. For p55, the best ordinal-start candidate is start ordinal 90 (first prime 463), sign −1, IoC 0.04316. The best period-16 candidates are phase 14/sign −1 for p0 (IoC 0.03922) and phase 13/sign −1 for p55 (IoC 0.04246).

The solved p56 plaintext's IoC is **0.070028**. None of the p0/p55 candidates approaches that control or yields convincing GP-English text. These are not universal exclusions of other languages or other mechanisms; they reject only the tested p15 consumers of the p56 prime-totient/F-bypass rule.

Across all three audio-selected targets, the two key families test **1,065,472** original-cipher F masks: 16,384 on p29, 1,048,576 on p0, and 512 on p55. p29 has no legal inverse at all; p0 and p55 have some legal algebraic branches, but no plausible plaintext emerged.

### Positive controls

- The original solved p56 ciphertext decodes exactly to its established 85-rune plaintext under the authentic prime-totient stream and its known literal-F mask, then re-encrypts byte-for-byte at the GP29 index level.
- All 96 p15-ordinal/sign combinations correctly invert synthetic F-transparent positive plants at the p0, p29, and p55 target lengths.
- All 96 period-16 phase/sign combinations correctly invert synthetic F-transparent positive plants at the p0, p29, and p55 target lengths.

The negative result is therefore not caused by a reversed sign, wrong prime indexing, broken F-bypass handling, or a decoder that cannot recover its own generated ciphertext.

## Decision and next work

**Retain the audio timing as a low-to-medium-confidence page-selector hypothesis; reject both direct p15→p29 uses and the low-IoC p15→p0/p55 candidates under the solved p56 cipher.** Do not continue re-scoring the same outputs or launching generic audio key sweeps.

The useful next question is whether the selector pattern predicts a different source-authored operation on p29 or on the p55–p56 seam. That requires a concrete clue beyond the fact that the timing values match page counts. The audio binary and signed carrier should be added to resources only if a reproducible acquisition route is found; the current report does not claim their independent verification.

## Reproduction

Run from repository root with Node.js 20+:

    node sims/lp2_interconnectedness_timing_p15_p29_selector_gate.cjs

The script:
- reads the canonical GP29 corpus;
- recomputes the title sum, sample-time arithmetic, prime counts, and unique page-length matches;
- exhausts every original F mask for p0, p29, and p55 under all 32 p15 ordinal-start/sign choices and all 32 period-16 phase/sign choices per page;
- verifies forward re-encryption for every surviving path;
- checks the authentic p56 positive and synthetic F-transparent positive controls.

No network access, external package, stochastic seed, or fitted language model is required. The external audio sample counts remain explicit fixed inputs from the cited secondary report.


**Automated validation:** Windows Node.js 22 manual source-SFT run passed: [GitHub Actions run 45153911699](https://github.com/FlareZ123/liber-primus/actions/runs/45153911699). A subsequent output-only addition of the p56 plaintext IoC control was also dispatched as run [45154067296](https://github.com/FlareZ123/liber-primus/actions/runs/45154067296); its job is being checked.
