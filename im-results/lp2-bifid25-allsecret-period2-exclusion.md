# All-secret period-two and period-five 5×5 Bifid: original-LP2 exclusion

**Evidence class (Agent10, 11 November 2026): exact key-independent original-cipher capacity exclusion.** A 5×5 Bifid cipher with **any 25! secret key square**, **any choice of four transparent runes among the 29 GP glyphs** (all 23,751 choices), and either a period-two clock reset at the whole book, each physical rune page, each printed section, or each canonical word, **or a period-five book-wide clock**, cannot directly encode any same-length GP-English window of the pinned Shakespeare text as the original 12,956 unsolved LP2 ciphertext runes. No unknown manuscript plaintext, authentic key, or actual encryption mechanism has been recovered.

## Source clue and hypothesis

The 2014 Cicada stages published a **5×5 magic square**. Classical Bifid is a recognizable coordinate-fractionation cipher using a secret 5×5 alphabet square. The additional **four** of GP's 29 runes might hypothetically pass through unchanged. No original author instruction establishes Bifid or selects which four runes are transparent. The mathematically strongest finite test therefore lets the unknown key choose all 25! square permutations and all four-symbol subsets, before considering plaintext.

This model is distinct from the previously tested [28-/30-symbol rectangular coordinate shift](coordinate-fractionation-pair-capacity.md), [27-cube Trifid](trifid-27cube-allsecret-bound.md), and direct 5×5 numeric-square additive pads: standard Bifid concatenates row coordinates then column coordinates within each period-two block.

## Universal upper-bound proof

Let `S` be **any** one-to-one assignment of 25 GP glyphs to a keyed 5×5 square. Ignore the four transparent glyphs when advancing the core clock; reproduce each transparent glyph at its original position. For a full **period-two** ciphertext pair `(a,b)` with coordinates `S(a)=(ra,ca)`, `S(b)=(rb,cb)`, the standard Bifid inverse produces

```text
P0 = S^-1(ra,rb)
P1 = S^-1(ca,cb)
```

Any target plaintext glyph `e` has one square row and one column. Each coordinate occurs on **exactly five** secret core glyphs. Each pair output can therefore equal `e` only if the original ciphertext pair belongs to *some 5×5 rectangle* of **25 ordered glyph pairs**.

For one choice of the four bypass glyphs and a prescribed reset clock, remove the bypasses and count the original **29×29 ordered ciphertext-pair histogram** `F[a,b]`. Let `M25` be the sum of the **25 largest individual counts**, regardless of which rectangle they form. Every actual secret rectangle's count is at most `M25`. Each complete two-rune Bifid pair contributes **at most 2*M25** occurrences of any fixed core plaintext letter.

A core stream can have one odd trailing glyph per reset segment; a period-one residual Bifid block reproduces that glyph unchanged. Let `maxTail` be the largest tally of trailing source glyphs with one common identity among all segments. Then, for **every** key square, core target `e`, and bypass set:

```text
number of plaintext e <= 2 * M25 + maxTail
```

For a **period-five** block, standard Bifid decryption associates each plaintext output position `i` with two of the five ciphertext symbols, using the coordinates at `D[i]` and `D[5+i]` of the ten interleaved ciphertext row/column coordinates. Each coordinate equality again restricts the relevant ciphertext glyph to **five** candidates. Partition the resulting ordered source-pair events into the **four** possible (row,row), (row,column), (column,row), (column,column) coordinate-type classes. The exact sum of each class histogram's 25 largest cells is an all-key upper bound on its contribution. A trailing partial block is handled at its **actual** remaining size and a size-one block contributes only its actual source identity. This is the same valid rectangle relaxation, applied to the ordinary length-five Bifid coordinate stream. No additional fitted alphabet or key is introduced.

If `e` is one of the four bypass glyphs, its plaintext frequency equals its original ciphertext frequency, at most **492**. Taking the maximum of those two cases gives a universal 29-symbol plaintext bound. The proof requires no guess about the 25-square key arrangement or four bypass identities. The top-25 relaxation is deliberately generous and safe.

## Exact exhaustive original results

Original inputs are the full [canonical rune corpus](../resources/liber-primus/lp2-corpus.json), [printed transcript](../resources/lp2-transcription.txt), and [page-spanning word parser](../sims/lp2_word_pages.cjs). The book has **12,956** unknown runes in **55 rune-bearing physical pages**, **eight** source $$ sections with rune lengths `[729,1145,1738,1894,1021,1433,1680,3316]`, and **2,896** complete source words. In each row of the table, every one of the **23,751** four-symbol bypass sets was checked; **118,755 source/clock cases** are covered: 95,004 period-two configurations plus 23,751 period-five configurations.

| Bifid period and reset | Segments | Min bound over 4-sets | Max bound over 4-sets | Maximizing transparent GP indices |
| --- | ---: | ---: | ---: | --- |
| Whole book | 1 | 748 | **891** | 7,9,17,23 |
| Physical rune page | 55 | 747 | **885** | 1,2,10,23 |
| Printed `# All-secret period-two and period-five 5×5 Bifid: original-LP2 exclusion

**Evidence class (Agent10, 11 November 2026): exact key-independent original-cipher capacity exclusion.** A 5×5 Bifid cipher with **any 25! secret key square**, **any choice of four transparent runes among the 29 GP glyphs** (all 23,751 choices), and either a period-two clock reset at the whole book, each physical rune page, each printed section, or each canonical word, **or a period-five book-wide clock**, cannot directly encode any same-length GP-English window of the pinned Shakespeare text as the original 12,956 unsolved LP2 ciphertext runes. No unknown manuscript plaintext, authentic key, or actual encryption mechanism has been recovered.

## Source clue and hypothesis

The 2014 Cicada stages published a **5×5 magic square**. Classical Bifid is a recognizable coordinate-fractionation cipher using a secret 5×5 alphabet square. The additional **four** of GP's 29 runes might hypothetically pass through unchanged. No original author instruction establishes Bifid or selects which four runes are transparent. The mathematically strongest finite test therefore lets the unknown key choose all 25! square permutations and all four-symbol subsets, before considering plaintext.

This model is distinct from the previously tested [28-/30-symbol rectangular coordinate shift](coordinate-fractionation-pair-capacity.md), [27-cube Trifid](trifid-27cube-allsecret-bound.md), and direct 5×5 numeric-square additive pads: standard Bifid concatenates row coordinates then column coordinates within each period-two block.

## Universal upper-bound proof

Let `S` be **any** one-to-one assignment of 25 GP glyphs to a keyed 5×5 square. Ignore the four transparent glyphs when advancing the core clock; reproduce each transparent glyph at its original position. For a full **period-two** ciphertext pair `(a,b)` with coordinates `S(a)=(ra,ca)`, `S(b)=(rb,cb)`, the standard Bifid inverse produces

```text
P0 = S^-1(ra,rb)
P1 = S^-1(ca,cb)
```

Any target plaintext glyph `e` has one square row and one column. Each coordinate occurs on **exactly five** secret core glyphs. Each pair output can therefore equal `e` only if the original ciphertext pair belongs to *some 5×5 rectangle* of **25 ordered glyph pairs**.

For one choice of the four bypass glyphs and a prescribed reset clock, remove the bypasses and count the original **29×29 ordered ciphertext-pair histogram** `F[a,b]`. Let `M25` be the sum of the **25 largest individual counts**, regardless of which rectangle they form. Every actual secret rectangle's count is at most `M25`. Each complete two-rune Bifid pair contributes **at most 2*M25** occurrences of any fixed core plaintext letter.

A core stream can have one odd trailing glyph per reset segment; a period-one residual Bifid block reproduces that glyph unchanged. Let `maxTail` be the largest tally of trailing source glyphs with one common identity among all segments. Then, for **every** key square, core target `e`, and bypass set:

```text
number of plaintext e <= 2 * M25 + maxTail
```

For a **period-five** block, standard Bifid decryption associates each plaintext output position `i` with two of the five ciphertext symbols, using the coordinates at `D[i]` and `D[5+i]` of the ten interleaved ciphertext row/column coordinates. Each coordinate equality again restricts the relevant ciphertext glyph to **five** candidates. Partition the resulting ordered source-pair events into the **four** possible (row,row), (row,column), (column,row), (column,column) coordinate-type classes. The exact sum of each class histogram's 25 largest cells is an all-key upper bound on its contribution. A trailing partial block is handled at its **actual** remaining size and a size-one block contributes only its actual source identity. This is the same valid rectangle relaxation, applied to the ordinary length-five Bifid coordinate stream. No additional fitted alphabet or key is introduced.

If `e` is one of the four bypass glyphs, its plaintext frequency equals its original ciphertext frequency, at most **492**. Taking the maximum of those two cases gives a universal 29-symbol plaintext bound. The proof requires no guess about the 25-square key arrangement or four bypass identities. The top-25 relaxation is deliberately generous and safe.

## Exact exhaustive original results

Original inputs are the full [canonical rune corpus](../resources/liber-primus/lp2-corpus.json), [printed transcript](../resources/lp2-transcription.txt), and [page-spanning word parser](../sims/lp2_word_pages.cjs). The book has **12,956** unknown runes in **55 rune-bearing physical pages**, **eight** source $$ sections with rune lengths `[729,1145,1738,1894,1021,1433,1680,3316]`, and **2,896** complete source words. In each row of the table, every one of the **23,751** four-symbol bypass sets was checked; **118,755 source/clock cases** are covered: 95,004 period-two configurations plus 23,751 period-five configurations.

| Bifid period and reset | Segments | Min bound over 4-sets | Max bound over 4-sets | Maximizing transparent GP indices |
| --- | ---: | ---: | ---: | --- |
| Whole book | 1 | 748 | **891** | 7,9,17,23 |
| Physical rune page | 55 | 747 | **885** | 1,2,10,23 |
|  section | 8 | 745 | **889** | 11,15,21,27 |
| Canonical complete word | 2,896 | 746 | **865** | 8,14,18,25 |
| **Period five: whole book** | 1 | 744 | **848** | 3,15,19,23 |

The independent [Shakespeare first-300k source](../resources/control/shakespeare_first300k.txt) converts to **218,800 GP29 symbols** using greedy `TH NG EO OE AE IA EA` digraphs, plus the exact source program's published `QU→CW`, `K,Q→C`, `V→U`, `Z→S` normalizations. The bare GP-E glyph (index18) appears **at least 1,397 times in every contiguous 12,956-symbol English window**. The first window contains **1,517**. Every original-cipher capacity, with **all secrets relaxed optimistically**, is below 1,397. The fixed original maximum ciphertext glyph count 492 is also below.

**Actual positive:** encode the first 12,956 GP-English source symbols by period-two Bifid using the natural 5×5 row-major indices0–24 and transparent indices25–28. The source-native inverse exactly recovers **12,956/12,956** plaintext runes, preserving all passthrough positions and odd residual core glyphs. The same key-independent capacity formula admits **3,804** occurrences of E in this genuine period-two ciphertext, correctly exceeding the actual **1,517**. A second independent **period-five** Bifid plant also roundtrips all **12,956/12,956** symbols and its four-class capacity allows **2,636** instances of the same 1,517 E control count. This verifies that the bound does not mechanically reject valid Bifid encryption.

[Standalone exhaustive CommonJS SFT](../sims/lp2_bifid25_allsecret_period2_sft.cjs) computes each exact mask/clock bound, all original data assertions, the minimum over every GP-English source window, and the independent forward/inverse planted control. It uses integer counts rather than p-values or language fitting.

## Consequence and limits

The **source-shaped standard period-two Bifid (four clocks) and period-five Bifid (book-wide clock) are eliminated as a single-step original-LP2 native-English decoder**, independent of all square and four-rune choices. The test is silent about untested periods (including three, four and seven), period-five page/section/word resets, different coordinate shuffles, extras that consume the Bifid clock, external alphabets, nested encryption, or plaintext from an unrelated language. Crucially, the 5×5 square does **not authenticate Bifid** as a human-intended operation. No arbitrary follow-up alphabet or pass-through search is warranted for these rejected period-two/period-five configurations; source-selected alternate transforms are the meaningful next step.
