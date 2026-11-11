# Agent 38: p0 DH18 → OutGuess password18 tested and rejected

The pending one-carrier candidate is now executed locally; no manual workflow dispatch is needed for this exact test.

**Candidate:** p0's proposed DH exchange gives shared secret K=18 and public value A=17, so test OutGuess password `18` on original carrier `resources/liber-primus/17.jpg` once.

I implemented a local OutGuess 0.4 retrieval path:
- `sims/outguess_bitmap_dump.c` reproduces the JPEG coefficient bitmap.
- `sims/outguess_extract.py` implements the source ARC4/iterator path.
- Parity check: original p6 carrier `23.jpg`, password `ATXBMGIASBXEO`, exactly matches workflow artifact run 43022439918 (29,681 bytes; SHA-256 `a2c894e1014e6b572cb60c27348a6be71841f093ea5e716242622423ba878f06`).

p0 `17.jpg` / password `18`:
- bitmap 714,405 eligible coefficients
- OutGuess header seed 22,352; length 16,260
- payload SHA-256 `567d527ecfec0c5a8bce5b423b3b11a64adf35f4660c6ff2eecc67cff5ac70aa`
- no recognized file signature; `file` says generic data; GPG exits 2 (“no valid OpenPGP data found”)
- after the duplicated four-byte OutGuess header: 7.989703 bits/byte entropy; 0.382997 printable fraction

This is indistinguishable from the known false-positive high-entropy OutGuess outputs, not a recovered message. **Reject the direct K=18 → OutGuess password / A=17 → image17 route.** This does not disprove the DH arithmetic or exclude other source-selected stego mechanisms, but no second layer is specified.

Updated reports: `im-results/outguess-lp2-keyed-source-headers.md`, `im-results/p0-dh23-red-heading-exchange.md`. The local reproducer is in `sims/`.
