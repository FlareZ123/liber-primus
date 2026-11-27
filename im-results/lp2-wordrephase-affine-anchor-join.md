# Unknown word-rephased bidirectional affine key: anchor join

This removes the continuous-phase restriction from the earlier dual-anchor attack. Grant every printed word arbitrary independent start phase and direction. Within a word consuming C=aP+K[q+d*j] mod29, common unknown nonzero a, d=±1; literal F bypasses. Rotate/reflect key to first anchor phase0/direction+1. Exhaust every phase/direction of second anchor and solve a from overlap equation. Zero compatible joins excludes any word-number-dependent phase/direction update under both selected dictionary anchors. Positive joins are partial key candidates, not plaintext. Controls use previous-word GP prime sum as next start and parity as direction, distinct keys and multipliers. The full join is enumerated; at most 50k candidate records are stored per case. The original continuous-phase whole-text decoder remains separate.

| Period | Type | Section | Pair/phase/direction trials | Compatible partial keys | Missing positions:count | Planted state among joins |
|---:|---|---|---:|---:|---|---|
| 13 | control | Emerson heldout | 16598426 | 1 | 0:1 | true |
| 13 | control | LP1 reference | 8912046 | 1 | 0:1 | true |
| 13 | original | section1 | 53723124 | 0 |  | false |
| 13 | original | section2 | 16598426 | 0 |  | false |
| 13 | original | section3 | 1945320 | 0 |  | false |
| 13 | original | section4 | 8912046 | 0 |  | false |
| 13 | original | section5 | 10233288 | 0 |  | false |
| 13 | original | section6 | 16598426 | 0 |  | false |
| 13 | original | section7 | 16598426 | 0 |  | false |
| 13 | original | section8 | 2007720 | 0 |  | false |
| 13 | original | supplemental p54–55 | 16128060 | 0 |  | false |
| 16 | control | Emerson heldout | 20761216 | 1 | 0:1 | true |
| 16 | control | LP1 reference | 10968672 | 1 | 3:1 | true |
| 16 | original | section1 | 66120768 | 0 |  | false |
| 16 | original | section2 | 20428832 | 0 |  | false |
| 16 | original | section3 | 2504320 | 0 |  | false |
| 16 | original | section4 | 10968672 | 0 |  | false |
| 16 | original | section5 | 13173888 | 0 |  | false |
| 16 | original | section6 | 20428832 | 0 |  | false |
| 16 | original | section7 | 20428832 | 0 |  | false |
| 16 | original | section8 | 2580864 | 0 |  | false |
| 16 | original | supplemental p54–55 | 19849920 | 0 |  | false |

[Raw candidates](lp2-wordrephase-affine-anchor-join.json); run `node sims/lp2_wordrephase_affine_anchor_join_sft.cjs`.

## Full independent control recovery

The exact source join found no original partial keys at either period, so there is no original candidate to decode. Each positive control produced one compatible partial key. The third and fourth long anchors extend the partial key, then every residual <=2 shifts and every key rotation/reflection are tried. Inversion uses a full finite-state DP over previous word prime sums modulo 2m and all initial residues. The key and plaintext are validated by exact re-encryption. Results:

| Period | Control | Anchor candidate counts | Full key/orientation trials | Legal full decodes | Correct runes | Exact original key + seed |
|---:|---|---|---:|---:|---:|---|
| 13 | Emerson heldout | 1→1→1 | 26 | 1 | 1101/1101 | true |
| 13 | LP1 reference | 1→1→1 | 26 | 1 | 1500/1500 | false |
| 16 | Emerson heldout | 1→1→1 | 32 | 1 | 1101/1101 | true |
| 16 | LP1 reference | 1→1→1 | 26912 | 1 | 1500/1500 | true |

[Control-recovery SFT](../sims/lp2_wordrephase_affine_control_recovery_sft.cjs) · [machine results](lp2-wordrephase-affine-control-recovery.json).

## Independent phase multipliers, exact pair cover (Agent5, 2026-11-27)

Unlike the common-multiplier join above, this receiver allows each of eight phases an independent invertible affine map over GF(29), canonical GP chart, transparent plaintext F, and independent starts and odd strides (1,3,5,7) for each printed word. Period8 on p40–53 is exploratory, not an independently selected source clock. The train register is 24 words of length >=10 (15 have no ciphertext F); allow six arbitrary out-of-register words. The other 645 printed groups are excluded from fitting. Lexicon: 38,938 forms.

For two F-free anchors, repeated phase observations with distinct C determine the full affine map given their lexical P. An anchor pair is qualifying when it shares an informative phase and at most one phase is unresolved. Enumerate pair alignments before observing plaintext; an exact independent-set search over one phase/stride state per anchor proves no nine anchors can mutually avoid qualifying pairs (maximum five for the original). Since at least nine of 15 F-free anchors must be lexical under the six-OOV budget, every possible compatible cipher has at least one enumerated qualifying pair. Hash join lexical options on the shared map, merge per-phase constraints, enumerate the <=28 completions of the unresolved map, quotient phase/stride renumberings, and check all 15 F-free anchors then all 24. Primitive eight-map cycles only. No frequency or heuristic cap. This proves an exact conditional exclusion, not exclusion of arbitrary permutations, unselected charts, other periods, changed word boundaries, or a larger OOV allowance.

| Clock | Original qualifying alignments | Cover-search nodes | Max avoiding anchors | Matching joins | Consistent pair merges | Full distinct keys | F-free support pass | Full fit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Forward starts | 477 | 3,527 | 5 | 1,599,234 | 447 | 474 | 0 | 0 |
| All odd strides | 2,236 | 52,298 | 5 | 7,769,136 | 2,004 | 2,436 | 0 | 0 |

Two separate hidden controls for each clock recovered the unique exact key, all 24 training truths including six deliberately unsupported words, and all 40 held truths. Original held register not evaluated because no training key passes. No unknown original plaintext recovered.

[Forward receiver](../sims/lp2_q8_phase_affine_exact_pair_cover_sft.cpp), [controls](lp2-q8-phase-affine-exact-pair-cover-controls.json), [original](lp2-q8-phase-affine-exact-pair-cover-original.json). [Odd-stride receiver](../sims/lp2_q8_phase_affine_oddstride_exact_pair_cover_sft.cpp), [controls](lp2-q8-phase-affine-oddstride-exact-pair-cover-controls.json), [original](lp2-q8-phase-affine-oddstride-exact-pair-cover-original.json).

## Plaintext-value-dependent phase advance: exact terminal q8 recovery (Agent5, 27 November 2026)

This is a different clock, not a fixed or word-private constant stride. The 8 small red heading runes on p54 nominate q8, the GP29 chart assigns each native rune its prime, and the solved p56 mechanism uses prime-minus-one weights with plaintext-F holds. The hypothesis is that a recovered plaintext rune advances an otherwise unknown cyclic additive key by its own prime value (or totient), rather than merely by one. Neither p54 nor p56 explicitly selects this state update; it is exploratory. Preserve the canonical chart and printed complete groups; grant every word its own arbitrary initial phase. A plaintext F emits F and does not advance. Every other P emits C = P + K[j] mod29 and advances j by prime(P) or prime(P)-1 modulo 8. Unknown additive shifts absorb either sign. No title-derived shift values are imposed.

Use 47 complete black p54 groups (213 runes), excluding the red heading and 10-rune incoming carry prefix. Hold 17 complete groups (86 runes), including the entire 11-rune p54/p55 carry and all 16 p55-local words. Six F-free complete long groups (zero-based indices 0,13,16,34,37,45) supply key constraints. At most three of 47 training words may be outside the same 38,938-form GP29 lexicon. An F-free ciphertext anchor cannot have a plaintext F. For each dictionary word of matching length, derive its exact phase trajectory and shift constraints with initial phase zero. Any two observations of a phase must specify the same shift; all cyclic rotations represent every allowed start. No language scoring, frequency truncation, guessed phase labels, or held-out fitting.

**Prime advance.** At least three of six anchors must be lexical; any two yield a necessary compatible partial-key join. Exhaust all 15 pairs and every relative cyclic rotation, then fill every unassigned shift and check all training groups. The original has per-anchor partial-option counts 78,83,79,83,85,2; all 539,072 pair comparisons yield zero compatible joins. Therefore at most one of six anchors can be lexical for any shared eight-shift key, regardless of initial phases. At least five anchor OOVs would be required; this is stronger than merely failing the three-OOV fit. No p55 ciphertext is used for key inference.

**Totient advance.** All non-F GP primes are odd, so (prime(P)-1) is even: the eight-state graph splits into two parity rings of four states, each with update (prime(P)-1)/2 mod4. Grant arbitrary independent ring and phase for every group. Exhaust every same-length lexical candidate, every start via rotation, and all missing ring shifts. None of the six original anchors yields even one consistent partial four-shift key. Thus all six must be OOV, even with arbitrary independent four-shift keys for each word; two shared rings cannot repair this. This algebraic exclusion does not require the two-ring fitting algorithm or the 3-OOV budget.

| Clock | Positive plants | Exact recovered keys | Training truth membership | Held truth membership | Original key candidates |
|---|---:|---:|---:|---:|---:|
| Plaintext prime, one q8 ring | 2 | 2/2 unique | 94/94 | 34/34 | 0 compatible pair joins |
| Plaintext totient, two q4 rings | 2 | 2/2 unique pairs | 94/94 | 34/34 | 0 even single-anchor partial keys |

All four matched-width plants intentionally place three nonlexical words among the six anchors, and all reproduce their original generated ciphertext exactly. The planted truth is retained in each inverse image; not all words are individually unique. The two-ring plants distribute the three surviving anchors 2+1 over the rings; no unanchored-partner case or cap occurs. The controls demonstrate algorithm recovery within the chosen sender family, not natural-language identification or a source-selected cipher. No held original candidate exists. These tests do not exclude new plaintext, changed segmentation, arbitrary permutations, other phase periods or nonlinear state laws.

Reproduce: [prime receiver](../sims/lp2_p54_q8_plainprime_stride_exact_sft.cjs), [prime output](lp2-p54-q8-plainprime-stride-exact-output.json); [totient receiver](../sims/lp2_p54_q8_plaintotient_stride_exact_sft.cjs), [totient output](lp2-p54-q8-plaintotient-stride-exact-output.json). Both cores were executed directly in the connected V8 runtime on the exact pinned repository blobs (IDs in outputs); standalone Node wrappers not separately executed. Retire these two specific plaintext-value-dependent additive clocks for the terminal intact-word receiver. Do not respond to the negative by arbitrarily increasing the OOV budget or changing rune weights. No unknown plaintext, authentic key, or complete mechanism recovered.
