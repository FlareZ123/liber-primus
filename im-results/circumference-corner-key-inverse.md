# Solved PARABLE 'shed circumferences' as numeric-grid ring-corner source keys

**Agent 50, 10 November 2026. Reproducible bounded negative on original LP2 runes.** No actual unknown plaintext, recovered key or hidden destination.

## Source clue and falsifiable transform

LP2's solved PARABLE says **"we must shed our own circumferences"**. The unsolved page49–51 base60 table is literally 32 rows × 8 columns of bytes. Its nested rectangular perimeters have exactly **four rings**, each with **four corners**, providing **16 source bytes** as a natural AES-128 key. Independently, 256 bytes can be reshaped into 16×16, where **eight nested square perimeters** have **32 total corners**, providing a direct AES-256 or ChaCha20 key. The p15 4×4 Fibonacci-prime spiral supplies a separate internal reading-order precedent.

The [original full-book inverse](../sims/circumference_corner_key_inverse.cjs) extracts four corners per ring in TL/TR/BR/BL order. It tests original 32×8 geometry, row-major 16×16 and column-reordered 16×16, with inner-to-outer or outer-to-inner rings, clockwise or anticlockwise, and four corner phases. These **48 exact source-derived ring keys** produce direct AES-128, AES-256 or ChaCha20 CTR streams, using either the raw bytes or their SHA-256 hash as appropriate to key length. For each, there are both signs, two byte-to-rune reductions, page-reset/global stream clocks, 0/256 stream drops, and two separate original reversible cipher registers:

- Direct additive GP29: `P=(C±K) mod29`.
- Source-motivated zero-step EA codec: the first rune per physical page is GP29; all subsequent original ciphertext predecessor differences are logarithms base 15 in F29, with an independently keyed 28-symbol plaintext register, and exact repeats decode to EA.

This is **4,608 finite original-cipher settings**, with training on the first 28 physical rune pages and frozen untouched evaluation on the rest. Key derivation uses solely the printed grid, while all unknown ciphertext runes are unchanged.

## Original-data result

[Successful manual Actions run 42833962383](https://github.com/FlareZ123/liber-primus/actions/runs/42833962383), Node22. Source-original direct GP29 IoC is **0.034518807** on the training prefix and **0.034446363** on the continuation. The best source-derived model among all 4,608 reaches training GP28 non-EA IoC **0.035876045**, and when frozen on the untouched continuation it yields only **0.035748440**, essentially the uniform GP28 benchmark **1/28 ≈ 0.035714286**. The retrospectively highest original continuation IoC across the entire key family is just **0.035913570**. The top model is a ChaCha20 pad derived from clockwise/anticlockwise 16×16 corner traversals, with page reset and 256-byte drop, but the score remains random-like and no plaintext is legible.

The independently GP-encoded Shakespeare control uses the **actual source-derived 32×8 outside-in clockwise first-corner AES-128 key** in the 28-step base15 predecessor codec. The exact decryption and re-encryption recover **12,956/12,956 GP plaintext runes**, with unchanged source-English IoC **0.060239097** on training and **0.059526572** on heldout. This is an exact positive test of source-key and stateful-inverse functionality; it establishes no actual LP2 key.

## Consequence

The solved PARABLE's circumference language is a plausible independent reason to try ring peeling. Its **specific four-corners-per-ring as direct AES/ChaCha key** reading is unsupported by the unchanged original rune stream, even allowing an EA marker state machine and thousands of finite orientation options. The language may refer to symbolic, visual, or geometric transformations outside this key construction. Require independently recovered plaintext or downstream authenticated material before adopting any ring-corner interpretation as cryptographic fact.
