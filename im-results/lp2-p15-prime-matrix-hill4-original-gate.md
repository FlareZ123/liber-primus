# p15 Fibonacci-prime 4×4 grid as a Hill-4 key: original-cipher gate

**Status:** bounded negative. No LP2 plaintext, authentic key, or intended operation recovered.

## Human-solve-path hypothesis

LP2 physical p15 is preserved as `resources/liber-primus/32.jpg` (the archive mapping is documented in `resources/liber-primus/README.md`). The original image presents a 4×4 numerical grid, a red 3299 cell, a Fibonacci-prime spiral, and a hand-drawn infinity mark.

A technically literate solver who recognizes the 29-symbol Gematria Primus alphabet could reasonably try the displayed 4×4 object as a classical Hill-cipher key over GF(29). The infinity mark makes continuous application a plausible receiver, though it does not identify Hill cipher specifically. This test therefore asks a sharply bounded question: does the p15 grid, interpreted as a 4×4 matrix in either of its two natural numeric forms, directly invert the original LP2 rune stream?

This is distinct from the already-tested PGL(2,29)/Möbius interpretation of the infinity mark and from the p15 Fibonacci-autokey/prime-clock studies. It does not claim that the creator intended a Hill cipher.

## Exact source-derived matrices

The visible grid is:

\[
N =
\begin{bmatrix}
3258&3222&3152&3038\\
3278&3299&3298&2838\\
3288&3294&3296&2472\\
4516&1206&708&1820
\end{bmatrix}.
\]

Reading the 4×4 cells from the red 3299 origin in the documented spiral order yields the Fibonacci ordinals

\[
F =
\begin{bmatrix}
13&21&34&55\\
8&0&1&89\\
5&3&2&144\\
987&610&377&233
\end{bmatrix}.
\]

For each cell, the displayed number is \(\lvert3301-p_{F+1}\rvert\), where \(p_n\) is the nth prime. The recovered prime-value matrix is therefore:

\[
P =
\begin{bmatrix}
43&79&149&263\\
23&2&3&463\\
13&7&5&829\\
7817&4507&2593&1481
\end{bmatrix}.
\]

The p378 entry is 2593; the corrected SFT derives all prime values from the ordinal list and asserts the full grid relation rather than relying on a hand-entered prime table.

The most source-derived Hill key candidate is \(P\bmod29\):

\[
K =
\begin{bmatrix}
14&21&4&2\\
23&2&3&28\\
13&7&5&17\\
16&12&12&2
\end{bmatrix},
\qquad \det(K)=10 \pmod{29}.
\]

It is invertible, with

\[
K^{-1} =
\begin{bmatrix}
10&25&0&17\\
3&16&12&19\\
8&19&28&10\\
28&25&21&24
\end{bmatrix}
\pmod{29}.
\]

The literal displayed-number matrix \(N\bmod29\) is also invertible (determinant 17). Both matrices were tested in the printed row-major layout and after reflowing the source spiral sequence into row-major order.

## Receiver and controls

For a standard Hill-4 receiver, each consecutive four-rune ciphertext block \(C\) is decrypted as \(P=K^{-1}C\bmod29\). The test also includes the direct-matrix interpretation and both row- and column-vector conventions. It does not insert page resets, padding, or an additional key schedule.

Two exact original-cipher scopes were tested:

- The continuous p0–p55 rune tape: 12,956 symbols, exactly divisible by four.
- The immediate p16–p22 continuation after the p15 numeric page: 1,744 symbols, also exactly divisible by four.

The finite candidate family is 16 configurations per scope: two source-derived numeric matrices × two natural layouts × two vector conventions × two transform directions.

A 1,744-rune source-native GP29 control was taken from the preserved solved-native corpus. Every invertible matrix and both vector conventions passed exact encrypt/decrypt recovery on that control. This validates the implementation and matrix inversion only; round-trip correctness is not evidence for a historical key.

## Results

| Measure | Full p0–p55 | p16–p22 |
|---|---:|---:|
| Original ciphertext IoC | 0.03447840 | 0.03450960 |
| Lowest candidate IoC | 0.03444396 | 0.03418918 |
| Highest candidate IoC | 0.03452207 | 0.03483923 |
| Native 1,744-rune control IoC | 0.06049361 | 0.06049361 |

The source-derived prime matrix in printed row-major order, standard column-vector decryption, gives IoC 0.03446499 on p0–p55 and 0.03440367 on p16–p22. The literal displayed matrix and the spiral-reflow alternatives likewise remain near the original uniform-ciphertext statistic. No candidate produces an English-like GP29 distribution or a recognizable plaintext.

The corrected standalone Node 22 SFT passed on Windows GitHub Actions: [run 45812953866](https://github.com/FlareZ123/liber-primus/actions/runs/45812953866). It uploads the full per-configuration JSON as the `source-test-output` artifact. The first runner attempt caught a manually transcribed p378 error; the final SFT computes the prime sequence directly and asserts the displayed-grid relation before testing any receiver.

Reproduce with:

```sh
node sims/lp2_p15_prime_matrix_hill4_sft.cjs
```

## Decision

Reject the direct, one-layer Hill-4 receiver for these source-defined p15 matrices, layouts, directions, and continuous scopes. The negative is meaningful because the 4×4 object, 29-symbol alphabet, prime construction, and exact block divisibility supply a plausible human route, and the test has a source-native positive control.

This does **not** reject a layered cipher, a different independently sourced matrix operation, or a stateful use of the p15 material. No such extension is justified by this test alone. Do not continue with arbitrary matrices, offsets, or tuned block variants without a new source clue selecting them.

This is an intermediate exclusion, not an established discovery; the overall authoritative synthesis in `results/README.md` is unchanged.