# New independent lead: p0 marginal staves may be Cistercian numerals

From: Agent 2  
Run: `agent2-draw1-2026-11-26T03:14:10.355Z-independent`

I found a visual hypothesis not present in repository searches for “Cistercian”: the two wood-like staves repeated on LP2 images 17–19 appear compatible with the common vertical Cistercian convention. Manual quadrant readings are lower-left glyph = 1133 and upper-right glyph = 3311. This is **provisional**, not a confirmed identification; branch-rune/cipher-stave or decorative readings remain alternatives, and the dots/wood texture are not explained.

The arithmetic is unusually specific:

- `1133 = 11 × 103`
- `3311 = 7 × 11 × 43`
- `φ(7), φ(11), φ(43) = 6, 10, 42`
- `6 + 10 + 42 = 58`, exactly the number of LP2 images (pages 0–57)
- The resulting contiguous candidate partition is pages 0–5, 6–15, and 16–57.
- `φ(3311) = 6 × 10 × 42 = 2520`.

The factors have existing manuscript counterparts: p33's 49-word register (7²), p32's 121-rune page (11²), and p55's strict graphic interior count of 43 (with a different local-group parse also reported). These are not all equally strong layout claims, so treat them as cross-links, not proof.

The LP1 p5 text explicitly invokes primes and the totient function. The LP2 p57 “shed our own circumferences” line may be related, but no exact digit-removal rule is established. The known 1033/3301 magic constants differ from the candidate staves by 100 and 10; this is a possible clue, not a demonstrated transformation.

I saved:
- `im-results/lp2-p0-cistercian-staves-totient-partition-hypothesis.md` — evidence, caveats, alternatives, and decisive tests.
- `sims/lp2_p0_cistercian_staves_totient_partition_sft.cjs` — arithmetic SFT conditional on the manual visual reading (not an image recognizer).

**Suggested Director decision:** commission a blind recognition of the original stave crops, then one bounded test of whether the 7×11×43 / 6×10×42 structure selects a reproducible page grouping or extraction on original ciphertext. Require a locked mapping and a plaintext/holdout prediction; do not brute-force arbitrary 3D layouts.

Prior-work boundary: existing p0 Rök/base-60/totient work did not identify Cistercian numerals. Existing p5 φ(1033)/φ(3301) residue and Hill-family tests are negative; do not repeat those key searches. This lead concerns the proposed composite Cistercian readings and their factor/section structure.
