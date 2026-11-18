# Consecutive-prime residue with twice-ordinal clock: original LP2 gate

**Status, 18 November 2026 (Agent 1):** A new concrete prime-number mechanism reproduces two easy LP2 observables approximately, but its exact original-cipher transition and word-local constraints decisively disagree. No authentic unknown-page plaintext, key, or decipherment was recovered. Preserve the model as a scoped, rejected arithmetic generator rather than a promising LP2 key.

## Motivation, original source and competing explanation

The original artifact employs a 29-rune prime-valued alphabet, a visibly prime-related 4×4 spiral on physical p15, and an established consecutive-prime-totient cipher on solved p56. These facts motivate testing an unusually simple *prime-ordinal arithmetic clock*, with consecutive primes `q[i]` and a linear position rotation:

```
C[i] = (q[i] + 2*i) mod 29
```

The `+2*i` is a **trial hypothesis**, not an author-selected instruction. The leading numeral `2` is the first GP prime, but no authenticated LP2 source says to add it per position or chooses the starting prime. This formula describes a *generator*, not a lossless plaintext cipher. The strongest rival is an arithmetic coincidence arising because prime gaps have a highly structured distribution.

The original controls are the complete physical p0–55 transcription: 12,956 GP29 runes and 2,896 actual printed words, preserving the p50 rune-free page and page-carry words. References: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-transcription.txt`, and original scans in `resources/liber-primus/`.

## Original versus a fixed prime-stream plant

The planted stream begins at the first prime not less than 1,000,000,000 (**1,000,000,007**), continues for 12,956 consecutive primes, and applies the formula without a reset or fitted alphabet. A uniform symbol histogram is expected from the moving position offset even when prime gaps have unequal frequencies.

| Frozen measurement | Original LP2 | Prime+2i plant |
| --- | ---: | ---: |
| Runes | 12,956 | 12,956 |
| Adjacent identical runes (globally adjacent) | **86** | **76** |
| Within-source-word fifth-back equalities, fixed 2,105 opportunities | **104** | **50** |
| Minimum consecutive-prime gaps greater than 58 forced by residues and primality mod 3 | **2,876** | **530** |

The **29-bin original step histogram**, indexed by `(C[i]−C[i−1]) mod 29`, is:

```
86,459,504,440,438,446,430,470,426,510,497,455,449,504,474,
470,449,404,434,474,467,463,421,486,468,467,457,476,431
```

The identically calculated plant's histogram is:

```
76,322,49,587,928,213,886,211,1552,321,675,168,807,190,1178,
276,635,110,491,85,882,191,516,85,442,60,618,110,291
```

Their total-variation distance is **0.3375530683133925**. The prime-derived stream's easy 76/86 near-match masks a radically different distribution of nonzero steps. In particular, there is no exact generator match or source-native plaintext.

### Why the prime-gap lower bound is key-independent

If `C[i]=(q[i]+2*i) mod29` and `q[i]` are consecutive odd primes, then the unknown positive even gap `g[i]=q[i+1]−q[i]` obeys

```
g[i] = base[i] + 58*k[i],  k[i] >= 0, base[i] in {2,4,...,58}
base[i] = 2 * (15 * ((C[i+1]−C[i]−2) mod29) mod29), with 0 -> 58
```

All primes after 3 are nonzero modulo 3. The exact dynamic program retains current prime residues 1 or 2 modulo 3, tries `k=0,1,2` (sufficient to span all `k` residue classes modulo 3), rejects an intervening zero residue, and minimizes the count of `k>0`. This yields a *necessary lower bound*, not a sufficient certificate of consecutive primality. The original demands **2,876/12,955 = 22.20%** long gaps of at least 60; the fixed near-1e9 real-prime plant needs **530/12,955 = 4.09%** under the same intentionally lenient bound.

In five independent actual consecutive-prime controls starting near **3,301, 10^9, 10^12, 10^15 and 10^18**, the corresponding minimum long-gap fractions were approximately **0.077%, 4.09%, 8.58%, 12.23%, and 14.85%**, while the exact adjacent repeats were **1, 76, 104, 158 and 215**. These scales are exploratory controls, and the comparisons do not prove a universal impossibility for arbitrary giant-prime ranges, nonlinear clocks or unknown skips.

## Reproducibility and decision

The self-contained, dependency-free [read-only CommonJS SFT](../sims/lp2_prime_residue_ordinal2_original_sft.cjs) independently reads the exact repository corpus, generates consecutive primes using a deterministic divisor sieve, asserts the original/plant repeat counts and word-local fifth-back measurements, and reproduces the finite-state lower bound and 29-bin transition discrepancy. The same file ran successfully under Windows Node.js 22 in [manual GitHub Actions run 44256006472](https://github.com/FlareZ123/liber-primus/actions/runs/44256006472), from commit [3241425](https://github.com/FlareZ123/liber-primus/commit/32414254d389ae6144f0a3cc842c5d40693e00a5).

**Research decision:** Do not promote the attractive 76-versus-86 equality as a key or solution. Reject the literal `q[i]+2*i` direct prime-residue model at the frozen starting-prime scale. A future prime-derived hypothesis needs a *creator-visible index/clock operator* and must predict the original nonzero-step distribution and within-word fifth-back events before attempting a plaintext inverse. Do not tune the prime starting order to rescue a model that already fails on those untouched observables.
