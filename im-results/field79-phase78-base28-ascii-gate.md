# 78-phase base28-to-byte capacity gate

**Classification:** exact conditional exclusion of two direct binary output registers under the postselected 164×79 / 78-phase source-rank model. This is not a recovered plaintext or an authenticated cipher architecture.

## Hypothesis and solve-path motivation

A source-derived arithmetic pattern has suggested a 164-packet construction: 12,956 unsolved runes equal 164×79; the p15 red title yields 149 = p35 from its first four runes and 638 = 29×22 with p22 = 79; the p53 red span yields 2,262 = 29×78. Those relationships are interesting but retrospective and do not authenticate the construction.

The phase78 investigation treats each of the 78 payload positions as a base-28 rank, with a separate secret 28-symbol permutation for each phase, fixed across all packets. A natural alternative to direct GP prose is that the rank symbols are base-28 digits packed into bytes.

I tested two elementary, source-agnostic packings: **four base-28 digits to two bytes** (a lower-throughput alternative) and **five digits to three bytes** (the maximum-throughput elementary packing, since 28⁵ = 17,210,368 and 256³ = 16,777,216).

## Exact bound

For a D-digit base-28 block d₀…dᴅ₋₁ packed into K bytes, its integer value is

~~~text
V = Σ dᵢ · 28^(D−1−i)
~~~

The most-significant output byte is floor(V / 256^(K−1)). For a fixed leading digit d₀, the remaining D−1 digits span the exact interval from d₀·28^(D−1) through (d₀+1)·28^(D−1)−1. This determines the set of leading base-28 digits that could possibly yield an allowed first byte.

| Codec | Any seven-bit byte | Printable ASCII + TAB/LF/CR | Visible ASCII |
|---|---|---|---|
| 4 digits → 2 bytes | {0,1} | {0,1} | {0,1} |
| 5 digits → 3 bytes | 0–13 | 0, 1, 3–13 | 3–13 |

At each phase, an arbitrary bijection can assign the allowed leading-digit set to at most k of the 28 observed rank values. To maximize valid groups, assign those k digit values to the k most frequent rank values at that phase. Summing the 78 phase-wise top-k counts is therefore an exact, optimistic upper bound over **all** secret fixed phase permutations. It only tests the most-significant output byte; it does not assume anything about later bytes or use a language model.

## Source framing and finite variants

The candidate source framing is represented as 164 packets, each with one leading salt transition and 78 payload transitions. The 86 zero-difference transitions are treated both as erased digits and as markers that invalidate any group containing one, leaving 12,706 nonzero rank digits.

For each codec, the reproducer enumerates:

- Four declared phase clocks × four salt/phase mixes.
- Continuous, 164 packet-local, and physical-page-local output segmentation.
- Delete-marker versus discard-any-group-touching-a-marker treatment.
- Forward, reverse-stream, and reverse-within-block digit orientation.
- Every group offset: 0–3 for 4→2 and 0–4 for 5→3.

This is **1,152** framing cases for 4→2 and **1,440** for 5→3, or **2,592** total per output constraint. Each case allows one arbitrary secret bijection at each of the 78 phases, shared across all packets.

## Results

| Codec / required output | Minimum forced-invalid leading bytes | Groups in most permissive case | Natural payload78/no-salt/continuous case |
|---|---:|---:|---:|
| 4→2, seven-bit | **2,269** | 2,871 | **2,557 / 3,176** |
| 4→2, printable controls | **2,269** | 2,871 | **2,557 / 3,176** |
| 4→2, visible ASCII | **2,269** | 2,871 | **2,557 / 3,176** |
| 5→3, seven-bit | **281** | 2,216 | **392 / 2,541** |
| 5→3, printable controls | **354** | 2,216 | **472 / 2,541** |
| 5→3, visible ASCII | **516** | 2,216 | **648 / 2,541** |

The 4→2 codec is more strongly excluded: even the most permissive of its 1,152 cases forces 2,269 of 2,871 groups (79.03%) to begin with a byte outside the required set. For 5→3, even the most permissive seven-bit case forces 281 of 2,216 groups (12.68%) to begin with a non-seven-bit byte.

The natural payload78/no-salt/continuous/forward/marker-deletion/offset-0 interpretation forces 2,557 of 3,176 leading bytes for 4→2 and 392 of 2,541 for 5→3 to be non-seven-bit.

## Positive controls

The reproducer builds a valid ASCII stream for each codec, converts it to base-28 digits, encrypts the digits under 78 distinct deterministic affine phase permutations, and inverts them:

- 4→2: **6,352** ASCII bytes become 12,704 packed digits plus two tail digits.
- 5→3: **7,623** ASCII bytes become 12,705 packed digits plus one tail digit.

Both controls recover every one of the 12,706 digits exactly and pass the same top-k capacity bound. Thus the bounds do not reject a valid plant under the stated phase model.

Reproduce from the repository root:

~~~sh
node sims/field79_phase78_base28_ascii_gate.cjs
~~~

## Interpretation and limits

These results exclude direct 4→2 and 5→3 ASCII byte registers for the tested **fixed 78-phase permutation** family. The bounds are exact for the declared 2,592 clock/framing cases and all 78 secret bijections; they are not searches over keys.

They do **not** exclude salt×column-specific tables, four-group or per-packet rekeys, evolving hidden state, larger or variable-width base-28 packings, compressed or encrypted bytes, UTF-8/non-ASCII output, or a different cipher architecture. The 164×79/78 framing itself remains a postselected hypothesis, not an established intention. No unknown plaintext, authentic key, cipher mechanism, or final destination was recovered.
