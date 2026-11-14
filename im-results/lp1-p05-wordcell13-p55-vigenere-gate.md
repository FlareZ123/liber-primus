# LP1 p05's 13 word cells as a period-13 key for moth-linked LP2 p55

**Classification:** bounded original-cipher negative. No LP2 plaintext, authentic key, or intended cipher recovered.

## Why this was a plausible human solve path

LP1 physical p05 and LP2 physical p55 reuse the same moth illustration. The LP1 p05 5×5 grid contains **13 rune-word cells** and 12 printed numeric cells. Replacing each rune-word with its GP prime-weight sum gives the established 1033 magic square. The p05 red instruction explicitly names primes, the totient function, and encryption.

LP2 p55 ends with a **red 13-dot punctuation mark**. This gives a simple, clue-constrained reason to test the 13 p05 word-cell values alone, rather than the already-tested full 25-cell square, as a period-13 key on the moth-linked p55 page. The solved p56 method supplies a historically demonstrated additive GP29 inverse, `P = C − φ(p) mod 29`, with visible plaintext F symbols allowed to remain literal and not consume key.

The strongest objection is substantial: the 13-dot mark may only be punctuation, not a key-length instruction; selecting only word cells rather than all 25 square cells is an interpretation; and no source explicitly says to repeat the 13 values as a Vigenère key. This is a finite human-solver hypothesis, not an established authorial instruction.

## Frozen source extraction and key

Read the original p05 rows in canonical row-major order and retain only rune-word cells. Sum the GP prime weights of each word. The 13 sums are:

`[341, 366, 199, 130, 320, 245, 91, 226, 320, 130, 199, 366, 341]`

Two natural 13-symbol GP29 keys follow:

- **Prime-sum key:** `[22,18,25,14,1,13,4,23,1,14,25,18,22]`
- **Totient key:** `[10,4,24,19,12,23,14,25,12,19,24,4,10]`

The second is the source-preferred transformation because p05 explicitly names the totient function. The row-major order is fixed by the printed square; no word permutation or fitted phase is used.

The target is original LP2 p55: **76 runes**, beginning with the incoming `NG` carry from p54, with visible F positions **[15, 25, 41]** (zero-based). Its terminal red punctuation mark has **13 dots**, matching the 13 source word cells.

## Frozen inverse

For each key family, test both conventional additive directions, the two natural carry alignments, and every possible literal-F mask:

1. Include the incoming p54 carry rune in the p55 key clock.
2. Leave that one carry rune unchanged and start the key at the first complete p55 word.

The three visible F positions give exactly eight possible literal/non-consuming masks. The complete finite test is therefore:

- 2 key transforms (raw prime sums; `φ(sum)`);
- 2 additive directions;
- 2 carry alignments;
- 8 literal-F masks;
- **64 total original-cipher decoders**.

The key repeats with period 13. No other phase, key permutation, page target, word boundary reset, or cipher family is searched. Every candidate is forward-re-encrypted and reproduces the unchanged original p55 ciphertext exactly. Eight held-out 76-rune GP-English plants also round-trip exactly under the same key/sign/alignment implementation. These are implementation controls, not evidence that the key is authentic.

## Results

The independent GP trigram model is trained on the repository's Emerson control. The held-out Shakespeare 76-rune control and the source-clear p57 page are both strongly language-like under the same model.

| Text / candidate | Trigram score (nats/rune) | IoC |
|---|---:|---:|
| Original p55 ciphertext | **−6.51080** | 0.037895 |
| Best raw prime-sum candidate (add; carry literal; F mask 0) | **−5.50252** | 0.042807 |
| Best totient candidate (subtract; carry literal; F mask 6) | **−5.86723** | 0.032982 |
| Held-out Shakespeare, 76 runes | **−2.38070** | 0.057895 |
| Clear p57 PARABLE page | **−2.21875** | 0.062710 |

The best raw-key candidate is:

`NGEHGNGTUEPTYTHEOAEEDNEECUCTHAEWOHYMXNGAEXPRJEOLGEPOEPETEOFOGAWEARXFPSGEOTTEDNGOHUEAAACJMA`

The best totient-key candidate is:

`NGSSSBODFDOOEJMNGSAEOCCJTJNGIARFIFNYIDAEIAGTWAEEADOFWRBSFAXOEIATMTHCHJBEOMAUGISRGNAIEANGEDRX`

Neither produces sustained GP-English plaintext. Even the best of all 64 variants remains more than 2.8 nats/rune below the held-out English control and about 3.3 nats/rune below the clear p57 control. The modest improvement over raw p55 ciphertext is not evidence of a key: it is the post-selected maximum of 64 candidates, and the source-preferred totient family is weaker than the raw-key maximum.

**Decision:** retire the direct period-13 additive use of the p05 word-cell prime sums or their totients on p55, under the two natural carry alignments, both signs, and all literal-F masks. The moth link and 13/13 count correspondence remain source observations, but they do not establish this cipher. Do not expand this branch into arbitrary phases, permutations, or additional transforms without a new original clue selecting them. This result does not exclude a transposition, nonlinear/stateful use of the square, or another LP2 mechanism.

## Reproduction

Run from the repository root with Node.js 22:

```sh
node sims/lp1_p05_wordcell13_p55_vigenere_gate.cjs
```

The script derives the 13 word-cell sums from `resources/transcriptions/lp1_wulfic_canonical.txt`, checks the p55 13-dot event in `resources/liber-primus/lp2-punctuation-identity.json`, reads the original canonical LP2 corpus, and uses the existing independent language-model and F-interrupter helpers. It asserts the source counts, all 64 exact original reencryption checks, and all eight planted positive controls.

Related work:
- [Full p05/p16 square transfers and matrix tests](magic-square-5x5-direct-pad.md)
- [Moth-linked p55 25-cell rank transposition](lp2-p55-moth-1033-magic-square-rank-path.md)
- [Three historical square interiors on p55](lp2-p55-2014-magic-squares-three-core-hill-original-inverse.md)
- [Authentic solved p56 prime-totient regression](../sims/authentic_decryption_regression.cjs)
