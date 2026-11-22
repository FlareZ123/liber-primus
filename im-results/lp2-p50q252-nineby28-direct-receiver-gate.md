# Original p50 quotient: nine × 28 source-state receiver does not restore LP2 plaintext

**Agent9, 22 November 2026. Evidence: bounded genuine original-cipher test, no plaintext recovered.** [Original-source SFT](../sims/lp2_p50q252_nineby28_original_receiver_sft.cjs) passed [Windows Node22 Actions 44974368031](https://github.com/FlareZ123/liber-primus/actions/runs/44974368031), including eight reversible positive-model encrypt/decrypt controls with all original word lengths.

## Human path and alternatives

An established original-input GF29 factorization of the **256-cell p50 numeric panel** by either the signed 2013 `H=[3,26,24]` followed by centered p39 red `G=[27,5,15]`, or the centered p23 red `R=[23,6,10]` followed by G, leaves a **252-GP29-symbol quotient**, zero remainder. This has a previously untested visible decomposition:

```
252 = 9 × 28
      nine illustrated LP2 visual chapters
      × twenty-eight non-F GP29 rune values
```

A plausible key register would therefore assign each illustrated chapter its own 28 source-derived values, excluding the special GP29 `F=0` rune. This algebraic size coincidence and grouping were **not authenticated by a Cicada instruction**. The p23/R quotient starts `[0,23,10,15,28,2,3,4,20,15,4,6,...]`; the H quotient is its GF29 scalar counterpart, with no new entropy.

The direct substitution-alphabet interpretation fails before decryption: the **nine 28-value rows contain only [16,19,21,16,19,16,18,17,22] distinct symbols**, so none is itself an invertible permutation of the 28 nonzero runes. A stable sort could construct a separate permutation, but absent a signed sort instruction that would add another inferred opcode. Further, all direct chapter-specific **previous-cipher-rune keyed 29-symbol substitutions** are already excluded by the stronger exact all-secret bound in [the independent original-input result](lp2-firstorder-static-quasigroup-majorization-gate.md).

Two reversible and minimally parameterized receivers remain worth a bounded actual LP2 test, holding the visible quotient row shape fixed. Let `Q_ch[j]` be the corresponding 28 source-derived numeric values for visual chapter ch, `C_i` an original ciphertext GP29 index, `P_i` proposed plaintext, and `s = ±1`. For both H/G and R/G (four source/sign combinations):

1. **Periodic chapter-keyed additive stream:** `P_i = C_i + s×Q_ch[(i − chapterStart) mod 28]` (rune clock resets only at original visual chapter).
2. **Previous-plaintext state lookup:** `P_i = C_i + s×Q_ch[P_(i−1) − 1]` for a nonzero preceding plaintext rune, and shift0 when the predecessor is F. The visual chapter's first ciphertext rune is left unchanged as its explicit initial state.

The two operations yield **eight source-constrained reversible original-cipher candidates**. None is tuned using original text, a dictionary, or a key fit. They use the authentic chapter boundaries, original body rune order, original printed separators and direct GF29 quotient values.

## Original-cipher outcome and true positive controls

On the untouched 12,956-rune original and 2,896 authentic word boundaries, the ciphertext itself has GP29 IoC **0.034478**. Across **all eight** proposed inverses, the corresponding IoC remains **less than 0.040** (near the random GP29 reference value **1/29 ≈ 0.03448**). Among **1,645 original word positions of four or more runes**, **no candidate obtains more than 10** exact words from a frozen 6,418-entry Shakespeare/Gibran source-native GP dictionary; the original untouched ciphertext has only **two**. None produces a surviving native-language register.

For an actual decryption control, the SFT builds a **12,956-rune original-word-shape genuine GP English register** by choosing independently source-attested dictionary words of every original physical word length, including lengths 1–14. All **1,645** resulting long-word positions are genuine dictionary words. For every one of the **eight** original-source consumers, its corresponding forward cipher encrypts that register and the inverse recovers **all 12,956/12,956** true plaintext runes and **all 1,645 original dictionary words**. The negative original outcome is therefore about the chosen source receiver, with no failed handling of the 9 chapter keys, GF29 arithmetic, word lengths or reversible model.

## Decision

The source arithmetic coincidence **252=9×28** deserves recording as a possible human clue, but the direct literal chapter-specific alphabet/pad/previous-plaintext consumers do **not** decode any unknown LP2 prose. Retire these eight finite original-cipher receivers; the original arithmetic factorization remains intact. No source-only selector says to reshape the quotient nine-by-28 or defines a different reversible operation, and a search over arbitrary chapter offsets, key stream order, cipher nesting or nonlinear maps would violate the stated causal gate.

**Reproduction:** [source corpus](../resources/liber-primus/lp2-corpus.json), [grid](../resources/liber-primus/lp2-grid-256.json), [original word transcription](../resources/liber-primus/lp2-transcription.txt), [all eight original-source and true positive ciphertext tests](../sims/lp2_p50q252_nineby28_original_receiver_sft.cjs), [passing Windows Node22 run](https://github.com/FlareZ123/liber-primus/actions/runs/44974368031).
