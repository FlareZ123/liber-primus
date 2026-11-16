# A conditional 33-node walk from LP2's first red word

**16 November 2026, Agent28. Exploratory original-source route, no recovered plaintext/key.** An independently visible opening selector produces a **33-node** nontrivial directed cycle under the *existing, explicitly unverified* 2016 word-coordinate hypothesis. The source-selected first hop is the independently readable **TO** on p57; continuing beyond that solved word enters the cycle. Neither the quotient/remainder coordinate grammar nor any cycle readout has been authenticated by Cicada, so 33's resemblance to **3301** is hypothesis-generating, not a decipherment.

## Why the route might be intended

LP2 begins with the red 8-rune word `SHEOGMIAF` (actual GP rune string `ᛋᚻᛖᚩᚷᛗᛡᚠ`). The 2016 *signed* Cicada message says “Its words are the map. Their meaning is the road, and their numbers are the direction.” One *solver-proposed* literal grammar already published in the repo takes the **sum of GP primes for one printed word** as an address `n`, then selects physical LP2 page `n mod 58` and zero-based page-local printed word `floor(n/58)`.

The source first word has GP prime sum **347 = 58×5 + 57**, addressing independently clear **p57:w5 = TO**. That exact first hop is already preserved by [the prior original-red selector analysis](lp2-red-wordmap-firsthop-source-gate.md). Its scope *stopped* when it encountered a known solved word. The new, independently deterministic operation is to **continue the same map through p57's clear TO**, whose native GP prime sum is **66**, addressing p8:w1. Repeat the identical pointer grammar with no added key/phase/word selector.

## Exact unchanged-source path

The next **33 distinct visited word coordinates**, in order, are:

```
p8:w1  p18:w4 p41:w2 p44:w4 p13:w4 p21:w7
p37:w3 p26:w4 p53:w4 p53:w3 p53:w1 p1:w2
p24:w10 p52:w3 p31:w8 p46:w2 p51:w3 p23:w4
p0:w9 p25:w1 p17:w0 p20:w1 p43:w1 p32:w4
p17:w3 p14:w6 p17:w5 p36:w6 p30:w5 p0:w5
p41:w9 p6:w3 p35:w4
```

After p35:w4 the source prime sum points back to **p8:w1**. Thus the complete orbit from the first original red heading has one solved transit node `TO` then a cycle of exactly **33**, with the closing step at index34. No plaintext spelling is inferred from the 33 unknown-source words; calling their 33-rune initials or prime sums a *key* would require a separately given reading rule.

The complete provisional 58-page address graph has **four distinct nonterminal cycles**, with exact lengths **1, 3, 4, 33**. Their basins contain **8, 62, 1,550, 633** originating printed rune-word coordinates, respectively; another **720** terminate at the numeric p50 table or an invalid/table address. Consequently, **633/2,973** rune-word starts reach the same 33-cycle: this attractor is not uniquely reached from the first red word. The exact first red-word opening selector is original; its interpretation as the start of this specific map is conjectural.

## The second printed red word and a combined-key inverse

The **same original source heading** has a separate second red five-rune word `SYENGC` (actual `ᛋᚣᛖᛝᚳ`), with source GP-prime sum **315**. The two red words have sums **347 and 315**, differing by **32**, which happens to equal the number of rows in the original 32×8 numerical table. Under the previously proposed address grammar they both target the **same zero-based word slot 5**: the first p57:w5 (clear TO), the second **p25:w5** (unknown). The difference32 is independently computed from the two original red words, although the address grammar, the choice to compare the sums and any link to grid row count are still hypotheses.

Continuing the same word-pointer rule from the second red word yields fifteen transit nodes, then a distinct **four-node cycle**: p8:w2 → p21:w3 → p36:w4 → p33:w2 → p8:w2. The first original red word thus eventually follows a 33-cycle; the second follows a 4-cycle. A *single completely specified* combination uses the sum modulo29 of the two word-prime sums at simultaneous traversal step `i`, beginning directly with **347+315** and advancing each pointer once per ciphertext rune. After fifteen transient steps, the combined key has exact period **lcm(33,4)=132**. Both Vigenère signs on the untouched p55 76-rune ciphertext return GP29 IoC **0.03228070** and **0.03403509**, no GP-native prose. The opening page's unedited black-body runes similarly remain near uniform under this key (GP29 IoC **0.03504340 / 0.03501101**). This is a tested decoding attempt with no plaintext; it does **not** make the 32-row coincidence or dual-walk addition author-selected.

## Decision with actual ciphertext

A source-simple candidate 33-rune running key is each visited word's GP-prime sum **mod29** in the fixed cycle order. Its GP indices are:

```
18,12,15,13,21,8,26,24,24,24,1,24,23,2,17,22,23,
0,25,17,20,14,3,17,14,17,7,1,0,12,6,6,8
```

This exact non-fitted 33-key applied under both Vigenère signs to all **76 original p55 runes** yields GP29 IoC **0.03263158 / 0.03403509**, both ciphertext-like, versus original p55 **0.03922**. The unchanged 729-rune opening chapter also stays near uniform (IoC **0.033879 / 0.033905**). An authentic native GP p57 message is exactly recovered under the corresponding constructed positive key plant. **No plaintext was recovered**, and this rejects only that exact direct-key use.

As a cautious *post-observation* sensitivity comparison, the reproducer shuffled complete encrypted word prime-sums **within each original page**, preserving the special p0 first red word, the p57 TO source, all page word counts and every page's sum multiset. Under a frozen 32-bit LCG random stream seeded `0x33012016`, **4,000** such trials yield **2,560** cycles from the selected opening; **19** cycles have length33 and **94** have length at least33. The observed exact-33 frequency is **19/4,000**, but the 33 predicate was selected *after* examining the real trajectory. It is **not** a calibrated discovery probability. The base58 quotient/remainder hypothesis also followed extensive previous exploratory searches, and number33 is salient for many independent reasons. This comparison cannot establish the map or any author's hidden design.

**Decision:** Preserve the **two red headings → p57 TO/unknown p25 → distinct 33- and 4-coordinate cycles** as one inexpensive, reproducible candidate route. It would only become cryptanalytically actionable if an independent 2014/2016 source specifies what to read on those 33 coordinates, or if one complete original unknown page decrypts from the frozen resulting stream with a withheld-page control. Do not recursively fit values, change modulus or use the cycle length as a stand-alone key claim. Existing global word-to-word plaintext replacement has already been contradicted by adjacent END END runs; this orbit does not rescue that interpretation.

**Source-exact standalone Node22 reproducer:** `sims/lp2_p0_red_wordmap_33cycle_sft.cjs`. Inputs are the original fixed LP2 transcription, 58-page corpus and the printed p50 numeric-page token positions. It asserts the exact original opening, TO first hop, 33-cycle, fixed p55 candidate indices and 4,000-shuffle null.