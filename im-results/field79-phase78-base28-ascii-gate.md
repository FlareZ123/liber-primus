# 78-phase base-28-to-byte capacity gate

**Classification:** exact conditional exclusion of one binary output register under the postselected 164×79 / 78-phase source-rank model. It is not a recovered plaintext or an authenticated cipher architecture.

## Hypothesis and solve-path motivation

A source-derived arithmetic pattern has suggested a 164-packet construction: 12,956 unsolved runes equal 164×79; the p15 red title yields 149 = p35 from its first four runes and 638 = 29×22 with p22 = 79; the p53 red span yields 2,262 = 29×78. Those relationships are interesting but retrospective and do not authenticate the construction.

The existing phase78 investigation treats each of the 78 payload positions as a base-28 rank, with a separate secret 28-symbol permutation for each phase, fixed across all packets. The direct-GP output register has already been challenged. A natural alternative is that the 12,706 nonzero ranks are **base-28 digits**, packed into bytes rather than mapped directly to GP prose.

The highest-throughput elementary conversion is five base-28 digits to three bytes, since 28⁵ = 17,210,368 and 256³ = 16,777,216. The test below asks whether *any* choice of the 78 secret phase permutations can make every resulting three-byte group begin with a permitted ASCII byte.

## Exact bound

For a five-digit block d₀…d₄, its integer value is

~~~text
V = d₀·28⁴ + d₁·28³ + d₂·28² + d₃·28 + d₄
~~~

The first output byte is floor(V / 65,536). For a fixed leading digit d₀, the remaining four digits can vary over the full range 0…28⁴−1. This gives an exact set of leading base-28 digits that could possibly yield an allowed first byte:

| Output requirement | Allowed leading digits | Count |
|---|---|---:|
| Any seven-bit byte | 0–13 | 14 |
| Printable ASCII plus TAB/LF/CR | 0, 1, 3–13 | 13 |
| Visible ASCII only | 3–13 | 11 |

At each phase, an arbitrary bijection can assign the allowed leading-digit set to at most k of the 28 observed rank values. To maximize valid groups, assign those k digit values to the k most frequent rank values at that phase. Summing the 78 phase-wise top-k counts is therefore an exact, optimistic upper bound over **all** secret fixed phase permutations. It only tests the leading byte; it does not assume anything about the remaining bytes or use a language model.

## Source framing and exhaustive finite variants

The source-derived candidate is represented as 164 packets, each with one leading salt transition and 78 payload transitions. The 86 zero-difference transitions are treated both as erased digits and as markers that invalidate any five-slot group containing one, leaving 12,706 nonzero rank digits.

The reproducer enumerates 1,440 combinations:

- Four declared phase clocks × four salt/phase mixes.
- Continuous, 164 packet-local, and 55 physical-page-local output segmentation.
- Delete-marker versus discard-any-group-touching-a-marker treatment.
- Forward, reverse-stream, and reverse-within-block digit orientation.
- Every five-digit starting offset, 0–4.

For each case, one arbitrary secret bijection is allowed at each of the 78 phases, shared across all packets. No key is guessed or searched.

## Results

| Required output | Minimum forced-invalid leading bytes across all 1,440 cases | Most permissive case |
|---|---:|---|
| Seven-bit bytes | **281** | 2,216 groups |
| Printable ASCII plus TAB/LF/CR | **354** | 2,216 groups |
| Visible ASCII | **516** | 2,216 groups |

Even the most permissive seven-bit case therefore forces at least 281 of 2,216 groups (12.68%) to begin with a non-seven-bit byte. The natural payload78 / no-salt / continuous / forward / marker-deletion / offset-0 interpretation has 2,541 groups and forces **392** non-seven-bit leading bytes. Its corresponding bounds are 472 for printable ASCII plus TAB/LF/CR and 648 for visible ASCII.

The committed reproducer also creates a 7,623-byte seven-bit ASCII positive control, converts it to 12,705 base-28 digits plus one tail digit, encrypts those digits under 78 deterministic but distinct affine phase permutations, and verifies exact inverse recovery of all 12,706 digits. The positive control passes the same top-k capacity bound, confirming that the bound does not reject a valid 5-to-3 ASCII plant.

Reproduce from the repository root:

~~~sh
node sims/field79_phase78_base28_ascii_gate.cjs
~~~

## Interpretation and limits

This excludes direct 5-base28-digit-to-3-byte seven-bit ASCII output for the tested **fixed 78-phase permutation** family. The bound is exact for the declared 1,440 source-clock/framing cases and all 78 secret bijections; it is not a search over keys.

It does **not** exclude salt×column-specific tables, four-group or per-packet rekeys, evolving hidden state, other base-28 pack widths, variable-length framing, compressed or encrypted bytes, UTF-8/non-ASCII output, or a different cipher architecture. The 164×79/78 framing itself remains a postselected hypothesis, not an established intention. No unknown plaintext, authentic key, cipher mechanism, or final destination was recovered.
