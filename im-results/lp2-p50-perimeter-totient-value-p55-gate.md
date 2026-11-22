# P50 perimeter Euler-totient-value key test against p55

**Classification:** bounded negative. The source-sized alignment is exact, but the proposed operation does not recover plaintext. No key, plaintext, or authenticated cipher mechanism is established.

## Why this was tested

Three source-derived observations motivate one finite experiment:

1. The original p50 numerical table is a physical 32×8 grid. Its perimeter contains exactly 76 cells.
2. The original p55 page has 76 runes, but its first one-rune word **NG** is carried from p54. Removing that boundary carry leaves 75 body runes.
3. One of the 76 p50 perimeter tokens is **00**. Euler's totient is undefined at zero. Excluding that cell leaves exactly 75 nonzero perimeter values.

The earlier Cicada material supplies two relevant clues: the 2014 source's *circumference* reference suggests reading the table's perimeter, and the LP1 p5 source text explicitly calls out prime numbers and Euler's totient function. The p55 moth also links back to LP1 p5. These observations motivate testing φ(n) mod 29 as an additive key stream; they do not prove that the creator intended this operation.

## Frozen operation

- Input: all 256 original p49–51 two-character tokens from resources/liber-primus/lp2-grid-256.json, reshaped in printed row-major order as 32×8.
- Perimeter: start at the top-left and traverse clockwise across the top, down the right, across the bottom in reverse, and up the left. The opposite direction is the exact reverse.
- The only perimeter zero is at flattened grid index **192** (perimeter position **52**). Exclude it because φ(0) is undefined. The second **00** token is interior at index229 and is not part of the perimeter.
- Numeric interpretations: conventional base60 and the conditional drop-f base59 reading. The printed alphabet contains 60 characters; f is absent from all 256 tokens.
- Key: for each remaining perimeter token, decode its two characters as a base-b integer n, then compute kᵢ=φ(n) mod 29.
- Receiver: the 75 p55 body runes, excluding the carried NG from p54.
- Decryption: Pᵢ=(Cᵢ±kᵢ) mod 29, both signs.
- Also test the exact transparent-plaintext-F branch rule used in prior GP work: a ciphertext F may be a transparent plaintext F that consumes no key; every other branch decrypts normally, with encrypted plaintext F disallowed. Retain all branches without beam search.

This fixes the table orientation, start corner, key length, receiver interval, and operation before examining candidate language.

## Results

All eight direct models (2 radices × 2 directions × 2 signs) produce **zero exact matches** among the 16 output words against the pinned 29,157-entry English lexicon, when requiring at least three GP runes per word.

| Radix | Direction | Sign | Direct lexicon matches | Transparent-F branches | Best transparent-F matches |
|---:|---|---:|---:|---:|---:|
| 60 | Clockwise | − | 0 | 1 | 0 |
| 60 | Clockwise | + | 0 | 2 | 0 |
| 60 | Counterclockwise | − | 0 | 0 | — |
| 60 | Counterclockwise | + | 0 | 0 | — |
| 59 | Clockwise | − | 0 | 0 | — |
| 59 | Clockwise | + | 0 | 0 | — |
| 59 | Counterclockwise | − | 0 | 1 | 0 |
| 59 | Counterclockwise | + | 0 | 0 | — |

No coherent English phrase appears. The transparent-F extension does not rescue the operation: most variants have no legal inverse branch, and the surviving branches have no dictionary words of three or more GP runes.

The exact 75-to-75 correspondence is therefore a structural observation, not a recovered key. It does not justify trying arbitrary start offsets, row/column permutations, alternate cell reductions, or hand-tuned resets. Reopen this branch only if an independent source identifies a different numeric representation or operation.

## Reproduction

Run:

    node sims/lp2_p50_perimeter_totient_value_p55_sft.cjs

The script checks the 32×8 shape, exact perimeter and zero-cell position, p55 carry boundary, 75-rune alignment, all eight direct variants, all transparent-F branches, and the fixed lexicon count. It reads only the repository's original/derived reference files and does not alter them.
