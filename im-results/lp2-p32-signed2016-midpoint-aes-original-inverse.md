# P32 image-weighted midpoint spells AES/X; fixed ring-key original decryptions

**Agent49, 13 November 2026. Status: candidate source-visible operation, with completed original-input negatives. No LP2 unknown plaintext, authentic AES key, verified cipher, or destination.** This report isolates one new geometric reading from already known p32/2016 source links. The visible AES/X alignment is an observation selected during exploratory work. Its intention, and whether it genuinely points to AES, remain unproved.

## Human path and source-fixed geometry

The signed 2016 Cicada image `resources/historical/cicada2016-4gq25.jpg` measures exactly **563×569 px**; its tree matches Liber Primus physical **p32**. Independently established earlier, p32's 121 GP runes form an 11×11 source-order array whose first-row GP-prime weights sum to 563 and whose first-column weights sum to 569. These fixed weights partition the signed image into eleven unequal horizontal and vertical strips:

- Horizontal edges (pixels): `[0,73,78,179,198,299,302,345,452,465,484,563]`.
- Vertical edges: `[0,73,96,101,124,203,262,315,394,453,562,569]`.

The image's geometric midpoint is exactly `(floor(563/2),floor(569/2))=(281,284)`. It falls in **zero-based tile (row6,col4)**, image rectangle `x∈[198,299), y∈[262,315)`. The original **top-column axis rune** p32[0,4] is **AE** (GP prime 101), the **left-row axis rune** p32[6,0] is **S** (GP prime 53), and their **interior intersection** p32[6,4] is **X** (GP prime 47). The two axis-runic labels **AE + S** spell **AES**, a common cipher standard, while the intersection is an X, the conventional map mark. The ordinary 11×11 array center [5,5] is **W** instead. The word AES is obtained specifically by using the **2016 image pixel midpoint mapped into the original p32 prime-sized tiles**; the earlier original source-axis checksum does not alone yield AES.

**Selector objection:** no 2016 signed message or original p32 drawing directs the solver to use the exact JPEG midpoint, concatenate the two axis rune names, or use its tile glyph as a mode flag. The image geometry and cipher nomenclature were recognized after exploring p32. These are reproducible coincidences that can support a discriminating experiment, not authenticated evidence that LP2 was encrypted with AES. X also has other potential meanings. The fixed original p32 array contains five X runes overall (all in the 100 interior positions), so an illustrative 100-interior permutation holding the 21 axis cells fixed would put X on the predetermined midpoint tile with exact probability **5/100=0.05**. This conditional chance is not a global discovery probability after searching varied visual clues.

## The only natural source-sized AES key candidates and byte consumer

The p32 11×11 prime array has three central square perimeters with respectively **32, 24 and 16** rune symbols, exactly the AES-256, AES-192 and AES-128 key sizes **if each rune is interpreted as a byte**. Their GP-prime sums are **1539, 1046, 1136** respectively. The inner ring's independent **1136** equality with the 2016 PGP-signed OutGuess payload byte length was previously documented in [the source report](p32-ring1136-signed2016-center75-p55-gate.md). Source-facing inputs remain unchanged.

The target is the original p50 32×8 numeric table. Under the project's explicit base60-to-byte hypothesis it supplies exactly **256 bytes**, an integer multiple of AES's 16-byte block size. That byte interpretation is itself provisional; the manuscript visually prints two-character symbols, and no signed instruction says the p50 grid is AES ciphertext.

Freeze the rings with no fitted cipher key, using clockwise, counterclockwise, or ordinary row-major order and either GP ordinal or GP-prime byte values. Decrypt the unaltered 256-byte table with all available relevant key sizes:

| Direct consumer | Original-input cases | Best printable ASCII bytes (of 256) | Outcome |
|---|---:|---:|---|
| AES-128/192/256 ECB and CBC with all-zero IV | **36** | **115** | Random-looking bytes |
| AES-128-XTS; 32-byte outer ring key, 16-byte inner ring tweak | **36** | **109** | Random-looking bytes |
| AES-256/192 CBC using inner 16-byte prime ring as IV | **12** | **103** | Random-looking bytes |
| **Total** | **84** | **115** | No readable original plaintext |

The top ECB result (16-byte prime key, p32 inner ring row-major) has first plaintext block hexadecimal `c6f71bfdc9999957f862c379777853aa`. This is the most printable candidate of all 84, yet it is unmistakably binary-looking, without a sentence, recognizable header, or authentic key confirmation. All cipher variants successfully roundtrip independent 256-byte synthetic controls, including 36 XTS controls. Valid key lengths and invertibility are necessary implementation checks, not proof of historical use.

## Full-book GP29 AES-CTR direct-stream transfer

A second direct candidate uses the same concentric rings as AES-128/192/256 keys to generate a byte keystream in AES-CTR, maps each byte to GP29 via residue modulo29 and inverts the **12,956 unaltered unknown LP2 runes** by both signs. Every source-fixed clock is tested separately: book-global, 55 physical rune-bearing page resets, or the 9 original visual chapter lengths. Both zero IV and the 16-byte inner prime ring IV are tested, with 3 key orientations and 2 rune byte encodings. This gives exactly **216** complete original-stream GP29 inverse candidates.

| Source | GP29 IoC | Mean Shakespeare-trained native-GP trigram log likelihood (nats) |
|---|---:|---:|
| Original unknown LP2 cipher | **0.03447839786** | **−12.82858692** |
| Best GP29 IoC of 216 CTR inverses | **0.03454903447** | Its own score remains ciphertext-like |
| Best GP trigram score of 216 inverses | Its own IoC **0.03452393989** | **−12.77299656** |
| 12,956-rune genuine Gibran GP plaintext plant | **0.06044302308** | **−7.82376558** |

None of the 216 candidates approaches English concentration or grammar. One genuine Gibran GP control was AES-CTR-encrypted under the frozen 2016 inner-ring prime key and visual-chapter clock and decrypted **12,956/12,956** exact symbols. This preserves all original GP positions and checks the tested arithmetic. The simple modulo29 keystream is a proposed transfer, not an instruction from the artwork.

## Decision and practical continuation

The **new geometrically fixed AES/X hint** is worth retaining because it proposes a recognizable cipher family from two independently witnessed physical artifacts, and the concentric rings immediately provide exact conventional key lengths. But it does **not** decode original LP2 content by direct AES decrypt of p50, by XTS with the central ring tweak, or by straightforward AES-CTR-to-GP29 full-book transfer. Retire these exact direct consumers; no new phase, rune order, per-page IV fitting or key search is licensed without a further independent source instruction. In particular, avoid promoting mere AES naming, reversible synthetic controls, or printable binary fragments into a decipherment.

A productive successor would locate an actual original cryptographic **consumer instruction** linking the image midpoint, one ring, a specific ciphertext page/table register and an AES mode, or recover an externally authenticated key. A pre-specified header/padding/semantic output on withheld original bytes would distinguish success from coincidence. Otherwise move to independent hypotheses with a clearer route to plaintext.

## Reproduction

- [p50 byte AES-ECB/CBC/XTS controls and original output](../sims/p32_2016_midpoint_aes_ring_key_sft.cjs), successfully executed in [Actions run 43367787672](https://github.com/FlareZ123/liber-primus/actions/runs/43367787672).
- [Full original GP29 AES-CTR, English native-GP reference and positive control](../sims/p32_2016_midpoint_aes_gp29_ctr_sft.cjs), passed in [Actions run 43368221732](https://github.com/FlareZ123/liber-primus/actions/runs/43368221732).
- [Manual-only runner](../.github/workflows/lp2-p32-signed2016-midpoint-aes-ring.yml).
- Input files are the original rune indices `resources/liber-primus/lp2-corpus.json`, the original print's byte interpretation `resources/liber-primus/base60-grid.json`, and independently documented image dimensions, plus committed Shakespeare and Gibran GP controls. The tests do not alter original ciphertext or infer page-specific candidate keys.
