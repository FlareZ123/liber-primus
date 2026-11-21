# Original 133-bit red-event rank under AES-128 on the p49–51 table

**Agent30, 21 November 2026. Original-corpus bounded negative. No unknown-page plaintext or authentic key.**

## Source premise and test

The original ink inventory has 225 red rune events plus 31 thirteen-dot marks, giving 256 physically ordered binary events. Their zero-based lexicographic 31-of-256 rank has 133 bits. The archived 2014 Stage11 HTML title also reads 133. Both facts and the rank algorithm were already established in [the ink-rank study](lp2-red225-dot13-combinadic-base29-html133-gate.md). This new test asks whether the 133-bit rank is a plausible AES-128 key with five leftover metadata bits for the original 256-byte p49–51 numeral table.

**Weakest premise:** Neither the page, HTML, nor authenticated Cicada instructions select combinadic ranking, AES-128, a five-bit truncation, a zero nonce, or the table as an AES ciphertext. This is a deliberately narrow operational hypothesis. It does not warrant branching into arbitrary AES salts and IVs.

The source-exact [CommonJS SFT](../sims/lp2_red31_comb133_aes128_table_sft.cjs) independently builds the 256-event tape, checks its 31 original mark addresses and exact rank, checks the unchanged original base60 grid bytes, and asserts native AES encryption/decryption round trips on a separate 256-byte plaintext plant. It derives two basic 128-bit windows, testing each in ECB, zero-IV CBC, and zero-counter CTR. All six decodes are predetermined.

Source rank (133 bits): 6823208894503251143167281798760439560912, hex 140d363b907a72111231847f7886c13ad0.

Low 128 bits: 0d363b907a72111231847f7886c13ad0.

High 128 bits: a069b1dc83d39088918c23fbc43609d6.

| Key window | AES mode | Printable ASCII bytes /256 | Longest printable run |
|---|---|---:|---:|
| Low128 | ECB | 94 | 5 |
| Low128 | CBC, zero IV | 107 | 4 |
| Low128 | CTR, zero counter | 89 | 4 |
| High128 | ECB | 90 | 6 |
| High128 | CBC, zero IV | 100 | 6 |
| High128 | CTR, zero counter | 109 | 8 |

Printable means ASCII 32–126 or newline, carriage return, tab. No output contains an obvious contiguous byte-text payload. The maximum 109/256 printable bytes is 42.6%, and the longest printable run in any output is eight bytes. The executable flags a 180/256 printable result for inspection. The full six-way native Windows Node22 job passed: [CI run 44930915721](https://github.com/FlareZ123/liber-primus/actions/runs/44930915721).

## Decision

The literal two-window AES-128 use of the 133-bit rank fails to recover a readable table payload or any unknown LP2 plaintext. The AES coupling is unsupported and should be retired unless an independent creator-era instruction selects this typed use. The test does not exclude binary non-text formats, undocumented IVs, the unresolved base59 interpretation, or other operations. Those branches lack a first-party selector. Do not promote this to results/README.md.
