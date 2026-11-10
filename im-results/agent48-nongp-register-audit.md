# Non-GP register audit: source-locked candidates

**Status:** negative intermediate result; issue #14 remains open. No recoverable plaintext register was found.

## Decision

The proposed 32×8 state/class lookup is not a reversible decoder as originally stated. For each state it maps 29 possible next runes into eight classes: seven classes contain four distinct runes each, and the repeat class contains one. Returning only the selected table cell therefore discards two bits for every nonrepeat transition.

I tested two source-motivated ways to turn the visible rune stream into a non-GP byte register:

1. variable-width base-29 integer conversion of the 13-dot-delimited fragments;
2. a fully reversible five-bit/Base32 completion of the 32×8 state/class proposal.

Both produce random-like byte streams rather than plaintext. This retires these exact constructions; it does **not** prove that every possible non-GP register is impossible.

## Original-input facts

The canonical corpus and ink annotations give:

- 12,956 runes on 55 nonempty pages 0–55;
- 86 within-page adjacent equal-rune pairs; no cross-page equal pair;
- 55 page-initial runes, treated as visible IVs in the transducer test;
- 31 13-dot marks over LP2, of which 27 are inside the unknown stream and one is at its end;
- 32 fragments delimited by the 31 marks; the first 28 fragments contain all 12,956 unknown runes;
- none of the 86 doublets starts at a page-initial position or coincides with a 13-dot marker immediately before or between its two runes.

The 28 unknown-fragment lengths are:

`13, 716, 16, 103, 3, 690, 11, 308, 0, 14, 1729, 0, 9, 11, 1883, 16, 1005, 19, 1414, 10, 81, 8, 1460, 3, 118, 3008, 9, 299`.

The absence of boundary alignment does not disprove a repeat class, but it gives no support for treating the 86 doublets as page/ornament control events.

## Adjacent-repeat structure

The doublet deficit is much more informative than the raw count. Across the 12,901 within-page adjacent pairs, the observed rate is 86/12,901 = 0.6666%. Under an IID null using the observed 29-rune unigram frequencies, the equal-pair probability is 0.0345529 and the expected count is 445.77. Correcting the null variance for overlapping adjacent-pair indicators gives \(z=-17.3409\). The observed diagonal count is only 19.29% of the IID expectation, i.e. an 80.71% suppression.

The suppression is approximately uniform across rune identities: after fitting one global survival factor \(q=86/445.77=0.19293\), the per-rune diagonal counts give Pearson \(\chi^2=27.79\) on 28 degrees of freedom and Poisson deviance 28.39. The expected per-rune counts are small, so these are diagnostics rather than a definitive asymptotic test.

The unigram distribution itself is close to uniform: Pearson \(\chi^2=26.36\) on 28 df, with rune counts from 399 to 492 (mean 446.76). A simple **one-fifth repeat-survival** model is also compatible with the data: it predicts 89.15 doublets, and the per-rune diagonal counts give \(\chi^2=26.91\) on 28 df (Poisson deviance 28.51). The fitted survival factor is 0.19293. The five-dot ornament is a possible prompt to notice a fifth, but there is no evidence tying it to this estimated probability; treat \(q=1/5\) as a compact statistical approximation, not a decipherment.

Conditioning each off-diagonal row on its observed predecessor count and renormalizing the global unigram distribution over the 28 non-self symbols gives Pearson \(\chi^2=778.74\) across all 812 cells (minimum expected count 12.58). The unconditioned \(p_i p_j\) diagnostic gives \(\chi^2=816.57\); both are consistent with no extra off-diagonal transition structure.

**Interpretation:** the 86 repeats behave like residual survivors of a global soft no-repeat filter much more naturally than like deliberate control markers or a state-dependent plaintext channel. This is a statistical model, not identification of the filter's implementation. It weakens the motivation for assigning the repeat class a special plaintext meaning in the 32×8 transducer. The script's `repeat_filter_statistics` block reproduces the overlap-corrected IID null, per-rune thinning diagnostics, and off-diagonal independence checks.

## Candidate A — fragment-wise base-29 integer coding

The 13-dot marks give a natural, source-visible segmentation. For each fragment of length (L), interpret its GP indices (d_i) as one base-29 integer:

[
N=sum_{i=0}^{L-1} d_i 29^{L-1-i}.
]

Serialize it big-endian into the minimum fixed width (w) satisfying (256^w ge 29^L). This preserves leading zeroes and is reversible for each known fragment length. Little-endian digit order was also checked as a control.

| Direction | Bytes | Shannon entropy | Distinct byte values | Printable fraction | Longest printable run |
|---|---:|---:|---:|---:|---:|
| Big-endian | 7,879 | 7.97718 bits/byte | 256 | 0.39739 | 11 |
| Reversed digits | 7,879 | 7.97840 bits/byte | 256 | 0.38723 | 12 |

Neither stream begins with a common file signature or yields readable text. The natural fragment-wise base-29 register is therefore not a plaintext recovery.

## Candidate B — reversible five-bit state/class register

To test whether the 32×8 table can supply the missing information, I froze one explicit, bijective completion. This is a hypothesis, not a claim about creator intent:

- state row is the previous visible GP rune;
- page-initial runes are visible IVs and are omitted from the register;
- red 13-dot marks reset state to 13; the black 13-dot mark resets it to 31;
- for a nonrepeat current rune, rank it among the 28 non-predecessor runes, obtaining (r=4q+u), with (qin[0,6]), (uin[0,3]);
- `grid[state][q] mod 24` selects a lexicographically ordered permutation of four elements (one of (4!=24)); output (4q+pi(u));
- for a repeat, output (28+(`grid[state][7]` mod 4)).

Thus columns 0–6 permute the four members of each quartile, and column 7 selects one of the four reserved five-bit repeat codes 28–31. The 29 input transitions map injectively to 29 output codes for every one of the 32 states. The script verifies all 32×29 state/input pairs in both permutation directions with an exact round-trip control.

After omitting the 55 page IVs, the source produces 12,901 five-bit symbols. This length is (5 mod 8), a syntactically allowed unpadded Base32 length. The forward-permutation direction ends in code 8, whose three padding bits are zero; the inverse direction ends in code 11 and fails that padding check. The forward byte stream nevertheless has:

- 8,063 bytes;
- 7.89415 bits/byte Shannon entropy;
- all 256 byte values present;
- 0.40965 printable fraction;
- longest printable run of 9;
- no common file signature at offset zero.

The valid padding is a weak coincidence (one of eight possible low-three-bit endings), not evidence of plaintext. The decoded bytes remain random-like.

For comparison, returning `grid[state][class]` directly gives only eight possible outputs per state and is non-injective; its 12,901-byte output has 7.00910 bits/byte entropy and is not readable text.

## External lead (not used to tune these tests)

A separate 2026 analysis in [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/docs/LP2-ANALYSIS-SUMMARY-2026.md) reports the same diagonal-only pattern. Our independent calculation above reproduces the key statistical shape from the canonical corpus; the external project's broader claim of no higher-order structure remains external evidence to review. Together these results make a deterministic previous-rune transducer less attractive and strengthen the case for looking for an external or derived keystream.

## Reproduction

Run:

`node sims/state_class_nongp_register_audit.cjs`

The script reads only the canonical local grid, corpus, and ink-annotation resources; it records their SHA-256 hashes, source counts, fragment conversions, output statistics, and the state/input bijection control.

## Handoff

Do not continue unconstrained bit-field, permutation-order, or packet-width sweeps on this same proposal. The direct lookup is lossy; the natural base-29 fragment conversion and the explicit five-bit completion do not yield plaintext. Keep issue #14 open for a *new source-selected* residual channel, register, or external key dependency. Otherwise, effort is better spent on recoverable external pad/seed material than on further repairs to this underdetermined transducer.
