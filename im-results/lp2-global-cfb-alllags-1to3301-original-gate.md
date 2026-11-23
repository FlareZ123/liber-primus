# A fixed-delay ciphertext-feedback GP29 family cannot directly produce native prose

**Agent 7, 23 November 2026.** Exact original-input family exclusion. No unknown-page plaintext or author-selected key was recovered.

## Mechanism and reason to test it

Cicada's solved material explicitly uses polyalphabetic GP29 arithmetic and prime/totient operations. The unsolved LP2 corpus exhibits markedly few repeated neighboring ciphertext runes. A cheap alternative to inventing a long missing pad is *ciphertext feedback*: an earlier ciphertext rune serves as the next symbol's evolving state.

For a continuous, whole-manuscript cipher with fixed delay `d`, define

```text
C[i] = (C[i-d] + f(P[i])) mod 29      (i >= d)
D[i] = (C[i] - C[i-d]) mod 29 = f(P[i])
```

Here `f` can be **any secret bijection of the entire 29-rune alphabet**. Sign reversal is included because it is another bijection. The decoder's index of coincidence, `sum(freq[k]*(freq[k]-1)) / (n*(n-1))`, is invariant under every such secret alphabet. Thus a single original-cipher calculation for each delay excludes the *entire arbitrary-key output-permutation family*, without searching or guessing `f`.

The finite scan covers every integer `d=1..3301`. This includes literal one-back, both source-used 13 and 29, the original 121-rune tree, 243-rune p8 black body, 256-cell table, the signed 840 field generator, 1,033 and the recurring 3,301 numeral. No key, word segmentation, score function, language feedback, or source-byte mutation was tuned.

## Original-input result

Canonical `resources/liber-primus/lp2-corpus.json` supplies the exact **12,956 unsolved runes** over physical pages 0–55. Each delay uses all **12,956 − d** eligible positions of the unmodified concatenated manuscript, with no synthetic ciphertext in the target sample.

- **3,301 of 3,301 delays tested.** The largest decoder IoC is **0.03532461477709297**, at `d=1`, where 86 of 12,955 recovered differences are zero.
- Next strongest: `d=2447`, IoC **0.03458103216258198**; `d=1748`, **0.03458017055848711**; `d=1943`, **0.03457847541338145**. The majority are near the uniform GP29 baseline `1/29 = 0.0344827586`.
- `d=13`: **0.034491997071476564**; `d=121`: **0.03447045091501022**; `d=243`: **0.03450963981557904**; `d=256`: **0.034474275052967775**; `d=840`: **0.034486427595562336**; `d=1033`: **0.034492900208536285**; `d=3301`: **0.034463509408978944**.
- The authentic, unencrypted LP2 p57 GP29 PARABLE passage has IoC **0.062709966405**. A separate 95-rune original p57 plaintext encrypted under planted `d=13` feedback recovers **82/82** encrypted runes exactly through the same inverse. No original delay comes close to even the conservative native-prose gate IoC `0.05`.

This scan excludes a **single continuous fixed-delay additive ciphertext-feedback system**, even if an author concealed the entire 29-rune output substitution alphabet. An arbitrary fixed shift is subsumed. It does **not** exclude page/section reset, evolving delay, output symbol fusion, state-dependent permutations, word-preserving codes, alternate plaintext alphabets, or an additional encryption stage. The first `d` positions are unconstrained initial state and remain unrecovered.

## Decision

A future simple `C[i] = C[i-d] ± f(P[i])` hypothesis for `d <= 3301` needs genuinely new evidence selecting a reset or additional stage; adjusting a secret substitution cannot repair its key-independent nonnative original symbol profile. Prefer source-visible reversible operators that can alter the output equality partition, or acquire the missing first-party key/instruction.

**Reproducer:** [full-delay single-file Node.js 22 test](../sims/lp2_global_cfb_1to3301_sft.cjs). Uses canonical original 12,956-rune corpus and p57 original clear-GP control; prints all selected source delays and the top ten maxima.
