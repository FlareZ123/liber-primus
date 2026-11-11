# Signed 2016 RSA-signature halves versus the original 256-cell LP2 table

**Result (Agent 42, 11 November 2026):** This direct source-locked byte-inversion test does not recover an unknown LP2 message, key or file. All 18 outputs are nonlinguistic. The standing project state is unchanged: 56 unresolved physical LP2 pages (55 with runes), and no unknown plaintext.

## Independently visible starting points

The signed 2016 tree JPEG is 563×569 pixels, equal to the Gematria Primus prime sums of the first row/column of the illustrated 11×11 LP2 physical p32 square. The same square's central 5×5 perimeter prime sum is **1,136**, the exact size of the previously verified 2016 clear-signed source `resources/historical/cicada2016-4gq25-outguess.asc` ([existing tree analysis](tree-prime-canvas-partition.md)). The ASCII armor contains a 543-byte OpenPGP signature packet whose terminal 512 bytes encode the RSA signature MPI. The independent LP2 p49–51 numeral table has exactly **256 tokens** arranged 32×8 ([source grid](../resources/liber-primus/lp2-grid-256.json)), so the signature naturally supplies two consecutive equal-width key candidates without selecting any bytes post hoc.

**Upstream premise:** a contemporaneous solver following the signed-image/p32 source relationship could examine the signature itself, as the 2016 message explicitly instructs OpenPGP verification. It is **not established** that Cicada intended the cryptographic signature bytes to be a one-time pad or that the table encodes ciphertext.

## Frozen reversible test

From the original verified 1,136-byte clear-signed file, base64-decode only its armored signature and take the last 512 octets. Form three 256-byte candidate pads: first half, last half, and XOR of the two halves, with no rotations, offsets, or hidden fitting. Decode the original printed numeral table under (1) the conventional radix60 interpretation and (2) the previously documented skip-lowercase-f radix59 interpretation. For each of the six original table/key pairings, invert three conventional reversible byte operations: XOR, subtract key modulo256, add key modulo256. Thus there are **18 fixed original-source outputs**.

The test's single executable reproducer is [`sims/signed2016_signature_half_grid_inverse_sft.cjs`](../sims/signed2016_signature_half_grid_inverse_sft.cjs). It asserts the authenticated source length, signature packet width, signature prefix, both table lengths, the complete output matrix, and a planted source-half XOR exact-recovery control.

## Original-input outcome

Among all 18 candidates the maximum number of printable ASCII characters (including CR/LF) is only **108 of 256**, achieved by subtracting the final signature half from the radix60 grid and also from the radix59 grid. The leading forty-byte visualizations are:

- Base60: `.2P....$l...+S..t...{...x.XO.\\KAt.V..`..`
- Base59: `..M....!k...'S..r...y...v.UO.[I?r.S.._..`

Neither contains sustained text; no candidate begins with an obvious OpenPGP, ZIP, PNG, PDF, GIF or bzip2 header. Across the complete set, printable counts range **88–108**, and maximum printable runs are **4–8** bytes. The XOR positive control with a planted English sentence exactly recovers its source text. These observations reject the specified simple signatures-as-pad operations, without saying anything about arbitrary cryptographic KDFs or password-derived transformations.

## Decision

The **2016-p32 source bridge remains a meaningful navigational hypothesis**, but the archived 2016 RSA signature does not directly unlock the 256-byte table by the three natural half-key combinations and three arithmetic operations. Do not expand this into an arbitrary shuffle/offset sweep. A future positive route needs an independent source instruction selecting a key derivation and a reproducible original-LP2 ciphertext inverse, preferably with a withheld page or word. No claim of full or partial unknown LP2 decryption follows here.
