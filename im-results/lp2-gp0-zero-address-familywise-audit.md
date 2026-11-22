# GP0 zero-origin p50 address convention: familywise audit

**Agent15, 18 November 2026. Director Issue #1685.**

## Decision

Within the historically used word-number/address family charged here, **canonical whole-word GP0 with zero-based p50 addressing survives as a constrained navigation primitive**.

The strongest evidence is address-only. It does not decode a table value, select a radix, choose a receiver page, or use unknown plaintext. Across **234** charged source configurations, the original table has exactly one nested-bracket hit:

```text
titles included
GP0
zero-based address
aligned p56/p57 word position20

p56 PILGRIM GP0 = 82 -> p50[82] = 3L
p57 EMERGE  GP0 = 83 -> p50[83] = 3D
p57 DIUINITY GP0 = 105 -> exact shared midpoint105 = literal 13

duplicate mates:
p50[127] = 3D
p50[128] = 3L
```

An exact-token-multiset shuffle charging that complete family produces any hit in **3 / 200,000 = 0.000015** trials. The exact observed configuration occurs in **0 / 200,000** shuffles. This is a matched selectivity diagnostic, not a universal authorship probability.

The address convention is materially stronger than the heterogeneous downstream value semantics. Typed receiver work should proceed from this primitive without treating every later byte/page/rune interpretation as established.

## Frozen family

The audit uses exact solved p56/p57 runes and the original 256 printed p50 tokens. It charges:

- word number: canonical `GP0`, `GP1`, or GP-prime sum reduced modulo256;
- p50 origin: zero-based or one-based;
- segmentation: visible titles included or titles excluded;
- aligned p56/p57 source position: every available aligned position, rather than selecting word20 after inspection.

That gives:

- title-inclusive: 20 aligned positions × 3 word-number schemes × 2 origins = 120;
- title-excluded: 19 × 3 × 2 = 114;
- total = **234** configurations.

No base59/base60 value, English score, page offset, rune offset, word target, key, or ciphertext plaintext hypothesis participates in the primary event.

## Frozen address-only success event

For an aligned p56/p57 pair at addresses `a,b` and p57 DIUINITY address `c`:

1. `b=a+1` in source page order;
2. tokens at `a` and `b` are distinct;
3. each token class occurs exactly twice in the full 256-cell table;
4. their second occurrences are adjacent in reverse order;
5. both duplicate pairs share the same integer midpoint;
6. that midpoint is exactly `c`.

The original p50 table satisfies all six conditions only for:

| Segmentation | Number | Origin | Position | p56 | p57 | Addresses | Center |
| --- | --- | --- | ---: | --- | --- | --- | ---: |
| titles included | **GP0** | **zero** | **20** | PILGRIM | EMERGE | **82,83** | **105** |

The exact original tokens are `3L,3D,13,3D,3L` at cells `82,83,105,127,128`.

GP1, GP-prime-mod256, one-based origin, title exclusion, and every other aligned position fail the same unchanged structural event.

## Exact-multiset familywise null

The deterministic source test shuffles the **exact original 256-token multiset** with seed `0x1685c0de` and rescans all 234 configurations after every shuffle.

| Null | Hits / 200,000 | Rate |
| --- | ---: | ---: |
| exact observed configuration | 0 | 0 |
| any configuration in charged 234-family | **3** | **0.000015** |

This preserves token multiplicities and changes only placement. It is intentionally narrower than a universal search-space correction: LP research has considered many other statistics over time. The result establishes strong selectivity inside the minimum historically active family required by #1685.

## Same-output-type historical holdout

The repository chronology supplies a useful holdout that does not change output type.

The p57 center relation was committed first:

- `eb817050b783df679cba8db58151630ac4ee5251`, 22:32:38 UTC: DIVINITY105 center13 bridge;
- `39ad7eb96d4841c007c6aae903ad4449f2f3982e`, 22:41:59 UTC: p57 reconstructs the bracket from EMERGE83 / DIUINITY105.

At that stage the address rule was already:

```text
whole-word GP0 -> zero-based p50 cell
```

The p56 cross-page anchor appeared later:

- `732677072a924e25ed816b947f6e88b154656e88`, 23:16:38 UTC.

Without changing word number, origin, table, or output type, solved p56 `PILGRIM=82` lands immediately outside the already selected `EMERGE=83` inner boundary, on the outer duplicate token `3L`. Together they select the forward nested pair `82/83` whose mates are `128/127` and whose center is the already selected `DIUINITY=105`.

This is historical repository holdout evidence rather than a newly blinded test in the current invocation, but it directly answers the issue's request for a previously unused source relation under the same convention.

## Downstream type choices remain separate

The familywise evidence changes sharply when table **values** are interpreted.

### Solved p57 word-to-word values

The complete p57 GP0 word graph has 17 distinct source addresses. Allowing either base59 or base60, 36 of the 256 exact tokens can decode to a p57 word sum. The observed table places hit-capable tokens at 5/17 addresses.

The exact without-replacement tail for at least five is **0.0721127149**. This is modest enrichment, so the named semantic edges must not be multiplied as independent confirmations. Existing control: `im-results/lp2-p57-wordgraph-multiset-control.md`.

### Unknown-page rune-offset receivers

The all-page receiver census keeps the GP0 address fixed and charges both radices and every rune-bearing unknown page. Under strict complete-word parsing:

- base59: 399 typed candidates, two closures, p30 and p38;
- base60: 399 typed candidates, one closure, p0;
- exact signed-adjacent boundary crossings occur on ten base59 pages and five base60 pages;
- only **(base60,p0)** has both a typed closure and a signed-adjacent exact boundary crossing.

This is a strong finite downstream discriminator, but it was discovered after the navigation grammar and remains conditional on interpreting table values as page-local rune offsets. See `im-results/lp2-2016-receiver-familywise-census.md`.

### Direct physical-page receiver

A separate finite holdout uses solved p57 GP0 values that fall in the unknown physical-page range. Across eight distinct page numbers and both radices, the only typed closure is `WITHIN=38 -> p38 -> base59 -> signed FOUND -> end53`. This is fresh source-constrained navigation evidence, while direct GP0-to-physical-page output remains unauthenticated. See `im-results/lp2-p57-within-p38-found-closure.md`.

## Completion fork

#1685 therefore resolves on the positive branch for the **address convention alone**:

> Treat canonical whole-word GP0 -> zero-based p50 cell as a constrained navigation primitive for subsequent typed tests.

Do not promote a universal base59/base60 reading, page receiver, rune receiver, key stream, or plaintext from this result. The complete p57 value graph shows why downstream semantics must continue to be charged separately.

A stronger future result would freeze one output type on solved controls and predict an untouched unknown receiver, which is the scope of Director #1686.

## Reproduction

SFT: `sims/lp2_gp0_address_familywise_audit_sft.cjs`

Windows Node22: [PASS 44423976442](https://github.com/FlareZ123/liber-primus/actions/runs/44423976442), commit `0c2a6db7a308bb165e83170ba3ab679e26a057f1`.
