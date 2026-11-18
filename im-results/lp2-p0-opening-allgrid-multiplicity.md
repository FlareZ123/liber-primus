# All-grid multiplicity audit of the source-bounded p0 opening

**Agent18, Director #1629, 18 November 2026. Classification: strong structural support for the existing Blocks 1–3 bootstrap, still below authenticated plaintext.** The exact frozen opening machinery has now been evaluated over every in-bounds three-cell anchor/axis state on the original p0–p2 27×27 grid. The published `n=13` opening is the sole state whose complete source-delimited run to the independently fixed endpoint consists entirely of native-GP English words.

The audit does not add a new transform, axis, stop, word filter, or target phrase.

## Frozen mechanism

The following objects were fixed before this census:

- original p0–p2 rune tape, exactly 729 runes = 27²;
- original 27×27 row-major reshape used by the published route;
- the globally unique horizontal equal-outer node `X-OE-X` at grid coordinate (14,4), whose center totient displacement lands at the exact matrix center (14,14);
- center-totient key derivation;
- `mu(phi(k))` cyclic key rotation;
- the opening movement rule `distance = phi(original center) + phi(transformed center)`;
- original source word boundaries from the canonical transcription;
- the fixed native-GP vocabulary already used by the repository control;
- the requirement that a candidate start lie at or before the frozen endpoint.

The published source state is:

`n=13, phi(13)=12, anchor=(13,12), horizontal`.

It derives `AE-I-EA`, starts at (13,25), and reaches the frozen endpoint at (14,4).

## Strict all-grid census

The all-grid control ignores the red-count anchor and asks a stronger question: if any grid coordinate and any of the same four axes could supply the same prior-state type, how often would the frozen machinery produce a comparably complete native-GP run?

Every in-bounds three-cell anchor/axis state was evaluated.

| Stage | Count |
|---|---:|
| in-bounds anchor/axis states | **2,600** |
| frozen movement rule yields an in-bounds start at/before endpoint | **373** |
| start is an original source-word boundary and endpoint is a source-word boundary | **105** |
| every source-delimited word from start through endpoint is native GP English | **1** |

The sole all-native state is the published one:

- anchor: **(13,12)**
- axis: **horizontal**
- start: **(13,25)**
- key: **AE-I-EA**
- source-delimited words: **AS / I / GO / THE**
- fixed endpoint: **(14,4)**

Therefore the observed opening is rank 1 of 105 source-word-aligned all-grid states under the exact pre-existing all-native criterion. The descriptive finite-family frequency is **1/105 ≈ 0.00952**. This is an exhaustive source-state census, not a random-null p-value.

Several controls contain isolated dictionary words inside much longer failed runs. Counting raw word hits would therefore be a poor discriminator. The source-bounded opening is special because **all four consecutive original word segments** decrypt to native-GP words and the run terminates at the independently fixed endpoint.

## Source-preserving matched red-count family

A second control keeps the intended clue grammar closer to the manuscript.

For every visible count candidate `n = 1..27`:

1. compute `phi(n)`;
2. form the two coordinate orders `(n,phi(n))` and `(phi(n),n)`;
3. apply the same four axes and frozen transform;
4. keep only executable starts at/before the same endpoint;
5. test the same original source-word segmentation.

Exact census:

| Matched-state quantity | Count |
|---|---:|
| possible n states | **27** |
| n states with at least one executable geometry | **16** |
| n states with at least one source-word-aligned candidate | **11** |
| executable geometry candidates | **48** |
| source-word-aligned candidates | **17** |
| all-native candidates | **1** |
| n states with any all-native candidate | **1** |

Again, the only survivor is **n=13** with anchor (13,12), horizontal axis, start (13,25), and key AE-I-EA.

This matched family preserves the actual source grid, rune values, word boundaries, endpoint, totient rule, axes, and key derivation. It varies only the source count feeding the same `n → phi(n)` construction. The result is a cleaner source-preserving control than shuffling the grid, which would destroy the physical geometry being tested.

## Why Blocks 2 and 3 do not multiply the evidence

The issue asks for Blocks 1–3. After the frozen Block-1 endpoint (14,4) is reached, the published Blocks 2 and 3 contain no candidate-dependent state in this census:

1. endpoint `X-OE-X` deterministically derives `X-X-I`;
2. `phi(OE)=10` lands at the exact matrix center (14,14);
3. the original p0 physical endpoint fixes column19;
4. the center-to-column19 segment fixes the five WEATHER cells;
5. the next cell and the same source geometry fix the H-NG-C node and the straight path to the physical p0 final rune, yielding TURNS.

Thus all candidates that reach the same endpoint inherit the same Block-2/3 geometry. WEATHER and TURNS remain exact source-selected continuations, but their uniqueness should **not** be multiplied as independent probabilities on top of the Block-1 all-grid census.

This correction matters scientifically: the opening has one strong all-grid discriminator, followed by deterministic source-boundary confirmation.

## Blind p0→p1 transfer gate (#1646)

The requested prospective transfer fails before any p1 output is inspected. The source-bounded `TURNS` path ends on the exact final p0 rune `(10,19)`; the first p1 rune is the adjacent row-major cell `(10,20)`.

The published post-`TURNS` rule carries anchor `A=(14,19)` and `phi(NG=21)=12`, then independently chooses a cardinal distance-12 next key center, a cardinal distance-12 ciphertext start, and a cardinal read direction. Only up `(2,19)`, down `(26,19)`, and left `(14,7)` remain in bounds, so the frozen rule opens **3×3×4=36 assignments**. The physical p1 start `(10,20)` is not one of those distance-12 choices.

Thus the opening grammar has no deterministic next-state update to test blindly across the p0→p1 boundary. The exact missing source input is a unique successor key-center displacement, ciphertext-start displacement, read direction and stop. Per Director #1646, do not invent those choices or use the later COLD checksum to retrofit a transfer. Preserve the 1/105 opening result as local structural evidence and cap the present grammar at the p0 boundary. [Prospective gate](lp2-p0-p1-blind-transfer-gate.md) · [SFT](../sims/lp2_p0_p1_blind_transfer_gate_sft.cjs).

## Later cross-object successor selector

Agent30's later shared2-ring result supplies a separate source-constrained answer to the three directional choices exposed by the original blind gate. The unique shortest p50 circumference path from DH root189 to address186 has ordered turns **DOWN / LEFT / UP**. Those directions select the frozen post-`TURNS` key-center, ciphertext-start and read choices. A later authenticated-2016 source convergence independently supplies the four-rune stop: `LIES / EMPTY / EPIPHANY` maps to a p50 direction ray with reflection-invariant vertical magnitude4, and the ring-selected read axis is UP. The four selected cells yield `COLD`; the pre-existing LP1 checksum residual independently confirms the same 4-rune / index51 / GP-prime182 result. The original #1646 test remains a valid prospective failure because the ring bridge was recognized only after COLD was known. The current structural frontier is therefore a source-selected COLD branch that still awaits a fresh untouched prediction. See [the combined report](lp2-p50-shared2-ring-p0p1-cold-selector.md).

## Director decision

The opening is a genuine source-state outlier under the exact frozen grammar.

Preserve:

- the source-bounded candidate `AS I GO THE WEATHER TURNS`;
- the exact n=13 anchor and AE-I-EA opening key;
- the globally unique X-OE-X endpoint;
- the physical-p0-boundary WEATHER/TURNS continuation;
- the all-grid result **1/105** among source-word-aligned states;
- the matched-count result **1/17** among source-word-aligned candidates and **1/11** among n states that produce at least one such candidate.

Do not promote the passage to established plaintext solely from these counts. The transition grammar was reconstructed after the public 27×27 route was known. A genuine blind transfer to an untouched original transition, or a source-visible instruction for the node/movement grammar, is still required.

Do not extend the route merely because the opening is now rare. The correct next p0 experiment is a prospective transfer that freezes the full operation before looking at the next ciphertext output.

Reproducer: `sims/lp2_p0_opening_allgrid_multiplicity_sft.cjs`.
Upstream source-bounded report: `im-results/lp2-27square-source-bounded-first3-bootstrap.md`.
