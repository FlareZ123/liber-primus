# Exact shared substitution test on two original red LP2 section titles

**Evidence class: finite, source-anchored and positive-controlled mechanism exclusion. Agent 18, 2026-11-10.** No original unknown plaintext, real substitution alphabet or puzzle destination recovered.

## Why the two anchors are independent of key fitting

The original LP2 image-color annotations identify whole red rubric headings at **physical page 3, rune offsets [0,16)** and **physical page 27, offsets [0,19)**. The canonical unwrapped word lengths are respectively **[2,11,3]** and **[3,12,4]**. Select the unique 11-rune word from page 3 and the unique 12-rune word from page 27. These are two independent highlighted source positions separated by 24 manuscript pages. Their original ciphertext spellings are:

| Source | Original ciphertext glyphs | GP length |
|---|---|---:|
| LP2 page 3, second red word | \`ᛇᚻᛝᚳᚦᛏᚫᛄᛏᛉᚻ\` | 11 |
| LP2 page 27, second red word | \`ᛚᛋᚩᚪᚫᚻᛚᛖᛇᛁᛗᛚ\` | 12 |

Test a source-driven hypothesis: **a single fixed but otherwise completely unknown bijective substitution of the 29 GP rune labels applies to both headings**, and their plaintext words are in the pinned 29,060-distinct-GP-word TextBlob English lexicon. First allow **zero or one arbitrary inserted ciphertext null per source word**, then extend exactly to **up to two insertions per word**. The source-word order and all surviving source characters are intact, and the symbol substitution must remain injective across both words. A per-page changing alphabet, unknown intermediate register, transcription-altering deletions, more than two insertions per word or source words outside the selected lexicon are explicitly outside the test.

## Exact dictionary-pattern inversion

A bijection preserves the **equality pattern** of repeated symbols. For every source word with matching GP length and symbol pattern, derive every required plaintext↔ciphertext assignment from each aligned position. If ciphertext nulls are inserted, remove every possible set of one or two positions in turn and repeat. Every exact candidate is enumerated; there is no language-model beam, likelihood threshold, constraint search cutoff or fitted pad. For every pair of source word candidates, test a single **global** one-to-one 29-symbol alphabet. The unassigned symbols can be filled in arbitrarily and thus cannot create a false impossibility.

| Necessary-condition screen | Page 3 (11 runes) | Page 27 (12 runes) | Joint valid pairs |
|---|---:|---:|---:|
| Exactly one GP dictionary word per original cipher word | **1** candidate | **0** candidates | **0** |
| Permit any zero/one ciphertext insertion independently in each word | **46** candidates | **12** candidates | **0 of 552 tested pairs** |

The sole length-11 exact English dictionary pattern is **DESCRIPTIVE**. It is a *pattern-compatible spelling*, not a plaintext decryption; it has no independently recovered key and does not combine into the page-27 word. Under the more generous one-null model, all 552 dictionary candidate pairs require mutually inconsistent substitution assignments. Even a freely chosen 29! permutation cannot satisfy these two highlighted words jointly under the stated source assumption.

### Exact two-null-per-word extension

The same original two red headings can be tested under **two inserted ciphertext runes per word** with no fitted alphabet: enumerate all two-position removals, preserve the source word's rune-equality pattern, then require the *same global injective mapping* across both candidates. The individual candidate counts by exact omission budget zero, one, two are:

| Source | 0 omitted | 1 omitted | 2 omitted |
|---|---:|---:|---:|
| Page 3, 11-rune word | 1 | 45 | 2,781 |
| Page 27, 12-rune word | 0 | 12 | 795 |

For every allocation of a **total of zero, one, two or three omissions** between the two original words, the global-substitution candidate intersection is **empty**. At exactly **four omissions, two in each word**, the first possible pair appears: the pinned lexicon contains the candidate `lymphangio` (page 3, delete positions 1 and 5) paired with `untroubled` (page 27, delete positions 4 and 11). This is an *existence example under a highly permissive model*, not recovered plaintext; the first word is an obscure dictionary entry and the pair has no independent semantic or cryptographic authentication.

Therefore **four inserted ciphertext symbols, distributed two per selected heading word, are a rigorous minimum for this lexicon and shared-bijection hypothesis**. Up to three insertions *in total* cannot reconcile the two independently selected original headings under one substitution alphabet. Repeated transformations, unknown state, missing real plaintext runes, dynamic alphabets and out-of-vocabulary words remain outside this exact condition.

### Independent original red-heading predictions

The exact extension enumerates **all** consistent source-word pairs at the minimum four-insertion budget. It finds just **five** compatible pairs among the **2,781 × 795 = 2,210,895** two-null/two-null alignments of the two long words. The five correspond to three distinct word pairs: `LYMPHANGIO / UNTROUBLED` (two permitted alignments), `OESOPHAGUS / INCREASINGLY` (two), and `TOUCHINGLY / ASPHYXIATED` (one). These are purely dictionary-constrained hypotheses selected from ciphertext.

Freeze each resulting partial 29-symbol alphabet without further fitting. Under each, test the **independently highlighted eight-rune title words** on original LP2 physical pages **0, 8 and 33**, allowing up to two arbitrary inserted ciphertext runes in each held-out word. Every possible dictionary word of lengths 6, 7 or 8 is tested using its exact repeated-rune pattern and all allowed deletion positions. The 0-, 1- and 2-insertion cases are all included; global plaintext-to-cipher and cipher-to-plaintext one-to-one assignments are enforced.

**Result:** all **5/5** candidate source alphabets produce **zero** compatible English GP dictionary words for **each** of the page-0, page-8 and page-33 highlighted eight-rune words. These are three separately marked source locations excluded from the key-fitting pair. Consequently, **none** of the complete source-selected shared-heading model variants with up to two inserted runes per source word predicts even one of these independent headings. This is a stronger out-of-pair falsification of the candidate global alphabet hypothesis, rather than a readable ciphertext interpretation.

The same test builds a source-independent **held-out eight-rune synthetic ciphertext** from `SPIRIT` under a planted shared 29-symbol alphabet plus two secret inserted rune positions and recovers the plaintext and both positions without changing the key recovered from the original planted long-word pair. This demonstrates that the held-out exclusion has power for the specified cipher family.

## Recovery control and consequence

Generate a new uniformly permuted 29-rune alphabet using deterministic seed \`0x1807f0e3\`, apply it to known GP word lengths 10 and 11, and insert one arbitrary extra rune at zero-based positions **5** and **11**. The planted source words are *GRANDMOTHER* and *COMPLICATED*, neither known to the inverse as a fixed answer. The same candidate enumerator and global-assignment test recover the true source pair with **both exact deletion positions**, among five jointly compatible candidates. A second planted test inserts **two** arbitrary runes per word at positions [4,9] and [3,11] with the same hidden substitution alphabet; the inverse verifies both whole plaintext words and all four deleted positions. It also verifies the separately generated eight-rune held-out SPIRIT control described above. The planted algorithms are therefore within the searched families and correctly invertible.

**Consequence:** The two distant red headings do not behave as direct dictionary-covered GP-English words encoded by **one constant, global monoalphabetic substitution**, under at most two inserted runes per word across the original highlighted headings. The two anchor words alone first become compatible at four deletions, but all resulting global alphabets are excluded by additional original ink-selected eight-rune headings. This closes a source-highlighted, mathematically exact shared-alphabet family and disfavors treating all red headings as a separately solved, uncomplicated substitution cipher. A real decipherment still requires an original-key/transform recovery and independent passage verification.

**Reproduce:** [standalone CommonJS enumerator and planted inverse](../sims/red_rubric_shared_monoalphabet_inverse.cjs) uses the committed original-rune transcription, red-color annotations, pinned GP encoder and source lexicon. [Successful GitHub Actions run 42775602871 (original bounded one-null test); the extended two-null and independently held-out title tests succeeded in [manual CI run 42778242668](https://github.com/FlareZ123/liber-primus/actions/runs/42778242668)](https://github.com/FlareZ123/liber-primus/actions/runs/42775602871) ran its new step in the pre-existing manual red-verse substitution workflow and printed all search counts and positive recovery assertions. There is no automatic per-commit CI overhead.
