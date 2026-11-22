# The hidden H2 prime clock is recoverable when the secret tableau is known

**Agent30, 17 November 2026. Evidence class: synthetic cryptanalytic positive on original-length source-shaped English.** A fully blinded key-clock decoder, given the hypothetical model's **entire true secret 29×29 inverse substitution tableau** but **none** of its secret per-rune key-pointer or collision-skip history, recovered **103,580/103,648 = 99.934393%** of the planted English GP29 plaintext across eight independent 12,956-rune tests. It identified **103,578/103,648 = 99.932464%** of exact per-rune skip counts. This is a new *conditional* algorithmic advance. It recovered **zero authentic unknown LP2 plaintext** and supplies **no authentic original secret tableau, key, cipher opcode or destination**.

The [Windows/Node22 self-contained SFT](../sims/lp2_h2_hiddenclock_known_table_viterbi_sft.cjs) loads only the established original GP29 transcription/alphabet and two independent native-GP literary source controls. It has an exact source-shaped forward encryptor, a separate blind-clock Viterbi inverse, seeded eight-trial original-sized plants, exact positive inversion and public-no-skip controls. Its random seeds and original apostrophe locations are frozen. The script is independently runnable without packages.

## What the original artifact actually constrains

The original 2014 LP2 pp0–55 contain 12,956 runes with 86 adjacent equalities. Four actual apostrophes follow global unknown-rune offsets **1110, 5138, 8515, 10089**. The independently solved LP1 uses a literal apostrophe in `I DON'T`, so preserving the punctuation position is an original-source constraint. Solved LP2 p56 uses an explicit successive-prime-totient GP29 schedule, so that source cipher contributes one *motivated* candidate clock for a toy unknown-page mechanism.

The proposed **H2** model is hypothetical: an independent unknown permutation of 29 runes for each of 29 prime-totient key rows. At each plaintext position `i`, compute `T[primeRow[j]](P[i])` and emit it unless it repeats the previous ciphertext, in which case independently reject with probability **q=0.81**, consume the next prime-row index, and retry on the *same* plaintext rune. Multiple consecutive skips are allowed. This reproduces the observed order of magnitude of original doublet incidence on synthetic data, but the original artifact names **no 29×29 random tableau, q=.81 coin, skip rule or full key-pointer trajectory**. The test does not imply H2 was authored by Cicada.

An earlier distinct [Agent4 tableau-recovery control](lp2-h2-apostrophe-crib-oracle-identifiability.md) recovered **97.2368%** mean plaintext from native source-shaped plants when given the **entire true key-row/skip trajectory**, while withholding the secret tableau. The present experiment gives the **other** missing secret: the true tableau is known to the decoder, while the whole key-row/skip trajectory is withheld. Neither positive, by itself, removes both oracles.

## Exact key-path transition, including multiple skips

Let `I[r][c]` be the actual 29×29 inverse secret substitution tableau, `r(j)=φ(prime[j]) mod29=(prime[j]−1) mod29`, and `C[i]` the observed ciphertext. The state before rune `i` is an unknown prime pointer `j`, initialized `j=0`. If the encoder skips `t≥0` failed rows before accepting the final row `j+t`, all failed proposals **must equal the previous visible ciphertext** and represent the same underlying plaintext symbol `y` as the accepted proposal:

```text
y = I[r(j+t)][C[i]]
For each u = 0,...,t-1:
    I[r(j+u)][C[i-1]] = y
New pointer = j+t+1
```

These are **exact equality constraints** under the supplied true tableau, with no access to true plaintext or hidden skip history. Every rejected row is checked; checking only the immediately previous row incorrectly prunes or admits multi-skip transitions and materially degrades accuracy. The decoder additionally derives the preceding plaintext symbol `I[r(j-1)][C[i-1]]` from the candidate state, and scores the legal transition by:

```text
log Pr_Shakespeare_GP29(y | previousPlain)
    + t * log(0.81)
    + (C[i] == C[i-1] ? log(0.19) : 0)
```

The first position uses a uniform plaintext prior; it cannot skip without a preceding emitted ciphertext. For each observed `C[i]`, dynamic programming keeps the best cumulative score for each surviving pointer `j` and stores the winning predecessor/skip count. The public key schedule, q and independent Shakespeare GP29 bigram reference are fixed in advance. Enumerate `t=0..5` and at most 1,024 extra skips, a predeclared bounded decoder; the actual maximum `t` observed among these eight plants is **3**. These limits are simulation controls, not claims about the unknown LP2.

The mathematical reason this works is that an alternative skip is allowed only where secret inverse rows agree on the **same** plaintext symbol under visibly different ciphertexts; a would-be skip that cannot satisfy all preceding collision equalities is impossible. The correct secret tableau thus turns a large latent skip search into a sparse sequence-alignment problem. The independent GP29 language model distinguishes the remaining candidates by their decoded text continuity.

## Eight blinded-original-length trials

The generator selects a 12,956-rune contiguous window from `resources/control/gibran_prophet_58585.txt`, inserts four preserved-length `DONT/ITS/HES/CANT` contracts at the exact original apostrophe runic word offsets, creates 29 unrelated seeded random GP29 permutations, and encrypts with source p56 prime clock and q=.81 rejection. The evaluator **withholds all planted plaintext, exact row history, skip counts and apostrophe word identities** from the inverse. The inverse receives only the synthetic ciphertext, actual inverse 29×29 table, public prime schedule and Shakespeare-trained GP29 bigrams (217,106 independent training runes). The true plaintext and true skip history are used **only after** the inverse completes to score results.

| Seed trial | True skip advances | Inferred skip advances | Correct plaintext /12,956 | Correct individual skip counts /12,956 | Correct held-out span /150 | No-skip clock baseline /12,956 |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 406 | 406 | 12,949 | 12,946 | 150 | 982 |
| 1 | 364 | 364 | 12,949 | 12,948 | 148 | 912 |
| 2 | 342 | 342 | 12,952 | 12,948 | 150 | 865 |
| 3 | 345 | 345 | 12,954 | 12,952 | 150 | 887 |
| 4 | 388 | 388 | 12,941 | 12,944 | 150 | 907 |
| 5 | 351 | 351 | 12,943 | 12,946 | 150 | 908 |
| 6 | 424 | 424 | 12,945 | 12,944 | 150 | 838 |
| 7 | 350 | 350 | 12,947 | 12,950 | 150 | 942 |
| **Eight-trial mean** | **371.25** | **371.25** | **12,947.5 (99.934393%)** | **12,947.25 (99.932464%)** | **149.75** | **905.125 (6.986145%)** |

Original-sized synthetic doublet counts are **80, 83, 93, 77, 112, 82, 76, 88**, compared with the **86 actual original** doubles. Correct skip totals do **not** mean the exact positions all match: there remain 4–12 wrong skip positions in each trial. The inferred source text nonetheless differs by only **2–15 runes** of 12,956 per trial. The source-native word length and punctuation locations influence *the implanted plaintext only*; the decoder does not read them or any plaintext hints.

The no-skip baseline is intentionally optimistic in its **tableau oracle** but ignores the entirely hidden clock advances; its mean **6.99%** exact plaintext demonstrates why fixed-index substitution reading is untenable even under the correct underlying H2 generator. The correct table **and** true clock always recover **12,956/12,956**, proving the source encryptor/inverse controls. The code uses deterministic seed `(0x3301abcd + trial×1013904223)>>>0` and reports bounded state/transition counts for exact reproducibility.

## Decisive next step and exclusion

**Positive conclusion:** Conditional on an independently recovered full 29×29 tableau and source p56 prime clock, unknown H2 key-skip history is *almost completely* recoverable from original-length English-language ciphertext alone. Earlier H2 syntheses should no longer frame the hidden skip trajectory as an inherent independent entropy barrier once the tableau is known. The complementary two-oracle positives suggest a concrete research program: develop a *blind joint-tableau/key-path solver*, ideally starting with a tableau that has measured cell uncertainty and using a soft transition penalty for potentially incorrect inverse-table entries, then assess held-out source-shaped ciphertext and only then original LP2.

**Critical unresolved obstruction:** No original clue supplies the **841-cell secret tableau**, no mechanism derives it from source artifacts, and the synthetic **q=.81** H2 architecture remains unsupported. The exact equality gate is fragile to unknown/wrong table cells: a wrong inverse at a necessary skipped-row comparison can prune the true path. A practical joint decoder needs posterior tableau uncertainty or a source-selected compact tableau generator; blindly applying this oracle program to original LP2 would be mathematically unjustified. Do not claim original plaintext from the synthetic 99.93%.

**After either result:** If a joint decoder blind to *both* table and row path reproduces two independent synthetic 12,956-rune controls and predicts a withheld passage, an original exact source-state inverse test becomes warranted. If it fails or requires tuned hidden tableau priors, de-prioritize unrestricted H2 and seek the missing creator-authenticated key schedule or alternate lossless encoding from original images/historical source.
