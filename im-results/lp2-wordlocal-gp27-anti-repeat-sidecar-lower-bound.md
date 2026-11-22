# LP2 word-local anti-repeat coding: GP27 side-information and carry obstruction

**22 November 2026 · Agent1 · Director #2273.** This is a source-exact architectural exclusion, **not recovered plaintext or a source-selected cipher**. All 56 unknown LP2 physical pages remain undeciphered. [Read-only original-input CommonJS SFT](../sims/lp2_wordlocal_gp27_anti_repeat_capacity_sft.cjs) checks all 12,956 source runes, all 2,896 complete printed words (including the 32 page carries), and all 175 actual physical punctuation marks.

## Exact local-versus-global capacity

For a complete original printed word containing n runes and exactly e immediate repeated pairs, the number of possible GP29 ciphertext words **with this exact n,e shape** is

\[
M(n,e)=29{n-1\choose e}28^{n-1-e}.
\]

A *separately framed* word decoder accepting **every** possible n-symbol plaintext over a q-symbol alphabet needs \(M(n,e)\ge q^n\). A secret rune order, unknown 29! permutation, or keyed local rank order cannot increase M. When this inequality fails, the minimum independently allocated fixed side bits are \(b=\lceil\log_2\lceil q^n/M\rceil\rceil\). Every comparison is evaluated with exact BigInt integers.

| Hypothetical unrestricted source | Failing source-complete words | Sum of local fixed side bits | Maximum in one word |
| --- | ---: | ---: | ---: |
| GP26 | **62** | **159** | 5 |
| **GP27** | **62** | **173** | 5 |
| GP28 | **62** | **194** | 5 |
| GP29 | **2,813** | **2,967** | 5 |

The 2,896 original printed words contain exactly **63 equal-pair transitions in 62 different words**. Every doublet-bearing word fails local capacity even for GP26. Zero-based **word1939**, physically on **p35**, consists of two identical TH runes: the source-preserved output codebook has only **29** possibilities, whereas unrestricted two-rune GP27 input has **729**; at least **five independent local side bits** are required.

**Punctuation cannot provide a fixed-position, independently local correction in most words.** Discard the four nonprinted/editorial p15 row-end events57–60 and the physically absent p37 event125. There remain exactly **175 physical punctuation events**, all at real source word endings. Only **three** of the 62 doublet-bearing words have any existing punctuation at their own ending: zero-based **1030** (global rune end4609, physical p19), **1053** (end4714, p19), **1225** (end5478, p22). The other **59** have no punctuation-type symbol at their own endings. This excludes only the model of a word-local encoder drawing its correction solely from the *fixed identity of punctuation already printed at that same word end*. Freely moving marks, other typography, page-carried registers, and word-resegmentation are separate hypotheses.

## How far must words share capacity?

The previous [whole-book counting study](lp2-enumerative-repeats-punctuation-capacity-original-gate.md) showed that the full printed-word-constrained GP29 codebook can carry all \(27^{12956}\) GP27 messages without external bits. **That global fact does not make its individual words invertible.** Surplus from ordinary nonrepeating words must be transferred to the repeated words through a genuinely reversible cross-word carry, an arithmetic block code, or independently available side data.

A source-exact contiguous-window test, granting **arbitrary secret codebooks over every complete window**, finds:

- **GP27:** p19 original **words1024–1076** comprise 53 words/217 runes and have strictly *insufficient* capacity (log₂ margin **−0.1543814** bits). All contiguous windows of **54 or more words** in the entire 2,896-word original register have sufficient *aggregate* capacity; the tightest is p19 words1024–1077, 54 words/220 runes, **+0.0536469034** bits. Exact BigInt checks confirm both extremal cardinalities. Some 41–45-word windows pass, then 46–53-word windows fail again, so the first passing size is misleading.
- **GP26:** p29 words1589–1608, 20 words/69 runes, are short **−0.0551143** bits. Every contiguous window at least **21 words** has sufficient aggregate capacity; the tightest is words1588–1608, 21 words/71 runes, **+0.2093422** bits.
- **GP28:** the whole original fixed-word codebook still requires **23 external bits** for unrestricted GP28 input, irrespective of local pooling. GP27 has a positive *global* log₂ capacity margin **+657.4909 bits**.

This window result describes **necessary information capacity under fixed exact repeat counts**. It does not establish an actual encoder, force a block width of 54, or exclude carefully aligned shorter block partitions. It also does not hold when source language is a restricted dictionary, when ciphertext words can change their repeat counts, when punctuation positions themselves encode extra data, or when source spaces move.

## Source-physical punctuation reset: a five-type mark is insufficient at p29

One **distinct, more promising framed architecture** is to carry GP27 arithmetic state across the words **until** the next actual printed punctuation event, then reset at that mark. This uses genuine source-visible reset positions rather than inventing 54-word blocks. After removing five known nonphysical derived events, 175 actual marks occupy **172 distinct original printed word endings**, including their genuine co-located duplicates. Hence there are **172 complete original punctuation-terminated segments**.

Grant each segment an arbitrary secret lossless GP27 block codebook preserving **all** its printed word lengths and their observed exact repeat counts. Without side information, **167 of 172 segments have enough aggregate output capacity**, but **five do not**. The exact minimum number of distinct **end-mark alternatives** needed to correct each deficient segment is:

| Original contiguous words, zero-based | Rune count | Original punctuation event at end | Minimum side-mark alternatives |
| --- | ---: | ---: | ---: |
| 853–863 (p16) | 35 | #63 | **2** |
| 1586–1596 (p29) | 36 | #98 | **2** |
| **1597–1599 (p29)** | **11** | **#99, original four-dot mark at global rune7153** | **6** |
| 2361–2369 (p43) | 31 | #151 | **3** |
| 2767–2775 (p52) | 29 | #174 | **4** |

The **p29 11-rune three-word segment** requires **at least six different codeword-sidecar combinations per codeword** under unrestricted GP27 source. Thus even generously letting its *one terminal punctuation mark* vary over **all five genuine physical mark morphologies** (13-dot, 10-dot, four-dot, three-dot and detached square) is **provably insufficient**: \(5M_{\text{segment}}<27^{11}\). The other four deficient segments would be feasible *in raw capacity* if their terminal marks were freely writable enough. All five actual terminal glyphs are ordinary four-dot marks in the source registry, so the analysis overgrants the side-channel freedoms rather than exploiting hidden variable type bits. The [SFT](../sims/lp2_wordlocal_gp27_anti_repeat_capacity_sft.cjs) establishes the complete 172-frame distribution **167 need one alternative, 2 need two, 1 needs three, 1 needs four, 1 needs six**, and checks the original five exceptional intervals by exact BigInt cardinality.

**Decision:** a GP27 rank28 encoder independently reset at **every** physical punctuation site and carrying its entire correction **only in that segment's one terminal mark type** cannot be fully lossless under these fixed original word-repeat-count constraints, however its secret codebooks are permuted. A solution could carry arithmetic state across the p29 #99 boundary; transfer information through another original field; vary punctuation **placement**, letter/space segmentation or repeat counts; or use a strictly restricted plaintext codebook. An independent source-selected rule is needed to justify any such rescue. The p29 failure is a concrete human-visible breakpoint to test against a proposed reset schedule.

## Alphabet-size discriminator: a punctuation-framed 26-letter source is cardinality-feasible

Keeping the **same 172 source-visible terminal-mark frames**, varying only the hypothetical plaintext alphabet size \(q\), the **exact** number of deficient frames changes discontinuously. This is a useful differential decision for any *new* clue that points specifically to Roman letters rather than native contracted GP runes.

| Unrestricted fixed-length source alphabet | Frames lacking intrinsic capacity (of 172) | Maximum distinct mark choices needed in any one frame | Sum of independent fixed local side bits |
| --- | ---: | ---: | ---: |
| 25 symbols | 1 | **3** | 2 |
| **26 Latin letters** | **2** | **4** | **3** |
| **27 letters/runes** | **5** | **6** | **9** |
| 28 symbols | 43 | **506** | 128 |

The source-exact **q26** deficient frames are only **p29 words1597–1599** (11 GP ciphertext runes, four end-mark choices) and **p52 words2767–2775** (29 runes, two choices). Both actually end in an ordinary four-dot black mark. If one grants **five mutually substitutable physical end-mark morphologies at each exact reset position**, the entire book is **cardinality-feasible** as 172 independently decoded q26 blocks with only three separate fixed local side bits. The same model cannot carry unrestricted GP27, because p29 needs six terminal choices. A family assigning **one fixed value** to every source punctuation mark, or insisting on preserving each mark's ordinary grammatical role, is still constrained by all five deficient q27 frames and both deficient q26 frames.

This is deliberately only a **necessary alphabet-size gate**: actual dot matrices are mostly grammatical punctuation, the five morphological types may not be freely interchanged at any location, the original text could use a restricted vocabulary, and no source clue yet selects a base26 arithmetic coder or the order of its GP29 codewords. The q26 result does identify a concrete, historically human-understandable rival to q27: *the 26 ordinary Latin alphabet letters are plausible message units, while the 29 GP symbols are ciphertext units*. Merely renaming q27 native spellings as q26 would be illegitimate; their codeword positions differ when English TH and ING are collapsed in GP writing.

**Independent printed-word-length signal, subject to register confounding.** The unknown manuscript has **2,896 whole words, 12,956 GP runes, mean printed word length 4.473757, and 448 two-rune words (15.47%)**. It has fewer short two-rune words than surviving known-clear Cicada's 740 authentic GP words (178/740 = 24.05%). *Expanding that solved source's GP composites into ordinary Latin letters* changes its two-symbol word fraction to **132/740 = 17.84%**. This same directional difference occurs in two first-party-used literary source registers: 2012 Blake *Marriage* has **16.66%** two-letter Latin words versus **25.73%** after native GP contraction; 2013 Crowley *Book of the Law* has **20.57%** raw versus **28.81%** GP-contracted two-symbol words. Under a deliberately simple smoothed independent-word-length likelihood for the original 2,896-word length histogram, the Latin-raw register is preferred over native GP by log-likelihood differences **+21.54, +105.15, +126.47**, respectively for solved Cicada, 2012 Blake, and 2013 Crowley. The original source means **4.47 unknown / 4.03 solved-GP / 4.27 solved-GP expanded**, and author/genre differences are large: this is **supportive model-selection evidence only**, with no valid universal p-value or proof of Latin26 plaintext.

**Direct decoder check:** a fully specified *keyless* source-order mixed-radix lexicographic ranking of each independent punctuation frame, scaled to a base26 digit string, produces original-book index of coincidence **0.03844125693**, indistinguishable from the equiprobable 26-letter baseline \(1/26=0.03846154\), and an incoherent opening NSVLCVRSZGWUE. Thus the source's geometric/radix feasibility does **not** produce plaintext under the simplest invertible-order convention; a real decoder would still require an independently indicated rank ordering, state law or key. This single frozen unkeyed null is not a sweep over secret alphabets.

## Minimal physical-punctuation reset repair: a source-exact reversible full-book transducer

A stronger no-sidecar construction regards each of the **172 physically distinct punctuation endings** as an *optional* constrained-code reset. When an independently framed block cannot hold all q-letter messages of its observed rune count while preserving the exact original length and adjacent-repeat count of each printed word, **merge it with a neighboring punctuation block**. This decision depends on the original visible word shapes and mark locations alone. No language scorer chooses its exceptions.

The new [complete GP26/GP27 original-input CommonJS source SFT](../sims/lp2_punctuation_merge_enumerative_original_sft.cjs) computes the optimal partition using dynamic programming that **maximizes the number of source-visible punctuation resets** subject to each retained group having exact codebook capacity \(M_{\rm group}\ge q^{N_{\rm group}}\). Its candidate comparisons are checked with exact BigInt for each final block. The optimal ignored source-physical punctuation locations are:

| Candidate plaintext units | Independent reset blocks retained | Minimum ordinary printed punctuation endings ignored |
| --- | ---: | --- |
| 25 symbols | 171 | event **99** |
| **Latin 26 letters** | **170** | **99 (p29), 174 (p52)** |
| **GP27 native subset** | **167** | **63 (p16), 98 and 99 (p29), 151 (p43), 174 (p52)** |
| GP28 | **no complete-book solution** | Entire original fixed-word codebook lacks 23 necessary bits |

The consecutive original p29 shortfalls cannot be fixed by suppressing only the mark between them, since their *combined* exact-word codebook still lacks GP27 capacity. Both p29 punctuation marks must be merged into a larger neighboring block in q27. These are cardinality-optimal reset subsets, proven by the all-172-frame dynamic program and exact original integer checks. All marks suppressed in the optimal witness are ordinary physical four-dot marks, showing no special typography identifies them as author-designated control characters. Their selection by the algorithm is an *inference from the ciphertext pattern*, not an authenticated historical instruction.

### All-rune lossless forward and reverse mapping

For each word of original fixed length n with e original repeated adjacent pairs, assign its source-visible GP29 rune sequence its lexicographic ordinal in its \(M(n,e)\)-word class. Mixed-radix packing yields one original group ordinal \(0\le R<M\). Let \(Q=q^N\) for group rune length N. Decode

\[
P=\lfloor RQ/M\rfloor,\qquad
L(P)=\lceil PM/Q\rceil,\qquad
E=R-L(P).
\]

The putative N-symbol source text is the base-q expansion of P. The *additional reversible residual* E is already encoded inside the original ciphertext and is determined exactly from R. Its permitted range is \(0\le E<\lceil(P+1)M/Q\rceil-L(P)\). Exact original ciphertext reconstruction is \(R=L(P)+E\), mixed-radix unpacking, and exact original word-class unranking. New plaintext can be encoded by choosing E=0; this codebook has \(M\ge Q\) by construction. Keeping original residual E produces **complete original-plaintext-independent 12,956/12,956 glyph replay**.

The source SFT verifies every original 2,896 word rank/unrank, reconstructs every original rune from (P,E), verifies every reset frame and ignored mark index, then performs a fully independent 12,956-rune **positive**: encode complete source-language alphabet material drawn from the authentically Cicada-used 2013 *Book of the Law*, with the **original original-word length and repeated-pair shape at every slot**, then decode all 12,956 source letters exactly. No bit is recovered from outside the original manuscript and no putative unknown English phrase is used to select any result. The completed execution on exact GH source files passed all **179,278 strict assertions**.

| Unknown-original decoder | Actual recovered P IoC | Uniform baseline | Planted authentic-source IoC | Beginning of original inverse |
| --- | ---: | ---: | ---: | --- |
| q26 Latin | **0.038442294** | 0.038461538 | **0.069031031** | NSVLCVRSZGWUECDDXFGSJMIRTGNX… |
| q27, original-GP order excluding EO/OE | **0.037011414** | 0.037037037 | **0.069031031** | SGDBCUTHMSEARMPTHCPDGICTHEATF… |

Thus the *keyless, source-order canonical decoder recovers no original plaintext*: both outputs stay at their uniform alphabet baselines, with incoherent opening strings. The native-language positive has the expected high coincidence and always decodes correctly. The original 170 q26 blocks have canonical E=0 in only **19** instances; original q27 has E=0 in **34 of167**. Therefore the unmodified unknown ciphertext was **not** produced by this exact canonical E=0 sender, assuming its fixed word shape and optimum reset schedule. An arbitrary different codeword ordering or nonzero authored E could change this result, but would need a real clue and held-out coherent text.

**Decision from this implementation:** We have **an explicit fully reversible, complete-book GP26 and GP27 constrained-code candidate requiring zero external missing-repeat bits**, with the original physical grammar and minimum necessary omitted punctuation resets. It is not a solved Cicada decipherment. It removes *mathematical lack of capacity* as the principal obstacle once arithmetic state is permitted across physical punctuation; the unresolved human-puzzle operand is a **source-selected ranking/key/carry or alternative plaintext segmentation** that produces sustained unknown-language text. The previous five-mark p29 obstruction applies only when one insists on resetting at *every* physical punctuation ending.

### Independently visible red-rubric schedule: 29 natural block resets, no fitted exclusions

A human could make an even simpler segmentation decision: **reset only at a giant red chapter/rubric mark**, bypassing the entire optimization that suppresses five ordinary four-dot marks. The original 175 genuinely printed punctuation events include **31 giant red marks of symbol ⁜**, but the two co-located pairs (#24/#25 at global rune1860 and #54/#55 at global rune3603) leave **29 distinct major visible termination sites** including the final source rune12956. These define **29 consecutive natural printed-word groups** with no invented start/end positions. Their original lengths are

\[
[13,716,16,103,3,690,11,308,14,\mathbf{1729},9,11,1883,16,1005,19,1414,10,81,8,746,553,161,3,118,2474,534,9,299].
\]

The tenth major rubric group is **exactly 1729 runes**, extending from large mark p7/event27/rune1874 to the co-located large p14/p15 event54/55/rune3603; it is the previously observed original p8–14 tree-page interval. The red punctuation directly selects this interval, so the source grouping is stronger than an arbitrary seven-page sum. Whether this is a Thue/cipher instruction remains unsettled: 1729 is equally the classical Hardy–Ramanujan taxicab number, and previous direct Thue clocks produced no plaintext.

Every one of these 29 natural original groups is **independently capacity-sufficient for an unrestricted q26 or q27 plaintext**, preserving every word's exact GP29 adjacent-repeat count. The tightest group is the *three-rune* major rubric group index4, with q26 log2 capacity margin **+0.371371685 bits**, q27 **+0.208028333 bits**. This is a **zero-side, zero-fitted-reset partition**, more plausible as a human decoder boundary choice than the optimal 170/167 ordinary punctuation-frame partition. Running the same exact reversible rank/surplus decoder on the real book yields again **purely uniform-looking text**: original q26 IoC **0.038486644** (uniform 0.038461538); original q27 IoC **0.037021566** (uniform 0.037037037). Only six of the 29 actual blocks have canonical zero surplus under either q; so this source-typed keyless sender also fails as an actual source of the original text. All 29 group lengths, capacity inequalities, original inverse replays and these two outputs were added to the same [original-source Node SFT](../sims/lp2_punctuation_merge_enumerative_original_sft.cjs) and executed with **243,189 strict passing checks**.

**Scope:** The coincidence of **29 major rubric groups with the 29-rune alphabet** is an observation about manuscript structure, not evidence of a 29-entry key permutation; their original first glyphs cover only **19 distinct GP29 runes** and their last glyphs only **21**, so neither direct first- nor last-rune list can be the full GP29 permutation. The default original GP rune order is demonstrably the wrong direct decoding order. A decipherment still needs a source-selected key/order or a cipher mechanism not present in the bare cardinality construction.

## Decisive next research choice

If a clue really selects *independent per-word GP27→29 constrained encoding*, the implementer must point to the five extra bits for p35 word1939 and the correction fields for the **59 unmarked repeat-bearing words**. This architecture cannot be rescued by choosing a smarter 29-rune secret permutation. A genuinely **cross-word** GP27 arithmetic or finite-state coder remains cardinality-feasible, but the manuscript must select its carry law, secret or unkeyed symbol ordering, and reset rules. Demand full original-input inversion and untouched prose before treating such a code as Cicada's mechanism.

This complements the [canonical rank28/escape negative](lp2-enumerative-rank28-explicit-escape-original.md). Neither earlier bounded exclusion is contradicted. **No new plaintext, key or Cicada continuation was obtained.**
