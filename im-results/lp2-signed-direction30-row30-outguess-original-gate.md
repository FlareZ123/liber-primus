# Signed 2016 DIRECTION #30 → p50 row30: literal OutGuess password original-image test

**Agent 36, 22 November 2026. Classification: bounded original-input negative with a positive authentic historical OutGuess payload. No recovered LP2 plaintext, image payload, cipher key or continuation.**

## A concrete source-derived operation instead of a numerical key hunt

The authenticated 2016 Cicada clear-signed message includes the phrase **"their numbers are the direction"**. Its word `DIRECTION` is the **30th alphabetic word** when counting the actual first word `Hello`. This independently selects a manuscript numerical-table row under the *proposed* ordinal-to-row interpretation. Physical LP2 pp49–51 contain a printed 32×8 grid of two-character numerals. Row **30** (1-based) is exactly:

```text
1k 3s 3G 21 3w 0W 29 2r
```

Its eight canonical base60 byte values are `[106,234,196,121,238,32,129,173]`, sum **1229**, exactly the authentic GP-prime sum of the final six p57 PARABLE words `FIND THE DIVINITY WITHIN AND EMERGE` (28 printed runes). The separate [conditional numeral-matching analysis](../workplace/signed-direction30-p50-parable1229-checksum.md) explains this correspondence and its selection bias. The source does **not** say "use DIRECTION's word ordinal as a numeric-row selector", nor "interpret concatenated row tokens as a password"; both are explicit, falsifiable inferences.

OutGuess image steganography is a historically demonstrated Cicada-era operation. Before further inventing new GP29 arithmetical machinery, test the **literal sixteen printed characters** as **one exact password**, with no guessed salt, case changes, radix shuffles, word-derived derivatives, or second key family:

```text
1k3s3G213w0W292r
```

The test applies that **same unchanged password** to every original LP2 JPEG in the release, archive filenames `17.jpg` through `74.jpg` inclusive. The original content and image ordering remain untouched. No rune language model is involved. A successful extraction must produce a recognizably structured payload, with a plausible file magic, OpenPGP armor, or clearly readable long plaintext.

## First-party positive control and direct original-image outcome

The existing byte-exact `sims/outguess_extract.py` reproduces the historical OutGuess 0.4-style JPEG coefficient extraction. Prior to testing anything from LP2, it extracts an **actual Cicada PGP signed message** of **31,809 bytes** from original LP1 `resources/liber-primus/03.jpg` using the documented password `Default key`. The extracted bytes begin `-----BEGIN PGP SIGNED MESSAGE-----` and have SHA-256 `a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1`. This verifies the exact steganographic implementation against real historical original data; the unknown LP2 pages are never used as a positive plant.

The derived row30 password was applied once each to **all 58 first-party LP2 JPEGs**. The original-input result is:

| Extraction observation | Original outcome |
| --- | --- |
| Files attempted | **58/58**, `17.jpg`–`74.jpg` |
| Extractor superficially accepting an alleged payload header | **57/58** |
| Explicit extractor error | **`74.jpg`: "OutGuess iterator adapted to zero skip modulus"** |
| Successful survivor binary length | **identical 32,904 bytes** on every one of the 57 |
| First 32 surviving bytes | **identical** hex `8ca188804d02f5cc41485a86b8509ebe845d4612f2ea36b14ec73733c06c82a3` |
| Full SHA-256 hashes of 57 survivors | **57 distinct**, because later image-dependent bytes differ |
| Signature/magic identified | **0** |
| Plausible OpenPGP armored payloads | **0** |
| Long readable payloads with at least 80% printable bytes | **0** |
| Typical printable fraction | **0.38–0.39**, approximately random-byte behavior |

The seemingly successful headers have a **precise native-JPEG explanation**, independent of language scoring. The extractor's `header_is_source_forced()` proves that **every one of the 58 original LP2 JPEG coefficient bitmaps starts with 1,024 all-one eligible bits**. Every legal header iterator is confined to that span when reading the first 32 bits, so the raw encrypted header is **`ffffffff` under any candidate password**. Decrypting that source-forced constant with the trial password creates the same spurious decoded header, with nominal length32,904, in every source. All 57 surviving outputs also have **the same initial 32 bytes and length** while later image-dependent bytes vary. No accepted output has a file signature, plausible PGP format, or long human-readable text. This source-imposed accepted-header artifact is therefore **not** counted as successful steganography or recovered hidden key material. The remaining `74.jpg` does not even pass the extractor's iteration step. The hardening regression now asserts exactly these expected original-input outcomes so later invocations cannot reclassify the spurious accepts as real content.

The original pass was [GitHub Actions Windows-independent Ubuntu run #45017288885](https://github.com/FlareZ123/liber-primus/actions/runs/45017288885), **SUCCESS**, with native libjpeg development headers and original archive checkout. The strengthened byte/source-forced negative and authentic-source positive passed [final GitHub Actions run #45017737919](https://github.com/FlareZ123/liber-primus/actions/runs/45017737919), **SUCCESS**. [Earlier tightened run #45017580432](https://github.com/FlareZ123/liber-primus/actions/runs/45017580432) also passed. The [manual workflow](../.github/workflows/agent36-direction30-outguess-original.yml) is workflow-dispatch-only, with no per-commit cost.

## Meaning and next decision

This **rejects only the literal raw-token row30 password under the historical OutGuess coefficient decoder on the 58 archived LP2 JPEGs**. It does **not** falsify the row30 checksum itself, any actual hidden data in other media, an unseen separate password, an alternate image steganography method, or an encrypted binary payload with no visible header. It also does not establish that the original authors intended a DIRECTION→row30 connection.

The numerical source match alone remains too permissive for cryptanalysis. The operative research target remains a *creator-selected image/rune decoding command* or a historical response bearing a real usable key; more arbitrary edits to this password after failure would be unfounded. **No new authentic LP2 plaintext or final destination was recovered.**

**Exact read-only reproducer:** [`sims/lp2_direction30_outguess_original_sft.py`](../sims/lp2_direction30_outguess_original_sft.py), with the standard source-preserved historical extractor [`sims/outguess_extract.py`](../sims/outguess_extract.py) and original `resources/liber-primus/{03,17..74}.jpg`. The script includes the authentic original-page positive and the exact negative original-file assertions.
