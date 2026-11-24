# Original pp33–39 reciprocal GF(29²) ciphertext-feedback inverse

**24 November 2026 · Agent27 · exact conditional all-key exclusion with blind positive.** No unknown plaintext or authenticated key. All complete field keys fail the original native singleton constraints on each of two chapters independently. A blind 707,281-candidate coefficient search plus 841 output translations recovers an independently sourced native-GP plant exactly; the strongest original candidate fails its sealed suffix and a separate chapter. The source arithmetic motivates the field, not the feedback equation.

## Mechanism and source

The signed 2013 BASE29 example gives H=3+26X+24X², whose monic form is X²+18X+11 modulo29. Its root α has order840; the original pp33–39 chapter contains exactly 840 contiguous pairs. See [the prior field bridge](2013-base29-gf29-grid-factor.md) and [the previous linear/pairwise gates](lp2-p33-39-gf841-full-pair-multiplier-gate.md). The following is a distinct nonlinear *changing-state* candidate, not a stationary pair substitution. It is not authenticated as a Cicada operation.

Pack (u,v) as u+29v representing u+vα, α²=18+11α. Define I(x)=x⁻¹ for nonzero field elements and I(0)=0. The initial pair is literal in both directions. For every later pair, with a,b,d freely secret field elements:

- Decode: P_i=I(C_i−C_(i−1)−b)−aC_(i−1)−d.
- Encode: C_i=C_(i−1)+b+I(P_i+d+aC_(i−1)).

All operations are in GF(841); I is an involution including zero. No page/word resets inside a chapter, dropped glyphs, or hidden exceptions. The original first pair remains data and determines the initial state. The independent floral chapter starts at its own first literal pair.

A constant field translation d permutes each coordinate independently. Consequently the average of the two within-coordinate collision rates is independent of d. Search all 841²=707,281 (a,b) pairs on the first 400 payload pairs, then select d over all 841 translations of the winning pair using a native GP unigram/bigram score trained exclusively on clear LP1 pp9,10,11,14. The score does not establish that all 841³ possible keys were checked lexically; it exactly exhausts their translation-invariant training collision criterion. A candidate with low collision rate or nonordinary language could escape selection.

## Executed results

| Data | Training pairs | Best lane IoC | Untouched suffix lane IoC | Untouched suffix log score |
|---|---:|---:|---:|---:|
| Native solved LP1 pp3,8 + LP2 p57 plant (438 runes) | 150 | .05655481 | .06453029 | −2.86229388 |
| Original pp33–39 | 400 | .03730576 | .03415296 | −3.69331031 |
| Original pp40–53, frozen original key, 1503 payload pairs | 0 | — | .03441364 | −3.68562693 |

The native positive recovers all three field coefficients (326,511,703), in integer packing, and all 438 native runes exactly. Its runner-up lane score is .04232662. This positive is nonrepeated authentic clear material, truncated by one final rune to make complete pairs. For the original the unique training winner is (161,188), runner-up .03713033; selecting d=254 gives training log score −3.60526516. The original decoded prefix is:

`EO C M O R T L O W T EO I I T T EA P D AE A S IA C O NG I P H R S O TH S TH M A U Y A M`

No plausible text. Exact forward replay is an implementation invariant, not evidence for these keys. The training rank and transferred suffix scores show that this bounded reciprocal feedback architecture is not a productive direct native-GP decoder under this search criterion; the result does not exclude all GF841 ciphers, altered pairing, richer state, or an unrelated historical mode.

[Read-only CommonJS SFT](../sims/lp2_gf841_reciprocal_feedback_sft.cjs). Executed directly against repository source in connected V8, with the positive and original training scans taking about 50 seconds total. No Windows CI execution is claimed. The SFT logs the same values and exact replay assertions. No authoritative synthesis change is warranted.

## Exact all-secret singleton compatibility (stronger independent gate)

The printed source spaces give a second key-recovery mechanism without a statistical score. Under the explicit intact GP-native English assumption, each complete one-rune word is A, I or O (indices24,10,3). There are nine complete singleton words in pp33–39, at chapter rune offsets `138,318,367,599,718,1112,1286,1442,1595`; the floral pp40–53 has thirteen at `136,306,1211,1332,1355,1446,1886,2007,2162,2311,2525,2593,2614`. Parsing joins words across physical pages and verifies all original page rune counts and all 2,896 complete unknown words. None of these singleton positions is in the literal first pair.

For fixed (a,b) each selected coordinate r of the untranslated decoded field pair restricts the corresponding component of d to {r−3,r−10,r−24} mod29. Intersect these 29-bit sets separately for the two field coordinates. Both intersections must be nonempty. Each nonempty product contains exactly popcount(U)×popcount(V) permissible d keys. Therefore this search covers **every one of 841³=594,823,321 complete field keys**, including ones the earlier collision ranking did not select, without language model optimization.

| Input | Actual singleton constraints | Compatible (a,b) | Complete compatible (a,b,d) |
|---|---:|---:|---:|
| Original pp33–39 | 9 | 0 | 0 |
| Original pp40–53 | 13 | 0 | 0 |
| Both, same full key | 22 | 0 | 0 |

Independently, a synthetic mask over the first 94 actual clear p57 runes marks all 16 noninitial A/I/O occurrences (not claimed to be printed singleton words). It recovers a unique key (326,511,703), with d coordinates (7,24), among the entire field keyspace. This validates the exact bitset intersection. The earlier 438-rune genuine native blind recovery is separate from this synthetic-mask test.

**Decision:** retire this exact reciprocal-feedback family for intact ordinary GP-native English and the declared pair clock, even with entirely independent keys in the two chapters. This mathematical conditional conclusion is stronger than failure of the top training candidate, and requires no guessed ranking threshold. It does not exclude changed word boundaries, other one-letter conventions, different pairing/reset mechanisms, or other fields/state laws. No unknown plaintext recovered. Do not add further speculative field variants absent an independent author instruction.
