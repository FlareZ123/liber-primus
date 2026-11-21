# The p0 13-dot marker as a 2014 square central-diagonal mask: an exact original-cipher obstruction

**Agent 29, 21 November 2026. Classification:** source-visible geometric hypothesis; key-independent original-language exclusion for an entire stationary additive key class, with no unknown-page plaintext recovered. This complements the already documented red13 DH-state serializer and the independently investigated 2014 5–7–5 square / terminal 99-unit geometry. It is specifically a **p0 title receiver** test, not another p55 square-count proposal.

## Why a solver would consider this

The original p0 red title ends with a 13-dot ornament. Pixel inspection and the existing original-mark SFT establish nine staggered rows containing

```
1,2,1,2,1,2,1,2,1
```

dots, and the three physical vertical columns hold **4|5|4** dots. The historical 2014 OpenPuff source `resources/cicada2014-openpuff-magic-squares.txt`, distributed before the May2014 LP2 pages, contains two complete **5×5** numerical squares (first and third source groups), separated by a 7×7 square.

Take any 5×5 original square, retain its **three adjacent main diagonals** `|row−column|<=1`, and rotate those thirteen cells by45 degrees using the invertible coordinate transform

```text
display_row = original_row + original_column
display_column = original_row − original_column
```

The output has exactly the original marker's nine-row pattern and the same physical **4|5|4** columns. This is a concrete geometric construction from a period-available original artifact; it does not require choosing a plaintext phrase. It does **not** prove the creator intended the source square as a p0 key.

## Exact no-secret obstruction

Both actual 5×5 source squares are invariant under a180-degree rotation. Reading their diagonal bands as left4 / center5 / right4, each resulting 13-integer packet is a palindrome, regardless of which of the two source squares is chosen. Therefore **every stationary rule mapping each square integer to one GP29 shift**, including an unknown arbitrary nonlinear function `f(number)`, necessarily yields a palindromic 13-rune key under the same natural physical dot order.

The original p0 title's first13 GP29 ciphertext indices are:

```
C = [15,8,18,3,6,19,27,0,15,26,18,21,5].
```

The already published, explicitly **conditional** signed-2016 candidate `EPIPHANY SEEKS` is GP29 `EPIPHANY SEECS`:

```
P = [18,13,10,13,8,24,9,26,15,18,18,5,15].
```

Any additive decoder of that candidate requires the exact original residual:

```
K = C − P mod29
  = [26,24,8,19,27,24,18,3,0,8,0,16,19].
```

All **six** mirror pairs `K[i]` and `K[12−i]`, for i=0..5, **differ**, while a stationary key extracted from either square band would require all six equal. This key-independent contradiction excludes *every source-value-only per-cell key*, no matter how the historical integers were secretly mapped to 0..28. It is conditional on the original `EPIPHANY SEEKS` plaintext candidate and on the particular physical 13-dot mapping.

An independent previously published p0 **raw title** candidate, `SECUENDI RATIO` in the one-rune-per-Latin-letter branch (`sims/lp2_p0_red_heading_raw13_register_geometry_sft.cjs`), provides a second explicit conditional control. Its GP29 candidate and required pad are:

```text
P_raw = [15,18,5,1,18,9,23,10,4,24,16,10,3]
K_raw = [0,19,13,2,17,10,4,19,11,2,2,11,2].
```

**Five of six** mirrored key pairs differ. Thus the same no-secret source-square symmetry also excludes the stationary per-value additive mapping if this distinct raw title is correct. These two cribs are incompatible interpretations of the original ciphertext; neither is asserted as verified plaintext.

Four direct source operations for each of the two 5×5 groups are additionally executable: raw-number mod29 or Euler φ(number) mod29, and ± additive sign. None produces that candidate from untouched p0 ciphertext; no coherent 8+5 GP-native plaintext is recovered. The exact positive control encrypts and decrypts an independently clear 13-rune p57 slice using each same source-derived key. All eight direct candidate inversions fail both conditional title readings.

## Stronger plaintext-crib-free English word-pair exclusion

The previous two conditional title readings are not needed to test this source key mechanism. The red title has an original, explicit **8|5 GP29 word division**, and any symmetric 13-key stream satisfies

```text
K_i = K_(12-i),  i=0..5
K_i = (C_i - P_i) mod29 for non-F plaintext.
```

Let `A` be the eight-rune unknown first word and `B` the five-rune unknown second word. The source-symmetric key forces **one wholly within-word necessary constraint** `A[5]-A[7]=C[5]-C[7] mod29` and determines the entire second word directly from the *first five* GP values of the first:

```text
B[4-i] = A[i] - C[i] + C[12-i] (mod29), i=0..4.
```

This prediction uses neither the plaintext labels `EPIPHANY SEEKS` / `SECUENDI RATIO` nor the numerical values of a secret square-cell key. Any stationary arbitrary function of the original square values has to obey it.

We evaluated every **distinct eight-rune** and **distinct five-rune** spelling in the repository's pinned `resources/control/english_wordfreq_textblob.txt`, under the two already published encoding conventions: (a) source-native longest matching GP29 transliteration with original `ING→NG` and `IO→IA`, and (b) one rune per normalized Latin letter. The historical normalizations are `QU→CW`, `V→U`, `K/Q→C`, `Z→S`.

| Source spelling | Distinct 8-rune words | Distinct 5-rune words | First-word internal survivors | Complete 8|5 pairs |
| --- | ---: | ---: | ---: | ---: |
| GP-native, all runes consume shift | 4,325 | 3,613 | 153 | **0** |
| GP-letter, all runes consume shift | 4,472 | 2,940 | 169 | **0** |
| GP-native, plaintext literal-F bypass | 4,325 | 3,613 | 137 | **0** |
| GP-letter, plaintext literal-F bypass | 4,472 | 2,940 | 152 | **0** |

For the p56-style literal-F rule, a plaintext `F` emits ciphertext `F` without consuming a key. The unchanged title ciphertext contains only one `F` at zero-based position7. Grant a bypass when a candidate first word has `F` there, in which case the internal mirror constraint on 5/7 is waived. Exactly **five** eight-rune candidate spellings per encoding use that exception among the surviving options. Every other F outside the original ciphertext F position is excluded. The mirrored cross-word constraints still yield **zero** complete dictionary phrases in either mode.

Positive source controls plant the literal English phrase `EPIPHANY SEEKS`, encrypted by the **actual original 2014 first 5×5 square's central-diagonal values modulo29** (palindromic), and the same no-key reader recovers it in both spelling registers with and without the literal-F switch. Thus the zero original result does not reflect a faulty index orientation, zero dictionary coverage, or an impossible recognizer.

**Interpretation:** The entire source-derived stationary additive palindrome-key architecture has no exact two-English-word solution in this explicit finite lexicon, without choosing either historical title candidate. This is a stronger exclusion than the two conditional crib mismatches. An out-of-dictionary/foreign plaintext, nonstandard author spelling, position-dependent state update, or a different source geometry remains possible. The original p0 title cannot be declared solved from this experiment.

[Complete original-text lexical key-free SFT](../sims/lp2_p0_dot13_allsecret_english_wordpair_gate_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44938621805).

## What this changes

The geometric match alone does not select a title decipherment. The complete pinned English corpus also provides no word-pair solution for its symmetric stationary additive key. A source-defined **position-dependent state update, an outside-in H transform, a different readout order or different text receiver** might break the palindrome; the 2014 original squares supply no instruction selecting one such operation. The previous conditional red13 DH-state serializer in [this report](lp2-p0-square-state-rise-key-serializer.md) uses distinct side-column packets and a retrospective rise grammar, so its case is **not** eliminated by this narrower argument.

**Result:** the 5×5 diagonal-band shape is exact on the physical original source geometry. Both conditional title cribs and the full fixed 8|5 English word-pair census exclude its stationary additive key for the specified spelling and F conventions. Do not open arbitrary coordinate or permutation menus to rescue the model.

[Windows Node22 original SFT PASS, CI run 44937394995](https://github.com/FlareZ123/liber-primus/actions/runs/44937394995); the updated second-crib assertion is validated in the successor execution. A new first-party clue must independently select a nonstationary transformation before this geometric branch deserves further work.

**Run:** `node sims/lp2_p0_dot13_stage10_three_diagonals_sft.cjs` with Node22 on Windows. The original 2014 square file and unchanged original p0 ciphertext are read directly; no private parameters or fitted phases are used.
