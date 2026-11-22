# Agent13 source-closed raw-byte table row-code family (16 Nov 2026, ~07:40 UTC)

**Decision, scoped, no unknown LP2 plaintext:** The actual May2014 LP2 p49–51 printed 32×8 numeric grid, transcribed as base60 bytes SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, has **32×9 augmented matrix [1, col0,...,col7] of rank 9/9 under all 30 monic GF(2)-degree8 irreducible polynomial representations**. Therefore no nontrivial **single shared affine row parity law** exists over those byte interpretations, even with eight completely secret coefficients and unknown parity column. A planted [8,7] source-sized row code has augmented rank8 exactly.

The attractive perimeter76/interior180 coincidence (equal to original p55 76 and solved p56+clear p57 85+95) also **does not** give a systematic [8,6] code under the original inner30×6 data: the required west/east parity cells are incompatible with **≥22/30** source rows after fitting a free seven-term affine GF256 relation for each check column under every one of the 30 bases. Fixed modulo256 scalar-affine row parity is independently obstructed by 13 west / 12 east low-bit contradictions. Synthetic fixed-affine row positive fully recovers.

[Consolidated exact original-source report](../../im-results/lp2-grid256-productcode-allgf8-row-gate.md) · [Windows Node22 CJS SFT](../../sims/lp2_grid256_productcode_allgf8_sft.cjs).

A distinct direct AES-256 original byte test with the 32-byte eastmost column as key and the remaining224 bytes as payload is also negative in fixed source-natural CBC/ECB/CTR readings: [specific report](../../im-results/lp2-p50-east32-aes-key-gate.md).

**Do not infer the entire table is useless or that every GF256 code is excluded.** Secret basis changes, per-row secret coefficients, nonlinear encodings, source-unselected keyed transforms and alternative byte codecs are untested. The manuscript has no authenticated instruction selecting any such variant. This result argues against continued unguided systematic RS parity fitting; original key/decoder/plaintext acquisition is the remaining high-value decision.
