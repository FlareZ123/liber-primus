# The p57 19-word Parable as a key for the 553-rune cuneiform enclosure

**Agent 1, 23 November 2026. Classification: source-motivated, bounded original-input negative. No unknown LP2 plaintext, key, cipher identification, or Cicada destination recovered.**

## Human-solve-path hypothesis

Three authentic features suggest one compact experiment:

1. The solved p57 page repeats the 2013 *Instar Emergence* Parable. Excluding the printed title **PARABLE**, its body has exactly **19 words** (88 GP29 runes). The 2013 source contract preserves the original ID3 Parable and its wording in [the 2013 Instar reference](../resources/external/2013-instar-xor-source.md).
2. The 2016 signed continuation says that the book's words are the map and their numbers are the direction. A solver might therefore turn each Parable word into a GP29 number.
3. The five red-numbered original cuneiform passages on p36–p38 contain **553 runes = 19×29**, with exact source lengths **[139, 91, 98, 96, 129]**. The 29 is the manuscript alphabet size.

This suggests a 19-value word key and a 19×29 arrangement of the five numbered passages. It is a plausible human-first bridge from a solved Parable to a visually numbered original recipient, not an established author instruction.

**Weakest premise:** no first-party text explicitly connects the 19 Parable words to the five cuneiform passages, specifies a 19×29 layout, or says that a word's GP value should be used as a Caesar/Vigenère shift. The signed-2016 wording motivates examining word numbers; it does not specify this receiver.

## Frozen original input and key derivation

The source input is the canonical resources/liber-primus/lp2-corpus.json plus lp2-transcription.txt.

The five original units are concatenated in their printed order without changing any rune or page carry:

| Unit | Exact source slice | Runes |
|---:|---|---:|
| 1 | p36 [99,238) | 139 |
| 2 | p37 [0,91) | 91 |
| 3 | p37 [91,189) | 98 |
| 4 | p37 [189,228) followed by p38 [0,57) | 96 |
| 5 | p38 [57,186) | 129 |
| **Total** | | **553** |

These are the already documented source boundaries of the numbered enclosure, not a new discovery; see [the five-passage source report](lp2-cuneiform-five-numbered-wisdom-inversion.md).

The p57 transcription parses as the title plus 19 Parable words:

LICE / THE / INSTAR / TUNNELNG / TO / THE / SURFACE / WE / MUST / SHED / OUR / OWN / CIRCUMFERENCES / FIND / THE / DIUINITY / WITHIN / AND / EMERGE

These are canonical GP transliterations (K→C, V→U, and the native NG rune), not English spelling corrections. The 19 body words contain 88 GP runes; the full p57 page contains 95.

Two source-native ways to turn each word into one shift were frozen:

- **GP0 key:** sum the word's zero-based GP rune indices modulo 29.
- **GP-prime key:** sum the word's printed Gematria Primus prime weights modulo 29.

The resulting 19-symbol keys are:

~~~text
GP0:     [24,20,20,7,19,20,9,25,22,6,8,19,15,13,20,18,9,27,25]
GP-prime:[10,14,19,20,8,14,14,28,12,0,21,26,16,6,14,28,28,12,10]
~~~

## Frozen receivers

The exact 553-rune ciphertext was tested under the two natural orientations of a 19×29 rectangle:

1. **19 rows × 29 columns:** each Parable word supplies one shift, applied uniformly to its corresponding 29-rune row.
2. **29 rows × 19 columns:** the 19-symbol Parable key is repeated once per row, the ordinary periodic-key interpretation.

For both key encodings and both algebraic directions, use only the direct GP29 shift:

\[
P_i=(C_i \pm K_i)\bmod29.
\]

This gives **eight fixed inverses**. There is no fitted phase, arbitrary row rotation, word-dependent offset, new alphabet, skipped rune, page reset, or extra cipher layer. The test does not add the separate p56 literal-F bypass, which would be another unsupported operation.

## Original result

| Key encoding | 19×29 row shift, − | 19×29 row shift, + | 29×19 periodic, − | 29×19 periodic, + |
|---|---:|---:|---:|---:|
| **GP0 word sums** | 0.03529497 | 0.03531462 | 0.03472495 | 0.03448253 |
| **GP-prime word sums** | 0.03468564 | 0.03449564 | 0.03443667 | 0.03444322 |

The untouched original 553-rune block has IoC **0.03423356**. The best of the eight inverses reaches only **0.03531462**, still near the uniform 29-symbol baseline \(1/29 \approx 0.03448276\). The independent source-native 553-rune positive benchmark in the five-passage study has IoC **0.06094557**. None of the eight outputs yields a coherent passage; the source-exact first-80-rune readouts are printed by the reproducer.

Every candidate inverse re-encrypts all **553/553** original rune indices exactly. This verifies the arithmetic and source accounting, not the key hypothesis: any fixed additive shift is bijective and will replay its own output.

## Decision

Retire this exact **p57 19-word GP0/GP-prime key → 19×29 cuneiform block → direct GP29 shift** family as a native-GP plaintext decoder. The numerical fit 553=19×29 and the 19-word Parable are real source observations; their use as a key schedule is not authenticated, and the tested outputs remain nonlinguistic.

Do not extend this result into a search over arbitrary key functions, row/column permutations, offsets, F-skip masks, or second layers. Reconsider the Parable-to-cuneiform connection only if an independent first-party instruction specifies a different value-changing operation or a withheld original receiver.

## Reproduction

From the repository root:

~~~sh
node sims/lp2_parable19_wordkey_553_cuneiform_gate.cjs
~~~

The script parses the original p57 transcription and GP29 corpus, asserts the 19-word/88-rune Parable and the five original numbered source slices, evaluates all eight fixed variants, and checks exact 553-rune forward replay.
