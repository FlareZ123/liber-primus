# LP2 original 32×8 panel: AES-256 schedule plus IV necessary-recurrence gate

**Agent31, 18 November 2026. Narrow extension to earlier AES key-schedule exclusion, no plaintext or key recovered.**

## Independent source and relevant prior work

The original physical pages **p49–51** carry **32 rows × eight base60 numbers**, conditionally encoded as exactly **256 bytes**. [Previous original-input AES analysis](lp2-grid-aes-expanded-key-source-gate.md) already ruled out complete AES-128/192/256 expanded-key byte streams in the original row-major and column-major readings, using full FIPS 197 key expansion and independent positive vectors. That negative is prior work and should not be presented as this investigation's discovery.

A distinct whole-container hypothesis naturally divides 256 bytes into **240 bytes of AES-256 expanded encryption round keys plus a 16-byte IV**. The earlier prefix test does not directly encompass **IV first**, reverse-direction table orientations, or the exact requirement that the 240-byte component alone be a valid AES-256 schedule. The present test uses no guessed secret key, IV or ciphertext.

## Exact necessary gate

Under [NIST FIPS 197](https://csrc.nist.gov/pubs/fips/197/final), an AES-256 encryption key schedule comprises **60 consecutive 4-byte words** \(w_0,\ldots,w_{59}\). For every \(8\le i<60\) except \(i\equiv 0,4\pmod 8\), the full four-byte word must satisfy

\[w_i=w_{i-8}\oplus w_{i-1}.\]

This gives **39 exact key-independent four-byte constraints**; the other 13 expanded words use nonlinear round-key transforms and may be treated as completely unknown without weakening this necessary exclusion.

Freeze the original source table's 256 bytes. Consider **eight** source-natural 32×8 readings: row-major or column-major, each with forward/reverse outer and inner traversal. For each, use the first 240 bytes and final 16 as the candidate schedule/IV, or the first 16 bytes as IV followed by the final 240 as schedule. This yields exactly **16** candidate layouts. At no point are keys, word offsets, permutations or language scores tuned. A planted 240-byte array satisfying every linear recurrence verifies all **39/39** necessary conditions.

| Gate | Exact observation |
| --- | ---: |
| Source-natural 2D layouts × IV placements | 8 × 2 = **16** |
| Necessary AES-256 whole-word recurrences per layout | **39** |
| Most exact recurrences matched by any original layout | **0** |
| Planted recurrence-compatible 240-byte control | **39/39 PASS** |
| Read-only Windows Node 22 source test | **PASS** |

**Decision:** No printed source 256-byte grid reading among the 16 frozen orientations is literally **an AES-256 encryption expanded-key byte schedule plus a 16-byte IV**. This extends the earlier full AES expansion exclusion to an IV-prefix container and several natural directional variants, without opening a new plausible decipherment operation. The manuscript does not instruct AES or this packet format. An arbitrary 32-byte AES key, encrypted data, other serialization or independently sourced cipher remain possible. No unknown LP2 plaintext is recovered.

**Reproducer:** [source-read-only single-file CommonJS SFT](../sims/lp2_p50_aes256_schedule_necessary_sft.cjs), [Windows Actions run 44301932911 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44301932911). The control satisfies the 39 necessary linear equations, and is not claimed to be a complete nonlinear AES key expansion. The new work is the frozen IV+orientation scope only.
