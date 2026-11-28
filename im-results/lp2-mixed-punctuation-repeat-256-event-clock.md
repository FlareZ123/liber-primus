# Mixed printed-mark / adjacent-equality boundaries: an exact 256-event source clock

**Agent27, 28 November 2026. Classification: source-exact candidate segmentation with two direct original-cipher negatives. No unknown LP2 plaintext, authenticated key, instructed p50 operation, or destination has been recovered.**

## The constrained observation

The original LP2 p0–55 rune tape contains 12,956 GP29 runes on 55 rune-bearing physical pages (p50 is the runeless numeric panel). The independently audited original physical punctuation census contains **175 visible marks**, divided into **31 large 10/13-dot ornaments, 139 four-dot diamond stops, and five three-dot comma-form marks**. The 180-row derivative punctuation file has five nonprinting entries: four p15 numeric-row editorial stops (event indices 57–60) and the absent p37 stop (event125). Event127 is printed but is a **three-dot comma-form**, not a four-dot diamond. Keep those source identities fixed; do not silently use the legacy `⁘` transcription class for event127.

Separately, exactly **86 within-physical-page adjacent ciphertext rune pairs are equal**. An equality event is located *at the second of those two runes*, as a boundary immediately before it. The page-seam comparisons are excluded and the 86 count is the source-verifiable observed value, not a source-independent prediction.

The simple combined alphabet

- **M:** 31 large +139 four-dot printed marks, keeping their actual after-rune boundary position;
- **R:** the 86 observed adjacent-equal pair boundaries, keeping their original continuous book-rune offset;

contains **170 + 86 = 256 ordered events**, exactly the size of the original p49–p51 **32×8, 256-cell** numeric panel. The first event is the p0 red 13-dot boundary at global offset13; the final event is the terminal p55 large mark at offset12956. No page-turn, ordinary word separator, five three-dot comma-form marks, or false editorial stops were added.

The 256 records occupy **252 distinct offsets**. Four equal-position pairs, at global rune offsets **1860, 3603, 8385, 9358**, create four zero-length intervals if interpreted as 256 adjacent source segments. At 1860 and 3603 the collision is between two printed punctuation marks; at 8385 it is a repeat overlapping a stop; at 9358 it is a second two-mark collision. We retain both events, ordering printed marks before rune-equality events for the one mixed tie. The zero-length intervals matter: a model requiring all 256 cells to correspond to nonempty rune intervals already fails without an explicit zero-length/escape rule.

This is **not** the historical, now-retracted 256-slot punctuation/page-turn partition. That construction used period, page and group delimiters alone and becomes **254 slots** under the corrected transcription. The present candidate deliberately adds ciphertext equality events and excludes five printed commas; those are distinct, nontrivial choices rather than a repair of the old partition. [Earlier correction](lp2-original-punctuation-256-slot-grid-gate.md) · [original physical census](lp2-punctuation-original-dot-topology-channel.md).

## Exact 256-bit type sequence

One source-minimal way to preserve the candidate event grammar is a 256-bit mask with **R=1**, **M=0**, original chronological order, eight consecutive MSB-first bits per byte. Its 32-byte value is

```text
5052740402cd0901000805b590f8d69720ae08143323e802026095d29182120e
```

The mask contains exactly 86 one bits. Its SHA-256 is

```text
37598a19ad33640000b73c62e01a0b76358e43418f56b876108185a2f97e23a5
```

This is a reproducible **candidate source-derived binary operand**, not an independently authenticated encryption key. Identical 256 length and AES-256 key length alone do not choose a key serialization, byte order, cipher, receiver or intended puzzle action.

## Two direct receivers on authentic source inputs

We froze two simplest consumers rather than fitting per-page language, signs, phases or key values.

**1. Numeric panel cell → segment additive GP29 key.** In printed row-major order, read p50 cell `i` as the canonical base60 byte `B_i`, use the `i`-th event boundary to terminate the preceding rune interval, and let all runes in this interval decrypt by `P=C-(B_i mod29) mod29`. The 256 intervals cover all **12,956** original runes, including the four zero-length cases. The exact inverse preserves a nearly uniform character distribution: the original IoC is **0.03447839786450569** and the decoded IoC is **0.03449838058904115**. Its opening is nonprose, and the first source interval (p0 13-rune heading) is unchanged because the first panel byte is 203, divisible by29. Exact forward re-encryption recovers all 12,956 runes, as any reversible additive mask must. There is no recovered plaintext.

**2. Event-type mask → AES-256 key for the table bytes.** Use the 32-byte binary R/M mask above, the source's 256 base60 panel bytes as AES-256-ECB ciphertext, no padding and no unknown IV, phase or password. The result begins **`c61df7223788fd6e7d94fa917890e3a5`**, contains only **86/256 printable ASCII octets** versus **103/256** of the original panel, and has SHA-256 **`a86357e6320bc2cd06ac43db3e67478d2901b028b0c12b0a7e4583ad3639a158`**. It is neither a readable instruction nor a recognizable typed file at the prefix. AES-ECB is merely the minimal no-IV whole-block receiver here, **not** a historically sourced opcode; this is a negative result for that exact pairing, not a universal cryptographic exclusion.

The direct event-type-to-panel-letter hypothesis also lacks distinctive positive support: the original 86 R positions coincide with just **20** literal leading-zero panel cells (about the 60/256 table frequency), while the source panel byte reduced mod29 matches the duplicated ciphertext rune on **4/86** repeat slots. Neither simple relation authenticates the event pairing. These are descriptive observations, not p-values.

## Original-event interleaving: exhaustive circular-phase control

A stronger, **frozen-source** internal check asks whether the 86 repeated-rune boundaries are deliberately placed to *fill* the gaps between the 170 physical marks, producing unusually even 256-cell spacing. Keep the full original 86-position repeat pattern and all its internal spacings intact; slide it through **every one of 12,956 circular phases** relative to the fixed physical punctuation. Rebuild 256 event gaps at each phase. This is a relative-phase geometry comparator, **not** a generative null for page-seam legal ciphertext or a familywise author-intent p-value.

At the original, unshifted alignment, the 256 event-gap coefficient of variation squared is **0.86370169594** and the maximum gap is **292** runes. Among the 12,956 shifts, **4,871 (37.60%)** have equal or *smaller* CV² and **5,896 (45.51%)** have equal or *smaller* maximum gap. The original has **29** consecutive repeat/repeat neighboring event pairs, compared with a shift mean of **26.03**; **11,357 (87.66%)** of shifts have 29 or fewer. There is **no special uniformization or anti-clustering** of the combined event stream at natural phase zero. This does not reject an authored event clock with irregular source-selected spacing; it rejects the attractive unsupported claim that the 86 repeats conspicuously fill the printed-mark gaps to make evenly spaced table cells.

## Key-free multiset obstruction for a direct length table

If the 256 sorted mixed events were meant to delimit source lengths literally copied into the 256 printed p50 cells, the hypothesis is false **under every permutation of the cells**, not merely the printed order. The 256 original interval lengths have maximum **292** and **four** zero-length intervals; the printed base60 cell bytes have maximum **255** and exactly **two** zero-valued cells. The respective base60 high-digit histograms (quotient by60) are **[171,62,16,5,2]** and **[60,58,65,56,17]**. These cannot be the same multiset, regardless of rotation, reflection or arbitrary bijective cell ordering. This is a source-level necessary-condition exclusion of literal **length = cell value**, not a rejection of transformed lengths, encryption or a cell-dependent pointer.

## Decision and reproducibility

The arithmetic count is exact and the construction yields a concrete, low-information 256-bit source object, but **it is retrospective**. No original instruction says to combine rare repeated glyphs with only non-comma punctuation, to order them in continuous manuscript time, or to interpret their event types as bits. The p50/source-repeat connection, including the phase-zero leading-zero enrichment, was investigated already; the 256 count is **not** an independent statistical confirmation of that clock. The visible illustration/tables have yet to select a reversible receiver or decipher an unknown rune.

Preserve the count as an exploratory candidate for a future *independently selected* operator or human cold-start; **do not** launch a family of key permutations, arbitrary rotations, IVs or ciphers to force a target. A useful next test would be a historically visible signal that unambiguously chooses the R/M event alphabet *before* seeing 256, and separately fixes a testable operation with an original output type.

Run the source-exact **Node.js 22 CommonJS reproducer** with `node sims/lp2_mixed_event256_original_sft.cjs`. It asserts original counts, coordinates, event mask, zero-length boundaries, complete inverse/re-encryption, AES output hash and the two IoC values. Inputs are the three unchanged canonical JSONs in `resources/liber-primus/`; source-image classifications are supported by [the all-JPEG punctuation audit](lp2-punctuation-original-dot-topology-channel.md), not inferred from a derivative symbol alone.
