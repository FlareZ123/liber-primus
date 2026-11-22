# Word-local BASE29/28 predecessor-exclusion decoder: all-quotient GP29 capacity gate

**Status (22 November 2026): decisively negative for this specific direct native-GP29 decoder; no unknown plaintext or authentic key recovered.** The exact original-source calculation and a source-native positive replay passed on Windows Node 22 in [GitHub Actions run 45059424692](https://github.com/FlareZ123/liber-primus/actions/runs/45059424692). Complete [read-only CommonJS reproducer](../sims/lp2_wordlocal_base28_allquotients_original_sft.cjs).

## Why this mechanism was worth one bounded test

The documented signed 2013 Cicada material calls attention to BASE29; the book's actual alphabet has 29 GP symbols. An LP2 runic glyph can be followed by any of 28 *different* glyphs without creating a repeated pair. A historically simple method for formatting this as numbers is to keep each original printed word, read its first glyph as a base29 digit, and read every succeeding nonrepeating glyph as its rank among the 28 options other than the preceding glyph. This is a human-executable, losslessly invertible **29×28^(m−1)** word register. It differs materially from the prior 63-repeat whole-book three-register enumerators and the continuous one-seed-per-$-section combinadic inverse ([report](lp2-word63-enumerative-allsidecar-tail-gate.md); [separate complete-Q report](lp2-eightsection-stream-combinadic-allquotient-original-gate.md)).

The **upstream creator-operation premise is unproved**. The authentic 2013 BASE29 statement does not specify BASE28, individual source words as conversion units, or a secret quotient. Here they are frozen as one concrete candidate architecture. The alternative is that the printed words are cipher framing and their boundaries do not preserve plaintext, or that their contents undergo a more complex keyed state transition.

## Complete source geometry and decoder

Input is exactly [the canonical original GP corpus](../resources/liber-primus/lp2-corpus.json) and [the punctuation-preserving source transcription](../resources/liber-primus/lp2-transcription.txt). Slashes, line endings and physical-page marks do not end words; hyphens, periods, ampersands and dollar-sign section terminators do. Physical page50 is a numeric table and has no GP words. Cross-page words are joined before the numerical transformation.

The full p0–55 original contains **12,956 GP runes, 2,896 complete printed words, 32 words crossing a physical-page seam, and eight true dollar-terminated sections**. The 10,060 within-word successor opportunities contain **63 actual repeated pairs in 62 words**, totaling **371 original runes**. The remaining **2,834 words (12,585 runes)** contain no adjacent repeated rune and admit the candidate mixed-radix decoder. The longest original word has 14 runes.

Use zero-based GP alphabet indices c[0] ... c[m−1]. For nonrepeating words, the exact source rank is:

    R = c[0] * 28^(m-1)
        + sum(i=1 to m-1) (c[i] - (c[i] > c[i-1] ? 1 : 0)) * 28^(m-1-i)

The output numeric domain is M = 29 * 28^(m−1), whereas a complete plaintext word of the same length lives in N = 29^m possible words. To make the test **maximally permissive to missing secret information**, grant every individual word an independently arbitrary integer quotient Q with 0 <= R + Q*M < N; the output GP word is the m-digit base29 unranking of P = R + Q*M. Because m <= 14, every word has one or at most two legal choices Q in {0,1}. Exactly **388** of the 2,834 original eligible words have a second legal Q. We optimize over all of these choices without picking any from plaintext.

An original word that actually repeats a rune is an escape from this 28-way register. Instead of inventing a side-channel consumer or silently dropping it, **give all 371 runes from the 62 real escape words completely arbitrary native-GP plaintext for free**. This is a strict *superset* of any realistic recoverable exception channel. The source-visible repeated-word tag and the original literal ciphertext are retained for exact reconstruction. For every no-repeat word, each choice of Q exact-forward-encodes back to all original glyphs. The independent genuine printed-clear p57 (95 GP runes) is separately forward encoded to nonrepeating source words, then completely recovered through the declared quotient and inverse, proving that the decoder can read authentic native GP29 when an appropriate word and sidecar are supplied.

## An exact all-secret obstruction from five-rune occupancy

A secret final GP29 substitution is given **all 29! possible bijections**, independently by each state. That is more generous than any Caesar shift, Vigenère phase or limited key. For each state, an arbitrary five-symbol subset of the decoded internal alphabet may be mapped to the five most frequent true plaintext GP symbols.

The implementation enumerates **all C(29,5) = 118,755 five-symbol subsets**. For each subset it adds the first candidate's word histograms and, independently for every eligible word, the positive improvement that could be obtained by choosing its second Q candidate. For every state it maximizes the resulting sum. This is an exact finite upper bound under any output alphabet and all missing per-word Q values. For **physical-page-private alphabets**, 32 cross-page carried words are split into the actual physical pages of their constituent rune positions. The optimizer even allows the two fragments of such a word to pick their Q independently, which only raises the attainable result. The totals below also give **every one of the 371 exception runes for free**, regardless of which symbols they would actually decrypt to.

| Final secret alphabet grouping | Top-five upper bound, 12,585 nonrepeat runes | Plus 371 arbitrary escape runes | Entire 12,956-rune fraction |
| --- | ---: | ---: | ---: |
| One secret alphabet for all original LP2 | 2,489 | **2,860** | **22.075%** |
| Eight independently secret section alphabets | 2,759 | **3,130** | **24.159%** |
| 55 completely independent physical-page alphabets | 3,462 | **3,833** | **29.585%** |

The original page-private case is the strongest; **no key selection, per-word quotient selection, or even arbitrary plaintext assignment to every repeated-word position can lift the five-largest-symbol fraction above 29.585%**. All 12,956 original glyphs are accounted for, the carried words keep their authentic membership, and the five-rune subset family is exhausted completely.

This is a distributional exclusion for a **specified output register**. It does *not* prove that no ciphertext encoder or nonnative plaintext could have generated the original LP2 text.

## Independent source-native controls

The short, actual solved p57 printed-clear text contains **46/95 = 48.421%** in its top five native GP symbols. To control for the small sample, the SFT also converts three pinned public-domain English source texts to GP29 under a fully specified conventional spelling normalization: QU→CW, Q/K→C, V→U, Z→S, ING→NG, IO→IA, followed by longest-match GP digraph tokenization. Every contiguous **12,956-rune** window of each independent source stream is examined, and **the least concentrated** window is chosen as the control. No distribution is trained or fitted on the original ciphertext.

| Independent control | Least possible top-five occupancy among all full-length windows | Fraction |
| --- | ---: | ---: |
| Gibran, *The Prophet* | 5,227 / 12,956 | 40.344% |
| Shakespeare, pinned first 300,000 characters | 5,131 / 12,956 | 39.603% |
| Emerson, *Essays, First Series* | 5,336 / 12,956 | 41.186% |

These control results are conditional on the explicitly stated GP spelling normalization and the three English donors. Yet they leave a gap of at least **1,298 GP symbols** against an **optimistically permissive** 3,833-symbol upper bound for the original. Even a fully arbitrary page-private substitution alphabet cannot make this word-local decoder produce a native-English-like top-five distribution under the tested register.

The all-secret theorem requires only the source length and actual first-party ciphertext plus the declared decoder. The controls are benchmarks for interpreting it, rather than proof that the unknown pages must have the same English register.

## Research decision and limits

**Retire this entire frozen word-local rank28→BASE29 family as a direct ordinary-English GP29 solution**, including every missing per-word quotient and any arbitrary page-specific secret monoalphabetic postmap. Recovering a p50-derived quotient list or searching harder for a page Caesar key cannot rescue this exact operator. The earlier continuous code's full-quotient failure is separate, not the source of this conclusion.

The result leaves open genuinely **changing alphabets inside words**, **plaintext resegmentation**, independently selected **non-GP byte/binary registers**, **multi-rune source operations**, and an externally recoverable key not representable as the tested Q and page-private monoalphabetic maps. None has been authenticated here. The next valuable decision is whether original imagery or signed historical instructions actually specifies one such distinct mechanism, preferably with a complete untouched-interval inverse. Avoid further key brute-force inside the excluded word-local family.

**Reproduction:** Run the linked read-only SFT in the repository on Node22/Windows 11. It asserts all source geometry, 388 exact quotient freedoms, 95/95 genuine p57 positive recovery, complete combinatorial maxima, independent benchmark minima, and one source page-private split; it exits nonzero if any test disagrees.
