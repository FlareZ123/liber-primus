# Original LP2 words: 1033/3301 modular traversal does not restore prose order

**Agent 7, 14 November 2026. Classification:** a distinct, fully tested candidate word-order inverse, source-motivated but not author-instructed. **No unknown plaintext, cryptographic key, continuation or authenticated cipher mechanism recovered.** [Reproducer](../sims/lp2_cuneiform_1033_3301_wordstep_sft.cjs) uses original rune text and a genuine prose positive; the published numbers do not by themselves identify the tested operation.

## Human solve-path hypothesis and exact unfit operands

The original LP2 p33–39 cuneiform-like motif explicitly encodes **(17,13)₆₀ = 1033** and **(55,1)₆₀ = 3301**. These match the historically used 2014 magic sum and Cicada number. The independently signed 2016 clue speaks of the book's **words**, their meanings, and **numbers as direction**. A possible simple “word-route” for a human solver is to walk through the complete words in the book by one of its original printed numbers modulo the original number of words.

The source's intact GP29 unknown text contains **2,896 printed words in 12,956 runes**, over physical pp0–55, including all page-crossing words; physical p50 contains no runes. The counts are reproduced directly from the committed original transcription, preserving hyphen/full-stop word delimiters but omitting mere line and page wraps. **Both printed candidate step sizes are coprime to 2,896**, and thus trace a complete cycle through all words:

| Printed step | Reduced modulo 2896 | Multiplicative inverse modulo 2896 |
| --- | ---: | ---: |
| 1033 | 1033 | 1769 |
| 3301 | 405 | 1709 |

The keyless candidate operation is: interpret the complete original word sequence as a numbered circular array, and read it by modular index positions (j×s) mod2896, starting at original word zero. Test s=1033, 405 and their multiplicative inverses, covering both natural scatter/gather readings. Reversal of the reading direction and any circular change of starting point give the same **cyclic mutual information of word lengths**, so an unknown starting offset cannot rescue this invariant. The source **never explicitly says** to use total word count as a modulus or to reorder the book by these jumps. The operation remains a hypothesis, not an identified instruction.

This is distinct from the already-tested **Josephus** step-3301 word-removal cipher in [the Josephus report](lp2-josephus-29-wordorder-source-gate.md): Josephus counts among surviving entries, while the present modular walk steps through a fixed complete cycle.

## Exact native-language gate and results

A length-preserving cipher applied after a word transposition may obscure every rune, yet it preserves the **order of word lengths** after undoing the hypothesized transposition. Test the original cyclic adjacent-word length mutual information with lengths clipped to ten bins (1 through 8, and 9+); for a modular reading by step s, this is exactly the MI of original printed word lengths at cyclic lag s. Ordinary English GP-native prose shows substantial ordered-length dependence. This test needs no guessed key, text dictionary, plaintext candidates, or oracle language scoring.

To calibrate this one source family, randomly shuffle the original word lengths **within each of the nine original visual chapters**, leaving all original chapter word counts and chapter-wise word length inventories unchanged: [158,255,385,435,224,326,23,355,735]. Use 2,000 fixed-seed xorshift32 Fisher–Yates shuffles (seed 0x33011033), evaluating the same four candidate lags for each shuffle. The null results are finite and conditional on this same-chapter randomization.

| Source-led complete word route | Cyclic MI (nats) | Chapter-matched null mean | Null SD | z | Upper-tail p |
| --- | ---: | ---: | ---: | ---: | ---: |
| step 1033 | **0.011481805** | 0.011129174 | 0.001947632 | +0.181 | **0.40380** |
| inverse 1033: step 1769 | **0.010950699** | 0.011250201 | 0.001988055 | −0.151 | **0.55022** |
| step 3301 mod2896 = 405 | **0.010613968** | 0.011216077 | 0.002005071 | −0.300 | **0.60270** |
| inverse 3301: step 1709 | **0.009669984** | 0.011235649 | 0.002019333 | −0.775 | **0.76962** |

No candidate has the elevated, positive, source-language ordering signal expected if the proposed modular inverse actually restored normal prose word order. The source's ordinary printed order also has low cyclic lag-one MI (~0.01230 nats), consistent with the independently established loss of original word-length grammar.

**Positive through the actual permutation:** convert the first 2,896 consecutive words in the separately committed Gibran *The Prophet* reference into native GP29 lengths under a frozen orthography that contracts ING, TH, NG, EO, OE, AE, IA, EA and IO. That prose has actual cyclic adjacent-length MI **0.052375287** nats. Artificially scatter it under each of the four same modular steps. The same modular inverse recovers **all 2,896/2,896** original lengths exactly and restores **0.052375287** MI. This proves the operation would recognize ordinarily ordered word-length grammar under the proposed reversible model, without using the unknown book as a tuning target.

## Cryptanalytic decision

**Retire precisely a whole-book fixed-step modular word traversal with source-selected 1033 or 3301, or either multiplicative inverse, followed by a length-preserving rune cipher on ordinarily ordered native-GP English prose.** Every original-input measurement is within or below its chapter-preserving length-shuffle null, while the planted native source recovers its much larger signal under the exact operation. Inverting a keyed symbol cipher or changing its alphabet cannot repair the word-length invariant of this exact family.

The negative is conditional on the original printed word boundaries faithfully corresponding to underlying words after the hypothesized transposition. Non-English source registers, hidden word-boundary transformations, variable-step paths, Josephus removals, other source numbers, and alternate symbol clocks are outside this gate. No original LP2 author instruction independently selects this word-order construction, and it yields **zero authentic unknown plaintext**. Further mod-2896 key tuning is unjustified without a new original clue or withheld plaintext prediction.

**Reproduction:** Run the linked Node 22/CommonJS SFT, standard library, no writes. The program asserts all original corpus sizes, four modular inverses, exact Gibran plants, all four original MI scores and their 2,000-seed conditional null. Source operands: resources/liber-primus/lp2-transcription.txt and resources/control/gibran_prophet_58585.txt.
