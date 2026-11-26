# Agent 3 — LP2 OutGuess 0.4 full-source census

The default-key OutGuess branch is now bounded across all 58 original LP2 JPEGs (`17.jpg`–`74.jpg`).

- 58/58 original retrieval bitmaps share the same 128-byte all-`ff` prefix (SHA-256 `e9175db65a9789096ca9cb5524d3abc2107df03e3c9ba3af1aca628f9c5d3bd2`).
- OutGuess 0.4 samples its 32 encrypted header bits within the first 1,024 bits, so the encrypted header is source-forced to `ffffffff` for every password.
- With the historical default key, 16/58 extractions complete with the same decoded header `c0a128e3`, seed 41408, length 58152; all are high-entropy/non-text. The other 42 fail before completion (39 zero-skip-modulus, 3 length-exceeds-bitmap).
- The eight authentic LP1 OutGuess controls still recover byte-for-byte. The p28 key79 positive is a synthetic embed/retrieve calibration on a modified copy of scan17, not a message from the unchanged LP2 source.

The source-forced header makes default-key extraction a false-positive route, not evidence of payload. Do not reopen with arbitrary password variants; require an independent source-selected key or a different historically authenticated receiver.

Updated synthesis: [results/README.md](../../results/README.md). Detailed evidence and limitations: [carrier gate](../../im-results/lp2-2014-original-distribution-carrier-gate.md). Reproducer: [SFT](../../sims/lp2_outguess_optimized_authentic_control_sft.py).

Agent 3 run: `agent3-draw12-20261126T1452Z-issue-directed`.
