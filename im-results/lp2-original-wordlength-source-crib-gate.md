# Source-bound plaintext crib gate using original LP2 printed word lengths

**Current decision, 17 November 2026 (Agent 7 extension of Agent 6's 12 November gate):** Five fixed historical text corpora, including two Christian liturgical texts chosen as a conditional follow-up to the original p0–2 three-bar cross illustrations, yield no exact eleven-word passage in the original unknown LP2 text under either stated length register. The strongest opening-chapter match is only seven words. No cipher key, unknown plaintext or destination was recovered. The separate visual identification of a cross iconography class does not select any of these books uniquely.

## Original inputs and competing explanation

The author-supplied LP2 scans, in their printed order, provide 12,956 runes in 2,896 words on physical pages p0–55. The original separator `-` and punctuation end a word; newline `/`, page `%` and whitespace preserve an unfinished word. The first three source pages are precisely 729 runes across **158** printed words. The standalone SFT asserts that its entire concatenated original GP29 rune tape equals all original numerical indices from `resources/liber-primus/lp2-corpus.json`.

Original pp0–2 repeatedly depict opposed triple-bar crosses. Their appearance supports at least two familiar iconographic categories, Eastern Christian or papal crosses. Earlier original-image analysis proved their artwork reuse and 180-degree registration, without establishing an exact dated printed source or any decoder: [source-plate test](lp2-p0-p2-orthodox-cross-source-plate-gate.md) and [original-art cross interpretation](https://github.com/FlareZ123/liber-primus/issues/194). This is the explicit rationale for adding the two religious texts below; choosing a particular prayer book from such an ambiguous motif is an exploratory hypothesis, not an authentic Cicada instruction.

Under a ciphertext operation that preserves both word boundaries and each GP word's length, an exact quoted passage must match the source words' complete ordered length pattern. Without such preservation, this crib method has no power. Two registers are frozen:

- **GP29 editorial spelling.** Canonical English words are uppercased and normalized QU→CW, V→U, K/Q→C, Z→S, ING→NG, then greedily tokenized by longest published GP29 transliterations. The conversions are assumptions about plaintext orthography.
- **Literal Latin-letter count.** Each word contributes its A–Z length, independent of the GP digraph/letter convention.

The matcher locates every continuous six-word-length coincidence and extends it greedily until the first mismatch. It searches the complete unknown 2,896-word tape, with an additional independent p0–2 opening bound for the two new religious texts. No cipher key, offset, character mapping or phrase is optimized against the ciphertext.

## Five source texts and finite results

| Fixed dated source | Original-text words | Best full unknown GP29 length run | Best full unknown Latin length run | Best p0–2 GP / Latin |
| --- | ---: | ---: | ---: | --- |
| Shakespeare, first 300k corpus portion | 55,407 | **9** | **9** | Not separately measured |
| Kahlil Gibran, *The Prophet* (1923) | 15,733 | **9** | **9** | Not separately measured |
| Emerson, Essays corpus | 77,932 | **9** | **10** | Not separately measured |
| *Orthodox Daily Prayers*, Project Gutenberg #34981 (published 16 Jan 2011; source edition updated 2021) | 25,088 | **10** | **9** | **7 / 7** |
| Florence Hapgood, *Service Book of the Holy Orthodox-Catholic Apostolic (Greco-Russian) Church* (1906), two printed excerpts | 508 | **7** | **7** | **0 / 0** six-word anchors |

The two newly preserved text snapshots are [Gutenberg #34981](../resources/control/orthodox_daily_prayers_pg34981.txt) (upstream [mdws-org source](https://github.com/mdws-org/orthodoxprayers/blob/main/scripts/pg34981.txt), Git blob `a887fa2d3d1246de61e9e6ee4e7f08a72e9764f6`) and [Hapgood excerpts](../resources/control/hapgood1906_service_excerpts.txt) (upstream [mdws-org source](https://github.com/mdws-org/orthodoxprayers/blob/main/scripts/hapgood.txt), Git blob `d4442d435134ecec710945143a468710be48aded`). The Gutenberg preface/license and end matter are excluded at their explicit source markers. Hapgood's bibliographic preface is excluded before `THE BEATITUDES`. Its 508 words are two excerpts only, not the complete 1906 volume. The 2011 Gutenberg corpus has been subsequently updated; no claim is made that the present 2021 text bytes were fixed in 2011.

The longest new original full-LP2 alignment, **10 GP29 words**, appears at original word offset 1,927 against Gutenberg text offset 12,694:

`BORE GOD INCARNATE FOR US AND PRAYS CEASELESSLY FOR OUR`.

This is a length-only collision. The source has no unique original-page placement or verified recovered rune values. Its literal-Latin best has nine words at unknown word offset 2,552. For the *opening cross pages*, Gutenberg's strongest exact run spans only seven words, beginning at original word offset 22 and source offset 10,012:

`HAVE WE PUT OUR TRUST DO NOT`.

The limited 1906 excerpts provide no original p0–2 six-word alignment in either register. The five combined corpora contain **174,668** English words; no source has an exact eleven-word original-length sequence.

## Original solved-passage and software controls

The independently original-linked reclining art on LP2 p22 repeats solved LP1 pp14–15, whose 87-word koan begins `A KOAN DURING A LESSON`. The entire known source excerpt reaches only six consecutive original unknown LP2 word-length matches under either register. Its literal reuse as a continuous hidden passage is unsupported.

A positive 32-word synthetic test copies Shakespeare's words 1,000–1,031 by GP29 length into a copy of unknown word positions 500–531. The same fixed matcher must retrieve all 32 in their correct original and source offsets. This test distinguishes a functioning source-location method from a failed matcher. The original corpus is never altered in the measured negative runs.

## Decision and required new evidence

The current source matches are too short and too non-unique to establish any copied quotation. The cross identification supplies no exact quotation source, chapter, authorial key, cryptographic register or start. Stop this branch rather than extend it to arbitrary religious books. A newly recovered, uniquely matching original period plate with an accompanying dated printed citation could justify a new source-selected crib. Stronger evidence would be an independently positioned passage yielding a long exact word-length prediction followed by recovery of actual original rune values under a fixed reversible cipher.

This exclusion applies only to these exact five source snapshots, two normalization registers and literal word-length preservation. It leaves paraphrases, other source passages, changed segmentation and polygraphic or source-independent ciphers unresolved.

**Reproduction:** [`sims/lp2_original_wordlength_source_crib_sft.cjs`](../sims/lp2_original_wordlength_source_crib_sft.cjs), Windows or Linux Node.js 22. It checks all original GP29 indices, all original word boundaries, five fixed-source maxima, the opening 158-word substream, solved-LP1 negative control and a 32-word positive source plant. All source inputs are repository-local. This report consolidates Agent 6's prior three-corpus results and the additional, dated source-class tests.
