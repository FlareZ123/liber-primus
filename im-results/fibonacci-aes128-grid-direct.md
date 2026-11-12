# LP2 numeric grid under Fibonacci-square-derived AES-128 keys

**Agent 16, 2026-11-10. Evidence class: bounded, original-input cryptanalytic negative with an exact byte-roundtrip control. No previously unsolved LP2 plaintext, authentic key, binary payload, or destination was recovered.** This closes one straightforward 128-bit interpretation of two already established manuscript clues without increasing arbitrary key searches.

## Two independent artifacts

The physical LP2 page 15 (original scan 32.jpg) contains a 4×4 square whose 16 entries are **exactly** the clockwise spiral of \`abs(3301 − prime(Fibonacci(n)+1))\`, retaining 16 distinct Fibonacci indices. That mathematical construction is independently established prior art (see [the exact reconstruction](../results/fibonacci-prime-spiral.md)). The 32×8 two-character base-60 table on LP2 pages 49–51 yields exactly **256 bytes** in its published original reading order, including the runeless physical page 50.

A natural hypothesis distinct from previously tested 256-bit section keys and 128-bit *IVs* is that **sixteen numeric square entries serialize directly to a 16-byte AES-128 key** and decrypt the 256-byte grid. This is a hypothesized interpretation of the clues. Neither artifact explicitly instructs AES.

## Fully specified finite original-ciphertext inverse

[Executable CommonJS source](../sims/fibonacci_aes128_grid_key.cjs) re-reads the original square from the master manuscript and the machine-readable 256-byte grid, and reconstructs five different 16-number candidate key ingredients:

1. The 16 printed square integers;
2. signed \`3301 − square integer\`;
3. corresponding 16 Fibonacci-selected prime values;
4. their one-based prime ranks;
5. their original Fibonacci indices.

Each ingredient is read in exact clockwise-spiral or printed-row order, optionally reversed, reduced modulo 256 with a positive or negative sign: **40 explicitly named 16-byte keys**. No key bytes are learned from decrypted outputs.

The **256-byte target** is traversed in row-major, reversed row-major, column-major or reversed column-major order. For each combination we test raw AES-128 ECB, CBC, CTR, CFB and OFB. ECB has no IV; each of the other four modes uses five defined IVs: all zeros, the original grid's first or last 16 bytes, and the square's 16 direct byte reductions in printed-row or spiral order. Thus the total is **40 × 4 × (1 + 4 × 5) = 3,360** configurations. CBC and ECB have padding disabled because the full original table is 256 bytes and no padding length is independently specified.

Direct byte decodings are scored with two *necessary conditions* for the tested output encodings: all 256 bytes must be ASCII printable or standard whitespace to be one complete direct ASCII text, or all 256 bytes must be in \`0..28\` to be a literal one-byte-per-GP-rune text. The longest contiguous ordinary ASCII segment is also recorded, but an isolated string selected across thousands of decryptions is not an authenticated message. Binary file formats, compression, other encodings and unknown AES key derivations are outside this gate.

## Executed findings

[Successful original GitHub Actions run 42771887658](https://github.com/FlareZ123/liber-primus/actions/runs/42771887658), Node.js 22, used the committed primary inputs and passed every exact contract assertion.

| Original-data diagnostic | Result |
| --- | ---: |
| Actual 16-byte candidate keys | 40 |
| Tested AES-128/grid/IV configurations | **3,360** |
| Complete ASCII/whitespace outputs | **0 / 3,360** |
| Complete 0..28 GP-byte outputs | **0 / 3,360** |
| Largest ASCII/whitespace byte count | **125 / 256** |
| Largest GP-range byte count | **49 / 256** |
| Longest contiguous ordinary ASCII span | **12 bytes** |

The highest ASCII-byte count is obtained with signed difference key / spiral forward / direct, reversed row-major bytes, OFB and the final-grid-byte IV. Its first 32 recovered bytes are \`0f75fa7f0cdfc0491a109b8b2874358e171b5ad2488ed67c3774fd65d622fe11\`; it does not form text. The highest GP-range result comes from the prime-rank key / spiral direct, row-major grid bytes, CBC and first-grid-byte IV; **49** is far below the required 256 literal GP indices.

**Planted exact positive:** encrypt the first 256 bytes of the checked-in independently solved LP1 translation using the source-derived square key, AES-128-CBC and a zero IV. The same decryptor recovered **all 256 original bytes exactly**, demonstrating that the full byte path and AES mode semantics work.

## p15 square as absolute pointers to the original rune stream (Agent29, 12 November 2026)

**Independent creator-visible key interpretation, original-input negative.** The 16 integers printed in the center-highlighted p15 4×4 Fibonacci-prime spiral are **all valid absolute offsets within the 12,956-rune unknown LP2 text**. The 2016 signed clue says that the manuscript's words are a map and numbers give directions, providing an independent, if still unproven, rationale for interpreting the published square values as **rune positions** rather than direct AES key bytes. Extract those 16 original ciphertext runes, then use their original GP index values (0–28) or their original Gematria primes (2–109) as **exactly 16 AES-128 key bytes**. Grant zero- or one-based index origin and the two natural square readings (center-out clockwise spiral or printed rows). These are **eight fully determined 16-byte candidate keys**, with no plaintext learning or optimized numeric offsets.

The center-out, **zero-based, original-GP-index key** is `1607181a140113011408100619110113`, from source rune indexes `[22,7,24,26,20,1,19,1,20,8,16,6,25,17,1,19]` in the source-defined outward order. Its GP-prime-byte counterpart is `531361674903470349173b11653d0347`. Extracting *ciphertext* runes as key material is a declared first-stage hypothesis; if the intended book code indexes unknown *plaintext* runes, their key bytes are unavailable without prior decryption and this direct test would not apply.

The finite grid inverse decrypts the **256 authentic p49–51 table bytes** under each key, four fixed table traversals (printed rows, columns, reverse rows and snake rows), and AES-128 ECB, CBC, CTR, CFB and OFB, with a zero IV for IV-bearing modes: **8×4×5 = 160** configurations. ECB/CBC run with padding disabled. The whole-byte outputs have:

- **0/160** completely ASCII-printable/whitespace results and **0/160** outputs lying entirely in the literal GP29 byte range 0–28.
- The post-selected highest printable count is **117/256**, with the highest GP-byte count **45/256** and longest contiguous printable ASCII run **11 bytes**. None supplies an intelligible payload.

The same eight keys as literal AES-128-CTR keystream seeds were consumed over the **12,956 original GP rune symbols**, using a zero counter and byte modulo 29 under both additive signs. Across all **16** alternatives, the maximal pooled rune IoC is **0.0345358437**; on the original **p16–22** post-square section the maximum is **0.0348727808**, near the 1/29 uniform baseline, far below native GP-English calibration (~0.06). A source-key **47-byte literal English AES-CTR byte message** and an independently solved **95-rune p57 GP29 ciphertext plant** both decrypt exactly under the same implementation.

**Simpler sixteen-rune key consumers (same actual source, added 12 November 2026).** The 16 indexed original runes also permit a much simpler human-solvable operation: repeat their **literal 16-byte GP index/prime key** over the 256-cell grid (exactly 16×16), using bytewise XOR, subtraction modulo 256 or addition modulo 256. The identical eight source-fixed keys and four grid readings produce **96 original-grid decodings**. **Zero** gives a complete printable ASCII or one-rune-per-byte GP29 output; the post-selected highest printable count is **115/256**, and the highest GP-range count **41/256**. Repeat the **16 literal GP-index values**, without AES, as a page-continuous GP29 additive pad over all 12,956 original runes in both signs (16 direct inverses): best full-book IoC **0.0345227364**, and best section p16–22 IoC **0.0345471006**. Neither approaches the native-GP-English signal. This tests the simplest key-consumption reading of the printed 16-source-index square, rather than requiring the creator to use a modern block cipher. Same [source SFT](../sims/lp2_p15_absolute_rune_bookcode_aes128_sft.cjs), updated reproducible [passing original-data run **43160668527**](https://github.com/FlareZ123/liber-primus/actions/runs/43160668527).

**Word-index interpretation of Fibonacci prime ordinals (12 November 2026).** The same original p15 square defines one-based Fibonacci prime ordinals `[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]`, all valid word addresses among the **2,896** printed unknown-source words. The independent 2016 signed instruction emphasizes **words as map**, making direct *word* positions a plausible alternative to using the square's much larger displayed integers as *rune* positions. Interpret each prime ordinal in zero- or one-based word indexing and select the **first, last, or middle rune** of that original ciphertext word. This yields six fully source-defined 16-rune keys; their index/GP-prime byte representations give 12 fixed AES-size keys. Repeating the literal GP index keys as sixteen-rune additive GP29 pads over the entire original 12,956-rune ciphertext, in both directions, gives **12 direct alternatives**; the highest full-book IoC is **0.0345489749**, still near uniform 1/29 and no native-language plaintext. Directly XOR each of the **12** byte-keys against all four fixed readings of the actual 256-byte grid gives **48 independent zero-IV-free simple inverses**, with **zero** completely printable or all-GP29 byte results; maximum printable is **108/256**. The fixed operations exactly re-encode the original inputs. This bounds the author's most direct word-address interpretation as an additive/byte-XOR key, without excluding other word-mapping instructions. [Same original-source SFT](../sims/lp2_p15_absolute_rune_bookcode_aes128_sft.cjs) · [successful run **43161028733**](https://github.com/FlareZ123/liber-primus/actions/runs/43161028733).

**Decision:** The obvious *absolute-manuscript rune book-code* interpretation of the p15 numbers produces no direct AES key, readable grid, or English-like GP rune plaintext in the declared zero-IV AES interpretations. The original square-to-rune positional relation is arithmetic fact and the book-code interpretation remains unproven; other use of those positions, original plaintext addresses and unknown derived-key algorithms are not excluded. Do not proliferate square-index offsets or cipher families without a stronger source constraint. [Full source and positive controls](../sims/lp2_p15_absolute_rune_bookcode_aes128_sft.cjs) · [successful original-input workflow run **43159155767**](https://github.com/FlareZ123/liber-primus/actions/runs/43159155767).

## Cryptanalytic interpretation

The **literal AES-128 16-byte-key interpretation of these source clues does not directly expose a full human-readable byte or one-rune-per-byte grid payload**. No key or decryption candidate is established; promoting the highest count would be result-selection bias. This gate deliberately stops at its original mechanism rather than fitting extra hashing, compression assumptions, IV lengths or alphabet substitutions to chance gibberish.

The grid may represent a nontext binary object, act as key material for a separate cipher, use a different serialization, or be unrelated to the square. The original runic pages are not tested under this AES-128 hypothesis. A next productive attack needs independently constrained key-use instructions or a mechanism that predicts original manuscript plaintext.
