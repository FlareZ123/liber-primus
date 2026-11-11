# Source-framed RC4 x GP28 predecessor-exclusion inverse

**Agent 38, 11 November 2026. Original-input, complete 64-mode negative with blind authentic-English recovery control.** No unknown Liber Primus plaintext, authentic key, reversible manuscript mechanism or destination recovered.

## Independent inputs and missing premise

The 31 original 13-dot marks divide the complete Liber Primus second release into **32 consecutive text fragments**; the first 28 contain the **12,956 still-encrypted GP runes**. The separate 32×8 printed numeral grid on pp49–51 contains 32 ordered rows of eight byte-representable base60 tokens. The manuscript does not instruct a solver to use these rows as cryptographic keys. The exact 32-to-32 geometry is nevertheless a bounded clue motivating one **source-ordered row key per text fragment**.

Two earlier tested branches did not cover the present composition:

- [Fragment-wise RC4](grid-rc4-field-source-inverse.md) applied source table row keys to the original GP29 **direct additive** register (both base59/60; negative).
- [Fragment-wise repeating-row keys](fragment-gridrow-vigenere-inverse.md) applied table bytes directly to GP29 additive or a reversible **GP28 predecessor-exclusion register** (negative).

This test combines the already historically attested RC4 primitive with the latter GP28 register, preserving the original rare doublets as one explicit reserved output symbol. The reason to prefer RC4 over another pseudorandom algorithm is still **hypothetical**. No key, word address or marker interpretation was inferred from candidate English output.

## Completely specified reversible original-cipher model

For each of the first 28 source fragments, take one of the eight-byte table rows as its RC4 KSA key and reset PRGA. Leave its first published ciphertext rune unchanged as a transmitted IV. For following glyphs, if two consecutive ciphertext runes are identical, decode the second to reserved GP EA (index28), otherwise calculate a GP28 rank from the 28 possible nonrepeating next glyphs. Both natural ranks are fixed before scoring:

- **Cyclic rank:** `(C[i] - C[i−1] − 1) mod29`.
- **Sorted rank:** `C[i] − [C[i]>C[i−1]]`.

Subtract or add a byte-derived RC4 pad modulo28. This is reversible with either rank; the EA special value reconstructs an exact immediate ciphertext repeat. The 64 complete models vary only: **two source row orders** (printed or the independently documented black-13-dot-anchored 5-bit de-Bruijn order), **two RC4 drops** (0/256), **two byte projections** (mod28/scaled28), **two ranks**, **two signs**, and **two key-consumption rules** (consume or skip an EA marker). No arbitrary RC4 offset, page clock, row permutation, guessed word or symbol assignment is fitted.

All 64 original models decode and exactly re-encode all 12,956 published runes. This checks computation, not authenticity.

## Original ciphertext versus genuine native-source plant

For each model, score the resulting GP indices by IoC separately over the first and second 6,478 runes. The original ciphertext has IoC **0.0344783978645**.

| Input | Selection | First half IoC | Withheld second-half IoC |
| --- | --- | ---: | ---: |
| Original LP2 ciphertext | Highest withheld among all 64 frozen models | 0.03532694094 | **0.03538418866** |
| Independently encrypted English GP control | Correct hidden configuration recovered as first of all 64 from training IoC | Native-text-like | **0.06088687818** |

The strongest original configuration is de-Bruijn row order, RC4 drop256, scaled28 projection, **sorted** predecessor rank, negative key sign, and marker-consuming key clock. Its opening is `SOEYTWCPSCIAMTXTHHDRAEINTHATNPEONGDOELTHANGNGAPBHYUTHSEOXGEOJPLGEOOEESJOEYYXNG`, without recognizable GP English. All original withheld IoCs lie between **0.03516802014** and **0.03538418866**.

The independent positive control uses a real GP-normalized 12,956-rune Shakespeare span from the tracked 300k reference. It is forward encrypted under the same table bytes with one hidden test configuration: de-Bruijn, drop256, scaled28, sorted rank, negative sign, EA-skip clock. The **unchanged 64-candidate inversion ranks that true model first** using only the first half, recovers exactly **12,956/12,956 original native-source runes**, and exactly re-encrypts its entire synthetic ciphertext. Its withheld IoC is 0.06088687818. The source-positive result is **artificial encryption of genuine prose**, not a manuscript decryption.

## Decision

**Retire this literal fragment-row-RC4 × GP28 source composition as a direct native-GP English decoder.** It has no authentic key or plaintext and fails well below the source-language control despite a known-good inversion. This result does not exclude another source-selected key derivation, a distinct symbol register, nonlinear stepping, or other original operations. The 32-to-32 framing remains observable, but its interpretation as an RC4 KSA key schedule is unsupported.

**Reproduce:** [standalone original-source CJS SFT](../sims/fragment_gridrow_rc4_rank28_sft.cjs) (Node22, no third-party dependencies), [successful manual-only Actions run 43081379199](https://github.com/FlareZ123/liber-primus/actions/runs/43081379199). Input exactly `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-ink-annotations.json`, `resources/liber-primus/base60-grid.json`, and `resources/control/shakespeare_first300k.txt`. Synthetic scorer and input values are fixed in the executable. This report does not revise the [authoritative unsolved-state synthesis](../results/README.md).
