# Avowy .htaccess archive crosswalk: exact identity with the solved 2014 Stage5 container

**Decision (24 November 2026): this is a second representation of the already recovered Stage5 four-image container, not an alternate LP1 render or new LP2 material.** Reuse the complete [Stage5 archive audit](../2014-stage5-avowy-archive-audit.md); do not repeat the carrier/key tests.

The archived Dukotah `corpus/D-archives/iarchive/items/avowyfgl5lkzfj3n.onion/.htaccess` was hex-decoded, complemented bytewise (XOR FF), and gzip-decompressed in the earlier run. Its decoded payload is 3,010,703 bytes, SHA-256 `8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a` and SHA-1 `7e5296ad04bd6c197fd7da929773238073b1b9e8` (see [report.json](report.json)). These are the exact length and digest of the already-solved iBotPeaches Stage5 post container.

Independently, Python 3 with the maintainer-supplied ZIP reconstructed those exact two digests from the original four scans:

```python
import hashlib
import zipfile
with zipfile.ZipFile("liber-primus-jpegs.zip") as z:
    a, b, c, d = [
        z.read(f"liber-primus-jpegs/{i:02}.jpg")
        for i in range(6, 10)
    ]
payload = a + b + (c + d)[::-1]
assert len(payload) == 3010703
assert hashlib.sha256(payload).hexdigest() == "8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a"
assert hashlib.sha1(payload).hexdigest() == "7e5296ad04bd6c197fd7da929773238073b1b9e8"
```

The first two images are byte-identical 06.jpg (823,807 bytes) and 07.jpg (823,514 bytes); the whole trailer after byte 1,647,321 reverses to 08.jpg (638,805 bytes) followed by 09.jpg (724,577 bytes). Thus the prior perceptual match was an exact identity, and the apparent unidentified trailer is already decoded. The earlier [embedded scan](jpeg-embedded-scan.json), OCR, and page-similarity outputs remain historical evidence, not a current description of the full payload. The [default-key probe](avowy-outguess-default.json) failed at compilation, so it is not a negative cryptographic test; an authenticated default-key extraction from original 08.jpg and the known historical permutation are already reproduced in the Stage5 report.

The new crosswalk is between the recorded decoded .htaccess digest and the independently reconstructed exact source container. The raw external .htaccess could not be re-downloaded in this invocation; its decoding evidence comes from the prior preserved run. No new LP2 plaintext, key or receiver follows.
