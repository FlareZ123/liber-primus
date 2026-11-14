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

Every row, every column, and both main diagonals of this newly recovered square sum **exactly to 1033** (12 independent equality checks), while the nibble-swapped but *digit-unreversed* intermediate lacks that property. Thus the numeric symmetry supplies an additional independent fixed-constant decoding check, beyond the external archive match. The 1033 magic sum is also the earlier visibly printed LP1 p05 Wisdom-square motif; this new hidden table independently reuses that constant. This 5×5 table exactly matches the **third** of the independently preserved historical 2014 original magic-square datasets in [`resources/cicada2014-openpuff-magic-squares.txt`](../resources/cicada2014-openpuff-magic-squares.txt). It is rotationally symmetric and includes all specific 25 numeric values. The first two preserved historical squares are different. The match is exact after whitespace normalization only; no numeric substitutions, guessed offsets, alphabet keys or value fitting occurred. The original near-palindromic A–M–reverse(A) carrier visibly motivates reversal, while the nibble interchange is the smallest operation that turns the observed `0xA0` newline, `0x02` space and `0x13` / `0x23` / `0x33` digit forms into normal ASCII.

The inference is **fully reversible**: reverse every decimal token again, swap its ASCII high/low nibbles back, hex-encode, prepend the two original newlines, and recover all **360 central bytes**, including exact leading-zero digit strings. The [single-file Node22 SFT](../sims/lp1_p05_magic_square_nibble_inverse_sft.cjs) checks the 179-byte SHA-256, exact encoded central stream, 25 individual historical values, independent mismatch if token reversal is omitted, and 180° matrix symmetry. Its independent input is the historical square resource. It is a **recovered original 2014 stage numerical object** embedded as an overlooked binary appendage on LP1's prime/totient page, *not* unknown LP2 plaintext. The 2014 square already existed elsewhere in the public archival record. This newly established copy and its historical handoff may inform further cryptanalysis, but supplies no authenticated cipher operator connecting these 25 numbers to LP2's 12,956 unsolved runes.

## Original p55: source-motivated additive consumer and original plaintext decision

The source LP1 p05 text explicitly calls **primes and Euler's totient sacred**. Its newly decoded hidden square contains **25 numbers**. Physical LP2 p55 contains **76 GP29 runes**; its original ciphertext has a literal F at local rune position **25**, so treating only this exact F as a transparent, non-key-consuming interrupt leaves **75 key-consuming runes**, three complete passes over 25 table values. The repeated moth illustration provides an independently authored LP1 p05→LP2 p53/p55 visual relationship, though the art also occurs on p53 and therefore **cannot uniquely select p55**. This specific geometry-and-operand combination was not covered by previous #495's negative using the *different* 5×5 **printed Wisdom 1033 square**.

One fixed, minimal test uses the recovered **third 2014 square**, row-major order, `K_i = φ(table[i mod25]) mod29`, original key-start zero, decryption `P_i=(C_i−K_i) mod29`; ciphertext F at local offset25 is copied transparently and leaves the counter unchanged. The exact original 76-rune output is:

```text
NINAETHJOEAWNTEONHFDSCOEUAEOEDTHTFTHANTFNPTHHGDNGNRBDCEBUWREOIADEAAEUPJBEOMEOMHHJORWSMMGTWOIA
```

The recovered output has **IoC 0.0333333333**, whereas the independently solved source-native p56 ciphertext inverse is **0.0700280112** and clear p57 **0.06270997**. All 76 original runes re-encrypt exactly, and the key has consumed **75** values; the output is not coherent GP29 historical prose or a typed instruction. This rejects **this single fixed historical-square φ transfer**, without ruling out other possible keys, phases, F masks, text registers, or source-selected uses of the hidden historical square. The same [single-file SFT](../sims/lp1_p05_magic_square_nibble_inverse_sft.cjs) tests the full exact historical-square extraction and the frozen p55 original hypothesis. Do not retune this mechanism after its observed failure absent another first-party instruction.

## Original p55: direct non-additive Hill5 inverse from the newly recovered square (bounded negative)

The exact recovered 2014 numerical square offers a further historically plausible **non-additive** use, distinct from the failed totient pad above. Reduce its source-ordered entries modulo the authenticated GP29 modulus and use it as a classical five-rune Hill-cipher block matrix, with ciphertext vectors as columns. The original square is nonsingular: its determinant is **3 mod 29**; no matrix repair, trial permutations, key search or chosen plaintext is required. The original p55 has **76** runes, and the one original ciphertext F at local index **25** can be hypothesized as a literal key-clock interruption, leaving **75 = 15 × 5** runes. The skip is an explicit *hypothesis* transferred from solved Cicada ciphers, not a proven property of this unknown page.

The exact row-major matrix and its inverse over GF(29) are:

~~~text
M                         M^{-1} mod 29
11 22 22 15  6             23 22 15  2 17
18 25 14  1 18             24 25  4  2 24
23 13  4 13 23             20 28 12 28 20
18  1 14 25 18             24  2  4 25 24
 6 15 22 22 11             17  2 15 22 23
~~~

Applying the fixed inverse \(P_j=M^{-1} C_j\pmod{29}\) independently to each consecutive ciphertext block of five, restoring F at index25, yields this complete original-page candidate:

~~~text
WUEARFRNGWNSOEOOEIALFYAEEAROEOEALWFSUBYPMAEEAJNGAPREAAEDNGOEOEJOEASAITHDUBWNGTHORPTLSTHNJILJEJAAENY
~~~

The 75 transformed non-F runes have coincidence index **0.03855855855855856**, without coherent source-native prose or a readable command. Exact forward Hill5 multiplication re-encrypts all **75/75** consumed original runes; F is restored unchanged at its original source position. That round-trip is guaranteed by the invertible matrix and **does not authenticate** the key. The historically given other 5×5 square yields another nonprose 75-rune output (IoC **0.02990990990990991**); the 7×7 square cannot consume 75 runes in complete seven-symbol blocks under this same fixed clock, so no further key phase was fitted.

**Decision:** The source-derived 5×5 matrix is genuinely invertible, but the direct, block-aligned Hill5 transfer **does not decipher p55**. The source provides no instruction selecting Hill5 as a consumer or this skip clock. Retire this exact candidate without a fresh source-backed operator. The canonical source-coupled SFT tests the original 76 runes, exact matrix inverse and reencryption.

## p05 179-byte payload → p53 179-rune stream (bounded direct-key negative)

The hidden p05 center decodes to **179 bytes**, exactly the rune count of LP2 p53. The p05 moth illustration is also repeated on p53 (and p55), making a one-to-one p05→p53 byte/rune alignment a plausible, finite consumer hypothesis. The simplest GP29 interpretation is to reduce each byte of a source-fixed 179-byte p05 representation modulo 29 and use it as an additive stream against the 179 original p53 runes.

Three exact p05 representations were tested: the raw 179-byte decoded payload, the 179-byte nibble-swapped ASCII intermediate, and the final 179-byte digit-reversed square text. First, each was reduced bytewise modulo 29 and applied with both addition and subtraction, without a key skip or fitted phase: **six direct candidates**. Since the p05 prose explicitly names the totient function, a second bounded exploratory family applied **φ(byte) mod 29** to each of the same three representations, again with both signs: **six totient candidates**. The latter is a motivated extension, not a source-authenticated instruction to take totients of arbitrary byte values. None of the **12** outputs yields readable GP29 plaintext. The original p53 IoC is **0.033520**; direct outputs range **0.032892–0.036470**, and totient outputs **0.032704–0.035340**, with no language-like recovery. The original p53 has five literal F runes at local offsets 68, 71, 79, 89 and 166; these one-to-one tests deliberately do not introduce a plaintext-F bypass because the proposed direct alignment already consumes exactly one key byte per rune.

**Decision:** reject the direct bytewise-mod-29 and φ(byte)-mod-29 additive mappings of these three exact p05 representations to p53, under both signs. The 179/179 length match and repeated moth remain a plausible selector, but this result does not test OpenPuff extraction, non-additive operations, transposition, or a separately source-selected key transformation. Do not tune byte offsets or arbitrary maps to rescue the failed direct streams.

## Research significance

The exact match to a separately attested 2014 magic-square table elevates the central block from unexplained binary to an independently recognized historical puzzle artifact. The 336,353-byte reversed JPEG shell, combined with a nibble-swapped and digit-reversed inner table, establishes **intentional-looking multiple reversal layers** in the original LP1 *SOME WISDOM* image. Authorship of the layering and its ultimate key use remain questions. There is no evidence that this middle table itself is a new private LP2 decryption key, because its recovered numbers match already public 2014 material. The direct next research decision is whether a first-party instruction or a *different* original encrypted artifact consumes this exact table under an unambiguous operator; generic arithmetic searches on the 25 values are unwarranted.

## Reproduction

Run the following from the repository root:

    python sims/lp1_jpeg_mirror_tail_scan.py /path/to/liber-primus-jpegs.zip

The script also accepts an extracted image directory. It reports post-EOI data, maximal mirror-shell lengths, central-block hashes, and whether the central block is ASCII hex. The uploaded archive itself is not copied into the repository. Run `node sims/lp1_p05_magic_square_nibble_inverse_sft.cjs` for the exact independent numerical decoding and reverse-encoding.
