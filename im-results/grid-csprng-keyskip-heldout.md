# Source-grid 256-bit AES/ChaCha20 collision-rejection inverse

**Agent 40, 2026-11-10. Bounded negative on original LP2 with source-true planted recovery.** No original LP2 plaintext, cipher key, or authorial key schedule recovered.

## Independently supplied cryptographic inputs

The original 32×8 numeric grid contains 256 literal byte values. Two fixed arrangements produce eight **32-byte** source keys: eight vertical columns and eight consecutive row-major 32-byte chunks. The canonical unsolved 55 pages have 12,956 GP rune indices. Apply the existing $-section segmentation into eight streams of exact lengths **[729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]**; the third segment includes the page-15 bridge at its end.

For each eight-key layout, use standard AES-256-CTR, AES-256-OFB, or ChaCha20 keystreams with one of three specified 16-byte IVs: all zero, 3301 little-endian at first four bytes, or 3301 big-endian at last four bytes. Consume 0 or 256 initial keystream bytes before reduction. Reduce remaining bytes by mod29, scaled [0,255]→[0,28], or rejection (discard bytes >=232 then reduce mod29). Test both additive signs. **216 total configurations**; 8! possible unique key-to-section placements optimized exactly for each setting.

A reversible collision-driven skip decoder allows at most two additional key draws for a rune, **only when rejected proposals would have repeated the preceding ciphertext rune**. It uses total extra drift at most 24 over each 256-rune block, GP-unigram probabilities from either the first 200,000 Shakespeare characters (English) or 203,357 GP runes of the independently supplied Vulgate Latin reference, and an extra-key log penalty 2.6. No free rune alphabet, guessed key bytes or plaintext crib is fitted.

Train on first 256 original runes per group; freeze cipher, layout, sign, reduction, IV, drop and all eight-key assignments. Test on the next 256 runes per group with skip states still fitted; the latter is an optimistic decoder rather than a strict free-running forward prediction.

## Executed measurements

Successful original-source [English-model CI 42789501386](https://github.com/FlareZ123/liber-primus/actions/runs/42789501386) and [Latin-model CI 42792312202](https://github.com/FlareZ123/liber-primus/actions/runs/42792312202), both 2026-11-10, Node22. The identical fixed key/cipher family was independently scored under both language registers. Implementation [sims/grid_csprng_keyskip_heldout.cjs](../sims/grid_csprng_keyskip_heldout.cjs).

| Evidence | Setting | Train mean log score/rune | Heldout mean |
|---|---|---:|---:|
| English synthetic AES-CTR plant | source grid columns, zero IV, rejection, no drop | **−3.044959** | **−3.267466** |
| English original winner | ChaCha20, row-major chunks, zero IV, mod29, no drop | **−3.926500** | **−4.110367** |
| Latin synthetic AES-CTR plant | source grid columns, zero IV, rejection, no drop | **−2.960838** | **−3.012645** |
| Latin original winner | AES-256-OFB, row-major chunks, fixed setting chosen on first256 | **−4.215455** | **−4.507648** |

The independent planted controls encrypted GP Shakespeare and GP Latin Vulgate heldout source material with the original table-derived AES-CTR stream and deterministic 81%-style collision rejection. For **both language registers**, the true algorithm and all eight source column placements ranked **first of 216** models. Heldout reconstruction matched **1,658 / 2,048 English GP runes (80.95703125%)** or **1,871 / 2,048 Latin GP runes (91.357421875%)**, despite hidden rejection states. The Latin positive uses a 2,400-rune independently sourced heldout excerpt cyclically across the eight 512-rune planting blocks, so it is independent of the Latin training source, with repeated subintervals across planted sections. Original LP2 has no credible language or key signal in either model. This remains a source-conditioned negative for the declared direct-grid-key family, rather than an exclusion of other possible source registers.

## Exact scope and next decision

Distinct from Agent32's red-heading KDF and field79-derived stream keys, Agent12's predecessor-exclusion rank28 model, and earlier grid-column MT19937/RC4 attacks. Does **not** exclude keyed KDFs, unknown IV, intermediate symbolic code, cipher-state dynamics, other word/page resets or different anti-repeat transducers.

A next experiment must derive reversible state from independently observed original source clues and decode unfitted LP2 ciphertext. Expanding guessed IV/dropped-byte lists is lower priority.
