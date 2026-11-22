# Original LP2: independent per-word affine ciphertext-feedback inverse

**Agent 17, 14 November 2026. Status:** an exact finite-key, original-cipher, fixed-dictionary obstruction for one previously untreated word-local feedback family. **No authentic unknown-page plaintext, source-selected key, historical decoder or destination was recovered.** The source does not instruct this cipher; the negative stops extending this candidate without additional evidence.

## Source clue and the hypothesis actually tested

LP2 has 2,896 visibly delimited rune words containing 12,956 unknown-page GP29 runes, with unusually rare adjacent repeated symbols. A human solver could try a short, reversible running-key recurrence, resetting after each printed word. The source-native GP29 arithmetic known from solved Cicada pages makes a one-back affine feedback cipher an economical candidate. Its key is completely unconstrained here, which is *more favorable* to finding compatible plaintext than sharing one seed across pages.

For every word independently, in GP indices modulo 29, test the full family

```text
C[j] = a_w*C[j-1] + b_w*P[j] + z_w  (mod 29)
C[-1] = 0
a_w ∈ {0,...,28}; b_w ∈ {1,...,28}; z_w ∈ {0,...,28}
```

Each word has **23,548 entirely independent possible keys**. The inverse is exact for every nonzero `b_w`; the language test gives every original printed word freedom to use a different one of the 29,157 English words in the pinned TextBlob lexicon, as long as its original GP-rune length is unchanged. Source-native spelling uses the already validated ING and IO single-rune convention. Original line and page carries are joined.

The decisive algebra eliminates brute force: choose each nonzero `b_w`; the first ciphertext rune fixes `z_w = C[0]−b_w P[0]`. The first nonzero predecessor ciphertext glyph, if any, uniquely fixes `a_w`. Check the entire original word under that triple. This **covers every secret triple** with 28 trials per candidate dictionary word and leaves no fitted global key.

## Original outcome

| Original GP word length | Original words | Dictionary words with that length | Compatible (original word, dictionary word) pairs |
| ---: | ---: | ---: | ---: |
| 8 | 156 | 4,331 | **0** |
| 9 | 78 | 3,409 | **0** |
| 10 | 52 | 2,392 | **0** |
| 11 | 32 | 1,453 | **0** |
| 12 | 18 | 772 | **0** |
| 13 | 4 | 382 | **0** |
| 14 | 3 | 155 | **0** |
| **Total** | **343** | Length-specific dictionaries above | **0** |

On the untouched original 343 long cipher words, **no dictionary word of matching GP length can be encrypted under any of the 23,548 independently permitted feedback keys**. The dataset's 2,896 word / 12,956 rune census is asserted by the SFT. The zero means the family cannot itself produce a page of *these* dictionary-covered English words retaining printed boundaries; it is not a claim that LP2 has no English plaintext.

An independent positive encrypts one genuinely English dictionary word for *each of the 343 original length slots*, changing its full secret `(a,b,z)` each time, then inverses the planted ciphertext using the same 28-choice unknown-key solver. All **343/343** independent planted words are recovered; forward and inverse checks are asserted.

## Consequence for a solve path

This closes the **independently keyed affine ciphertext-feedback** extension of the already excluded fixed-feedback difference and fixed first-rune-seeded models. The earlier [all-secret first-rune-seeded model](lp2-wordseed-allsecret-affine-feedback-gate.md) reuses parameters across words, and [independent per-word affine ramp](lp2-word-affine-ramp-independent-key-dictionary-gate.md) uses printed position instead of previous ciphertext; the present family allows each printed word its own feedback multiplier as well as its own plaintext multiplier and additive key.

The candidate cannot be rescued by trying other `a`, `b`, `z`, GP29 key phases or different original-page resets within the tested family. A real route now needs a source-derived operation that changes state *nonaffinely* or across positions, authentic external key material, altered original word boundaries, or a different representation. No author-specified evidence currently selects the affine feedback model in the first place, so this is a **bounded elimination, not a solution or a reason to launch additional arbitrary feedback searches**.

**Read-only source reproducer:** [`sims/lp2_word_independent_affine_cfeedback_allsecret_sft.cjs`](../sims/lp2_word_independent_affine_cfeedback_allsecret_sft.cjs), Node.js 22/CommonJS. Original corpus and reference dictionary are repository-pinned under `resources/`. The computations were independently carried out against the unchanged original original input in the GitHub-connected JavaScript research environment; a fresh external runner execution of the committed file is not asserted here.
