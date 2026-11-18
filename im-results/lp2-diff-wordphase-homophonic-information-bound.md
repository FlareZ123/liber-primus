# Word-local differential homophonic decoders cannot recover source-like GP English

**Agent 3, 18 November 2026. Status: a new key-independent, source-original exclusion for a precisely specified cipher family.** This is intermediate evidence, not recovered unknown LP2 plaintext, a selected authorial key, or the decipherment of another page. A reproducible SFT passed on a Windows Node.js 22 runner: [Actions run 44374299733](https://github.com/FlareZ123/liber-primus/actions/runs/44374299733), using [the complete CJS reproducer](../sims/lp2_diff_wordphase_homophonic_information_sft.cjs).

## Why this decoder was worth testing

The 55 rune-bearing, unsolved LP2 pages hold 12,956 GP29 symbols. Their consecutive differences modulo29 are nearly flat on the 28 nonzero values, with unusual scarcity of zero steps. This suggests a cheap human-recoverable possibility: maybe the *differences* are a new 29-symbol substitution ciphertext, possibly homophonic, with a different alphabet every few positions within a printed word. Such an inverse would recover ordinary prose **without an external full-length key**. Source-visible printed word lengths and the manuscript's 13-dot motifs make word-local phase periods 1–13 at least bounded candidates.

Previous [static homophonic exclusion](homophonic-information-bound.md) was performed on *raw original ciphertext symbols*, not their **within-word predecessor differences**. The present experiment operates on the latter and grants independently unknown, arbitrary secret codebooks at each tested phase. It does not enumerate possible codebooks.

## Exact necessary condition, independent of the key

Take each complete original printed word of runes \`C_0 ... C_(L−1)\`. For its suffix \`j=1..L−1\`, form \`D_j = (C_j−C_(j−1)) mod29\`. Examine adjacent differences \`(D_j,D_(j+1))\` **only within the same original printed word**. The original source has exactly **2,896** words, **10,060** such difference symbols and **7,247** eligible adjacent-difference pairs. The first rune of every word is intentionally outside the model, so assumptions about page/word resets or how the first rune was encrypted cannot affect these pairs.

Allow the secret decoder to be **any** function \`f_r: GP29 → plaintext alphabet\`, possibly non-injective, with separate secret function for each word-local position \`r=j mod m\`, for period \`m\`. Then \`P_j=f_(j mod m)(D_j)\`, and the empirical data-processing inequality gives, at each fixed position phase,

\`I(P_j;P_(j+1) | j mod m) ≤ I(D_j;D_(j+1) | j mod m)\`.

This is an exact finite-corpus constraint on **all** codebooks in the family, including homophonic mergers and secret substitutions. No choice of key, letter probabilities, phase shifts or secret 29-symbol permutations can violate it. It does not apply to a cipher whose output letter also depends on a secret stream, contextual state, neighboring differences, previous ciphertext, or word reordering.

## Original ciphertext and source-length-matched control

Source: [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json) plus [whole-word transcription](../resources/liber-primus/lp2-transcription.txt). The control register is the committed 300,000-character Shakespeare source [here](../resources/control/shakespeare_first300k.txt), normalized using the repository's existing GP29 spelling conventions (including ING→NG, IO→IA, V→U and K/Q→C). It yields **55,407** actual GP-encoded source words.

In each of **1,000** deterministic repetitions, independently choose an actual Shakespeare GP word of the **exact same rune length** as each of the original 2,896 ciphertext words, then examine the corresponding 7,247 **within-word suffix** adjacent-plaintext pairs. This preserves the entire observed word-length inventory, prevents cross-word artificial pairs, and uses the same conditional-MI estimator as the original. Seed \`0x3301a3b6\`. The controls are literature-register comparisons, not a permutation null in which observed ciphertext is exchangeable with Shakespeare.

| Secret word-local codebook period | LP2 differences: maximum available MI (bits) | Length-matched native English, 1,000 controls: minimum | Control median |
|---:|---:|---:|---:|
| 1 (fixed map) | 0.079518472 | 0.719300611 | 0.761237012 |
| 2 | 0.170766952 | 0.811761643 | 0.863747876 |
| 3 | 0.255342555 | 0.882038894 | 0.935517199 |
| 4 | 0.349630975 | 0.932314068 | 0.982166961 |
| 5 | 0.432178408 | 0.986271633 | 1.042078051 |
| 8 | 0.604580027 | 1.078102077 | 1.134590289 |
| 13 | 0.645058399 | 1.093858479 | 1.152062041 |

**No source-matched sample in any of the seven frozen phase families has MI as small as the original differential stream.** The source-word maximum length is 14 runes; the adjacent-suffix comparisons reach only twelve word-local phases. Thus period13 already permits an independent fixed alphabet for *every observed word-local pair position*, without forcing a shorter repeating clock. The observed bounds remain far below a representative native-GP English register even in that broad case. This is stronger than a frequency-only rejection of a fixed map.

**Genuine mechanism-positive control:** the SFT plants a source-word-length-matched GP English manuscript under an independent secret GP29 permutation, generating ciphertext by \`C_j=C_(j−1)+key[P_j] mod29\` inside each word with arbitrary separately seeded first runes. Applying the corresponding secret inverse exactly recovers **10,060 / 10,060** planted plaintext suffix runes. Because the codebook is bijective, the planted difference-stream MI equals its plaintext MI in every tested word-phase partition. The original source fails where a planted legitimate member passes.

## New stronger gate: arbitrary length-dependent, phase-dependent codebooks

A decoder could change its entire secret alphabet according to both the **known whole-word length** and the **within-word position**. Pooled word-phase MI then loses power through 78 small conditional cells, so a stronger approach is to lock a single source-populated stratum *before* fitting any codebook: the **720 complete original three-rune words**.

Each such word supplies exactly the paired differences \`(D_1,D_2)\`. Permit two **completely independent, arbitrary, secret mappings** \`f_(3,1)\` and \`f_(3,2)\` of those two symbols to plaintext. Data processing applies to this 720-pair empirical table separately, irrespective of the unknown maps used for the other 2,176 words. No global key reuse assumption is needed beyond static maps for these two visibly defined positions.

The original GP29 first-difference pair MI is **0.896059284 bits**. In a separate 1,000-trial control consisting of 720 genuine Shakespeare GP three-rune words per trial (the same \`0x3301a3b6\` deterministic source sampler continuing after the original 1,000 experiments), **every source-native suffix MI exceeds the original bound**. The resulting complete source-controlled exclusion applies to the broad **length×phase fixed-codebook family**, for Shakespeare-like three-rune GP words, even though a pooled 78-cell estimator alone has insufficient discriminatory power. The corresponding bijective delta-cipher known-key positive reproduces identical GP source MI and exactly recovers all planted suffix symbols.

This is still a register-specific result. A special message whose 720 three-rune words have unusually little suffix dependence, a codebook that changes among words of the same length, contextual state, a keyed running stream, or an externally selected transposition can evade the necessary condition.

## Interpretation for decipherment

This closes **fixed, word-position-dependent, and length×phase-specific one-symbol codebooks applied directly to original GP29 differences** as a route to Shakespeare-like English under the explicit full-book or three-rune-word necessary conditions, without selecting any particular alphabet or dictionary key.

It leaves genuinely new work on a smaller causal frontier: seek a first-party selector for a **stateful inverse** or an **external/derived key stream** that introduces the absent plaintext adjacency dependence. It cannot prove the plaintext is Shakespeare-like English, and cannot rule out unusual low-dependence English, word-varying or context-dependent substitution, non-English text, transposition, inserts/deletes, or a hidden binary payload. No original unknown-page runes have been decrypted.
