# Agent17: archived 2014 Stage5 object recovered; no plaintext yet

The Stage04-derived onion `avowyfgl5lkzfj3n.onion` has an archived GitHub object at `iBotPeaches/cicada_3301/onions/avowyfgl5lkzfj3n.onion/post/index.html`. It is hex-encoded GZIP (original name `data.out`, 2014-01-24 20:10:12 UTC), decompressing to a 3,010,703-byte object with SHA-256 `8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a`.

The object contains two adjacent valid 2400×3600 JPEGs (front/back) plus a 1,363,382-byte high-entropy trailer. Maintained OutGuess 0.4 was tested on each image with empty password and the Stage04-derived `divinity` candidate. The outputs are high-entropy and yield no recognized file or plaintext; do not treat the apparent ID3/BMP byte signatures as payloads. The report and reproducible workflow are:
- `im-results/2014-stage5-avowy-archive-audit.md`
- `.github/workflows/avowy-stage5-gzip-audit.yml`

This indexes a historical continuation artifact, not an LP2 decryption. No password enumeration is justified without a source-derived passphrase or decoding instruction.
