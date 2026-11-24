# Affine-prime clock with latent plaintext-F holds: exact prefix exclusion

**24 November 2026 · Agent1 · Director Issue [#2547](https://github.com/FlareZ123/liber-primus/issues/2547).** Evidence class: exact finite-state exclusion on the pinned original prefix, with authentic and blinded native positive controls. **No unknown LP2 plaintext or key recovered.**

## Decision

The nonperiodic affine-prime family that extends the solved p56 arithmetic with a literal plaintext-F hold is incompatible with the original GP0-forward prefix under the declared native singleton constraints.

The exact search covered all **2,680,412** combinations of 3,301 starting prime indices, 28 nonzero affine slopes and 29 intercepts. It retained every legal latent F-hold cursor state. No key survives p0–p39, even when singleton words are generously allowed to be A, I or O.

The later chapter p40–p53 was frozen before the search and was **not read by parameter selection, language scoring or boundary-state ranking**. It remains untested because the entire family is already excluded by the prefix. p54–p55 was also unused.

## Frozen source and split

The input is the original GP29 transcription in resources/lp2-transcription.txt, checked rune-for-rune against resources/liber-primus/lp2-corpus.json. The #1400 parser preserves cross-page word carries: percent signs and slashes are layout, whitespace is not a word end, and the original punctuation delimiters close printed words.

| Original source region | Runes | Use |
| --- | ---: | --- |
| p0–p39 | 9,640 | Prefix-only key selection and exact feasibility |
| p40–p53 | 3,008 | Frozen late-chapter holdout; no inference use |
| p54–p55 | 308 | Outside both phases; no ciphertext used |
| p0–p55 | 12,956 | Canonical tape cross-check |

The complete tape contains 2,896 printed words and 83 one-rune words. The prefix supplies 68 singleton constraints; p40–p53 contains 13 and p54–p55 contains 2. Only the 68 prefix positions are available to the inverse.

## Exact cipher and inverse

Let p_j be the ordinary prime sequence with p_0=2, and let GP29 indices be 0 through 28. The tested family is

\[
C_i = P_i + a(p_j-1)+b \pmod{29},
\]

with a in 1..28, b in 0..28 and initial prime index s in 0..3300. For plaintext F (index 0), emit literal ciphertext F and do not advance j. Every other plaintext symbol emits the affine-prime sum and advances j. Allowing every nonzero slope includes both modular shift signs; a=0 (a constant shift) is outside this nonperiodic family.

For a state (s,h) before ciphertext position i, h is the number of transparent plaintext-F holds already taken and the absolute prime ordinal is t=s+i-h. The inverse propagates the exact set of possible (s,h) states:

- At ciphertext F, retain the transparent branch (plaintext F, h increases by one) and also permit a consuming branch only if the decrypted plaintext is non-F.
- At non-F ciphertext, permit only the consuming branch, and reject it whenever it decrypts to plaintext F.
- At a printed singleton, disable the hold branch and require the consuming plaintext to be A or I. A separate declared sensitivity allows A, I or O.

Equivalent cursor states are merged. No skip history is selected by language score. The implementation propagates all 3,301 starts together for each (a,b) pair, using sorted start lists indexed by hold count.

## Original prefix result

The first five source singleton offsets are 176, 244, 350, 530 and 644. Counts below are the number of affine coefficient pairs with at least one reachable state after each singleton, followed by the total reachable boundary states.

| Singleton offset | A/I coefficient pairs | A/I states | A/I/O coefficient pairs | A/I/O states |
| ---: | ---: | ---: | ---: | ---: |
| 176 | 812 | 30,589 | 812 | 45,427 |
| 244 | 441 | 1,605 | 649 | 3,459 |
| 350 | 23 | 61 | 77 | 212 |
| 530 | 1 | 2 | 3 | 7 |
| 644 | 0 | 0 | 0 | 0 |

The last surviving A/I pair is (a,b)=(4,22). Immediately after singleton offset 530 its only states are (s,h)=(2384,17) and (2385,18). Both imply the same next absolute prime ordinal. At original rune offset **547**, ciphertext index 6 (ᚷ) meets prime ordinal 2914, p_2914=26561, whose affine shift is also 6. Both paths therefore decrypt this non-F ciphertext to plaintext F. No transparent branch exists at a non-F ciphertext, so both paths die.

With the generous A/I/O sensitivity, the last surviving pair is (a,b)=(3,19). Its final states after offset 530 are (1535,14) and (1536,15). At original rune offset **553**, ciphertext index 27 (ᛡ) meets prime ordinal 2074, p_2074=18119, whose affine shift is 27. Again every remaining path would decrypt a non-F ciphertext to plaintext F, so the final states die.

Thus the fourth singleton is the last informative singleton: it reduces the A/I family to one coefficient pair and two cursor states (or the A/I/O family to three pairs and seven states). The intervening original ciphertext eliminates every remaining state at offsets 547 and 553, respectively. The fifth singleton at offset 644 is never reached by any candidate. The remaining 64 prefix singleton constraints are unnecessary.

This is an exact support exclusion for the declared family, not a language-model or IoC rejection.

## Positive controls

### Authentic solved p56

The original p56 ciphertext and independently solved p56 plaintext replay exactly under start s=0, a=1, b=0. The 85/85 symbols match; plaintext F at zero-based position 56 passes through unchanged and consumes no prime, leaving 84 consumed primes. This verifies the asymmetric transparent-F branch against the authentic solved page.

### Two blinded native GP29 plants

The donor is the 780-rune, 208-word native LP1 section 0_koan_1, containing 13 singleton words. Each plant encrypts the complete donor with a hidden start and nontrivial affine coefficients. Recovery sees only the planted ciphertext, the singleton positions and the A/I rule; the hidden parameters and plaintext are withheld from the inverse. The first 680 runes (12 singleton constraints) are used for recovery; the final 100 are reserved for prediction.

| Plant | Hidden key (start, a, b) | Recovered unique keys | Prefix boundary holds | True holds | True-h rank | Predicted holdout |
| --- | --- | ---: | --- | ---: | ---: | ---: |
| 1 | (73, 7, 11) | 1 | 8–15 | 9 | 2 | 100/100 |
| 2 | (167, 13, 5) | 1 | 9 | 9 | 1 | 100/100 |

After exact key recovery, a smoothed GP29 trigram model (additive alpha 0.1) is trained on the six other LP1 sections: 0_warning, 0_welcome, 0_wisdom, 0_loss_of_divinity, jpg107-167 and jpg229. The target KOAN section and solved p56/p57 are excluded. Prefix uncertainty is marginalized over all exact boundary states, rather than freezing the highest prefix-only boundary. In plant 1 the true h=9 has only the second-highest prefix marginal weight, but the full prefix-plus-suffix MAP selects h=9 and predicts all 100 withheld symbols. Plant 2 has one exact boundary state and also predicts all 100. Both predicted suffixes forward-re-encrypt exactly.

The controls establish that this exact inverse can recover hidden nontrivial affine parameters and carry latent F-hold uncertainty through a disjoint continuation. They do not imply that the unknown LP2 prefix uses this cipher.

## Reproduction

- Exact implementation: [sims/lp2_affine_prime_fhold_singleton_sft.cjs](../sims/lp2_affine_prime_fhold_singleton_sft.cjs)
- Manual Node 22 runner: [.github/workflows/lp2-affine-prime-fhold-singleton-sft.yml](../.github/workflows/lp2-affine-prime-fhold-singleton-sft.yml)
- Upstream task: [Director Issue #2547](https://github.com/FlareZ123/liber-primus/issues/2547)

The SFT asserts the original tape, frozen chapter lengths, all-key candidate counts, last-state contradictions, p56 replay, unique recovery of both blind plants, marginalized boundary-state predictions and exact forward replay.

## Scope and next decision

Retire only the GP0-forward affine-prime family with a in 1..28, b in 0..28, starts 0..3300, continuous original print order and literal plaintext-F transparency, under the native A/I singleton assumption (and its A/I/O sensitivity). The result does not exclude starts outside the declared #1400 range, a=0, other prime sequences, source-selected resets, page-local clocks, nonlinear or plaintext-dependent key generators, other plaintext registers, changed segmentation, or a different cipher architecture.

No original holdout plaintext was generated, and no unknown LP2 key was recovered. The intended continuation of Cicada 3301 remains unresolved.
