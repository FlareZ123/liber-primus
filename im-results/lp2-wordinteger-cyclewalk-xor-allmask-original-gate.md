# Whole-word BASE29 binary XOR cycle-walk: exact all-mask recovery and original exclusion

**Agent 3, 25 November 2026. Intermediate result; no unknown LP2 plaintext, authentic key or author-selected cipher.** Even granting independent unrestricted XOR masks for each illustrated chapter and each complete printed word width, the exact maximum is 76/815 original long groups for static masks and 78/815 for previous-cipherword feedback masks. Every populated stratum has at most two simultaneous lexical hits. This closes these specific whole-word integer architectures in the stated native lexical register without a sampled key search.

## Source motivation and explicit inverse

The signed January 2013 Cicada protocol demonstrates ordinary BASE29 numeral conversion; the verified original 2013 ISO telephone-stage replay demonstrates literal bytewise XOR. The signed 2016 message links words and numbers to direction. These historical operations motivate a literal full-word numeral XOR model, but no first-party source specifies their composition, word framing, private masks or binary cycle walking. Prior [word-integer unit and power](lp2-word-base29-unit-invariant.md), [additive previous-low-digit feedback](lp2-crossword-base29-allsecret-previous-low-feedback-gate.md), and rune-local XOR cyclewalk studies do not cover this full-width XOR operation.

Represent each complete printed word as its fixed-width, most-significant-first integer (x) over GP29. Let (B=29^L), (w=\lceil\log_2 B\rceil), and (F_K(x)=x\mathbin{\mathrm{xor}}K) if the result is below (B), otherwise (F_K(x)=x). This is the ordinary restriction by cycle walking of binary XOR, an involution. All leading zero runes survive. Masks with a bit at position (w) or above act as the identity. Two variants:

- Static: (C_i=F_{K_{j,L_i}}(P_i)).
- Cipherword feedback: (C_i=F_{K_{j,L_i}\mathbin{\mathrm{xor}}t_i}(P_i)), where (t_i=C_{i-1}\bmod 2^{w_i}), with the public initial value zero. The state is continuous across original page/chapter seams and includes every intervening shorter printed word. Each chapter-width mask is freely independent.

Both inverse operations use exactly the same (F) and state computed from already visible ciphertext. No plaintext oracle, boundary movement, hidden sidecar or independent word-private key is permitted.

## Exact key search

For a nonlexical original numeral (c_i), any dictionary plaintext (p\) of the same width necessarily requires (K=c_i\mathbin{\mathrm{xor}}p\mathbin{\mathrm{xor}}t_i). Count this complete mask for every possible lexical form, using multiplicities for repeated source pairs. For already lexical ciphertext, score the actual inverse separately, because cyclewalking can preserve a word unchanged. A mask absent from this candidate union cannot transform any nonlexical word into a dictionary word; the high-bit identity mask attains the best possible baseline for those absent masks. Thus the candidate union plus the identity baseline gives the **exact** global lexical optimum per stratum, including all possible mask bit patterns and all nonidentity paths. The script re-encrypts every chosen original inverse.

The source transcription is checked against all 57 rune-bearing physical page tapes, joins genuine line/page carries, and retains 2,896 complete groups / 12,956 runes. The 65 populated chapter×length strata with L≥6 contain 815 groups / 6,180 runes. The pinned TextBlob dictionary is expanded using **every** admissible GP chart tokenization of normalized spellings (V→U, K→C, Z→S, optional ING→NG), plus the 740 pinned solved-source GP words. All long source ciphertext groups are nonlexical under this generous register. The 11-rune p54/p55 carry remains a single word, not two independent fragments. Exact source blob SHAs and detailed winning keys are in the raw JSON.

## Original and planted results

| Width | Original groups | Static maximum | Feedback maximum |
|---:|---:|---:|---:|
| 6 | 256 | 18 | 18 |
| 7 | 216 | 11 | 13 |
| 8 | 156 | 9 | 9 |
| 9 | 78 | 8 | 8 |
| 10 | 52 | 9 | 9 |
| 11 | 32 | 8 | 8 |
| 12 | 18 | 6 | 6 |
| 13 | 4 | 4 | 4 |
| 14 | 3 | 3 | 3 |
| **Total** | **815** | **76** | **78** |

Static best 673/6,180 long-group runes; feedback best 687/6,180. Public zero-secret static and feedback receivers yield respectively 200 and 195 dictionary hits over all 2,896 groups, zero long hits. The original best-fit keys are almost entirely determined by single-word chance coincidences: maximum two hits per stratum. For example, floral p40–53 has 47 length-seven groups and 42 length-eight groups; neither model permits any one mask to recover two lexical words in either stratum. A finite 32-mask bank with an oracle choosing a mask independently for every word cannot cover those two strata completely even if all other widths and chapters have different keys.

On the actual 740-word solved-source GP sequence, distinct seeded width masks were planted separately for the two variants. For each long width fit on the first two-thirds of its ciphertext instances, freeze the chosen mask, and score remaining instances. All 171 original long words re-encrypt/invert exactly using their planted keys. Both attacks recover 107/111 fitting words and **56/60 held-out words exactly**. Static keys uniquely identifiable at widths 6–9; feedback at widths 6–10. Static width10 is correctly recovered with two optimal keys. Sparse widths 11–14 are ambiguous, and their controls account for all held-out errors. The control reference spellings are included in the lexicon, so this is a **key recovery** calibration, not an independent estimate of out-of-vocabulary rates or a demonstration of Cicada's historical cipher. All original inverse replays pass, which is an implementation invariant and not evidence of key authenticity.

## Decision

Retire these static and previous-cipherword XOR cyclewalk models for ordinary native GP prose with intact printed groups. The exact maximum remains valid if whole word order is shuffled before a static encoding; the feedback result specifically depends on the observed predecessor order. No dictionary-level full inverse can exist within either model. The result does not exclude out-of-register plaintext, decoy word segmentation, independent arbitrary mask choices, unrelated word-level Feistel maps or a different source-selected state law. There is no basis to add further ad hoc mask schedules. A genuine new source-selected operand, or an original-input receiver with a materially different structure, is required.

## Reproduction

- [Standalone CommonJS SFT](../sims/lp2_wordinteger_cyclewalk_xor_allmask_sft.cjs)
- [Raw output including exact input blob SHAs and all strata](lp2-wordinteger-cyclewalk-xor-allmask-output.json)
- Execute from the repository root: `node sims/lp2_wordinteger_cyclewalk_xor_allmask_sft.cjs`.

The same computational function was executed in the connected JavaScript runtime against the exact repository files. The standalone Node wrapper has not separately been CI-run. No new automatic workflow was created.
