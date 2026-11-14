# LP1 page 05 JPEG near-palindrome contains a decoded historical 2014 five-by-five square

**Agent24 and Agent35, 14 November 2026. Evidence class: source-exact byte identity and independently reproduced historical numerical plaintext.**

The uploaded 75-image JPEG archive was scanned byte-for-byte. Exactly one file has a nontrivial mirror structure: LP1 page 05, 05.jpg.

## Exact file structure

The 673,066-byte file decomposes exactly as:

\[
F=A\parallel M\parallel\operatorname{reverse}(A)
\]

where:

- \(|A|=336,353\) bytes;
- \(|M|=360\) bytes;
- the first 336,353 bytes equal the reverse of the last 336,353 bytes byte-for-byte;
- the central 360 bytes are the only part that breaks the symmetry.

The first block A is a complete 2400×3600 JPEG, ending with EOI at offset 336,351. The middle block M begins with two newline bytes followed by 358 ASCII hexadecimal characters. Those characters decode to a 179-byte binary block.

| Property | Observed value |
|---|---|
| Archive JPEG count | 75 |
| Files with nontrivial mirror structure | 1 |
| File | 05.jpg |
| Whole-file size | 673,066 |
| Mirror-shell length on each side | 336,353 |
| Central block length | 360 |
| Central block SHA-256 | b7673be762e3f1b0560b2735d1a0894029ce1a39abb130bf9947e81dbf733892 |
| Decoded binary length | 179 bytes |
| Decoded binary SHA-256 | 82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa |
| Whole-file SHA-256 | 2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7 |

The exact central text is preserved in `im-results/lp1-p05-central-block.txt`. Its decoded 179 bytes have a simple **lossless two-step inverse**: swap the high and low 4-bit nibbles of every byte, which immediately yields 5 rows of ASCII decimal tokens; then reverse the decimal digits of each token. The result is an **exact, 25-cell match** to the third historical 2014 five-by-five table in `resources/cicada2014-openpuff-magic-squares.txt`, an independent research resource preserved before this decoding. No secret key, packet brute force or language-model scoring is needed.

The earlier observation of 72,700 post-EOI bytes is a consequence of this larger mirror structure: the trailing segment is the reverse of the first 72,700 bytes. Reversing it reconstructs that prefix exactly. It is not an independent hidden page. The other 74 JPEGs in the uploaded archive have no comparable mirror shell.

## Exact decoded 2014 square and source-selected operations (Agent35, 14 November 2026)

Treat the source's 358 hexadecimal characters as 179 bytes `B`. Set `A[i] = ((B[i] & 15) << 4) | (B[i] >> 4)`; ASCII-decoding `A` produces exactly:

```text

272     831     143     131     151
663     991     031     023      81
622     542      19     542     622
81     023     031     991     663
151     131     143     831     272
```

Reversing **the characters within each decimal token**, preserving even significant leading zeros as text, yields:

```text
272 138 341 131 151
366 199 130 320 18
226 245 91 245 226
18 320 130 199 366
151 131 341 138 272
```

This 5×5 table exactly matches the **third** of the independently preserved historical 2014 original magic-square datasets in [`resources/cicada2014-openpuff-magic-squares.txt`](../resources/cicada2014-openpuff-magic-squares.txt). It is rotationally symmetric and includes all specific 25 numeric values. The first two preserved historical squares are different. The match is exact after whitespace normalization only; no numeric substitutions, guessed offsets, alphabet keys or value fitting occurred. The original near-palindromic A–M–reverse(A) carrier visibly motivates reversal, while the nibble interchange is the smallest operation that turns the observed `0xA0` newline, `0x02` space and `0x13` / `0x23` / `0x33` digit forms into normal ASCII.

The inference is **fully reversible**: reverse every decimal token again, swap its ASCII high/low nibbles back, hex-encode, prepend the two original newlines, and recover all **360 central bytes**, including exact leading-zero digit strings. The [single-file Node22 SFT](../sims/lp1_p05_magic_square_nibble_inverse_sft.cjs) checks the 179-byte SHA-256, exact encoded central stream, 25 individual historical values, independent mismatch if token reversal is omitted, and 180° matrix symmetry. Its independent input is the historical square resource. It is a **recovered original 2014 stage numerical object** embedded as an overlooked binary appendage on LP1's prime/totient page, *not* unknown LP2 plaintext. The 2014 square already existed elsewhere in the public archival record. This newly established copy and its historical handoff may inform further cryptanalysis, but supplies no authenticated cipher operator connecting these 25 numbers to LP2's 12,956 unsolved runes.

## One directly motivated LP2 consumer tested, with original plaintext decision

The source LP1 p05 text explicitly calls **primes and Euler's totient sacred**. Its newly decoded hidden square contains **25 numbers**. Physical LP2 p55 contains **76 GP29 runes**; its original ciphertext has a literal F at local rune position **25**, so treating only this exact F as a transparent, non-key-consuming interrupt leaves **75 key-consuming runes**, three complete passes over 25 table values. The repeated moth illustration provides an independently authored LP1 p05→LP2 p53/p55 visual relationship, though the art also occurs on p53 and therefore **cannot uniquely select p55**. This specific geometry-and-operand combination was not covered by previous #495's negative using the *different* 5×5 **printed Wisdom 1033 square**.

One fixed, minimal test uses the recovered **third 2014 square**, row-major order, `K_i = φ(table[i mod25]) mod29`, original key-start zero, decryption `P_i=(C_i−K_i) mod29`; ciphertext F at local offset25 is copied transparently and leaves the counter unchanged. The exact original 76-rune output is:

```text
NINAETHJOEAWNTEONHFDSCOEUAEOEDTHTFTHANTFNPTHHGDNGNRBDCEBUWREOIADEAAEUPJBEOMEOMHHJORWSMMGTWOIA
```

The recovered output has **IoC 0.0333333333**, whereas the independently solved source-native p56 ciphertext inverse is **0.0700280112** and clear p57 **0.06270997**. All 76 original runes re-encrypt exactly, and the key has consumed **75** values; the output is not coherent GP29 historical prose or a typed instruction. This rejects **this single fixed historical-square φ transfer**, without ruling out other possible keys, phases, F masks, text registers, or source-selected uses of the hidden historical square. The same [single-file SFT](../sims/lp1_p05_magic_square_nibble_inverse_sft.cjs) tests the full exact historical-square extraction and the frozen p55 original hypothesis. Do not retune this mechanism after its observed failure absent another first-party instruction.

## Research significance

The exact match to a separately attested 2014 magic-square table elevates the central block from unexplained binary to an independently recognized historical puzzle artifact. The 336,353-byte reversed JPEG shell, combined with a nibble-swapped and digit-reversed inner table, establishes **intentional-looking multiple reversal layers** in the original LP1 *SOME WISDOM* image. Authorship of the layering and its ultimate key use remain questions. There is no evidence that this middle table itself is a new private LP2 decryption key, because its recovered numbers match already public 2014 material. The direct next research decision is whether a first-party instruction or a *different* original encrypted artifact consumes this exact table under an unambiguous operator; generic arithmetic searches on the 25 values are unwarranted.

## Reproduction

Run the following from the repository root:

    python sims/lp1_jpeg_mirror_tail_scan.py /path/to/liber-primus-jpegs.zip

The script also accepts an extracted image directory. It reports post-EOI data, maximal mirror-shell lengths, central-block hashes, and whether the central block is ASCII hex. The uploaded archive itself is not copied into the repository. Run `node sims/lp1_p05_magic_square_nibble_inverse_sft.cjs` for the exact independent numerical decoding and reverse-encoding.
