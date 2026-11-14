# LP1 p05's 13 word cells as a key for moth-linked LP2 p55

**Classification:** bounded original-cipher negative. No LP2 plaintext, authentic key, or intended cipher recovered.

## Why this was a plausible human solve path

LP1 physical p05 and LP2 physical p55 reuse the same moth illustration. The LP1 p05 5×5 grid contains **13 rune-word cells** and 12 printed numeric cells. Replacing each rune-word with its GP prime-weight sum gives the established 1033 magic square. The p05 red instruction explicitly names primes, the totient function, and encryption.

LP2 p55 ends with a **red 13-dot punctuation mark**. This gives a simple reason to test the 13 p05 word-cell values alone, rather than repeat the already-tested full 25-cell square, as a 13-symbol key on the moth-linked p55 page. A second natural reading is numeric-rank transposition: the 2016 signed message says **"words are the map, numbers are the direction"**, which could direct the solver to use the word-cell values as a column order.

The strongest objection is substantial: the 13-dot mark may only be punctuation, not a key-length or width instruction; selecting only word cells rather than all 25 square cells is an interpretation; and no source explicitly says to repeat these 13 values as a Vigenère key or to sort them as a columnar-transposition key. These are finite human-solver hypotheses, not established authorial instructions.

## Frozen source extraction and keys

Read the original p05 rows in canonical row-major order and retain only rune-word cells. Sum the GP prime weights of each word. The 13 sums are:

`[341, 366, 199, 130, 320, 245, 91, 226, 320, 130, 199, 366, 341]`

Two 13-symbol GP29 additive keys follow:

- **Prime-sum key:** `[22,18,25,14,1,13,4,23,1,14,25,18,22]`
- **Totient key:** `[10,4,24,19,12,23,14,25,12,19,24,4,10]`

The totient key is the source-preferred additive transformation because p05 explicitly names the totient function. For the separate rank-transposition test, the full integer prime sums and full integer totients are used as ordering values, not reduced modulo 29. Ties are resolved by the original printed row-major order.

The target is original LP2 p55: **76 runes**, beginning with the incoming `NG` carry from p54, with visible F positions **[15, 25, 41]** (zero-based). Its terminal red punctuation mark has **13 dots**, matching the 13 source word cells.

## Frozen tests

### Period-13 additive key

For each additive key family, test both conventional additive directions, the two natural carry alignments, and every possible literal-F mask:

1. Include the incoming p54 carry rune in the p55 key clock.
2. Leave that one carry rune unchanged and start the key at the first complete p55 word.

The three visible F positions give exactly eight possible literal/non-consuming masks. This gives **64 additive decoders**: two key transforms × two directions × two carry alignments × eight F masks. The key repeats with period 13. No other phase, key permutation, word-boundary reset, or target is searched.

### Thirteen-column numerical-rank transposition

Use the same 13 word-cell values as a columnar key. Write the p55 target row-wise into 13 columns, then read columns in stable ascending or descending numeric-key order; test the exact inverse permutation. Apply both raw prime sums and full totients as the ordering values, with the same two carry alignments. This gives **8 fixed transpositions**. Equal values retain their printed row-major order; there are no tie permutations, rotations, padding choices, or fitted routes.

Every additive and transposition candidate is forward-replayed to reproduce the original ciphertext exactly. Eight held-out 76-rune GP-English plants round-trip under the additive implementation, and eight under the columnar implementation. These validate the code, not the historical cipher hypotheses.

## Results

The independent GP trigram model is trained on the repository's Emerson control. The held-out Shakespeare 76-rune control and the source-clear p57 page are both strongly language-like under the same model.

| Text / candidate | Trigram score (nats/rune) |
|---|---:|
| Original p55 ciphertext | **−6.51080** |
| Best additive raw-sum candidate (add; carry literal; F mask 0) | **−5.50252** |
| Best additive totient candidate (subtract; carry literal; F mask 6) | **−5.86723** |
| Best columnar raw-sum candidate (ascending; carry literal) | **−6.08780** |
| Best columnar totient candidate (ascending; carry literal) | **−6.29333** |
| Held-out Shakespeare, 76 runes | **−2.38070** |
| Clear p57 PARABLE page | **−2.21875** |

The best additive raw-sum candidate is:

`NGEHGNGTUEPTYTHEOAEEDNEECUCTHAEWOHYMXNGAEXPRJEOLGEPOEPETEOFOGAWEARXFPSGEOTTEDNGOHUEAAACJMA`

The best additive totient candidate is:

`NGSSSBODFDOOEJMNGSAEOCCJTJNGIARFIFNYIDAEIAGTWAEEADOFWRBSFAXOEIATMTHCHJBEOMAUGISRGNAIEANGEDRX`

The best columnar raw-sum candidate is:

`NGSEACXBMAECEATHFJEEIUMHSMPEAEXUSSMWSEODIHIFIBTHEOCREOCIAWNGGIAMEOETHXBGEOPSLXAUICTHDEADEFBEOGB`

None produces sustained GP-English plaintext. Even the best of all tested variants remains more than 2.8 nats/rune below the held-out English control and about 3.3 nats/rune below the clear p57 control. The modest score improvements over raw p55 ciphertext are post-selected maxima over 72 variants, not evidence of an authentic key.

**Decision:** retire the direct period-13 additive use of the p05 word-cell prime sums or their totients on p55, and the corresponding 13-column numeric-rank transposition, under the frozen alignments and operations above. The moth link, 13/13 count correspondence, and 2016 words/map/numbers/direction message remain source observations; they do not establish either cipher. Do not expand this branch into arbitrary phases, permutations, or additional transforms without a new original clue selecting them. This result does not exclude a nonlinear/stateful use of the square or another LP2 mechanism.

## Reproduction

Run from the repository root with Node.js 22:

```sh
node sims/lp1_p05_wordcell13_p55_vigenere_gate.cjs
```

The script derives the 13 word-cell sums from `resources/transcriptions/lp1_wulfic_canonical.txt`, checks the p55 13-dot event in `resources/liber-primus/lp2-punctuation-identity.json`, reads the original canonical LP2 corpus, and uses the existing independent language-model and F-interrupter helpers. It asserts the source counts, all 64 additive and 8 transposition original-replay checks, and all 16 planted positive controls.

Related work:
- [Full p05/p16 square transfers and matrix tests](magic-square-5x5-direct-pad.md)
- [Moth-linked p55 25-cell rank transposition](lp2-p55-moth-1033-magic-square-rank-path.md)
- [Three historical square interiors on p55](lp2-p55-2014-magic-squares-three-core-hill-original-inverse.md)
- [2016 signed message](../resources/cicada2016-4gq25.md)
- [Authentic solved p56 prime-totient regression](../sims/authentic_decryption_regression.cjs)
