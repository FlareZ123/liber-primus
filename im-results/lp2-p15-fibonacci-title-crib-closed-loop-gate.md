# LP2 p15 FIBONACCI title crib: exact eight-key contradiction and autokey gate

**Agent 50, 13 November 2026. Original-source, hypothesis-led result; no recovered unknown plaintext, authentic title, key, cipher, or continuation.**

## Source observation and one testable proposed solve route

The original physical LP2 page **p15** (archive `32.jpg`) prints a nine-rune red heading immediately above its 4×4 number square. The source-red-starting square has an independently established exact construction from **Fibonacci-indexed prime numbers**: [p15 mathematical result](../results/lp2-p15-fibonacci-prime-spiral.md). A human could therefore conjecture that this nine-rune encrypted heading reads **FIBONACCI**. Both the printed heading and that English word have nine GP29 rune positions, and their first rune is **F**. Neither observation authenticates the crib; many nine-rune words can fit the heading under a free key.

The unchanged canonical p15 heading is `[0,1,20,19,24,28,26,22,24]`. The hypothesized GP-native plaintext **FIBONACCI** is `[0,10,17,3,9,24,5,5,10]`. If this exact word were written under ordinary additive GP29 Vigenère, it would imply the nine-rune key `[0,20,3,16,15,4,21,17,14]`, transliterated **F L O T S R NG B X**. If its first F is instead literal/transparent, as in historical solved Cicada enciphering, the eight subsequent encrypted letters imply the precise eight-rune key **L O T S R NG B X**.

These keys are *algebraically derived from the conjectured crib*. They are **not** recovered or authenticated author-provided key material. The next operation is the decisive question: does the inferred eight-rune key actually decrypt the rest of the original source chapter p15–22?

## Exact original-input gate for the historical F rule

Freeze the 8-rune key `K=[20,3,16,15,4,21,17,14]` at p15 title entry, with one transparent initial F. In the standard solved-page convention, a plaintext F emits ciphertext F and does **not** advance the additive key; ciphertext F may also result from ordinary encryption of a different rune. An exact eight-state dynamic program retains both interpretations of every ciphertext F, rejects an ordinary non-F ciphertext that equals its active key digit, and never chooses a plaintext/skip pattern by language score.

**Direct contradiction on p15:** after the complete proposed title, the next original rune at p15 local offset **9** (zero based) has value **20**. The inferred key resets to `K[0]=20`. Normal subtraction would yield plaintext **F (0)**, but the historical transparent-F rule would have emitted ciphertext **0**, not **20**. The source p15 continuation is therefore impossible immediately under *this precise repeating eight-key and F rule*. The first nine conjectured title runes were never used as a scored holdout.

For additional independence, let **every** later physical page p16–22 choose **any of eight initial key phases** and omit its first ciphertext rune as a free IV. All possible interpretations of each ciphertext F are retained. Nevertheless **every page reaches an unavoidable contradiction before its end**:

| Original physical page | First impossible rune position within page (zero based, IV at position 0 free) |
| ---: | ---: |
| 16 | 66 |
| 17 | 96 |
| 18 | 161 |
| 19 | 92 |
| 20 | 156 |
| 21 | 192 |
| 22 | 108 |

Those fail positions come from the original ciphertext, with no known-plaintext fitting in the continuations. Permitting arbitrary page phase and a page-initial IV is *strictly more lenient* than the page-15-derived key-clock premise, so these seven failures decisively retire the identical eight-key/F-bypass transfer into the original chapter.

## Standard nine-letter autokey alternatives

If instead the original leading F is treated as an ordinary cipher symbol carrying a zero-shift key, the entire nine-rune conjectured title fixes the initial key of a standard Vigenère **plaintext-autokey** or **ciphertext-autokey** decoder. Both operate without additional key search. The original source runes over complete p15–22 are **1,903** in physical page chunks `[159,267,273,260,271,269,273,131]`. Decoding *after the nine title runes*, including the second red rubric, gives:

| Complete original GP29 stream | IoC across 1,894 non-crib runes |
| --- | ---: |
| Original ciphertext unchanged | **0.0344948961633** |
| Conjectured FIBONACCI plaintext-autokey inverse | **0.0345032635659** |
| Conjectured FIBONACCI ciphertext-autokey inverse | **0.0344692361287** |
| Independently clear p57 PARABLE (95 runes; control register, different length) | **0.062709966405** |

The two entire output streams retain chance-like GP29 frequencies and exhibit no readable language. Both autokey models **re-encode the exact full 1,903 source runes**, and both recover a separate originally clear p57 GP29 **planted ciphertext** exactly. The fixed eight-key/F-bypass encoder also passes an authentic solved-p57 GP29 plant with an exact nonempty surviving decode-state set. The positive controls establish working cipher implementations, without making the crib true.

## Decision and scope

**Reject one specific source-motivated cipher bridge:** p15's nine-rune heading as FIBONACCI **followed by repeated eight-rune Vigenère with the historical transparent-F rule**, even with arbitrary per-page phase; and the two ordinary length-nine autokey extrapolations. The initial inferred key is not meaningful English and has no independent source support.

The mathematical Fibonacci title hypothesis **alone** is unproven rather than disproved: a genuinely different per-rune key might encrypt that heading and its surrounding text. This gate does not exclude nonadditive encryption, a second key layer, or a source-specified state machine. It supplies **no original plaintext recovery** and should not prompt a new family of tuned periods or arbitrary title words without a separate original instruction.

**Standalone reproducibility:** [`node sims/lp2_p15_fibonacci_title_crib_sft.cjs`](../sims/lp2_p15_fibonacci_title_crib_sft.cjs). It reads the unmodified [canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json), asserts exact title and page counts, exhaustive eight-phase F-bypass failures, both full autokey inverses and forwards, and solved-page GP29 positive plants. The exact original numbers were separately evaluated against live repository data before writing the script.
