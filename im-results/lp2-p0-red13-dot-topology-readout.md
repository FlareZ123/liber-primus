# LP2 p0 source-visible 8:5 heading and 13-dot topological readout

**Evidence class (12 November 2026):** new visually constrained *candidate* readout, original 716-rune falsification of the most direct historical Vigenère consumer. **No recovered unknown plaintext, authentic key, or author-prescribed decipherment.** The exact input, dot route and four diagnostic readouts are fixed in the [single-file reproducer](../sims/lp2_p0_red13_dottopology_sft.cjs).

## A concrete human-visible operation

On original LP2 physical p0 (2014 archive image 17.jpg), the first red title is exactly 13 GP29 runes printed as two words of lengths **8 and 5**:

~~~text
S H E O G M IA F  /  S Y E NG C
~~~

A red 13-dot mark immediately after this title, before the first black TH, has the standard 3-column, 9-row geometry, listed top-to-bottom:

~~~text
.#.
#.#
.#.
#.#
.#.
#.#
.#.
#.#
.#.
~~~

This glyph contains **eight outer-column dots** (four left and four right) and **five center-column dots**. The two cardinalities exactly reproduce the immediately adjacent title's **8|5** printed word split. The 13-dot shape itself is a generic repeated punctuation stencil across LP2, so its presence alone is not an author instruction. Among all 31 source-censused 13-dot marks (30 red plus one black), 16 directly follow a red rune span; **p0 is the only such position whose preceding continuous red span has 13 runes**. This makes p0 a specific opportunity to test the word-to-dot alignment; it does not estimate the probability of coincidence.

Freeze the natural left-to-right/top-to-bottom route before any plaintext scoring:

1. Put the first eight runes in the eight outer slots, row-major (left then right on each two-dot row).
2. Put the next five runes in the five center-column slots from top to bottom.
3. Read the populated shape row-major.

The complete lossless 13-position output is **S S H Y E O E G M NG IA F C**, GP indices **[15,15,8,26,18,3,18,6,19,21,27,0,5]**. This is a source-motivated *key candidate*, not directly readable plaintext. The printable shape fixes only a reordering; it supplies **no independent instruction for the cipher family, key clock, whether the title itself is ciphertext, or how to process the rest of the book**.

## Full original-chapter test of the economical historical consumer

The first unsolved manuscript chapter covers original pp0–2, with physical rune lengths **262, 266, 201**, total **729**. When the 13 red symbols are read as a key/header, the remaining **716** are a candidate body. A repeating-key GP29 Vigenère is historically demonstrated in Cicada 2014. Test the specific dot-ordered key against *all 716 original body runes*, continuous across physical page cuts, with no fit to words or shifts. Sign − means plaintext=(cipher−key) mod29; sign + is its fixed inverse convention.

| Frozen mode | Whole-body GP29 IoC | Page0 body IoC | p1 IoC | p2 IoC |
|---|---:|---:|---:|---:|
| Direct subtract (−) | **0.034598** | 0.033586 | 0.034274 | 0.034229 |
| Direct add (+) | **0.034164** | 0.033554 | 0.035438 | 0.034378 |
| Ciphertext-F hold, subtract (−) | **0.036110** | 0.035270 | 0.036204 | 0.036318 |
| Ciphertext-F hold, add (+) | **0.036325** | 0.034590 | 0.037112 | 0.036269 |

Direct subtraction decodes the black opening to **T AE IA EA J H R Y M I J E TH TH N W AE D W O A M R H I Y OE TH**, not a readable chapter. Both no-skip arithmetic maps are bijections on all **716** original positions; their encoders exactly reconstruct every source ciphertext rune, and a full 716-symbol native GP solved-p57 repeat plant recovers exactly.

The historically inspired *ciphertext-F hold* diagnostics instead preserve all 33 original black F ciphertext symbols and suspend the key clock at those positions. In these frozen outputs, **21 (subtract)** and **22 (add)** further non-F ciphertext positions decode to F. A naive plaintext-F-skipping encoder therefore **cannot uniquely recover the original ciphertext without extra state**. These modes are diagnostic only, not claimed complete reversible decoders. All four original outputs lack an ordinary-language frequency signal and readable running text.

## Exact 27-cell odd/even stencil consumer (Agent5, 12 November 2026)

The dot glyph's *entire* 3×9 occupancy, viewed row-major, is precisely odd-indexed cells **1,3,…,25** of a 27-cell tile; all **14** blank cells have even indices **0,2,…,26**. This reduces the supposed 13-dot route to a source-printed **13+14 parity interleave** rather than a less familiar 2D traversal. It also offers a second independently visible alignment: the complete first chapter is **729 = 27×27** runes. A concrete, keyless, lossless test divides the unmodified original pp0–2 stream into 27 consecutive 27-rune blocks, fills each block's 13 marked dot positions with its first 13 runes and its 14 unmarked positions with the next 14, and reads all 27 tiles row-major. Inversion collects the 13 marked cells first and 14 unmarked cells second for every block; it exactly recovers all 729 original source positions. The first block uses the red 13-rune heading as its 13 marked-cell occupants, matching the visible p0 local arrangement.

On the actual original, the candidate transposition starts **TH S J H G E AE O F G J M OE IA O F N S TH Y N E E NG W C B**, and it yields no readable opening. The original 729-rune same-symbol-adjacent count **4** becomes **26**, but this is not plaintext evidence: a positional interleave naturally removes the source's unusual adjacency suppression. The global rune histogram, and therefore its index of coincidence, is unchanged at **0.034082515563997044**. The CommonJS [one-file test](../sims/lp2_p0_dot13_27block_interleave_sft.cjs) asserts the original ink, all 27 tile addresses, complete exact inversion, and a 729-rune solved-p57 native-GP positive plant.

**Decision:** The 13-dot/27² coincidence supplies a particularly economical possible *position permutation*, but the original artwork does not instruct a contemporary solver to repeat the stencil across 27 tiles, nor to apply a second symbol-changing cipher. This exact transposition fails as a stand-alone plaintext recovery and does not promote the 13-symbol red readout to a key. Pursue this branch only if an independent primary clue identifies the next symbol-changing or register-conversion step.

## A new cross-route arithmetic agreement: dot readout starts SSH and its suffix matches DH23 K=18

**Exploratory arithmetic only; no original plaintext (Agent12, 12 November 2026).** Agent14 independently noticed the first three runes of the row-major 13-dot readout are the exact GP letters **S S H** (SSH, a network protocol). The other **ten** runes read **Y E O E G M NG IA F C**, with GP indices \`[26,18,3,18,6,19,21,27,0,5]\`. Treating these as the signed 2013 Cicada TCP challenge's BASE29 digits yields the exact integer **386252824294711**, whose residue modulo the challenge's DH prime 23 is **18**.

An already independently investigated *different* original-input route on this same p0, documented in [the historical DH candidate](p0-dh23-red-heading-exchange.md), reads the **untransposed** 13-rune red title as BASE29 value \`5412445423142629857\`. That value satisfies \`N mod22=7\`, assigning the DH server exponent \`a=7\`; the first *seven black runes* after the red13 mark are BASE29 \`1420123033\`, giving potential client public share \`B=16 mod23\`. The published signed DH parameters \`p=23,g=5\` then give \`A=5^7 mod23=17\` and shared secret **\`K=B^a mod23=18\`**. Thus **the dot-routed 10-rune suffix and the previously proposed complete DH exchange produce the same 18** through two different arithmetic paths. The untransposed red-heading last-ten GP digits have residue **14 mod23**, so this is not the raw unpermuted suffix readout.

**Source-matched null rules out statistical promotion.** A fully fixed 5,000,000-title deterministic null holds constant the four raw title digits that force the SSH prefix and known final GP digit5 (source positions 0=S, 1=H, 8=S, 12=C). It retains only generated red titles satisfying the earlier **DH-selected two raw congruences** (\`N mod22=7\` and \`N mod23=0\`), then applies the *same exact* 8|5 dot route and tests whether the ten-rune suffix equals 18 modulo23. Exactly **9,969/5,000,000** null titles satisfy both raw congruences; **435/9,969 = 4.3635%** also have suffix modulo23 equal18, indistinguishable from the elementary uniform **1/23 = 4.3478%** expectation (433.43 matches). In this source-matched conditional ensemble, the extra residue agreement has **no detectable independent selectivity**. This is a deterministic internal control, not a universal statistical likelihood for author intent; it positively argues **against promoting the observed SSH/DH congruence as a key**.

The source-fixed top-to-bottom/left-to-right route supplies SSH and the matching residue. A finite orientation sensitivity check (reverse each word, reverse the nine rows, mirror the two-dot rows) yields **eight distinct dot-routed 13-rune sequences**; only the original row-major sequence starts SSH **and** gives suffix residue18. This is a descriptive count of a small, retrospectively motivated candidate panel, not calibrated confidence. The hexadecimal suffix integer is 49 bits, exceeding 48-bit simple IPv4-plus-16-bit-port capacity, so the suffix is **not** such a direct packet encoding.

This correspondence merits preserving because the historical source **independently specifies BASE29, DH prime23 and g5** and the manuscript specifies the adjacent 13-rune red heading/13-dot geometry. However, the SSH prefix, suffix cut at three runes, reading ten digits as BASE29 and applying mod23 were identified after earlier DH work; selecting that agreement post hoc weakens its evidentiary value. The 2013 DH source does **not** instruct solvers to turn p0 typography into a protocol request, has no SSH endpoint, and does not authenticate the p0 public-share/exponent assignment. The **exact shared secret18 had already been derived as a conditional hypothesis**, so the agreement is a new internal cross-check, not newly recovered authorized key material. No operation consuming K18 to produce original LP2 plaintext is specified; previously tested direct consumers in the DH report fail. **Do not promote this to authenticated plaintext or search arbitrary SSH hosts.**

[Exact original-data reproducer and orientation control](../sims/lp2_p0_ssh_dh23_crossroute_sft.cjs).


### Lossless 13-versus-14 numeral-pair consumer

The parity stencil also suggests a more direct source-framed *symbol-changing* operation, rather than transposition alone. In each 27-rune tile, each of the 13 marked positions has an immediate adjacent blank to its left and right. Pair the first 13 source runes with the 13 neighboring blank-symbols from the following 14, retaining the unpaired 14th blank as side information. Subtract GP29 values, preserving the paired blank values as a **378-rune explicit mask**. The result is a **351-rune potentially plaintext-bearing difference channel**; the exact 351 differences and 378 mask symbols reconstruct all 729 original runes, without a guessed cipher key or irreversible compression. This is a testable, economical arithmetic candidate, although neither original p0 nor the dot symbol explicitly says to subtract.

Two nearest-neighbor choices are fixed entirely by the image stencil: the blank immediately left of each dot (source offset13), or the blank immediately right (source offset14). Under ordinal GP29 subtraction, the genuine original difference channels have index-of-coincidence **0.03342287342** (left) and **0.03462759463** (right), both ciphertext-like. Their first 20 rune outputs are, respectively, **P Y EO W G H C Y G A N O IA W G A EA OE EO E** and **R TH OE O A Y A L P B F X B S B N A U N M**. The alternative GP-prime-weight subtraction also leaves original channels near uniform, at **0.03439967440** (left) and **0.03496947497** (right), with no legible opening. No candidate yields a native-GP readable instruction or manuscript plaintext. Output-sign reversal merely permutes the GP symbol labels and does not change IoC.

The [expanded original/source-positive CJS test](../sims/lp2_p0_dot13_27block_interleave_sft.cjs) exactly reconstructs every original rune for both flank pairings and encrypts then decodes an independently solved p57 GP29 **351-rune synthetic message** under a retained 378-rune mask. Its implementation ran successfully in [the manual-only GitHub Actions original-input job](https://github.com/FlareZ123/liber-primus/actions/runs/43332704611). The actual source yields no verified unknown plaintext; the native plant proves only correct inversion. The source also fails to specify which flank would be used or whether this compression-like presentation is intended. **This retires the immediately motivated paired subtraction consumer and makes arbitrary further dot-based algebra a poor use of effort without a new clue.**

## Research decision

The **8|5 red-title split exactly mirrors the 8-outer/5-center topology** of the adjacent standard 13-dot punctuation. This offers a visually selectable, finite route on the original header, rather than arbitrary ciphertext-index arithmetic. The source-selected part is the route; an actual LP2 decipherment would still need an independently fixed consumer and key/state interpretation. The most economical historical repeat-key consumer fails on untouched p0–2 ciphertext, and the F-hold extension is not self-inverting. **Do not iterate dot orientation, free key offsets, arbitrary downstream substitutions or phase searches based solely on this clue.** Promote the route only if an independent source prescribes how its output enters a reversible GP29 cipher and yields held-out original plaintext.
