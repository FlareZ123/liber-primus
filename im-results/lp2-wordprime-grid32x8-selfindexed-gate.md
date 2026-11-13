# LP2 GP-prime-word / 32×8 printed-grid consumer: original-input decision

**Research status: negative for two explicitly declared, source-motivated deterministic cipher architectures. No plaintext, cryptographic key, or original continuation was recovered.** This is a finite cipher-family decision on the original 12,956 unknown LP2 runes, independent of language-model fitting.

## Why this cipher was considered

The authenticated 2016 Cicada message says Liber Primus's *words are the map* and its *numbers the direction*. In solved earlier Cicada material, GP prime weights are **summed per word**. LP2 prints a 32×8 numeric table across physical pp49–51. Thus one concrete, simple word-indexed operation is to use each printed word's total GP-prime weight **modulo 32** to select a row, then use rune position **modulo 8** to select a table column. The separate [p55 16-word / two-five-bit-border candidate](../workplace/p55-sixteenword-ornament-onion-candidate.md) motivates considering precisely Base32 and groups of eight, but **does not identify the intended table operation**.

A word can be treated as carrying its row in either of two ways. Both use the **unchanged source table's conventional base60 byte readings** reduced modulo29; using base59 or a different column clock would constitute a different hypothesis.

1. **Ciphertext self-indexed:** For each original ciphertext word `C`, choose `r = (sum GPprime(C)) mod32`, and decode each word rune `P[j] = C[j] - T[r][j mod8] (mod29)`. Also test the opposite sign. This is a fully executable direct inverse even if the chosen row cannot be independently recovered from plaintext.
2. **Plaintext self-indexed:** Encrypt an unknown GP plaintext word `P` as `C[j] = P[j] + T[r][j mod8] (mod29)`, with `r = (sum GPprime(P)) mod32`. During decryption, enumerate **all 32 possible row values** and retain exactly those that satisfy the plaintext row-sum condition. Also test the opposite cipher sign. A necessary condition for a whole-book explanation is that **every** original ciphertext word has at least one consistent row. This check is exhaustive and does not guess plaintext or table keys.

Print wraps and page boundaries are joined where the source shows continuation; genuine printed delimiters separate words. The runeless physical p50 is omitted from the transcription's 57 runic physical pages. The exact source parser reconstructs all **12,956 original GP ciphertext indices** from **2,896 continuous printed words** before evaluating either cipher.

## Complete original-cipher outcome

| Tested source grammar | C = P + table key | C = P − table key |
|---|---:|---:|
| Direct ciphertext-row decoder, full-book GP IoC | **0.0345021936313** | **0.0344972724236** |
| Plaintext-row decoder: original words with **no** consistent row | **1,066/2,896** | **1,020/2,896** |
| Plaintext-row decoder: words with one consistent row | **1,054** | **1,096** |
| Plaintext-row decoder: words with more than one consistent row | **776** | **780** |

The original unknown ciphertext IoC is **0.0344783978645**, while solved p57 native GP text has IoC **0.0627099664**. Neither direct original decoder becomes English-like. For the plaintext-self-indexed family the negative is **exact and keyless**: more than a thousand original words lack any admissible row, so **no complete GP29 plaintext** can re-encrypt the source under either sign, with the specified row and column clocks.

The single-file reproducer plants each already-solved p57 native-GP word under its own true GP-prime row using this same printed table and both signs, then enumerates all 32 row inverses. For every plant, the true row survives and exactly reconstructs all 95 GP runes. The positive control validates the constraint and decoder; it is not evidence the original used the model.

## Decision

**Retire these two direct 32×8 word-key consumers.** They explain none of the original unknown ciphertext in a decipherable, word-for-word manner. Different row definitions, secret key streams, source-selected multiword moves, non-GP payloads and 2016 navigation instructions applied *after decryption* remain open. The source itself does not instruct the solver to reduce GP prime-word sums mod32, so no broader conclusion about the grid's intended purpose follows.

[Single-file CommonJS original-input and native-plant test](../sims/lp2_wordprime_grid32x8_selfindexed_sft.cjs).
