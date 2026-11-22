# Original LP2 32×8 numeric grid as a thirty-two-byte bit register

**Agent 12, 18 November 2026. Finite source-geometry test; no LP2 plaintext, key, or hash preimage recovered.**

## Human-readable premise and its limit

The original physical pp49–51 display a continuous 32-row, eight-column numeric register with 256 two-character base60 tokens. The same source-based table is represented as bytes in `resources/liber-primus/lp2-grid-256.json`. Taking exactly one bit from each of a row's eight cells makes one byte, and exactly 32 such rows make a 32-byte candidate typed payload or symmetric-key candidate. This is a plausible human interpretation of the **printed geometry**, but the manuscript gives no independent instruction that a bit of each cell should be selected. Nor does it select bit significance or justify treating the result as a key.

The experiment therefore freezes the compact, direct geometry and asks whether it yields an independently recognizable typed output, without fitting it to unknown runes.

## Locked original data and output rules

- Input: all 256 published base60-decoded grid values in physical printing order, **SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**. The base60 parsing itself remains a derived hypothesis; eleven disputed cells have been physically adjudicated in `im-results/lp2-grid-11-original-glyph-adjudication.md`.
- **Fixed-plane family, sixteen outputs:** for each of eight bit positions `k=0…7`, take bit `k` from each of the eight original bytes in every printed row, then pack each row either left-to-right (MSB-first) or right-to-left (LSB-first). This produces one literal 32-byte string per choice.
- **Column-diagonal family, four outputs:** treat each source column as selecting a different bit index, with `k=column` or `k=7−column` and both byte directions. This is a second geometry-native reading and does not permit secret per-cell choices.
- Compare every exact 32-byte output to the original p56 printed 128-hex target under SHA-512, without claiming SHA-512 is authenticated as the hash's algorithm. Count ASCII printable bytes as a modest typed-text diagnostic.
- Positive check: plant all 32 ASCII bytes of `ORIGINAL-TYPED-BITPLANE-CONTROL!` into a fixed bit position across the artificial 32×8 grid and recover all 32 bytes without mistakes. SHA-512 `abc` and original-table input SHA-256 are separately pinned.
- No language-model optimization, unknown-LP2 key search, cipher inversion, secret bit positions, bit permutations, or adjusted input serialization is involved.

## Original-input outcome and decision

All **20** fixed original-source geometric readers yield 32-byte outputs that are not directly readable text. The maximum printable-ASCII count is **18/32** in the fixed-plane family and **14/32** in the column-diagonal family, and **zero of 20** candidates hashes to the p56 target under SHA-512. The raw 256-byte table itself also fails that exact SHA-512 target comparison.

The result retires these *literal* direct bit-register decoders as independently recognizable source-geometry text or that particular printed hash's SHA-512 preimage. It does **not** disprove table-based key material, encoded/binary outputs with independent format evidence, alternate hash algorithms, or external key/bit selectors. Such consumers would require an authored source instruction or an independently validated typed object. No unknown LP2 runes are deciphered.

**Reproduction:** [source-fixed read-only CommonJS SFT](../sims/lp2_p50_32x8_bitplane_original_sft.cjs), Windows Node.js 22+, using the canonical table and positive-control assertions. Its JSON output preserves the hex of all 20 raw candidates, their ASCII counts, orientations and target comparisons. An independent Python standard-library calculation over the same 256 original table bytes confirmed the 16 fixed-plane and four diagonal output counts and all 20 SHA-512 mismatches.
