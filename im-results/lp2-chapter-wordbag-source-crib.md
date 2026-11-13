# Historical book-code source texts: unordered chapter and page crib search

**Agent 11, 13 November 2026. Intermediate original-input result.** This is a direct search for **recoverable source plaintext** under the hypothesis that an LP2 page or illustrated chapter consists of a verbatim passage whose complete printed words were **reordered** before or after a word-length-preserving cipher. Nine original illustrated chapter inventories and all 55 rune-bearing physical page inventories were checked. **No unknown plaintext, cipher key, authenticated word permutation, or destination was recovered.** The complete-chapter matching hypothesis fails for the finite historical sources below.

## Why this differs from the prior ordered word-length cribs

The observed 2,896 unknown LP2 word lengths have negligible prose-like adjacency and sentence-role dependencies, as established by [the original source-grammar study](lp2-original-wordlength-grammar-mi.md). Existing historical book-code crib screens test consecutive words in source order, so they cannot identify a quotation whose **words have been transposed**. The older 2012/2013 Cicada book-code solutions independently select concrete candidate texts. This experiment keeps their *word inventories* and removes their ordering as the obstacle. It does not assume that the actual manuscript uses a word shuffle, and no source instructs one.

For each original page or image-delimited chapter, collect the **complete canonical printed words beginning in that range**, joining words across physical page and line wraps without splitting their GP rune lengths. Match the multiset of their original lengths against **every contiguous same-word-count source interval** of each historically selected book-code text. An exact histogram hit is necessary for a perfect source quote under *any* complete-word permutation, regardless of a secret word-order key or letterwise alphabet substitution.

The pinned sources are the [2012 book-code GP-length dataset](../resources/derived/2012-bookcode-gp-wordlengths.json) (Britannica volume 6 slice 3, 186,810 words; *Agrippa*, 1,691; *Mabinogion* story, 105,582), [2013 Crowley *Liber AL*](../resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json) (three separate chapters: 1,897 / 1,968 / 2,002), and separately normalized [Mabinogion](../resources/external/cicada2012-mabinogion-gutenberg5160-gp-wordlengths.json) and [Agrippa](../resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json) versions. The two Mabinogion records are **alternate encodings of one original work**, rather than independent corroborating book-code witnesses. Original GP lengths and the original 2012 source conversion conventions are preserved.

## Exact illustrated-chapter test

Let \(H_T(k)\) be the count of printed words of GP length \(k\) in a target chapter and \(H_{S,t}(k)\) the count in a same-sized reference window beginning at word \(t\). Exhaustively minimize

\[
D(T,S)=\min_t\sum_{k=1}^{31}|H_T(k)-H_{S,t}(k)|.
\]

An exact unordered word-bag plaintext candidate must have **D=0**. A value D=2 means the shortest possible **one word length differs**, although it does not specify which words or their order. The detector computes the distance in O(reference length) per target via rolling histograms. No language scoring, fitted cipher key, word sorting, guessed offset, or source-dependent exception participates.

| Physical original chapter | Canonical whole words / runes | Closest historical source, minimal D |
|---|---:|---|
| p0–2 | 158 / 729 | 2012 Britannica, **18** |
| p3–7 | 255 / 1,145 | 2012 Mabinogion, **38** |
| p8–14 | 383 / 1,729 | 2012 Mabinogion, **58** |
| p15–22 | 437 / 1,903 | 2012 Mabinogion, **60** |
| p23–26 | 224 / 1,021 | 2012 Mabinogion, **38** |
| p27–32 | 326 / 1,433 | independently normalized Mabinogion, **30** |
| p33–39 | 378 / 1,680 | 2012 Mabinogion, **46** |
| p40–53 | 669 / 3,008 | 2012 Mabinogion, **102** |
| p54–55 | 66 / 308 | 2012 Britannica, **8** |

All nine nonzero minima exclude an **exactly copied complete contiguous passage from any of the eight reference profiles**, even after granting an arbitrary permutation of all its complete words. This exclusion does not cover original Cicada prose, other literary sources, a partly quoted passage, added/deleted words, changed GP spelling, different page/chapter boundaries or word-internal fractionation.

## Short single-page hits show the danger of accidental source matches

A scan of every individual original rune-bearing physical page finds just these exact-length **bag** hits:

| Original page | Complete words beginning there | Historical source | Exact windows |
|---|---:|---|---:|
| p49, mixed runes and numerical table | 17 | 2012 Mabinogion at word 18,175 and one further position | 2 |
| p49, same underlying book | 17 | independent GP normalization of Mabinogion | same 2 |
| p55, terminal illustrated tree page | 16 | 2012 Britannica, word **140,754** | **1** |

There is **no chapter-wide match**. Original p55's 16 complete beginning words match a 16-word inventory from a 2012 *Britannica* excerpt concerning a future English cleric receiving religious orders. This is a **length-only** coincidence. The excerpt itself, extracted from the historical source blob \`8cba4356812ff852e3fe9b5b8670c\`, reads:

> of England to prepare for holy orders He became curate of South Cadbury Somersetshire and on

A stronger, key-independent letter-equality check immediately contradicts the idea that this particular 16-word excerpt is original p55 plaintext under **any shared 29-way monoalphabetic rune substitution**, even if the entire word order were secret. Five source words, \`prepare\`, \`orders\`, \`became\`, \`Cadbury\` and \`Somersetshire\`, have internal repeated-rune equality patterns that **no same-length complete printed p55 word has at all**. A fixed alphabet bijection preserves those equalities exactly. Thus the exact single-page bag match does not provide a plaintext candidate under this minimal substitution model. It could survive a genuinely position-varying encryption, which the source does not select.

**Original-input and positive control:** [single-file CommonJS SFT](../sims/lp2_chapter_wordbag_source_crib_sft.cjs), Node.js 22, no network/packages/writes. It independently crosschecks every transcript rune against the canonical 55 pages, verifies the nine original chapter totals and all three reported individual-page exact hits, and plants complete source-length bags in reversed word order at three chapter sizes; all plants yield D=0. A source excerpt's printed symbol-equality signature is separately checked against the 16 original p55 word strings without assuming a secret alphabet. The rolling search and the page-wise counts were also executed against the currently connected repository's exact pinned input data in a standalone JavaScript runtime.

**Research decision:** This route does not recover a source quotation from the historically selected books. Source-word-order cryptanalysis remains open when a *different* original clue fixes a source passage or a reversible permutation. More arbitrary source-window near matches should not be elevated to plaintext on word lengths alone. Reopen this specific historical-source model only if an independently motivated source identity, stronger word-invariant agreement or actual full-cipher inverse appears.