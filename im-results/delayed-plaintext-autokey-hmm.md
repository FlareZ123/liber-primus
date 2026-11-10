# Delayed plaintext-autokey with integrated collision rewriting: exact inversion

**Evidence status (2026-11-10):** completed negative on original LP2 for an explicitly bounded 1,008-configuration family, with exact forward hidden-state likelihood, plaintext-producing Viterbi inversion and a strong heldout GP-English known-key positive. **No original unknown LP2 plaintext or key has been recovered.**

## Original-source question

Test the possibility that the near-zero adjacent-rune equality in the unresolved Liber Primus second release is the result of a classical **delayed plaintext-autokey modulo 29** followed by a stochastic overwrite whenever an output collides with the immediately preceding ciphertext rune. Prior tests include simple first-order plaintext feedback without this exact overwrite mechanism and word-local lag-five special cases. The present attack tests delays 1–12, all 28 invertible feedback coefficients, and all three independently defined reset scopes in a *single exact probabilistic inversion*.

The model on positions `j>=L` within a reset unit is

```text
R[j] = (P[j] + a*P[j-L]) mod 29,  L=1..12, a=1..28.
If R[j] = C[j-1], replace R[j] by a uniformly chosen
different rune with probability q=0.81.
Otherwise publish R[j] directly.
```

The first `L` ciphertext runes in each reset unit are unrestricted visible IV symbols, and the latent first `L` plaintext runes follow the learned GP-English rune marginal. Candidate reset units are **55 original physical rune pages** (one numeric-only page 50 omitted), **nine runic sections** with lengths `[729,1145,1729,9,1894,1021,1524,1589,3316]`, or the **single uninterrupted 12,956-rune stream**. The page scope is physically page-local, unlike word-local cipher proposals; punctuation and red marks do not reset the key. The rewrite is an explicit *hypothetical nuisance model*, not an established Cicada procedure.

## Exact inverse and independent power check

The ciphertext previous-rune value is known. For each fixed `(L,a)`, separate residue classes modulo `L` form **29-state hidden Markov chains** with hidden plaintext `P[j]`. The forward sum-product algorithm integrates both possible sources of each noncolliding published rune:

- Literal publication: `P[j] = C[j]-a*P[j-L] mod29`.
- Hidden repaired collision: `P[j] = C[j-1]-a*P[j-L] mod29`, with likelihood `q/28`, whenever `C[j]!=C[j-1]`.

When the output itself repeats the prior ciphertext rune, only the first possibility survives with weight `1-q`. Exact 29-state normalization produces the log marginal likelihood for every candidate and the Viterbi max-product pass produces an explicit plaintext candidate with local rewrite flags. Every returned Viterbi path is asserted to regenerate **all original published ciphertext runes** from its recovered source, original IVs and chosen replacement outputs.

GP-English rune priors were trained from the first **240,000 characters** of `resources/control/shakespeare_first300k.txt`. A second **60,000 characters** were held back and sampled into independent plaintext controls with the identical **55 page-length positions**. The planted procedure was `L=5, a=17`, with seed `0x1acf31ab` and stochastic collision-rewrites at `q=0.81`. The real source contains 12,956 rune positions and exactly 86 within-page adjacent repeats; the plant had 362 rewritten positions and 64 unrepaired collisions.

The true planted `(L,a)=(5,17)` ranked **first of 336** configurations in its page-reset family. It gave **+0.232516549 nats per scored rune** over the matched iid-uniform-plaintext baseline, while the next candidate scored **-0.117929252**. Exact Viterbi decoded **95.3381%** of the original planted plaintext runes despite hidden rewrites. Thus this attack has direct constructive power for its stated source generation mechanism; the positive data were not used to fit the English marginals.

## Full original LP2 results

The comparison is the log-likelihood improvement over the **exact observable iid-uniform plaintext model with the same q**: repeated published rune has probability `(1-q)/29` and each distinct next published rune probability `(1+q/28)/29`. Candidate comparisons exclude the respective first L IV positions and normalize on each candidate's scored positions.

| Reset policy | Highest-scoring delay L | Coefficient a | Evaluated positions | Model log likelihood / rune | Matched uniform baseline / rune | Improvement / rune |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Physical page | 12 | 21 | 12,296 | -3.474261352 | -3.350455262 | **-0.123806089** |
| Nine sections | 1 | 1 | 12,947 | -3.500536087 | -3.349998571 | **-0.150537516** |
| Continuous manuscript | 1 | 1 | 12,955 | -3.500208329 | -3.349991642 | **-0.150216687** |

**All 336 configurations in each of the three families performed below their corresponding exact matched uniform baseline.** The strongest original score, page-reset lag 12 / coefficient 21, is still substantially below the baseline and has an unintelligible decoded GP-runic string. The original Viterbi path, by construction, produces exact source-ciphertext re-encryption, so perfect re-encryption alone is **not proof of real plaintext recovery**. The meaningful discriminator is independently trained plaintext likelihood and its behavior in the genuine heldout positive.

The next-best positive model did not resemble the planted true-key signal. The original best-in-family model does not recover a plausible English register.

## Cryptanalytic interpretation and scope

Under ordinary GP-English-like rune marginals, this **finite delayed additive-plaintext-autokey family with q=0.81 stochastic collision rewrites** does not explain the original LP2 symbol stream. A direct decoder can reconstruct plaintext when such a mechanism is planted, while the original corpus remains less compatible with its English source than an exact flat-rune null.

This experiment **does not exclude** different plaintext alphabets, word-specific source registers, hidden key streams, unknown output-alphabet permutations, time-dependent coefficients, feedback based on external symbols, special repair rules tied to the documented lag-six motif, other reset sources, or a different collision suppression probability. It does not calculate a comprehensive discovery-wide p-value and must not be interpreted as an unconditional proof of the true underlying encryption scheme.

The important next step is an **independently specified key-generation mechanism that can predict and exactly reproduce new, unfit LP2 rune positions**, preferably tied to original page art, red ink, the 256-byte grid or external Cicada material. Scanning larger ranges of a similar invented recurrence without such a constraint is low priority.

## Reproduction and evidence

- Executable CommonJS source: [`sims/delayed_plaintext_autokey_hmm.cjs`](../sims/delayed_plaintext_autokey_hmm.cjs). Run with Node.js 22. No third-party dependencies.
- Original 55 rune-bearing unsolved pages and exact GP indices: [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json).
- Training/heldout source: [`resources/control/shakespeare_first300k.txt`](../resources/control/shakespeare_first300k.txt).
- Manual-only action: [`.github/workflows/delayed-plaintext-autokey-hmm.yml`](../.github/workflows/delayed-plaintext-autokey-hmm.yml). No per-commit trigger.
- [Successful full original/positive output, GitHub Actions run 42784959115](https://github.com/FlareZ123/liber-primus/actions/runs/42784959115), Node.js 22, 2026-11-10 08:44 UTC.

No LP2 decryption or artifact destination is claimed.
