# Continuous GP28 binary-file header inversion with an entirely hidden alphabet

**Status, 10 November 2026:** original-source, all-key necessary-condition attack with exact positive reconstruction. **No LP2 plaintext, historical cipher, authentic key or destination recovered.** The new contribution is a *single continuous radix conversion*, distinct from previously tested fixed-width 5-digit/3-byte packets. The strongest original input result closes the ordinary one-block LZ4 framing and several common binary headers under this precise register. Do not confuse these conditional negatives with exclusion of unknown binary intermediates.

## Original input and the candidate architecture

Use the [canonical 58-page source](../resources/liber-primus/lp2-corpus.json); physical unsolved LP2 p0–55 contain 55 rune-bearing pages and numeric-only p50. Under this *provisional* format, the first rune of each of 55 rune-bearing pages initializes its predecessor state, and all 86 within-page adjacent equal-rune steps are zero-length markers. Retain each of the **12,815 remaining steps**. Either use the cyclic predecessor difference in {1,…,28}, or the sorted predecessor-exclusion rank in {0,…,27}. Both constitute a 28-way observable alphabet.

Read the entire 12,815-rank stream as a **single** base-28 integer in most-significant-digit-first order. Permit any one hidden bijection between the observable 28 labels and abstract base-28 digits, with no source-key information or fixed-rune-order assumption. Also test reversing the complete digit stream, for four declared observation registers. The integer is serialized into **minimal-length big-endian bytes**, and the bytes may begin with recognizable binary-file headers. The 12,815 significant base-28 digits imply a 7,701-byte minimal serialization. All original 12,956 rune positions have a unique role; the construction does not assert that either state model is Cicada's cipher.

This is a test of unpacketized numeric conversion of a binary intermediate, **without** the particular 5→3 grouping, packet alignment or byte-overflow premise in [earlier fixed-packet studies](gp28-direct-binary-packet-capacity.md). No unknown secret alphabet is fitted.

## Exact universal-alphabet necessary condition

Let N=12,815, B=7,701, and let h be the integer represented by a proposed file's known leading k bytes. Every possible full B-byte file with this prefix lies between

\[
L=h\,256^{B-k},\qquad U=(h+1)\,256^{B-k}-1.
\]

Intersect this interval with the *exactly N-digit* base-28 interval \([28^{N-1},28^N-1]\). If integer division of both resulting endpoints by \(28^{N-j}\) gives the same quotient, the j-th leading base-28 digit is fixed independently of the unknown trailing file bytes. Repeat until the first unfixed digit.

For **every one of 28! secret bijections**, two fixed digits are identical exactly when the two ciphertext labels at the corresponding positions are identical. Similarly, distinct fixed digits require distinct labels. The first violated pair is a rigorous all-alphabet contradiction, independent of language, likelihood scores, secret-key enumeration or decompressor details.

The script also evaluates **all 32 allowed gzip FLG bytes** (flags 0–31, including optional-extra fields); each yields the same decisive fifth digit, so this is an exhaustive compliant-gzip header exclusion within the model.

The [runnable CJS original-input inversion](../sims/lp2_continuous_binary_header_inverse.cjs) evaluates byte lengths 7,694–7,708, confirms the original rune/marker counts, computes each fixed prefix numerically using BigInt, and checks the two predecessor registers in both orientations.

## Original-source results

| Declared original-file prefix | Exact constraint from original LP2 |
| --- | --- |
| Gzip magic \`1F 8B 08\` only | Compatible: four forced base-28 digits, with a valid partial secret-label assignment. This **does not** authenticate gzip |
| **Every valid gzip FLG byte 0–31**, following \`1F 8B 08\` | **All 32 valid flags rejected in all four registers**: the forced leading five base-28 digits are always \`[11,16,4,26,11]\`, repeating digit 11 at positions 0 and 4; the corresponding original ciphertext labels differ. Bits 5–7 of the gzip flag byte are reserved and must be zero |
| BZIP2 \`BZh1\`…\`BZh9\`, plus block magic \`1AY&SY\` | All nine compression levels rejected in all four registers: digits 3 and 4 must both equal 27, but original labels differ |
| 7-Zip \`37 7A BC AF 27 1C 00 04\` | Rejected in all four registers through its fixed leading twelve base-28 digits |
| PDF \`%PDF-\` | Rejected in all four registers through its unavoidable repeated first-digit pattern |
| XZ, conventional ZIP local-file signature, standard zlib \`78 9C\`, PNG, JPEG | No 12,815-digit, minimally serialized base-28 integer can begin with these named prefixes; length/capacity contradiction |
| LZ4 magic \`04 22 4D 18\` | Compatible with the early prefix, requiring further LZ4 framing constraints |

For LZ4 frames, test every legally selected combination of **8** FLG configurations for independent/dependent blocks and optional block/content checksums, **4** BD maximum-block sizes, the exact LZ4 XXH32 descriptor checksum, and **2** block-storage modes (compressed vs explicitly raw). The precise source length fixes the length of a **single payload block**, so its four-byte little-endian length field is another *known, unavoidable prefix*. The script tests all **64** original-compatible full one-block configurations. All 64 fail across each of the four observation registers; each failure identifies exact source-index pairs whose equality pattern cannot be reconciled by **any 28-permutation**.

An earlier seven-byte LZ4 frame-header-only comparison admits **7 of 32** settings in the forward cyclic register and none in the other three. Adding the obligatory first block's stored length removes the seven survivors. LZ4 frames with content-size or dictionary-ID header fields, multi-block structures, and other transports are **outside this test**.

## Constructive positive control and original execution

The program constructs a complete, syntactically valid **7,701-byte uncompressed one-block LZ4 frame** with a genuine LZ4 header checksum, explicit raw-block-length flag, source-derived deterministic content and block terminator. It encodes the whole frame as 12,815 base-28 digits. A secret full 28-symbol permutation then maps the digits to a 29-rune predecessor-exclusion channel, restoring **all 55 original physical-page IV glyphs** and exactly **all 86 original printed repeated-glyph sites** in their original positions.

Without supplying the encoder's original source digits, the inverse extracts the 12,815 rank digits from the 12,956 generated source-layout runes, applies the hidden inverse permutation and reconstructs the **exact original 7,701 binary bytes**. The secret-alphabet header fingerprint accepts this true frame. Assertions fail if there is a lost rune, missized file, incorrect block-length constraint, wrong key inversion or an unexpectedly permitted original single-block LZ4 candidate.

[Successfully executed GitHub Actions run **42851770163**](https://github.com/FlareZ123/liber-primus/actions/runs/42851770163), on source code committed before the run. The existing [manual binary-probe workflow](../.github/workflows/lp2-adaptive-base28-manual.yml) now offers \`probe=continuous\`. Node 22 ran the exact original-source and source-shaped synthetic checks; the CI job concluded success. No per-commit workflow was created.

## What remains alive

A separate, unpacketized GP29 whole-stream test is recorded in [the GP29 whole-stream AEAD gate](gp29-whole-stream-aead-gate.md): the raw 12,956-rune GP29 integer serializes to 7,868 bytes, which fits a 12-byte nonce / 7,840-byte ciphertext / 16-byte tag layout, but 910 AES-256-GCM and ChaCha20-Poly1305 attempts under 91 source-derived keys authenticate nothing. This is a distinct representation; it does not alter the exact GP28 predecessor-rank findings above and does not exclude unknown keys or other ciphers.

The three-byte gzip magic alone permits a four-digit partial alphabet assignment, but its mandatory next FLG byte refutes **every valid gzip frame** for this exact unmasked global base-28 model. A preceding binary-encryption layer, changing alphabets, nonstandard file headers or a different transport remain possible. LZ4 multi-block and optional content-size/dictionary-ID formats require independent size/field assumptions. A real original inverse must identify the unknown digit-to-rune assignment and recover nonheader bytes that parse and decompress correctly, followed by a verifiable plaintext and exact forward reconstruction.

**Decision:** retain this method as a compact source-specific gate for *newly evidenced* binary headers. Avoid producing another broad catalogue of binary magic screens. The next worthwhile result is an original-data positive decode with a source-derived alphabet/key or a new stateful architecture that can account for the original boundaries and echo structure.