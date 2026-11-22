# Original red13 reset transfer of the p56 prime-totient cipher: negative

**Issue:** [#1942](https://github.com/FlareZ123/liber-primus/issues/1942)  
**Reproducer:** [Node22 source-only SFT](../sims/lp2_red13_prime_totient_reset_sft.cjs)  
**Classification:** exact, source-constrained negative for one frozen reset interpretation; no unknown plaintext, key, or original-cipher inverse recovered.

## Frozen hypothesis

Apply the authentic solved-p56 operation to original LP2 p0–p55 as one rune stream. The key is the successive-prime totient residue \(k_j=(p_j-1)\bmod29\), beginning with prime 2. Plaintext F (GP index 0) is emitted unchanged and consumes no prime; a consuming inverse that yields plaintext F is illegal. Every nonterminal original red 13-dot mark resets the key cursor to prime 2 immediately before the rune at its annotated offset. The mark itself is not a rune. Terminal marks start no segment. Physical page boundaries alone do not reset the key; p50 contributes no runes. No start, sign, offset, marker subset, or reset semantic was varied.

All 18 nonterminal red13 marks on p0–p55 were applied, including the p15 page-start mark. The full source annotation census contains 30 red13 marks across p0–p57 (19 internal, 10 terminal, one at page offset 0); the original-image audit independently verifies the 30 marks against the JPEGs ([physical census](lp2-original-dot-punctuation-physical-census.md) · [original-image SFT](../sims/lp2_original_color_dots_census_sft.py)). Every tested marker offset is a page-local printed-word start in the canonical transcription. Page-local word fragments are retained at page boundaries.

## Decisive first obstruction

The first marker is the p0 heading/body boundary at rune offset 13. Resetting there makes the black-body segment start with prime 2. After 43 body runes, the only surviving state has consumed 43 primes. The next prime is 193, so the shift is \(192\bmod29=18\). Original p0 rune 56 is ciphertext GP index 18 (\(\text{ᛖ}\)); its only consuming inverse is

\[P=(18-18)\bmod29=0=F.\]

This is forbidden by the authentic plaintext-F transparency rule. The observed ciphertext is not F, so there is no literal-F/no-consumption branch. No alternative key-consumption state survives. The reset model therefore has no complete inverse beginning at p0 offset 13; this contradiction is independent of English, punctuation scoring, or dictionary choice.

Without any red13 resets, the same prime-2 clock first becomes impossible at p0 offset 235: ciphertext index 8, consumed state 231, next prime 1459, shift 8, again forcing forbidden plaintext F. The reset hypothesis fails earlier, at p0 offset 56.

## Complete segment audit

The 18 fixed resets divide the 12,956-rune unknown stream into 19 segments. The table gives inclusive endpoints. A failed segment has zero complete legal paths; the partial-prefix count records the surviving paths immediately before its first impossible rune.

| Segment | Original rune range | Length | Result | First impossible rune | Complete paths / partial paths |
|---:|---|---:|---|---|---:|
| 0 | p0:0–12 | 13 | complete | — | 2 / — |
| 1 | p0:13–p3:15 | 732 | impossible | p0:56 | 0 / 1 |
| 2 | p3:16–p3:118 | 103 | impossible | p3:18 | 0 / 1 |
| 3 | p3:119–121 | 3 | complete | — | 1 / — |
| 4 | p3:122–p6:70 | 690 | impossible | p3:139 | 0 / 1 |
| 5 | p6:71–81 | 11 | complete | — | 1 / — |
| 6 | p6:82–p7:193 | 308 | impossible | p6:150 | 0 / 1 |
| 7 | p7:194–p14:136 | 1,743 | impossible | p8:20 | 0 / 1 |
| 8 | p15:0–8 | 9 | complete | — | 1 / — |
| 9 | p15:9–19 | 11 | complete | — | 2 / — |
| 10 | p15:20–p23:15 | 1,899 | impossible | p15:41 | 0 / 1 |
| 11 | p23:16–p27:18 | 1,024 | impossible | p23:27 | 0 / 1 |
| 12 | p27:19–p33:9 | 1,424 | impossible | p27:47 | 0 / 1 |
| 13 | p33:10–90 | 81 | complete | — | 1 / — |
| 14 | p33:91–98 | 8 | impossible | p33:92 | 0 / 1 |
| 15 | p33:99–p39:118 | 1,460 | impossible | p33:123 | 0 / 1 |
| 16 | p39:119–121 | 3 | complete | — | 1 / — |
| 17 | p39:122–p54:8 | 3,135 | impossible | p39:128 | 0 / 1 |
| 18 | p54:9–p55:75 | 299 | impossible | p54:62 | 0 / 1 |

**Totals:** 7/19 segments are fully legal, covering 131 disjoint runes; 11/19 have no complete inverse. The longest complete segment is only 81 runes. No complete segment reaches the 150-rune positive threshold.

## Language scores and forward controls

The unchanged TextBlob-derived English lexicon contains 29,058 GP29 words. It scores each complete printed word by \(\ln(1+\text{frequency})\), with unseen words permitted at −8. The exact word-level Viterbi also retains both legal ciphertext-F branches and is not given any p56 skip mask.

- The p0 body prefix from offset 13 through 55 is the only surviving prefix before the first reset-segment contradiction: 43 runes, 10 complete words, **0/10** dictionary hits, **0/43** dictionary-covered runes, score −80. Its best-scoring GP transliteration is `UNTHMMEAGXTOHJAERWNGOEITHNTEUCUEOEIABTHOOEMHYPRCTPBY`, not coherent prose.
- The longest complete segment, p33:10–90 (81 runes), scores −151.274818 with only **1/21** dictionary words and **2/81** covered runes.
- The strongest failed-prefix lexical coincidence is p27:19–46: **2/8** words and **4** covered runes before the segment becomes impossible at p27:47. It is not a complete inverse.
- The no-reset prefix through p0:234 has **1/52** dictionary hits and one covered rune (score −398.040321).

The unchanged p56 positive control passes: the known original 85-rune plaintext encrypts to the original 85/85 ciphertext; the exact inverse has 22 legal F-branch paths; the blind lexical Viterbi selects the known plaintext, including its sole literal plaintext F at offset 56, with 24/25 dictionary words and 79/85 covered runes (score 164.924815). Its five ciphertext-F positions remain [35,47,51,56,74]. The p56 red13 at offset 5 is deliberately not applied as a reset. Clear p57 remains a 95-rune source control.

For every fully legal unknown segment, the selected Viterbi candidate forward-re-encrypts exactly to that original segment. The p0 43-rune partial prefix and no-reset partial prefix also replay exactly up to their first impossible rune. These local round trips validate the implementation; they do not repair the missing suffixes or establish plaintext.

## Decision

**Reject the exact model: reset the authentic p56 \(\varphi(p)\) / plaintext-F-transparent clock at every nonterminal red13 mark, always restarting at prime 2.** The first p0 reset segment is already impossible at offset 56, and 10 further segments independently fail. The remaining legal pieces are short and nonlinguistic. This meets Issue #1942's negative completion criterion. Retain the original red13 positions as layout evidence; do not retune prime starts, signs, phases, offsets, or marker subsets under this Issue. Other cryptographic uses of the marks require a separately source-selected operation.

**Reproduction:** `node sims/lp2_red13_prime_totient_reset_sft.cjs`. The script checks all 58 page transcriptions against the canonical corpus, the 30-mark annotation census, marker/word alignment, every F branch, all 19 segment path counts, the no-reset baseline, p56's 85/85 positive and p57's clear control, and exact forward replay of every reported candidate prefix.
