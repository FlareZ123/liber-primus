# Original 13-dot interval × p50 eight-byte row RC4 inverse

**Status: bounded original-input negative (Agent12, 16 November 2026).** No previously unknown LP2 plaintext, creator-specified key, full decipherment, or final destination was recovered.

## Original source selector and frozen reversible receiver

Original LP2 p0–p57 has 13,136 GP29 runes and 31 large **13-dot** marks in the canonical ink annotations. In source reading order those markers create 32 intervals, including two zero-length intervals. The first 28 intervals exactly cover the unsolved 12,956 runes of p0–p55. Separately, original pp49–51 supply a 32×8 numeric table whose existing, provisional base60 conversion produces 32 eight-byte rows. Each interval can therefore be associated with exactly one row without fitting offsets or boundaries. This is different from counting the 31 chapter punctuation marks, which include three 10-dot marks.

A source-visible count correspondence permits a short executable hypothesis: use each original eight-byte row as the *complete independent RC4 key* for that interval, KSA and PRGA starting anew at its first rune, without salt, output discard, secret phase, row reversal, or hidden reset. Four reversible readouts are fixed before scoring: direct additive GP29; ciphertext-predecessor feedback GP29; and both variants on non-F GP28 with literal F transparent and nonconsuming as in authentic p56. The feedback state begins at zero in each interval and otherwise equals the previous active ciphertext symbol. This distinguishes the experiment from the previous all-256-byte and ring RC4 keys, period-eight row keys, columnar transposition, and period-256 all-secret table-family tests.

**Source-selector weakness:** LP2 does not authenticate RC4 as its cipher or the base60-to-byte conversion as intended. The row/interval pairing is a clue-shaped hypothesis; even a successful synthetic inverse would not establish its authorship.

## Actual complete original-input outcome

Each score is a mean source-native GP29 four-gram log likelihood (natural logs per original rune), trained on the pinned Shakespeare control's first 150,000 characters. The other 150,000 characters supply 300 withheld 12,956-rune control windows, evaluated using the *same authentic interval lengths*.

| Original input / frozen decoder | GP29 index of coincidence | Source-native GP4 |
| --- | ---: | ---: |
| Unmodified 12,956-rune unknown ciphertext | **0.03447840** | **−14.19125840** |
| Row-key RC4 direct additive GP29 | 0.03450828 | −14.20023179 |
| Row-key RC4 ciphertext-feedback GP29 | 0.03448955 | −14.20197452 |
| Row-key RC4 direct GP28, literal F skip | 0.03446727 | −14.19871659 |
| Row-key RC4 feedback GP28, literal F skip | 0.03448368 | −14.19553366 |

Held-out native-GP English window scores ranged from **−11.06928533 to −10.68475663**, median **−10.79636312**. The best original decoding remains **3.12624833** natural-log units per rune below even the worst native English window; all four decoders are also slightly worse than unchanged ciphertext. None yields coherent complete sentences.

The same script verifies the standard RC4 **Key** known-answer stream `eb9f7781b734ca72a7`, encrypts and independently recovers **12,956/12,956** original-shape planted p57 GP runes under *each* model, and forward-reencrypts exactly **12,956/12,956** unmodified original rune symbols under each model. Re-encryption verifies implementation consistency only, since an arbitrary wrong bijective key round-trips by construction.

**Standalone read-only Windows/Node22 SFT:** [`sims/lp2_13dot_row8_rc4_original_sft.cjs`](../sims/lp2_13dot_row8_rc4_original_sft.cjs). Stable inputs: [LP2 GP29 corpus](../resources/liber-primus/lp2-corpus.json), [original ink annotation](../resources/liber-primus/lp2-ink-annotations.json), [base60 table](../resources/liber-primus/base60-grid.json) and the pinned Shakespeare text.

## Decision and remaining uncertainty

Retire the **exact** 32 original 13-dot intervals as independent row-eight-byte **RC4** keys with four fixed GP29/GP28 readouts. The table and marker correspondence alone supplies no historical cipher instruction and does not identify a genuine key. A different operation using these real 32×8 source dimensions remains possible if an independent original clue selects its receiver. Avoid unfixed RC4 drop, KDF, phase or output alphabet searches on this result.
