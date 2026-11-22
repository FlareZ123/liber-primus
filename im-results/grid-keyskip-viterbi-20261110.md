# LP2 base60-grid keyskip Viterbi probe

**Agent 6 · 2026-11-10 · experimental negative · no recovered LP2 plaintext**

## Cryptanalytic hypothesis

A 32-by-8 table of 256 two-character base60 values appears on LP2 pages 49–51 (numbering from zero, with rune-free p50). We preserve a typed transcription in `resources/liber-primus/base60-grid.json`, including both the two-character tokens and the row-major bytes. This is an independently existing public transcription, with possible case/visual ambiguity on individual tokens; do not treat the derived table as checked against every scan. The table's numerical values, scanned layout, and possible purpose were already noted in earlier external research.

A distinctive testable hypothesis couples the table to the ciphertext's unusually low consecutive-repeat rate:

- `K_j = byte[j mod 256] mod 29`.
- For each page, `C_i = P_i +/- K_j mod 29`, with independent page initial index and both table traversal directions tested.
- A tentative consumed key `K_j` can be *rejected*, forcing advancement to `K_(j+1)`, **only if** its use would make the current ciphertext symbol equal the preceding ciphertext symbol.
- At most two rejected keys per generated rune. Independent start position for each page.
- A Viterbi dynamic program retains the last consumed key position and advancing distance, scores resultant plaintext with an English Gematria Primus trigram model trained on `resources/control/shakespeare_first300k.txt`, and subtracts 3.5 log-score units per rejected key.

This is narrower than arbitrary deletion or key insertion: every nontrivial transition is justified by a reproducible ciphertext collision condition. It tests a specific self-avoiding generator model, not the full keyspace of arbitrary ciphers.

## Reproduction and observations

Code: `sims/grid_keyskip_viterbi.cjs`. Manual-only CI: `.github/workflows/grid-keyskip-manual.yml`. Successful fixed-seed execution: [run 42741241079](https://github.com/FlareZ123/liber-primus/actions/runs/42741241079), command `node sims/grid_keyskip_viterbi.cjs`; Node 22.

Positive planted model: a 179-rune excerpt of the solved English reference, enciphered with the actual grid key, the hidden initial position 2, random self-avoiding filtering under seed `0x3301ad42`, and 10 actual rejected keys. The inference recovers the true initial position 2 and 10 rejected keys, and gets **176/179 runes (98.32%)**. It demonstrates sensitivity to a known-key English plaintext generated under the specified mechanism and number of rejections. It is not a test of other cipher mechanisms.

Real LP2 corpus: 55 rune-bearing pages, 12,956 runes, 4 candidate orientations/signs per page and a 256-start Viterbi score for each. The highest-ranked decoded GP strings across all 55 pages lack readable English. Selected best per-rune log scores: page 55 **-4.86837**, p49 **-4.99084**, p51 **-5.12404**, p0 **-5.46485**, p20 **-5.55988**.

For pages 0, 20, 49 and 51, preserve the page ciphertext and shuffle the 256 table entries 40 times using fixed xorshift seed `0x56bd45e9`; rerun four orientations/signs and all offsets on each shuffled table, obtaining:

| Page | True-table best /rune | Shuffled-table mean | SD | Upper-tail Monte Carlo p |
| ---: | ---: | ---: | ---: | ---: |
| 0 | -5.46485 | -5.43567 | 0.06312 | 0.5854 |
| 20 | -5.55988 | -5.45101 | 0.05379 | 1.0000 |
| 49 | -4.99084 | -4.90140 | 0.13090 | 0.6585 |
| 51 | -5.12404 | -5.04744 | 0.10803 | 0.6585 |

These are **small exploratory null ensembles**, sufficient only to say the selected pages show no preference for the literal table order under the scored model. No correction across 55 pages is attempted and no claim of exclusion of alternative keys, plaintext genres, hidden key-order transformations, or other collision policies is made. Running the positive plant against other text/language distributions should be done before claiming broad power.

The run's first version (historical [run 42741015093](https://github.com/FlareZ123/liber-primus/actions/runs/42741015093)) planted zero skipped keys and trivially recovered every rune. The revised control forces a nonzero skip count and is the valid result above.

## Interpretation

**No recovered plaintext and no compelling support for this narrowly specified collision-skipping interpretation of the grid.** This experiment adds a reusable exact latent-state decoder and table representation for further structured-key hypotheses. If extending the investigation, prioritize constraints on the table interpretation or a stronger recovered-key candidate rather than unconstrained tweaks to the English scorer.
