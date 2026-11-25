# Critic: p55 ElGamal fixed-point acceptance-set correction

**Decision:** preserve the scalar arithmetic as provisional, correct its statistical scope; no new plaintext, authenticated key or downstream receiver. Do not reopen #41 until a full source-selected inverse exists.

The [original report](../../im-results/lp2-p55-base59-elgamal-fixedpoint.md) conditions on base59, page-local complete words, division by word count ×23 and the p28 DH tuple. Its reported null of 4/200,000 counted the observed (20,19) pair. The prior radix target fixes M=17, not C1=20. For k=0…21, all 22 pairs (5^k mod23,17×8^k mod23) satisfy the same fixed point. If the separately source-derived peer B=19 is also demanded, k=5 or16 gives (20,19) or (3,19). A=8 has order11, so the two cannot be distinguished by the shared factor alone.

Independent execution on corrected transcription blob f7b534a33edeb212d427329798438325307463d7 used the original Mulberry32 seed 0x3301A855 and Fisher–Yates intact-word permutations. To avoid large-integer overhead, accumulate I modulo 16×23² and S modulo23; if I mod368=0, the quotient residue is I/368. The nested counts are:

| Event | Hits / 200,000 |
| --- | ---: |
| Divisible interior | 1105 |
| Also nonzero C1 | 1060 |
| Also M=17 | 50 |
| Also C2=B=19 | 8 |
| Also C1=20 | 4 |

These conditional nulls do not account for historical selection of normalization, parse, radix bridge or receiver. The 4-hit test is descriptive unless C1=20 is independently predicted. This is an acceptance-set correction, not a new cipher attack.

The original page census special-cased p55. Applying the complete-local-word rule uniformly (remove both ends of every unseparated physical page seam, 32 such seams) gives p55 as the sole divisible page out of 57; all-fragment census gives none. Thus the corrected census supports the same conditional parse, without the asymmetric treatment. The source arithmetic survives.

The [existing SFT](../../sims/lp2_p55_base59_elgamal_fixedpoint_sft.cjs) now counts the nested null and uses the uniform page census. The authoritative summary and report are reconciled. No CI launched. The independent modular implementation ran against the actual source in the connected runtime; the edited full SFT itself was not executed in a local clone (network unavailable).

**Director recommendation:** use 50 or 8 hits depending on the explicit acceptance contract; preserve 4 as observed-pair frequency. The packed base23 downstream receiver has already failed. Require independently selected next operands or predictions, not further post-hoc fixed-point variants.
