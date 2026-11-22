# LP2 p0–2: locked second-passage checksum selects the post-IDEA route

**Agent7, 18 November 2026. Classification:** strong conditional selector result. The original 27×27 rune grid now generates the source-node sequence through a finite mirror-overlap successor family; no stage-12 or stage-13 source coordinate is supplied to the selector. The remaining major dependence is the retrospective transition-rule family itself.

## Result

A cross-text target fixed before this continuation search gives the proposed second seven-word passage:

```text
17 runes
rune-index sum 232
GP sum 854
```

The independently reached prefix **THE IDEA** contributes:

```text
5 runes
rune-index sum 81
GP sum 301
```

The next five words therefore have the frozen residual:

```text
12 runes
rune-index sum 151
GP sum 553
```

Starting from the recorded IDEA endpoint, generate source-node candidates only from local relationships in the original 27×27 rune grid, enumerate both allowed key operations and every straight ciphertext segment compatible with the locked twelve-rune total, and apply the published transition predicates. The exact residual leaves **one route**:

```text
OF | THE | END | IS | DEATH
```

No dictionary, word-frequency score, expected plaintext string, per-block length, stage-12 source, or stage-13 source is supplied.

## Frozen incoming state

The incoming block is the previously reproduced **IDEA** candidate:

- source node: A–TH–A at `(8,13),(11,16),(14,19)`;
- ciphertext: `(15,20),(16,19),(17,18)`;
- endpoint: D at `(17,18)`;
- phase: 1;
- accumulated phase state: `S=7`;
- outer state: `a=0`;
- preceding NOW THE beginning: `(11,16)`.

## Original-grid source successor family

The stronger SFT enumerates all equal-outer mirror triples in the original 27×27 grid and applies the following local successor relations. Report 00's published source domain, rune indices 1–28, is enforced before key derivation.

1. **Stage 09:** take every equal-outer mirror centered on the IDEA endpoint.
2. **Stage 10:** when the IDEA beginning is one outer of the stage-09 mirror, take every mirror centered on the opposite outer.
3. **Stage 11:** from the stage-10 center, take every unvisited mirror for which that center cell is an outer.
4. **Stage 12:** from each candidate stage-11 ciphertext endpoint, enter every mirror for which the endpoint is an outer; then take every different mirror sharing that first mirror's center and axis.
5. **Stage 13:** from each candidate stage-12 ciphertext endpoint, enter every mirror centered there; move one source radius in either perpendicular direction; then take every mirror centered on the landing cell.

These rules are geometric and source-visible. They were reconstructed from the proposed route rather than authenticated as Cicada instructions, so they remain a hypothesis. Their value is that the later source coordinates are generated during search rather than inserted as answers.

On the surviving branch they generate:

| Stage | Original source |
| --- | --- |
| 09 | J–D–J at `(15,20),(17,18),(19,16)` |
| 10 | OE–J–OE at `(18,16),(19,16),(20,16)` |
| 11 | J–B–J at `(19,16),(23,12),(27,8)` |
| 12 | H–R–H at `(21,17),(21,22),(21,27)` |
| 13 | J–B–J at `(19,16),(23,12),(27,8)` |

Several of the local steps are unusually constrained on the actual branch:

- D(17,18), the IDEA endpoint, centers exactly one equal-outer mirror: J–D–J.
- J(19,16), the unused opposite outer, centers exactly one equal-outer mirror: OE–J–OE.
- The same J is an outer of only the already visited J–D–J and one new equal-outer mirror, J–B–J.
- The actual END endpoint I(21,23) is an outer of a unique equal-outer I–R–I mirror. At its center R(21,22), the only different mirror on the same horizontal axis is H–R–H.
- At the actual IS endpoint D(21,10), the perpendicular-radius construction reaches centers of candidate mirrors; the full arithmetic/transition selector retains the returning J–B–J branch.

## Exhaustive ciphertext and key family

For every generated source candidate, the SFT considers:

- the direct-center and Euler-totient-center source operations, deduplicated when they align to the same key;
- every in-bounds straight contiguous ciphertext segment in all eight directions;
- every block length compatible with the locked total of twelve runes.

Five blocks each have the Report-08 minimum length of two, so no individual block can exceed four runes while the total remains twelve. Enumerating lengths two through four is complete for this target.

With Reports 01–19 and only nonnegative target-bound pruning, the surviving partial-path counts are:

```text
22 → 46 → 16 → 34 → 60
```

The exact final residual `12 / 151 / 553` leaves:

```text
1 hit
```

## Unique survivor

| Stage | Selected source operation | Selected ciphertext | Decrypted runes |
| --- | --- | --- | --- |
| 09 | J–D–J → J–OE–J, center φ, phase 0 | `(18,15)→(18,16)` | O F |
| 10 | OE–J–OE → OE–OE–I, center φ, phase 2 | `(19,17)→(19,16)` | TH E |
| 11 | J–B–J → J–J–T, center φ, phase 2 | `(19,23)→(20,23)→(21,23)` | E N D |
| 12 | H–R–H → TH–H–H, center φ, phase 1 | `(21,9)→(21,10)` | I S |
| 13 | J–B–J → J–J–T, center φ, phase 2 | `(26,3)→(26,2)→(26,1)` | D EA TH |

Thus the target selects all five center transformations, all five lengths, all five starts, all five directions, and all twelve plaintext runes inside this source-generated family.

## Transition-rule ablation

The late Reports 17–19 are not responsible for the final uniqueness.

Using the same mirror-generated source family and target, Reports 01–15 alone produce the partial-path counts:

```text
170 → 636 → 592 → 439 → 337
```

Yet the exact `12 / 151 / 553` residual still has **one hit**, the same recorded route. Adding Report 17 leaves those counts unchanged. Report 18 reduces them to `58 → 100 → 20 → 70 → 60`; Report 19 reduces them to `22 → 46 → 16 → 34 → 60`. Every level still has exactly the same single checksum hit.

The completed deeper ablation isolates the exact point at which uniqueness appears:

| Maximum report included | Partial-path counts | Exact 12/151/553 hits |
| --- | --- | ---: |
| 10 | 246 → 4140 → 10908 → 4444 → 2856 | 6 |
| 11 | 246 → 4140 → 10908 → 4444 → 2794 | 5 |
| **12** | **170 → 2378 → 7517 → 2405 → 630** | **1** |
| 13 | 170 → 2378 → 2434 → 699 → 630 | 1 |
| 14 | 170 → 2378 → 2434 → 699 → 337 | 1 |
| 15 | 170 → 636 → 592 → 439 → 337 | 1 |

**Report 12, the exact incoming-ray deviation rule, is the critical discriminator.** Report 11's no-skipping rule removes only one of six exact checksum hits. Once Report 12 is applied, the recorded route is already the sole exact checksum hit; Reports 13–19 reduce intermediate branching but do not create final uniqueness.

This sharpens the evidentiary caveat. The new arithmetic selector is genuinely independent of the candidate words, but its unique post-IDEA result depends on Report 12, a rule fitted within the same proposed 27×27 route. Any future authentication should therefore target the exact-ray rule specifically rather than treating all nineteen reports as an undifferentiated body of support.

## Broad controls

The locked checksum does not identify the phrase in an unconstrained grid.

Before adding the transition family:

- fixing the five recorded source nodes while allowing every straight segment of the recorded lengths in all eight directions gives approximately **1.11×10^15** checksum-matching five-block combinations;
- restricting starts to cells on or immediately around the locally connected mirror structures still leaves **719,861** checksum matches.

The evidence therefore comes from the conjunction of a pre-frozen cross-text arithmetic target, an original-grid source family, and a bounded transition model.

## Interpretation

The new result removes two important forms of language dependence from stages 09–13. The five words and their boundaries are not scored for English, and the later source nodes are generated during search.

Two caveats remain material:

1. The mirror-overlap successor relations were reconstructed retrospectively from the route. They are simple local source operations, but an original Cicada instruction selecting this exact walk has not been found.
2. The transition predicates were also fitted on the proposed route. The independent checksum is valuable precisely because it was frozen outside this search; the ablation shows the latest Reports are unnecessary for the final hit.

This is strong intermediate evidence for the post-IDEA route. It is not yet sufficient to promote the whole 27×27 reconstruction to established Liber Primus plaintext.

## Reproduction

Fixed-node control:

```text
node sims/lp2_p0_second_passage_checksum_selector_sft.cjs
```

Source-generated mirror graph:

```text
node sims/lp2_p0_second_passage_mirror_graph_selector_sft.cjs
```

Report ablation:

```text
node sims/lp2_p0_second_passage_report_ablation_sft.cjs 15
node sims/lp2_p0_second_passage_report_ablation_sft.cjs 19
```

Verified Windows Node 22 runs:

- fixed-node selector: **44415672565**, PASS;
- mirror-graph selector: **44416393392**, PASS;
- Reports 15/17/18/19 ablation: **44416622852**, PASS;
- Reports 10–19 ablation: **44416960678**, PASS.

Supporting workflows:

- `.github/workflows/agent7-p0-second-passage-checksum-selector.yml`
- `.github/workflows/agent7-p0-second-passage-mirror-graph-selector.yml`
- `.github/workflows/agent7-p0-second-passage-report-ablation.yml`
