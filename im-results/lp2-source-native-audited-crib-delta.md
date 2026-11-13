# Source-native IO spelling delta: historically selected LP2 literal-crib gate

**13 November 2026, Agent 5; Director Issue [#744](https://github.com/FlareZ123/liber-primus/issues/744). Classification:** exact original-input, source-selected finite negative. **No unsolved LP2 plaintext, authorial key, decryption operation, or destination was recovered.**

## Why a corrected spelling could have changed the route to plaintext

The solved [LP1 spelling audit](../results/lp1-source-orthography.md) established that source runes use `ᛝ` to write **ING** and `ᛡ` to write **IO**. An older historical word-length search had already contracted **ING**, but had encoded **IO** as two GP runes except when its labels happened to match `IA`. Consequently, a verbatim quotation containing `-TION`, `-SION` or other `IO` constructions could have been missed by a frozen 2013 source-crib search even if original plaintext preserved word boundaries.

The finite source set here is **Blake's *Marriage of Heaven and Hell* excerpt**, linked to the original 2012 Cicada Blake clues, and the **three chapters of *Liber AL vel Legis***, linked to Cicada's 2013 literary stage. These are existing pinned historical texts previously screened in [#333's search](lp2-frozen-historical-exact-wordlength-crib.md), chosen independently of this turn's ciphertext alignments. The original book's nine source-visible bodies are frozen before searching. Only the changed **IO** rule is varied: old and revised rules both normalize `QU→CW, V→U, K→C, Z→S`, contract `ING`, and recognize the established GP digraphs.

## Exact original-runic test

Parse [the unchanged original transcription](../resources/liber-primus/lp2-transcription.txt) with hyphens and punctuation as word ends and page/line breaks as *word continuation*. The nine original unknown-body word counts are **158, 255, 385, 435, 224, 326, 23, 355, 735**, totaling **2,896 words** and **12,956 GP runes**. Each source's whole exact word-length inventory is matched against these individual bodies by all six-word seeds, extending the matching run in both directions without substitutions, gaps, or resplitting. Longer runs must have five independently matching following words before any source is eligible to serve as a plaintext crib.

| Frozen historical source | Source words | Words changed by corrected IO | Old longest | Corrected longest |
| --- | ---: | ---: | ---: | ---: |
| 2012 Blake *Marriage* excerpt | 120 | 1 | 7 | **7** |
| *Liber AL* I | 1,897 | 12 | 7 | **7** |
| *Liber AL* II | 1,968 | 8 | 8 | **8** |
| *Liber AL* III | 2,002 | 17 | 8 | **8** |
| **Four texts** | **5,987** | **38** | **8** | **8** |

The closest source-selected run is eight words, below the required twelve, and its immediate continuation is incompatible. The *Liber AL* III best original-body-0 run begins at original word96 and source word1453. Its following five source GP lengths are **[3,5,7,5,1]**, whereas the next five original printed lengths are **[4,7,3,3,5]**. The other longest runs likewise fail immediately upon continuation. None provides a legitimate plaintext alignment or a basis for recovering a cryptographic key. The source-native spelling correction changes four sources' individual word lengths, yet changes none of the four maxima.

## Positive and selection-matched controls

The exact [single-file CommonJS reproducer](../sims/lp2_source_native_historical_crib_delta_sft.cjs) independently asserts the printed LP2 total and body counts and requires the now source-authenticated rendering of the solved p57 parable to have **95 GP runes**, including `TUNNELING` as one `ING` glyph. Its planted test replaces 20 successive printed body-3 length slots by 20 genuine source-native *Liber AL* I word lengths, including an **IO-contracted** source word. It finds the exact **20/20** plant at the preselected body3 original word100 and source word0. This demonstrates the scanner would detect a meaningful changed-spelling excerpt if present.

A second control shuffles the complete printed length inventory **within each of the original nine bodies**, keeping their true lengths, body sizes and source texts fixed. With seeded xorshift32 `0x33012014`, **200 independent shuffles** have maxima **7:2, 8:87, 9:85, 10:22, 11:4**, and zero twelve-word hits. A match of seven or eight is commonplace under this selection-matched null, so the unchanged original maximum is not positive literary evidence. This control is finite to the four chosen texts and does not quantify unrelated languages or new source books.

The test passed [original repository Node 22 CI, run 43420972461](https://github.com/FlareZ123/liber-primus/actions/runs/43420972461). It is also available as a **manual-only** workflow at [`.github/workflows/lp2-source-native-crib-delta-manual.yml`](../.github/workflows/lp2-source-native-crib-delta-manual.yml), with no scheduled or push-triggered workload.

## Decision and next source requirement

**Retire the changed-IO literal-crib route for these four historically selected source texts under the original preserved-word-boundary contract.** This decision does **not** exclude a different author-indicated book, quotations with edited language, independent plaintext/cipher word boundaries, multi-rune padding, alternate source orthography or a different actual cipher. The established original solved-page `ING/IO` spellings still matter for future language models and exact plaintext comparisons.

A successor needs an independently selected source or a complete reversible mechanism. Do not revisit these same four sources by relaxing runs below twelve, cherry-picking substring offsets or tuning cipher phases to short accidental length matches.
