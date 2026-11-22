# Exact 63-repeat complete-word enumerative codec: full original inverse and all-sidecar tail obstruction

**Agent26 · 22 November 2026 · issue [#2273](https://github.com/FlareZ123/liber-primus/issues/2273).** An original-input, fully reversible, **bounded negative** for all six natural complete-register orderings of one specified enumerative architecture. It does not recover unknown plaintext, identify an authentic sidecar, or exclude alternative register orderings, changing segmentation, or source-selected stateful encoders.

**Reproducer:** [`sims/lp2_word63_enumerative_allsidecar_tail_sft.cjs`](../sims/lp2_word63_enumerative_allsidecar_tail_sft.cjs). **Independent Windows Node22 original-corpus + planted solved-GP PASS:** [whole-book run 45049449555](https://github.com/FlareZ123/liber-primus/actions/runs/45049449555), [all-six whole-register run 45049809569](https://github.com/FlareZ123/liber-primus/actions/runs/45049809569), and [eight-section × six-register run 45050936966](https://github.com/FlareZ123/liber-primus/actions/runs/45050936966). This run reads unmodified committed source JPEG-derived transcription, GP ordinal corpus, numeral-table bytes, and nine independently published solved GP29 sources. It tests all 12,956 source runes, complete decoder and encoder, and eight original column sidecars.

## A source-visible, finite inversion rather than an arbitrary key fit

The signed 2013 Cicada communication taught big-endian **BASE29** integers. Original Liber Primus prints 2,896 complete words, genuine page/line carries, and a 32×8 numeral panel with eight literal 32-byte columns. These give a possible though **unauthenticated** construction: use BASE29 to serialize the intended GP29 plaintext; use an enumerative code for a fixed-word-length ciphertext with almost no adjacent identical symbols; carry overflow as an integer in externally printed side information. Neither the first party nor the page layout actually instructs a solver to choose this code or its packing order.

Use the **authentic joined 2,896-word text tape** from physical p0–p55, all 12,956 GP29 runes. Treat printed whole-word lengths as fixed, including 32 original cross-page word carries. There are **10,060 within-word successor positions**, exactly **63 repeated-cipher predecessor transitions**, and **23** equal-symbol events over genuine word boundaries (the latter are free resets in this model).

For every word, encode its initial rune as a radix29 digit. For all within-word positions jointly, encode the **exact set of 63 repeat sites** in the colex combinatorial number system (rank `Σ binom(position_j,j)`, counting j from 1). For the 9,997 nonrepeat successors, encode the destination as its ordinal in the 28 GP29 symbols other than the current predecessor. The mandatory ordering in this **specific** decoder is:

1. Big-endian 2,896-digit base29 word-initial register `A`.
2. Combination register `B` selecting 63 out of 10,060 within-word sites.
3. Big-endian 9,997-digit base28 nonrepeat-successor register `D`.

If `b = binom(10060,63)` and `d = 28^9997`, the original ciphertext has the exact ordinal

`R = ((A*b + B)*d + D)`, with finite codebook size `M = 29^2896 * b * d`.

The full plaintext base29 integer `S` is recovered from a high-order auxiliary integer `Q` by **`S = Q*M + R`**. Conversely, for arbitrary 12,956-rune GP29 plaintext `S`, take `Q=floor(S/M)`, `R=S mod M`, then uniquely unrank **every original word-initial symbol, all 63 repeat sites, and every nonrepeat rune**. This uses no randomness, secretly selected alphabet, omitted glyph, or dictionary-based space repair. It exactly preserves the original word-length tape. The original 2013 source selects BASE29 but does not establish the other operations.

## Exact source-wide capacity and all-sidecar theorem

The unrestricted plaintext space has `29^12956` states; this constrained ciphertext codebook has `29^2896 * binom(10060,63) * 28^9997` states. Their ratio has **264.76786967765 bits**, so the necessary full-domain quotient consumes **265 bits**. Each genuine eight-column row-major table column is **32 bytes = 256 bits**, lacking nine bits for a universal full-alphabet code. Two columns would have sufficient raw capacity, and source-native English can occupy a restricted subset; **the shortfall alone is not a falsification of English plaintext**.

There is a stronger **key-independent original-input obstruction**. Because `M` has the exact factor `29^2896`, for **every possible sidecar integer Q**, including high-entropy external values,

`(Q*M + R) mod 29^2896 = R mod 29^2896`.

Therefore the **last 2,896 decoded plaintext GP29 runes** are fixed *before* choosing any sidecar, regardless of key, column, or numeral serialization. Reversing the exact observed original ciphertext through this model gives a fixed suffix with **IoC = 0.034523707287283274**. Its first forty GP symbols are:

`N W S EO Y OE H H AE OE B TH O EO A IA P H O F R N N X TH A OE X H F IA H P N T A M NG C L`.

This suffix is almost maximally uniform (uniform GP29 IoC 1/29≈0.034483), rather than native solved-Cicada GP29 prose. The complete **2,979-rune** nine-section independently published solved register has IoC **0.06138672520944124**; **all 84** contiguous solved-native 2,896-rune windows range **0.0612794492313858–0.06154519604194696**. This is a large fixed-original disparity, with no fitting on candidate words or key bits. It is a conditional native-prose rejection, not a universal proof that no unusual/artificial plaintext can have a flat histogram.

## All six complete-register orderings on the original ciphertext

The previous argument does not depend on which of the three full integers is serialized first. Exhaust the **six** natural lexicographic orderings of the unchanged complete registers A (2,896 GP29 word initials), B (63 positions among10,060), D (9,997 ranked GP28 transitions). Each is independently invertible: the exact mixed-radix backward decoder retrieves all three source-original register values and therefore reconstructs all 12,956 authentic original ciphertext runes and printed word breaks. Their codebook size is the same `M`, so **every conceivable high-order sidecar Q leaves the same 2,896-rune tail within that ordering**.

| Full source-register ordering | Exact original all-sidecar-invariant 2,896-rune tail IoC |
|---|---:|
| A B D | 0.034523707287 |
| A D B | 0.034355528202 |
| B A D | 0.034544222750 |
| B D A | 0.034422084180 |
| D A B | 0.034442838195 |
| D B A | 0.034422084180 |

All six tails remain dramatically below the **0.061279–0.061545** IoC range over all 84 contiguous solved-source-native windows of the identical 2,896-rune length. All six plaintext-tail obstructions apply to **all possible Q**, beyond the eight literal source-table Q columns tested under A B D. They do **not** rule out reversal of individual symbol orders, interleaving/variable-length register fragments, stateful conditional updates, or a wholly different author-selected encoder. The authors have not instructed an exhaustive reordering search, and this finite six-order test does not justify one.

## Eight authentic source-section resets and the eight-column sidecar, all keys

The source contains **eight genuine $-terminated textual sections**, with one marker after each complete section. The original pp49–51 numeric object has **eight printed 32-byte columns**. The dimensional match is a physically meaningful **hypothesis for corresponding sidecars**, although neither source artifact specifies any enumerative decoder or how to turn a column into a short quotient. I therefore tested **each section independently**, resetting all three register ranks at the actual printed section mark, and all six complete-register serialization orders on that section's original ciphertext. Original printed words crossing page breaks remain joined; all 2,896 words and 12,956 original runes are restored in order, including section-specific repeat sites.

| Authentic section (physical pages) | Original runes | Complete words | Interior repeats | Possible quotient max bits | All-six, all-sidecar fixed-tail IoC range | Matched solved-native IoC range |
|---|---:|---:|---:|---:|---:|---:|
| 0 (0–2) | 729 | 158 | 2 | 22 | 0.033057–0.037168 | 0.052084–0.074095 |
| 1 (3–7) | 1,145 | 255 | 4 | 30 | 0.033905–0.035541 | 0.053698–0.075714 |
| 2 (8–15) | 1,738 | 385 | 7 | 42 | 0.034023–0.035349 | 0.055695–0.070373 |
| 3 (16–22) | 1,894 | 435 | 10 | 39 | 0.033561–0.035076 | 0.056550–0.069315 |
| 4 (23–26) | 1,021 | 224 | 9 | 16 | 0.033152–0.035394 | 0.053251–0.075753 |
| 5 (27–32) | 1,433 | 326 | 8 | 29 | 0.033374–0.034714 | 0.054497–0.072487 |
| 6 (33–39) | 1,680 | 378 | 8 | 37 | 0.033318–0.036588 | 0.055605–0.070144 |
| 7 (40–55) | 3,316 | 735 | 15 | 74 | 0.034162–0.034699 | 0.057799–0.067404 |
| **Total** | **12,956** | **2,896** | **63** | | | |

For each source section, independently, the full codebook has factor `29^numberOfSectionWords`. Thus **any nonnegative quotient Q**, regardless of how derived from the authentic bytes, leaves the final `numberOfSectionWords` GP29 plaintext symbols fixed. In all **48** source-original decisions (eight genuine sections × six natural register orders), the fixed contiguous suffix has dramatically nonnative IoC; not one approaches even the minimum in all original known-solved contiguous windows of the exact matched length. The source-native control comparison uses every possible contiguous window in the preserved 2,979-rune real solved GP29 corpus, not synthetic iid random draws.

A second strict mathematical gate applies to the **literal eight-column-as-quotient** interpretation: the maximum available Q has only **16–74 bits per section** (see the per-section values above), whereas each authentic 32-byte column interpreted as an unreduced big-endian integer is far larger, and in all eight sections yields `Q*M+R ≥ 29^sectionRuneCount`. **No literal 256-bit source column is a valid complete-section quotient.** Truncation or reduction mod the feasible quotient count could make an integer fit, but no author source selects such a reduction, and the key-independent random-like suffix remains regardless.

This source-typed extension closes a specific historically plausible eight-section/eight-column form of the **same complete-register enumerative architecture**. It leaves interleaved/local-state coding, distinct original punctuation semantics and independently keyed post-enumeration encryption outside scope. The extended [Windows Node22 validation](https://github.com/FlareZ123/liber-primus/actions/runs/45050936966) confirms all 48 complete register inverses, all exact original section boundaries, all eight literal invalid-quotient gates, plus the earlier whole-original and solved-positive replays.

## Full original inverse, source-sidecar consumers, and positive tests

The CommonJS test uniquely ranks the **unchanged 12,956 source cipher runes** and unpacks `R` back to **all 2,896 words, 12,956 symbols and 63 exact within-word repeats**. It constructs all eight original literal source-table **32-byte columns** as big-endian `Q` values. Every one gives a well-defined **12,956-rune full inverse** and exact original reciphering, but full-source IoCs are:

`[0.0344602383, 0.0344946748, 0.0344500979, 0.0344890744, 0.0344802329, 0.0344717012, 0.0345119884, 0.0344975107]`.

Page0/16/40 independent readouts are also uniform-like for all eight original columns. For instance column0 produces a p0 first-25 rune stream `F U S EO Y AE A TH TH F W F E D AE F G EA EO TH M R X O AE`, not interpretable English. All eight nevertheless preserve the same **all-Q suffix**, a stronger exclusion than those individual columns.

For a full-length positive, the test cycles the independent real solved-GP29 source register to the authentic 12,956-rune length, computes its exact `(Q,R)`, constructs its **complete** 2,896-word, 63-repeat ciphertext register by the enumerator, then unpacks and recovers all 12,956 planted native symbols with their exact original Q. This proves arithmetic completeness and genuine F/EA symbol handling under the model; the planted result is not claimed to be original manuscript plaintext. The true original original-cipher inverse has no long English recovered.

## Cryptanalytic decision

**Retire all six complete-register orderings of this exact big-endian BASE29/28 enumerator, in **both** uninterrupted whole-book and authentic eight-section reset forms, with any unrestricted high-order quotient sidecar, as candidate direct explanations for ordinary native-GP plaintext across LP2.** No amount of optimizing, brute-forcing, rearranging, or locating Q can affect the fatal 2,896-rune decoded tail for this fixed register order. Its original original-cipher test and planted inverse are both complete and independently passed on Windows.

The open **distinct** escape routes require a **source-visible change in the rank ordering, a stateful/word-conditioned enumerator, an intermediate compression or encryption step, or decoy word segmentation**, with a genuine original clue fixing that operation **before** examining new plaintext scores. The source words and 32×8 panel alone do not choose one. Do not promote the 265-bit requirement or a synthetic roundtrip to an authenticated key. This result narrows #2273; it does not settle the broad anti-repeat architecture.
