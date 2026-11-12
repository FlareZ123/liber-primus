# Original LP2 word-boundary crib screen against historically used Cicada text

**Result (12 November 2026, Agent 21):** An original-cipher, source-directed known-plaintext search finds **no exact sequence of nine consecutive GP29-equivalent word lengths** shared between the 56 unresolved LP2 physical pages and the five frozen, historically relevant text sources below. Longest matches are seven or eight words, scattered across unrelated ciphertext locations. This is a finite negative for *verbatim quotation with unchanged word boundaries* under the specified GP spelling normalization. **No unknown LP2 plaintext, key, cipher or destination is recovered.**

## Why these particular texts and this test

The manuscript preserves ordinary word boundaries on its authenticated solved page 56. LP1 is the immediately earlier part of the same Liber Primus book. William Blake's *The Marriage of Heaven and Hell* and three chapters of Crowley's *Liber AL vel Legis* were used as text sources in earlier Cicada rounds. Reuse of a consecutive passage would provide a known plaintext and could directly constrain a reversible original-LP2 cipher. Word-length matching is cipher-independent if the original operation preserves word segmentation and maps each plaintext GP rune to one ciphertext GP rune.

The test reads the pinned source files directly, joins runic line wraps, and checks that **all 13,136** rune symbols match the canonical `lp2-corpus.json` exactly in order. Only the first **12,956** runes, physical pp0–55, are screened. Their source transcription yields **2,928 word fragments** under the literal printed separators, including page-boundary fragments; the canonical count of complete printed words is distinct. ASCII words are converted to candidate GP lengths by treating `TH, NG, EO, OE, AE, IA, EA` as single rune units. Historical English spelling conventions, punctuation, apostrophes and verse-number removal are fixed before matching; no target-specific letter keys or shifts are fitted.

| Frozen reference source | Reference words | Longest consecutive matching lengths |
|---|---:|---:|
| LP1 original solved plaintext pp1–16 (excluding p56–57) | 750 | **7** |
| 2012 Blake excerpt | 117 | **7** |
| 2013 Book of Law, chapter I | 1,896 | **8** |
| 2013 Book of Law, chapter II | 1,967 | **8** |
| 2013 Book of Law, chapter III | 1,998 | **8** |

A source-native positive control uses the first thirteen words of the *actually solved* LP2 p56: `AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO`. All **13/13** original runic word lengths agree exactly with the canonical English/GP spelling conversion, confirming that the mechanism would detect an authentic reused phrase of that kind.

The longest apparent LP1 match is seven words at unknown global rune offset **6204** (candidate text `BE TRUE TEST THE KNOWLEDGE FIND YOUR`), tied by two unrelated seven-word matches at offsets **8120** and **8703**. The three 2013 chapters each achieve eight-word maxima; these are length-only matches and are **not plaintext candidates**. The complete list, precise offsets, normalized source text, and rerunnable assertions are produced by the [single-file CJS reproducibility test](../sims/lp2_historical_verbatim_crib_length_sft.cjs).

## Implication and limits

There is no exact nine-word-or-longer crib in these five reference corpora under this strict, easily checked formulation. This rules out directly lifting such a consecutive span from these texts with identical printed GP word lengths; it **does not** rule out paraphrase, common short quotations, alternate runification, edited words, changed word separators, a source not among these five, or a cipher that changes spacing. The observed seven-/eight-word coincidences are expected to be common in a multi-source search and are not evidence of reuse. No familywide probability or novel cipher-family exclusion is claimed.

**Next useful decision:** Only apply an exact known-plaintext inverse if an independent image, signature, instruction or additional original source selects a specific quoted passage or its position. A broad search for ever-shorter word-length coincidences would generate postselected cribs without advancing plaintext recovery.

## Original inputs and reproduction

- `resources/liber-primus/lp2-corpus.json`; `resources/liber-primus/lp2-transcription.txt`
- `resources/liber-primus/lp1-plaintext-reference.txt`
- `resources/external/2012-marriage-of-heaven-and-hell-page.txt`
- `resources/external/2013-book-of-law-I.txt`, `-II.txt`, `-III.txt`
- `sims/lp2_historical_verbatim_crib_length_sft.cjs` (Node 22, standard library, no write side effects).

This supporting result does not alter the authoritative unsolved-state synthesis in `results/README.md`.
