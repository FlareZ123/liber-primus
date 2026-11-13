# Red225 triple reading as a terminal 75-rune key: original-input decision

**Status (Agent37, 13 November 2026): four bounded additive-key failures and an address-validity obstruction.** No unknown LP2 plaintext, authentic key, cipher mechanism or puzzle destination was recovered. The test passed on the original repository inputs in [manual Actions run 43388014405](https://github.com/FlareZ123/liber-primus/actions/runs/43388014405); the [single-file Node 22 reproducer](../sims/lp2_red225_terminal75_triplet_source_gate_sft.cjs) is retained.

## A finite proposed route

Original ink annotation identifies exactly **225 highlighted GP runes** across the 58 LP2 pages, including the twelve solved-page red title runes. The full 2014 Liber Primus combined archive contains **75 scans** (17 LP1 plus 58 LP2). The last unsolved physical page, p55, has **76 runes**, with its first rune carrying over a word begun on p54. These three facts suggest a provisional alignment: read **75 consecutive source-red triples** in original page and local-rune order, and derive a 75-rune key for **p55 offsets 1–75**. The 75-page grouping is retrospective: the original ink does not label triplets, and there is no source instruction choosing this key operation.

The literal direct-key derivations are:

- GP-ordinal triple key: \`K_j=(r_{3j}+r_{3j+1}+r_{3j+2}) mod 29\`.
- GP-prime triple key: \`K_j=(prime[r_{3j}]+prime[r_{3j+1}]+prime[r_{3j+2}]) mod 29\`.

For each, decode the 75 original p55 suffix ciphertext ordinals as \`P_j=(C_j-K_j) mod29\` and \`P_j=(C_j+K_j) mod29\`. The script checks that every source red-span symbol matches the original corpus before deriving keys, exactly re-encrypts each candidate and recovers a 75-rune native-GP planted control from p57 for every key/sign.

## Original-cipher result

| Direct key | Original decoding | GP29 index of coincidence (75 runes) |
| --- | --- | ---: |
| Ordinal-sum | C−K | **0.03243243** |
| Ordinal-sum | C+K | **0.03063063** |
| Prime-sum | C−K | **0.03459459** |
| Prime-sum | C+K | **0.03387387** |
| Unmodified p55 75-rune suffix | — | **0.03855856** |
| Full solved p57 GP plaintext (95 runes), comparison | — | **0.06270997** |

All four exact original outputs remain nonlinguistic under full Gematria Primus transliteration. For example, the prime-sum C−K output opens \`IAJOEMHMAAETHEAEUINHAEWIAJNGTHTHOEHPNGFOYHNGFE...\`; the prime-sum C+K output opens \`DIAIAAOESRPEAAEDTDEONGFEOWEAIEOGEOMTWLGCTH...\`. These are full reversible transformations of original ciphertext, but they supply no readable unknown text.

A second, historically plausible reading takes each triple as a **(page, printed line, rune)** book-code address, consistent in *form* with earlier Cicada book codes but lacking a source-selected coordinate grammar. Parse the original LP2 manuscript's actual physical lines and test GP ordinals or GP prime weights as coordinates, with either zero-based or one-based indexing. The number of **valid** triplets out of 75 is:

| Numerical interpretation | Zero-based | One-based |
| --- | ---: | ---: |
| GP ordinal | **21/75** | **27/75** |
| GP prime weights | **0/75** | **0/75** |

The script records exact page, line and rune rejection counts and the readout fragments. Because the earliest coordinate failure prevents a complete key, the literal page-line-rune grammar cannot address all 75 characters under any of these four canonical numeric choices. The comparator uses LP2 pages p0–55; it does not assert that an alternative three-coordinate source, missing folio, or nonstandard reduction rule is impossible.

## Decision

Reject the **four fixed triple-sum Vigenère keys** for the final 75-rune p55 suffix, and the **four fixed literal (page,line,rune) book-code conventions** as complete key extractors. The 225=3×75 and 76−1=75 equalities provide an investigable alignment but do not themselves justify a cipher operation. Do not optimize arbitrary triple permutations, offsets, modular reductions or additional layers to rescue them. A new independently attributable clue specifying the triplet code, source book, address grammar or key consumer would be needed to reopen this branch.

The canonical red inventory is \`resources/liber-primus/lp2-ink-annotations.json\`; exact p55 ciphertext and GP weights are in \`resources/liber-primus/lp2-corpus.json\`, with physical-line source \`resources/liber-primus/lp2-transcription.txt\`. The temporary one-use workflow can be removed after this successful execution to avoid adding permanent CI clutter.
