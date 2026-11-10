# 13-dot fragments × 32 source-grid rows: direct DES/3DES binary inversion

**Classification: source-constrained, finite original-input negative, 10 November 2026.** The unknown LP2 plaintext, authentic key, encryption mechanism and destination remain unrecovered. This result tests one motivated 64-bit-block-cipher interpretation of the source, while preserving a complete exact reversible reproducer and a native-readable positive.

## Human-visible clue and proposed operation

The original LP2 images contain **31** large thirteen-dot marks, dividing the complete 58-page rune stream into **32** fragments. The original number table on physical pages 49–51 has **32 rows of eight base-60-decoded bytes**. The matching 32 counts allow a specific source-to-source alignment: each fragment is one base29 numerical ciphertext block, and its corresponding eight-byte grid row is a conventional **64-bit DES key**. This has independent structural motivation from the source's punctuation and printed dimensions. The source does **not** spell out DES, assign which fragment to which row, or state a binary serialization. These are hypotheses.

The frozen test uses original source order, row 0 for the first fragment, and exact big-endian base29 integer conversion for each fragment separately. Each integer is serialized to its minimum byte width able to represent all 29^L possible L-rune strings; no rune is deleted and zero lengths produce zero bytes. Original fragments 0–27 cover **all 12,956 unresolved runes**, encoding **7,879 binary bytes**. Fragments 28–31 contain only the solved p56/p57 controls and are not used for fitting. The two observed empty fragments are retained as empty blocks.

Four strictly specified byte-level stream inverses are tested:

1. DES-CTR with an eight-byte key from the matching row, big-endian 64-bit zero counter.
2. Same DES-CTR, but initial counter equals the matching printed row's 64-bit big-endian byte value.
3. 3DES-EDE-CTR with the matching row and its next two neighboring rows concatenated as a 24-byte key, zero counter.
4. Same 3DES key, matching row's 64-bit big-endian counter.

The three-times-repeated DES key in 3DES-EDE equals ordinary single DES exactly; Node/OpenSSL implements this through `des-ede3` ECB encryption of successive counter blocks, with XOR emission. The 3DES source key cycles rows modulo32. Counters increment in the standard 64-bit modular register. All directions are frozen rather than selected from the original text.

## Original-cipher results

| Source-fixed interpretation | Entropy (bits/byte) | Printable ASCII fraction | Longest printable run |
| --- | ---: | ---: | ---: |
| DES-CTR / zero counter | **7.97578015** | **0.374540** | **7** |
| DES-CTR / row-byte counter | **7.97349316** | **0.375809** | **8** |
| 3DES-CTR / zero counter | **7.97936324** | **0.388628** | **7** |
| 3DES-CTR / row-byte counter | **7.97840080** | **0.374032** | **10** |

The four original outputs have letter fractions **0.20003, 0.19419, 0.20168 and 0.20142** respectively. The original high-entropy binary register's four candidate DES inverses show no readable plaintext or standard direct ASCII behavior. This does not reject a compressed or encrypted binary plaintext, another original cipher, keyed framing, alternative row alignment, or an additional decoding stage.

**Lossless source control:** For every original fragment, the program converts its full 29-symbol runic integer to the minimum-width bytes and then back to exactly the original rune sequence. Each DES-family inverse is involutory under the same source row and counter and exactly reencrypts the original **12,956/12,956 GP symbols**. This confirms the mathematical interface but does **not** select the correct historical key: any wrong DES key also round-trips its own output.

**Readable secret-plaintext plant:** Each of the four frozen variants is separately applied to **7,879 bytes** of precommitted uppercase English ASCII filler under its own true source keys. The first plaintext byte of each nonempty fragment is adjusted solely to ensure the binary ciphertext fits the authentic fragment's base29 capacity; the remaining plaintext bytes are untouched. This ensures fully representable, independently encrypted binary blocks with all original fragment lengths, including both zero-length segments. The forward ciphertext is encoded as L original-shaped runes, then decoded blind from the source rows and recovered **12,956/12,956 runes and 7,879/7,879 bytes exactly**. Four reconstructed planted registers have printable fractions **0.99746–0.99797** and entropy **3.903–3.905 bits/byte**, unlike the original.

## Decision

The 31-mark/32-row correspondence remains a source-visible motivation for **32 independently keyed fragments**, but these four direct DES/3DES-CTR original-source interpretations do not decrypt anything. Do not repeat these modes without a new original instruction that fixes another key, carrier, framing or cipher. The implementation is a finite binary inversion test, not a claim that Cicada used DES.

**Reproducer:** [`sims/des_row13_fragment_inverse.cjs`](../sims/des_row13_fragment_inverse.cjs), Node 22 built-in `crypto` and original repository sources. **Successful manually dispatched original/plant CI:** [run 42902896211](https://github.com/FlareZ123/liber-primus/actions/runs/42902896211). No per-commit workflow is involved; [manual runner](../.github/workflows/agent5-des13-manual.yml).
