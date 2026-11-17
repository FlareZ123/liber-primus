# Terminal 272-cell wheel: Euler totient of the carry-selected source value

**Agent 6, 17 November 2026. Exploratory original-input decoder gate. No recovered unknown LP2 plaintext, authentic key, historical decipherment instruction, or destination.** The clockwise 272-cell wheel and 76-carry source geometry come from the earlier [dual-wheel hypothesis](lp2-terminal180-272ring-76carry-dualwheel-gate.md). This note tests exactly one distinct historic operator on its readout: Euler's totient of the *pointed-to numeric value*.

## Why this is a candidate plaintext route

Original LP2 p15 prints a Fibonacci-indexed-prime 4×4 square. Its source-anchored clockwise spiral yields exactly 16 integers. Original pp49–51 print 256 sexagesimal tokens, provisionally interpreted as bytes. Concatenating those visible registers produces a 272-value ring. The *independently authenticated* p56 plaintext (85 runes) and already clear p57 (95 runes) provide 180 consecutive known GP runes. Their GP ordinal sum is exactly **2204 = 29×76**, while their GP prime-value sum is **7888 = 29×272**; original p55 has precisely **76 encrypted runes**, including the first rune carried from p54. These numerical coincidences alone do not authenticate the hypothesized wheel.

The more specific source-selected operation tested here is **Euler's totient**, already explicitly identified as sacred in solved LP1 and used successfully as the consecutive-prime cipher key on original p56. The [earlier wheel test](lp2-terminal180-272ring-76carry-dualwheel-gate.md) used the pointed-to ring value **modulo 29**, without applying its totient. Applying Euler's totient is a historically meaningful alternate executable operator and is *not* a modification to fit a candidate plaintext. The original sources still do not instruct a reader to combine these passages in this way. The distinct [p50 outer-perimeter prime-indexed-totient experiment](lp2-p55-outer76-primeindexed-totient-gate.md) reads a fixed **76-cell circumference**, whereas the present test reads **76 carry-selected positions** on the concatenated 272-cell ring. The two key sequences are different.

## Exact non-adaptive inverse

1. Recover real p56 plaintext from its complete 85-rune ciphertext using 84 successive prime totients and the authenticated one nonconsuming literal plaintext F at local rune 56. Append p57's 95 visible plaintext runes. This is a completely independently known 180-rune source tape.
2. Initialize two ring cursors to zero. For each known rune ordinal g, advance the **ordinal** cursor by g modulo29; when it carries, emit one source-selected ring cell. Simultaneously advance the **prime** cursor by that rune's published GP prime modulo272. The two original source sums force exactly 76 carries and complete final cycles.
3. The ring is the original p15 clockwise 16-value spiral followed by the 256 original table values in printed row-major order. Freeze both natural *before* and *after* prime-step read conventions, without a page skip, fitted start, reordered table or secret alphabet.
4. Compute **K = φ(ring[cell]) mod29**, with the standard Euler definition for positive integers. Since the original byte table contains literal zero values, φ(0) is **undefined**, and a timing that selects a zero is rejected as incomplete instead of inventing φ(0)=0 or φ(0)=1.
5. Under the working hypothesis that original p55 also uses p56's verified plaintext-F bypass, its unchanged ciphertext Fs are at offsets **15, 25 and 41**. For each one, either an actual plaintext F passes unchanged without consuming K, or an ordinary encrypted non-F consumes K. Test all eight logically possible masks, with no extra key material, under only the documented subtraction direction. A non-bypassed subtraction that recovers zero from a nonzero consumed plaintext is invalid under that F rule.

Match resulting 76-rune inverse outputs against **29,055** independently pinned GP-English dictionary spellings on all **16 complete printed p55 words** (word lengths 4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3). The leading p55 rune is a carry fragment and is not counted as a completed one-rune word. The output must produce consistent coherent English, rather than one short coincidental hit. No original ciphertext rune or word boundary is edited.

## Source-original results

| Test | Exact result |
| --- | --- |
| Wheel terminal check | 180 known GP runes, prime sum 7888, ordinal sum 2204 |
| Total source read events | **76** in either timing |
| **After**-step Euler read | **Undefined** at original wheel index **245**: its table byte is **0**, so φ(0) does not exist |
| **Before**-step Euler read | Defined at all **76** selected cells |
| Original p55 literal-F masks with valid cipher semantics | **6 of 8**, masks **0,1,2,4,5,6** |
| Invalid before-step masks | **3 and 7**: force a zero plaintext at non-bypassed original offset **30** |
| Original complete GP-English dictionary words of three or more runes, any mask | **0** |
| Original best unscaled 76-rune IoC | **0.037894736842** (mask 0), near the unrecovered ciphertext rather than clear prose |
| Plant | **Exact 76/76** known p57 GP runes recovered after source-key artificial encryption, including genuine F bypass |

The defined key produces random-looking original p55 readouts. For example, the no-bypass first 16 runes transliterate to **OE J NG N C A J N NG N L M C IA R N**, and no eligible printed dictionary word of length at least three matches. The six formally valid F masks remain nonlinguistic. Their mathematical legality is **not** evidence of a historical key: an arbitrary wrong key can sometimes avoid accidental zero outputs.

This distinguishes an **undefined** source operation from a *defined but linguistically unsupported* candidate. In particular, the after-step read cannot be repaired by assigning a special value to φ(0) without adding a new rule not present in the source.

## Decision and scope

**Retire this exact source-selected totient-of-value wheel decoder on p55.** It yields no authenticated unknown passage. The p15/p50/terminal length arithmetic is preserved as a hypothesis, while no inference is made that the numerical coincidences demonstrate intention. The method does not exclude unrelated uses of the table, source-authored pointer rules, actual non-GP source text or external key material. It supplies no reason to keep enumerating alternate ring rotations, inverse directions, exceptional φ(0) values, new modulo alphabets or further fitted F masks.

[Standalone source-original Windows Node22 CommonJS SFT](../sims/lp2_terminal180_phi272_76carry_original_sft.cjs) reads the pinned corpus, original word delimiters, authentic solved p56, visible p57, Fibonacci square, original p50 grid and native GP dictionary, prints every fixed candidate, and includes the positive plaintext-F-controlled inverse. The script was also independently evaluated in the in-memory GitHub runtime on the same repository inputs; the same counts and nonprose results were obtained.
