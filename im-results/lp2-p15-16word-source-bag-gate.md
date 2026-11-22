# A p15 4×4 word-transposition source-bag gate

**16 November 2026, Agent 3. Status:** original-corpus, key-independent finite exclusion. No previously unknown LP2 plaintext or authentic key recovered.

## Human route and its weak premise

Original physical p15 prints sixteen Fibonacci-prime-derived numbers in a 4×4 matrix. It could invite a human to arrange blocks of sixteen *printed words* in that layout and reorder the words. Separately, the original unknown LP2 transcription contains exactly **2,896 complete printed words = 181 × 16**, after rejoining all **32** physical-page word carries. That divisibility is only a modest coincidence; the printed p15 matrix does not explicitly say to shuffle words, and the manuscript does not establish that ciphertext word lengths equal plaintext word lengths.

The strongest inexpensive test avoids committing to one of the many p15 square traversal orders. **Every possible permutation of sixteen intact words preserves the multiset of their GP29 word lengths.** Therefore, if the manuscript reorders consecutive sixteen-word chunks copied verbatim from a particular source, at least two neighboring source chunks must yield the same two length-multisets at 16-word source positions separated by exactly sixteen. This remains true if *each* chunk uses a different unknown permutation, including a p15 rank-order permutation. Test all sixteen possible ciphertext block phases, so the initial word-clock offset is free.

This is not a proof against an independently generated English plaintext, non-word-preserving encoding, padding/deletions, transpositions that cross block boundaries or sources outside those actually tested. Its useful decision is whether seven specific historical/literary references can be copied in this particular word-preserving way.

## Exact original inputs and normalization

The standalone [SFT](../sims/lp2_p15_16word_anypermutation_source_bag_sft.cjs) loads `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`. It removes line-break markers and joins all 55 rune-bearing pages before extracting words, verifying **2,896 words / 12,956 source runes**. It normalizes GP29 English words with the repo's period-native greedy **ING / IO** letters and standard `QU→CW`, `V→U`, `K/Q→C`, `Z→S` aliases. The Latin control already consists of source-authentic GP rune-width words.

The seven fixed references are Shakespeare's first 300k (55,407 words); Gibran's *Prophet* (15,733); Emerson's essays (77,932); Latin Vulgate (39,835); exact 2013 Cicada Book-of-the-Law chapters I–III (5,867 with this word parser); Blake's *Song of Liberty* (353); and the signed 2012 Blake chorus (56). All are repository-pinned source files. The source-word counts and original-corpus counts are SFT assertions.

## Complete search result

For each of 16 possible ciphertext word origins, take disjoint sixteen-word blocks. The source index contains the sorted sixteen-word GP-length multiset for **every consecutive source window**. Every exact one-block match is extended at source offsets `j+16`, `j+32` and ciphertext offsets `i+16`, `i+32`. The report does not select among matching source offsets using the ciphertext.

| Source | Longest consecutive matching 16-word blocks | Matches of two or more |
|---|---:|---:|
| Shakespeare | 1 | 0 |
| Gibran | 1 | 0 |
| Emerson | 1 | 0 |
| Latin Vulgate | 1 | 0 |
| Cicada 2013 Book of the Law, I–III | 1 | 0 |
| Blake *Song of Liberty* | 1 | 0 |
| 2012 signed Blake chorus | 1 | 0 |

A 48-word contiguous Gibran plant with each sixteen-word block **reversed independently** is recognized for **at least three consecutive blocks**, demonstrating that the detector does recover true word-order-scrambled copied prose. A second independent check of the original's own sixteen-word bags finds no pair of adjacent original bag signatures repeated at another nonoverlapping location, for any of the sixteen phases (a separate diagnostic, not a plaintext test).

**Decision:** A contiguous **32-word quotation** from these seven reference corpora cannot underlie any two full consecutive original sixteen-word blocks if encryption preserves each original printed word's GP rune length and scrambles complete words only *within* each block. This exclusion is exact for the indexed finite sources and all 16 phases; it does not depend on p15's numerical ordering, cipher alphabet or invented key. The relation `2896=181×16` alone supplies no authentic cipher operation. This route should be reopened only after a source-authored link to sixteen-word word-order transposition or an independently located candidate manuscript/source, rather than a larger arbitrary permutation search.

**Reproduce on Windows 11:** `node sims/lp2_p15_16word_anypermutation_source_bag_sft.cjs`. The SFT prints all source counts and exact maximum run lengths and aborts if an original two-block match or positive-control failure occurs.
