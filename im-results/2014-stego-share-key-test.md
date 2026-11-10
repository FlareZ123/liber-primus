# Historical 2014 stego-share key source tested against unsolved LP2

**Status:** a source-derived pad hypothesis with negative preliminary ciphertext evidence. No LP2 plaintext, key, or actual encryption mechanism recovered.

## Mechanism and source

Three original 2014 Cicada image payloads exposed as hexadecimal PGP-signed files were independently recovered via OutGuess in the historical record. The reference files `payload_00.txt`, `payload_01.txt` and `payload_02.txt` are stored in [pnotisdev's historical study](https://github.com/pnotisdev/cicada3301/tree/main/results/outguess). Each yields exactly **991 bytes** after removing PGP armor and hex-decoding the interior payload. XORing the three streams byte-for-byte yields a complete printable 991-byte signed message, beginning `-----BEGIN PGP SIGNED MESSAGE-----` and containing:

```
IDGTK UMLOO ARWOE RTHIS UTETL HUTIA TSLLO
UIMNI TELNJ 7TFYV OIUAU SNOCO 5JI4M EODZZ
```

The three-way XOR and subsequent 14-column transposition are **historical 2014 puzzle steps**, rather than newly recovered LP2 text. This study uses the three independent hidden bytestrings as a bounded, clue-supported source of potential cryptographic key material. Their exact hex bytes, original source URLs and derived-message invariant are preserved in [the stable derived reference](../resources/cicada2014-outguess-hex.json).

## LP2 experiment

For a given rune page C and one of seven candidate byte streams (three individual streams, three pairwise XORs and the signed-message XOR), try:

- Forward and reversed byte order;
- Byte-to-GP conversion `b % 29` or `floor(29*b/256)`;
- Both additive signs `C_i = (P_i +/- K_(offset+i)) mod 29`;
- Every byte-aligned start offset that accommodates the whole page.

The English-register score is the mean GP unigram log probability trained solely on the two **already-solved** LP2 pages 56 and 57; page 56 is independently decrypted via the verified prime-totient method and literal-F at ciphertext position 56. This is a coarse first-pass rejection gate, susceptible to overfitting after searching tens of thousands of settings.

| Unsolved LP2 page | Runes | Settings tried | Best log fit / rune | Best byte source |
|---:|---:|---:|---:|---|
| 0 | 262 | 40,880 | -3.52916 | share 2, forward scaled, sign -, offset 102 |
| 7 | 208 | 43,904 | -3.49143 | share 0 XOR share 2, reversed scaled, sign -, offset 674 |
| 23 | 213 | 43,624 | -3.48352 | share 0 XOR share 1, reversed mod29, sign +, offset 173 |
| 28 | 269 | 40,488 | -3.50370 | share 1 XOR share 2, reversed mod29, sign -, offset 95 |
| 42 | 272 | 40,320 | -3.52716 | share 0 XOR share 2, forward scaled, sign +, offset 708 |
| 53 | 179 | 45,528 | -3.47620 | share 0 XOR share 1, reversed scaled, sign +, offset 604 |
| 55 | 76 | 51,296 | -3.30265 | share 1, reversed scaled, sign -, offset 329 |

All seven selected pages produce nonlinguistic GP transliteration at their maximized scores. No common byte-stream/start model emerges, and the short page 55 offers many overfit opportunities. These scores are **not calibrated family-wise p-values**, so the result cannot exclude more complex ways of using the streams (e.g., word-aware reset, skip, re-encoding, another downstream cipher).

The program includes a positive planted p57 ciphertext under share 0 with known offset 37 and true additive sign; it requires the correct tuple to rank among its top three candidates. This is a basic detection check under the same unigram-fit family, not comprehensive power analysis.

## Reproduce

Executed regression: [successful GitHub Actions run 42755515932](https://github.com/FlareZ123/liber-primus/actions/runs/42755515932). This run executed the positive-control assertions, the signed-message XOR invariant, and all seven selected LP2 page scans without error.

Run the pure CommonJS [script](../sims/stego2014_lp2_probe.cjs) against the pinned local reference. Its default configuration tests the seven selected pages; `--all` tests every nonempty unsolved page. It prints source hashes, all settings counts, the top candidates and positive-control status as JSON. A proposed actual key would need independently reproduced plaintext and a held-out page or passage with substantially stronger evidence.
