# Original-source eight p50 column keys with a 28-nonzero-step / F-interrupt GP29 inverse

**Agent7, 22 November 2026. Classification: bounded original-cipher negative, no recovered plaintext or authenticated actual key.**

## New reversible mechanism, source motivations and missing clue

The original printed LP2 glyph ciphertext has just **86** equal-neighbor pairs in **12,901** page-local opportunities, while its other **28** predecessor-difference residues remain approximately uniform. The solved p56 key schedule independently establishes an authentic **F interruption**, and the original p50 number table independently supplies **eight vertical 32-byte candidate keys**. These three original facts motivate a stricter *lossless* **29-symbol** modular inverse, with a special zero-step rune and a 28-symbol nonzero cycle. The exact operation is conjectural:

```
d_i      = (C_i - C_(i-1)) mod 29
if d_i = 0:
    P_i  = F = 0             // special symbol
else:
    P_i  = 1 + ((d_i - 1 ± (stream_byte % 28)) mod 28)
```

The previous ciphertext rune starts at zero at the beginning of an original source chapter. Each original source byte stream comes from `aes-256-ctr` or `chacha20` with one of the **eight original 32-byte p50 vertical column keys**, fixed **16-byte zero IV**, no password stretching or artificial key entropy. For the special **F** step, test both existing source-relevant conventions: (a) consume the next byte, or (b) skip it so the subsequent rune consumes the current byte. The other 28 values are a bijective residue ring after adding one. The explicit forward operation is

```
d_i = 0                                 if P_i = F
d_i = 1 + ((P_i - 1 ∓ byte%28) mod 28)   otherwise
C_i = (C_(i-1) + d_i) mod 29
```

This forms an exact invertible 29-character cipher with a zero-step interruption. **No authentic 2014 material instructs the solver to equate ciphertext repeats with plaintext F**, to use an AES/ChaCha mode, or to set the IV to zero. Those are frozen motivated hypotheses, not recovered historical operations.

## Exact original test

The [reproducer](../sims/lp2_p50_F_interrupt_nonzero_rank_sft.cjs) reads the actual `resources/liber-primus/lp2-transcription.txt`, canonical `lp2-corpus.json`, the raw 32×8 `base60-grid.json`, the source-native rune encoder, and the existing single-source 2,482-word Gibran lexical register. Assertions pin the **12,956** original unknown ciphertext runes, **2,896** complete printed words and their 32 cross-page carries. Eight physical table columns are tried independently against all nine genuine book sections, two known standard stream modes, both additive signs and both F consumption rules, for **576** original decoder tests. The controls encrypt every one of the **95 authentic originally printed clear p57 runes** under each of the 64 corresponding source-key/cipher/sign/interrupt combinations; decryption and exact forward reencryption return all 95 source runes for **64/64** controls.

The best original native-dictionary coverage for an entire chapter ranges between **1.39% and 2.60%** (strongest short terminal p54–55 sample only **8 matching runes out of 308**, and p0–2 only **13/729**). The longest dictionary run on any reported chapter winner is **two** words, dominated by short accidental matches. The highest GP29 index of coincidence among all source-decryptions is **0.03730460** on p0–2; the genuinely clear p57 comparison is **0.06270997**. No convincing original-language passage or even a run of three sustained dictionary words was found; the SFT's preregistered GP-English candidate filter returns **zero**. All original candidates that respect the F interrupt have an F count exactly determined by rare ciphertext repeated-rune positions, so the F marginal itself cannot select a key.

The original-source and positive-control program executed **successfully** on Microsoft Windows / Node22: [Actions PASS 44971025088](https://github.com/FlareZ123/liber-primus/actions/runs/44971025088). There is no handwritten guessed plaintext in the control or dependent result.

## Consequence for solving

**Retire precisely this source-eight-column, zero-IV AES/ChaCha, 28-nonzero-difference rank, F-on-zero, ±-sign family.** The original p50 columns are high-entropy authentic numerical material, but they do not directly yield unknown GP-English plaintext under these explicit operations. The stronger point is architectural: **a reversible no-repeat-looking GP29 cipher is easy to define and test, yet its unknown historical stream-key/nonce selector remains absent.** Do not expand by free nonce, extra KDF, source column permutations, arbitrary token-to-rune mappings or AES/ChaCha families without an original instruction that points to an operand.

This and the distinct [direct 29-modular additive gate](lp2-p50-eight-column-aes-chacha-zeroiv-native-gate.md) together exhaust **1,152** precisely specified original-column/key/cipher/readout candidates with **128** planted full-source-positive controls. They establish bounded non-recovery, not a general exclusion of modern encryption or a new actual key. **No original unsolved LP2 plaintext was recovered.**
