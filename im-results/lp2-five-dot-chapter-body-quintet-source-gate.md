# Five-dot LP2 chapters: original red-header aligned quintet-to-byte transport

**Decision, Agent15, 14 November 2026:** The original five-dot chapter motifs select two five-divisible GP29 body intervals. The **p23–26 interval and its 30/201 overflow count were previously tested by Agent43 and consolidated in [the p23 artwork report](lp2-p23-26-original-art-source-gate.md)**; the additional direct **p40–53 red-heading-trimmed 600-quintet stream** is the distinct scope evaluated here. The simplest lossless base29 quintet-to-24-bit byte candidate on both sections reconstructs every original rune, but yields **no recognizable original file format or source-native unencrypted text**. This test does not recover plaintext, a historical key, or a complete decryption operation.

## Original-image selector and independent rival

- Physical **p23–26** (combined images 40–43.jpg), printed **five black dots** above the new p23 red 16-rune heading. **Earlier source test, included here as a matched control:** The whole visually bounded chapter has **1,021 GP runes**; remove only the independently source-visible red heading **16**, leaving **1,005** runes = **201 quintets**. An outside model would expect arbitrary chapter body length and five dots could be decorative, with no instruction to pack text.
- Physical **p40–53** (images 57–70.jpg), one fixed scrolling-floral frame with two five-berry groups (one mixed filled/hollow, one all black). The red p40 heading has **8 GP runes**; the visually bounded chapter contains **3,008**, leaving **3,000 runes = 600 quintets**. This interval includes the **51-rune red p53 tail** and crosses the printed **256-cell numerical grid** p49–51; those remain source-original objects, so a real decoder might use a different clock. The **same border repeats p54–55** even though p54 begins an independent visual chapter, and its 308−9=299 post-heading runes **do not** divide by five. Thus five dots alone cannot specify the proposed boundary/reset.
- The independently reported terminal **p55 carried-word alignment** gives 75 complete runes = 15 quintets and already has its own [packet study](lp2-terminal-quintet-overflow-channel.md). This study does not re-run p55's previous phase, ARC4 or checksum searches.

The new p40 follow-up against the preexisting p23 five-rune control is an inexpensive clue-selected experiment rather than evidence that a five-rune codec was intended: under a null of ordinary chapter-length residues, two of nine red-heading-adjusted chapter totals being divisible by five is unsurprising, and selecting only these chapters after noticing the artwork creates ascertainment bias.

## Exactly one reversible numerical transport

Freeze original image-derived red headings, page order and canonical F=0..EA=28 GP rune indices. For each successive 5-rune group, form the big-endian base29 integer `v = ((((d0*29+d1)*29+d2)*29+d3)*29+d4)`. Since `29^5 = 20,511,149` exceeds `2^24 = 16,777,216`, preserve `q=floor(v/2^24)` as one overflow bit, and emit the lower 24 bits as exactly **three big-endian bytes**. A decoder retaining q reconstructs all five original digits. No secret key, offset, fitted phase, file padding or endianness choice is introduced.

| Original section (heading removed) | Body | Exact low24 stream | Overflow flags | First 16 bytes | Last 16 bytes |
| --- | ---: | ---: | ---: | --- | --- |
| p23–26 | 1,005 GP runes | **603 bytes** | **30 / 201** | `309ea352fb3984381f3488b4208103a3` | `a68738b3a4889a283562f3a40546fb87` |
| p40–53 | 3,000 GP runes | **1,800 bytes** | **123 / 600** | `080b118bf94ded519715d6cacae426f0` | `5b2c77921ab906229d80393c33366400` |

The frozen original first forty flag bits are `1001101000000000000000001000001000000001` for p23–26 and `1000000000100001000000001000000000000000` for p40–53. Neither begins with the distinct original p55 `10010 00000 00000` flag packet. Their exact low-byte SHA256 values are `ce515da887f7e2db842ee8cb6a96ec209d7f573fa6f23b75889a1e1bbab656c2` and `019f1f144019ce28723419c9b328299086ceb7550afef5da133e8b49098dc250` respectively.

A byte-0 gate finds **no GZIP, BZIP2, XZ, PNG, ZIP, PDF, 7ZIP, RIFF or SQLite magic**, and both fail the standard zlib header consistency check. Neither byte stream is valid UTF-8. Printable ASCII is **241/603 (39.97%)** for p23–26 and **662/1800 (36.78%)** for p40–53. Those observations reject the **direct unencrypted standard-file/plaintext interpretation of this one serialization**, not encrypted or nonstandard payloads.

A complete positive plant encodes a fixed group of standard header bytes as successive base29 quintets and recovers all bytes exactly; a second control uses the maximum allowed base29 quintet to verify its one-bit overflow. On both original intervals all **4,005 / 4,005** consumed GP29 rune positions round-trip exactly. [Windows Node22 run 43654287600](https://github.com/FlareZ123/liber-primus/actions/runs/43654287600) passed the [self-contained CommonJS SFT](../sims/lp2_five_dot_chapter_body_quintet_sft.cjs) against the canonical original-GP transcription and independently source-typed red spans.

## Source-contained p49–51 256-byte table as a direct bytewise consumer

The p40–53 visual chapter itself contains the **256 original base60-encoded bytes printed on pp49–51**. This supplies a source-derived external-looking numeric operand and a finite reversal hypothesis distinct from the already-negative *unkeyed* quintet pack: repeat those 256 bytes as a 256-byte cyclic tape over the p40 1,800-byte low24 stream, beginning at the independently locked p40 red-heading/body boundary. The page does not actually instruct XOR or byte addition, and a five-rune/base29/24-bit codec is likewise an interpretation, so these are **conditional tests**, not established intended operations.

[The original-source CJS SFT](../sims/lp2_p40_fivedot_grid256_byte_sft.cjs) pins the canonical table's full 256-byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`; checks p40's eight-rune red heading and all **600** complete quintets; and uses the same starting table byte (index zero) for each of **XOR, subtraction and addition modulo 256**. No key offset, table permutation, omitted ciphertext, file prefix, or test-selected output is fitted.

| Exactly specified reversible consumer | First 16 resulting bytes | Printable ASCII | UTF-8 | Standard magic / zlib header |
| --- | --- | ---: | --- | --- |
| Repeat table, XOR | `c3ecb63198a093e6cbec4a143de09124` | **681/1800** | Invalid | None |
| Repeat table, subtract | `3d246ad198606f9a3b1c3aecd3e06f1c` | **631/1800** | Invalid | None |
| Repeat table, add | `d3f2b8455a3a6b08f30e72a8c1e8ddc4` | **638/1800** | Invalid | None |

Every transform is explicitly inverted to recover all 1,800 packed bytes. Three independent positive plants take an actual 25-byte English headline, apply the inverse table consumer and reproduce all 25 bytes exactly; their successes prove the direct-consumer implementation and do not mean any original plaintext was recovered. All three original outputs lack the tested PNG, PDF, ZIP, gzip, bzip2, XZ, SQLite, RIFF and 7z signatures, fail the zlib header and are not valid UTF-8. The [passing Windows Node22 source run 43655582688](https://github.com/FlareZ123/liber-primus/actions/runs/43655582688) includes both the p23 matched control and new p40 bytewise table result.

**Decision:** The simplest unphased, unpermuted cyclic-table bytewise inverse does not reveal a direct unencrypted file or ASCII text. This does not exclude a *ciphertext* byte stream requiring another explicitly sourced operation. The grid's presence alone cannot justify searching arbitrary column orders, table starts, rounds, offsets, byte endianness and independent cryptosystem layers.

## Complete fixed all-secret rune→bit Bacon test on the p40 floral chapter

An independent five-site interpretation is a source-ordered **Bacon code**: assign each of the **29 GP29 rune identities one arbitrary secret bit**, pack each consecutive five ciphertext runes into a fixed five-bit letter under pre-2014 alphabetical **A=0,…,Z=25**, and interpret 600 resulting letters. The explicit visual five-site clue does not specify this operation, but **the original 600-quintext phase is locked** by p40's eight-rune red heading, avoiding offset selection. The prior p23 all-secret Bacon attack and algorithm are [already established](lp2-p23-26-original-art-source-gate.md#five-dot-baconian-hypothesis-exhaustive-all-secret-key-search); this new original p40 case uses the same finite approach on a distinct 3,000-rune source interval.

Code words 26–31 are forbidden. Their original five-bit shape forces two no-all-ones three-rune hyperedges for every quintet: positions 0–1–2 and 0–1–3 (if most-significant bit is first). An exact recursive search through all **2²⁹** possible secret rune-bit assignments with sound conflict pruning retains every valid mask. Score all surviving fixed-bit keys in original or reversed group order, with both printed and visually mirrored within-quintet reading. Language models are constructed on **Gibran, Emerson and Shakespeare** using natural 26-letter English and withholding 600 consecutive letters from each source before fitting any quadgram probability.

| Exact original p40–53 output | Printed within-quintet bit order | Mirrored bit order |
| --- | ---: | ---: |
| Unique forbidden three-rune hyperedges | **1,027** | **1,046** |
| All-secret admissible 29-bit maps | **5,455** | **6,344** |
| Maximum number of rune classes mapped to bit one among admissible maps | **6** | **7** |
| Best full-600-letter English mean log-quadgram | **−15.41417** | **−15.44808** |

The three untouched genuine English holdout passages score **−9.28372**, **−9.43226** and **−9.49597** under the *same fixed model*, far above both complete original keyspace maxima. The best original passages begin `BACAIDFAKEAIAAQEJAAACCYAEDAAAAECQFAKICBAC...` and `IAQDBADIEJEQAAIAAIQQABATAAQADACAYAM...`, unlike language. A planted 600-character Gibran passage, encoded with an independently chosen fixed 29-symbol bit map and varied source rune identities per bit class, exactly decodes its withheld plaintext; the global enumeration finds that authentic planted passage at the highest score **−9.28372**. Therefore the program genuinely recovers a 600-character plaintext through the claimed architecture when one is present. [Source-fixed standalone CJS SFT](../sims/lp2_p40_flower_bacon_allsecret_sft.cjs) and [passing Windows run 43656205212](https://github.com/FlareZ123/liber-primus/actions/runs/43656205212).

**Decision:** all **11,799 admissible secret bit-map/orientation candidates** are nonlinguistic against these three native English controls, despite enough flexibility to choose any one-bit class for all 29 GP symbols. This is a complete no-direct-English result for **one stationary rune-bit Bacon channel over the p40–53 original body**. It does not refute other codebooks (e.g. ITA2), different character registers, source-selected per-page bit changes, changing state, or an added cipher layer. No actual unknown plaintext was recovered.

## Stronger clue-aligned lossless binary packing: eight GP runes give five bytes

A separate, **more economical bit-exact codec** uses **five original bits per GP29 rune** (indices 0–28 each fit in 0–31) and **eight consecutive runes per five-byte output group**. This is independently suggestive because the flora frame contains five-dot sites and the same p40–53 chapter contains a printed **eight-column table**. The 3,000 GP runes after the p40 red8 heading are exactly **375 groups of eight = 1,875 bytes**. In this reading, the eight-rune red heading itself becomes a source-isolated **five-byte prefix**; the entire 3,008-rune p40–53 chapter makes **1,880 bytes** without any padding bits or discarded rune information. Unlike base29 quintet→24bit, no overflow side-band is needed. Neither the original drawing nor the numeric table **states** this 5-bit codec, so the cross-clue alignment is a hypothesis, not an author's proven instruction. Full-book continuous five-bit packing was **already evaluated in [the earlier global source gate](lp2-fivebit-source-serialization-gate.md)**; the **p40 red-heading/8-column section framing** and fixed table consumer here are the different original scope.

The source-locked 8×5→5-byte MSB-first packer and exact 5-byte→8-rune unpacker reconstruct **all 3,008 original GP29 runes**. The source-native original five-byte red heading is `0267a35f28`. The p40 body begins `c35da43383942bca2a0204f0595cb025`, ends `9bc2d04136eba8cc064ca8b8e05091a9`; its 1,875 bytes have SHA-256 `51423ee9229638c2141d3dff29722b5b216d97fc3e78ce66e287fb8864d1f915`, **769/1875** are printable ASCII, and it is invalid UTF-8 without recognized file magic or valid zlib header. Keeping the five-byte red prefix also yields invalid UTF-8 and no standard header.

As one direct, source-contained *consumer*, feed those **1,875 bytes** into the same independently printed **256-byte p49–51 base60 table** at table index zero, cyclically, using reversible bytewise XOR, subtraction or addition. There are no fitted offsets, per-row permutations or secret keys. All three invert every transformed byte and recover a separate planted 26-byte readable-English control exactly.

| Eight-rune packed original body | First 16 resulting bytes | ASCII-printable / 1,875 | UTF-8 or standard recognized file magic |
| --- | --- | ---: | --- |
| Literal five-bit GP stream | `c35da43383942bca2a0204f0595cb025` | **769** | None |
| Plus cyclic original 256-byte XOR | `08ba0389e279557d76fb982eae5807f1` | **699** | None |
| Plus cyclic original 256-byte subtraction | `f876fd7922a7ad13ce0968126258f951` | **695** | None |
| Plus cyclic original 256-byte addition | `8e444bede481a98186fba0ce506067f9` | **708** | None |

The entire source, all four exact outputs and three inverse controls passed [Windows Node22 CI 43656701196](https://github.com/FlareZ123/liber-primus/actions/runs/43656701196) via [CJS SFT](../sims/lp2_p40_eight_rune_five_byte_transport_sft.cjs). **Decision:** the 8-rune/5-byte scheme is structurally economical and lossless but no unencrypted byte payload or directly table-masked byte payload is recovered at its source-selected starting position. A second cipher could exist, but the source supplies no next operation or key to justify unrestricted format/phase search. No authentic unknown-page plaintext.

## Exact red-eight heading indexes the eight printed numerical-table columns

This is a different, directly human-followable **key-extraction hypothesis** that supplies a *concrete eight-byte candidate*, rather than a freely searched password. The original p40 red heading contains exactly **eight GP29 rune values**, **[0,9,19,26,6,23,25,8]**, and the in-chapter printed table has exactly **eight columns, 32 rows**. Every GP index is a valid zero-based row address because 0–28 is within 0–31. Traverse the source red heading left-to-right: at heading position `j=0..7`, select **the cell in printed column j and row GPindex(heading[j])**. This uses no guessed key, byte offset, table permutation, out-of-book phrase, or language-scored selector, and another solver can reproduce the exact one-cell-per-column address list.

| Heading position (column) | Original GP row index | Original base60 table byte (hex) |
| ---: | ---: | ---: |
| 0 | 0 | CB |
| 1 | 9 | 4F |
| 2 | 19 | 0E |
| 3 | 26 | 3D |
| 4 | 6 | 56 |
| 5 | 23 | C0 |
| 6 | 25 | 7F |
| 7 | 8 | 6C |

The eight-byte candidate is therefore **`CB4F0E3D56C07F6C`**, reducing to GP29 digits **[0,21,14,3,28,18,11,21]**. This is **source-derived material conditional on the addressing hypothesis**, not an authenticated authorial encryption key. The rival explanations are that the red heading is ordinary cipher text and that all GP indices can index some table row, making the selection compatible without proving it was intended. The manuscript gives no instruction equating header positions with table columns or naming a cipher.

To seek a decisive decrypting use with minimum extra assumptions, repeat those exact eight GP values over **every one of 3,000 original p40–53 body runes** as a source-started standard GP29 Vigenère additive key, both historical signs, with unchanged punctuation and word layout. Both operations exactly reencrypt all 3,000 original symbols and decode separately planted 3,000-native-GP-rune controls. The original rune IoC under subtraction is **0.0344357008** (GP E count 111), under addition **0.0346179838** (GP E count 114), against standard uniform **0.0344827586** and a native-English GP text regime above approximately **0.05**. The resulting first 90 GP tokens are nonlinguistic under either sign. No 100-rune unknown original plaintext or 40-rune heldout prediction emerges.

The independent bit-exact **8-rune→5-byte p40 body serialization (1,875 bytes)** permits using the same eight exact table-selected bytes as a cyclic XOR, addition or subtraction byte key. Fixed phase zero in all cases, exact independent inverse/positive controls. None produces valid UTF-8 or a PNG, GZIP, ZIP, PDF, BZIP2, XZ or RIFF header or valid zlib header. The respective initial sixteen bytes are `0812aa0ed55454a6e14d0acd0f9ccf49`, `f80e96f62dd4ac5e5fb3f6b3039c31b9`, `8eacb270d954aa36f551122daf1c2f91`. Printable ASCII byte counts **697**, **684**, **633** out of 1,875. All five original-input candidate decoders and plants passed [Windows Node22 run 43657065496](https://github.com/FlareZ123/liber-primus/actions/runs/43657065496), in the [exact source-input CJS reproducer](../sims/lp2_p40_red8_grid256_rowselector_sft.cjs).

**Decision:** the red-eight/table-eight address is a specific internally grounded eight-byte key proposal with an explicit source grammar and complete reproduced value. The **two obvious GP29 additive** and **three obvious packed-byte** consumers do **not** recover an original unknown passage or file. No unique next value-changing operation is selected; without one, asserting that `CB4F0E3D56C07F6C` is the intended Cicada key would be unsupported. Preserve this exact addressing rule as a conditional, falsifiable candidate for a future genuinely independent historical clue, and do not run an unconstrained family of key offsets or ciphers against it.

## Next actionable condition

The source itself still lacks an explicit rule saying to convert five runes to base29 byte triplets or how to use the 256-cell table. The five-site pictures could cue a genuinely different operation. Preserve the exact chapter-body clock as a conditional candidate, but require an **independent color/position-to-operand mapping, a recognized data header, an external known plaintext, or a held-out original-rune prediction** before trying more packing variants or treating these high-entropy bytes as meaningful ciphertext. Original unknown-page plaintext remains unrecovered.
