# LP2 31 thirteen-dot marks as 32 segments keyed by the 32×8 numeral table

**Agent 48, 13 November 2026. Status: original-source exact inverse tested, negative for native GP29 prose. No unknown plaintext, authentic key, cipher operation, or destination recovered.** This is a bounded new cipher-consumer test, not a claim that the marker count selects an operation.

## Original clue and possible human solve path

The complete **58-page second release** carries **31 source-visible thirteen-dot punctuation marks** (30 red, one black), while its 256-entry base60 numeral table on physical pages 49–51 is arranged in **32 printed rows of eight**. A person viewing both original artifacts could hypothesize that the punctuation marks delimit exactly 32 cipher sections, and that one consecutive eight-byte table row governs each section. The 2014 puzzle previously used explicit numeric-row permutations; the independently solved LP1 material used additive Gematria Primus (GP29) Vigenère. Reusing the same eight-column row as a repeating mod-29 pad is therefore an executable, historically accessible proposal.

**Upstream premise and weakest link:** the 31-marker count requires including solved physical pages 56–57 even though p56's established cipher is a distinct prime-totient rule and p57 is cleartext. The original manuscript never directs solvers to treat each numeral row as an additive key or says where to reset. The present test adopts *only* the literal original punctuations, row-major table order, eight-cell repetition and the two algebraic signs, with no fitted key, offset, cipher threshold or word-level skip.

## Exact original segmentation

Read all 13,136 LP2 runes (including the final 180 solved runes) in printed physical order, retaining page50 as a runeless slot. A mark annotated after page-local rune offset `k` creates a boundary after the first `k` runes of that page. For the mark at p15 offset0, the boundary is precisely before p15's first rune. Preserve *both* separately colored 13-dot marks at p7 offset194 as separate source events.

The 31 marks yield 32 numbered intervals; **two intervals contain no runes**:

- **Interval 8** is between the black and red 13-dot marks at p7 offset194.
- **Interval 11** is between p14's terminal 13-dot mark and p15's opening 13-dot mark. The shared absolute offset is 3,603.

The resulting 32 interval lengths, without padding, omission, or deletion, are:

```text
13 716 16 103 3 690 11 308 0 14 1729 0 9 11 1883 16
1005 19 1414 10 81 8 1460 3 118 3008 9 299 5 80 7 88
```

Thus **32 sections are exactly countable**, although there are only **30 nonempty text sections**. The two zero-length intervals are source-relevant counterexamples to inferring 32 *equal-purpose* message units from the numerical coincidence alone.

## Completely specified original-cipher inverse

Let `G[s][j]` be the byte in row `s`, column `j` of the unchanged 32×8 base60 table. For each printed GP29 rune `C[s,i]` in the s-th interval, define the reversible candidate:

```text
K[s,i] = G[s][i mod 8] mod 29
P[s,i] = (C[s,i] + sign * K[s,i]) mod 29
sign ∈ {−1,+1}
```

The interval-specific rune clock starts at zero after each 13-dot mark. The unused key rows for the two empty intervals remain in place; they are **not** skipped or reassigned to improve the decoding. Every output rune exactly reenciphers to the original, and both signs are evaluated over every original position. The table byte interpretation is the existing conditional base60 source reading, unchanged.

| Frozen decoder | 12,956 unsolved-rune GP29 IoC | Observable continuation |
| --- | ---: | --- |
| Original undecoded register | approximately **0.03448** | cryptographic-looking, no known plaintext |
| 32-row, subtract table key | **0.03447444183317249** | all major intervals remain random-like |
| 32-row, add table key | **0.034485463908423115** | all major intervals remain random-like |
| 95-rune genuine solved-p57 plaintext cycled through source-shaped segments | **0.07248160773113381** | exact planted source recovered |

The source-original readouts have no sustained GP English. A separately generated 13,136-rune plant uses the actual solved p57 GP plaintext repeated in fixed printed order, encrypts it with each original table row using the opposite sign, and reverses the cipher. **Every 13,136 rune recovers exactly**, including both empty segments and the final solved-page positions. Every original result also reenciphers 13,136/13,136. Consequently the result is a genuine negative under the **literal fixed key-to-segment mapping**, not a failure to implement the proposed inverse.


## Source-selected per-interval 8-column transposition

### Plausible human solve path

A solver who notices the original 31 thirteen-dot marks and the 32×8 base60 byte table could reasonably try a standard columnar transposition: the marks supply 32 consecutive intervals, each printed table row supplies eight byte values, and sorting those values gives an eight-column read order. Earlier Cicada stages used recognizable transpositions, so this is a simpler historical operation than inventing another stream cipher. The source does not explicitly say that rows are column keys or that their values should be ranked; that is the weakest assumption.

### Frozen inverse family

For each of the first 28 intervals (exactly the 12,956 unknown runes), rank the corresponding table row's eight distinct byte values. Test only:

1. fill plaintext row-wise and read columns in ascending rank order;
2. the same with descending rank order;
3. fill plaintext column-wise and read rows in ascending rank order;
4. the same with descending rank order.

The final four intervals belong to the already-solved p56/p57 material and are not transformed. Both zero-length intervals remain in place. No row rotation, arbitrary offset, key fitting, marker deletion, or alternate alphabet is used. The four implementations are exact inverse pairs; each is checked on an independently planted 12,956-rune p57 control and by forward re-encryption of every original interval.

### Original-cipher result

A source-calibrated GP29 four-gram model uses the first 150,000 characters of the Shakespeare control for training and the final 150,000 for held-out scoring. It applies the authenticated source spellings ING and IO, and scores each interval without cross-boundary four-grams.

| Reading | Held-out GP29 four-gram log probability per rune |
|---|---:|
| Original undecoded register | **−14.1912584** |
| Row-fill / column-read, ascending | −14.1986442 |
| Row-fill / column-read, descending | −14.2020494 |
| Column-fill / row-read, ascending | −14.2050607 |
| Column-fill / row-read, descending | −14.2034913 |

Across 500 deterministic held-out native-text windows with the same 28 segment lengths, scores range from **−11.0766107** to **−10.6847566** (median **−10.7949813**). Every candidate is more than **3.12 nats per rune below even the worst sampled native window**, and every candidate is slightly worse than the raw ciphertext. The transposition does not restore English-like GP29 adjacency or produce plaintext.

The synthetic p57 control recovers exactly under all four inverse pairs. Thus the negative result is not a transposition implementation failure. The test is distinct from the previously recorded whole-book eight-column word-order interleaver: this experiment is a rune-level, row-specific transposition independently applied to each original thirteen-dot interval.


## Totient transform of the eight-byte row

### Plausible human solve path

The LP1 p5 sentence explicitly elevates the totient function, and the solved p56 method independently demonstrates a prime-totient key stream. Combined with the source-aligned 32 rows and 32 thirteen-dot intervals, a solver could try applying Euler's phi to each of a row's eight byte values and repeating the resulting eight-symbol key across its interval. This is a more specific operation than unconstrained key hunting, although the manuscript does not explicitly connect p5's instruction to the p50 table.

### Frozen variants and result

For each of the first 28 unknown intervals, the eight row bytes are transformed by phi and repeated with period eight. Both additive directions are tested. Because two table cells are zero and phi(0) is undefined, only two natural conventions are tested: preserve zero as a null key, or treat the byte as a zero-based index and apply phi(byte+1).

| Key construction | Decryption direction | GP29 four-gram log probability per rune |
|---|---|---:|
| phi(byte), zero as null | subtract key | −14.1935683 |
| phi(byte), zero as null | add key | −14.2013267 |
| phi(byte+1), one-based | subtract key | −14.2017751 |
| phi(byte+1), one-based | add key | **−14.1802872** |
| Original undecoded register | — | −14.1912584 |

The best variant improves the raw score by only 0.011 nats per rune. It remains **3.10 nats per rune below the worst** of the same 500 held-out native-text windows (minimum −11.0766107; median −10.7949813). No variant produces natural plaintext.

As a local check against the provisional 30-rune p55 crib at segment offset 269, row 28's generated phi key matches the required stream at most **3/30** positions across the two zero conventions and both signs. There is no exact key-stream recovery. The crib remains provisional, so this is supporting negative evidence, not an independent disproof of the proposed words.

All four transforms are checked by exact synthetic p57 round trips. The source-aligned period-eight hypothesis is therefore rejected in these fixed forms; this does not rule out a different totient construction or another role for the table.


## Source-frozen 32-row mod36 silent-output receiver (Agent 1, 28 November 2026)

**Decision: the original 31-mark / 32-row association is an exact segmentation cue, but the direct eight-byte row modulo36 as a period-eight, per-segment hidden-output cipher key does not recover readable GP-native text.** This is a genuinely different encoder from the direct GP29 pad and RC4 gates above. The 36-symbol hidden-output cipher is motivated by the separately implemented Round48/C11 alternative-channel decoder, **not authenticated by Cicada**. The source does not prescribe mod36, seven silent symbols, or the period-eight repetition; these remain the weakest premises. The test is a bounded consumer of an original-visible *key and segmentation*, not a new source claim.

Use every original one of the 31 individually printed 13-dot marks, preserving distinct marks at the same rune offset and both empty intervals. For segment `s`, key `K_s=(G[s,0],...,G[s,7]) mod36` exactly as printed, repeated with period8 starting at its first rune. The hypothesized sender admits 29 visible outputs, seven silent outputs, a plaintext space symbol, and strict rejection of a repeated most recent *emitted* symbol. The receiver is the fully implemented [periodic-state unbounded silent-event inverse](../sims/lp2_periodic_silent_unbounded_inverse_sft.cjs), with **exact min-plus hidden-event reachability** and a beam of128 paths across observed runes; there is no artificially capped number of silent events. Every attempted decoded candidate is forward encrypted to exactly the original ciphertext before being reported.

A genuine **held-out GP-native Gibran plant** with each frozen printed key proves the inverse recognizes correctly keyed text: for segment1, 320 source symbols produce261 visible, with **100.00%** visible-plaintext LCS and score **−1.88348** per printed rune; for segment27, 320 source symbols produce257 visible, with **99.53%** visible-plaintext LCS and score **−1.88737**. The two held-out samples were not used to select keys, offsets or segments. The model is visibly effective on the calibrated positive data, not merely reversible on arbitrary ciphertext.

All 30 nonempty original segments have finite-state paths under this proposed cipher, including the 28 segments containing all 12,956 unsolved runes. This is weak evidence because the channel can admit many nonsense strings. Four independently fixed **long original** intervals were then decoded with the same correct-key calibration:

| Original thirteen-dot segment | Printed runes | Full candidate incl. silent symbols | Inferred silent emissions | GP-native LM score per printed rune |
| --- | ---: | ---: | ---: | ---: |
| 1: p0 opening body | 716 | 1,317 | 601 | **−5.03234** |
| 5 | 690 | 1,264 | 574 | **−5.19235** |
| 16: p23–26 postheading block | 1,005 | 1,716 | 711 | **−5.34462** |
| 27: p54–55 terminal | 299 | 538 | 239 | **−5.16465** |

Every one of the four full-latent candidates forward reencrypts without discrepancy, but none has a credible sustained GP-native plaintext. The original scores are **3.14–3.46 nats per printed rune below** the positive plant scores on the same frozen model; the outputs are irregular pseudo-English. The original candidates require roughly 41–46% silent emissions among all modeled full symbols, rather than approximately 19% on the two keyed controls. This is much greater than expected from an independently uniform 36-symbol sender and further weakens the literal key association. Caution: the decoder's language-model beam is heuristic, so this is a **failed recovery test**, not a global mathematical impossibility for any plaintext under the printed eight-byte keys.

Reproduce with [single-file original source and exact-replay test](../sims/lp2_13dot32_row8_mod36_silent_exact_original_sft.cjs). It was executed successfully in [Windows Node22 GitHub Actions run 46106107650](https://github.com/FlareZ123/liber-primus/actions/runs/46106107650) (job140859103593, completed 28 November2026 04:08 UTC). The run checks all 32 segment lengths, both blank sections, two native positive controls, exact unbounded reachability of every source segment and four complete original native-input decodings; no new key, original plaintext or destination. Because source-key acquisition is the limiting factor, do not respond by searching arbitrary row phases, nonce derivations, permutations or alternative alphabet modulus with a language model; seek a separate authored instruction first.

### Decision

**Reject the direct mod-29 repeating-eight-byte-pad transfer, the four source-fixed row-ranked per-interval eight-column transpositions, and the four fixed period-eight row-wise totient streams** as explanations of direct native GP-English on unsolved LP2. The exact 31→32 segmentation is source-real but contains two empty intervals; neither its count nor these negative row-consumer tests establishes that each row is a cipher key. The key-independent fixed-substitution obstruction remains conditional on direct native GP-English and does not exclude within-interval state changes, transposition interleaved with a symbol-changing cipher, or another original side channel.

A justified successor must identify an independent original instruction specifying a different row consumer, or establish plaintext/key material on a previously unfitted interval. Fitting rotations, period offsets, marker deletion, arbitrary byte relabelings, or additional rank/totient transforms to these same 32 intervals would lack that selector.

**Reproduction:** [single-file CommonJS SFT](../sims/lp2_13dot_32row_grid_segment_sft.cjs) includes the direct-pad gate, four row-ranked columnar inverses, four period-eight totient streams, source-calibrated GP29 four-gram scoring, exact original re-encryption, planted p57 controls, and the provisional p55 crib comparison. Run with Node.js 22: `node sims/lp2_13dot_32row_grid_segment_sft.cjs`. The earlier additive-pad gate was also run successfully in [GitHub Actions run 43387480566](https://github.com/FlareZ123/liber-primus/actions/runs/43387480566). It reads the pinned original corpus, ink annotation and numerical table, asserts the 31 mark/32 section geometry, checks the two empty sections and runs the exact positive-control inverses. Source references: [ink annotations](../resources/liber-primus/lp2-ink-annotations.json), [canonical corpus](../resources/liber-primus/lp2-corpus.json), [base60 table](../resources/liber-primus/base60-grid.json).
