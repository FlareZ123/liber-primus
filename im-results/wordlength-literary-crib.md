# LP2 literary plaintext-source searches under preserved word boundaries

**Status:** intermediate, source- and spelling-specific negatives; **no LP2 plaintext, key, or validated quotation recovered**. The 2,896 canonical whole-word lengths from 12,956 unsolved LP2 runes are the common input to both experiments. Printed lines and physical pages may bisect words, so they are not token separators. The numeric-only physical LP2 page 50 is absent from the rune stream.

## Ciphertext-source hypotheses and implementation

The first search requires a source-text word to have the **exact same GP-rune length** as its ciphertext counterpart, allowing at most two isolated length mismatches over the matched run. The second permits **zero or one extra cipher rune in every word**, testing whether insertion/padding obscures a directly quoted plaintext passage. Both preserve word order and all visible word boundaries. They do not search arbitrary word transpositions, deletion, altered original word segmentation, encrypted English spelling, or unseen source texts.

Both use the declared approximate English-to-GP spelling policy: digraphs TH/EO/OE/AE/IA/EA/NG, special ING contraction, V→U, K→C, Z→S and QU→CW. The calibrated solved LP2 PARABLE passage produces all 20/20 correct lengths. The source editions are public-domain texts; Gutenberg opening/closing boilerplate is cropped where recognized, but remaining editorial material is possible.

The exhaustive six-word seed index for the zero/one insertion model indexes all 64 patterns of per-word length increment and extends every found seed bidirectionally while the specified length relation holds. A 19-word valid match necessarily contains at least one uninterrupted six-word seed (by the pigeonhole principle under this binary increment condition), so the procedure does not selectively pick a literary phrase. **A length match is only a candidate crib; an actual decipherment requires an explicit independently predictive cipher and re-encryption of original ciphertext.**

## Original four-literature-source comparison

| Named source | Source words | Best exact-length run | Best up to two independent length substitutions | Best zero/one-added-rune run |
|---|---:|---:|---:|---:|
| Emerson, *Essays, First Series* | 74,866 | 9 | 14 | 14 |
| Blake, *The Marriage of Heaven and Hell* | 4,680 | 8 | 11 | 12 |
| Gibran, *The Prophet* | 12,572 | 9 | 13 | **19** |
| Hesse, *Siddhartha* | 39,793 | 9 | 16 | 16 |

The exact/2-substitution implementation is [`sims/wordlength_crib_scan.js`](../sims/wordlength_crib_scan.js); the original matching algorithm uses one exact six-word seed and is exhaustive for **18 or more words with at most two substituted lengths**. No 18-word candidates occurred under that policy. The source editions have Git blob hashes `a92be8ba5b3511a003a22ba31523c14397aaa83a`, `44149cc32fa8a46501a95059283526a8a3429705`, `df260a07d56bf5998d40a6360b6132c35c252d10`, and `b93c2c989fb0e4b14b8887622456bf60f1736635` respectively, from the following repositories:
[Emerson](https://github.com/GITenberg/Essays---First-Series_2944),
[Blake](https://github.com/GITenberg/The-Marriage-of-Heaven-and-Hell_45315),
[Gibran](https://github.com/GITenberg/The-Prophet_58585),
[Hesse](https://github.com/GITenberg/Siddhartha_2500).

The 19-word Gibran zero/one-increment candidate occurs at **ciphertext word 843**, source word **4759**, with ten inserted-length words, beginning “field or go with our brothers to the sea”. The candidate has **no deciphered rune support**. Across 300 seeded within-$-section shuffles of all 2,896 observed word lengths, repeating the same four-book maximum search, 16 shuffles produced a match of 19 or more words: plus-one family maximum upper-tail **17/301 = 0.05648**. The null median maximum was 16 and maximum 21. The Gibran-only tail was 3/301=0.00997, but the book was not designated as the unique target in advance.

Independent corroboration was absent: on a second 350-shuffle run, the largest Gibran match **outside** the 19-word neighbourhood was 14 words, equal to the null median, upper-tail **0.79487**. The total count of Gibran matches of length at least 12 was 18 against null median 17 (upper-tail 0.49003). These comparisons are exploratory and rely on the specified 0/+1 insertion model.

## Expanded fixed philosophical and mystical source set

[`sims/padded_wordlength_corpus.cjs`](../sims/padded_wordlength_corpus.cjs) defines **92 GitHub-hosted GITenberg repository slugs in source order**, spanning hermeticism, philosophy, Buddhism, mysticism, theosophy, yoga, and related genres. It downloads fixed `id.txt` or `id-0.txt` paths, measures a SHA-256 over each cropped text, runs the same zero/one-increment six-gram search, and reports exact source/target offsets for top matches. Reproduction is via a **manual-only** [GitHub Actions workflow](../.github/workflows/padded-wordlength-corpus.yml); successful [92-source run 42762677764](https://github.com/FlareZ123/liber-primus/actions/runs/42762677764).

Of 92 configured repositories, **87 source texts were available** under these two path conventions; five failed with HTTP 404 (IDs 4095, 55201, 57145, 7297, 57292). Among the 87 available books, **one 19-word zero/one-increment alignment** was found in the King James Bible (GITenberg ID 10900), starting with “unto the Lord Selah To him that rideth upon the heavens”. The next-highest matches were **17 words** in Boethius' *The Consolation of Philosophy* (14328), *The Philosophy of Spinoza* (31205), and Swedenborg's *Angelic Wisdom about Divine Providence* (18507). The Biblical match was selected from a substantially larger source collection and is a second **length-only** candidate, with neither supporting decoded runes nor evidence of source reuse. This expanded scan has no separately calibrated 92-source familywise false-positive rate and supports no claimed decryption.

The implementation uses ordinary ASCII alphabetic tokenization and may include material other than the named author's text. Its source editions and exact SHA-256 checksums are emitted by the reproducible workflow. The earlier Gutendex catalogue-based attempt [run 42761572628](https://github.com/FlareZ123/liber-primus/actions/runs/42761572628) obtained **zero sources** because of network 403/timeouts; it supplies no negative evidence.

## Zero-step EA marker fingerprint against independent literary sources

A new conditional attack eliminates the need to assume that original ciphertext word lengths agree with a quoted plaintext source. Let the observed within-section equality sites `C[i]=C[i-1]` be **known plaintext GP-EA positions**. This is the invertible `zero step iff EA` hypothesis, a **tested conjecture**, not an established feature of LP2. There are **[4,6,9,10,11,13,12,21]** such sites in the eight source-canonical LP2 sections, totaling 86 original zero steps. [The exact source fingerprint attack](../sims/ea_zero_step_literary_fingerprint.cjs) GP-encodes each independent literary reference under either normal GP digraph spelling or the usual ING contraction. For every possible contiguous source offset and each of the eight original section lengths **[729,1145,1738,1894,1021,1433,1680,3316]**, it compares its binary GP-EA locations with the original equal-ciphertext positions, scoring overlap and symmetric marker disagreement. No candidate key or plaintext sentence is fitted. A full match requires that every original equality site be EA *and* every source EA after the section's first rune be an original equality site, with no insertions/deletions.

The search covers Shakespeare, Emerson, Gibran, the native solved-Cicada register, and **87** accessible public-domain GitBerg sources out of 92 fixed bibliography entries; five failed network retrieval. These form **182 source/spelling combinations**, each searched in full for all eight section lengths. The strongest partial result is the first original LP2 section (729 runes) against Aleister Crowley's *Tannhäuser*, GITenberg ID **70261**, conventional GP spelling, source offset **2793**: **3/4** source-EA marker sites coincide with three of the original four zero steps; the source passage has only three EA and yields Hamming disagreement **1**. No tested text yields even one entire perfect source/section marker fingerprint. Source windows carrying strong partial overlap are expected when millions of offsets and multiple texts are searched; this one lies around its *Preface*, with source/cipher word-start overlap **36 of 729** against **42.19** under independent boundary frequencies, so it does not independently corroborate an authentic quotation.

The same search performs a true-source positive with a fresh source-disjoint contiguous 12,956-rune Shakespeare segment, encrypted under an independently specified exact zero-step GP alphabet transition. It rediscovers the **correct original offset in all eight synthetic sections**, with Hamming distance zero and total **12,956/12,956** true plaintext positions covered; per-section marker counts **[2,4,7,6,3,6,17,40]**. The original-source failure is informative for the narrow model of a verbatim quote using this zero-to-EA law; no key, authentic LP2 plaintext, or destination follows from the partial Tannhäuser match. [Successful 87-book manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42812406652). The existing [literary-source manual workflow](../.github/workflows/padded-wordlength-corpus.yml) now has an *exclusive* `ea-fingerprint` mode so rerunning this test does not also launch the older word-length search.

## Order-independent whole-section word-bag source locator

The historical ciphertext's word-length adjacency is atypically weak for ordinary GP-English, so a new inverse allows **arbitrary permutation of intact words within every full LP2 text section**, a much larger family than any fixed columnar permutation. If an LP2 section directly copies a contiguous source excerpt without altering word boundaries or per-word GP length, its **whole-section length histogram must match exactly** regardless of how all words were scrambled. This creates an exact, permutation-key-free necessary-condition test for a copied and rearranged source passage.

The original eight source-canonical sections contain **[158, 255, 385, 435, 224, 326, 378, 735] words**, comprising **2,896 words and 12,956 runes**. The [exact sliding source locator](../sims/lp2_wordbag_source_locator.cjs) uses the same explicit English-to-GP digraph/ING length rule and the same 92-book frozen GITenberg bibliography as the preceding experiments. Every contiguous source window with the section's number of words is examined using an incrementally maintained word-length histogram. The sum of absolute histogram differences is twice the **minimum number of individual word-length replacements** required to make the two multisets equal; an exact match has zero replacements.

| LP2 section | Original words | Fewest replacements among all scanned source windows | Source Gutenberg ID |
| ---: | ---: | ---: | ---: |
| 0 | 158 | **6** | 14209 |
| 1 | 255 | **12** | 12894 |
| 2 | 385 | **15** | 12894 |
| 3 | 435 | **17** | 1998 |
| 4 | 224 | **10** | 1998 / 1397 |
| 5 | 326 | **9** | 12894 |
| 6 | 378 | **13** | 12894 / 1397 |
| 7 | 735 | **35** | 1998 |

**Observed exact matches: zero across all eight sections and all 87 accessible source books.** The same five previously inaccessible Gutenberg editions returned HTTP 404; all 92 configured IDs were attempted. A positive control takes eight independent known-source windows of precisely the original section word counts from Gibran's *The Prophet*, shuffles **every word within each window** using deterministic seeds, and has the unchanged blind histogram scanner find a zero-distance original-source window for **8/8 planted sections**. Due to overlapping equal-histogram windows, the earliest zero-distance source offset can differ by a few words from the planted offset; the true offset itself is independently checked to be exact.

The scanner's algorithm has no unknown secret permutation, key, source offset, or plaintext-symbol assignment to fit. It is exhaustive for the **particular hypothesis of exact GP word lengths, intact words and a contiguous source excerpt per section**. The result rejects direct arbitrary word-order rearrangements of these specific 87 available books under that model. It neither rejects original prose, other source texts, mixed excerpts, changing word breaks, rune padding, Latin orthography, nor arbitrary per-word changes. No probability is inferred from the best postselected matches.

The [manual source scan passed on the original input and positive controls](https://github.com/FlareZ123/liber-primus/actions/runs/42857287721). The existing [literary source workflow](../.github/workflows/padded-wordlength-corpus.yml) has an exclusive wordbag option, so this run does not repeat the earlier ordered-word or EA-marker scans.

## Inference and useful next step

Under the ordered-length, EA-marker and whole-section order-independent word-bag models, no direct quotation was verified. The manuscript's unusually weak adjacent word-length dependence is an independent difficulty for **independent one-rune padding of ordinary ordered English** (see [word-length architecture tests](wordlength-order.md)). A clue-derived source text remains worth checking **only if accompanied by a cipher architecture or a predicted longer held-out passage**. Further breadth-first source matching without stronger constraints will produce additional coincidental short runs.

