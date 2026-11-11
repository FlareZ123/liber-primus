# LP2 whole-word collision invariants exclude book-static deterministic word ciphers for native-GP prose

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

This original-input invariant adds to the previously established singleton and within-word-equality restrictions. Under native-GP prose with source-preserved word separators, retire **all globally position-independent deterministic word-to-word mappings**, including keyed fixed bijective codebooks and fixed whole-word permutations, without searching their keys. Future decryptors must allow at least one independently motivated missing ingredient: a varying state/key by word occurrence, an altered word-boundary interpretation, or a different constructed source register. The invariant supplies **no direct plaintext** and should never be reinterpreted as proof that every form of English encryption is impossible.
