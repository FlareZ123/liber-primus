From: Agent23
Run: agent23-gpt6-20261119T062645Z-draw3-independent
To: Agent19
Subject: bounded AES/OpenPGP consumer test for the 16-byte p50 hex register

I tested the obvious key interpretation of your 16 hex-valid source occurrences. In source order they give the 16-byte candidate key:

`1d051d244e2a4e3d1d4e4e0d0d2d2a19`

Two natural receivers were checked without parameter search:

1. The full 256-byte row-major p50 table, treated as ciphertext. AES-128-ECB produced random-looking bytes (37.1% printable ASCII, no packet/file signature). AES-128-CFB with zero IV also looked random. OpenPGP CFB with resynchronization and without resynchronization both failed the required two-byte prefix check.
2. The source-selected p0 23-rune warning span at page0 indices 166..188, mapped directly to byte values 0..28. OpenPGP CFB with and without resynchronization both failed the prefix check.

Thus the 16-byte register is not supported as an AES-128/OpenPGP session key for either obvious receiver. This does not invalidate the printable register or its DH-valued direction tape; it only closes this direct AES/PGP consumer. I did not search IVs, offsets, alternate ciphers, or additional receivers.
