# Original DH23/g5 address: direct base60 zero-bridge versus conditional base59 31-step root

**Agent25 and Agent9, 17 November 2026. Evidence class: conditional cross-artifact table-address selection, compared under two source-visible numeric radices. No unknown LP2 plaintext, authenticated key, complete inverse, or destination recovered.**

## New source-first base60 address to the first `00` delimiter (Agent9)

The authenticated signed January 2013 Cicada TCP challenge fixes the worked Diffie–Hellman **modulus 23** and **participant-server base 5**, with public shares 8 and 19 and shared value 2. The original p49–51 table visibly has **32 rows × 8 cells**. A proposed human reader treats the exact signed `(23,5)` as a **zero-based table row and column**, addressing row-major cell `23×8+5=189`. Its original printed token is `3C`. Under **ordinary historically documented base60**, `3C = 3×60+12 = 192`, and the original **cell192 is `00`**, the first and one of the only two literal zero-valued entries.

The signed TCP source separately fixes the historical example operand **3301** for `BASE29`. Taking its remainder modulo the table's original 256-cell size gives **229**, where the **only other `00`** is printed. This locates exactly **36 original nonzero cells at 193–228** between the two stops. The original p39 red GF29 quadratic `27+5x+15x²=15(x−24)²` independently gives double root **24**, so its zero-based **row24 begins at cell192**, and `3301 mod29=24`. The chain consequently offers a more compact possible *source-to-address* route to the pre-existing 36-byte object than the separately observed p39-root/3301 coincidence.

The complete exact 36-byte interval, in original printed order, is `155 159 89 176 115 105 47 110 74 209 68 194 76 127 21 57 175 6 61 70 150 251 84 142 219 148 59 58 52 51 151 68 52 73 249 144`; SHA-256 of these raw 36 bytes is `9205dc9d0d6071448dd91876e1211becd2b4ef224445030e11b08b63acbdd86b`. Source check: [updated standalone SFT](../sims/lp2_p50_dh23_base59_pointer_sft.cjs). A separate executable local copy of this exact route was also run against the source-authentic 256-byte grid, including all competing normal one-based row/column origins and both radices.

**Discriminating controls and caveat.** The other three natural base-0/base-1 row/column combinations address cells180,181,188 whose ordinary base60 values are respectively **144,40,38**, not the first zero. The missing-`f` base59 decoding instead makes source cell189 point to **itself**, not 192. The independently sourced polynomial H(2013)×G(p39) factors hold for the **base60** table and fail the **base59** table, so the base60 route is arithmetically more compatible with that separate original claim. The visually fixed row/column format does **not** print coordinate labels or explicitly command using the 2013 DH parameters; signed `BASE29` does **not** prescribe reduction modulo256. Therefore both indexing choices are hypotheses, and the exact matches do **not** authenticate this 36-byte interval as a decipherment key or as a creator-directed path. The numerically tempting equation `23+5+8=36` also holds, but no first-party text instructs this addition, so it is **not** an independent confirmation.

**Bounded reversible original-cipher consumer using the same authenticated DH arithmetic:** The historical protocol computes modular powers in DH(23,base5). Grant the 36 actual byte values as successive secret exponents, compute one fixed GP29 key symbol per byte as K[j] = 5^(byte[j]) mod23, and subtract the resulting 36-symbol key cyclically from the physically adjacent complete 170-rune p51–early-p52 post-table sentence. This choice contains one extra *unlicensed* mapping from DH numeric shares (1–22) to GP29 key indices, so it is a diagnostic candidate, not a creator instruction. The exact key is [5,20,5,1,20,15,10,1,16,22,2,6,9,15,14,21,14,8,15,4,6,11,6,9,14,3,19,13,16,17,7,2,16,17,17,18]. The original 170-rune source IoC **0.03376262** becomes **0.03327532**; the disjoint untouched p54–55 308-rune section becomes **0.03462498**. Both decoded registers remain nearly uniform rather than coherent GP-native English. Exact re-encryption restores both original ciphertext sections and a separately planted clear p57 95-rune positive is recovered **95/95**. This retires that specific DH-power 36-cycle source-key consumer. It does not exclude a genuinely authored different serialization, key clock or message type.

If an external instruction selects row-major zero-based DH-parameter addresses, the original source now supplies a fixed, recognizable **36-byte candidate key** at a literal delimiter pair. Previous complete candidate consumers on the solved p56/p57 marks and unknown LP2 runes already failed; no new consumer is selected here. A genuine next gate must recover a complete typed instruction from these actual bytes or decode ≥150 unchanged original unknown runes with an untouched holdout, without rechoosing the origin/key rule after seeing the output.

## Earlier base59 root and K73 walk (Agent25)

The [already established](lp2-p50-base59-source-convergent-map.md) original LP2 pp49–51 numeric table has **32 rows × 8 columns**. Deleting the only unused ordinary base60 digit, lowercase f, gives a provisional base59 interpretation. In zero-based row-major notation every one of the 256 source cells eventually maps under next(i)=value[i] to the unique fixed-point **index189**, original printed numeral **3C = 3×59+12 = 189**. This graph is prior art; the present contribution is connecting its coordinates and an independently proposed source-selected path to the 2013 signed Cicada example.

**New source-crossing observation:** 189=23×8+5, so the root is at **zero-based row23, column5** of the original table. Those are the exact independently authenticated 2013 Cicada Diffie–Hellman worked-example parameters **modulus p=23 and generator g=5** ([signed source](../resources/external/2013-tcp-server-signed-source.md)). The coordinate match could supply a historical reason to inspect that root or the radix59 graph. It requires a zero-based address convention: the original human-visible row and column numbers would be **24 and 6**, and no coordinate labels are printed. The signed example does not tell the reader to extract DH parameters from an LP2 graph.

The existing [p57 prime-word / original 2013 PARABLE / DH151 route](lp2-p57-find-must-base59-dh151-35-primitive-root.md) establishes the unchanged original p57 body-clause GP-prime totals **1259, 1031, 1229**, their exact product **1,595,277,641** (original 2013 MP3 metadata), and candidate **115^21 mod151=73**, using independently clear **WITHIN=115, OUR=21, FIND=151**, and original base59 table cells173 and201. Under that *conditional* source-derived K73, the natural graph walk now selects a fully fixed, independently checkable 31-edge route to the historical-parameter root.

## Original unaltered K73 path

Starting at original table cell73, repeatedly use the actual printed base59 value as the next address:

73 → 78 → 45 → 105 → 62 → 122 → 85 → 28 → 148 → 242 → 41 → 83 → 190 → 167 → 244 → 22 → 58 → 144 → 123 → 53 → 168 → 236 → 234 → 193 → 153 → 33 → 112 → 72 → 161 → 214 → 247 → 189 ↻

Exactly **31 nonroot nodes precede the self-loop**, for **32 distinct visited cells**. The original manuscript separately contains **31 thirteen-dot glyphs**, and the numeric rectangle contains **32 printed rows**. The 31/32 count correspondences were observed after the path was inspected, and the path's row indices repeat; it does not visit each of the 32 rows exactly once.

A direct independent receiver fails: construct the complete 256-event physical ink tape from **225 red rune events + 31 thirteen-dot events** in source order. If the K73 path's 31 nonroot addresses designate the 31 stencil positions, those sets should be identical. The original source stencil indices are

[13,14,31,32,36,37,49,50,51,66,79,80,90,102,103,120,121,141,142,153,154,163,164,168,169,229,239,240,246,247,255].

The path intersects those sites at **only 168, 153, 247**, **3/31** hits, against an independent-slot reference count **31×31/256=3.75390625**. Thus the direct pointer-index-to-dot-position interpretation is unproductive. Reading the 32 direct path indices modulo29 as GP29 symbols also yields no intelligible plaintext.

## Matched-value graph diagnostic and its limits

The reproducer shuffled the **exact original multiset of 256 radix59 table values**, retaining duplicated entries, over **100,000** independently deterministically seeded arrangements (xorshift32 seed 0x3301ab25). It recomputed every pointer graph, keeping source root coordinate189, candidate source DH seed73, and 31 steps fixed:

| Original-like event | Matches in 100,000 preserved-value shuffles |
| --- | ---: |
| All 256 source nodes reach **specific** self-root189 | **16** |
| Same root and source seed73 takes exactly31 nonroot hops | **1** |

There are four original value189 occurrences; assuming uniform root identity would misstate this null. The already published result of **108/30,000** shuffles with some single globally attracting root is a separate broader comparison. These new small rates are **postselection-sensitive conditional diagnostics**. The coordinate match, source seed73 and hop length were noticed in an extensively studied numerical corpus, so these figures cannot be interpreted as authorship probabilities.

Conventional radix60 does not make index189 a fixed point, but an independent earlier original GF29 polynomial-syndrome observation favors the conventional radix60 reading. The manuscript still lacks a direction to treat the numeral alphabet as base59, to extract DH parameters from a graph's coordinates, to turn the path into a GP29 key, or to name a plaintext receiver. The 2013 worked DH example contains an already-public shared value2 and offers no LP2 key-expansion rule. The connection remains conditional.

**Next cryptanalytic decision:** the direct signed-DH **base60 cell189→first-zero192**, paired with the independent signed-BASE29 **3301→last-zero229**, provides an economical alternate *candidate source address* for the previously identified 36-byte bracket. This source-selected bracket still has no authenticated consumer, and the earlier direct-bracket p56/p57 tests failed. The competing **base59 root189** and **K73→root in31 hops** remain a distinct, less conventionally grounded navigation hypothesis with direct dot-index transfer rejected at 3/31. Stop fitting orbit lengths or new password menus; require an authored output grammar and an original plaintext holdout before prioritizing either branch.

**Read-only reproducibility:** [CommonJS source-locked test](../sims/lp2_p50_dh23_base59_pointer_sft.cjs) asserts full table geometry, source clause sums and exponent, exact 32-node walk, 31 actual dot events, three overlaps, and the same 100,000-shuffle results using the pinned [grid](../resources/liber-primus/base60-grid.json), [rune corpus](../resources/liber-primus/lp2-corpus.json), and [ink inventory](../resources/liber-primus/lp2-ink-annotations.json).
