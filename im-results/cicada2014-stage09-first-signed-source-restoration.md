# Recovered missing 2014 Stage09 first signed instruction: original four-image 3301

**Established historical source correction (12 November 2026, Agent24):** A preserved 2014 participant Stage09 README accidentally instructs extraction of `index.1.outguess` from **`index.4.jpg`**, reusing the fourth image. The archive's saved `index.1.outguess` is indeed byte-identical to `index.4.outguess`; its apparent first-image border digit was therefore **1**. Re-running the historical unkeyed OutGuess method on the *actual*, separately archived **`index.1.jpg`** recovers a new, valid **1,234-byte original Cicada-signed message** with border digit **3**. The four image-order borders are exactly **3, 3, 0, 1**, spelling **3301**. This restores one genuine original signed object and repairs the human-visible stage sequence. The new object repeats the same CGI upload directions as the other messages; there is no LP2 key, cipher or recovered unknown plaintext.

## Byte-exact original sources and independent check

- Archived historical source at frozen commit [krisyotam/cicada3301@76d3ee8, Stage09](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage09/).
- [Original Stage09 README](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage09/README.md) commands: the line producing `index.1.outguess` targets `index.4.jpg`; the line producing `index.4.outguess` targets `index.4.jpg` again. Their archived Git blobs are consequently identical: `4cff459f0d0d6abb4c1d8879591fd085e420877a`.
- The archived **`index.bin`** is the entire **4,240,957-byte** original first-release Liber Primus archive member **`resources/liber-primus/10.jpg`**, confirmed by full-file original Git blob SHA-1 `369ee0a0eb59b999a5f9c0574d306fb78fa0b9ec` and SHA-256 `12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376`. Its four consecutive JPEG streams, as printed in one book file, provide the four authentic OutGuess-signed numbered messages. This means the recovered complete `3301` sequence is embedded directly in the preserved LP1 original image bytes, independent of any later transcription.
- The *true* `index.1.jpg` bytes have length **754,662**, Git blob SHA-1 `bd270e45c58dfb6f0c50f9af60cf7104cf78e78e`, SHA-256 `07910a858c17314c72c1af0fda25f8a04e5a700a71e25661111fc7bcf87e5210`. They are **byte-identical to the initial complete JPEG in the original first-release Liber Primus scan `resources/liber-primus/10.jpg`**, before that archived scan's three separately known concatenated JPEG suffixes. The same Stage09 source image2, image3 and image4 match the complete original book archive scans `11.jpg`, `12.jpg`, `13.jpg` respectively.
- Restored and preserved [the complete previously missing PGP message](../resources/historical/cicada2014-stage09-first-jpeg-recovered.asc). It has **1,234 exact source-extracted ASCII bytes**, SHA-256 **`56467e78411358a236479a867a073de1a6fe9be2572e19759be1128968b3feeb`**. The stored file was checked byte-for-byte against the freshly recovered file in [passing manual CI run 43302911842](https://github.com/FlareZ123/liber-primus/actions/runs/43302911842).
- Four signatures, including the newly recovered one, were independently **GPG-verified** under the repository's original Cicada public key fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`. The first message's signature is distinct from the second, although their pre-signature clear-signed bodies are exactly identical (each has a **3** perimeter). The original first signature packet has creation date **19 January 2014** (OpenPGP v4 issuer key ID `181F01E57A35090F`), independently decoded from the preserved packet.

## Original image-order recovery

| Source JPEG | Original byte length | Extracted payload SHA-256 | 16-character border digit | Source comparison |
|---|---:|---|---|---|
| `index.1.jpg` | 754,662 | `56467e78411358a236479a867a073de1a6fe9be2572e19759be1128968b3feeb` | **3** | **New missing exact original message**, now persisted in `resources/historical/` |
| `index.2.jpg` | 712,733 | `6f2db751c9d6acd7f17c59679e4313632402a66e7295447781d0de5701894027` | **3** | byte-identical to archived `index.2.outguess` |
| `index.3.jpg` | 703,428 | `78581663e7a5ba77494d1840820098b122217edd13009661f1be2e497db88179` | **0** | byte-identical to archived `index.3.outguess` |
| `index.4.jpg` | 2,070,134 | `83835b0e148c1061d42693ea14a5035f54ad41fa45496b00b37311b8e96a2095` | **1** | byte-identical to archived `index.4.outguess` and erroneous `index.1.outguess` |

Each border digit is present on both the first and last fully printed lines of a signed seven-line ASCII frame. Reading exactly the four source files in their numbered order gives `3301`, consistent with the creator's already-known identifier; recovering a fifth arbitrary digit or searching other orderings is unnecessary. A preserved `1301` that arises from the duplicated archive extraction is incorrect as the actual first-image readout. This correction is **not** proof of a new cipher, and it is not a fresh independent key with which to decode unsolved LP2 pages.

## Exact typed-frame grammar and LP2 transfer gate (#2771)

The recovered Stage09 records have a particularly restrictive, independently readable format: a **7×16 ASCII-character rectangle**, with 42 perimeter characters carrying a single repeated decimal digit and a fixed 5×14 interior (70 positions). The interior contains the symmetric 3×3 values `10 12 10 / 12 14 12 / 10 12 10`; all other interior positions are spaces. This is a one-digit repetition record, not 42 independent key symbols (at most log₂10 ≈ 3.322 bits per record under the extrapolated decimal grammar). Only digits 0,1,3 are observed; no claim of a historically specified ten-value message alphabet follows.

Agent18, 25 November 2026: read the four preserved authentic signed files in source image order, locate the exact first 16-identical-digit line and read seven rows. All start at source line 13. The following strict parser returns the digit only if **every** character has the prescribed value:

```js
const interior = [
  '10    12    10', '              ', '12    14    12',
  '              ', '10    12    10'
];
function decode(rows) {
  if (rows.length !== 7 || rows.some(x => x.length !== 16)) return null;
  const d = rows[0][0];
  if (!/^[0-9]$/.test(d)) return null;
  const expected = [d.repeat(16), ...interior.map(x => d + x + d), d.repeat(16)];
  return rows.every((x, i) => x === expected[i]) ? d : null;
}
```

| Source in resources/historical/ | Git blob | Result |
|---|---|---|
| cicada2014-stage09-first-jpeg-recovered.asc | 0f24ac3146f6c91df23e211e8588f6e9b67b6dce | 3 |
| cicada2014-sixth-onion-11.jpg.asc | 2f825249d5d37555053abf3b07d2fe8fb1def56b | 3 |
| cicada2014-sixth-onion-12.jpg.asc | 7d883e03ece7823fbfcfe906461084c55ea1525b | 0 |
| cicada2014-sixth-onion-13.jpg.asc | 4cff459f0d0d6abb4c1d8879591fd085e420877a | 1 |

For each authentic frame mutate each of its 112 cells individually to `9` (or `8` if already `9`). Executed in connected V8: all four originals parse to `3301`, **448/448 malformed single-cell records reject**. This is a deterministic format check using authentic control records; it does not independently authenticate or derive the four digits, and the mutation set is not every possible malformed record.

**LP2 gate:** direct visual review of the supplied original 58-page JPEG set shows no corresponding closed 7×16 character frame. The two conspicuous numerical layouts are the 4×4 spiral on p15 and the 32×8 two-character-cell table across p49–51. Repeating side ornaments do not give the 42-cell uniform perimeter and fixed 70-character interior. The prior [76/180 p50 partition](lp2-p50-76-perimeter-180-interior-source-partition.md) already tests circumference-derived numeric consumers and is not a match to this format. A changed rectangle, arbitrary rune-to-ASCII conversion, moving window, or regrouped paragraph would require an additional authored instruction. No target selected; **no original cipher experiment run**.

Other actual 2014 typed records already have scoped gates: [four-field book-coordinate constraints](lp2-historical-numeric-record-grammar-csp.md), [GEB TNT](lp2-geb-tnt-numbered-transport-gate.md), [direct binary OpenPGP](lp2-gp29-gp28-direct-openpgp-typed-packet-original-gate.md), [signed packet metadata](lp2-cicada-original-pgp-signature-subpacket-gate.md), [Stage08 member and daughter formats](cicada2014-stage08-bzip2-original-member-audit.md), [Stage10 CGI contract](cicada2014-onion6-cgi-acceptance-contract-gate.md), and [Stage11 release/operator boundary](cicada2014-stage10-to-stage11-original-operator-gate.md). None supplies a source-defined conversion to this frame or another new LP2 typed receiver. No repeated format sweep is warranted. The specific missing operand is a first-party instruction selecting an original unknown unit and its complete reversible record-to-rune serialization. A new original record with an independently matching local selector could reopen this route; absence of one here does not exclude all structured plaintext.

## Reproducible source test and future boundary

[Single-file Python source/hash/OutGuess/GPG SFT](../sims/cicada2014_stage09_missing_first_outguess_sft.py) downloads all four original Stage09 JPEGs and all four previously archived extracted messages at the fixed commit, checks exact Git blob hashes and lengths, confirms the erroneous archive duplication, then calls the **same unkeyed `outguess -r`** on the four *different* original images. Images2/3/4 are **independent full 1,234-byte positive controls** with byte-exact matching, after which image1 is newly extracted. The test checks the known 3/3/0/1 border reading, equality of first/second signed body, original complete restored message SHA-256 and its byte identity to the committed source, and independent GPG signature validity of all four under the authenticated Cicada key. OutGuess is built from pinned maintained commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`. Only manually dispatched [CI workflow](../.github/workflows/cicada2014-stage09-first-image-manual.yml) is used, without any per-commit trigger.

**Decision:** This is a **genuine, original-source 2014 signed-message recovery** and an independently reproducible restoration of intended source-order `3301`. It contributes to the historical player-visible solve path. No new 2014 instruction, LP2 original decoder, key derivation, unknown-page plaintext, final destination or executable continuation has been found: the restored first message repeats the already archived upload instructions and a border value already present in image2. Further cipher exploitation requires an independent original instruction indicating that this historical four-digit readout does more than identify Cicada 3301.
