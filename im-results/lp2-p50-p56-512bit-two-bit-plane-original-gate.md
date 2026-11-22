# Printed p50 table → solved p56 512-bit digest: complete two-bit-lane gate

**Director #868, Agent1, 14 November 2026. Classification: source-constrained direct-transport negative.** The exact published LP2 pp49–51 32×8 table does **not** encode the p56 128-hex-character digest by selecting either natural table readout and one six-bit units-digit two-bit plane. No unknown LP2 plaintext, authentic key, external hash preimage, or decipherment is recovered.

## Why an original player might try it

The original manuscript prints **256 two-character numeric cells** across physical pp49–51, and solved p56 exposes a **512-bit digest** with 128 hexadecimal characters. The 2:1 digest-bit/table-cell ratio admits a human-performable operation: read exactly two visible bits per cell. Printed row-major order is independently fixed by the table layout. Clockwise nested rectangular shells are motivated by the visible 32×8 geometry (shell lengths **76/68/60/52**) and p57's independently solved instruction to *shed our own circumferences*. These are clue-conditioned candidate readings, and source authorship of the digest operation remains unestablished.

The competing explanation is that the digest describes an unidentified external deep-web page and has no bitwise relationship to this table. The manuscript supplies no authentic direction to extract a particular bit plane.

## Frozen, complete model family

Use all **256 unmodified printed cells** from `resources/liber-primus/base60-grid.json`. Interpret each two-character token in either of two documented lossless numeric alphabets:

- **Base60**, printed digit order `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`.
- **Base59**, the same order with the unobserved lowercase `f` removed.

For each codec, take the **six-bit units digit** (the low digit 0–59 or 0–58, respectively). Extract exactly one of its three *disjoint* two-bit planes: bits 0–1, 2–3, or 4–5, least significant bit numbered zero. Within each pair, serialize the **higher bit first**, matching the conventional big-endian hexadecimal bit representation of the independently solved p56 digest.

Read the original cells in one of two orderings: physical printed row-major, or top-left clockwise shells moving inward. Permit reversing the entire chosen order as a p57 *circumferences* sensitivity. These fixed source choices are **2 radices × 3 planes × 2 orders × 2 directions = 24 models**; there is no fitted key, offset, unknown mask, target-aligned rotation, arbitrary bit permutation, cipher-text scoring, or additional source editing.

The source-exact target is the established p56 `AN END` 512-bit hex string:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

## Original-input result and positive controls

All 24 models recover **512 bits**, and **0/24** reproduce the full digest. The best partial agreement is **272/512 bits**, leaving **240 incorrect bits**, under clockwise shells read completely backward, base60 and units-digit bits 4–5. Base59 has the same **272/512** best-agreement count in that orientation; the count alone does not mean its 512 extracted bits are identical to base60. Other candidates range from **234/512 to 272/512** agreeing bits; the entire specified range is near the random-independent-bit expectation of 256 matching bits, without implying an independently calibrated p-value.

Every one of the 24 extraction models has a **full source-shaped 256-cell synthetic positive control**: encode the exact 512 target bits into its selected units-digit plane using legal printed-width tokens, place them into the same source geometry, then recover **512/512** bits using precisely the specified extraction. Thus the original negative is not a serialization, directional, or decoder implementation failure. The model-by-model bit counts, first 16 mismatch offsets, source assertions and positive controls are emitted by the executable.

**Runnable source-exact Node22 SFT:** [`sims/lp2_p50_digest512_two_bit_plane_original_sft.cjs`](../sims/lp2_p50_digest512_two_bit_plane_original_sft.cjs); [passing manual Windows CI run 43587594465](https://github.com/FlareZ123/liber-primus/actions/runs/43587594465). It pins all 256 standard base60 byte hashes, source dimensions, solved p56 rune count, the exact 512-bit digest, all four clockwise shell lengths and 24 planted recovery tests.

## Decision

**Retire exactly this human-motivated, fixed two-bit-units-digit readout.** An actual p56 hash preimage would require independently attributable external source bytes or a genuinely new author-selected bit/byte operation. Other encodings using the high base60 digit, noncontiguous bit interleaving, keyed transforms, image-level steganography or independent web-page content are outside this gate; their formal possibility is not a reason to expand the model without a new clue. The 256-cell/512-bit numerical match by itself does not identify a hidden source-authenticated message.
