# LP1 p05's 13-unit key candidates for moth-linked LP2 p55

**Classification:** bounded original-cipher negative. No LP2 plaintext, authentic key, or intended cipher recovered.

## Why this was a plausible human solve path

LP1 physical p05 and LP2 physical p55 reuse the same moth illustration. The LP1 p05 5×5 mixed grid contains **13 rune-word cells** and 12 printed numeric cells. Replacing each rune-word with its GP prime-weight sum gives the established 1033 magic square. The p05 red instruction explicitly names primes, the totient function, and encryption.

LP2 p55 ends with a **red 13-dot punctuation mark**. This gives a simple reason to test 13-unit key candidates on the moth-linked p55 page. A second, more specific phrase candidate comes from the p05 central column: the p57 PARABLE's “shed our own circumferences” and “find the divinity within” can be read as moving inward from the bottom perimeter through the inner ring to the center, yielding **CABAL → UOID → FORM**, exactly 13 GP runes. The 2016 signed message says **“words are the map, numbers are the direction.”**

The strongest objection remains: the 13-dot mark may only be punctuation, the bottom-to-center route is interpretive, and no source explicitly says to repeat either numeric values or a phrase as a Vigenère key. The direct GP-Vigenère and columnar uses of `CABALUOIDFORM` were already tested in [the consolidated 2014 direction-map report](2014-magic-square-direction-map.md). The new phrase test here is specifically the p05/p56-derived φ(GP-prime-weight-of-key-rune) variant.

## Frozen source extraction and keys

Read the original p05 rows in canonical row-major order and retain only rune-word cells. Sum the GP prime weights of each word. The 13 sums are:

`[341, 366, 199, 130, 320, 245, 91, 226, 320, 130, 199, 366, 341]`

Two numeric 13-symbol GP29 additive keys follow:

- **Prime-sum key:** `[22,18,25,14,1,13,4,23,1,14,25,18,22]`
- **Totient key:** `[10,4,24,19,12,23,14,25,12,19,24,4,10]`

The p05 central-column route gives a separate phrase key:

- **Phrase:** `CABAL UOID FORM` → `CABALUOIDFORM` (13 GP runes)
- **GP prime weights:** `[13,97,61,97,73,3,7,31,89,2,7,11,71]`
- **φ(prime weight) mod 29:** `[12,9,2,9,14,2,6,1,1,1,6,10,12]`

This last transformation follows the p05 prime/totient instruction and the already-solved p56 `φ(prime)` mechanism. It is a clue-motivated extension, not an established global key rule.

The target is original LP2 p55: **76 runes**, beginning with the incoming `NG` carry from p54, with visible F positions **[15, 25, 41]** (zero-based). Its terminal red punctuation mark has **13 dots**.

## Frozen tests

### Period-13 additive keys

For each numeric key family and the central-column phrase key, test both additive directions, the two natural carry alignments, and every possible literal-F mask:

1. Include the incoming p54 carry rune in the p55 key clock.
2. Leave that one carry rune unchanged and start the key at the first complete p55 word.

The three visible F positions give exactly eight possible literal/non-consuming masks. This gives **96 additive decoders**: three key families × two directions × two carry alignments × eight F masks. Each key repeats with period 13. No other phase, key permutation, word-boundary reset, or target is searched.

### Thirteen-column numerical-rank transposition

Use the 13 numeric word-cell values as a columnar key. Write the p55 target row-wise into 13 columns, then read columns in stable ascending or descending numeric-key order; test the exact inverse permutation. Apply both raw prime sums and full totients as ordering values, with the same two carry alignments. This gives **8 fixed transpositions**. Equal values retain their printed row-major order; there are no tie permutations, rotations, padding choices, or fitted routes.

### Additional source-length-matched 5-bit XOR consumer

The same original LP1 p05 source also supplies **76 literal GP rune symbols** when its thirteen rune-word cells are concatenated in printed row-major order, exactly the length of LP2 p55's **76** published GP ciphertext runes. This is a separate source-length coincidence from the 13-dot punctuation / 13-word numeral-key branch. Retain the exact original 76-symbol values rather than summing each of the thirteen cells.

One elementary reversible alternative to the already tested GP29 addition is literal **5-bit XOR** of the 76 GP rune indices, with a 32-value intermediate alphabet. Test the printed source key and its complete reversal. Because the source authentic GP29 alphabet has only indices 0–28, a resulting XOR value **29, 30, or 31** is an exact impossible-symbol witness. Also respect the solved-Cicada F-interrupter: all combinations of whether each original ciphertext F at offsets **15,25,41** passes unenciphered and does not consume a key symbol must be admitted. The resulting 2 orientations × 8 masks = **16** finite original-source consumers are fully checked; no fitted phrase, offset, key position or alternate alphabet is introduced. Planted GP29 native-rune XOR roundtrips check 76 positions in both key directions.

Every candidate is forward-replayed to reproduce the original ciphertext exactly. Twelve held-out 76-rune GP-English plants round-trip under the additive implementations, and eight under the columnar implementation. These validate the code, not the historical cipher hypotheses.

## Results

The independent GP trigram model is trained on the repository's Emerson control. The held-out Shakespeare 76-rune control and the source-clear p57 page are both strongly language-like under the same model.

| Text / candidate | Trigram score (nats/rune) |
|---|---:|
| Original p55 ciphertext | **−6.51080** |
| Best numeric raw-sum candidate (add; carry literal; F mask 0) | **−5.50252** |
| Best numeric totient candidate (subtract; carry literal; F mask 6) | **−5.86723** |
| Best central-column phrase candidate, either sign (add; carry literal; F mask 7) | **−5.73744** |
| Best central-column phrase candidate, source-preferred subtract direction (carry literal; F mask 7) | **−6.12681** |
| Best columnar raw-sum candidate (ascending; carry literal) | **−6.08780** |
| Best columnar totient candidate (ascending; carry literal) | **−6.29333** |
| Held-out Shakespeare, 76 runes | **−2.38070** |
| Clear p57 PARABLE page | **−2.21875** |

The best source-preferred phrase-key subtractive candidate is:

`NGPIHIAUSHEXJFPMPFEOEHLEAUOTIAFHFWEAEJEAWEGEXOENGOFCAEOOORYEONCPFCGOOFOERPAENGRIARNOETHXNNGOTR`

The best phrase-key candidate across both signs is the opposite-sign control:

`NGHEAEOTFMLLTPEORXHFWYYMOPCEFFLLTHPXSBGOEELTARDFFLNGWNGOUAJWSEOAEUIANGRJOBHDGFTFBYOPITHLT`

Neither produces sustained GP-English plaintext. The best of all **104** variants is still more than 3.1 nats/rune below the held-out English control and about 3.3 nats/rune below the clear p57 control. The modest score improvements over raw p55 ciphertext are post-selected maxima, not evidence of an authentic key.

### 76-cell XOR capacity result

Using the same untouched p55 source, **all 16 source-fixed XOR5 variants fail GP29 alphabet closure or the literal-F rule**, before invoking any language score. In printed order, each of the eight F masks already fails at original 0-based rune positions **3, 6 and 9**, before the earliest possible F bypass at 15. Their counts of invalid output positions are **[11,7,9,8,11,7,9,9]**. Reversing the complete 76-rune LP1 key also fails for all eight masks, with invalid counts **[4,5,5,7,4,5,5,11]** and first failure at position 16 or 24. The direct no-bypass printed variant alone produces out-of-alphabet values 29–31 at **[3,6,9,39,40,50,57,75]**. These are *capacity impossibilities* for this exact source key and operation, independent of English-register assumptions. The [source-pinned CJS reproducer](../sims/lp1_p05_p55_xor5_ftransparent_sft.cjs) was independently executed on the committed original inputs under a V8 Node-built-in adapter and passed all 16 exact assertions and both planted positives.

**Decision:** retire this fixed 76-rune XOR/F-bypass consumer alongside the direct period-13 additive use of p05 word-cell prime sums or their totients on p55; the φ(GP-prime-weight) use of the central-column phrase; and the corresponding 13-column numeric-rank transposition, under the frozen alignments and operations above. The moth link, 13/13 count correspondence, bottom-to-center phrase, and 2016 words/map/numbers/direction message remain source observations; they do not establish these ciphers. The already-tested direct GP-Vigenère and columnar uses of `CABALUOIDFORM` are summarized in the linked direction-map report. Do not expand this branch into arbitrary phases, permutations, or additional transforms without a new original clue selecting them. This result does not exclude a nonlinear/stateful use of the square or another LP2 mechanism.

## Reproduction

Run from the repository root with Node.js 22:

```sh
node sims/lp1_p05_wordcell13_p55_vigenere_gate.cjs
```

The script derives the 13 word-cell sums from `resources/transcriptions/lp1_wulfic_canonical.txt`, derives the central-column phrase in GP from the canonical mapping, checks the p55 13-dot event in `resources/liber-primus/lp2-punctuation-identity.json`, reads the original canonical LP2 corpus, and uses the existing independent language-model and F-interrupter helpers. It asserts the source counts, all 96 additive and 8 transposition original-replay checks, and all 20 planted positive controls.

Related work:
- [Authoritative 2014 p05 word/number and direction-map synthesis](2014-magic-square-direction-map.md)
- [Full p05/p16 square transfers and matrix tests](magic-square-5x5-direct-pad.md)
- [Moth-linked p55 25-cell rank transposition](lp2-p55-moth-1033-magic-square-rank-path.md)
- [Three historical square interiors on p55](lp2-p55-2014-magic-squares-three-core-hill-original-inverse.md)
- [2016 signed message](../resources/cicada2016-4gq25.md)
- [Authentic solved p56 prime-totient regression](../sims/authentic_decryption_regression.cjs)
