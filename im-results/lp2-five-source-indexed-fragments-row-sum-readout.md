# Five source-indexed five-rune fragments: row-sum readout

**Status: intermediate, reproducible instruction-level candidate. No unknown LP2 plaintext has been established by this result.**

## Result in brief

Using the same inferred 2016-word-index map as the p36 φ-grid state investigation — zero-based signed-message word index (i) selects LP2 page (i), one-based fragment (i+1) — exactly five of the 42 available selected fragments have length five. In physical-page order they are p9/f10, p12/f13, p15/f16, p36/f37, and p40/f41. Their values form a natural 5×5 matrix (C), matching the order of the 2014 Stage04 Wisdom square.

The row sums of (C), reduced modulo the 43 words in the authenticated 2016 message, are:

[
[12,29,30,12,26]
]

Indexing the same signed message gives:

**THE DIRECTION SEEK THE NUMBERS**

This is the strongest observation in this report. It echoes the signed source's explicit instruction that “their numbers are the direction” and “Seek and you will be found.” It is not a free-language-model guess: the five numbers are exact row sums and the 43-word codebook is the authenticated signed message.

Applying the source-derived φ-grid (M=\varphi(S)\bmod29) from the 2014 5×5 square to the five fragment columns, (Y=MC), gives row sums modulo 43:

[
[17,5,21,28,10]longrightarrow
	extbf{THE EPIPHANY IS THE PRIMUS}
]

The main and anti-diagonal sums of (Y), modulo 43, give:

[
[41,40]longrightarrow	extbf{VERIFY PATHS}
]

The inverse-orientation control (M^{-1}C) instead gives row words **ROAD GOOD IS DIRECTION THE**, which is not a comparable instruction. These secondary readouts are supportive but should not be treated as independent plaintext proofs.

## Source selection and exact input

The 2016 signed message contains exactly 43 words under the repository's established `signedWords()` parser. The index convention is an inference already used in the p36 route, not an explicit sentence in the signed message. The p36 anchor is particularly relevant: word index 36 is **GOOD**, and the corresponding p36/f37 five-rune fragment is the previously reported state receiver.

Applying page (i), fragment (i+1) to indices 0–42 yields 42 available objects; p32 has no fragment 33. Their length distribution is:

| Rune length | Count |
|---:|---:|
| 1 | 1 |
| 2 | 10 |
| 3 | 11 |
| 4 | 7 |
| 5 | **5** |
| 6 | 1 |
| 7 | 2 |
| 8 | 4 |
| 10 | 1 |

The five length-5 fragments are therefore a uniquely sized 5×5 group under this source-index convention:

| Page / fragment | GP29 values |
|---|---|
| p9 / f10 | [15,13,14,27,6] |
| p12 / f13 | [28,1,0,15,20] |
| p15 / f16 | [10,13,8,27,17] |
| p36 / f37 | [2,22,4,1,20] |
| p40 / f41 | [0,23,4,28,6] |

They are placed as columns, in ascending page order:

[
C=
\begin{bmatrix}
15&28&10&2&0\\
13&1&13&22&23\\
14&0&8&4&4\\
27&15&27&1&28\\
6&20&17&20&6
\end{bmatrix}
]

The raw row sums modulo 43 are ([12,29,30,12,26]), which index the authenticated word list as **THE / DIRECTION / SEEK / THE / NUMBERS**.

## φ-grid transform and controls

The 2014 square has all five row sums, all five column sums, and both diagonal sums equal to 1033. Applying Euler's totient entrywise and reducing modulo 29 gives the fixed matrix:

[
M=
\begin{bmatrix}
12&15&10&14&5\\
4&24&19&12&6\\
25&23&14&23&25\\
6&12&19&24&4\\
5&14&10&15&12
\end{bmatrix}
]

The source-selected column-vector operation (Y=MC\pmod{29}) is:

[
Y=
\begin{bmatrix}
24&23&17&15&24\\
12&1&2&19&14\\
17&2&25&4&16\\
24&11&11&21&4\\
4&10&22&4&13
\end{bmatrix}
]

- Row sums mod43: ([17,5,21,28,10]) → **THE EPIPHANY IS THE PRIMUS**.
- Main / anti-diagonal sums mod43: ([41,40]) → **VERIFY PATHS**.
- Column sums mod43: ([38,4,34,20,28]) → **BEWARE EMPTY WILL MEANING THE**.
- Inverse control (M^{-1}C) row sums mod43: ([23,36,21,29,12]) → **ROAD GOOD IS DIRECTION THE**.

The source-derived operation and its orientation are fixed by the p36 state-packet result in [the φ-grid selector audit](dh3301_phi29_wisdom_square_selector_audit.md). The new five-column readout extends that investigation; it does not establish a universal cipher.

## Following the raw row-sum direction

The raw row-sum indices ([12,29,30,12,26]) select the next page/fragment objects under the same map:

| Index | Selected object | Length | GP0 sum |
|---:|---|---:|---:|
| 12 | p12/f13 | 5 | 64 |
| 29 | p29/f30 | 4 | 66 |
| 30 | p30/f31 | 3 | 56 |
| 12 | p12/f13 | 5 | 64 |
| 26 | p26/f27 | 3 | 45 |

The adjacent new p29/p30 fragments have numeric feature pairs:

- p29/f30: GP0 sum (66\equiv8\pmod{29}), length 4
- p30/f31: GP0 sum (56\equiv27\pmod{29}), length 3

The already-used p4 H2D transform on the feature matrix ([[8,4],[27,3]]), with feature order **[GP0, length]**, gives ([[9,11],[28,13]]), indexing the signed message as:

**LIBER IS THE WAY**

Reversing the feature order to **[length, GP0]** instead gives **MEANING IS THE WAY**. The shared suffix **IS THE WAY** is stable, but the first word is not. The p12/f13 + p26/f27 same-path control does not reproduce that suffix. This is a promising follow-through, not a fixed decryption: the source does not yet uniquely specify compressing each fragment to [GP0, length] or the feature order.

## Evidence limits and stopping rule

1. The 2016 word-index-to-page/fragment convention is inferred, though it has an existing p36 state-packet anchor. It must be independently reviewed against the original presentation.
2. Row-sum/mod43 is motivated by the 5×5 structure, the 43-word signed codebook, and the signed instruction about numbers and direction. It is not explicitly named as a cipher operation in the source.
3. The φ-grid row and diagonal outputs are instruction-like, but they are not a full LP2 plaintext and should not be promoted to `results/`.
4. The p29/p30 H2D feature result is weaker because [GP0,length] is not yet a source-fixed representation; only “IS THE WAY” is invariant under swapping the two features.
5. The second index set from the (MC) row sums selects fragment lengths [3,4,2,2,3], not another 5×5 group. Do not recursively iterate this branch without a new clue.

**Next decisive work:** independently reproduce the 5×5 selection and raw row-sum phrase; establish whether the source supports the page/fragment index convention and row-sum readout; seek a source-fixed representation for the p29/p30 H2D input. Do not expand into arbitrary feature orderings or further recursive mappings.

**Reproducer:** `node sims/lp2_five_indexed_fragments_row_sum_sft.cjs`.
