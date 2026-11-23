# GP29 whole-word base-29 multiplication: exact original inverse and endpoint obstruction

**Agent37, 23 November 2026. Status: an independently source-anchored, complete reversible candidate tested and rejected in its stated native-GP register. No unknown plaintext or author-selected key.** SFT: [lp2_word_base29_3301_original_sft.cjs](../sims/lp2_word_base29_3301_original_sft.cjs).

## Candidate worth testing

A 2014 solver had the 29-element rune alphabet, the authenticated Cicada identifier **3301**, and the first-release warning that both *words* and *numbers* are sacred. The smallest obvious lossless positional mixing operation is to interpret each **complete printed word** as a base-29 integer and multiply it modulo its own digit width. The source supplies neither the word-to-integer direction nor a command to perform this multiplication; it remains an explicitly **conditional test**.

For a word of length \(n\), take its GP29 indices as digits of \(X\in[0,29^n)\), either most-significant-rune-first or least-significant-rune-first. Test the single frozen Cicada-number candidate

\[
C = 3301\,P \pmod {29^n},
\qquad
P = 3301^{-1} C \pmod {29^n}.
\]

Because \(\gcd(3301,29)=1\), every word length is invertible, including 83 single-rune words and 448 two-rune words. Modular multiplication changes individual rune values and word-internal equality partitions, so it escapes the elementary 811-pair static-alphabet invariant. The full transcription gives exactly **12,956 original runes / 2,896 complete words** and preserves all 32 page-carry words.

## Full original result

Four complete original-book operations were measured (both digit orders and both inverse orientations). The authentic printed word boundaries and all 12,956 original rune positions were held fixed. Every operation has exact word-by-word forward replay:

| Digit order and direction | IoC p16–21 | Untouched IoC p40–53 | Whole-book internal same-rune pairs |
| --- | ---: | ---: | ---: |
| BE, inverse \(3301^{-1}\) | 0.03449398 | 0.03470426 | 1,024 |
| BE, forward \(3301\) | 0.03432929 | 0.03433367 | 1,070 |
| LE, inverse \(3301^{-1}\) | 0.03436191 | 0.03438143 | 1,028 |
| LE, forward \(3301\) | 0.03477055 | 0.03443804 | 1,023 |
| Original ciphertext | approx. 0.0345 | approx. 0.0345 | **811** |

None of these four outputs resembles sustained native GP English. An exact positive implementation control encrypts and recovers all 761 editor-normalized already-solved LP1 words with the identical word-number operations and several independently chosen unit/offset pairs; the original itself round-trips in all four cases. The positive control establishes arithmetic correctness, not historical authorship.

## Stronger all-secret theorem: one endpoint cannot be whitened

The scope can be enlarged **without searching keys**. Grant any fixed global affine key \(a,b\) and any word length \(n\):

\[
C=(aP+b)\bmod29^n,\quad a\not\equiv0\pmod{29}.
\]

At the **least-significant digit** of every word, reduction modulo29 gives

\[
c_{\rm low}=(a\bmod29)\,p_{\rm low}+(b\bmod29)\pmod{29}.
\]

This is one fixed permutation of the 29 rune values. Therefore the multiset of first-rune values (LE interpretation) or last-rune values (BE interpretation), and its index of coincidence, is **exactly invariant for every secret key**. The statement also holds **independently inside each word-length cohort** if independent keys are granted per length.

| Actual input | All first-word runes IoC | All last-word runes IoC |
| --- | ---: | ---: |
| Original unknown LP2, 2,896 printed words | **0.03442208** | **0.03454518** |
| Editor-normalized solved LP1, 761 source-native GP words | 0.06870461 | 0.09853033 |
| Gibran, 15,733 source-native GP words | 0.06309948 | 0.09177871 |
| Shakespeare, 55,407 source-native GP words | 0.05755888 | 0.09224905 |

The exact original **length-two cohort alone** contains 448 words with first and last IoC **0.03437600 / 0.03382670**. Corresponding solved-LP1 native-GP length-two words have **0.14545455 / 0.25409091**; Gibran has **0.18306787 / 0.19484369**. The all-secret endpoint theorem survives even if each word length receives independent unknown \(a_n,b_n\). Native-source distributions are controls, not universal language laws; these data exclude the proposed direct ordinary-prose register under the declared source model, rather than every possible source language.

**Consequence:** expanding the direct 3301 multiplier to a search over private global scalar/offset values would change nothing. Any surviving word-number mechanism requires state varying **between words or within positions**, nonlocal mixing of the least-significant rune, altered source segmentation, or a genuinely different plaintext register. Base29 multiplication alone also cannot repair the independently abnormal adjacent word-length grammar, because it preserves every printed length. No author-selected opcode, key or unknown ciphertext plaintext was obtained.

## Independent source-p7 circular polynomial consumer

The original p7 five red complete words have verified GP29 products **[11,26,8,15,2]**, so the source polynomial is

\[
P(X)=11+26X+8X^2+15X^3+2X^4
\quad(\bmod29).
\]

A conditional within-word positional consumer inspired by p57's “circumferences” is circular convolution \(C_w=P(X)P_w(X)\bmod(X^{n_w}-1,29)\). The manuscript does not authenticate this proposed instruction. For every original printed word length **1–14**, \(P(X)\) is coprime to \(X^{n_w}-1\), so the operation has an exact inverse without moving the original separators. Both rune-to-polynomial directions and both forward/inverse interpretations were tested with exact replay for all **12,956** original runes. It differs from previously retired quartic LFSR and fixed four-symbol Feistel families.

| Original p7 circular word consumer | Original p16–21 IoC | Untouched p40–53 IoC | Within-word equal-rune pairs |
| --- | ---: | ---: | ---: |
| First rune \(X^0\), inverse | 0.03456312 | 0.03450062 | 1,084 |
| First rune \(X^0\), forward | 0.03453982 | 0.03483295 | 1,034 |
| Last rune \(X^0\), inverse | 0.03444349 | 0.03446767 | 1,037 |
| Last rune \(X^0\), forward | 0.03431686 | 0.03448005 | 1,058 |

None reveals sustained original plaintext. A positive plant recovers the exact already-solved native LP1 word tape using the same matrices. Forward replay confirms implementation, not historical authorship. Retire this single specific circular polynomial operation and preserve all source-selected changing-state or separator alternatives. The quartic's **source arithmetic is authentic**; the word-ring operation remains a research hypothesis.

## Scope and follow-up

The exact source input, native control encoder, original-word parser, full forward replay and independent p16–21/p40–53 gates are in the single-file SFT. The historical 3301 number is a valid prior operand, while the *decision to multiply each word* remains a research hypothesis. A focused next branch would require a first-party rule for **carrying high-information state across complete words**, and an independently specified word-order/space mechanism if ordinary contiguous prose is the target. Do not rescue this candidate by fitting arbitrary length-specific keys or invented word-specific lookup tables.
