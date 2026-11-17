# Wordwise direction reversal plus authentic prime/F: original-cipher decision

**17 November 2026, Agent43, Director [Issue #1329](https://github.com/FlareZ123/liber-primus/issues/1329).** This is a finite source-led original-input test, not recovered LP2 plaintext or creator key. [Executable read-only Windows Node22 test](../sims/lp2_word_reverse_prime_ftransparent_sft.cjs) and [manual CI workflow](../.github/workflows/agent43-word-reverse-prime-original-manual.yml).

## Hypothesis and independent rival

The authenticated 2016 Cicada wording says Liber Primus' words are the map and their numbers the direction. A historically plausible alternative to the concurrently tested *key-pointer* direction is reversing the reading order of complete original GP29 words according to a small numeric rule, then using the actual solved p56 additive prime-totient cipher with transparent plaintext-F nonconsumption. Strong rival: the signed words could select page navigation, metaphor or another operation; the message does not authenticate this particular word-reversal-plus-prime/F transfer.

## Original input and exact method

Read all original cipher positions and printed word intervals from the canonical transcription, preserving all 32 page-carrying words. Exactly 12,956 GP29 rune positions and 2,896 literal printed words match the independent corpus. Preserve the source chapter boundaries: p0–2 (729 runes), p40–53 (3,008), p54–55 (308). Test nine deterministic word-order choices: no reversal, plus both directional polarities of (1) current source word length parity, (2) preceding ciphertext word GP prime-sum parity, (3) whether that preceding sum is prime, and (4) chapter-local word ordinal parity. Neither text nor keys are fitted to original plaintext.

For each variant test first 5,000 prime-totient starting ordinals 0..4999. The exact historical p56 cipher permits ciphertext c=0 to be plaintext F=0 without consuming a prime; every other plaintext is (c−phi(prime[start+used])) modulo 29, must be nonzero and consumes a key value. All possible F-bypass paths are tracked in an exact dynamic program with equivalent states merged by consumed prime count. The 85-rune **original solved p56 plaintext recovers and reencrypts 85/85 exactly**. Every complete unknown-text path selected by the fixed solved-LP1 GP29 bigram Viterbi is likewise reencrypted without mismatch. Language reference: 718 encodable LP1 words, 2,995 runes, bigram pseudocount 0.2. A separate *exact all-path* constraint permits only GP29 A, I and O, indices {24,10,3}, at **original printed single-rune words**, conditional on original ordinary English GP29 orthography.

## Results on original ciphertext

| Original chapter | Finite cipher variants × prime starts | Entire-chapter cipher inverse mechanically possible | Native-English single-rune word constraint survives |
| --- | ---: | ---: | ---: |
| p0–2, 729 runes | 9 × 5000 | **3 starts**: 4775, 4778, 4779, all in previous-word prime-sum parity / reverse-when-even | **0** |
| p40–53, 3008 runes | 9 × 5000 | **0** | **0** |
| p54–55, 308 runes | 9 × 5000 | **44 starts** across nine variants, including six no-reversal starts | **0** |

The five original p0–2 printed singleton rune offsets are **176, 244, 350, 530 and 644**. At **offset 176**, every F-bypass history for all three otherwise-complete p0 starts fails A/I/O, independently of language scoring. The bigram-best p0 texts also have 0/5 plausible singleton words and 0/158 exact solved-LP1 training words. Top score **−4.561366 per rune**, IoC **0.03432747** (other starts score −4.584560 and −4.584014; nearuniform IoCs). The solved original p56 control scores −2.853675, IoC 0.0700280; clear p57 control scores −2.766948, IoC 0.06270997. Representative false opening: PAERXCIAAEM IJUIAE NTOETH TOL READ IAUSMEOYNGULIAA, which is not continuous native plaintext.

Every p40–53 source-complete inverse is impossible before lexical assumptions, with every legal F-skip branch included. All 44 full p54–55 possibilities fail A/I/O at the first or second local singleton offsets 0 and 122, under every bypass history; the best scored candidate is −4.327138 per rune, IoC 0.03614789, and the maximum candidate IoC is 0.03720547. The first terminal singleton belongs to the p54 red opening, so if the red title has a separate cipher mode its constraint must not be transferred unaltered. The p0 and p40 obstructions do not rely on this red-title issue.

## Decision and limits

This **rejects the frozen direct word-reversal → p56 prime/F English decoder** on the original p0/p40 full chapters with first 5,000 prime positions. It gives a particularly sharp refutation of the three p0 mechanical positives: no legal ordinary GP29-English source-singleton reading. It does not exclude differently keyed transpositions, changed word breaks, other languages, independent heading cipher modes or other meanings of the 2016 clue. Exact forward reencryption is an implementation invariant and does not authenticate a historical key.

Do not expand tuned word-direction variants without an independent clue selecting them. Continue the distinct already-dispatched wordwise **key-pointer** campaign #1329, and demand source-authenticated key/state plus coherent original heldout plaintext before promotion.
