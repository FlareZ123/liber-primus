# P28 READ OUT -> HERE: expanded family and failed cross-line holdout

**Agent 9, 19 November 2026. Director #1736. Classification: familywise-exceptional local output, negative promotion gate.** The original p28 checkpoint survives a much broader orientation family, but the source-ordered cross-line consequence frozen before scoring does not produce a recognizable result. Retain HERE as post-discovery corroboration; do not promote it to an authored subpuzzle checkpoint.

## Source-derived setup

The literal-DH physical line on p28 reconstructs the state

\[
(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2).
\]

Standard DH inversion gives \(b^{-1}\bmod 22=3\). The p28 READ OUT candidate uses the page's three printed periods for exponent 3 and the physical page number minus one, 27, for the five-rune word exponent. The centered one-based word28 object maps exactly to READ OUT. The period/page formula itself failed its frozen nearest-center transfer in Director #1735; this report treats READ OUT as the current p28-local candidate, not a general cipher rule.

The already fixed reversible outer-pair map is

\[
H(x,y)=(x-y,x+y)\pmod {29},
\]

with inverse

\[
H^{-1}(u,v)=\bigl(15(u+v),15(v-u)\bigr)\pmod {29}.
\]

At the natural p28 page start, the original scan (archive image 45.jpg) and canonical transcription agree on the first two printed fragments:

- PC, rune values [13,5], outer H = [8,18] = HE
- JTHBIW, outer values [11,7], outer H = [4,18] = RE

The output is HERE. The line's visible geometry is

\[
[\text{line runes},\text{fragment count},\text{first length},\text{second length}]
=[23,5,2,5]=[p,g,K,g].
\]

The exact [p,g,K,g] geometry occurs twice manuscript-wide, but p28 is its only page-start occurrence.

## Frozen target register and orientation family

The target register is the unchanged finite English set used by the earlier p28 phrase-family audit: 32,033 unique lowercase words of length at least three, drawn from the pinned word-frequency, Gibran, Shakespeare, Emerson, and LP1 plaintext resources. No target words were added after seeing the expanded outputs.

The source family includes:

1. every p28 physical line with at least two multi-rune fragments;
2. every manuscript line whose four visible geometry slots (total runes, fragment count, first-fragment length, second-fragment length) all belong to the recovered DH value set {23,5,6,15,8,19,2}.

This gives 12 eligible p28 lines, 22 DH-typed lines, and 33 unique lines in their union. Every physically adjacent fragment pair admitted by the prior work is included; both fragments must be multi-rune. The union contains 124 pairs (41 on p28 lines and 87 on DH-typed lines).

For each pair, all 16 orientation configurations were charged:

- H or H-inverse;
- outer endpoints in forward or reverse order;
- the two coordinates of each transform in normal or swapped order;
- the two fragment outputs in source or reverse order.

This is a conservative superset of the H/H-inverse, pair-order, and direction choices. The family therefore contains 1,984 transforms.

## Expanded-family result

The matched 33-line family produces 11 lexicon hits, 11 distinct words, across four pages. HERE appears exactly once:

- p28 line1, fragments1-2: PC | JTHBIW
- H, forward endpoints, normal coordinate order, source fragment order
- [8,18,4,18] = HERE

The broader manuscript control includes all 594 rune-bearing lines and all 2,347 adjacent multi-rune fragment pairs, under the same 16 orientations: 37,552 transforms. It produces 105 lexicon hits (103 distinct words) across 49 pages. HERE still appears exactly once, at the same p28 pair and orientation.

Thus the local HERE output remains exceptional after charging the expanded orientation family and the full prior adjacent-pair population. This is a familywise result about the visible local output, not proof of authorial intent or a whole-page decryption.

## Frozen cross-line holdout

Before opening this output, the holdout was fixed by source-visible order only: the final multi-rune fragment of p28 line1, followed by the first multi-rune fragment of p28 line2. It is not one of the within-line pairs used in the family.

The selected fragments are TDXY and ERD. Applying only the surviving operation—H on forward outer endpoints, with the fragments in source order—gives:

- TDXY endpoints [16,26] -> H [19,13] = MP
- ERD endpoints [18,23] -> H [24,12] = AEO
- combined output [19,13,24,12] = MPAEO

MPAEO is not in the frozen target register and supplies no exact structural prediction. The holdout therefore fails. No H-inverse, endpoint reversal, coordinate swap, fragment reordering, or alternative boundary is used to rescue it.

## Decision

The Director #1736 negative promotion fork applies:

- HERE is a robust, source-local, familywise-exceptional output under the charged 16-orientation family.
- The untouched source-ordered cross-line consequence fails.
- Therefore retain READ OUT -> HERE as post-discovery local corroboration only; do not promote it as an authored subpuzzle checkpoint.
- Stop extending HERE-indexed key menus. The separate p28 THE recurrence is a different post-location candidate and is not a substitute for this failed holdout.

No p50 output semantics, p0 candidate plaintext, or later HERE-indexed key construction entered this family audit.

## Reproduction

- SFT: sims/lp2_p28_readout_here_page_start_sft.cjs
- Node 22 deterministic source test; Windows run to be linked after validation.
- Original source image: resources/liber-primus/45.jpg (same archive page as the supplied original JPEG).
