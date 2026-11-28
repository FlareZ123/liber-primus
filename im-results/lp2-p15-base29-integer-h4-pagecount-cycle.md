# BASE29 page-count self-indexing isolates p6–p9; p15 integer-H supplies a secondary p6↔p8 route

**Agent21, 28 November 2026. Classification: source-exact structural/navigation candidate with finite manuscript-wide controls. The direct repeating-additive consumers tested here are negative. No unknown LP2 plaintext, authenticated payload key, KDF, or continuation endpoint is recovered.**

## Decision

The authenticated 2013 Cicada TCP material contains a literal worked command

```
BASE29 3301 -> 3QO
```

and independent p15 work already established two source facts before this investigation:

1. the red p15 grid cell is **3299**, with `3299 + K = 3301` under the reconstructed `K=2`;
2. the 16-number p15 square has an authored red-origin spiral traversal
   `3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516`,
   and its q=4 blocks admit the repository-canonical outside-in
   `H4(a,b,c,d)=(a-d,b-c,b+c,a+d)`.

Earlier p15 analysis reduced these numbers modulo29 before applying H. This report instead keeps the **ordinary signed integers**, applies the same H4 to each four-number spiral block, and only then serializes every integer in ordinary base29.

The strongest new result is simpler and genuinely radix-specific. Express every original physical-page rune count in **base29**. Physical **p6,p7,p8,p9 are the manuscript's only four-page run whose leading base29 digit equals the physical page number on every page**:

```
p6: 196 = 6M_29
p7: 208 = 75_29
p8: 255 = 8N_29
p9: 268 = 97_29
```

Across every radix 2..60, **base29 is the only radix that produces any self-indexing run of length four**; every other radix reaches length at most two. Under an exact fixed-marginal permutation of the 56 observed page-count values, the chance that positions p6..p9 receive counts from their respective base29 quotient bins is 0.0004574. This is a post-discovery conditional diagnostic rather than an authorship p-value.

The p15 full-integer H serializer supplies a compatible but weaker secondary structure. Its four q-blocks have digit counts **[8,9,10,11]**; applying the same signed-integer H / digit-count operation to four-page count windows gives the unique cycle `6↔8` and fixed point `7`, exactly on the manuscript's only consecutive red-bearing triple p6,p7,p8. However, that digit-length motif persists across a broad nearby radix interval, so **the cycle is not itself evidence selecting base29**. The self-indexing page counts above are the base29-specific holdout.

The most literal key interpretation is rejected: the six-digit p15 difference arm tiles p6's post-red body exactly 19 times, but all four signed/unsigned additive variants are nonlinguistic and recover zero long solved-register words.

## P15 integer H4 / BASE29 serializer

The four authored q=4 spiral blocks give:

| block | integer H4 | ordinary BASE29 strings | total base29 digits |
|---|---|---|---:|
| 1 | `[5,2,6594,6593]` | `[5,2,7OB,7OA]` | **8** |
| 2 | `[66,20,6536,6510]` | `[28,K,7MB,7LE]` | **9** |
| 3 | `[680,200,5876,5624]` | `[ND,6Q,6SI,6JR]` | **10** |
| 4 | `[-2696,-498,1914,6336]` | `[-35S,-H5,280,7FE]` | **11** |

The signed strings are ordinary positional base29; the minus sign is metadata rather than a radix digit. For controls, the same routine reproduces `3299=3QM` and the signed-source `3301=3QO`.

Many individual digits can be named by the currently reconstructed DH-like state. For example `ND=[23,13]`, `6Q=[6,26]`, and `280=[2,8,0]`. Those labels are **not the evidence used here**: existing repository work shows that the small reconstructed state algebra saturates much of Z29, so post-hoc state naming is cheap. The discriminating object is the ordered integer/radix geometry and its manuscript-wide page-count consequence.

## Presentation charge

Freeze only the visible p15 spiral values. Charge:

- all **3** perfect pairings of four entries into two difference/sum arms;
- both traversal directions;
- all **16** cyclic starts.

That is **96** presentations. Ask only whether the four q-block BASE29 payload lengths are four consecutive increasing integers.

Exactly two presentations pass:

```
outside pairing, forward, rotation0 -> [8,9,10,11]
adjacent pairing, forward, rotation1 -> [8,9,10,11]
```

The independently authored red origin fixes **rotation0**. Under that source origin, the canonical outside pairing is therefore the sole passing presentation among the three pairings and both directions.

This is a finite post-discovery specificity charge, not a probability that the author intended the mechanism.

## Base29-specific page-count self-index

The original p0–p55 rune counts have a stronger property that does not depend on state naming or plaintext grading. For each page, write

```
rune_count(page) = 29 * quotient + remainder.
```

Exactly four consecutive pages have `quotient = physical page number`, and they are:

| physical page | rune count | base29 | quotient | remainder |
|---:|---:|---|---:|---:|
| **6** | 196 | **6M** | 6 | 22 |
| **7** | 208 | **75** | 7 | 5 |
| **8** | 255 | **8N** | 8 | 23 |
| **9** | 268 | **97** | 9 | 7 |

There are **no other** self-indexing pages at base29 outside this run.

A radix charge over every integer base **2..60** is especially discriminating. Only base29 has a maximum self-indexing run of length four. Bases 13,14,16,24 and 55..60 produce maximum runs of only length two; every other tested radix produces no run of length two or more.

A separate exact fixed-marginal control keeps the complete multiset of the 56 observed page rune counts but randomly reassigns those counts to page positions. Counts fall into base29 quotient bins 6,7,8,9 with multiplicities `[3,7,6,32]`. Therefore the exact probability that four distinct reassigned counts land in the required bins at fixed positions p6,p7,p8,p9 is

```
(3*7*6*32) / (56*55*54*53)
= 0.00045740423098913663
≈ 0.04574%.
```

Summing the fixed-position probabilities for every possible four-page self-index start gives an expected **0.00048055** four-page runs per random reassignment. These values are conditional diagnostics after discovery, not calibrated probabilities of author intent.

The four base29 low digits are `[22,5,23,7]`. Applying the same outside H4 gives

```
H4([22,5,23,7]) mod29 = [15,11,28,0].
```

Those residues admit current state labels, but the labels are deliberately not used as the evidence because the reconstructed state algebra is dense. The source-exact facts are the self-indexing run, radix uniqueness, and its location on p6–p9.

## The same operation on original page counts

For each physical start page `s=0..52`, define:

```
C_s = [rune_count(s), rune_count(s+1), rune_count(s+2), rune_count(s+3)]
T_s = H4(C_s) over signed integers
F(s) = total number of ordinary BASE29 digits in T_s
       (minus signs do not count as digits)
```

Three consecutive windows are:

| start | page counts | integer H4 | BASE29 | F(start) |
|---:|---|---|---|---:|
| **6** | `[196,208,255,268]` | `[-72,-47,463,464]` | `[-2E,-1I,FS,G0]` | **8** |
| **7** | `[208,255,268,263]` | `[-55,-13,523,471]` | `[-1Q,-D,I1,G7]` | **7** |
| **8** | `[255,268,263,273]` | `[-18,5,531,528]` | `[-I,5,I9,I6]` | **6** |

Exhausting all 53 valid physical p0–p55 starts gives:

- unique nontrivial 2-cycle: **6 ↔ 8**;
- unique fixed point: **7**.

The cycle alone does not distinguish the outside pairing from the cross pairing; the p15 authored-origin staircase above is what selects the canonical outside-H branch. The adjacent pairing has no 6↔8 cycle.

**Radix caveat:** the p15 `[8,9,10,11]` digit-length staircase occurs for bases27..43, and the p6↔p8/p7 page-count motif occurs for bases24..47. Therefore the digit-length dynamics are useful for structural routing only after BASE29 has been selected independently; they do not authenticate radix29. The self-indexing run in the preceding section is the radix-specific result.

## Independent source geometry at the selected pages

The ink annotation corpus supplies a separate holdout. Among unknown physical p0–p55, the red-bearing pages are sparse, and the **only consecutive triple** is:

```
p6, p7, p8
```

That is exactly the `6 ↔ 8` interval plus its fixed point.

The landing page p6 also has **196 original runes**, and

```
196 = 6M (base29) = [6,22].
```

The low digit **22** is unique as `rune_count mod29` among p0–p55. Under the currently reconstructed state it equals `p-1`; the high digit equals the physical page number6 and the historical exponent `a=6`. Again, the uniqueness of the source count is factual; the state labels are interpretation.

These facts make the page-count map more useful as a candidate human navigation mechanism than as another bag of state equalities.

## Direct cipher-consumer gates

The serializer does **not** license arbitrary body-key fitting. Two bounded direct interpretations were tested and rejected.

### Fixed-width 48-rune p15 keys

Two deterministic 48-rune tapes were constructed:

1. the sixteen original p15 spiral integers as three base29 digits each;
2. the sixteen full-integer H outputs reduced modulo `29^3`, serialized as three base29 digits each.

Phase0 cyclic addition/subtraction was applied to the p15 post-red body and p16. The solved LP1 reference has **782/811 = 96.4%** dictionary-register support under the same native encoding. These candidates produce only isolated short-word accidents and no coherent plaintext.

### The six-digit arm on the exactly tiled p6 body

Concatenate the **second difference coordinate** from each p15 q-block:

```
2 | K | 6Q | -H5
```

Its unsigned base29 digits are:

```
[2,20,6,26,17,5]
```

and preserving the sign of the final integer segment modulo29 gives:

```
[2,20,6,26,12,24].
```

The p6 red span ends at rune offset82. The remaining body is exactly:

```
196 - 82 = 114 = 19 * 6
```

so this is a particularly strong direct receiver: no phase, padding, receiver length, or repeat count needs to be fitted. Test both digit conventions and both global additive signs at phase0.

| key convention | sign | trigram mean | solved-register long words |
|---|---:|---:|---:|
| absolute digits | − | −3.55265 | 0/16 |
| absolute digits | + | −3.63934 | 0/16 |
| signed-segment digits | − | −3.57381 | 0/16 |
| signed-segment digits | + | −3.58932 | 0/16 |

Untouched p6 post-red ciphertext scores **−3.52572**. Solved p57 scores **−2.07669** and has **11/12** long words in the solved-register vocabulary. Every candidate is worse than the ciphertext itself.

**Decision:** reject the phase-zero repeating-additive use of this six-digit BASE29 arm on the exactly tiled p6 post-red body. Do not rescue it by searching phases, resets, alternate segmentation, or tuned signs.

The analogous p15 block keys of lengths 8,9,10,11 were also applied directly to p8,p9,p10,p11 under both additive signs. The long-word support is 0/42, 1/49, 0/50, and 0/46 respectively at best, so the page staircase is not a simple periodic additive key schedule.

## Interpretation and next decision

The strongest supported interpretation is **base29 page-count structure plus a compatible navigation/serialization candidate**, not decryption:

```
signed 2013 BASE29 clue
        +
authored p15 red-origin spiral
        +
canonical integer H
        |
        v
BASE29 page counts: p6=6M, p7=75, p8=8N, p9=97
        |
        +--> unique four-page self-index run in bases2..60
        |
        v
p15 H digit-length staircase [8,9,10,11]
        |
        v
same H-length operation on physical page counts
        |
        +--> p6 <----> p8
        |      p7 fixed
        |
        +--> unique consecutive red-page triple
```

This is a materially different route from repeated GP29 key fitting because the strongest holdout is a **literal radix-29 representation of original page counts** with no plaintext or key fitting. A useful successor should ask what original object on p6/p7/p8 consumes the navigation result or the signed integer arms without converting them into another arbitrary periodic key.

In particular, the next experiment should demand a fresh source-selected consequence on p6/p7/p8 geometry, punctuation, or an independently bounded receiver before any language score is inspected.

## Reproduction

- Main serializer / staircase / page-count-cycle SFT:
  `sims/lp2_p15_base29_integer_h4_serializer_sft.cjs`
- Exact p6 six-digit consumer rejection:
  `sims/lp2_p15_base29_p6_arm_consumer_sft.cjs`

Both read only the canonical repository corpus, transcription, ink annotations, and solved reference. The scripts assert the exact source values, presentation controls, manuscript-wide page-count map, and negative consumer gates.
