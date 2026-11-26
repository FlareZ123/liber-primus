# LP2 GP29 decimal reversal: exact group and latent-boundary inverse

**Decision (Agent49, 26 November 2026): reject the direct word-number decimal-reversal receiver under the canonical GP29 alphabet and the frozen 29,081-form register.** Neither fixed-width variant recovers prose, and allowing every possible latent word boundary plus arbitrary redundant ciphertext F digits still leaves 2,553 of 12,956 original rune positions uncovered. No unknown plaintext, authenticated key, or new continuation location.

## Motivation and scope

Physical p33–39 visibly repeat 1033 and 3301, which are exact decimal reversals. The signed 2013 BASE29 command supplies a real positional numeral operation, and the separately reconstructed 2013 NUMBER service reverses decimal digits. The signed 2016 statement connects words and numbers. None independently specifies this wordwise cipher. This is an exploratory, keyless composition of those typed operations, not an authenticated instruction. It differs from the existing [fixed-word modular multiplication](lp2-word-base29-1033-3301-modmult-gate.md), [factor-program](lp2-numbered-2013-number-factor-invertible-stage-gate.md), and [chapter-wide prime-token decimal transport](lp2-chapter-decimal-prime-transport.md) receivers.

Inputs: canonical [GP corpus](../resources/liber-primus/lp2-corpus.json) blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; [image-corrected transcription](../resources/transcriptions/lp2-image-corrected.txt) f7b534a33edeb212d427329798438325307463d7; [solved native references](../resources/external/relikd-solved-gp29-native-v1.json) 1b064ef6d85819b7d96adaff31a82d1ec551598f; [TextBlob dictionary](../resources/control/english_wordfreq_textblob.txt) 140e1d22b5f8c45deddd2e8b25549d9d6307d938. Use the GP0 digit order F=0 through EA=28, preserve all 32 cross-page complete groups, and assert exact agreement with all 12,956 original indices. The lexicon uses the existing greedy normalization (QU→CW, V→U, K/Q→C, Z→S, ING→NG and IO→IA), with 29,060 distinct forms, expanded by the 21 otherwise absent observed solved forms. It is a finite register, not a complete English language model.

## Executable original-cipher inversion

For L printed runes, read the GP0 integer N in [0,29^L). Reverse its decimal digits and re-encode in radix29.

- **Fixed-width involution:** pad the decimal representation to the decimal width of 29^L−1 before reversal. Apply reversal if the result remains in the original domain; otherwise keep N. This cycle-walk is an involution (an out-of-domain reversal returns to N on the next step).
- **Minimal-width involution:** reverse canonical decimal digits, accepting only if the result fits and reversing its canonical representation again returns N. Keep all other N fixed.
- **Variable-width sender:** canonicalize the input GP numeral, reverse its decimal digits and emit its minimal GP29 representation. The exact inverse enumerates every register word whose encoded integer equals the original group integer, granting redundant leading ciphertext zero digits and freely differing plaintext length. This is deliberately noninjective; multiple candidates remain explicit. No arbitrary extra shift, key, phase, or alphabet is fitted.

| Scope | Groups | Fixed-width covered | Minimal-width covered | Variable-width covered | Variable ≥4-rune ciphertext groups covered |
| --- | ---: | ---: | ---: | ---: | ---: |
| Full p0–55 | 2896 | 184 | 190 | 192 | 2/1645 |
| Physical p33–39 | 378 | 24 | 26 | 29 | 0/211 |
| p55 complete local groups (incoming carry excluded) | 16 | 0 | 0 | 0 | 0/9 |

The maximum consecutive covered original printed groups is three. Fixed-width reversal overflows on 1,624/2,896 groups, while minimal-width reversal overflows on 1,004 and loses decimal trailing-zero information on another 260. Whole-book IoCs after the two exact involutions are .0344810 and .0344668 versus original .0344784. Both give nonprose. The only variable-width matches for original groups of length ≥4 are ODAC→PIT and XSDC→PAWN (one is length-changing); these are isolated register coincidences without authenticated meaning or continuation. All 2,896 original groups round-trip under both involutions, an implementation invariant only.

Nine solved-native sender controls preserve all 2,979 source runes under each involution. With the expanded register the variable inverse includes all 740 true source words, 82 ambiguous; leave-one-native-section-out dictionary coverage is 719/740 (the same number of covered encoded groups). This is constructed encoding calibration, not reproduction of historical encryption.

## Exact spacing-free inverse (decoy-segmentation rival)

Do not assume that the printed groups are true words. For every register entry, construct its canonical variable-width sender code. Insert those codes into a trie. At each original rune offset, enumerate all matching complete codewords up to the register maximum of 19 runes; allow any number of redundant leading ciphertext F digits in the padded variant. A DAG over offsets has those lexical edges and single-rune fallback edges. Dynamic programming computes the **exact minimum number of uncovered ciphertext runes**, independent of word frequencies, then a separate unigram-cost MAP decoder uses the fixed TextBlob counts and 12-nat per-rune fallback. The candidate code sequence is replayed exactly; bracketed output positions are explicitly uncovered and are not recovered plaintext. Chapter endpoints are the existing pinned nine chapter intervals. No plaintext language-fit parameter is optimized on LP2.

| Chapter | Cipher runes | Exact minimum uncovered, canonical or padded |
| ---: | ---: | ---: |
| 1 | 729 | 153 |
| 2 | 1145 | 230 |
| 3 | 1729 | 334 |
| 4 | 1903 | 372 |
| 5 | 1021 | 198 |
| 6 | 1433 | 264 |
| 7 (p33–39) | 1680 | 318 |
| 8 | 3008 | 615 |
| 9 | 308 | 69 |
| **Total** | **12956** | **2553** |

Each of nine native sender controls has zero uncovered positions; the MAP receiver recovers 734/740 complete true words and 2,965/2,979 true plaintext runes in both canonical and padded variants. The register contains the controls' vocabulary, so this is a known-vocabulary sender test, not a fully blind linguistic benchmark. The nine original MAPs are incoherent. For p33–39 the initial canonical MAP is `[D] FOOL WEDDNG [I] UP UNE WHY FF ND FOE [EA] UP [IA] ULM NY N FUN R O …`; individual dictionary words do not authenticate a message. Original aggregate MAP cost is 103,427.01 nats (canonical) and 100,971.00 (padded), roughly 7.98/7.79 per ciphertext rune; native controls have canonical costs about 1.59–2.04 per ciphertext rune. Twenty deterministic within-chapter glyph-permutation nulls have minimum uncovered 2,563–2,709. The original is slightly better than these nulls, but these shuffles destroy the already-known anomalous adjacent-repeat structure; do not interpret that descriptive difference as a cipher or significance result. The exact large uncovered lower bound is the primary decision.

## Reproduction and limits

- [Printed-group SFT](../sims/agent49_lp2_base29_decimal_reverse_word_sft.cjs), [raw results](agent49-lp2-base29-decimal-reverse-word.json).
- [Latent-boundary SFT](../sims/agent49_lp2_base29_decimal_reverse_latent_sft.cjs), [raw results](agent49-lp2-base29-decimal-reverse-latent.json).

Both exact computational cores were executed in connected V8 on the pinned repository inputs. The standalone Node wrappers were committed but not independently run in Node or CI. No original JPEG provenance retest was performed. The no-go is conditional on canonical GP digits, the particular reversal sender/involutions, and this finite vocabulary. It does not rule out a different historic use of NUMBER, an unknown alphabet, an external key, or out-of-register text. Do not expand into arbitrary decimal manipulations without independent source support. No authoritative synthesis change is warranted: this closes a scoped numerical consumer without changing the unresolved-page frontier.
