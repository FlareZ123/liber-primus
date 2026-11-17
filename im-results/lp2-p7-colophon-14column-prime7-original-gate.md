# p7 five-dot, 14-rune colophon and prime-start chain: original-input gate

**17 November 2026 · Agent4 · Bounded source-constrained negative.** No unknown LP2 plaintext, key, complete inverse or Cicada destination was recovered. This test evaluates one human-followable interpretation of three adjacent source features; it does not reject the underlying visual observations or every possible use of the p7 colophon.

## Motivation

Physical p7 (original scan 24.jpg) ends with a reused five-dot emblem and a 14-rune red colophon. Immediately after it, pp8–14 form a seven-page chapter containing 1,729 GP29 runes and one printed Arabic numeral 7 at mixed-stream index 692. A solver could reasonably ask whether the p7 dots select a five-column reading order, the 14 red runes provide a keyword for a conventional 14-column transposition, and the exposed 7 selects the already-authenticated p56 prime-totient cipher with literal plaintext-F bypass.

This is more constrained than searching arbitrary 5- or 14-column permutations: the five-dot geometry, colophon runes, chapter boundaries and candidate prime starts are fixed by the original pages. The p7 source alignment is independently reproduced in the [five-dot/numeral-7 report](lp2-p7-five-dot-numeral7-nested-column-alignment.md); the 14-rune span and its earlier short-cipher negatives are in the [red-colophon report](lp2-p7-red-colophon-short-original-inverse-gate.md).

## Frozen source selector and exact operations

The p7 five-dot centers, sorted left-to-right, have top-to-bottom column order **[2,4,0,3,1]**. The original p7 JPEG is checked by SHA-256 91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c.

The p7 red colophon has GP29 values [23,3,22,16,2,25,5,7,11,14,28,6,28,19]. Treating that 14-rune string as a standard columnar-transposition keyword, stable-sorted by the GP alphabet with repeated symbols retaining their left-to-right order, gives zero-based column order [4,1,6,11,7,8,9,3,13,2,0,5,10,12].

The 14-column operation uses the ordinary ragged-grid convention: the first length mod 14 columns contain one additional rune. Both directions are tested. The value-changing layer is the known p56 inverse, retaining **all** legal plaintext-F bypass branches rather than greedily treating every ciphertext F as plaintext F. Candidate starts are literal prime 7, the seventh prime 17, and prime 19 (a factor of 1,729); prime 2 is retained as a control.

## Original outcomes

### Following chapter, pp8–14

The 1,729 canonical GP29 runes plus the printed numeral 7 form 1,730 mixed source units. The numeral occurs at index 692, and the fixed five-column inverse moves it to output position zero. Removing that header leaves the 1,729-rune stream.

After the colophon-keyed 14-column transposition, the exact all-F-branch p56 inverse has **no complete path** in any of the eight direction/start combinations:

| 14-column direction | Prime 2 (control) | Prime 7 | Seventh prime 17 | Prime 19 |
|---|---:|---:|---:|---:|
| Columnar decryption | 118 | 20 | 1 | 31 |
| Columnar encryption | 23 | 0 | 25 | 27 |

Values are first impossible zero-based rune offsets, not language-score cutoffs. The prime-7 reading fails by rune 20 in the natural inverse direction; the seventh-prime reading fails by rune 1.

A direct additive GP29 Vigenere use of the colophon was also tested on the same 1,729-rune stream: both signs, forward/reversed key reading, and offsets 0 or 7. The eight native-GP trigram scores range from **−3.421660 to −3.403574**, while independently solved p57 scores **−2.468145** and the LP1 training corpus scores **−2.260728**. No candidate approaches readable native GP text.

### Preceding chapter, pp3–7

The complete preceding visual chapter contains exactly **1,145 = 5×229** runes. Applying the same fixed five-dot order, then the same colophon-derived 14-column keyword, and then the p56 prime-totient inverse gives another six exact negatives:

| 14-column direction | Prime 7 | Seventh prime 17 | Prime 19 |
|---|---:|---:|---:|
| Columnar decryption | 11 | 57 | 0 |
| Columnar encryption | 23 | 67 | 17 |

Every value is the first impossible zero-based rune offset under exhaustive legal F-bypass reachability. The tested span includes the p7 red colophon itself.

## Positive control and reproducibility

A source-native 1,729-rune LP1 plant was encrypted with the same prime-7/F-bypass operation, the fixed colophon-derived 14-column transposition, a leading literal 7 header, and the fixed five-column interleave. The exact inverse recovers all 1,729 runes; the exhaustive F-branch reachability test retains a complete path. This verifies the implementation and the stated ragged-column convention, not the historical authorship of the candidate route.

The read-only Node 22 reproducer is [lp2_p7_colophon_14column_prime7_gate.cjs](../sims/lp2_p7_colophon_14column_prime7_gate.cjs). It uses only the canonical corpus, original p7 JPEG, and pinned solved-LP1 native GP encoder/model.

## Decision

Retire this exact chain: p7 five-dot order → p7 colophon stable-GP keyword 14-column transposition → p56 prime-totient/F-bypass inverse, with the source-derived prime starts, on either adjacent natural chapter. Also retire the direct additive colophon-key variants tested above. Do not widen to arbitrary 14-column permutations, key offsets, prime starts, or additional layers without a new first-party selector.

The separate p7 five-dot/numeral-7 alignment remains an exact source alignment, not an authenticated cipher instruction. The p7 red colophon remains a source-visible 14-rune span, not an established key. No unknown LP2 plaintext or key has been recovered.
