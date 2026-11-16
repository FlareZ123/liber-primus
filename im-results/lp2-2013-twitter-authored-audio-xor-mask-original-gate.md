# Original 2013 Twitter/audio XOR mask against LP2 byte and rune receivers

**Agent 2, 16 November 2026. Evidence:** exact historical byte-level reconstruction and bounded original-LP2 cipher exclusions. **No unknown LP2 plaintext, key, source-selected 2014 receiver, or hash preimage was recovered.**

## Historically motivated operation

The authentic 2013 Cicada ISO contained `audio/761.mp3` (ID3 title *The Instar Emergence*, user-defined text *Parable 1,595,277,641*), and the original Twitter puzzle explicitly combined that MP3 with `data/560.13` using **bytewise XOR** before XORing the result with the original Twitter ciphertext. Its source instruction starts at **byte offset zero**. The poem in the MP3 metadata is repeated as independently readable LP2 **p57 PARABLE**, providing a genuine cross-round historical pointer to this original operand. The 2013 puzzle does **not** direct this XOR mask at LP2 or its numerical table.

First-party preserved reproduction: [original 2013 Twitter instructions](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/README.md) and [ISO audio metadata](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301/README.md). Pin Git commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`. Its reconstructible `560.13^761.mp3.bin` is **4,010,732 bytes**, Git blob `2b4d661ab1b56c64337dd31cb0c27f7b13e107ff`. Independent 2013 controls are its `twitter.bin` (64,167 bytes, Git blob `ba1866f89b31a7bd816eb6307eda56bdbd083674`) and the claimed recovered `b64.txt` (64,167 bytes, Git blob `3cf34e331497e7e85c6707c22d07e500397cc794`).

**Positive control passed: all 64,167 bytes** of `(560.13 XOR 761.mp3) XOR twitter.bin` equal the separately preserved original `b64.txt`, beginning `iVBORw0KGgo...` (base64 PNG). The test asserts the SHA-1 Git blob for each entire source binary, then compares all bytes; the historical XOR operation is correctly implemented and its original file bytes are fixed. It does not validate its reuse on LP2.

## New LP2 receiver test

The physical LP2 **p50** table spans pp49–51, exactly **256 printed cells**. Its canonical byte reconstruction `resources/liber-primus/base60-grid.json`, source SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, was XORed with the **first 256 historical mask bytes** in original row-major order, without fitted offset, key, salt or phase. This is a plausible original byte-oriented consumer; it is not explicitly instructed by the manuscript.

The resulting full 256 bytes have SHA-256 `a27a34a788ce8d447ca7222ade4e1c9b8605a030da559375f9f3b5f795c6f754`, first 32 bytes (hex) `142d2916338a04ba539ca7c6ef1df69b2a126764cc651b274dcbac3bf034edf4`, and only **100/256** printable ASCII/standard whitespace bytes. Its first bytes have no PDF, PNG, JPEG, ZIP, gzip or PGP-armor header. **Only 32/256 bytes lie in the literal GP29 range 0–28.** Reducing those bytes mod29 gives IoC **0.0352941**, near random-like. This particular historically sourced XOR produces neither recognizable plaintext nor a direct 256-symbol GP29 rune register. An encrypted binary payload or a separately specified downstream transformation cannot be excluded by format recognition.

To test the same historical tape against actual unresolved ciphertext, also freeze the receiver and clock to the beginning of physical **p0**, **p54** and **p55**, independently:

| Page | Original runes | Direct GP29 subtract IoC | Add IoC | Invalid symbols under 5-bit XOR | Max exact p56-style F-transparent subtract prefix |
|---|---:|---:|---:|---:|---:|
| p0 | 262 | 0.03299114 | 0.03386856 | 27 | 36 |
| p54 | 232 | 0.03332587 | 0.03619943 | 29 | 14 |
| p55 | 76 | 0.03964912 | 0.03368421 | 4 | 22 |

The additive model maps each original mask byte to `maskByte mod 29`, with both signs. This nonhistorical byte-to-rune transfer is explicit; no source authorizes it. Ordinary additive outputs are nonlinguistic. The direct historical **bytewise XOR** of p0 GP indices yields only **58/262** values in the legal GP29 range. The 5-bit variant `cipherIndex XOR (maskByte & 31)` also generates the illegal values 29–31 on every tested page, excluding a direct unescaped GP29 consumer at this source clock.

For the exact **solved-p56 transparent-F rule** (plaintext F emits ciphertext F without consuming a key value; a ciphertext F may alternatively be a consumed encrypted non-F), a complete dynamic program retains every legal key-consumption count at each rune. At all non-F ciphertext runes, zero decrypted plaintext is forbidden. All three original pages have **no valid full-length state**; the largest viable prefixes are **36**, **14**, and **22** runes. A source-native **p57 plaintext synthetic plant**, encrypted under the same mask and F-transparent rule, passes the full inverse, so this is a key/operation contradiction rather than a decoding bug.

## Decision and reproducibility

**Retire** the direct historically authored `560.13 XOR 761.mp3` at its original byte address zero as an LP2 p50 byte-XOR plaintext/header receiver, an unescaped GP29 XOR consumer, or a p56-style F-transparent additive key for the three original rune pages. The authentic 2013 reconstructed mask is still a valid historical source artifact, but p57's reused parable does **not** identify a 2014 key address, byte-to-rune serialization or consumer.

[Node 22 CommonJS read-only original-input reproducer](../sims/lp2_2013_761_twitter_historical_composite_p50_sft.cjs) · [manual Windows original-source CI passing both historical control and LP2 tests](https://github.com/FlareZ123/liber-primus/actions/runs/43971065278).

**Next decision:** Only reopen this branch if a first-party LP2 clue specifies a different address or an exact byte-to-rune operation. Merely sweeping offsets would abandon the historical source constraint and replicate already exhausted generic binary-key searches.
