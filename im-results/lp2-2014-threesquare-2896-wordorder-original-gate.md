# 2014 triple-square word-order hypothesis on all 2,896 original LP2 words

**Agent 8, 23 November 2026. Classification: original-cipher finite negative.** No previously unknown plaintext, authenticated word permutation, cipher key, or destination was recovered. The [read-only reproducible CJS test](../sims/lp2_2014_threesquare_2896_words_source_sft.cjs) was executed against the exact seven GitHub source files in an in-memory Node-compatible runtime with all assertions passing. The result is limited to the stable numeric-rank permutations defined below.

## Source-led, falsifiable route

The original p0–p55 LP2 transcription has exactly **2,896 complete printed words** and **12,956 GP29 ciphertext runes**, carrying 175 actual printed stops. The contemporaneous 2014 Cicada OpenPuff source contains three historically authentic magic squares in the fixed sequence **5×5, 7×7, 5×5**: 25+49+25 = **99 cells**. Arithmetic gives the exact whole-book capacity match

\[
2,896 = 29(25+49+25)+25.
\]

The **29** is the Gematria Primus alphabet size; the final **25** would fit one extra first square. This offers a *post-observed*, finite transposition hypothesis: divide all original printed words, retaining their whole rune contents and original page-spanning continuations, into 29 source-order cycles of 25/49/25 words and a final 25-word block. Across these 88 blocks, permute complete words by increasing numerical value of the corresponding historically printed square cells. When cells share a value, preserve the original row-major order. The original source does **not** explicitly prescribe value-sorting or tie-breaking, so the capacity match and candidate operation are hypotheses, not an authenticated key.

The **eight** possible per-square directions are all included: reading encoded positions in rank order, or scattering printed positions into that rank order, independently for the three square types. Each is a bijection of entire rune words, hence is fully reversible without guessing any plaintext, changing a rune, or inventing a missing block.

If the original printed words were an intact-word transposition of language-like prose and this exact 2014 square schedule were the *actual* ordering mechanism, its inverse should restore the native-GP **ordered word-length dependence** erased by the cipher. Unlike rune-letter IoC, adjacent word-length mutual information can change under a pure word permutation. It is measured in nats on original and restored streams, with all word lengths ≥9 pooled into one bin. A complementary check measures adjacent length≤3 word surplus.

## Original-input outcome

The original whole-book length-neighbor MI is **0.012299692881**. The eight full-original restored streams are:

| Three-square direction mask | Word-length MI | Short-short surplus |
| ---: | ---: | ---: |
| 0 | 0.010392289385 | −0.005946216 |
| 1 | 0.010258877850 | −0.007673332 |
| 2 | 0.009150229733 | −0.007673332 |
| 3 | 0.008792779484 | −0.009400447 |
| 4 | **0.012661513496** | −0.008018755 |
| 5 | 0.010400057619 | −0.010436717 |
| 6 | 0.010834207405 | −0.008364178 |
| 7 | 0.009696277337 | −0.010782140 |

Original short-short surplus is **+0.007870710**. The apparent movement toward a negative short-short surplus after permuting cannot certify restored text: **no direction produces a native-like MI increase**. The largest of eight MI values is only 0.012662, almost unchanged from the source, and is below every independently retained literary control described next.

A source-calibrated native Gematria Primus encoder, using the established ING/IO contractions, independently converts genuine words from three pinned literary resources. For every nonoverlapping native **2,896-word** window the same length-MI statistic is:

| Genuine native-GP source | Independent windows | Minimum MI | Maximum MI |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | 5 | **0.046222093** | 0.058295445 |
| Shakespeare (first 300k characters) | 19 | **0.022234359** | 0.062891387 |
| Emerson, *Essays* | 26 | **0.034180158** | 0.052166783 |

All **eight original LP2 reconstructions** invert exactly to all 2,896 original whole rune words when their complementary direction masks are applied. Independently, for each direction the genuine source-native Gibran control of 2,896 whole GP-coded words is encoded into the exact printed square schedule and recovered **word-for-word**. This is **8/8** full-original inverse replays and **24/24** full native-plant recoveries (three independent literary sources × eight square direction masks), each at the complete 2,896-word length. Native output-recovery establishes that an actual 2014-square word transposition would be detectable if this fixed rule produced it.

## Decision

The source-anchored **29 cycles of 99 words plus 25** is numerically exact, and unlike prior 49-fragment tests on p8/p33 it has a true book-wide 2,896-complete-word input. Nevertheless **none of the eight historical-square stable-rank inverse permutations reveals an ordered native-prose word-length signal**. Retire the direct 5/7/5 ascending-value-sort word-transposition candidate without optimizing alignment, introducing secret cell ranks, or hunting for better phase/square order. Different source-licensed transpositions, a changing-state word permutation, external keys, non-prose contents, and deliberate alteration of printed word boundaries remain untested. Since any word permutation preserves the original near-uniform GP29 letter histogram, it cannot by itself turn this ciphertext into ordinary GP-native text; this test addresses only the possibility of an *additional* word-order layer.

The relation 2,896=29·99+25 was noticed after the original corpus counts were known, and several other source numbers divide or nearly divide this same count. It must not be treated as independent evidence of intentional design. No authoritative solved-pages status is changed.
