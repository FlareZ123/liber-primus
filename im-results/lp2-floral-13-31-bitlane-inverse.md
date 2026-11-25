# Floral 13/31 five-bit lane inverse — original chapter decision

**Agent44, 25 November 2026.** No unknown LP2 plaintext or authentic key recovered. A new direct geometric-mask receiver is impossible for every nonidentity relative cyclic rotation/reflection across either complete floral chapter. An independent exact marginal obstruction also rules out arbitrary independent position permutations of the two source-selected lanes, even with arbitrary static relabeling within each lane, for all length-matched windows in the six frozen literary GP registers.

## Source-selected operation

The original p40–55 floral frame has the same five positions on each side: three solid and two pale/hollow left dots, five solid right dots. The source-locked top-to-bottom reading is 01101₂=13 and 11111₂=31. This is the sole substantial mirrored-ink asymmetry in the plate ([original-pixel result](lp2-floral-original-mirror-common-ink-payload-gate.md)). A possible puzzle operation is to use those five positions as the five bits required to encode a GP29 rune. Split each rune into the source mask M=13 and its complement 31 XOR 13=18. The opposite bit order gives M=22, complement9. Test ordinary zero-based GP indices and their one-based counterparts (0–28 or 1–29). These four representations are fixed; no arbitrary bit mask was selected to optimize the output.

For source tape C of length n, choose a relative cyclic rotation or reflection of the complementary lane:
`P[i] = ((C[i]+o)&M | (C[(d*i+s) mod n]+o)&(31 XOR M))-o`,
where d=±1, s=0…n−1, o=0 or1. The common whole-tape order is held fixed; arbitrary common reordering cannot change native alphabet validity or the marginal invariants below. The inverse uses the same d and shift −d*s modulo n. Exclude the identity d=+1,s=0, which simply returns ciphertext. This is a specific interpretation of the dot mask, not an authenticated instruction. All printed separators are ignored.

## Exact original inverse

| Original tape | Number of runes | Nonidentity shifts/reflections per representation | Minimum invalid GP values, offsets 0/M13, 0/M22, 1/M13, 1/M22 | Valid nonidentity alignments |
|---|---:|---:|---|---:|
| p40–53 | 3008 | 6015 | 112, 128, 174, 141 | 0 |
| p54–55 | 308 | 615 | 9, 7, 9, 6 | 0 |
| p40–55 | 3316 | 6631 | 135, 142, 177, 157 | 0 |

All four representations fail on each complete tape. Allowing independent relative shifts per physical page does not rescue a meaningful chapter inverse: 13 of 15 rune-bearing floral pages have zero nonidentity alignments across all four representations. p49 admits 10 variant/shift pairs and p55 admits nine; their recorded candidate prefixes are nonprose and their full inverse round trips are automatic. No short-page language test is claimed; the complete-chapter failures are exact alphabet-domain exclusions.

The four positive controls plant distinct legal nonidentity rotations/reflections on a 95-rune prefix of the genuinely solved WARNING text. All four true inverse choices are retained and recover 95/95 exact original control runes; the complete candidate sets have 11,54,2,7 nonidentity choices respectively. These are feasibility/recovery controls sharing the same native text, not four independent trials or proof of unique key identification. All valid original and control candidates undergo exact full forward replay. Authentic p56 85/85 with 84 consumed prime shifts and p57 95/95 are cross-checked against the native solved register.

## Stronger arbitrary-permutation obstruction

Let a_i=(C_i+o)&M and b_i=(C_i+o)&(31 XOR M). An arbitrary independent permutation of positions in each lane preserves the entire eight-bin a histogram and four-bin b histogram. Even allowing arbitrary independent bijections of the eight and four lane values, the **sorted** histograms must be unchanged. This applies regardless of word boundaries, cyclic or noncyclic permutation, independent page resets, or any shared global positional permutation, provided the register is length-preserving and the selected lane partition and static relabelings apply across the tested tape. If lane-value relabelings vary by page or position, this stronger scope no longer follows.

Compare all contiguous windows of the exact same length in the repository's pinned Gibran, Shakespeare and Emerson texts, both the established greedy and ING/IO-calibrated GP normalizers. This is a finite prose comparison, with two correlated normalizations per text; no claim of exhaustive English coverage. The strongest single-bin separation is the **minimum** of the eight lane counts, itself invariant under arbitrary lane relabeling.

| Tape | Original least-populated three-bit bin (four representations) | Maximum such minimum over all matched literary windows | Windows matching both sorted lane histograms |
|---|---|---|---:|
| p40–53 (1,189,427 windows per representation) | 200,216,289,223 | 58,193,54,53 | 0 |
| p54–55 (1,205,627 per representation) | 22,23,31,21 | 20,26,20,14 | 0 |
| p40–55 (1,187,579 per representation) | 222,239,325,244 | 63,212,59,57 | 0 |

For the terminal GP0/M22 variant, 1,879 windows clear the minimum-bin relaxation, but none match even the sorted three-bit histogram, so its complete necessary condition also fails. The other eleven tape/representation cases fail the simpler scalar bound. All 1,141 length-308 windows inside individual genuine solved native sections fail both sorted histograms as well, with maximum minimum counts 6,13,5,11. The longer unknown chapter exceeds the 2,979-rune combined solved register, so no matched native window is claimed for it. In the primary GP0/M13 case, mask value12 selects the three legal rune values 12,14,28 (EO, X, EA). p40–53 has 289 of these, against at most 58 in every matched literary window. This fixed-class difference illustrates why rearranging lanes cannot yield ordinary source-register text.

The implementation additionally enumerates all 4!×4! independent position permutations for a four-symbol toy across the four representations, validating both exact marginal invariants on every one of 2,160 legal recombinations. This does not make all mathematically compatible histograms sufficient for plaintext.

## Decision and reproducibility

Retire pure relative rotation/reflection and the stated arbitrary two-lane permutation/relabeling receiver under this source register. A combined nonstatic substitution, another alphabet encoding, altered length, position-dependent lane relabeling or a different source-selected operation is outside the test. No claim about every possible floral 13/31 receiver or actual unknown plaintext. Do not rescue the two-lane idea with arbitrary masks or a newly tuned letter-to-bit encoding without an independent source selector.

[Read-only Node22 CommonJS SFT](../sims/lp2_floral_13_31_bitlane_inverse_sft.cjs) · [complete raw output and exact source blob pins](lp2-floral-13-31-bitlane-inverse.json). Executed successfully in the connected V8 runtime with the committed source contents; no independent Windows CI run. The exploratory mask histograms were inspected before the full experiment; the finite window bounds and exhaustive alignment enumeration are exact, but this was not a blinded preregistration. The source clue and its reverse were fixed by the physical mark, rather than by tuning a mask from the ciphertext.
