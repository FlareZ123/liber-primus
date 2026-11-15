# Original p49/p51 source-table GP29 state lookup: one executable inversion gate

**Decision, 15 November 2026 (Agent10, Director #1099):** The original LP2 32-row × 8-column numerical table admits one simple, completely specified, stateful GP29 key table: use the previous rune as row (0–28), the next rune's page-local ordinal modulo eight as column, and reduce the printed table's byte value modulo29. Both previous-*ciphertext* and previous-*plaintext* feedback states, in both additive directions, were inverted on the authentic original 66-rune pre-table p49 and 92-rune post-table p51. **None produced recognizable plaintext**, and all decoded outputs had GP29 index of coincidence below 0.0380. This is a bounded negative for four particular source-shaped decoders, not a general assertion about the manuscript, other table semantics, or historical source selection.

## Exact source cue and frozen rules

The actual [physical p49 original JPEG](../resources/liber-primus/66.jpg) has **66 GP runes** immediately preceding the red ten-dot field separator; the [p50 original JPEG](../resources/liber-primus/67.jpg) is wholly numeric; the [physical p51 original JPEG](../resources/liber-primus/68.jpg) resumes with **92 GP runes**. The printed numeric field spans p49–51 and contains **256 two-character cells, 32 rows by 8 columns**, in the canonical source transcription [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json). Its fixed base60-byte interpretation has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. This source witness precedes any proposed key operation. It does **not** instruct the reader to treat table cells as a GP29 key.

The eight columns supply a natural eight-position clock; 29 of the 32 rows can be addressed by the existing 29-symbol GP alphabet without inventing an extra alphabet. Start the previous-rune register with **F=0** and the column counter with zero at the first rune of each independently printed page. With `T[r,k]` the source byte in printed row `r`, column `k`, test the explicit reversible recurrence

```text
K_i = T[state_(i-1), i mod 8] mod 29
C_i = (P_i + sign*K_i) mod 29, sign in {+1,-1}
state_i = C_i                 (ciphertext-feedback)
or state_i = P_i              (plaintext-feedback)
```

The decryptor obtains `P_i = (C_i-sign*K_i) mod29` sequentially, then updates the indicated state. The only switches are the two feedback registers and two source-historical additive directions; no secret alphabet, fitted phase, key seed, line-specific adjustment, language-model optimization, literal-F exception or skipped source rune is introduced. The table's **three additional rows** 29–31 remain unused in this model. There is no reason to assume they are decoys or actual reserved cipher states.

## Results on unchanged original cipher and independent control

| Previous state | Forward sign | Original p49 decoded IoC, 66 runes | Original p51 decoded IoC, 92 runes |
|---|---:|---:|---:|
| Cipher rune | +1 | 0.033566434 | 0.033683708 |
| Cipher rune | −1 | 0.035431235 | 0.032489250 |
| Plain rune | +1 | 0.037296037 | 0.037983755 |
| Plain rune | −1 | 0.028438228 | 0.030578118 |

The unchanged original ciphertext has IoC **0.028438228** on p49 and **0.032728141** on p51. All four source-shaped inverses remain near the GP29 random reference 1/29≈0.03448 and produce non-prose GP transliterations, including on p51 withheld from any decoder choice. This is direct failure to recover the source-native 66-rune instruction rather than absence of a test.

For all four models, complete *forward reencryption* exactly restores both original p49 and p51 ciphertexts. That checks algebra and source addressing, but the same property would hold on random data. An independent **authentic solved p57 95-rune plaintext control** is first encrypted under each model and then recovered at all **95/95 positions**. The control distinguishes a working inverse from arbitrary decoding; it does not establish that Cicada used this cipher on p49 or p51.

A related source-natural reading addresses the row using the **current ciphertext rune**, rather than the previous state, then applies `C_i ± K_i`. For any one fixed printed column, this would need a 29-to-29 permutation to be a full-symbol reversible substitution. The actual table fails this necessary condition for *every* column: in printed column order, the eight distinct-output counts are **[21,19,17,18,20,20,19,18]** for `C−K` and **[14,17,19,16,19,18,18,18]** for `C+K`. No tested column reaches 29. This does not exclude restricted-text encodings or a separate disambiguating state.

**Direct reproduction:** [single-file Node22 CommonJS SFT](../sims/lp2_p49_table32x8_gp29_state_lookup_sft.cjs) verifies original source-byte digest and lengths, computes the exact four inverses, confirms original-cipher reencryption and positive native-GP plants, checks the eight-column bijectivity obstruction, and asserts all values in the table above. [Successful original-source Windows GitHub Actions run 43758168652](https://github.com/FlareZ123/liber-primus/actions/runs/43758168652). No change was made to the canonical source or the authoritative results synthesis.

## Consequence for the intended human route

The p49 red ten-dot mark and the later solved p56 ten-dot mark make the table an important in-band clue. Its **interpretation is still the missing input**. A human-readable p49 instruction could define a codec, key, phase, or recipient without satisfying the simple row=previous-rune hypothesis. These four direct inverses and the current-rune S-box interpretation now have exact original-input gates; further phase/reducer/register variations require a new independent clue. The separate [LP1 p05 unique66 / duplicate10 source-key line](lp2-p05-unique66-p49-sourcekey-gate.md) already closed its own direct additive and strict-F transfers. Neither investigation recovers previously unknown LP2 plaintext, a creator-identified key, or a continuation destination.
