# Original red-section headings as symmetric keys, numeric-grid columns as IVs

**Agent 38, 10 November 2026. Evidence class: exact original-rune original-source AES/ChaCha inverse, a strongly powered control, and a matched-grid negative. No recovered unknown LP2 plaintext, key or cryptographic mechanism.**

## Distinct clue-derived key interpretation

The original numeric LP2 page49–51 table presents 32×8 byte-valued cells. Previous source-rooted experiments treated its eight 32-byte columns as **symmetric keys** and the section's original red heading as the **nonce**. The roles of these artifacts are not independently established. This experiment evaluates the reverse interpretation without any fitted key bytes:

- Eight authentic red section titles are each hashed with **SHA-256 over their exact UTF-8 source rune strings** to obtain 32-byte section-specific AES-256/ChaCha20 **keys**. These title headings are the eight physically annotated same sections used in the previous tests.
- The original eight 32-byte grid columns instead supply candidate **nonces** by taking their first 16 bytes in original printed column order. An unknown one-to-one assignment of the eight nonces to eight text sections is optimized exactly over all 8! bijections.
- Test only the 16 previously implemented stream families: AES-256-CTR/ChaCha20, forward/reversed hashed-key bytes, keystream-byte remainder/scaled-to-29, and both GP additive directions. Every candidate is compared using the existing source-English GP trigram model and exact ciphertext-collision-driven single-skipped-key Viterbi. All eight original 300-rune body prefixes are unmodified and the corresponding original title key is **fixed to its own section**.

For each section/body and candidate nonce, recover one GP plaintext maximizing the same finite original-rune dynamic-programming likelihood as the previous real grid-key inverse; then maximize the sum using exactly the eight original IV columns. No original LP2 runes are fit as free key or nonce bytes.

## Recovered positive control and authentic original results

A fully independent GP-English text from the unused Shakespeare tail was encrypted using the **genuine original red-title-derived keys, genuine grid-column IVs**, secret nonce assignment `[6,2,4,0,1,7,5,3]`, and the actual AES-256-CTR remainder29/additive stream with 81% probability of consuming one extra key value when a tentative ciphertext symbol would repeat the previous emitted symbol. The exact same full 16-mode/8!-assignment search recovers the **correct algorithm, both byte mapping and key-direction settings, every section-to-nonce assignment**, and **2,399 of 2,400** correct source GP plaintext runes. Positive average log score: **−2.508522 nats/rune**. Correct skip counts are recovered in all eight sections.

The 2,400 original unsolved LP2 runes instead select AES-256-CTR, unreversed heading keys, scaled-to-29 reduction, additive sign +, optimized nonce assignment `[6,2,3,4,0,1,7,5]`, with a weak log score **−5.630151 nats/rune**, no legible original plaintext. The chosen mode/assignment are postselected parameters, **not** a recovered key. Independent 20 nulls shuffle all 32 bytes within each original grid column, rebuild all eight candidate 16-byte IVs, and rerun the entire original 16-mode/8!-assignment search on the unchanged ciphertext. **15/20** null searches score at least as well as the genuine grid IVs, empirical add-one upper-tail **16/21 = 0.761905**. Their best-score median is **−5.623131**, slightly above the genuine grid result; their minimum/maximum are **−5.659470/−5.603976**.

## Decision

This independent **red-heading-as-key / grid-column-as-nonce** interpretation has excellent planted original-source recovery and is unsupported by the unchanged LP2 ciphertext against matched alternative grid IVs. It supplies no plaintext or destination and does not falsify different key-derivation functions, unknown nonce conventions, non-English registers, missing source material or a wholly different cipher architecture. It substantially overlaps the narrower family of AES/ChaCha grid interpretations and should not be repeated without an independently motivated source rule.

**Source:** [`sims/red_title_key_grid_nonce_inverse.cjs`](../sims/red_title_key_grid_nonce_inverse.cjs). **Completed on original LP2:** [manually dispatched GitHub Actions run 42788488370](https://github.com/FlareZ123/liber-primus/actions/runs/42788488370). Both source inputs are frozen in the repository: original annotated titles and 256-byte base60-grid JSON.
