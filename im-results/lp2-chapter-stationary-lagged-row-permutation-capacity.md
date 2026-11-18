# LP2 lagged ciphertext-state substitution: an all-secret capacity bound

**18 November 2026, Agent 2. Classification: exact architecture constraint, no plaintext or key recovered.** A fixed lag-five or lag-six ciphertext-state-dependent substitution, with a separately chosen secret 29-symbol permutation for each state in each original visual chapter, cannot reproduce the single-symbol concentration or index of coincidence of native-GP English. This remains true for every fixed lag from 1 to 29. No assumption about knowing the permutations is made.

## Source-selected hypothesis

The manuscript's original five-by-five square, plus its documented unusual lag-five/lag-six ciphertext repetition structure, motivates one simple keyed mechanism to check before searching the much larger class of nonlinear feedback operators:

`C[i] = pi[chapter, C[i-L]](P[i])`, with any GP29 bijection `pi`, fixed lookback `L`, and one set of rows per original visual chapter. Nine source chapters begin on physical p0, p3, p8, p15, p23, p27, p33, p40, p54. State continues across a normal page boundary. The first L runes per chapter are ignored, maximizing the secret rows' potential to fit all remaining ciphertext. The model is distinct from the [older L=1 row test](lp2-firstorder-cipherstate-alphabet-capacity.md) and from the [fiveback+predecessor arithmetic cipher](lp2-fiveback-prevcipher-allsecret-original-gate.md).

## Exact result

For each chapter and lagged ciphertext state, count the 29 ciphertext symbols and sort that row's histogram descending. The greatest achievable frequency of any putative plaintext symbol is the sum of the **largest counts of all rows**; the maximum plaintext IoC is attained by aligning the complete sorted histograms row by row. These are **exact maxima over every unknown alphabet permutation** in all 261 rows. No finite key sweep or language-model fitting is involved.

| Lookback | Complete original cipher positions | Greatest plaintext-rune count | Maximum top-one share | Maximum IoC |
| --- | ---: | ---: | ---: | ---: |
| **L=5** | **12,911** | **1,205** | **0.09333127** | **0.05031208** |
| **L=6** | **12,902** | **1,216** | **0.09424895** | **0.05043374** |
| **L=1**, included as check of prior work | **12,947** | **1,258** | **0.09716537** | **0.05100765** |
| **All fixed L=1..29** | 12,956−9L | state-specific | **at most 0.09716537** | **at most 0.05100765** |

The independent, previously solved **2,979-rune** GP29 source has **380 E runes (0.12755958)** and **IoC 0.06138673**, both well above the mathematically most favorable unknown-key decodes of the original 12,956 unsolved runes. The comparison makes ordinary native-GP English an extremely poor plaintext for this simple model. It does not prove that every imaginable source language or artificial plaintext distribution is impossible.

## Reproduction and impact

[Standalone CommonJS test](../sims/lp2_lagged_row_permutation_capacity_sft.cjs) reads the canonical source LP2 corpus and genuine solved-rune control; asserts all 29 exact original ceilings; and plants an independent genuine-native plaintext encrypted with a secret chapter/state-dependent permutation `C=(7P+11*state+chapter) mod29` at lags five and six. The same bound accepts both planted recoverable ciphers, confirming it is an appropriate test of the hypothesis.

The 5×5 square and lag-five anomaly do **not** warrant optimizing hidden row permutations in this retired **chapter-stationary** branch. A changing word-specific state, a different plaintext register, or a source-selected arithmetic/feedback inverse remains outside this gate and requires evidence enabling a readable original plaintext passage.