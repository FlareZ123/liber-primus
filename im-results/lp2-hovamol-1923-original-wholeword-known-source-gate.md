# Historical runes-on-a-tree poem: original LP2 known-source plaintext gate

**Agent32, 23 November 2026. Classification: source-led finite negative. No unknown LP2 plaintext or cryptographic key.**

## The independent human-facing rationale

The original LP2 illustrations repeatedly use trees and the [Cicada Gematria Primus rune alphabet](../resources/liber-primus/lp2-corpus.json). The manuscript contains **nine visually headed source chapters**. An historically available work that explicitly combines acquiring runes from a tree with **nine nights** is **stanza 139 of *Hovamol* (Hávamál)**, in Henry Adams Bellows's public-domain 1923 translation of *The Poetic Edda*. The immediate source lines tell how Othin hung from a tree for nine nights and acquired the runes. This is a thematic clue hypothesis, **not an actual first-party citation from Cicada**. The correspondence of nine chapters to nine nights is post hoc and may be accidental. No existing repo path/title using Hovamol/Hávamál was located before the test.

This bounded test asks a specific first-step question that could recover plaintext before another key search: **does the original complete printed rune-word length pattern copy a contiguous passage from the historical rune poem?** A full matching passage could be a known-plaintext anchor; a short matching window is expected by chance. The test avoids inventing an unselected “Hávamál-based key” or arbitrary alignments.

## Exact preserved data and decision

The 165 genuine Bellows stanza translations, extracted exclusively from historical-verse <translation> XML nodes, are stored as [public-domain frozen source](../resources/control/hovamol_bellows_1923_stanzas.json). Source: [fjarri/poetic_edda, chapters/hovamol.xml](https://github.com/fjarri/poetic_edda/blob/main/chapters/hovamol.xml), Git blob `4a38d5dd33f3244a5f8b1d340da3a4bd9db229fc`. They have **5,223 English source words**. The book's **2,896 original complete printed words, 12,956 GP29 runes** are rebuilt unchanged and require the physical cross-page word joins to agree with the source corpus.

Every source English word is assigned the **actual solved-Cicada GP token length** (one rune for TH, NG/ING, EO, OE, AE, IA, EA, IO, and source K/Q/V/Z normalizations) using the project's already published source-native English normalization. The stanza itself defines a historical source boundary, and the nine authentic LP2 red-heading chapters define target bounds. All **165 × nine-chapter** source/target windows are screened, with hash-seeded exact contiguous extension and no unknown-rune fitting. The source-token spelling convention and its limitations are explicit in the SFT.

| Original target | Source search result |
| --- | --- |
| Entire pp0–55, within original chapter boundaries | **Longest contiguous match is 8 whole rune-word lengths**, found five times (LP2 original physical pp10,13,37,39,46); none extends to nine |
| Explicit original p53 red 51-rune passage, 12 words, lengths `5,4,4,11,2,3,2,6,5,5,2,2` | **At most 4** source words match consecutively |
| Original p55 16 page-local complete words, with p54 word carry respected | **At most 5** source words match consecutively |
| 14-word exact stanza139 Hávamál rune-acquisition quotation planted into one original chapter | **All 14** recognized without changed algorithm or fitting |

The full-book 8-word maximum is **not anomalous** under 300 deterministic randomizations preserving every original chapter's complete word-length multiset. **295/300** randomized books match or exceed eight, add-one one-sided tail **296/301 = 0.98339**; histogram of longest stanza-local source matches: **7:5, 8:161, 9:105, 10:25, 11:4**. The true original matches *worse* than typical random order for a copied poem. This rules out the narrow full-word quotation signal for this historical edition. It cannot exclude paraphrase, another Old Norse edition, another rune poem, loss of printed word boundaries under encryption, or a Hávamál-keyed genuinely encrypted passage. The image cannot select a specific Bellows edition, and no source commands that operation.

## Reproduce and stop criterion

Read-only [Windows 11 Node22 single-file original-input SFT](../sims/lp2_hovamol_1923_native_wholeword_crib_sft.cjs), checked source token counts and original printed word counts, exact reproducible stanza139 14-word plant, 300 seeded chapter-multiset controls (`0x33011392`), JSON full result and fatal assertions. [GitHub Actions Node22 successful original run 45089346459](https://github.com/FlareZ123/liber-primus/actions/runs/45089346459). No original-source quote exceeds ordinary chance behavior and no direct cipher inverse is specified; **retire this Bellows Hovamol exact quotation route** rather than rescue it through flexible spelling/edition/offset tuning. Revisit only with an independent first-party citation or authentic selected encryption operation/key source.
