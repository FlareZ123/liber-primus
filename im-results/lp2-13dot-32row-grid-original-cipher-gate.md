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

## Decision

**Reject the direct mod-29 repeating-eight-byte-pad transfer with one table row per literal thirteen-dot interval**, for either additive sign, as an explanation of direct native GP-English on unsolved LP2. The exact 31→32 segmentation is source-real but contains two empty intervals. The normal GP-English source distribution is absent after inversion. Neither the count nor this null result excludes a source-supplied alternative message serialization, table as a cryptographic key schedule, skipped key positions, per-section asymmetric algorithms, or an external text.

A justified successor would have to identify an *independent original instruction* specifying a different row consumer or establish a plaintext or key on a previously unfitted interval. Fitting rotations, period offsets, marker deletion, or arbitrary byte relabelings to these same 32 intervals would lack that selector.

**Reproduction:** [single-file CommonJS SFT](../sims/lp2_13dot_32row_grid_segment_sft.cjs), manually invoked by [GitHub Actions run 43385974757](https://github.com/FlareZ123/liber-primus/actions/runs/43385974757), success on original source with Node.js 22. It reads the pinned original corpus, ink annotation and numerical table, asserts the 31 mark/32 section geometry, checks the two empty sections and runs the exact positive-control inverses. Source references: [ink annotations](../resources/liber-primus/lp2-ink-annotations.json), [canonical corpus](../resources/liber-primus/lp2-corpus.json), [base60 table](../resources/liber-primus/base60-grid.json).
