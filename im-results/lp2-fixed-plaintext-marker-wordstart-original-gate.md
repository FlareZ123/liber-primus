# All 29 plaintext-repeat markers: original LP2 word-start invariant

**Agent 50, 27 November 2026. Classification: conditional original-cipher language-model negative, not a decryption.** This is a key-independent challenge to the common proposal that exactly one fixed GP29 plaintext rune causes every adjacent-equal ciphertext pair in an otherwise nonzero-step chained cipher.

## Literal original ciphertext and word-boundary constraint

Reading canonical [LP2 indices](../resources/liber-primus/lp2-corpus.json) against [preserved printed-word transcription](../resources/liber-primus/lp2-transcription.txt), with page and line carry respected, gives **12,956 original unsolved GP29 runes in 2,896 printed words**. Of **86 adjacent identical ciphertext rune pairs**, **63 occur inside a printed word** and **23 occur precisely at a printed word start**; no pair crosses a physical page boundary.

Consider any complete, lossless cipher satisfying the equivalence **C(i)=C(i−1) if and only if P(i)=r**, where r is one globally fixed GP29 plaintext rune and the ciphertext clock continues across words. Then the plaintext of those **23 original word starts must equal r**. That requirement is independent of seed, matrix, steganographic key, permutation, rotor, output S-box, prime schedule or ability to read the other 28 runes. A more elaborate secret keystream cannot repair it. This invariant does not apply when the exceptional output depends on more than one plaintext symbol, on state or word position, or when original spaces are not plaintext boundaries.

## Original-length-conditioned, all-29 native comparison

Encode three retained natural-English controls, Gibran's The Prophet, Shakespeare and Emerson, in canonical greedy Gematria Primus (K/Q to C, V to U, Z to S), for **149,063 independently sourced native English tokens**. For each of 29 possible fixed r, estimate the first-GP-rune frequency conditional on the word's GP-rune length L. At each of the **2,895 original word starts** after the first, preserve its exact original word length; draw an independent native word of that length. The count of r-initial words has an explicit Poisson-binomial distribution, whose **exact one-sided tail for the actual 23 starts** is computed by a 24-state dynamic program; no original text or guessed key is fitted.

| Prescribed plaintext marker | Expected r-initial starts | Exact one-sided tail for 23 |
| --- | ---: | ---: |
| EA (closest of all 29) | **8.10895** | **1.289 × 10^-5** |
| J | 7.19067 | 1.969 × 10^-6 |
| U | 57.93850 | 1.098 × 10^-7 |
| R | 67.85034 | 1.30 × 10^-10 |
| E | 68.56437 | 8.37 × 10^-11 |
| G | 69.27812 | 5.51 × 10^-11 |

All remaining GP runes have even smaller one-sided tail probabilities **under this three-source, independent-word, length-conditioned English model**. With only Gibran and Shakespeare, EA predicts 6.538 word-start markers and has tail 3.924 × 10^-7. The 3-source result is therefore a deliberately less extreme bound, not a claim of exact author-style literary probabilities.

**Important contrary language evidence:** The separately archived [solved-LP1 text reference](../resources/liber-primus/lp1-plaintext-reference.txt) contains about four EA-initial English tokens among ~760, amounting to ~15 expected in 2,895 starts at the unconditioned reference rate. Under a simple binomial model the probability of at least 23 is of order **0.04**, not 10^-5. This is a short, duplicated, editor-normalized translation, with headings and punctuation not identical to an original rune register; it is not a stronger length-conditioned reference. Nevertheless, the difference demonstrates why this analysis **does not mathematically exclude an author's unusual EA-initial vocabulary**. In a separate diagnostic, the original **63 within-word marker sites** are compatible with the native EA word-shape control (approximately -1.13 SD, lower-tail 0.125). The tension is specifically the original **cross-word repeat sites** under a global, continuous one-rune exceptional marker, not the mere presence of repeat symbols.

## Reproducer and next decision

[Standalone exact original-source Node test](../sims/lp2_fixed_plaintext_marker_wordstart_sft.cjs) checks the 2,896/12,956 and 23+63=86 source counts, evaluates all 29 native length-conditioned Poisson-binomial tails and independently round-trips native GP prose under **each of all 29 choices** of exceptional plaintext rune with a time-varying secret shift. The analysis ran on the checked-in original corpus and controls in the connected JavaScript runtime; the newly committed Node wrapper has not separately been exercised by CI. No original GP plaintext, genuine key or historical emission law is claimed.

**Decision:** Do not spend more compute rescuing a continuous, globally fixed plain-rune repeat marker by changing its unknown key generator. This test prioritizes *source-selected word resets, a different input register, a changed word-segmentation operation, or a repeat emission triggered by state rather than one fixed plaintext rune*. These alternatives require authored source evidence and a complete reversible original receiver; this report does not establish any of them.
