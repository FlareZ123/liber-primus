# LP2 p55: the LP1 wisdom seven-word crib cannot be carried by word-local GP29 substitution

**Decision, 13 November 2026 (Agent 3).** The original p55 terminal seven complete words share the source-GP rune-length profile **[2,7,7,2,6,3,3]** with seven consecutive original solved LP1 p5 words, **THE TOTIENT FUNCTION IS SACRED ALL THINGS**. In the solved source, the sequence crosses the line break after SACRED and precedes SHOULD BE ENCRYPTED. The length match remains a **proposed crib**, not proof of plaintext reuse. An exact original-input test rejects *every fixed 29-rune alphabet bijection applied independently to each of those seven words* as an explanation of that exact crib.

## Original inputs and independent premise

- Source original: `resources/liber-primus/lp2-corpus.json`, physical p55 (76 GP rune values). The first value is a genuine NG carry from p54. The following 75 runes form 16 complete printed words with lengths `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.
- Proposed crib: original solved LP1 p5 SOME WISDOM passage in `resources/liber-primus/lp1-plaintext-reference.txt`. Encode its seven consecutive words using the **source-attested ING and IO orthography** from `results/lp1-source-orthography.md`. The seven source-GP lengths exactly match p55's last seven complete words.
- All 29 values and printed word positions remain unchanged. There is no fitted key, prime selector, page rotation, inferred plaintext, or source correction.

Any *single-position alphabet substitution used for an entire word*, regardless of which secret of the `29!` permutations is chosen, preserves the word's equality pattern. Even allowing every word to have its **own arbitrary secret permutation** cannot change that invariant. For a stronger exact measure, the SFT solves a maximum-weight bipartite symbol assignment per word and reports the minimum rune identity substitutions necessary to match the crib **after freely choosing the best alphabet relabeling for each word**.

## Exact original word-to-crib obstruction

| Physical p55 complete-word position | Original GP transliteration | Proposed LP1 word | Minimum unavoidable changed runes |
|---:|---|---|---:|
| 10 | EOE | THE | 0 |
| 11 | EAEIGXGS | TOTIENT | **3** |
| 12 | ESEOTHTHES | FUNCTION | **3** |
| 13 | THOE | IS | 0 |
| 14 | CEAIMCX | SACRED | **1** |
| 15 | DJU | ALL | **1** |
| 16 | BEI | THINGS | 0 |
| **Total** |  |  | **8** |

These are GP rune transliterations; several tokens are two-letter Roman labels, e.g. TH, EO, EA, and NG. The metric counts *runes*, not Roman letters.

Thus **four of seven words** have incompatible repeat structures, and **at least eight of the 30 original rune positions** require a source-symbol identity change beyond even the best independent per-word secret GP29 alphabet substitutions before the exact proposed LP1 p5 crib can be obtained. In particular, no wordwise Caesar, Atbash, Vigenère reset at each word, or arbitrary wordwise monoalphabetic substitution can exactly produce that crib while preserving positions.

## Scope and next decision

The result is a **conditional, exact crib/decoder-family exclusion**. It does not falsify the length match itself, nor a position-dependent polyalphabetic decoder, an internal word permutation, a code with insertions/deletions, another original plaintext, or externally supplied state. It does not establish whether the proposed seven words are present on p55. Pursuing the exact crib requires a source-motivated mechanism that can change individual equalities, with enough information to invert that operation on the entire original ciphertext and reproduce an unknown plaintext.

**Reproducer:** [single-file GP29 source and exact assignment SFT](../sims/lp2_p55_lp1wisdom_wordbijection_crib_sft.cjs). Reads the checked-in canonical p55 and solved LP1 source; asserts the original lengths and seven exact costs `[0,3,3,0,1,1,0]`; performs seven independent source-GP known-plaintext Caesar plants which must all incur zero mismatch cost and invert exactly. Does not need a model score, external data, brute-force key search, or mutable reference text.
