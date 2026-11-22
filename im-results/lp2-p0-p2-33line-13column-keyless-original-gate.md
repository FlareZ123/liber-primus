# Opening LP2 33-line inner register: source shape and a key-independent cipher exclusion

**Agent25, 22 November 2026. Classification: original-source structural observation and bounded negative cryptanalytic test. No recovered unknown plaintext, authentic key, cipher instruction, or destination.**

## What the original artifact actually supplies

The original physical p0 (scan17) starts with thirteen red GP29 title runes in two printed words of widths 8+5, then a thirteen-dot red paragraph mark. Original p1 and p2 continue that opening chapter; p2 terminates with another thirteen-dot mark, while p1 has none. The authoritative [original-image adjudication](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md) fixes the real p0 body start at rune offset13. The p0 title's presence in red is genuine; its treatment as an encryption key remains conjectural.

Original p0–2 contain 729 runes, including the thirteen title runes, and thus **716 black-body runes**. Read the authentic slash-delimited printed lines from [the unaltered source transcription](../resources/liber-primus/lp2-transcription.txt), including each line's rune glyphs and any true cross-page word continuation. Remove the thirteen red title runes from the first physical line, which leaves a seven-rune first black line. The black body then occupies exactly **33 original printed lines** of widths:

    7,23,19,22,24,21,21,23,23,20,23,23,
    24,23,23,21,23,23,22,21,21,21,21,23,
    21,24,22,25,23,21,24,22,19

A reversible *hypothetical line-shell* register retains each line's first and last rune plus its original width; the remaining 650 interior runes are concatenated in source order. This produces **66 exterior + 650 interior = 716**, where 650 is simultaneously 50×13 and 13×50. The retained original line widths and 66 exterior glyphs reconstruct every black rune, and the thirteen preceding red glyphs reconstruct all 729 original p0–2 runes. This is a reversible partition of unchanged ciphertext, **not a source-authenticated decryption**. Crucially, the solved p57 instruction about shedding circumferences refers to the self, and does not explicitly select printed **line** edges, a 13-column arrangement, or this opening chapter.

The exact 50×13 fit is **weak selector evidence**. Divisibility by 13 also holds for the 663-line-interior total when the red heading is included, and the original first 729 runes' square length and the 33 source lines jointly produce that relation. Of eight authentic dollar-terminated source sections, the unfiltered line-edge inner counts of two sections (opening and final) are divisible by13; the condition is not unique to the opening. In particular, the published 13-atom p0 title coincidence has many correlated, postselected interpretations. Treat the geometry as a candidate source consumer only.

## One key-independent original-cipher decision

The two natural readings of the 650 inner symbols are a **50-row ×13-column** tape and a **13-row ×50-column** tape. For either period k=13 or k=50, permit a completely **arbitrary and independently hidden permutation of all 29 GP runes at each of its k column positions**, with no bound on the secret keys. Define the period-stratified collision statistic:

    I_k = [sum_(r=0)^(k-1) sum_(v=0)^28 n_(r,v)(n_(r,v)-1)]
          / [sum_(r=0)^(k-1) N_r(N_r-1)],

where n_(r,v) counts rune v at tape positions i mod k = r, and N_r counts the samples in that residue class. An arbitrary GP29 bijection at fixed r only relabels the 29 counts, so it **preserves I_k exactly for every one of (29!)^k secret-key configurations**. Permuting columns as whole columns also preserves the summed statistic. This is a necessary condition for native GP-language plaintext under the hypothesized stationary class-alphabet decoding rule.

On the unchanged original 650-rune line interiors, **I_13=0.036169544740973315** and **I_50=0.03256410256410256**; the whole-core conventional collision rate is **0.034149579234324996**. As genuine native-language comparisons, the read-only SFT uses the pinned, [corrected Old English Beowulf GP source](../resources/control/beowulf_oe_gp_profile_corrected.json) and [held-out Vulgate GP source](../resources/control/latin-vulgate-heldout-gp.json). Each comparison takes a contiguous 716-rune source window, overlays the **same authentic 33 line widths**, strips the same 66 line-edge positions, and computes both I statistics. Starts advance by 13 runes.

| Register | Original I | Beowulf 942 windows, minimum / median | Vulgate 130 windows, minimum / median | Windows at or below original |
| --- | ---: | ---: | ---: | ---: |
| 50×13, each 13-column position has its own secret alphabet | 0.036169545 | 0.050675039 / 0.057708006 | 0.065620094 / 0.072276296 | 0/1,072 |
| 13×50, each 50-column position has its own secret alphabet | 0.032564103 | 0.044615385 / 0.055641026 | 0.061282051 / 0.069487179 | 0/1,072 |

These overlapping source windows are matched comparisons, **not 1,072 statistically independent trials**; their zero counts should not be converted into a naive p-value. Secret-permutation invariance is exact. A seeded positive bijection and its inverse recover all 650 planted original GP symbols, and replay with line shells reconstructs all 729 original runes. No such key can raise the original class collision statistics under these fixed alphabets, so the **complete source-shape stationary per-column monoalphabetic decoder is incompatible with the tested native GP-language registers**.

The theorem does **not** exclude per-row or evolving alphabets, symbol-changing feedback, nonbijective GP29 encodings, a lost external key, variable segmentation, separate red-text transformations, or plaintext in a different language/register. It also cannot establish that the proposed line partition was intended.

## Source-red 51×13 header register: two complete cumulative inverses

The original **thirteen red title runes** can also be retained as an initial **thirteen-column row** *before* the same 650 unchanged line-interior runes. This is an exact physical-order 663-rune field, shaped **51×13**: one red header row followed by 50 hypothetical black rows. With the previously retained 66 line-edge symbols, the full 729-source-rune opening is still exactly reconstructible. The p0 red 13-dot paragraph mark and terminal p2 13-dot mark are source-real. **Neither mark tells a human reader to peel line edges or form 50 artificial rows**, so this is a candidate geometric decoder, rather than a discovered instruction.

Two especially simple **reversible** GF29 operators now have complete original-input decisions:

1. **Red-header vertical integral:** hypothesize each black cell was formed by adding a plaintext rune to the ciphertext directly above it in the 51×13 field, with the red title as its first row. The complete inverse is `P[r,c] = C[r,c] − C[r−1,c] mod29`, for r=1..50 and c=0..12. This recovers exactly **650 native-position outputs** with no guessed key or fitted start. Their empirical GP29 IoC is **0.034543084034609456**, and the first symbols are `AE IA W Y C M R N O I EA O I J G X NG M`; there is no coherent GP-native sentence. Genuine corrected Beowulf source-native **650-rune** plaintext, when encrypted through the stated red-header integral and decoded blind, reproduces all **650/650 exact**.
2. **Two-dimensional mixed integral, even with completely unknown additive row and column pads:** hypothesize a field generated by a double cumulative sum of plaintext GP runes. Its **600 actual interior outputs** (r=1..50, c=1..12) must obey `P[r,c] = C[r,c]−C[r−1,c]−C[r,c−1]+C[r−1,c−1] mod29`. Any entirely unknown additive secret on each source-hypothesized row and each column **cancels exactly** in this operator. Thus no fitting of any of the possible 51 row and 13 column additive keys can change the 600 original decoded runes. Their IoC is **0.03434613244296049**, with start `TH N M H X X C D W E R W A H W IA I D` and no native prose. A separate genuine **600-rune corrected Beowulf** plant, encrypted via the complete double integral and then masked by independent row/column additive secrets, recovers **600/600 exact** under the same inverse.

The 51×13 source-concatenated field and both operations are entirely fixed before decoding. The **exact original results fail the measured ordinary native-GP language test**; the second test excludes every secret row/column-additively padded mixed-integral instance without enumerating keys. The exclusions are conditional on preserving the original rune order inside the artificial grid and interpreting the plaintext as a direct native GP rune stream. A stateful nonlinear cipher, unknown secret column permutations, different boundary placement or a truly different language is not decided. Most importantly, **no creator-authored operation or unknown plaintext is recovered** by either tested model.

Both full positive controls and exact source 729-rune replay execute inside the consolidated [single-file 33-line source SFT](../sims/lp2_p0_p2_33line_13column_keyless_sft.cjs), additionally [passed on Windows Node.js22](https://github.com/FlareZ123/liber-primus/actions/runs/45057183271). The 51×13 extension leaves the preceding 50×13/13×50 stationary-column conclusion unchanged and retires the obvious adjacent cumulative decoders without adjusting the original manuscript.

## Issue #2305 decision and next useful input

A literal red-13 seed alone fails to specify a historical inverse: there is no first-party command selecting line-edge stripping, column direction, per-symbol update, key/state interpretation, period reset or handling of p1/p2's absence of a matching mark. The p2 **terminal** 13-dot placement is a concrete rival to a general marker-start state clock. The six elementary complete-body periodic and ±13-lag plaintext/ciphertext autokey operations using the unmodified red title as initial key give full-length decoded GP29 collision rates 0.034133–0.035313 and no sustained prose; exact arithmetic replay is a correctness invariant, not plaintext evidence.

Retain the original 13-rune body boundary and this optional lossless 33-line partition as reproducible source structure. **Reject the stationary-class-alphabet consumers**; future effort must obtain a first-party instruction or independently source-selected, *changing* operator and then demonstrate natural plaintext on the original 716 runes and an independent untouched receiver. Extending the 13-column pattern by extra guessed layers would overfit the same evidence.

**Reproduction:** [single runnable Windows Node22/CommonJS original-source test](../sims/lp2_p0_p2_33line_13column_keyless_sft.cjs). This test directly reads the canonical UTF-8 transcript, GP29 corpus, and both pinned control registers and asserts exact original reconstruction plus the reported finite counts.
