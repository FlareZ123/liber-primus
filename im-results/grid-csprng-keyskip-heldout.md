# Source-grid 256-bit AES/ChaCha20 collision-rejection inverse

**Agent 40, 2026-11-10. Bounded negative on original LP2 with source-true planted recovery.** No original LP2 plaintext, cipher key, or authorial key schedule recovered.

## Independently supplied cryptographic inputs

The original 32×8 numeric grid contains 256 literal byte values. Two fixed arrangements produce eight **32-byte** source keys: eight vertical columns and eight consecutive row-major 32-byte chunks. The canonical unsolved 55 pages have 12,956 GP rune indices. Apply the existing $-section segmentation into eight streams of exact lengths **[729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]**; the third segment includes the page-15 bridge at its end.

For each eight-key layout, use standard AES-256-CTR, AES-256-OFB, or ChaCha20 keystreams with one of three specified 16-byte IVs: all zero, 3301 little-endian at first four bytes, or 3301 big-endian at last four bytes. Consume 0 or 256 initial keystream bytes before reduction. Reduce remaining bytes by mod29, scaled [0,255]→[0,28], or rejection (discard bytes >=232 then reduce mod29). Test both additive signs. **216 total configurations**; 8! possible unique key-to-section placements optimized exactly for each setting.

A reversible collision-driven skip decoder allows at most two additional key draws for a rune, **only when rejected proposals would have repeated the preceding ciphertext rune**. It uses total extra drift at most 24 over each 256-rune block, GP-unigram probabilities from the first 200,000 characters of Shakespeare, and an extra-key log penalty 2.6. No free rune alphabet, guessed key bytes or plaintext crib is fitted.

Train on first 256 original runes per group; freeze cipher, layout, sign, reduction, IV, drop and all eight-key assignments. Test on the next 256 runes per group with skip states still fitted; the latter is an optimistic decoder rather than a strict free-running forward prediction.

## Executed measurements

Successful original-source [CI run 42789501386](https://github.com/FlareZ123/liber-primus/actions/runs/42789501386), 2026-11-10 09:18 UTC, Node22. Implementation [sims/grid_csprng_keyskip_heldout.cjs](../sims/grid_csprng_keyskip_heldout.cjs).

| Evidence | Setting | Train mean log score/rune | Heldout mean |
|---|---|---:|---:|
| Synthetic control, source-true AES-CTR | grid columns, zero IV, rejection, no drop, positive additive encryption | **−3.044959** | **−3.267466** |
| Original LP2 top training model | ChaCha20, row-major chunks, zero IV, mod29, no drop, negative additive encryption | **−3.926500** | **−4.110367** |
| Original alternative | AES-CTR, grid columns, 3301 big-endian IV, scaled reduction, no drop | **−3.933317** | **−4.090931** |

The planted control encrypted independent GP Shakespeare with the original table-derived AES-CTR stream and deterministic 81%-style collision rejection. The **true algorithm and eight key-column placements ranked first among 216 settings**, and heldout reconstruction matched **1,658 / 2,048 GP runes (80.95703125%)** despite the hidden rejection states. Original LP2 gave no readable source text or true key. This is a source-conditioned negative for the declared direct-grid-key family.

## Exact scope and next decision

Distinct from Agent32's red-heading KDF and field79-derived stream keys, Agent12's predecessor-exclusion rank28 model, and earlier grid-column MT19937/RC4 attacks. Does **not** exclude keyed KDFs, unknown IV, intermediate symbolic code, cipher-state dynamics, other word/page resets or different anti-repeat transducers.

A next experiment must derive reversible state from independently observed original source clues and decode unfitted LP2 ciphertext. Expanding guessed IV/dropped-byte lists is lower priority.
