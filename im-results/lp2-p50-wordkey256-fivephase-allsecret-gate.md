# The 256 table as a cyclic, five-phase word-key: all-secret original-cipher gate

**Decision, 14 November 2026 (Agent41):** The straightforward reading in which the printed 256-byte table on LP2 pp49–51 supplies a **reused word-level alphabet selector** does not explain the 12,956 unchanged original LP2 ciphertext runes as source-native GP English under any stationary five-phase substitution alphabet, even if every alphabet is completely secret and unconstrained. The same decision holds for the natural one-back ciphertext-feedback variant. This is a specific model exclusion and yields **no previously unknown plaintext, key or human-author-selected decoder**.

## Original clues and the exact attack

The original source prints 256 two-character table entries in a 32×8 layout across physical pp49–51 ([data](../resources/liber-primus/lp2-grid-256.json)). Separately, the complete 2,896 printed words have a localized excess of five-rune echoes within words ([boundary source](lp2-lag5-fixedrune-boundary-alignment.md)). A cheap independent candidate is to reuse the table as a cipher alphabet selector across successive printed words. The hypothesis is **not authorized by a signed instruction**: nothing on the pages says "restart this 256-element table every 256 words" or "use five rune-relative phases."

Freeze the 2,896 original printed word boundaries and all 12,956 original GP29 rune symbols. Let printed word ordinal be \(\,w=0,\ldots,2895\,\), and within-word rune index be \(j\). There are two source-specific ways to name one of the repeated key classes:

- **Table address:** \(a_w=w\bmod256\).
- **Table value:** \(a_w=B[w\bmod256]\), where \(B\) is the 256-entry original table interpreted as hexadecimal-byte-sized integers through the repository's already documented base60 table digit mapping.

For each such class and each *word-local* phase \(j\bmod5\), allow an **arbitrary independent unknown permutation** \(\pi_{a,j\bmod5}\) of all 29 GP symbols. The all-secret test covers every possible permutation at once, without guessing any of them.

1. **Direct:** \(C_{w,j}=\pi_{a_w,j\bmod5}(P_{w,j})\). Every matching class/phase must preserve pairwise symbol equalities.
2. **One-back ciphertext feedback:** \(C_{w,0}=\pi_{a_w,0}(P_{w,0})\), and \(C_{w,j}=C_{w,j-1}+\pi_{a_w,j\bmod5}(P_{w,j})\pmod{29}\) for \(j\ge1\). Here *ciphertext differences* at later positions must preserve pairwise equalities of the corresponding **undifferenced plaintext runes**. This is important: comparing them with plaintext differences would test the wrong model.

For each class/phase, count all within-class pairs and the pairs with equal symbols; pool across the original 2,896-word geometry. These are exact invariants regardless of the arbitrary secret permutations. A completely fresh alphabet for each printed word, independently varying word-level nonce, changing mode at each F, or altered segmentation is outside these two stationary classes.

## Exact original result and native-source reference distribution

The reference control uses the actual whole-word length inventory, samples native GP-converted words of *exactly those lengths* with replacement from two original-English sources, and repeats 200 complete 2,896-word plants per source, fixed xorshift32 seed **0x6c43aa57**. The source encoder uses established single-rune **ING** and **IO** spellings observed in solved LP1. A full randomized secret-bijection encoder and inverse for all four architectures recover every rune in their native-text plants exactly and preserve the required collision statistics.

| Secret alphabet reuse / output model | Original equal pairs / all pairs | Original rate | Minimum of 200 Shakespeare native controls | Minimum of 200 Gibran native controls |
| --- | ---: | ---: | ---: | ---: |
| Address, direct | 2,452 / 70,030 | **0.035014** | 0.069870 | 0.069156 |
| Address, ciphertext-feedback | 1,568 / 45,191 | **0.034697** | 0.080569 | 0.078777 |
| Value, direct | 5,037 / 143,500 | **0.035101** | 0.069882 | 0.069415 |
| Value, ciphertext-feedback | 3,237 / 92,845 | **0.034865** | 0.081211 | 0.079304 |

**None of the 400 native-control books per model is as low as the actual original ciphertext.** The comparison is empirical and conditional on the two specified source registers and the unmodified printed word boundaries. We do not infer a calibrated probability that the creator selected this model. The same original ciphertext under an arbitrarily secret five-phase alphabet is much closer to chance collision rate \(1/29\) than the intact native-English plaintext classes. No full cipher inversion is warranted for this precisely defined reused-selector model, because it cannot satisfy its necessary key-independent statistic.

## Decision and limits

This original source-input result closes a tempting, finite hypothesis involving two independently visible source structures: 256 table cells and word-relative five-step repetition. It is **different from the previously excluded five-alphabet-per-physical-page** and **per-word independent affine** gates; a word-key repeating every 256 words produces entirely different invariant classes. The table may still be a rim-only p55 operand, a single-use key, a permutation, a nonperiodic key generator, a different mathematical object or a clue outside GP29 text. Its literal bytes have **not** been authenticated as a historical table-to-word decoder. A source-selected nonstationary operation would be needed before reopening this route.

**Reproduce:** [Windows Node22 CommonJS single-file source test](../sims/lp2_p50_wordkey256_fivephase_allsecret_sft.cjs). It uses repository original transcriptions and table, no guessed plaintext, asserts original counts, performs reference sampling, constructs four positive secret encoders and exact reverses per English source, checks the collision invariants and prints complete numeric summaries. No external files, package installs or workflow dispatches are required.
