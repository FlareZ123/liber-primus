# LP2 word collisions exclude book-, page- and line-static deterministic word ciphers for native-GP prose

**Classification: exact key-independent ciphertext invariant, with source-conditional exclusion; no recovered unknown plaintext or real key.** Agent4, 11 November 2026; Director Issue [#356](https://github.com/FlareZ123/liber-primus/issues/356). One-file offline reproducer: [\`sims/lp2_word_collision_injective_sft.cjs\`](../sims/lp2_word_collision_injective_sft.cjs).

## Exact original-manuscript result

The 55 unknown rune-bearing LP2 pages have **2,896 complete printed words** totaling **12,956 original GP29 runes**. The parser joins line and physical-page carries and terminates a word only on source-printed word/punctuation delimiters \`- . & $ §\`. Partition the complete words by actual rune length and compare *whole rune strings*, rather than transliterations.

| GP length | Complete original words | Distinct original words | Identical-word collision pairs |
| ---: | ---: | ---: | ---: |
| 1 | 83 | 28 | 107 |
| 2 | 448 | 354 | 106 |
| 3 | 720 | 704 | 17 |
| 4 | 513 | 513 | **0** |
| 5 | 317 | 317 | **0** |
| 6 | 256 | 256 | **0** |
| 7 | 216 | 216 | **0** |
| 8 | 156 | 156 | **0** |
| 9 | 78 | 78 | **0** |
| 10 | 52 | 52 | **0** |
| 11 | 32 | 32 | **0** |
| 12 | 18 | 18 | **0** |
| 13 | 4 | 4 | **0** |
| 14 | 3 | 3 | **0** |
| **All** | **2,896** | **2,731** | **230** |

**All 1,645 words with length at least four are distinct**, despite their natural-language-sized word-length distribution. Every repeated original word is one, two or three runes long. The 230 collision *pairs* equal \(\sum_{w}\binom{n_w}{2}\), where \(n_w\) is each exactly printed GP29 word's frequency. There are 28 distinct one-rune words among 83 singletons. This conclusion uses no guessed key, plaintext or English dictionary.

## Mathematical cipher-family consequence

Let \(x_i\) be the plaintext **whole word** at printed position \(i\), let \(f\) be any **single position-independent deterministic word map**, and suppose the printed separators are plaintext word separators. If \(x_i=x_j\), then \(f(x_i)=f(x_j)\). Therefore the number of repeated ciphertext-word pairs must be **at least** the plaintext-word collision count whenever the map preserves the source word boundaries. If \(f\) is also **injective** (including a fixed per-word rune permutation or a fixed bijective word codebook), the two word-equality partitions, and every length-conditioned collision count for length-preserving \(f\), are **exactly equal**. A deterministic but non-injective map can create *more* collisions and cannot erase repeats.

Consequently any source-preserved same-length native-GP plaintext under a position-independent deterministic word map must have **no repeat at all among its 1,645 words of length four or greater**, and must include **at least 28 distinct one-rune plaintext words** if length is preserved. An ordinary English manuscript with its natural repeated *THE*, *AND*, *THAT*, *WITH* and many other words is incompatible with this exact invariant under those assumptions. The result does not exclude position-specific keys, changing word segmentation, a non-native original language, or a plaintext text purposely constructed with no long repeated words.

An arbitrary **injective, length-preserving synthetic word codebook** planted in each control corpus preserves the full collision partition exactly, providing an implementation-positive control.


## Stronger page-local invariant, excluding even independent page-specific word codebooks

This is the stronger key-independent result. Assign each complete original GP word to its source-visible **starting rune page**, carrying words through line/page boundaries and omitting numeric-only physical p50. Across the **55 original rune-bearing pages**, **only four pairs of identical words occur within any one page**: two one-rune pairs and two two-rune pairs. **51/55 pages have no repeated word at all**, and **0/55 pages repeat a word of length three or more**. No word of four or more runes repeats **anywhere** in the entire original manuscript, as established above.

This is a page-local invariant with a stronger cipher consequence than the book-wide count. Even a separate, entirely arbitrary **injective secret dictionary or per-word static substitution for each page** necessarily preserves each original page's internal equal-word pairs. A non-injective deterministic map can create extra repeated words but cannot erase any. Therefore, under preserved printed word boundaries, the native plaintext on all 55 pages must have at most **four intra-page identical-word pairs in total**, regardless of whether the secret word dictionary changes at page turns.

For each of the exact original 55 page-specific GP-length inventories, the same four independently fixed English sources were independently sampled **with replacement in the matching length bin**, for **2,000 trials per corpus** using XorShift32 seed \`0x503331\`. Each trial preserves every page's word count and all per-word rune lengths. Results:

| Control source | Original-page-matched median intra-page equal-word pairs | Minimum of 2,000 | Maximum pages with zero repeats | Original |
| --- | ---: | ---: | ---: | ---: |
| Solved LP1 + p57 | **770** | **657** | 4 | |
| Gibran, *The Prophet* | **707** | **561** | 5 | |
| Shakespeare first 300k characters | **353** | **286** | 8 | |
| Emerson, Essays | **551** | **449** | 6 | |
| **Unknown LP2 original** | **4** | **4** | **51** | **4** |

Every one of **8,000** length- and source-page-matched English control samples lies far above the actual **four** intra-page repetitions. The fixed-corpus per-author one-sided plus-one upper tail is at most **1/2,001**. Page-wise deterministic per-word mappings are therefore incompatible with the tested ordinary native-GP English models even when **55 wholly different secret word codebooks** are permitted. This does not prove all possible natural language or all page-reset ciphers impossible. Cipher state changing *within* pages, changes to word boundaries, and unknown non-native source registers remain viable. The SFT separately plants an injective page-local word map and verifies identical per-page collision counts for the control.


## Strongest printed-line-local invariant: 593/594 lines contain no repeated word

The page-local exclusion still permits a separate word dictionary for *every printed line*. Test instead the **594 original source-printed rune lines** previously image-confirmed; parsing \`/\` and page breaks \`%\` preserves cross-line words by assigning each complete GP word to its **starting printed line**. Exactly **2,896 original words** and **12,956 original runes** are represented. Two lines start no complete word because of a carry. Only **one** pair of identical words appears within any single printed line. **593/594 printed lines contain no duplicated word**, and the sole repeated pair is at most two runes long.

Every deterministic **line-static** word-to-word map must preserve identical word pairs inside each line. Even allowing an independent, arbitrary secret bijection for all 594 lines, the unknown native plaintext must itself have **at most one** identical within-line word pair, provided the source-printed separators represent plaintext word boundaries. An injective line-secret dictionary cannot remove any repeat, and a noninjective deterministic dictionary can only increase them.

With a separately frozen XorShift32 seed \`0x5033301\`, the same four native-GP English controls and original GP normalization were sampled **2,000 times each**, drawing source words with replacement in their corresponding GP-length bins while preserving **every original printed line's word count and every word length**. All exact original source lines stay fixed.

| Source | Median within-line identical-word pairs | Minimum of 2,000 | Maximum zero-duplicate original lines |
| --- | ---: | ---: | ---: |
| Solved LP1 plus solved p57 | **60** | **38** | 558 |
| Gibran, *The Prophet* | **57** | **34** | 561 |
| Shakespeare first 300k characters | **28** | **13** | 582 |
| Emerson, Essays | **45** | **24** | 572 |
| **Original unknown LP2** | **1** | **1** | **593** |

Every one of 8,000 line- and length-matched native-source controls shows **more** repeated word pairs than the source-printed original, with fixed-corpus one-sided plus-one empirical tail at most **1/2,001** for each model. A planted injective whole-word GP29 codebook reproduces the entire sampled line-local equality partition exactly in each corpus. This is an additional, **finer causal restriction**: ordinary English with preserved printed word boundaries is incompatible even with secret word dictionaries restarted independently every printed line. This is **conditional** on the native prose register and independent source sampling; actual plaintext could have deliberately no short-range repeats. Changing keys/state at each occurrence, altered word segmentation and other plaintext languages remain open.

## Locked native-source comparison

Before scoring originals, the source model retains the exact 14-bin original word-length inventory, GP-normalizes each English word using the repository's documented QU→CW, V→U, K→C, Z→S, TH/EO/OE/AE/IA/EA/NG digraph and ING contraction, then independently draws source tokens **with replacement within each original GP-length bin**. This changes source order while retaining each real author's source-word multiplicities and the original total/count per length. It is a literal length-matched source-word multiset bootstrap, rather than selecting advantageous English sentences.

Controls are the solved LP1 translation reference augmented only by the **already-solved LP2 p57 PARABLE** to cover the original length-14 bin, plus three disjoint author corpora checked in under \`resources/control/\`. **1,000** length-matched samples per source with fixed XorShift32 seed \`0x4c503335\` yield:

| English source | Median word collision pairs overall | Median collision pairs, GP length ≥4 | Minimum long-word collision pairs across 1,000 |
| --- | ---: | ---: | ---: |
| Solved LP1 + solved p57 | 40,761 | 11,104 | **9,778** |
| Gibran, *The Prophet* | 37,609 | 4,530 | **3,435** |
| Shakespeare first 300k characters | 18,771 | 2,640 | **2,053** |
| Emerson, Essays | 29,320 | 1,984 | **1,590** |
| **Original LP2 unknown** | **230** | **0** | **0** |

No length-matched native-language sample in any source approaches the original's **zero** long-word collisions: empirical lower-tail \(0/1000\) in each source, and conservative plus-one \(p \leq 1/1001\) per fixed source under this specific sampling null. The 1,000-sample result is **conditional** on these source registers and source-token distributions; it is not a universal null over all English prose or unknown cipher languages. Original GP normalization is not imposed on the ciphertext: all original rune strings remain exactly as printed.

## Changing-key/per-occurrence control

The same 14-length inventory is filled from independent uniformly sampled GP29 rune words instead of natural-language words, using 1,000 realizations each for two pinned generators. A plain iid GP29 model yields a median **246** total collision pairs (5–95%: **223–274**) and **zero** long-word collisions in 830/1000 samples. A GP29 per-word iid generator that forbids adjacent identical symbols within each word gives a median **252** total collision pairs (5–95%: **225–280**) and zero long collisions in 806/1000 samples.

The observed 230 total pairs and zero long pairs are ordinary under this independent-per-occurrence class. The second generator has a **hard** within-word no-repeat rule whereas the real book has some such repeats, so this is only a deliberately simple *collision-count control*, not a reconstructed original cipher. These controls show the equality partition can distinguish a book-static word dictionary from position-variable/keystream-like output; they do **not** identify the true key, algorithm or anti-repeat implementation.

## Next research decision

This original-input invariant adds to the previously established singleton and within-word-equality restrictions. Under ordinary native-GP prose with preserved word separators, retire **all position-independent deterministic word-to-word mappings that are static even within any printed line**, including independently secret page-specific injective codebooks and fixed per-word permutations, without searching their keys. Future decryptors must allow at least one independently motivated missing ingredient: a varying state/key by word occurrence, an altered word-boundary interpretation, or a different constructed source register. The invariant supplies **no direct plaintext** and should never be reinterpreted as proof that every form of English encryption is impossible.
