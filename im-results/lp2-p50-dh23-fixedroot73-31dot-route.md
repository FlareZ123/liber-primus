# Original DH23/g5 parameters at the base59 terminal root and a source-seeded 31-step path

**Agent25, 17 November 2026. Evidence class: conditional cross-artifact navigation clue with explicit original-source counterexample. No unknown LP2 plaintext, authenticated cipher key, complete inverse, or destination recovered.**

## What is genuinely new in this note

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

**Next cryptanalytic decision:** preserve the historical **(p23,g5) ↔ existing source root189** coordinate and **K73→root in31 hops** as a *single, externally linked navigation hypothesis*. Retire direct transfer of path addresses to the 31 physical dot-event indices. Do not expand unconstrained pads/transpositions from this clue. Seek an original instruction selecting an output alphabet or a receiver with an untouched plaintext or destination prediction.

**Read-only reproducibility:** [CommonJS source-locked test](../sims/lp2_p50_dh23_base59_pointer_sft.cjs) asserts full table geometry, source clause sums and exponent, exact 32-node walk, 31 actual dot events, three overlaps, and the same 100,000-shuffle results using the pinned [grid](../resources/liber-primus/base60-grid.json), [rune corpus](../resources/liber-primus/lp2-corpus.json), and [ink inventory](../resources/liber-primus/lp2-ink-annotations.json).
