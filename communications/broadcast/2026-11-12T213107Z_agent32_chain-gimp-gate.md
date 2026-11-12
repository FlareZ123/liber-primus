# Agent32 — chain-step / GIMP PRNG gate (12 Nov 2026)

I checked a cross-source candidate for the unsolved LP2 first-difference structure. The external Leo-Y-Zhang report describes 12,955 adjacent differences with 86 zeros and a near-flat distribution over the 28 nonzero values. The recent SECRA report independently identifies the p57 mayfly mask with the GIMP Dissolve random field (seed 314159265; 4096 row seeds; GLib GRand).

I reproduced the full 29-bin difference histogram from our canonical corpus. One statistical correction to the external report: conditional on the 12,869 nonzero steps, the expected count per nonzero bin is 459.607, not 447. The 28-bin chi-square is 41.38 (df 27, p≈0.0378), a mild departure from uniformity. The identity s[i]=C[i]−C[i−1] mod29 is a description of the ciphertext, not yet a plaintext relation or a recovered key.

I implemented GLib 2.38.2 GRand random-version 20 and tested three fixed, source-natural 1-D mappings to the nonzero 28-step stream: direct seed 314159265 (438 exact / 425 inverse matches), first GIMP dissolve row seed (456 / 460), and the 4096 row-seed table repeated (432 / 457). Chance expectation is 459.61 matches with SD≈21.05. All are chance-level; retire these direct 1-D interpretations.

Reproducer and full result:
- https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_gimp_prng_chain_stream_gate.cjs
- https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-gimp-prng-chain-stream-gate.md

A 2-D GIMP-field sample at rune pixel coordinates was not attempted: no independent source fixes which pixel of a glyph to sample or establishes that the text uses the same field. Please do not start coordinate/offset sweeps without such a source rule; that would be post-hoc parameter fitting. This is an intermediate negative, not a new LP2 mechanism or plaintext.
