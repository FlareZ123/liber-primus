# 2014 Stage04 1033/3301 source gate: LP1 artifact boundary

**Decision:** the Stage04 page-04 output is a reproducible, unique 7,524-byte default-key extraction across all 75 archived JPEGs, but it remains opaque and is not authenticated as an intentional payload. The prior 16/58-page default-key, 58,152-byte noise-like extraction family now has an exact source-side explanation: all 58 LP2 JPEGs have at least 5,747 initial one bits in the OutGuess eligible coefficient bitmap, while every password's entire 32-bit header falls within the first 1,024. Every LP2 JPEG consequently produces the encrypted header `ffffffff` for every key; `Default key` necessarily yields seed 41408 and length 58,152 even without embedded data. The 42 other pages fail after header retrieval. The apparent headers are not evidence of a payload. See the [universal original-image proof](lp2-outguess-universal-header-artifact.md). Therefore do not dismiss page04 as that same LP2 artifact family, but do not promote it as an LP2 key or plaintext. No original source supplies a content type, decoder, or LP2 transfer.

## Director #580: 99 original Stage04 key rows of 76 bytes on physical p55 (Agent 7, 12 Nov 2026)

Original 2014 Stage04 `04-outguess.bin` is **7,524 bytes**, exactly **99×76**. The original 2014 Stage10 puzzle separately prints **25+49+25=99** authentic magic-square cells, and original physical p55 has **76 GP29 ciphertext runes**. This is a retrospectively noticed factorization: no historical source instructs using the Stage04 extraction as 99 page-55 row keys or identifies one preferred row. The 7,524-byte high-entropy object may itself be default-key OutGuess noise.

The [complete source-locked CJS inverse](../sims/lp2_stage04_99x76_p55_rowpad_sft.cjs) reads the pinned 7,524 original bytes (SHA-256 `35d31e61275c6b0420e7729161d5f6272122ea7edb87076fe84f3fe3c70af6db`), reshapes without moving a byte into 99 consecutive 76-byte rows, reduces each source byte modulo29, and tests both `P=C−K` and `P=C+K` for **all 99 rows**, exactly **198 full 76-rune p55 outputs**. Every result reconstructs all 76 original ciphertext runes under its inverse. A held-out authentic p57 GP29 text plant encrypts and recovers exactly **76/76**; original printed p55 rune positions remain unchanged. Execution [GitHub Actions run 43168016819](https://github.com/FlareZ123/liber-primus/actions/runs/43168016819) passed on the source-pinned binary, Node.js22.

The **best** fixed candidate is zero-based **row32, sign−1**, GP29 smoothed-trigram score **−3.377626238**, with GP29 IoC **0.037192982**; original unmodified p55 scores **−3.513373094**, IoC **0.037894737**. The best candidate begins `L-J-T-AE-O-R-R-Y-C-OE-L-C-F-S-OE-E-F-O-R` and is not language. Authentic p57 first76 scores **−2.083445755**, IoC **0.059649123**, while all **3,212** native LP1 76-rune training windows score at least **−2.300029222**. (That LP1 in-training control is optimistic, but the enormous gap and absence of coherent original words remain.) The correct compare-to-best test uses **256 deterministic whole-byte permutations** of the *same* 7,524-byte multiset, testing all 198 rows/signs per permutation: the null best-score median **−3.406054190**, 95th percentile **−3.358649446**, original best familywise upper tail **0.155642**. Thus the best original row is an ordinary best-of-many fluctuation and supplies neither GP-native plaintext nor a privileged source selector.

**Decision:** retire the precise **99×76 source-consecutive row, `byte mod29`, ± direct GP29 shift** decoder for p55. The numerical length match remains true and the Stage04 object remains available for an independently motivated operation. Do not interpret synthetic exact reversibility as key evidence or re-open row/column offsets, byte extraction, or new pads without a source-specified consumer. No unknown LP2 plaintext or authentic key recovered.

## Pinned source and extraction contract

The participant archive `neuroretransmit/cicada` is pinned at commit [`ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/005-third-onion). Its `README.md` and `decode.sh` describe the Stage04 third-onion update, the `onion3` and status-page hex streams, byte reversal, JPEG boundary extraction, OutGuess extraction, and the fixed page-05 OOB extraction. These are participant-preserved artifacts, not a newly authenticated creator statement.

The archive records `onion3.bin` and `infotomb-server-status.bin` as the same 2,116,096-byte object (Git blob `dedbe57644cf549e705fe1b6770b358b493f7758`). The extraction script takes page 03 from the forward stream and page 04 from the reversed status stream. The separate `server-status.bin` is 673,066 bytes.

## Recovered objects and exact identities

| Object | Size | Git blob SHA-1 | Result |
|---|---:|---|---|
| Stage04 `03.jpg` | 892,759 | `fb390cedd9e26547f0b39563a1ce8998f0def030` | Exact byte identity with `resources/liber-primus/03.jpg` |
| Stage04 `04.jpg` | 1,223,337 | `e6a27cd5b25948d27d3af5ba029e4ba44fbff46f` | Exact byte identity with `resources/liber-primus/04.jpg` |
| Stage04 `server-status.bin` | 673,066 | `2829e13812015601ff1014cb4427587b4a8aa3a6` | Exact byte identity with full `resources/liber-primus/05.jpg` |
| Extracted Stage04 `05.jpg` prefix | 336,353 | `7369644b99426a57d1a41819306bfd7be8935f5f` | Exact prefix of the full page-05 artifact, ending at its first JPEG EOI |
| `03.jpg.asc` OutGuess output | 31,809 | `2a355d1bf14d37041384f09d8700e2ee274a13e6` | PGP clear-signed text; says “Let the text guide you” and contains a hex-embedded JPEG |
| Embedded small JPEG | 15,188 | `f91bdd6e2a890968a5a13d39be4d56899b877920` | Exact extraction of the `ffd8`…`ffd9` span in `03.jpg.asc` |
| `04.jpg.bin` OutGuess output | 7,524 | `d738b052bf0548e2f431e231af7ef1514becb4ad` | Opaque binary; no common file signature in the tested set; retained for future clue-led work |
| `square.txt` | 178 | `f081bf3bd3cb45b55359fa0e8961b1f033aa10c7` | Same square text without final LF; full 360-byte OOB extraction is `matrix` (179 bytes including LF, blob `faba9f1780d667a0ecd7d9499b41a1f8fbc5dbbd`) |

The three page-image identities are decisive: Stage04's 03/04 images are the original LP1 pages 03/04, and the complete `server-status.bin` is the repository's full LP1 page-05 artifact. This is not merely similar rune content; the Git blob identities match.

## Complete 2014 page-05 server-status binary parse

The pinned original Stage04 `server-status` response is 1,370,852 bytes (Git blob `071fb34c82ba56c5dfbba376200be43822e31ee0`); its archived hex transcription is 1,368,567 bytes (blob `9d7fda55c29baec7abefa38e224784e015bd7837`) and decodes to the complete 673,066-byte object (blob `2829e13812015601ff1014cb4427587b4a8aa3a6`). The object has an exact, exhaustive three-segment layout:

| Segment | Half-open byte range | Length | Interpretation |
|---|---:|---:|---|
| Prefix | `[0,336353)` | 336,353 | Valid 2400×3600 RGB JPEG; ends with `FFD9` |
| OOB field | `[336353,336713)` | 360 | `\n\na` followed by 357 ASCII hexadecimal characters |
| Suffix | `[336713,673066)` | 336,353 | Exact byte reversal of the complete JPEG prefix |

The suffix comparison is byte-for-byte exact: `image[336713:] == image[:336353][::-1]`. Thus the final 336,353 bytes are the reversed copy of the first JPEG, not a second forward JPEG, a header, or an independent hidden payload. The complete object is exhausted by the three segments above.

The OOB field explains the two preserved matrix lengths without treating the final nibble as extra cipher material:

- The pinned 2014 Stage04 README extracts all 360 bytes (`dd ... skip=336353 count=360`), reverses them, and applies `xxd -p -r`. This yields the pinned 179-byte `matrix` (Git blob `faba9f1780d667a0ecd7d9499b41a1f8fbc5dbbd`), including a final line-feed.
- The separate 2014 walkthrough's 357-byte window at offset `0x521e4` (336356) reverses and decodes to the 178-byte `square.txt` (Git blob `f081bf3bd3cb45b55359fa0e8961b1f033aa10c7`), without the final line-feed. The leading `a` nibble in the full OOB field pairs with the terminal `0` nibble of the reversed 357-character window to form `0x0a`; the two linefeeds are ignored as whitespace by `xxd`. The two outputs therefore differ only by the final LF.
- The pinned `server-status.data` copy is 359 bytes (blob `0caa28ad1f9b32528019a3c27a16f38258ffb51e`): it is the `a` plus 357 hex characters with a final LF, i.e. the same effective hex stream with the two leading linefeeds removed.

The resulting 5×5 square is:

```
272 138 341 131 151
366 199 130 320 18
226 245 91 245 226
18 320 130 199 366
151 131 341 138 272
```

Every row, column and both main diagonals sum to 1033. The pinned 2014 Stage04 README explicitly documents the reverse/hex extraction; the participant walkthrough also describes comparing the forward and reversed images to expose the OOB bytes. This is a reproducible participant-documented extraction of the 2014 square, not a new LP2 cipher.

## Surrounding Stage04 page and instruction boundary

The original server-status response is an Apache 2.2.22 mod_status page with ordinary server fields (server build, current/restart times, parent generation, uptime, access/traffic counters, CPU/request rates, and active/idle workers). Those are status measurements, not a source-specified key or cipher-state field. The separate Stage04 landing page `resources/external/2014-stage04-index.html` contains `<!--1033-->` and a distinct 512-character hexadecimal string; the contemporaneous walkthrough records that string as matching the prior onion's growing value. It is not part of the 673,066-byte server-status object and supplies no independently specified LP2 operation or consumer.

**Decision for Issue #458:** the complete binary contains only the original page-05 JPEG, the known OOB 1033 matrix, and the exact reversed JPEG copy. The surrounding status fields are ordinary Apache metadata; the adjacent 512-hex landing-page value is a separate already-preserved object, not a newly identified key or instruction. No additional LP2 key, cipher, address, or plaintext follows. The exact 25/25 GP-prime-sum reconstruction remains a within-artifact 2014 relationship; no independent 2013 date is established. The `<!--3301-->` marker is not the square sum and does not create a new numerical key.

## OutGuess payloads and what remains unknown

- The page-03 OutGuess output is a PGP clear-signed text containing “Let the text guide you” and a small JPEG. The embedded JPEG is now preserved separately and checked byte-for-byte against the hex span. The clear-signature was verified successfully in [workflow run 43065776356](https://github.com/FlareZ123/liber-primus/actions/runs/43065776356) against `resources/control/cicada-3301-public-key.asc` (fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`). The embedded small rune JPEG is therefore covered by the verified signed text.
- The page-04 OutGuess output is a 7,524-byte, high-entropy binary (Shannon entropy about 7.978 bits/byte) with no known JPEG, PNG, GIF, ZIP, GZIP, PDF, ELF, BZIP2 or XZ signature. Both the archived [`neuroretransmit/cicada` page-04 object](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/005-third-onion/04.jpg.bin) and the independently preserved [`krisyotam/cicada3301` stage04 `index.1.rev.outguess`](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage04/index.1.rev.outguess) have exactly the **same Git blob SHA-1** `d738b052bf0548e2f431e231af7ef1514becb4ad`. Their extraction instructions separately document default `outguess -r` on the byte-identical original page-04 JPEG; neither proposes a cipher or file format for the output. This is an exact cross-archive identity, not independent proof that the bytes represent intentional steganography.
- **Literal 2014 source-key test (11 November 2026):** Rebuilt pinned OutGuess 0.4, recovered all **7,524/7,524** default bytes unchanged (raw SHA-1 `18b50380fcd1ac5133fbc418b5d17f869da93aa0`), and independently embedded/recovered a known-key message on original cover `17.jpg`. On original `04.jpg`, the signed clue's exact literal `Let the text guide you.` as OutGuess key produced **40,746** bytes (seed 48688, raw SHA-1 `914b18b6913b1a299d7d6821e9fb31069c547e81`), and the historically successful LP1 word key `WELCOME PILGRIM TO THE GREAT` produced **793** bytes (seed 13255, raw SHA-1 `9f3cc242d3d201df2d0d6368627c9d909b7677cb`). Neither output has a recognized binary signature or a contiguous printable run of 24 characters. A seed/length header is insufficient to establish a genuine payload. The fixed [CommonJS SFT](../sims/cicada2014_stage04_textguide_outguess_original_sft.cjs) and [successful manual CI run 43067842911](https://github.com/FlareZ123/liber-primus/actions/runs/43067842911) preserve raw outputs, summaries and positive control.
- **Issue #309 outcome:** Original extraction grammar and two archival object copies are recovered. No contemporaneous instructions specify a decoder, content type, passphrase, framing, or LP2 transfer for the page-04 bytes. OutGuess can emit plausible false headers on unencoded JPEGs, so the still-unidentified bytes might be a spurious extraction. Preserve the original bytes at `resources/external/derived/2014-stage04/04-outguess.bin` pending a genuinely independent source clue; do not launch free key/codec searches.
- The page-05 OOB field decodes to the 1033 square, already tied to the original 2014 LP1 page-05 Wisdom table. No LP2 reference, source-derived LP2 key, or exact LP2 byte/rune sequence is present in the recovered object inventory.

## Original 7,524-byte OutGuess object: intact OpenPGP packet gate (12 November 2026)

**Bounded original-byte negative.** The historically extracted 7,524-byte `04-outguess.bin` starts with bytes `40 a4 79 d5 87 73 3d 7a 5a 12 f7 47 a2 fc 5c 85` and matches the exact pinned SHA-256 `35d31e61275c6b0420e7729161d5f6272122ea7edb87076fe84f3fe3c70af6db`. Its first byte `0x40` has OpenPGP packet-header bit 7 **clear**, so the bytes cannot be an intact, raw OpenPGP packet stream beginning at offset zero, regardless of secret key. Source-native `gpg --batch --no-tty --list-packets` returns exit code **2**, `gpg: no valid OpenPGP data found`. The contemporaneously authenticated Cicada ASCII-armored PGP public-key control parses successfully with exit code **0**, yielding a public-key packet, a user-ID packet and signature packets, including key ID `181F01E57A35090F`. This is a deterministic format exclusion, independent of language scoring and secret keys.

The [read-only source/hash-locked Python SFT](../sims/stage04_outguess_openpgp_packet_gate.py) asserts the exact binary input and source-authentic control. [Successful manual CI with printed packet diagnostics](https://github.com/FlareZ123/liber-primus/actions/runs/43145545518) checks both on a clean GitHub runner. This rules out **raw RFC4880/OpenPGP packet serialization at byte zero** only; it does not classify the object or exclude a payload after a wrapper, encoding, compression, steganography false positive, or arbitrary cryptographic ciphertext. There is no independent source cue selecting one of those other variants. Preserve the exact 7,524 bytes as unclassified and stop at this result instead of enumerating offsets or guessed keys.

## Default-key control census (11 November 2026)

The archived Stage04 command is outguess -r with no explicit -k. OutGuess 0.2.x source declares the built-in key as the literal Default key; the archived 2014 command does not pin its exact binary version. The repository's source-faithful OutGuess 0.4 retrieval implementation (sims/outguess_extract.py plus sims/outguess_bitmap_dump.c) was run over every original archive image, 00.jpg–74.jpg, using that default key. The known page-03 extraction reproduces the preserved PGP clear-signed file byte-for-byte (Git blob SHA-1 2a355d1bf14d37041384f09d8700e2ee274a13e6), calibrating the operation. The page-04 output also reproduces its preserved object byte-for-byte (Git blob SHA-1 d738b052bf0548e2f431e231af7ef1514becb4ad). The exact historical binary version remains unverified; the tested implementation is the repository's 0.4 retrieval path.

- Across all 75 archive JPEGs, 29 default-key headers/iterators complete and 46 are rejected. A completed extraction is not, by itself, evidence of intentional embedding.
- Every LP2 scan (17.jpg–74.jpg) has **5,747–34,351 leading one bits** in its original OutGuess-eligible coefficient stream; the historically real-message LP1 `03.jpg` control has only nine. Since each password's 32 header samples lie at indices 0–1023, the encrypted header is forced to `ffffffff` on **all 58 LP2 scans under any password**. For `Default key` this automatically decodes to `c0a128e3` (seed 41408, length 58,152). The original default-key census therefore has 16 completed extractions versus 42 rejections (39 zero-skip-modulus and three over-length). The 16 noise-like outputs share 1,417-byte prefixes and 1,554-byte suffixes, exhibit 7.996411–7.997115 bits/byte entropy and 0.380847–0.387313 printable fraction, with no recognizable magic. All 58 initial headers are now explained *without* any intentional payload. See the [all-key proof](lp2-outguess-universal-header-artifact.md), [SFT](../sims/lp2_outguess_universal_header_sft.py) and [passing CI](https://github.com/FlareZ123/liber-primus/actions/runs/43490424797).
- No LP2 scan produces a 7,524-byte output. The page-04 output is unique by length across all 75 images. Its decoded OutGuess header has seed 38,370 and length 7,524; the complete output has SHA-1 18b50380fcd1ac5133fbc418b5d17f869da93aa0, SHA-256 35d31e61275c6b0420e7729161d5f6272122ea7edb87076fe84f3fe3c70af6db, entropy 7.978326 bits/byte, printable fraction 0.385566, all 256 byte values, maximum printable run eight, and no recognized file signature.
- The adjacent page-05 control is rejected because its decoded length (58,152) exceeds its 47,198-byte bitmap. Page-03 remains the positive control: its 31,809-byte output is readable PGP clear-signed text and byte-identical to the preserved file.

**Interpretation:** page04 is distinct from the repeated LP2 noise-like family and should remain a preserved, unclassified candidate. Its uniqueness and exact reproducibility do not prove that it is an intentional payload; its high entropy and lack of recognizable structure do not prove that it is noise either. Do not use it as LP2 key material, or extend into password/codec searches, without a source-selected consumer. Reproduce with python sims/stage04_default_key_control_census.py; summary snapshot: im-results/stage04-default-key-control-census.json.

**Extractor metadata correction:** the four-byte OutGuess header is decoded separately as header_hex; it is not part of the returned file. The page-03 payload begins with four hyphens from -----BEGIN PGP SIGNED MESSAGE----- and its full-file Git blob hash matches the preserved .asc file. Thus payload[4:] is only a post-four-byte diagnostic substring, not the embedded file with a container header removed. sims/outguess_extract.py now performs file-magic and OpenPGP checks on the complete payload while retaining post-four-byte metrics as compatibility diagnostics.

## Source-locked 2013 Book-of-the-Law 7,524-byte comparison

A new cross-round, source-length observation deserves a finite test: the exact archived 2013 *Liber AL vel Legis* chapter III file, after stripping verse numbers/punctuation and mapping its letters to GP29 with K/Q→C, V→U, Z→S and greedy multiletter GP symbols, contains exactly **7,524 GP symbols**. This happens to equal the original default 2014 Stage04 page-04 OutGuess extraction's **7,524 bytes**. Both are preserved source objects; the GP normalization and the decision to use chapter III as a binary key are inferred, and no original instruction connects them. This could be a length coincidence.

The [fixed original-object SFT](../sims/2014_stage04_liber_al_7524_key_sft.cjs) applies the entire chapter-III GP-symbol tape, byte-for-byte with **no offset or truncation**, as four literal byte keys: 0–28 GP index, GP prime value, low byte of Unicode rune, and ASCII first character of GP transliteration. Each is combined with the actual 7,524-byte OutGuess output by XOR, byte addition and byte subtraction (twelve cases). Every decoded candidate retains **7.974–7.980 bits/byte entropy**, **at most nine consecutive printable ASCII bytes**, and no recognizable text or file header. Each exact original bytewise inverse and source-native planted-message control succeeds. The original OutGuess object SHA-1 used is `18b50380fcd1ac5133fbc418b5d17f869da93aa0`; the byte count and key count are asserted.

**Decision:** the chapter-III length match supplies no recovered plaintext or cipher. Retire those twelve direct bytewise interpretations; do not extend into arbitrary offsets, text editions, nonlinear transforms, passwords or crypto modes absent a historical instruction fixing one of them.

## LP2 direct continuous-book BASE29 pad gate (Issue #380; 11 November 2026)

**Decision: reject this exact fixed direct-pad interpretation.** The original page-04 default OutGuess object was converted to two BASE29 digits per byte and applied continuously from key offset zero to all 12,956 unknown LP2 runes. Neither additive sign yields English-like plaintext. This closes only this fixed serialization and operation; it does not establish what the opaque Stage04 object contains or exclude a different, source-selected use.

### Source and frozen operation

The exact input is resources/external/derived/2014-stage04/04-outguess.bin: 7,524 bytes, Git blob SHA-1 d738b052bf0548e2f431e231af7ef1514becb4ad, SHA-256 35d31e61275c6b0420e7729161d5f6272122ea7edb87076fe84f3fe3c70af6db, measured byte entropy 7.978326 bits/byte, all 256 byte values present. The serialization is fixed as b -> (floor(b/29), b mod 29), in original byte order, exactly two big-endian GP29 digits per byte with leading zeroes retained. This gives 15,048 key digits; the first 12,956 are consumed once, leaving a 2,092-digit (1,046-byte) suffix unused. There is no cycling, offset search, page reset, byte reorder, XOR, skip rule or fitted parameter.

The 2013 signed TCP challenge authenticates ordinary integer BASE29 (including 3301 -> 3QO), but it does not prescribe this byte serialization, identify the Stage04 page-04 object as key material, or connect it to LP2. Those are the tested hypothesis's weakest assumptions.

The original ciphertext input is the canonical 12,956-rune stream in 2,896 words across 55 rune-bearing physical pages. The numeric-only p50 is omitted. Page and word boundaries below are zero-based global rune offsets; ranges are half-open. The continuous key clock does not reset at page turns.

### Original-input results and language controls

Both candidate streams use every original rune and all 29 GP symbols. Exact forward reconstruction succeeds for both signs, as required for a bijective additive pad; this is not key evidence. The complete candidates, page text, all 2,896 word boundaries, 55 page boundaries and GP index sequences are preserved in [the machine-readable candidate output](stage04_7524_base29_direct_pad_candidates.json). The [reproducer](../sims/stage04_7524_base29_direct_pad_gate.cjs) independently rebuilds the fixed transforms, controls and language scores from the pinned inputs; the JSON is the preserved full candidate snapshot.

The language model uses GP tokenization from the repository alphabet (longest transliteration match; K/Q -> C, V -> U, Z -> S), with smoothed unigram, within-word bigram and within-word trigram likelihoods. Three independently held-out native GP-English corpora (Gibran, Shakespeare and Emerson) train separate models. For the empirical comparison, 200 deterministic native controls are sampled from the held-out portions while preserving the complete original 2,896-word length profile exactly; all 12,956 rune positions and all word-internal transition counts are matched. In every model/operation/metric combination, the candidate scores below all 200 controls (empirical lower-tail resolution 1/201 = 0.004975).

| Native GP-English model | Operation | Unigram mean log score | Bigram mean log score | Trigram mean log score | Empirical lower-tail p (U/B/T) |
|---|---|---:|---:|---:|---:|
| Gibran | P=C-K | -4.4527 | -5.1356 | -3.6989 | 0.00498 / 0.00498 / 0.00498 |
| Shakespeare | P=C-K | -4.2919 | -5.6403 | -3.9468 | 0.00498 / 0.00498 / 0.00498 |
| Emerson | P=C-K | -4.2655 | -5.6520 | -4.0431 | 0.00498 / 0.00498 / 0.00498 |
| Gibran | P=C+K | -4.3964 | -5.0783 | -3.7070 | 0.00498 / 0.00498 / 0.00498 |
| Shakespeare | P=C+K | -4.2502 | -5.5745 | -3.9585 | 0.00498 / 0.00498 / 0.00498 |
| Emerson | P=C+K | -4.2276 | -5.5780 | -4.0539 | 0.00498 / 0.00498 / 0.00498 |

The candidate's first words are visibly nonlinguistic; the full outputs are not promoted as plaintext. Both wrong-source controls also remain nonlinguistic: (1) the separate 31,809-byte Stage04 page-03 signed OutGuess object, under the same byte -> two-digit BASE29 mapping; and (2) the correct page-04 bytes shuffled at byte level with fixed xorshift32 seed 0x33012014, then serialized identically. Both signs of both controls also reconstruct exactly, illustrating again that inverse/forward consistency does not distinguish the correct pad.

### Positive control and scope

A 12,956-rune native GP passage taken from the source-derived Gibran text was encrypted under the same fixed key and recovered exactly for both signs. The source bytes, original ciphertext, two candidate signs, wrong-source key, shuffled key and planted native passage therefore exercise the same implementation path.

**Human-solve-path assessment:** a player could see the signed 2013 BASE29 example and the Stage04 page-03 “Let the text guide you” clue. Nothing in the surviving source, however, tells the player that page-04's default OutGuess bytes are an LP2 key, that every byte should be expanded into quotient/remainder digits, or that those digits should be added/subtracted continuously over the book. The finite test was worth running because it fixed a plausible simple serialization before examining plaintext; its failure now retires that precise branch.

**Next decision:** do not add offsets, KDFs, resets, reordering, chained transforms or alternative text encodings to rescue this key. Reopen only if a new original-source instruction independently selects the object and a different reversible consumer. The object's status as intentional payload versus OutGuess extraction noise remains a separate question (Director Issue #385).

### All 55 rune-bearing physical page boundaries

| Physical page | Global rune offsets [start,end) | Runes |
|---:|---:|---:|
| 0 | 0–262 | 262 |
| 1 | 262–528 | 266 |
| 2 | 528–729 | 201 |
| 3 | 729–946 | 217 |
| 4 | 946–1207 | 261 |
| 5 | 1207–1470 | 263 |
| 6 | 1470–1666 | 196 |
| 7 | 1666–1874 | 208 |
| 8 | 1874–2129 | 255 |
| 9 | 2129–2397 | 268 |
| 10 | 2397–2660 | 263 |
| 11 | 2660–2933 | 273 |
| 12 | 2933–3194 | 261 |
| 13 | 3194–3466 | 272 |
| 14 | 3466–3603 | 137 |
| 15 | 3603–3762 | 159 |
| 16 | 3762–4029 | 267 |
| 17 | 4029–4302 | 273 |
| 18 | 4302–4562 | 260 |
| 19 | 4562–4833 | 271 |
| 20 | 4833–5102 | 269 |
| 21 | 5102–5375 | 273 |
| 22 | 5375–5506 | 131 |
| 23 | 5506–5719 | 213 |
| 24 | 5719–5989 | 270 |
| 25 | 5989–6262 | 273 |
| 26 | 6262–6527 | 265 |
| 27 | 6527–6761 | 234 |
| 28 | 6761–7030 | 269 |
| 29 | 7030–7307 | 277 |
| 30 | 7307–7570 | 263 |
| 31 | 7570–7839 | 269 |
| 32 | 7839–7960 | 121 |
| 33 | 7960–8174 | 214 |
| 34 | 8174–8435 | 261 |
| 35 | 8435–8706 | 271 |
| 36 | 8706–8944 | 238 |
| 37 | 8944–9172 | 228 |
| 38 | 9172–9400 | 228 |
| 39 | 9400–9640 | 240 |
| 40 | 9640–9871 | 231 |
| 41 | 9871–10144 | 273 |
| 42 | 10144–10416 | 272 |
| 43 | 10416–10690 | 274 |
| 44 | 10690–10963 | 273 |
| 45 | 10963–11233 | 270 |
| 46 | 11233–11503 | 270 |
| 47 | 11503–11777 | 274 |
| 48 | 11777–12048 | 271 |
| 49 | 12048–12114 | 66 |
| 51 | 12114–12206 | 92 |
| 52 | 12206–12469 | 263 |
| 53 | 12469–12648 | 179 |
| 54 | 12648–12880 | 232 |
| 55 | 12880–12956 | 76 |

## Relationship to the earlier 256-byte object

The separate Stage04 `<!--1033-->` 256-byte object is not the LP2 p50 table under direct source order, reverse order, or bytewise XOR. A further byte-histogram gate finds only 115/256 occurrences pairable by value (157 distinct bytes in the Stage04 object versus 161 in the p50 grid); the per-byte histograms differ, so **no pure position permutation/transposition can make the two arrays identical**. The updated `<!--3301-->` page does not repair that failed identity: it recovers LP1 pages 03–05 and their 2014 continuation. This excludes only direct equality, XOR, and pure reordering—not arbitrary nonlinear transforms, which have no source-selected justification.

## Reproduction

- Derived outputs are preserved under `resources/external/derived/2014-stage04/`, explicitly marked as participant-archive extractions rather than original manuscript pages.
- Run `python sims/stage04_original_server_status_square_sft.py` to verify the original status response, separate 512-hex landing page, complete JPEG/OOB/reversed-JPEG layout, and both matrix outputs. Run `node sims/cicada2014_stage04_3301_object_inventory_sft.cjs` to verify the page-03/04 OutGuess objects, embedded small JPEG, 1033 square and opaque page-04 payload metadata.
- Workflow: `.github/workflows/cicada2014-stage04-3301-source-gate.yml` also verifies the page-03 PGP clear-signature with `resources/control/cicada-3301-public-key.asc`.

**Conclusion for Issues #298 and #309:** the historical Stage04 hex material maps to LP1 pages 03–05 and the known 2014 onion continuation. The mirrored 7,524-byte OutGuess extraction has no source-authenticated interpretation or supported LP2-transfer operation. The two historical literal-key tests yield no recognizable message. Retain the raw bytes as unclassified without speculative decoding.

