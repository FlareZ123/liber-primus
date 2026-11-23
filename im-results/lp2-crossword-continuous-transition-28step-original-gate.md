# Cross-word GP29 continuity: original transition and frozen rotor decision

**23 November 2026 · Agent12 · Director [#2333](https://github.com/FlareZ123/liber-primus/issues/2333). Classification: bounded original-cipher structural result and rejected illustrative receiver; no unknown LP2 plaintext, authenticated cipher, creator key, or destination.**

## Physical premise and exact evidence

The 55 source rune-bearing physical pages p0–p55 contain **12,956** original GP29 glyphs. This analysis reads their exact physical rune strings from `resources/liber-primus/lp2-corpus.json`, retaining real `-` and `.` word marks from `lp2-transcription.txt`, with the 32 known words crossing physical-page edges **not** split into invented plaintext words. The rune-free table page p50 has no GP text. Line breaks do not reset the rotor.

There are **10,028** original within-printed-word adjacent pairs, including **63** equal-symbol transitions (0.62824%), and **2,873** across-printed-word pairs, including **23** equal-symbol transitions (0.80056%). The full 29-category modular step distributions, defined as `(C[i]−C[i−1]) mod29`, give an ordinary 2×29 Pearson homogeneity statistic **χ²=25.834669499**, **28 df**, asymptotic right-tail **0.582131965**; it is a *non-rejection*, not proof of the same process. The mark-only split is **22/2,713** repeated pairs across authentic hyphens and **1/160** across full stops. Among the **54** links between consecutive rune-bearing physical pages (skipping runeless p50), **zero** connect equal GP runes; 54 is too small to distinguish a page-reset rule. These page links include authentic carried words.

The earlier exact first-rune-and-word-length-conditioned near-minimum of **23** cross-word doublets remains an important constraint ([word-order study](lp2-crossword-echo-word-order-original-gate.md)), but its independent synthetic continuously constrained emitter already reproduces the original echo ratio without a special boundary machine. This new full-difference comparison supplies **no evidence selecting a separate word-edge alphabet, key advance, or reset**. A lossless cipher still must explain the source rarity of adjacent repeats and how any exceptions are encoded.

## Frozen illustrative reversible cross-word rotor, independently rejected as plaintext

To test whether a human-executable, changing-state rule *by itself* resolves the plaintext, one explicit reversible example was fixed. It operates on all 29 GP symbols, with **F (index0)** assigned the zero ciphertext step, and the remaining 28 symbols assigned the 28 nonzero step values by an evolving addition modulo28. Let the previous ciphertext rune be `C[i−1]`, state `s` initialized to zero, and `m[i]` be the actual physical punctuation immediately before rune `i` (0 none, 1 hyphen, 2 period). Set `C[0]=P[0]`; for subsequent positions:

```text
d = (P[i] == 0) ? 0 : 1 + ((P[i]-1+s) mod 28)
C[i] = (C[i-1] + d) mod 29
s = (s + C[i] + m[i]) mod 28
```

The inverse reads `d=(C[i]−C[i−1]) mod29` and sets `P[i]=0` for `d=0` or `P[i]=1+((d−1−s) mod28)` otherwise, then updates `s` identically. The state **continues across punctuation and physical page edges**, including all 32 genuine source words spanning two physical pages. The first-position state and every rune are retained. Exact roundtrip is an implementation invariant, not evidence of a true Cicada mechanism.

This rule is intentionally a **bounded hypothesis**. Historical first-party clues do not select its F pivot, 28-way rotor permutation, punctuation numeral, state recurrence, initial value, or original ciphertext recipient. It is distinct from word-local rank28 coding, changing printed spaces, and the already-excluded *stationary* two-predecessor secret tables.

### Intact-original receiver results (Windows Node22 PASS)

| Source passage | Original runes decoded | Result IoC | GP rune E index18 | GP rune F index0 |
|:--|--:|--:|--:|--:|
| Untouched physical pp16–21 | **1,613** | **0.03551556** | 56 | 9 |
| Held-out disjoint pp40–53, retaining the p50 zero-rune table | **3,008** | **0.03537181** | 80 | 18 |

Both outputs are nonlinguistic; the actual first 100 decrypted GP transliteration characters are printed in the read-only SFT output for independent inspection. No English passage or cipher operation emerges from either region. The complete **12,956/12,956** original source glyphs re-encode exactly, and an independently authentic solved-p57 95-rune native-GP positive encrypts/decrypts **95/95** exactly. The output has exactly 86 F symbols because the zero-step assignment forces each of the observed 86 equal ciphertext transitions to represent F, so that numeric match is circular and cannot authenticate the cipher.

**Reproducer:** [original-input self-test](../sims/lp2_crossword_continuous_28step_rotor_original_sft.cjs) · [Windows Node22 verified run 45089663021](https://github.com/FlareZ123/liber-primus/actions/runs/45089663021). The first CI attempt failed a punctuation-type assertion; the corrected exact rune-adjacency parser passes, with no alteration to the rotor or plaintext test.

## Decision and precise missing author input

The original 23 across-boundary doublets do not require a boundary-local operation to explain their distribution: the existing continuous constrained-emitter positive already explains their conditioned rarity, and the observed full rune-step distribution does not distinguish printed word edges. The one frozen continuous cross-word rotor returns no authentic plaintext on two distant intact receivers, notwithstanding its full source replay.

**What would advance plaintext:** an independently visible manuscript or signed historical instruction fixing *the actual continuous-state transition permutation, reset/clock and F/escape semantics*, or a preserved original-source side channel specifying the exception/rank information. A new candidate must recover a contiguous original unknown paragraph with such frozen operands and preserve exact source, not merely optimize 23 observed edge events or repeat this illustrative rotor with tuned states. Retire this rotor, not the entire class of changing-state cross-word ciphers; a source-selected continuation remains open.
