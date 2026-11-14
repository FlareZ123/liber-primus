# 2014 A194954 sequence as an LP2 direct running key: original-cipher gate

**14 November 2026, Agent 1.** An independently computable extension of the 2014 reply's eleven *reported* prime-number whitespace runs was tested as a direct, nonrepeating GP29 running key against all original unknown LP2 p0–55 runes. Every source-fixed start-zero prime/totient sign candidate fails exact plaintext-F-bypass feasibility on physical p0 itself; bypass-free outputs remain essentially uniform across the original corpus. **No plaintext or historical key was recovered.**

## Source cue and complete operation

The published May 2014 `message.txt.asc` whitespace-run transcription gives `2,3,5,7,11,13,17,23,29,31,37`. This equals the first eleven terms of [OEIS A194954](https://oeis.org/A194954), where `a(1)=2` and the next term is the smallest prime whose positive difference from the previous term is a multiple of the binary popcount of `n-1`. Consequently the next terms are `43,47,53,59,67,71,...`. This supplies a complete deterministic key beyond the eleven visible integers, and the authentic LP2 p56 cipher already establishes a **prime-totient** running-key operation with special plaintext-F handling.

The original source limitation is important: trailing and blank-line whitespace in this historic clear-signed message was not covered by the PGP signature. The extension to A194954 is a retrospective explanation for the observed sequence and is **not an instruction issued by Cicada**. Other experiments studied this sequence as a word selector and in a 41×316 geometry; the particular full-length source-fixed prime/totient key with exact plaintext-F masking was still a distinct finite candidate. See [prior related gate](a194954_41x316_direct_key_gate.md).

For every source rune `C[i]`, and with modulus 29, try the two inverse signs `P[i] = (C[i] ± a(i+1)) mod29` and `P[i] = (C[i] ± (a(i+1)-1)) mod29`. Start at A194954 index one; do not search phases, rotate the key, or fit a permutation. As a stronger authentic-cipher-specific test, restore the known p56 rule: **literal plaintext F (index 0) emits ciphertext F (index 0) without key advancement**; a ciphertext F may alternatively result from encrypted non-F. At every source F, the decoder explores both permissible branches, preserving the key index as state. An encrypted branch yielding plaintext F is illegal, irrespective of lexical plausibility. The exact state-set DP enumerates *all* possible literal-F masks implicitly and terminates when no state survives.

## Original result

Original input: [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json), physical LP2 pages p0–p55, retaining original order and omitting runeless p50. Total **12,956** runes in **55** rune-bearing pages. The first p0 page has **262** runes. No original symbols or punctuation were changed.

| Fixed key / inverse sign | First impossible rune, p0, zero-based | Original physical pages impossible with independent page resets | Direct bypass-free IoC over full 12,956 |
| --- | ---: | ---: | ---: |
| `a(n)`, minus | 37 | 54/55 | 0.03446444 |
| `a(n)`, plus | 30 | 53/55 | 0.03446329 |
| `a(n)-1`, minus | 52 | 49/55 | 0.03446444 |
| `a(n)-1`, plus | 27 | 54/55 | 0.03446329 |

This is **a mathematical impossibility only for the four frozen candidates** with the specified key start, GP29 additive equation and authentic plaintext-F rule. All available literal-F branches die before finishing the first original page when the running stream is continuous. With fresh key start on every original page, between 49 and 54 of the 55 pages independently fail. The ordinary bypass-free variants remain nearly flat: source IoC **0.03447840**, direct outputs **0.03446329–0.03446444**, versus genuinely clear p57 IoC **0.06270997**. These global IoCs are diagnostics, not a proof that bypass-free English is impossible under every source register.

## Reproducibility and positive control

[**Single-file CommonJS SFT**](../sims/2014_a194954_totient_ftransparent_sft.cjs) deterministically generates A194954, checks the first twelve terms and 12,956th used term (**641057**), inverts untouched original ciphertext under all four fixed branches, and prints the original page-reset failure counts. For each branch it independently encrypts all **95 authentic clear p57 runes** with the same proposed additive key and plaintext-F bypass; exact state-set inversion retains a valid path through **all 95/95** symbols. The SFT was executed against the freshly fetched canonical corpus and passes all assertions. This tests implementation reachability rather than authenticating the unknown-cipher operation.

**Decision.** Retire the direct continuous/page-reset A194954 and A194954-minus-one additive running-key transfers under the original p56 F rule. The first-page contradictions are decisive for those exact transfers. Do not launch offset, numeral, language-register or F-mask searches without a separate original clue specifying a different operation; the present source does not authorize such freedom. This result does not refute A194954 as a non-additive clue or the possibility that the unknown pages use a different cipher from p56.
