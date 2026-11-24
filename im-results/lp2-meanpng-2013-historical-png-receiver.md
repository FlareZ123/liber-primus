# Historical 2013 PNG receiver: direct Average-filter and bitplane test

**Status:** bounded negative result; no recovered LP2 plaintext or authenticated key. Agent15, 2026-11-24.

## Why this recipient matters

The provisional `1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK` result from the p49–51 table has already motivated whole-image averages and PNG filter inversions on LP2 data (see [address report](lp2-p50-missing-l-secp256k1-address.md)). A historically specific different recipient exists: the actual PNG intermediate from the 2013 Twitter/XOR stage. The 2013 761.mp3 metadata poem recurs in solved LP2 p57, giving this stage a connection independent of the Bitcoin-address fit. That does not establish a particular receiver or endorse the Bitcoin interpretation.

## Executed original-source tests

- Source: [2013 Twitter reconstruction](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter). The 15,330-byte decoded.png (Git blob fd1052f8ae704cad8dcf005759182f39631fb187) matches base64-decoding the archived only_b64.txt. The archive is a reconstruction, not a signed instruction selecting this image for LP2.
- Dimensions 521 x 523, grayscale + alpha, 8-bit, noninterlaced. Inflated scanlines 545,489 bytes. Adler-32 verified in the executed decoder. Filter counts [0,81,392,0,50] for None, Sub, Up, Average, Paeth respectively. Selecting actual Average-filter rows yields the empty sequence.
- Decoded grayscale histogram for levels 0..7: [253959,2826,1533,1454,1396,1533,7176,2606]. No higher levels. Alpha 255 on every pixel. Grayscale sum 84,801, mean 84801/272483 = 0.31121574556944837. The dimension mean 522 is not an authenticated key.
- Displayed the three original grayscale bitplanes separately: bit0 8,419 set pixels, bounds (38,189)-(486,352); bit1 12,769, bounds (40,193)-(486,349); bit2 12,711, bounds (41,194)-(485,348). All three display the same cicada silhouette, including antialiased structure. No visually readable independent message or additional outlying motif was observed. This is a visual test, not an exclusion of arbitrary steganography.

## Do not mistake mirror padding for a new payload

The [outt.png mirror](https://github.com/cijhho123/cicada3301/blob/main/assets/2013/outt.png) is 28,922 bytes (Git blob 78fa894efeaa05e00e25d2388f3aa30f6c5f44b1), with an identical copy in the krisyotam mirror. The first 15,330 bytes exactly equal the clean decoded PNG; 13,592 bytes follow its IEND. Because 15,330 is divisible by three, the appended bytes have a clean base64 boundary. Encoding just the tail yields 18,106 consecutive characters matching the original literal repeating 33010 padding, followed by `EB8E/cYf0kdRPiNaI=`. The pinned 2013 only_pattern.txt is exactly 42,818 characters of that same repeating motif after stripping whitespace. The tail's first 13,579 bytes therefore match the corresponding decoded repeating pattern; its last 13 bytes differ. The residual suffix remains unclassified; the bulk of this tail is explained by known stage padding rather than an independent high-entropy payload. Do not treat the mirror's full appended tail as a source-authenticated LP2 key.

## Independently linked profile image: direct mean and difference

The same pinned archive has **byte-identical** profile PNGs under [2013/003-twitter/profile/profile.png](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/profile/profile.png) and [2014/001-twitter/twitter/profile.png](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/twitter/profile.png), Git blob 0c1f977b134d4779b10ac26ffbd84c029d3163d7. The archive labels these as the account profile; identical archived bytes alone do not authenticate that each round separately used that exact PNG encoding. This is a much more natural literal image-mean pair than unrelated LP2 page combinations: both portray the same dark cicada logo in the p57-linked Twitter stage.

The profile is 400×400 RGB8, noninterlaced, with all 400 scanlines using Sub (no Average). RGB is identical per pixel. Per-channel gray histogram levels 0..7 is [149060,1943,1819,1625,1509,2200,1841,3]; all levels above 7 are absent. Thus the low-level grayscale range also occurs in the related profile artwork and does not itself distinguish a hidden payload in decoded.png.

Direct test: use the complete decoded.png gray plane, bilinearly resize to 400×400 with pixel-center sampling and clamped endpoints, and average equally with the profile grayscale plane. Inspect the mean and absolute difference at a fixed 0..7 contrast stretch (no fitted registration, channel or crop). The original pair correlation is 0.9336772008445936 and RMSE 0.46690029889990703 intensity units. The mean displays the same cicada, and the difference visually shows outlines/resampling residuals concentrated on that logo. Neither image shows a readable independent instruction. No alternative crop/offset family was searched. This is a narrow visual source-pair negative, not an exclusion of arbitrary hidden data or other source-selected pairs. The profile bytes and numeric comparison are included in the standalone reproducer below.

## Unclassified mirror suffix as a period-13 original decoder (Agent 5, 24 November 2026)

The remaining mirror-only 13 bytes offer a concrete, independently bounded candidate operand rather than another choice of image filters. The 2013 Twitter reconstruction is linked to the solved p57 parable by the historical 761.mp3; the original p0 red 13-dot mark gives a visible candidate period and start (the first black body rune, global offset13). Neither link specifies that the mirror suffix is an author key.

From the pinned repository base64 files, the clean PNG is exactly 15,330 bytes and is a prefix of the 28,922-byte mirror. After the next 13,579 bytes (the exact decoded repeating `33010` stream), the remaining 13 bytes are:

- Raw mirror residue: `7101f04fdc61fd247513e235a2`.
- Corresponding expected pattern bytes: `7df4d74df7d35d37df4d74df7d`.
- XOR difference: `0cf527022bb2a013aa5e96eadf`.

The historically used XOR operation motivates the second representation, without introducing an arbitrary mask. The first unusual byte shares partial base64 characters with the pattern, so use the actual bytewise common-prefix boundary, not an invalid isolated base64 suffix.

Freeze the two 13-byte registers reduced modulo29, phase zero at original p0 black-body offset13, both arithmetic signs, continuous ordinary or authentic latent plaintext-F no-advance decoding. No phase search. For the latter, a ciphertext zero permits either a literal-F hold or a consuming non-F plaintext; nonzero ciphertext may only consume a nonzero plaintext. Exact reachable phase sets reject all four variants before even the end of p0.

| Key | Forward sign | Legal F-hold prefix (of p0 body249) | Ordinary IoC on body249 | Ordinary IoC on independent p16–21 |
|---|---:|---:|---:|---:|
| Raw | + | 18 | 0.03352118 | 0.03430102 |
| Raw | − | 72 | 0.03378028 | 0.03441409 |
| XOR difference | + | 70 | 0.03501101 | 0.03458716 |
| XOR difference | − | 27 | 0.03465475 | 0.03458485 |

All ordinary outputs across the remaining 12,943 original runes have IoC 0.03444963–0.03450135 and nonprose openings. Exact original forward replay and 95/95 solved-p57 plant replay pass for each ordinary and literal-F variant; genuine native control IoC is 0.06270997. The ordinary p16–21 holdout is scored with the uninterrupted source phase. No F-hold suffix is scored after the exact opening contradiction.

**Independent source-lineage discriminator:** the pinned [2013 reconstruction's b64.txt](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/b64.txt), blob `3cf34e331497e7e85c6707c22d07e500397cc794`, has exactly 64,167 characters; following the 65-hyphen delimiter, every one of its 42,818 nonwhitespace characters follows the literal repeating 33010 pattern. The unusual mirror suffix token `EB8E/cYf0kdRPiNaI=` is absent, including at the comparable pattern offset18106. This confirms the residue is not present in that separately archived reconstruction, without proving that the mirror is inauthentic or that no other transmission differs. There is no established 2013 origin for the residual bytes.

**Decision:** retire the exact two direct period-13 suffix-derived registers under the above framing. Do not interpret the 13-byte mirror discrepancy as authentic key material absent independently recovered author-era evidence. This is a new finite original-cipher inverse, not a re-run of the PNG filter or bitplane tests, and recovers no unknown plaintext. [Standalone Node22 SFT](../sims/lp2_twitter_mirror_suffix_q13_original_sft.cjs). Core source calculations executed in connected JavaScript; the Node wrapper is provided for reproduction, not claimed as a CI run.

## Clean historical PNG as a continuous original-cipher running pad (Agent 5)

A different direct inverse uses the clean 15,330-byte PNG itself, because the 2013 stage used that exact historical object as an XOR operand. Test raw file bytes reduced mod29, with both additive signs and all 15,330 byte starts, no wrap, no transformations and no key resets. Original start is the first black rune of p0 (global offset13). The p0 body has 249 runes, p0–2 body 716; continuation begins p3. This is a conditional GP29 transfer, not proof that the 2013 byte operand was intended to be reused in LP2.

Exact latent plaintext-F reachability allows literal F with no advance and non-F consuming encryption, including consuming paths yielding ciphertext F. Every offset and both signs are searched. Results:

| Sign | Offsets legal through 249 | Offsets legal through 716 | Best legal prefix |
|---|---:|---:|---:|
| + | 1100 | 3 | 716 (opening gate) |
| − | 1149 | 0 | 698 (263,264,265) |

The three positive survivors (8004,11799,14434) are frozen without any language ranking and extended across p3. They die at **761,732,824** runes respectively, i.e. 45,16,108 into p3. Thus no candidate even reaches 825 body runes, regardless of language score or hidden F mask. Exact trigram Viterbi on their 716-rune prefixes yields -3.58053,-3.59640,-3.60110 nats/rune (conditional native trigram, seven native sections, smoothing .1, excluding LOSS and p57). Openings are nonprose. The exact rejection does not depend on these scores.

Ordinary continuous additive inverse has no structural F constraint. Rank every eligible offset and both signs using only the p0 249-rune prefix, then freeze the winner. The winner (2806,+) scores -3.47937 on prefix and -3.60010 on the independent 467-rune p1–2 continuation; output is nonprose. Native excluded LOSS and p57 score -3.03231 and -2.86176. This is a predictive negative for the selected ordinary candidate, not a theorem excluding all possible ordinary plaintexts.

Control: plant the authentic 755-rune LOSS plaintext using offset1103 and sign−. Ordinary blind prefix ranking identifies the true offset and sign, recovering 506/506 withheld runes. Under latent F, 9076 offset/sign pairs pass the 249-rune control gate. Blind exact Viterbi prefix ranking selects adjacent offset1104 with true sign, recovering 729/755 overall and 506/506 withheld; this is not exact origin recovery, nor perfect whole-plant recovery. The true offset1103 has legal full reachability. Control scores are conditional on this small donor-excluded model.

**Decision:** retire direct uninterrupted raw-PNG running-pad transfer from the original p0 black-body start under authentic F hold (exact all-start exclusion) and the frozen ordinary decoder winner (predictive negative). No new LP2 plaintext. No broader PNG serialization or keyed derivation is excluded. [Standalone Node SFT](../sims/lp2_twitter_png_runningkey_original_sft.cjs); core calculations executed in connected JavaScript, no CI run claimed.

## Literal 2013 XOR with five-bit GP29 packing (Agent 5)

The original 2013 operation was bytewise XOR, not GP29 addition. Test a direct bitstream transfer using the same clean PNG as the operand and GP29 zero-based codes packed as five-bit words. Previous [761.MP3 packed XOR](lp2-2013-audio-direct-packed-gp29-original-xor-gate.md) and [Twitter 32-symbol XOR](lp2-32symbol-twitter-xor-gate.md) experiments used different historical operands. No source instruction establishes this GP29 packing; the test is conditional.

For every one of 122,636 possible five-bit starting positions in 122,640 original PNG bits, test both byte bit orders and both rune bit orders, with and without literal plaintext-F hold. Inverse is P=C XOR K, advancing by five bits per consuming rune. Values 29–31 contradict GP29 native plaintext. In F hold, C=0 also allows a nonconsuming F, while consuming P=0 is forbidden. The reachability calculation carries every possible bit position after each rune, without language scoring or pruning. The original begins at global offset13 and has 249 p0 body runes.

| Byte bits | Rune bits | Ordinary max prefix | F-hold max prefix |
|---|---|---:|---:|
| MSB | MSB | 158 | 129 |
| MSB | LSB | 141 | 134 |
| LSB | MSB | 153 | 143 |
| LSB | LSB | 152 | 117 |

All 981,088 offset/order/hold configurations die strictly before the end of p0. No independent continuation is needed after exact contradiction. Controls use authentic 95-rune p57 plaintext and select an admissible original PNG bit start with maximal key-symbol diversity (31 or 32 distinct five-bit values), ensuring every planted ciphertext symbol is a GP29 rune; all eight models replay all 95/95 and retain the true offset in exact reachability. Controls establish nontrivial legal encodings, not blind key recovery.

**Decision:** exclude the full finite direct packed XOR family at this fixed original p0 start. It is independent of the previous additive result. Neither arbitrary derived keys nor alternative source-selected serializations are excluded. [Standalone SFT](../sims/lp2_twitter_png_packed_xor_original_sft.cjs); original and controls executed in connected JavaScript, no CI run claimed.

## Decision

Retire the specific Meanpng -> extract original filter-type-3 rows of the 2013 intermediate route. Simple visible bitplane extraction and the direct historically linked profile-image average supply no additional instruction. Neither conclusion excludes a different PNG operator or an independently supported receiver. Do not sweep dimensions, levels, offsets, or arbitrary image means without an independent selector. The remaining strongest gap is an authentic instruction connecting the table to a reversible operation on original LP2 ciphertext.

## Reproduction

The actual PNG, mirror and profile bytes are preserved as base64 in resources/historical/cicada2013-twitter-decoded.png.b64, cicada2013-twitter-outt-mirror.png.b64 and cicada2013-2014-twitter-profile.png.b64. Run `node sims/lp2_meanpng_2013_receiver_sft.cjs` from the repo. The original calculations were executed in the tool runtime, including DEFLATE, PNG reconstruction, bitplane rendering and exact mirror comparison; the checked-in Node script is a standalone library-based reproducer of those measurements.
