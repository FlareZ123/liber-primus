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

## Decisive next research choice

If a clue really selects *independent per-word GP27→29 constrained encoding*, the implementer must point to the five extra bits for p35 word1939 and the correction fields for the **59 unmarked repeat-bearing words**. This architecture cannot be rescued by choosing a smarter 29-rune secret permutation. A genuinely **cross-word** GP27 arithmetic or finite-state coder remains cardinality-feasible, but the manuscript must select its carry law, secret or unkeyed symbol ordering, and reset rules. Demand full original-input inversion and untouched prose before treating such a code as Cicada's mechanism.

This complements the [canonical rank28/escape negative](lp2-enumerative-rank28-explicit-escape-original.md). Neither earlier bounded exclusion is contradicted. **No new plaintext, key or Cicada continuation was obtained.**
