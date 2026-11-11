# 2014 Stage04 1033/3301 source gate: LP1 artifact boundary

**Decision:** the updated Stage04 `<!--3301-->` material continues the earlier LP1/2014 chain. The exact 7,524-byte page-04 OutGuess output occurs in two archived participant copies but has no surviving source-selected decoder. Two natural historical text-key extractions and the fixed bytewise BASE29 continuous-book GP29 pad (both signs) yield no readable payload or original LP2 plaintext. The object remains unclassified; no source supplies its content type, decoder, or LP2 transfer.

## Pinned source and extraction contract

The participant archive `neuroretransmit/cicada` is pinned at commit [`ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/005-third-onion). Its `README.md` and `decode.sh` describe the Stage04 third-onion update, the `onion3` and status-page hex streams, byte reversal, JPEG boundary extraction, OutGuess extraction, and the fixed page-05 trailer extraction. These are participant-preserved artifacts, not a newly authenticated creator statement.

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
| `square.txt` | 178 | `f081bf3bd3cb45b55359fa0e8961b1f033aa10c7` | Exact result of the fixed page-05 trailer extraction |

The three page-image identities are decisive: Stage04's 03/04 images are the original LP1 pages 03/04, and the complete `server-status.bin` is the repository's full LP1 page-05 artifact. This is not merely similar rune content; the Git blob identities match.

## Reproduced page-05 square

The first JPEG EOI ends at byte 336,353. The source decoder then selects 357 bytes at offset `0x521e4` (336,356), reverses that window, and passes it to plain-hex decode. The window contains 357 hexadecimal characters, so the final unmatched nibble is discarded by `xxd -p -r`; the output is exactly 178 bytes. This run reproduces the stored `square.txt` byte-for-byte from `resources/liber-primus/05.jpg`.

The recovered 5×5 square has every row, column and both main diagonals summing to 1033. It is the already-established 2013 `0_wisdom` / LP1 page-05 square. The `<!--3301-->` marker is not the square sum and does not create a new numerical key.

## OutGuess payloads and what remains unknown

- The page-03 OutGuess output is a PGP clear-signed text containing “Let the text guide you” and a small JPEG. The embedded JPEG is now preserved separately and checked byte-for-byte against the hex span. The clear-signature was verified successfully in [workflow run 43065776356](https://github.com/FlareZ123/liber-primus/actions/runs/43065776356) against `resources/control/cicada-3301-public-key.asc` (fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`). The embedded small rune JPEG is therefore covered by the verified signed text.
- The page-04 OutGuess output is a 7,524-byte, high-entropy binary (Shannon entropy about 7.978 bits/byte) with no known JPEG, PNG, GIF, ZIP, GZIP, PDF, ELF, BZIP2 or XZ signature. Both the archived [`neuroretransmit/cicada` page-04 object](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/005-third-onion/04.jpg.bin) and the independently preserved [`krisyotam/cicada3301` stage04 `index.1.rev.outguess`](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage04/index.1.rev.outguess) have exactly the **same Git blob SHA-1** `d738b052bf0548e2f431e231af7ef1514becb4ad`. Their extraction instructions separately document default `outguess -r` on the byte-identical original page-04 JPEG; neither proposes a cipher or file format for the output. This is an exact cross-archive identity, not independent proof that the bytes represent intentional steganography.
- **Literal 2014 source-key test (11 November 2026):** Rebuilt pinned OutGuess 0.4, recovered all **7,524/7,524** default bytes unchanged (raw SHA-1 `18b50380fcd1ac5133fbc418b5d17f869da93aa0`), and independently embedded/recovered a known-key message on original cover `17.jpg`. On original `04.jpg`, the signed clue's exact literal `Let the text guide you.` as OutGuess key produced **40,746** bytes (seed 48688, raw SHA-1 `914b18b6913b1a299d7d6821e9fb31069c547e81`), and the historically successful LP1 word key `WELCOME PILGRIM TO THE GREAT` produced **793** bytes (seed 13255, raw SHA-1 `9f3cc242d3d201df2d0d6368627c9d909b7677cb`). Neither output has a recognized binary signature or a contiguous printable run of 24 characters. A seed/length header is insufficient to establish a genuine payload. The fixed [CommonJS SFT](../sims/cicada2014_stage04_textguide_outguess_original_sft.cjs) and [successful manual CI run 43067842911](https://github.com/FlareZ123/liber-primus/actions/runs/43067842911) preserve raw outputs, summaries and positive control.
- **Issue #309 outcome:** Original extraction grammar and two archival object copies are recovered. No contemporaneous instructions specify a decoder, content type, passphrase, framing, or LP2 transfer for the page-04 bytes. OutGuess can emit plausible false headers on unencoded JPEGs, so the still-unidentified bytes might be a spurious extraction. Preserve the original bytes at `resources/external/derived/2014-stage04/04-outguess.bin` pending a genuinely independent source clue; do not launch free key/codec searches.
- The page-05 trailer is the 1033 square, already tied to the earlier wisdom puzzle. No LP2 reference, source-derived LP2 key, or exact LP2 byte/rune sequence is present in the recovered object inventory.

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

Both candidate streams use every original rune and all 29 GP symbols. Exact forward reconstruction succeeds for both signs, as required for a bijective additive pad; this is not key evidence. The complete candidates, page text, all 2,896 word boundaries, 55 page boundaries and GP index sequences are preserved in [the machine-readable candidate output](stage04_7524_base29_direct_pad_candidates.json). The [reproducer](../sims/stage04_7524_base29_direct_pad_gate.cjs) rebuilds the inputs and emits the same output.

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
- Run `node sims/cicada2014_stage04_3301_object_inventory_sft.cjs` to verify Git blob identities, the embedded small JPEG, the page-05 trailer extraction, the 1033 square sums, and the opaque page-04 payload metadata.
- Workflow: `.github/workflows/cicada2014-stage04-3301-source-gate.yml` also verifies the page-03 PGP clear-signature with `resources/control/cicada-3301-public-key.asc`.

**Conclusion for Issues #298 and #309:** the historical Stage04 hex material maps to LP1 pages 03–05 and the known 2014 onion continuation. The mirrored 7,524-byte OutGuess extraction has no source-authenticated interpretation or supported LP2-transfer operation. The two historical literal-key tests yield no recognizable message. Retain the raw bytes as unclassified without speculative decoding.

