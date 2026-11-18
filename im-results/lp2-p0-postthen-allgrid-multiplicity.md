# p0 post-THEN edge/totient all-grid multiplicity audit

**Agent17, 18 November 2026. Decision:** downgrade the post-THEN `THE KEY` edge/totient construction as a **post-hoc conditional fit**. Its local 1-of-47 and 1-of-8 source-selection counts look sharp at the published THEN state, but comparable unique source geometries are common when the same frozen construction is applied across source-compatible states on the original 27×27 grid. The phrase `THE KEY` is uniquely lexical in the broad census under a vocabulary fixed by earlier repository work, which is interesting but cannot authenticate a transform family that was formulated after that phrase was already known.

This result does not refute every possible 27×27 cipher. It specifically rejects using the published Block18/Block19 local uniqueness counts as independent evidence that this post-THEN construction is the intended continuation.

## Frozen construction

The audit copies the already-published Block18 and Block19 rules without adding a transform:

- Block18 outer and inner φ-depths 1–5;
- the two half/full coordinate shapes;
- all four sign pairs and four axes;
- equal-outer source-node selection;
- inner-scale / 2 radius;
- one more φ for Block18 ciphertext length;
- the selected placement-vector signs for Block18 read direction;
- Block19 `φ(center row)`, `φ(center column)`, and `φ²(radius)`;
- both row/column signs and all four axes;
- equal-outer Block19 selection;
- the previous ciphertext endpoint ± the frozen column displacement;
- the previous Block18 radius as Block19 ciphertext length;
- the same φ/μ three-rune key derivation and GP29 subtraction.

The original pp0–2 source grid remains the unchanged 729-rune 27×27 row-major matrix.

## Broad all-grid source-state census

The strongest adversarial census keeps the **type** of prior state fixed while freeing its location.

In each of the eight D4 coordinate frames:

1. the prior key is a source-native vertical radius-1 three-cell mirror with equal outer runes;
2. the prior ciphertext direction is horizontal and outward toward the local right edge;
3. the prior ciphertext endpoint may occupy any of the 27 rows on that edge;
4. the key center and endpoint are then passed into the exact frozen Block18/Block19 construction.

D4 framing makes this one local definition cover all four physical edges and reflected/rotated orientations without creating new transform formulas.

The original grid contains **144 oriented source-native prior mirror nodes** across the eight frames. Pairing each with all 27 possible outward endpoint rows gives **3,888 source states**.

| frozen gate | source states surviving | rate |
| --- | ---: | ---: |
| unique Block18 equal-outer node | **996 / 3,888** | **25.6173%** |
| executable unique Block18 | **990 / 3,888** | **25.4630%** |
| unique Block19 mirror plus unique in-bounds start after Block18 | **278 / 3,888** | **7.1502%** |
| fully executable two-stage continuation | **268 / 3,888** | **6.8930%** |

These frequencies are the central result. A unique local mirror under this transform is not rare on the source grid. Even a complete unique two-stage geometry occurs in roughly one state out of fourteen-and-a-half.

Accordingly, the published `47 geometries → 1 mirror` and `8 geometries → 1 mirror` counts do not by themselves show that THEN is structurally exceptional.

## Language census with a vocabulary fixed before this task

For an untargeted language check, the reproducer reuses the **preexisting block39 vocabulary rule** already committed elsewhere in the repository:

- `resources/control/shakespeare_first300k.txt`;
- `resources/control/gibran_prophet_58585.txt`;
- standard repository Latin→GP collisions;
- at least five occurrences in the combined excerpts;
- single-rune words allowed only for A and I.

That produces the already-established **1,465 GP word types**. No word was added for this audit.

Across all **268** fully executable broad two-stage states, exactly **one** has both output segments in that fixed vocabulary:

```
THE KEY
```

It is the published identity-frame state:

```
prior key center = (26,22)
prior endpoint   = (25,27)
prior node       = IA-IA-IA
Block18 output   = TH E  -> THE
Block19 output   = C E Y -> KEY under the standard C/K collision
```

This lexical uniqueness is real under the frozen census. It is not a prospective p-value. The edge/totient family was designed after the public continuation `THE KEY` was known, so the language outcome was available during mechanism construction.

## Narrow rigid-state matched control

A second, stricter control translates and D4-transforms the **entire exact pre-THEN geometry**:

- prior radius-1 mirror at local `[(r,22),(r+1,22),(r+2,22)]`;
- outward ciphertext ending at local `(r,27)`;
- the original center/endpoint displacement preserved exactly.

There are **200** possible rigid placements before inspecting source runes. Only **4** placements contain a valid source-native equal-outer prior node. Of those:

- **2** produce a unique Block18 mirror;
- **1** completes an executable unique Block19 continuation;
- that one is the actual THEN state and yields `THE KEY`.

This matched control makes the published state look sharp, but it preserves most of the geometry that was already selected while the public route was being developed. It therefore cannot override the broader source-state multiplicity result.

## Architectural decision

The strongest unsupported premise was that the local uniqueness counts implied an intended source selector. The broad all-grid test rejects that inference:

- a quarter of source-compatible states get a unique Block18;
- nearly 7% complete the frozen two-stage geometry;
- the lexical success is unique, yet the target phrase predates the transform family.

So this branch should **not be extended by adding further edge/totient grammar**. The existing `THE KEY` construction remains reproducible as a conditional fit in `im-results/`, with its lexical specificity recorded, but it should not be promoted to established plaintext or used as a foundation for new downstream rules.

A genuinely independent temporal holdout, where a rule was fixed before the next source transition became available, would be different evidence. That question belongs to the separate chronology/holdout lane rather than another local fit.

## Reproduction

Run:

```
node sims/lp2_p0_postthen_allgrid_multiplicity_sft.cjs
```

The SFT asserts the original 729-rune grid, the preexisting 6,834-word raw / 1,465-word frequent reference vocabulary, all broad and matched census counts, and the exact published `THE KEY` state.
