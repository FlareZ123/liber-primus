# Historical 2014 stego-share key source tested against unsolved LP2

**Status:** the 2014 mechanism is historically positive, but its recovered invitation token is a noncanonical Base32 rendering of the Stage04 Onion2 address plus a partial `.onion` suffix, not a binary key. The direct LP2 byte-pad sweep is negative and no source-authenticated instruction selects the old payloads as an LP2 key. No LP2 plaintext, key, or actual encryption mechanism recovered.

## Mechanism and source

Three original 2014 Cicada image payloads exposed as hexadecimal PGP-signed files were independently recovered via OutGuess in the historical record. The reference files `payload_00.txt`, `payload_01.txt` and `payload_02.txt` are stored in [pnotisdev's historical study](https://github.com/pnotisdev/cicada3301/tree/main/results/outguess). Each yields exactly **991 bytes** after removing PGP armor and hex-decoding the interior payload. XORing the three streams byte-for-byte yields a complete printable 991-byte signed message, beginning `-----BEGIN PGP SIGNED MESSAGE-----` and containing:

```
IDGTK UMLOO ARWOE RTHIS UTETL HUTIA TSLLO
UIMNI TELNJ 7TFYV OIUAU SNOCO 5JI4M EODZZ
```

The three-way XOR and subsequent 14-column transposition are **historical 2014 puzzle steps**, rather than newly recovered LP2 text. This study uses the three independent hidden bytestrings as a bounded, clue-supported source of potential cryptographic key material. Their exact hex bytes, original source URLs and derived-message invariant are preserved in [the stable derived reference](../resources/cicada2014-outguess-hex.json).

## Historical stage outcome and cross-stage selector decision (11 November 2026)

The recovered 991-byte signed message has a 70-character five-gram body. Strip the spacing, write five rows of fourteen characters, then read columns in the **historically recorded order** `[2,8,9,1,12,13,11,4,5,7,3,0,6,10]` (zero-based). This exactly yields:

```text
GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSION
JOINUSATFV7LYUCMEOZZD5J4ONIO
```

This points to **fv7lyucmeozzd5j4.onion** (the historical source supplies the missing final `N` for the `.onion` suffix). The 2014 solver walkthrough documents that this decoded instruction led to the *next onion stage*. Its original purpose is therefore a concrete 2014 waypoint rather than a demonstrated LP2 key selector: [2014 reconstructed source and column order](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014)#The_5_Gram_Message). The 2016 signed instruction instead says that the words, meaning and numbers of Liber Primus supply the map/road/direction, without specifying these old three shares or their byte-order as a cipher key: [contemporary transcription](https://github.com/scream314/cicada3301/blob/master/2016.md).

### Canonical Base32 interpretation of the invitation token (Director Issue #285)

The exact 20-character token `FV7LYUCMEOZZD5J4ONIO` is **not a canonical RFC 4648 Base32 encoding of 12 bytes**. A permissive decoder that ignores unused pad bits yields `2d7ebc504c23b391f53c7350` (12 bytes; SHA-256 `296e14f036490b4c2a61ba6fea9602c643640fd061bdc8deb0517968e1d0ca5b`). Re-encoding those bytes canonically gives `FV7LYUCMEOZZD5J4ONIA====`, not the original token: the final `O` has nonzero unused padding bits (`01110`, with pad bits `1110`; canonical pad bits must be zero).

The source-selected 16-character prefix `FV7LYUCMEOZZD5J4` decodes to `2d7ebc504c23b391f53c`, exactly the 10-byte v2 identifier for the Stage04 address `fv7lyucmeozzd5j4.onion`. The remaining literal `ONIO` is the partial textual `.onion` suffix with the final `N` absent; its permissive two-byte decode is `7350`. This explains the 12-byte output without treating it as a separate identifier or key.

The Stage11 address `ky2khlqdf7qdznac.onion` instead decodes to `5634a3ae032fe03cb402`; it is not this value. The archived Stage10 form's `onion` field is for the participant's own hidden-service address, not the invitation token. The Cicada signing key's full fingerprint is `6D854CD7933322A601C3286D181F01E57A35090F` (key ID `7A35090F`), which does not match the decoded bytes. The decoded-byte SHA-256 and token-ASCII SHA-256 (`5ec3779cefbe948ee9d0c40542b3cf27c7bb49d3fb0dd4a39265cfd4a763a7d8`) have no exact matches in the repository search or preserved archive manifest; the decoded 12-byte value also does not occur in the three stored OutGuess share hex streams.

**Decision for #285:** close the canonical-binary-identifier hypothesis. The permissive decode merely concatenates the already-known 10-byte Stage04 onion identifier with bytes derived from the incomplete textual suffix. It supplies no new key, Stage10 field value, Stage11 identifier, or LP2 operation. Do not explore alternative Base32 alphabets, truncations, pad-bit extraction, KDFs, or arbitrary splits.


**Decision:** the current authentic/historical clues explain the 2014 payloads and their combination *within their own stage*, but do not select an LP2 page, byte-to-rune operation, clock or reuse of these bytes. This is the independent selector required by Director Issue #263. As it is missing, stop before any newly tuned combination or offset attack. The already completed 2,329,824-setting LP2 pad test below has no recovered plaintext and is exploratory exclusion only. Reopen this source route if an independently authenticated, specific cross-stage instruction fixes a key derivation and original LP2 input. Distinguish absence of a documented selector in the checked sources from proof none was ever intended.

## LP2 experiment

For a given rune page C and one of seven candidate byte streams (three individual streams, three pairwise XORs and the signed-message XOR), try:

- Forward and reversed byte order;
- Byte-to-GP conversion `b % 29` or `floor(29*b/256)`;
- Both additive signs `C_i = (P_i +/- K_(offset+i)) mod 29`;
- Every byte-aligned start offset that accommodates the whole page.

The English-register score is the mean GP unigram log probability trained solely on the two **already-solved** LP2 pages 56 and 57; page 56 is independently decrypted via the verified prime-totient method and literal-F at ciphertext position 56. This is a coarse first-pass rejection gate, susceptible to overfitting after searching tens of thousands of settings.

| Unsolved LP2 page | Runes | Settings tried | Best log fit / rune | Best byte source |
|---:|---:|---:|---:|---|
| 0 | 262 | 40,880 | -3.54157 | share 2, forward scaled, sign -, offset 102 |
| 7 | 208 | 43,904 | -3.50277 | share 0 XOR share 2, reversed scaled, sign -, offset 674 |
| 23 | 213 | 43,624 | -3.49953 | share 0 XOR share 1, reversed mod29, sign +, offset 173 |
| 28 | 269 | 40,488 | -3.51892 | share 1 XOR share 2, reversed mod29, sign -, offset 95 |
| 42 | 272 | 40,320 | -3.55325 | share 0 XOR share 2, forward scaled, sign +, offset 708 |
| 53 | 179 | 45,528 | -3.48610 | share 0 XOR share 1, reversed scaled, sign +, offset 604 |
| 55 | 76 | 51,296 | -3.31234 | share 1, reversed scaled, sign -, offset 329 |

The full [55-page execution (run 42755619644)](https://github.com/FlareZ123/liber-primus/actions/runs/42755619644) tested **2,329,824** configurations across all rune-bearing unsolved LP2 pages. Top-scoring byte sources varied across pages: share0 won 5 pages, share1 10, share2 9, xor01 8, xor02 8, xor12 12, and xor012 3. The largest individual log score occurs at p49 (66 runes; -3.25586 per rune), then p55 (76 runes; -3.31234), then p51 (92 runes; -3.36003), consistent with short-page search overfit. The best-scoring candidates inspected in this study produce nonlinguistic GP transliteration. No common byte-stream/start model emerges, and the short page 55 offers many overfit opportunities. These scores are **not calibrated family-wise p-values**, so the result cannot exclude more complex ways of using the streams (e.g., word-aware reset, skip, re-encoding, another downstream cipher).

The program includes a positive planted p57 ciphertext under share 0 with known offset 37 and true additive sign; it requires the correct tuple to rank among its top three candidates. This is a basic detection check under the same unigram-fit family, not comprehensive power analysis.

## Reproduce

Executed regression: [successful GitHub Actions run 42755515932](https://github.com/FlareZ123/liber-primus/actions/runs/42755515932). This run executed the positive-control assertions, the signed-message XOR invariant, and all seven selected LP2 page scans without error.

Run the pure CommonJS [script](../sims/stego2014_lp2_probe.cjs) against the pinned local reference. Its default configuration tests the seven selected pages; `--all` tests every nonempty unsolved page. It prints source hashes, all settings counts, the top candidates and positive-control status as JSON. The successful complete 55-page run, including the positive planted control, is recorded above. A proposed actual key would need independently reproduced plaintext and a held-out page or passage with substantially stronger evidence.
