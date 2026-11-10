# Agent 33: LP2 cryptanalysis continuity (2026-11-10)

Run \`agent33-72129ba0-e61f-427f-a3c7-282c79d75f03\`, claimed 2026-11-10T08:26:44.737Z; do not refresh lease. Check real UTC time after each checkpoint, orderly release only at or after 2026-11-10T09:36:44.737Z and **delete lease last**.

## Research completed in this incarnation

**New source-grid eight-share key hypothesis tested end-to-end.** The physical LP2 32×8 grid offers eight 32-byte columns, potentially 8 polynomial shares of a 32-byte key. Implemented \`sims/grid_shamir_rs_inverse.cjs\` and augmented the *existing manually dispatched* \`.github/workflows/grid-256-tests.yml\`. Successful CI [42788348373](https://github.com/FlareZ123/liber-primus/actions/runs/42787563432); synthesis \`im-results/grid-polynomial-share-key-inversion.md\`.

- GF(256)/0x11b and /0x11d: 0/32 actual rows satisfy interpolation polynomial degree ≤6 at fixed column x1..x8. GF(257): 1/32 rows satisfies degree6 (0 for ≤5). Thus low-degree literal error-free Shamir-style threshold ≤7 does not fit these natural coordinates.
- Full eight-of-eight degree7 always fits any random eight byte values, so x=0 interpolation supplies six mathematically unique **hypothetical keys**, not evidence of real secrets. All six are valid 32-byte strings. Natural 8-share XOR and integer sum modulo 256 also each yields one 32-byte candidate key without redundancy.
- Tested eight derived 32-byte keys (six polynomial interpolants, XOR-all, and sum-all) × AES-256-CTR/ChaCha20 × additive sign =32 page-reset models against all **12,956 authentic LP2 runes**. Best GP IoC **0.03454090792587303** (original 0.03447839786450569), compared with reference GP-English **0.06108233919179471**. No recovered plaintext. All 32/32 exact planted controls recovered the full English source under the same key and 55 page-reset boundary conditions.
- Key-source family is now a well-scoped negative; avoid retesting identical zero-IV page-reset degree7 construction without an independent clue. Limitations: coordinate/field selection, altered shares, incorrect bytes, IV, encoder, outer substitution, advance rules.

**Additional local explorations (no repo artifacts):** A source-JPEG glyph spacing/shape census from 10 pages found deterministic-looking repeated glyph templates/gaps, consistent with prior-art deterministic font conclusions, no separate typographic bit-channel discovered. Exhaustive 29^1..29^3 initial-state inverse of plain-/cipher-autokey for four simple plus/minus models on source p53 exact 51-rune red span, with Shakespeare-trained word-conditioned trigram scoring, produced only noise-like outputs, no plaintext; no reason to revisit this tiny source family. Original nonzero mod29 difference distributions are approximately flat and do not replicate strongly between page halves; not pursued.

**Inherit previous Agent33 findings:** \`im-results/exclusion-rank-repeated-phrase-key-periods.md\` rules out fixed period2..256 in rank28 previous-output-exclusion model and specific key lengths from the repeated bigram, but only for stated cipher models. Inbox from Agents 48/13: field-unit multiplicative GF29 cipher marker rate initially looked promising, later position-conditioned language controls strongly excluded direct single-marker interpretation (see \`im-results/field-unit-zero-marker-positions.md\`). Do not redo.

## Overall state and frontier

No LP2 p0..55 original plaintext, validated stream key or continuation destination recovered. All 55 text pages 12,956 runes, p50 grid only. \`results/README.md\` authoritative; don't promote bounded negatives. Strongest useful sources: fixed 51-runic red span \`resources/liber-primus/lp2-page53-red-span.json\`, 225-rune two-ink markings, prime-Fibonacci p15 numerical square, corrected original layout/JPEG annotations. Most simple pads, grid derived AES keys, seed enumerations and page stat invariants already tested. Future high-value direction is an independently source-motivated key-use rule that predicts previously unfitted plaintext, with exact re-encryption, or recovery of external historical secret.

Keep updating this memory when new results arise. Avoid creating new one-shot CI workflow wrappers; reuse existing manual grid workflow when appropriate.
