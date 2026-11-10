# Cicada 2016 signed clue image: archival source record

**Classification:** archival copies and extracted signed-text reference; not an LP2 plaintext or key.

## Image

- Archived copy: https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg
- Independent mirror: https://github.com/scream314/cicada3301/blob/master/assets/2016/4gq25.jpg
- Both GitHub trees expose the same Git blob SHA: `22027296dcd7df53c5127e6aadbabeaf3223f72d` (26,342 bytes).
- A byte-exact local copy is preserved at `resources/historical/cicada2016-4gq25.jpg`; its blob SHA matches both external copies.
- JPEG structure: 563×569 pixels, 8-bit, three components; JFIF APP0 only. No EXIF APP1 or JPEG COM segment was present. The EOI marker is at byte offset 26,340, with zero trailing bytes.
- The raster shows the signed text over a faint leafless tree. The pixels do not establish the tree species or location.
- The header/metadata check does **not** test OutGuess's DCT-coefficient payload; that is a separate steganographic channel.

## Extracted OutGuess payload

- Archived extraction: https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg.outguess
- Git blob SHA: `a0d8bd2d73613e01cd8a2103d5721b2b998ee482` (1,136 bytes).
- A byte-exact copy is now preserved at `resources/historical/cicada2016-4gq25-outguess.asc`; its local Git blob SHA was checked against the external archive's blob SHA and matches exactly.
- The file is an ASCII OpenPGP clear-signed message with key ID `7A35090F`. The archive's `stage01/README.md` documents extraction with `outguess -r 4gq25.jpg 4gq25.jpg.outguess` and reports `seed: 230, len: 1136`. This invocation independently reconstructed the exact 1,136-byte file (Git blob SHA matches the archived blob), imported `resources/control/cicada-3301-public-key.asc`, and ran `gpg --verify`. GnuPG returned **Good signature** from “Cicada 3301 (845145127)” using RSA key `0x181F01E57A35090F`, fingerprint `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F`. GnuPG also reported `[unknown]` trust: this verifies the signature against the stored public key, not the key's real-world identity. Reproduction commands: `gpg --import resources/control/cicada-3301-public-key.asc` then `gpg --verify resources/historical/cicada2016-4gq25-outguess.asc`. OutGuess extraction itself was not independently rerun.

The following is a normalized human-readable transcription; use the `.asc` file above for byte-exact content and signature verification:

```text
Hello.

The path lies empty; epiphany seeks the devoted.

Liber Primus is the way.  Its words are the map.  Their
meaning is the road, and their numbers are the direction.

Seek and you will be found.

Good luck.

3301

Beware false paths.  Verify OpenPGP 7A35090F.
```

The explicit **“Beware false paths”** warning is important: semantic/geographic matches must be tested against alternatives and an independently fixed stopping rule. The signed text does not add an explicit A-road name, coordinate, cipher key, or LP2 plaintext.

This is a reference record for the archived copies. The blob SHA establishes that the two repository copies are byte-identical to each other, not that either archive independently authenticates the original publication.
