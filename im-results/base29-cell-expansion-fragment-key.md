# Signed 2013 BASE29 expansion of the p50 grid as 13-dot fragment keys

**Classification:** bounded, reproducible negative on a source-motivated direct-key hypothesis. No unknown LP2 plaintext, authentic key, or cipher mechanism recovered.

## Human-solve hypothesis

The signed 26 January 2013 TCP-server challenge authenticates an ordinary BASE29 numeral conversion and gives the worked example 3301 -> 3QO, whose digit values are [3,26,24]. Separately, the LP2 p49–51 numeric artifact is a 32×8 table of two-character base-60 tokens. Converting each cell to its integer value and then applying the historically attested BASE29 conversion is a simple cross-round operation that produces a sequence over the same 29-value range as Gematria Primus.

There is a second source-shaped correspondence: the 31 printed 13-dot marker layers partition the manuscript into 32 fragments, while the table has 32 rows. The p3 red triad gives the primitive field element \(u^2=3u+8\) over \(\mathbb F_{29}\). Its projective action, starting at the p39/p54 source value 24, gives a 30-state orbit. Assigning the black overprint at p7:194 to extra row 30 and the terminal fragment to row 31 yields a complete 32-fragment-to-grid-row permutation.

The fixed hypothesis tested was therefore:

1. Decode each printed base-60 cell to its integer.
2. Convert each cell separately to canonical, big-endian BASE29 digits, with no leading zero padding; interpret each digit value as a GP index.
3. For each of the first 28 (unsolved) fragments, use the BASE29-expanded digits of its mapped table row as a repeating additive key, resetting at the fragment boundary.
4. Also test the simpler whole-table alternative: concatenate all 256 cell expansions in printed row-major order and use the resulting key continuously.

Both additive directions were tested. No offset, alphabet permutation, alternate radix alphabet, fitted key, or language-model optimization was introduced.

This is a plausible route, not an established author instruction: the 2013 command authenticates the numeral conversion in [the signed-source record](../resources/external/2013-tcp-server-signed-source.md), but does not say to apply it to every p50 cell, use the result as a key, or reset at the 13-dot fragments. The p3 field and projective orbit are documented separately in [the GF(29) projective-cycle analysis](gf29-projective-singer-cycle.md).

## Original inputs and fixed mapping

- Numeric input: resources/liber-primus/base60-grid.json, 256 cells, 32×8; decoded-byte SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.
- Ciphertext: resources/liber-primus/lp2-corpus.json, pages 0–55, exactly 12,956 unknown runes.
- Fragment boundaries: 31 13-dot marker layers in resources/liber-primus/lp2-ink-annotations.json, giving 32 fragments; the first 28 fragments end exactly at unknown-rune offset 12,956.
- Projective row order, from the p3 generator orbit and the two special fragments:
  [24,25,21,10,14,9,20,30,18,28,4,26,29,0,22,27,8,6,17,12,16,5,1,2,19,3,11,13,15,23,7,31].
- The first fragment is the 13-rune p0 red heading. Its mapped key row is row 24; the row's canonical BASE29 expansion has 15 digits. The full row-major expansion has 490 digits; per-row expansions have 14–16 digits.

The source convention is internally checked: parsing all 256 printed base-60 tokens reproduces the stored byte values, and the signed 2013 example reproduces [3,26,24].

## Results on the original 12,956 runes

A GP-English trigram model trained on the first 100,000 runes of the independent Shakespeare control was used only as a fixed diagnostic; it did not select or fit any key. The same model scores the untouched 12,956-rune held-out English control at IoC 0.0598323 and −2.30601 trigram nats/rune.

| Original-input inverse | IoC | Top-12 rune mass | English trigram nats/rune |
|---|---:|---:|---:|
| Raw ciphertext | 0.03447840 | 0.429762 | −4.45015 |
| Fragment-row BASE29 key, decrypt C+K | 0.03445323 | 0.427833 | −4.45080 |
| Fragment-row BASE29 key, decrypt C−K | 0.03446900 | 0.431074 | −4.47163 |
| Global 490-digit BASE29 key, decrypt C+K | 0.03448633 | 0.431769 | −4.47424 |
| Global 490-digit BASE29 key, decrypt C−K | 0.03450287 | 0.433158 | −4.44661 |

The source-mapped first fragment does not yield a readable heading. Its 13 ciphertext runes transliterate as SHEOGMIAFSYENGC; the two fixed inverse directions yield SPEAHLOEFGBFBAD and SOHIANGTAEDPDMET. The global-key first-fragment readouts are likewise nonlinguistic (OEHAETHJEOREOEWYYN and HHJRUYNGBEOTITU).

All four exact inverses re-encrypt the original 12,956 runes. Independent held-out GP-English controls of the same length also round-trip exactly under both schedules and signs. This verifies the implementation, not the key hypothesis. The original outputs remain at the raw ciphertext's near-uniform distribution and far below the English control.

## Decision and scope

**Reject the tested direct BASE29-expanded additive-key route.** The source-authenticated numeral conversion, the 32×8 / 32-fragment correspondence, and the p3 projective row map do not, in this direct Vigenere construction, recover plaintext or even a readable first marked fragment.

This does not exclude BASE29 digits used in a different cipher, a different role for the grid, a non-additive state machine, or a separate source-derived key. Do not retune offsets, row orders, digit padding, or clocks against English output without an independent source instruction.

## Reproduction

Run node sims/base29_cell_expansion_fragment_key_sft.cjs from the repository root with Node.js 22. The script asserts the original grid-byte hash, all base-60 cell values, the 2013 3301 -> 3QO example, marker segmentation, projective orbit and row permutation; it performs both original inverses and exact held-out positive-control re-encryption.
