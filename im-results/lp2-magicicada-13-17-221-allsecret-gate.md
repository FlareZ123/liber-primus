# Periodical-cicada 13/17/221 clock: a source-led all-secret phase-alphabet gate

**Finding (13 November 2026, Agent 50).** Fixed-position 13-, 17-, and 221-step secret substitution cycles are incompatible with the observed original LP2 source under the tested natural GP-English register, even when a complete arbitrary secret alphabet is allowed at every phase. This also holds after two exact invertible 28-symbol encoders remove the immediately preceding ciphertext rune from the available alphabet, while treating the 86 observed same-rune exceptions as erasures. **No unknown rune, authentic key or continuation was recovered.** This is a bounded cryptographic exclusion.

## Creator-visible clue and its weakest premise

The manuscript repeatedly prints 13-dot punctuation; its final unsolved p55 has a conspicuous insect/tree illustration and 17 printed word segments (the first continues from p54). Living *Magicicada* periodical cicadas famously use 13- and 17-year emergence cycles. This suggests the bounded candidate periods **13, 17, and their product 221**, potentially as repeat clocks. The insect may only symbolize emergence, and no Cicada-authenticated manuscript instruction actually says to use the biological periods for encryption. The 13-dot mark, p55 segmentation and historical natural history are individual facts, but choosing a repetitive cipher from them is an investigatory hypothesis. This gate does not infer author intention.

The repository has already excluded a related family of fixed 28-rank periods **8, 16, 32, 64, 128 and 256** in [the earlier periodic equality work](no-repeat-periodic-key-phase-invariant.md). The 13/17/221 clock family was a distinct source-led hypothesis, with an independent original illustration/biological cue.

## An all-key invariant requiring no key search

Within each source-visible physical page or continuously across the book, let `s(i)=i mod L` for `L∈{13,17,221}`. Suppose an adversary could choose **any** secret 29-symbol bijection at each clock position and encode `C_i = π_{s(i)}(P_i)`. At each fixed phase, equality `C_i=C_j` is equivalent to `P_i=P_j`. The count of matching unordered pairs inside phase buckets is therefore exactly preserved under **all** `(29!)^L` secret choices; it also covers arbitrary affine/Vigenère keys with no restrictions on secret values.

The original ciphertext is unusually depleted in adjacent repeated runes, so the experiment additionally decodes the two complete reversible 28-way **no-immediate-repeat** alphabets used by earlier work. At every original position except each physical-page first rune and any equal-to-previous position, define:

- **Sorted exclusion:** `R_i=C_i−[C_i>C_(i−1)]`, where `R_i∈0..27`.
- **Cyclic exclusion:** `R_i=((C_i−C_(i−1)) mod29)−1`, also `0..27`.

Exactly **55 page initials + 86 observed adjacent repeats = 141** sites are erased, never fitted or credited as candidate successes. Each remaining rank is an ordinary 28-valued code. We grant an independently arbitrary secret 28-way bijection at **every clock phase** of the rank code. The same within-phase pair-equality invariant remains exact across `(28!)^L` hidden keys. Continuous-book and page-reset clocks are evaluated separately. This grants strictly more secret degrees of freedom than a conventional repeated numeric pad.

## Unaltered original manuscript results

Source: [canonical original LP2 numeric corpus](../resources/liber-primus/lp2-corpus.json), **55 rune-bearing pages**, **12,956 unknown glyphs**, one rune-free p50. The rate is matching unordered pairs divided by all eligible within-phase unordered pairs; expected unstructured rates are 1/29≈0.03448 and 1/28≈0.03571. Source glyph order and all word/page boundaries are preserved.

| Period | Clock | Original GP29 same-phase rate | Sorted GP28 rate | Cyclic GP28 rate |
|---:|---|---:|---:|---:|
| 13 | continuous | 0.03457285 | 0.03572994 | 0.03579460 |
| 13 | page reset | 0.03457762 | 0.03579345 | 0.03565053 |
| 17 | continuous | 0.03436533 | 0.03561171 | 0.03580783 |
| 17 | page reset | 0.03456274 | 0.03572290 | 0.03586610 |
| 221 | continuous | 0.03479349 | 0.03572338 | 0.03615873 |
| 221 | page reset | 0.03468736 | 0.03587576 | 0.03578209 |

For a checksum on the largest new clock, direct 221-continuous GP29 has **12,989/373,317** equal pairs and cyclic-rank28 has **13,206/365,223**. Equal-runic pairs at the same phase cannot be made more frequent by any secret fixed per-phase bijection.

## Independent GP-language controls and positive encryption plants

The locked original page-size list and its **141 erasure positions** are imposed on native text windows. Three existing independent GP-normalized English references are transliterated using the repository's canonical longest-token GP mapping: **206** Shakespeare windows, **51** Gibran windows and **312** Emerson windows, each 12,956 GP runes with deterministic start offsets every 1,000 runes. The rare 29th rune is folded into rank code27 for GP28 controls without changing length. The full original-vs-control comparison makes **569** windows per family/clock, and the test makes all **6×2×569** finite comparisons. Every original phase-equality rate falls below every matched control. For example, at L=221 continuous, the minimum control rates across all Shakespeare/Gibran/Emerson windows are:

| Source | Direct GP29 minimum | GP28 rank-control minimum |
|---|---:|---:|
| Shakespeare | 0.05785699 | 0.05786875 |
| Gibran | 0.05899544 | 0.05896398 |
| Emerson | 0.06070980 | 0.06062597 |

These finite reference controls establish a substantial gap in the **natural English register used by the manuscript's solved sections**. They do not prove a theorem for all intelligible prose, languages, compressed intermediate codes or adversarial plaintext.

The portable SFT plants an arbitrary **221-phase GP29 invertible affine alphabet** over actual GP-English; equality counts match the unencrypted source exactly despite the hidden keys. In parallel, the same source is passed through **221-phase GP28 invertible affine alphabets** and then through each fully specified 28-way no-repeat output encoder. All **86 original immediate-repeat exception positions** are copied as explicit erasures, and the original nonerased ranks recover precisely the correct phase-equality counts on the positive plant. The hidden per-phase keys are never supplied to the equality checker.

[One-file CommonJS SFT](../sims/lp2_magicicada_13_17_allkey_sft.cjs) (Node.js 22): `node sims/lp2_magicicada_13_17_allkey_sft.cjs`. It asserts fixed manuscript counts, exact sample counter checks, all-key plant invariance and the complete 569-window finite comparison for the six source-shaped clocks.

## Decision and next plaintext-relevant branch

The specific **fixed public 13/17/221 clock + arbitrary fixed secret per-phase substitution alphabet** architecture can be retired for ordinary GP-English, including both strict 28-symbol predecessor-exclusion outer encoders. No language tuning or assumed known key could rescue these families because the observed same-phase equality is invariant under their entire secret keyspace. The 13- and 17-year cicada interpretation remains a possible symbolic or navigational clue, and a **dynamically changing clock**, independent round-by-round material, symbol transposition, alternative plaintext register or source-selected operation may still be viable.

A more useful successor needs an author-supplied readout that actually selects evolving key/state, predicts previously unknown original rune positions, or yields historical bytes of the required deep-web resource. Repeating-key parameter variants without a new source clue have poor causal paths to unknown plaintext.
