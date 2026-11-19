# p33 and the 2014 Stage10 order-7 / 1033 square: direct-key gate

**Decision: bounded negative.** The most direct use of the archived 7×7 / 1033 square as a GP29 key does not recover p33 plaintext. The target has an unusually clean structural fit, so the result is worth preserving; it does not establish that the square was intended as a p33 cipher key.

## Why this was a reasonable human-solver hypothesis

1. Original LP2 physical p33 carries the repeated cuneiform values conventionally read as **1033** and **3301**. Its transcription has 214 runes and two red spans at offsets 0–9 and 91–98.
2. The archived 2014 sixth-onion / Stage10 HTML labels one input **“Order 7 Square, 1033”**. The corresponding archived OpenPuff resource contains a 7×7 matrix whose rows, columns, and both principal diagonals sum to 1033. The HTML labels are outside the embedded PGP signature, and the extracted square is a participant/archive reconstruction, not a newly authenticated Cicada instruction. See [the form archive](../resources/external/cicada2014-onion6-magic-form-and-response.json), [the square resource](../resources/cicada2014-openpuff-magic-squares.txt), and [the source-boundary audit](3301-1033-source-operation-audit.md).
3. Removing only the two original red spans leaves p33's two text bodies of **81** and **115** runes: **196 = 4×49 = 28×7**. In the annotated unknown-page corpus, p33 is the only nonempty page whose non-rubric rune count is divisible by 49 (the runeless physical p50 is excluded).

A contemporary solver could therefore notice “1033” on p33, retrieve the 2014 order-7/1033 square, and try it against the only exact four-by-49-rune body in LP2. The missing premise is the operation: neither the original LP2 image nor the 2014 form specifies Hill encryption, modular addition, block orientation, or a key clock.

## Frozen input and key

The input is the original GP29 body only:

- upper body: p33 indices 10–90, 81 runes;
- lower body: p33 indices 99–213, 115 runes;
- combined body: 196 runes, treated as one continuous stream because only the combined length aligns to 7 and 49.

The key is the **second** matrix in `resources/cicada2014-openpuff-magic-squares.txt`, the archived order-7/1033 square. Reduce its entries modulo 29. Its determinant is **2 mod 29**, so it is invertible; the test is not defeated by a singular key.

## Results

The LP1 source-native GP29 trigram model scores each original body separately, without creating trigrams across the visual section boundary. Higher (less negative) is more language-like.

| Candidate | Mean log score |
| --- | ---: |
| Original p33 body | **−3.443976525** |
| Best one-dimensional Hill-7 variant | −3.401925323 |
| Best two-dimensional 7×7 matrix variant | −3.408949152 |
| Best repeated 49-cell additive-key variant | −3.403461826 |
| Solved LP2 p57 positive control | **−2.468144714** |

The tested families were deliberately small and source-shaped:

- **One-dimensional Hill-7:** (K), (K^{-1}), row-vector and column-vector conventions (four candidates).
- **Two-dimensional 7×7 action:** (KXK^T), (K^TXK), (K^{-1}XK^{-T}), and (K^{-T}XK^{-1}), applied to four consecutive 7×7 blocks (four candidates).
- **Repeated 49-cell additive key:** row-major or column-major serialization; values (v\bmod29) or ((v-1)\bmod29); addition or subtraction; continuous phase or reset at the upper/lower body boundary (16 candidates).

No output is coherent GP29 prose. The best score is only about 0.042 nats above the raw body and remains far below the solved-p57 reference. The best one-dimensional Hill-7 candidate is K with row-vector convention. The best 2D preview begins `RNGENGXIIBYOANGNIAWSDHYRSTFPCDBTHTHNDUECNGEOAETTTHLFNRXOEBHR`; it is not readable plaintext.

**Positive controls:** the exact matrix/inverse pairs recover planted 196-rune native-GP streams in both 1D orientations and both 2D orientations. All 16 additive-key/phase conventions also pass exact encrypt/decrypt round trips. The negative result is therefore not an implementation or invertibility failure.

## Decision and scope

Retire these direct uses of this particular 2014 order-7/1033 square on original p33:

- mod-29 Hill-7 with the square or its inverse;
- the natural two-dimensional 7×7 matrix action on four 49-rune blocks;
- a repeated 49-cell additive GP29 key under the tested row/column, residue-origin, sign, and section-phase conventions.

Do not rescue them with fitted rotations, arbitrary offsets, padding, extra key derivation, or additional cipher layers without a new original source selector. This does **not** exclude a different historical square, a different use of the 2014 artifacts, or another independently selected cipher architecture. It recovers **no unknown LP2 plaintext, key, or destination**.

## Reproduction

Run from repository root:

```sh
node sims/lp2_p33_stage10_order7_1033_square_key_gate_sft.cjs
```

The script reads the original corpus, ink annotations, archived square resource, and pinned LP1 native-language model; it asserts the page boundaries, unique 196-rune alignment, matrix determinant, exact round trips, and the reported language scores.
