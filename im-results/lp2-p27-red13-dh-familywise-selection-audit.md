# Familywise audit of the p27 red13 / DH23 radix transducer

**Agent50, Director Issue #1636, 18 November 2026. Evidence class: independently reproduced source-family and exact-token-multiset calibration. No unknown LP2 plaintext, KDF, or GP29 receiver is recovered.**

## Decision

The p27 red13/DH23 chain survives a broader familywise audit. Within the frozen source family, the complete local source selection remains unique on the original manuscript. A conservative exact-token-multiset null that allows both table origins, both frozen radices, both pointer directions, and every signed public DH value as a step count has an estimated union upper rate of **7.71712e-6**, about **1 in 129,582**.

This is materially weaker than the earlier fixed-assignment post-discovery figure of about 1 in 200 million, as expected once family selection is charged. It remains exceptional enough to retain the construction as a strong local DH/base59 structural mechanism.

The plaintext claim remains open. A later p28 center-line route now supplies an LP2-native DH23 selector, so the former historical-handoff objection is superseded. The signed 2013 artifact still defines no post-DH KDF or data cipher, and the familywise rate below continues to apply only to the p27/table construction.

## Source family rebuilt independently

The visual rule is frozen before arithmetic: red rune spans of length at least13 immediately followed by a red 13-dot mark. The original ink annotations give exactly six objects:

| page | red length | GP-prime sum | prime ordinal |
| ---: | ---: | ---: | ---: |
| 0 | 13 | 662 | composite |
| 3 | 16 | 742 | composite |
| 7 | 14 | 766 | composite |
| 23 | 16 | 786 | composite |
| **27** | **19** | **1109** | **186** |
| 53 | 51 | 2262 | composite |

Only p27 admits the whole-span prime-ordinal operation.

For each object, the audit applies the four already declared interpretations of marker position13: one-based forward, zero-based forward, one-based reverse, and zero-based reverse. The residual is the traversal-exclusive count after the marker, length minus 13. The selected rune contributes its GP prime. The quotient statement rank divided by selectedPrime equals residual and the forward statement selectedPrime times residual equals rank are the same equality and are counted once.

There are **22 defined marker variants** across the six objects. Exactly one satisfies both source closures: p27, one-based forward position13, rune I with GP prime31, residual6, product186 equal to the whole-heading prime ordinal, and flat table cell186 = 0J = length19.

## Coordinate-origin family

The same source-selected pair (31,6) is treated as a 32x8 coordinate under both declared origins. Zero-based gives cell254 token 39, whose base59/base60 readings are 186/189. One-based gives cell245 token 0u, whose readings are 55/56.

The token low digit9 supplies another independent orientation check. Only one-based forward heading position9 selects H with GP prime23. The derived base5 supplies a third check: only one-based forward position5 selects S with GP index15. One indexing convention serves all three selectors.

## Complete signed-DH pointer family

The signed worked example fixes public values (23,5,8,19,2). With the visible eight-column table, only g=5 and shared=2 fit as columns on row23, forcing addresses189 and186.

The audit allows every signed public value {2,5,8,19,23} as a possible first-arrival pointer step count, both directions, and both frozen radix maps. On the original table exactly one family member hits: base59 from186 to189, first arrival at8 steps. First arrival matters because cell189 is a base59 fixed point and later counts would otherwise over-credit the same path.

## Four circumference depths

The p50 rectangle has four nondegenerate complete shedding depths with perimeter sizes 76,68,60,52. Only depth2, equal to the signed shared value, contains both addresses186 and189. Their directed arcs are45 and15, so the orientation-free shortest distance is15. This is the client discrete logarithm because 5^15 mod23 =19 and 8^15 mod23 =2.

This geometry is deterministic once the signed tuple and p50 rectangle are chosen. It is part of the chain and is not multiplied as an independent random probability.

## Exact-token-multiset familywise null

The null preserves the exact 256-token multiset. Source-side red geometry and runes stay fixed. Since the 22-variant source family selects one p27 closure before table-token randomization, a null trial must first supply cell186 = 0J, probability 1/256, and one of the two coordinate-origin cells = 39, probability 2/255 for each origin after removing 0J.

Conditioned on each origin separately, 300,000 deterministic exact-multiset trials randomize the remaining tokens and allow the full pointer family.

| coordinate origin | any pointer-family hit | rate | exact winning base59 forward hop8 |
| --- | ---: | ---: | ---: |
| zero, cell254 | 34,557 / 300,000 | 0.115190 | 4,083 |
| one, cell245 | 41,009 / 300,000 | 0.136697 | 3,811 |

Using a union bound over the two coordinate origins gives (1/256) x (2/255) x (0.115190 + 0.136697) = **7.71712e-6**, approximately **1 in 129,582**.

This is deliberately conservative. It does not require the original endpoint token 3C to be a base59 fixed point, even though that is part of the observed chain. It also allows reverse pointer direction and every signed public value as a step count.

The figure is a matched-family scale diagnostic, not an authorship probability. The source family and DH interpretation were developed after extensive LP2 study, so unrecorded researcher degrees of freedom remain outside any finite calibration.

## Historical scope

### Later p28 operation selector

After this audit, the conditional p57 `FIND→28` route exposed an independent LP2-native DH selector. P28 line6 uniquely begins with `DH`, has23 runes, and ends with the selected five-rune word at positions19..23. These directly give `p=23, g=5, a=6, B=19`; standard DH uniquely gives `b=15, A=8, K=2`. Both nested circumferences of that word sum to2 modulo23. This removes the need to import the tuple solely from the historical worked example, but it does not alter the p27 table-null calculation or create a payload receiver.



The signed 2013 TCP-server specification contains **one** worked DH example, the DH23 tuple used here. The March 2013 DH3301 exchange is a participant transcript. Its surrounding exchange is unsigned, and the protocol explicitly lets the participant server choose its base and secret. Its modulus3301 and field values do not fit the 32x8 coordinate grammar.

## Director fork

The complete local chain remains exceptional after charging the declared source and table families. Retain p27 as the unique red13 prime-ordinal/local-product closure, zero-based (31,6) to token39 as the original-table DH transducer, base59 as the unique pointer interpretation with first arrival at8, and shared2 circumference shedding with distance15 as a coherent local closure.

Keep the limitations explicit: no first-party source says to transfer the 2013 DH example into LP2, the construction uses both numeral readings at token39, the signed protocol defines no KDF or encrypted payload receiver, and no unknown LP2 plaintext follows.

The next productive decision is a source-visible receiver or a blind untouched prediction. Further arithmetic elaboration of the same DH tuple should wait.

Reproduction: sims/lp2_p27_red13_dh_familywise_audit_sft.cjs.
