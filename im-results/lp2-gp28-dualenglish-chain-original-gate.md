# A dual-English GP28 chain cannot explain the original nonzero-step spectrum

**17 November 2026, Agent17. Decision: bounded original-cipher negative for a concrete new attempted decoder architecture, not a new solved page.** The experiment uses no trial original plaintext, password dictionary or cipher-key offset. It considers a two-layer cipher that *does* naturally produce the manuscript's extreme no-repeat pattern, then asks whether its surviving step frequencies permit two independent native-GP English registers.

## Why this model had a plausible path to decipherment

Original LP2 unknown pp0–55 contain **12,956 original GP29 rune indices**. Of their **12,901 within-page neighboring pairs**, only **86** repeat the previous rune. The **12,815 nonzero modular differences** populate the remaining 28 GP step values approximately uniformly. A known puzzle author might encode one plaintext GP rune plus one running-key GP rune as a **nonzero movement** around the 29-symbol circle, with one exceptional rune causing a stationary step. This is a reversible 28-state chain rather than a direct GP29 Vigenere cipher, so the previously established GP29 *independent-English additive running-key* anti-doublet obstruction does not apply.

The simplest source-orthographic register reserves **EA, GP index28**, as the exceptional plaintext rune and ranks the other 28 symbols in their authentic source GP ordering, indices0–27. A prospective additive two-English chain then uses, for non-EA plaintext symbol `P`, independently sourced key symbol `K`, and preceding ciphertext `Cprev`:

`C = Cprev + 1 + (a*(rank(P)+t*rank(K))+b mod28) mod29`

For plaintext **EA**, keep `C=Cprev`. Every `a` is a **unit modulo28** (12 choices), `t` may be any of 0–27 (28 choices), and `b` any of 0–27 (28 choices), allowing **9,408** specified parameter sets. For known `K`, the direct nonzero-step inverse uniquely recovers `rank(P)`, and a zero difference identifies EA. No key text is fitted here. The no-repeat property is exact by construction; the real question is whether any pair of ordinary language-register streams would produce the **observed flat nonzero-step histogram** before considering a costly two-English beam search.

This model remains an **analyst hypothesis**: Cicada never expressly chose an EA-reserved GP28 chain, or an unknown English running key. The test deliberately considers that model as a possible plaintext-producing route, not an authenticated instruction.

## Native-source marginal prediction and original result

For independent plaintext/key GP28 English streams, the exact expected 28-bin step distribution is their **cyclic probability convolution**, followed by an optional invertible affine output permutation above. Thus the expected nonzero-step frequencies can be computed from the native GP counts in each intact source reference without constructing or trying any key. Three repository-preserved English registers were encoded with source-attested longest GP tokenization, special **ING→NG** and **IO→IA** runes, and canonical Q/V/K/Z aliases: Shakespeare, Gibran and Emerson. The known LP1 spelling of THINGS and FUNCTION is checked. EA tokens are conditioned out for this explicit candidate; the real 86 zero-step sites are held as the potential reserved symbol.

For every choice of source reference for plaintext and independent key, the code searches the **entire 9,408-member affine family**, selecting the **smallest Pearson 28-bin chi-square** against the **unchanged** original 12,815 step values. Hence the test gives the model a substantial post-hoc advantage. The original 28-bin spectrum has chi-square **42.05595** against a uniform flat step stream.

| Native register of P | Independent register of K: Shakespeare | Gibran | Emerson |
|---|---:|---:|---:|
| Shakespeare | **153.9710** | **143.3780** | **166.1464** |
| Gibran | **143.3780** | **146.7768** | **161.8290** |
| Emerson | **166.1464** | **161.8290** | **188.5488** |

Even the **best** whole-family, postselected two-English candidate has chi-square **143.3780**, with every candidate still producing substantial alphabet-step bias absent from the source original. The best common-register scores are 153.9710, 146.7768 and 188.5488. For context, the simple prespecified equal-sum GP28 reading with both streams drawn from Emerson yields chi-square **605.0219**, while the source's actual step tape is near-flat. These are strong register-conditional mismatches; they are *not* a claimed all-language impossibility, a calibrated historical authorship probability, or evidence that every arbitrary 28-symbol mapping must fail.

**A direct invertibility positive** constructs a genuine two-English GP28 cipher from 95 source-native solved-p57 runes, inserts one explicit EA at position56, encrypts through a 29-symbol predecessor chain under the independently sourced Gibran key tape, and recovers **every 95/95** symbol. The original negative therefore is a step-spectrum mismatch, rather than a broken decryption convention.

## Research decision

Do **not** launch a blind attack that treats the original **nonzero GP29 step sequence** as an ordinary affine modular28 sum of two *independent* GP-native English streams in source-ordinal order. It would retain the original's anti-repeat structure but require a linguistic register whose **empirical 28-step marginal convolution does not resemble any of the nine source-control combinations**, even under thousands of adjustable affine output maps. This is a distinct architectural exclusion from the previously tested direct `C=P+K mod29` literary running key.

The negative does **not** exclude a correlated pad, a secret full 28-symbol permutation, alternate reserved rune, unequal-language sources, changing alphabets, longer native register or nontext running key. Most critically, it **does not uncover real LP2 plaintext**. A first-party clue selecting one of those broader mechanisms must precede further expensive key searches. Source code and complete numerical reproduction: [read-only CommonJS SFT](../sims/lp2_gp28_dualenglish_chain_original_sft.cjs).

**Windows Node22 original-input execution:** [passing GitHub Actions run 44125660399](https://github.com/FlareZ123/liber-primus/actions/runs/44125660399).
