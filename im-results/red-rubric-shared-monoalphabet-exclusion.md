# Exact shared substitution test on two original red LP2 section titles

**Evidence class: finite, source-anchored and positive-controlled mechanism exclusion. Agent 18, 2026-11-10.** No original unknown plaintext, real substitution alphabet or puzzle destination recovered.

## Why the two anchors are independent of key fitting

The original LP2 image-color annotations identify whole red rubric headings at **physical page 3, rune offsets [0,16)** and **physical page 27, offsets [0,19)**. The canonical unwrapped word lengths are respectively **[2,11,3]** and **[3,12,4]**. Select the unique 11-rune word from page 3 and the unique 12-rune word from page 27. These are two independent highlighted source positions separated by 24 manuscript pages. Their original ciphertext spellings are:

| Source | Original ciphertext glyphs | GP length |
|---|---|---:|
| LP2 page 3, second red word | \`ᛇᚻᛝᚳᚦᛏᚫᛄᛏᛉᚻ\` | 11 |
| LP2 page 27, second red word | \`ᛚᛋᚩᚪᚫᚻᛚᛖᛇᛁᛗᛚ\` | 12 |

Test a source-driven hypothesis: **a single fixed but otherwise completely unknown bijective substitution of the 29 GP rune labels applies to both headings**, and their plaintext words are in the pinned 29,060-distinct-GP-word TextBlob English lexicon. Also allow **zero or one arbitrary inserted ciphertext null per source word**. The source-word order and all surviving source characters are intact, and the symbol substitution must remain injective across both words. A per-page changing alphabet, unknown intermediate register, transcription-altering deletions, more than one insertion per word or source words outside the selected lexicon are explicitly outside the test.

## Exact dictionary-pattern inversion

A bijection preserves the **equality pattern** of repeated symbols. For every source word with matching GP length and symbol pattern, derive every required plaintext↔ciphertext assignment from each aligned position. If a ciphertext null is inserted, remove each possible one of its positions in turn and repeat. Every exact candidate is enumerated; there is no language-model beam, likelihood threshold, constraint search cutoff or fitted pad. For every pair of source word candidates, test a single **global** one-to-one 29-symbol alphabet. The unassigned symbols can be filled in arbitrarily and thus cannot create a false impossibility.

| Necessary-condition screen | Page 3 (11 runes) | Page 27 (12 runes) | Joint valid pairs |
|---|---:|---:|---:|
| Exactly one GP dictionary word per original cipher word | **1** candidate | **0** candidates | **0** |
| Permit any zero/one ciphertext insertion independently in each word | **46** candidates | **12** candidates | **0 of 552 tested pairs** |

The sole length-11 exact English dictionary pattern is **DESCRIPTIVE**. It is a *pattern-compatible spelling*, not a plaintext decryption; it has no independently recovered key and does not combine into the page-27 word. Under the more generous one-null model, all 552 dictionary candidate pairs require mutually inconsistent substitution assignments. Even a freely chosen 29! permutation cannot satisfy these two highlighted words jointly under the stated source assumption.

## Recovery control and consequence

Generate a new uniformly permuted 29-rune alphabet using deterministic seed \`0x1807f0e3\`, apply it to known GP word lengths 10 and 11, and insert one arbitrary extra rune at zero-based positions **5** and **11**. The planted source words are *GRANDMOTHER* and *COMPLICATED*, neither known to the inverse as a fixed answer. The same candidate enumerator and global-assignment test recover the true source pair with **both exact deletion positions**, among five jointly compatible candidates. The planted algorithm is therefore within the searched family and correctly invertible.

**Consequence:** The two distant red headings do not behave as direct dictionary-covered GP-English words encoded by **one constant, global monoalphabetic substitution**, even if each word contains one arbitrary insertion. This closes a source-highlighted, mathematically exact shared-alphabet family and disfavors treating all red headings as a separately solved, uncomplicated substitution cipher. A real decipherment still requires an original-key/transform recovery and independent passage verification.

**Reproduce:** [standalone CommonJS enumerator and planted inverse](../sims/red_rubric_shared_monoalphabet_inverse.cjs) uses the committed original-rune transcription, red-color annotations, pinned GP encoder and source lexicon. [Successful GitHub Actions run 42775602871](https://github.com/FlareZ123/liber-primus/actions/runs/42775602871) ran its new step in the pre-existing manual red-verse substitution workflow and printed all search counts and positive recovery assertions. There is no automatic per-commit CI overhead.
