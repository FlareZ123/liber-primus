# LP2 pp49–51 eight AES-256 keys with solved p56 printed SHA-512 as CTR IV

**Agent21, 13 November 2026. Evidence:** fully executed, source-fixed original-cipher negative with 32/32 genuine GP control plants. No new LP2 plaintext, source-authenticated key, or continuation endpoint recovered. [Successful manual-only Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43360810748) · [standalone source-exact SFT](../sims/lp2_p56_hashiv_grid_aes256_source_sft.cjs).

## Causal hypothesis and source inputs

Original LP2 pp49–51 carry a printed **32×8** base60 table, giving **eight physical 32-byte columns** as possible AES-256 keys. The alternate eight successive 32-byte chunks in printed row order give the other simple key layout. Original p56 explicitly asks for a page which hashes to a **128-hex-digit (512-bit)** digest, providing an independently printed, 64-byte SHA-512-sized value. In contrast to the preexisting [eight-key all-zero-IV trial](p50-eight-columns-aes256-original-gate.md), this original-input test checks whether using the **first or final 16 bytes of that exact printed digest as the AES-256-CTR IV** unlocks the eight text sections.

The weakest assumptions are that neither source directly instructs AES, tells the solver to use the hash as a nonce, nor pairs the eight table columns with the eight sections. This is therefore a complete bounded candidate, not a confirmed intended solve path.

The ciphertext is exactly the original **12,956** printed GP29 runes. Eight sections follow the original source marks, attaching the anomalous nine-rune p15 red interlude either to its preceding section or the following one. No key or word is inferred from a guessed plaintext. Two reversible register hypotheses transfer the resulting one-byte-per-rune AES stream: direct additive GP29 `C ± (K mod29)` and GP28 predecessor-excluding differential coding `(C−Cprev)` ranked through the original primitive generator 15. Both signs, both key tables and both fixed IV endpoints are tested:

`2 p15 attachments × 2 table key layouts × 2 hash-IV endpoints × 2 reversible GP registers × 2 signs = 32 full-corpus decodes`.

The code asserts the table's original SHA-256 fingerprint, that the printed hash matches the checked-in solved-page reference, the exact source boundaries, all AES-256 CTR GP-native native-text round trips, and original GP28 forward re-encryption. It uses Node.js built-in `crypto` with no fitted IV phase or keystream offset.

## Original results

The completed CI run reports:

| Register | Original source result |
| --- | --- |
| GP-native Shakespeare control, first 12,956 runes | Trigram log-score **−2.24588166** |
| Untouched original ciphertext | Trigram log-score **−6.29656948**, IoC **0.03447840** |
| Highest original candidate of all 32 | Trigram log-score **−6.25381285**, IoC **0.03446533** |
| 32 original candidate key/IV/rune models | All ciphertext-like; no readable full source section |
| Source-native plants | **32/32** pass exact decryption; every GP28 original cipher reencryption passes |

The best key combination is p15 red interlude attached to its preceding chapter, table keys from printed consecutive row-major 32-byte blocks, IV from the **final** 16 hash bytes, GP29 additive with positive sign. Its complete-window score remains approximately **4.01 nats/rune below the native GP control**, while it is indistinguishable in practical language quality from the unchanged ciphertext. The score difference from raw −6.29657 is model-selection noise over 32 candidates; do not attribute meaning to a few isolated plausible digraphs.

**Decision:** Source-fixed, phase-zero AES-256-CTR with the two obvious table key serializations and first/last SHA-512-IV endpoints **fails to recover full-corpus GP29 plaintext**, including the no-self-transition GP28 variant. This remains conditional on the chosen source pairing, AES mode and original GP registers. It says nothing about other keyed modes, missing historical key material or random pads.

No additional nonce/key shopping follows from these negative results. Recover a real original instruction specifying a consumer before extending this branch.
