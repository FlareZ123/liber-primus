# LP2 p55 against the 2012 Cicada-emblem signed GPS digit key

**17 November 2026, Agent11. Exact original-cipher, clue-constrained negative.** The [Node22 original-input Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/44146356990) **passed**; there is **no new LP2 plaintext, authentic key, algorithm or destination**.

## Original source and falsifiable route

The original Cicada 2012 emblem from 845145127.com appears again in LP2 p55, independently pixel-registered [here](lp2-moth-pre2014-logo-source-registration.md). The original 2012 logo JPEG had a preserved PGP clear-signed OutGuess message containing **twelve ordered GPS coordinates** and a closing **3301**. We imported [the exact archival signed text](../resources/external/2012-845145127/cicada-logo-outguess-signed.asc), **1,221 bytes, Git blob SHA-1 7906deec84cfc26907ef417ee3ba7d727d1f5f53**. Independent [original archival source](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/main/assets/2012/cicada.jpg.out) and the [2012 puzzle-sequence inventory](../workplace/2012-845145127-lp2-cross-round-route.md) establish its earlier context. Its original numeric content, the repeated emblem on p55, and the signed 2016 *numbers are the direction* language make a direct numeric key **plausible to test**. Nothing author-authenticated selects such a key for 2014.

**One locked decoder:** take the twelve signed 2012 coordinates in preserved source order. Strip all nondigit characters and concatenate the resulting **250 decimal digits**. Exclude the separate 3301 terminal marker and PGP signature. Digits 0..9 are already valid GP29 indices. Starting on the first original rune of the physical p55 page bearing the emblem, use one digit per non-F plaintext rune and 29-way additive Vigenere. The encryption equation for nonzero plaintext GP rune P is **C = (P + s K[j]) mod 29**, advancing j by one. As in genuinely solved LP2 p56, plaintext F=0 emits a literal ciphertext F=0 **without key advance**. A printed ciphertext F might instead encode a non-F rune. We branch exhaustively on that ambiguity. The two historically available signs s=+1 and s=-1 are independently tested. No input offset, decimal-digit reorder, coordinate-sign transform, guessed text, phase, cipher other than this one or F-bypass mask is fitted.

## Exact original result

Original p55 contains **76 ciphertext runes** and three printed ciphertext Fs, at zero-based original indices **15, 25, 41**. The exhaustive exact inverse produces:

| Additive sign | Full-length legal inverse paths | Literal plaintext-F bypass sites | Decoded GP29 IoC |
| --- | ---: | --- | --- |
| + | 2 | [15]; [15,25,41] | **0.03333333; 0.03157895** |
| - | 3 | [41]; [15,25]; [15,25,41] | **0.03192982; 0.03228070; 0.02947368** |

All **five** paths reencrypt exactly **76/76 unmodified p55 runes**. The first complete printed four-rune word, immediately after the one-rune fragment carried over from p54, is **D B N U** under + or **IA NG J P** under -. No resulting full-page reading is coherent native-GP prose or a recognizable independently typed object. The best candidate IoC is **0.03333**; the original ciphertext's is **0.03789**, and authentic clear p57 first-76-rune IoC is **0.05965**. The low IoC is evidence against native GP prose for this narrow decoder, not a mathematical exclusion of all possible plaintext registers.

**Independent actual Cicada plaintext positive:** the same source-digit key and both signs successfully encrypt the **first 76 known-clear LP2 p57 runes** with correct F-bypass semantics and blindly recover their exact original GP symbols among all legal inverse branches. Both planted native-GP messages round-trip **76/76**. Source hash, 12 coordinates, 250 digits, original p55 indices, all branch paths and synthetic C→P→C equality are checked by the read-only [single-file Node22 SFT](../sims/lp2_p55_2012_signed_gps_digitpad_sft.cjs), executed successfully under the [manual original-input workflow](../.github/workflows/agent11-2012-signed-gps-p55-manual.yml).

## Decision and limits

The exact reuse of the Cicada emblem exposes a genuine, period-authored numeric source. This experiment rejects **direct 2012 signed-coordinate decimal digits as a p55 GP29 Vigenere pad with the authentic F bypass**, at an emblem-aligned physical-page start, as an English plaintext solution. The GPS data's proven original purpose was the 2012 coordinate stage, providing a strong ordinary-branding rival explanation for the reused image.

The evidence does **not** exclude an author-provided GPS-to-key algorithm using geographical meaning, non-Vigenere state, a different key start, or key processing. Pursue those only after an independent instruction selects that extraction. Avoid further unconstrained GPS permutations and arbitrary phases. This is intermediate supporting work; the authoritative [results synthesis](../results/README.md) remains unchanged.
