# Three original 2014 onion registers against LP2's 256-byte table and no-repeat cipher

**13 November 2026 · Agent35 · supporting negative, no recovered plaintext/key.** This study tests one previously uncombined historical-key family, not an authenticated LP2 instruction. The primary objective remains recovery of the 12,956 unknown LP2 runes. No original unknown-page plaintext is recovered here.

## Why this particular experiment

The 2014 Cicada chain exposed three separate 512-hex-character (256-byte) registers. Their archived HTML comment identifiers are **1033**, **761**, and **3301**. All three are preserved verbatim in [the historical source snapshot](../resources/external/2014-stage05-three-onion-hex-blocks.txt); the middle **761** register has an independent January 2014 staged-release and timing record in [the onion-2 source study](lp2-2014-onion2-256bytes-grid-source-gate.md). The same 2014 puzzle's LP2 physical pp49–51 present a **32×8 table of 256 base60-derived byte values**, preserved in [base60-grid.json](../resources/liber-primus/base60-grid.json).

A human solver could compare all three 2014 registers with the later table, and earlier Cicada stages used XOR and prime/number cues. The shared 256-byte size motivates a *small* direct gate. It does **not** establish that the streams are LP2 keys, that their XOR is meaningful, or that the editor intended this operation. Prior Agent16 tests cover the 761 stream independently; the new inputs here are the **1033 and 3301 full registers** and their source-ordered XOR combinations.

## Frozen, reversible tests

Use source order without byte shifts or arbitrary rotations. Let \(A,B,C\) be the 1033, 761, and 3301 bytes and \(T\) the printed table. Construct the **15** distinct nonzero XOR subsets of \(\{A,B,C,T\}\), including \(T\) itself. For each of the **14** subsets involving at least one onion stream, compute its direct XOR against \(T\). The resulting 256-byte strings contain **82–100** printable 7-bit ASCII bytes and no straightforward ASCII instruction or leading common file header. This is only a direct-message failure; arbitrary binary ciphertexts remain conceivable.

For each of the 15 keys, repeat its **256 source bytes** from the first original unsolved rune and test two additive signs:

* **GP29 direct:** \(P_i = C_i \pm (K_{i\bmod256}\bmod29)\pmod{29}\), all **12,956** original runes (30 decodes). The complete output index-of-coincidence range is **0.034451515917–0.034572043799**, versus **0.034478397865** for the original cipher.
* **Predecessor-exclusion rank:** On the **12,815** eligible within-page *unequal* adjacent-rune positions, decode two natural 28-symbol ranks: \((C_i-C_{i-1}-1)\bmod29\), and the ordinal of \(C_i\) among the 28 GP glyphs other than \(C_{i-1}\). Then apply \(\pm(K_{i\bmod256}\bmod28)\pmod{28}\), for **60** original decodes. All outputs remain nearly flat: IoC **0.035678117617–0.035763044724**, with the most frequent one of 28 outputs occurring only **485–525** times. The raw circular rank IoC is **0.035756248607**. The original contains 86 within-page adjacent repeats; these are not silently assigned a plaintext symbol.

The second test addresses the actual suppressed-adjacent-repeat feature, whereas an ordinary GP29 additive test cannot by itself model the predecessor exclusion. Both tests are **conditional direct decoders**. Neither one produces a distinctive source-native English alphabet profile, coherent original text, a complete rank-to-letter interpretation, or a source-selected key. A true inverse for an arbitrary longer key schedule or an unknown language is unaffected by this negative.

The reproducer generates a **256/256 exact synthetic positive** for the specified 28-successor cipher with one historical source-key combination. That proves the particular implementation can invert its own registered transition rule. It does not validate that Cicada used that rule.

## Decision

This source-led 256-byte **direct XOR / GP29 additive / mod28 successor-rank consumer** is now tested in full and yields no recoverable original text. Do not expand the same branch through unfitted offsets, rotations, extra XOR products, hashes or key generators without an original instruction choosing them. Other historical sources, steganographic payloads, stateful inverses or lost keys remain open.

**Reproducer:** [single runnable CJS test](../sims/lp2_2014_three_onion256_rank28_sft.cjs) (Node.js 22, read-only). Required source files: the archived three-string text, the printed base60-grid.json, and canonical lp2-corpus.json. The script asserts source labels and byte lengths, original rune/repeat counts, all 90 decodes, output bounds and the positive planted inverse before printing its decision data.
