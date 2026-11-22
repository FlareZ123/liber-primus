# Rank-28 successor symbols cannot directly carry stationary-key printable binary ASCII

**Agent 36; 22 November 2026. Evidence:** exact all-secret original-cipher negative for a specific, fully reversible, source-motivated binary transport; authentic source-language positive plant. **No unknown LP2 plaintext, key, or destination recovered.**

## The source-selected question

Original GP29 pages p0–p55 contain 12,956 printed rune symbols, with only 86 equal adjacent runes across the 12,955 book-continuous transitions. A nonrepeating successor has precisely 28 options, so a natural reversible candidate is to treat the current rune as a rank among the 28 alternatives to its predecessor: for adjacent GP indices \`a,b\`, define \`d=(b-a) mod 29\`, \`rank=d-1\` when \`d>0\`. The 86 true repetitions are explicitly skipped as exceptional events; no invented replacement value is inserted. The first rune of each independent source segment is a literal IV rather than a bit.

The historical 2013 Cicada puzzle demonstrably conveyed plaintext instructions using a tab/space binary ASCII channel. This motivates testing **binary ASCII** before fitting English word scores, but no source instruction identifies the rank transform, a bit map, or escape semantics in LP2. The most permissive simple model gives **an arbitrary hidden 0/1 assignment to all 28 ranks**. The mapping can be different independently in each of nine original illustrated chapters, and separately in each physical page for a stronger sensitivity test. Every eight possible octet phases and both bit orders are granted. There is no key search or assumption of balanced rank populations.

## Exact all-secret impossibility certificate

Every printable ASCII byte in \`0x20..0x7e\` has top bit \`b7=0\`; moreover, \`b6 OR b5=1\`, since otherwise the value is below32. For any proposed fixed rank→bit map, **every rank appearing at a byte's b7 position must map to 0**. Let \`Z\` be the set of these ranks observed in the unmodified ciphertext under a chosen source segment, phase and bit order. For every byte whose ranks at b6 and b5 both belong to \`Z\`, the byte must be below32 under *every possible secret bit assignment*. This necessary-condition failure is a proof, independent of any plaintext model or language score. Repeated symbols are skipped under the declared model.

The source calculations, with all 16 (8 phases ×2 directions) tested independently for each segment:

| Original source segment | Nonrepeat rank digits | Within-segment repeats | Lowest number of **necessarily nonprintable** complete bytes over 16 choices |
|---|---:|---:|---:|
| Entire unknown book | 12,869 | 86 | **1,607** |
| Visual chapter p0–2 | 724 | 4 | **68** |
| p3–7 | 1,138 | 6 | **141** |
| p8–14 | 1,719 | 9 | **214** |
| p15–22 | 1,892 | 10 | **235** |
| p23–26 | 1,009 | 11 | **112** |
| p27–32 | 1,419 | 13 | **160** |
| p33–39 | 1,667 | 12 | **207** |
| p40–53 | 2,989 | 18 | **372** |
| p54–55 | 304 | 3 | **15** |

Every source chapter fails at **every phase and bit order**, even if its 28 unknown bit labels are unrelated to all other chapters. On the whole-book register, all 28 ranks appear at octet b7 positions in each alignment, forcing every rank to zero, hence every resulting octet to NUL.

Granting a **completely different bit assignment and byte phase for each original physical rune-bearing page**, 49/55 pages still fail all 16 local alignments. Only short pages **p14, p22, p32, p49, p51, p55** retain at least one alignment where this *necessary-condition gate alone* is inconclusive. Those six are not positive or readable decryptions.

## Positive inverse control and decision

The [standalone Windows Node 22 CommonJS test](../sims/lp2_rank28_allsecret_binary_ascii_sft.cjs) uses the exact original \`resources/liber-primus/lp2-corpus.json\` and original chapter offsets. It also plants an authentic solved-p57 English instruction as ASCII. An independently chosen balanced secret bit map assigns 14 of the rank values to zero, 14 to one, produces a cumulative GP29 ciphertext with **zero adjacent repeats**, and exactly recovers the entire planted ASCII message through the proposed inverse. The all-secret necessary-condition gate accepts that positive.

**Decision:** Rule out *direct uncompressed printable ASCII* encoded as one stationary secret bit per predecessor-excluding GP29 rank across the book, visual chapters, or 49 individually keyed physical pages. These exclusions remain true regardless of all 28 binary label assignments. They do **not** exclude a non-ASCII or encrypted intermediate, variable-length coding, an active state-changing bit map within a chapter/page, alternate repeat-event semantics, or a fundamentally different rune→bit transform. The source has no clue selecting those extensions. Do not rescue the direct ASCII model by fitting another secret alphabet; an independent instruction or typed output is required for further cryptanalytic work.

This strengthens the earlier **fixed natural rank-to-base28 integer** and **fixed-width 5-rank/3-byte** negative results by ruling out an entire, *unknown-key*, memoryless binary-label class under an exact ASCII grammar. It does not claim the original author's intended operation.