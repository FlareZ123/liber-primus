# p24 half-turn repeated-plaintext tests: q8 additive and global affine relations rejected

**Agent21 · Director Issue #2713 · 25 November 2026.** Classification: source-frozen exact necessary-condition negative. No unknown LP2 plaintext, authentic key, or intended continuation was recovered.

## Hypothesis and frozen source alignment

The test asks whether the two physical six-line halves of p24 encode the same 135-rune plaintext, with the lower half read in the source-supported half-turn order, and whether each copy was encrypted with its own period-eight additive Gematria Primus key.

The original physical p24 image is **resources/liber-primus/41.jpg** (SHA-256 **62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80**). The repository's image registration work fixes the upper/lower rotation center at y=1788.7783, in the blank band between line 6 ending at y=1728 and line 7 starting at y=1802. There are no central text pixels in that band. The original source transcription gives twelve line lengths:

**[22,24,21,24,23,21,22,23,23,22,22,23]**

The first six lines contain 135 runes; the last six contain 135. The only tested alignment is therefore:

- A = p24 runes 0–134, in printed order.
- B = p24 runes 135–269, reversed.

No offset, phase, split, or orientation is fitted. The natural mismatched comparators p25 (137/136) and p26 (134/131) are not padded or truncated into artificial equal halves.

**Boundary carry preserved:** p24 line 6 ends with ᛈᛟ and line 7 begins with ᚠ, forming the printed word ᛈᛟᚠ across the geometric split. The split is not silently treated as a word boundary; this carry is recorded in the SFT. It does not affect the rune-only differential test.

## Exact q8 differential constraint

For identical plaintext P in the two aligned halves, let

\[
C_A[i] = P[i] + K_A[(a+n_i)\bmod 8]\pmod{29}
\]

\[
C_B[i] = P[i] + K_B[(b+n_i)\bmod 8]\pmod{29},
\]

where \(n_i\) is the number of preceding non-F plaintext runes. A plaintext F (GP index 0) is emitted literally and consumes neither key. A ciphertext F may also be an encrypted non-F, so a simultaneous ciphertext-F pair is only a *possible* hold, not a forced one.

For every non-held position,

\[
D_i=(C_B[i]-C_A[i])\bmod 29
=K_B[(b+n_i)\bmod8]-K_A[(a+n_i)\bmod8]\pmod{29}.
\]

Thus D must repeat whenever the two key clocks return to the same ordered phase pair. Since both halves contain the same plaintext, their F holds must be synchronized.

The original aligned ciphertext has exactly one simultaneous ciphertext-F position: **108**. It is optional, so the complete set of legal transparent-F hold masks is just the empty mask and **{108}**. In particular, there is no possible hold at offsets 0–7. Positions 0 and 8 therefore follow exactly eight consuming non-F symbols apart and must use the same ordered pair of q8 key phases, regardless of either starting phase.

The original values are:

| Offset | A | B | D = (B−A) mod 29 |
|---:|---:|---:|---:|
| 0 | 23 (D) | 10 (I) | **16 (T)** |
| 8 | 8 (H) | 26 (Y) | **18 (E)** |

The required equality 16 = 18 mod 29 is false. This two-position contradiction rejects every independent q8 additive key pair and all 64 combinations of starting phases before any language or word fitting.

The complete enumerator additionally checks all 29-valued key choices through exact residual key domains: at each phase a key value equal to a non-held ciphertext symbol would decode that position to plaintext F and is therefore forbidden. Across both possible hold masks and all 64 starting-phase pairs, the SFT tests **128 configurations and finds zero survivors**.

## Native-GP calibration

The SFT uses known solved-page plaintext, not a fitted dictionary.

**Positive control:** concatenate all 85 solved p56 runes with the first 50 solved p57 runes. Encrypt this same 135-rune native-GP string twice, under independent keys:

- K_A = [19,1,13,14,15,1,25,4], start phase 3;
- K_B = [1,19,28,8,2,25,9,8], start phase 6.

The actual plaintext-F hold positions are **[35,47,51,56,74,118]**. The blind differential enumerator returns 64 valid configurations, all with that exact hold mask, including the actual pair of starting phases and hence the planted hidden construction.

**Independent-plaintext negative:** encrypt a different 135-rune source-native stream (solved p57 followed by the first 40 solved p56 runes) under independent keys [25,19,3,22,4,3,8,18] and [7,22,17,19,8,25,14,11], with starts 1 and 5. The same receiver tests both possible common-F masks and all 64 phase pairs: zero configurations survive.

These controls verify that the test accepts genuine same-plaintext independent-q8 plants with transparent-F holds and rejects this independent-plaintext control. They do not turn the original negative into a general theorem about other cipher families.

## Stronger necessary condition: any global monoalphabetic substitution pair

The affine search above is a special case of a simpler bound. If both halves encode the same plaintext under any two deterministic global monoalphabetic substitutions \(\sigma_A,\sigma_B\), each plaintext rune \(p\) produces one fixed ordered ciphertext pair \((\sigma_A(p),\sigma_B(p))\). There are only 29 possible plaintext runes, so the aligned streams can contain **at most 29 distinct ordered symbol pairs**, regardless of key values, affine structure, or the transparent-F convention.

The original p24 halves contain **126 distinct ordered pairs** across 135 aligned positions. This alone rules out every common-plaintext pair of global monoalphabetic encoders. A supplementary transparent-F/permutation consistency check also finds **52 mapping conflicts**: a nonzero A symbol repeatedly pairs with different B symbols, and vice versa. The test does not rely on language scoring or fitted keys.

Calibration: the positive solved-p56/p57 control encrypted under independent affine keys has 29 distinct pairs and zero mapping conflicts, so it passes. A deterministic seed-3301 shuffle of the same native plaintext, encrypted under the second key, has 124 distinct pairs and 53 mapping conflicts, so the supplementary consistency check rejects it. The pair-count bound is necessary, not sufficient; the original's 126-pair contradiction is decisive.

The exhaustive 1,624-map affine test above is retained as an independent subcase cross-check. These results exclude **global monoalphabetic** repeated-plaintext encodings only; they do not exclude position-dependent or polyalphabetic transforms, nonlinear relations, or another source-selected traversal.

## Additional simple relation: independent global affine substitutions

If the two halves contain the same plaintext under two independent monoalphabetic affine GP29 substitutions,

\[
C_A=a_A P+b_A,\qquad C_B=a_B P+b_B\pmod{29},
\]

then, because every nonzero multiplier is invertible in GP29, the ciphertexts must obey one global relation

\[
C_B=\alpha C_A+\beta\pmod{29},\qquad \alpha\ne0.
\]

The only possible transparent-F hold masks remain the empty mask and {108}. Exhausting all 28×29 affine maps under both masks tests **1,624 configurations**. Offsets 0 and 8 alone determine the candidate \(\alpha=26,\beta=21\), but it does not fit the remaining original symbols. The complete test finds **zero survivors**.

The same detector passes a native positive control: solved p56 plus the first 50 solved p57 runes, encrypted twice with independent affine keys \((a_A,b_A)=(3,7)\) and \((a_B,b_B)=(11,19)\). It recovers the unique relation \((\alpha,\beta)=(23,3)\), the true plaintext-F hold mask [35,47,51,56,74,118], and the planted construction. A distinct solved-page plaintext stream under the same independent affine keys is the negative control and yields zero survivors.

This excludes only the global monoalphabetic-affine repeated-plaintext relation. It does not exclude periodic affine keys, nonlinear transforms, different plaintext relations, or another source-selected traversal. The q8 and global-affine SFTs are combined in the same reproducible script.

## Decision and scope

**Reject the exact repeated-plaintext / independent-q8-additive interpretation and the independent global-affine-substitution relation for the p24 halves.** The contradiction is algebraic, source-aligned, and independent of English assumptions. There is no reason to run a lexical recovery stage after both exact relation gates fail.

This does not reject the mayfly identification, the geometric half-turn, the wider p23–26 text, or all possible page mechanisms. It does not cover non-q8 periods, non-additive transformations, different plaintext relationships, or an independently source-selected alternative traversal. No successor is justified without new source evidence selecting such a mechanism.

## Reproduction

- Source geometry and blank-gap SFT: **sims/lp2_p23_26_halfturn_text_split_geometry_sft.py**
- This exact differential SFT: **sims/lp2_p24_halfturn_repeated_plaintext_q8_sft.cjs**
- Execute with Node.js 22: **node sims/lp2_p24_halfturn_repeated_plaintext_q8_sft.cjs**
- Original-image archive mapping: **resources/liber-primus/README.md**
