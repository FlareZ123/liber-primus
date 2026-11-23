# LP1 p05 totient/Möbius-derived GP29 keys: Hill-5 and additive streams negative

## Decision

The source gives a 5×5 numerical magic square B, explicitly names Euler's totient function, includes the word MOBIUS, and uses the 29-symbol Gematria Primus alphabet. Three compact, clue-constrained constructions are:
1. apply phi or the Möbius function mu elementwise to B, reduce modulo 29, and use the resulting matrix as a Hill-5 key;
2. flatten either 25-entry matrix row-major and repeat it as an additive key;
3. use the two prime magic constants, 1033 and 3301, as a two-symbol key after applying phi and reducing modulo 29.

**None decrypts LP2.** Across all 56 unsolved pages, the 16 Hill-5, 8 matrix-additive, and 8 prime-pair additive candidates remain random-like. All full-book best scores are slightly worse than raw ciphertext. A p55-specific Hill framing gives a small quadgram-score increase after selecting the best of 16 candidates, but its output is visibly nonlinguistic and far below the solved p57 positive control. No plaintext or key was recovered.

This is a bounded rejection of these direct number-theoretic GP29 key constructions, not a rejection of every possible use of the p05 number-theory clues.

## Source and hypothesis

The 179-byte LP1 p05 JPEG trailer is already decoded and cross-checked in the following prior work:
- **im-results/lp1-p05-jpeg-mirror-hex1033-changebasis-original-gate.md**
- **sims/lp1_p05_magic_square_nibble_inverse_sft.cjs**
- **im-results/lp1-p05-central-block.txt**

The recovered square is the same third 2014 five-by-five magic square, with all rows, columns, and both main diagonals summing to 1033. That cross-round discovery is prior work; this experiment does not claim it as new.

The LP1 p05 warning explicitly names primes and the totient function; the word matrix includes MOBIUS. The 29-symbol GP alphabet supplies a natural prime-field modulus. The two candidate key matrices are:

\[
K_\phi[r,c]=\phi(B[r,c])\bmod29,\qquad
K_\mu[r,c]=\mu(B[r,c])\bmod29.
\]

A 5×5 matrix over GF(29) naturally suggests Hill-5. Flattening the same source matrix row-major also gives a 25-symbol repeating additive key. Finally, the LP1/2014 magic constants 1033 and 3301 are both prime; their totients reduced modulo 29 give a source-derived two-symbol candidate.

These are compact candidate operations; the source does not explicitly name Hill or Vigenère.

## Exact derived matrices

The recovered source square is:

\[
B=
\begin{bmatrix}
272&138&341&131&151\\
366&199&130&320&18\\
226&245&91&245&226\\
18&320&130&199&366\\
151&131&341&138&272
\end{bmatrix}.
\]

Elementwise totient modulo 29:

\[
K_\phi=
\begin{bmatrix}
12&15&10&14&5\\
4&24&19&12&6\\
25&23&14&23&25\\
6&12&19&24&4\\
5&14&10&15&12
\end{bmatrix},
\qquad \det(K_\phi)=28\pmod{29}.
\]

Elementwise Möbius modulo 29 (with -1 congruent to 28):

\[
K_\mu=
\begin{bmatrix}
0&28&1&28&28\\
28&28&28&0&0\\
1&0&1&0&1\\
0&0&28&28&28\\
28&28&1&28&0
\end{bmatrix},
\qquad \det(K_\mu)=24\pmod{29}.
\]

Both matrix keys are invertible in the GP29 field.

For the two magic constants:

\[
\phi(1033)=1032,\quad \phi(3301)=3300,
\]
\[
(1032\bmod29,\;3300\bmod29)=(17,23).
\]

The tested two-symbol key is therefore [17,23] in chronological LP1-to-2014 order, plus its reverse [23,17].

## Frozen tests

### Hill-5 interpretation

For each candidate matrix, the reproducer tested four natural Hill conventions:
- K inverse (column-vector decryption convention);
- transpose of K inverse (row-vector decryption convention);
- K (opposite direction);
- transpose of K (opposite direction with row-vector convention).

Each was applied in 5-rune blocks under two natural alignments:
- one continuous p0–p55 stream;
- independent phase-zero reset at each page.

Incomplete block tails were left unchanged. No phase or padding search was performed.

A separate p55 check used two already documented source framings: remove the first NG carry, or remove the literal F at local offset 25. Each leaves 75 runes, exactly 15 complete Hill-5 blocks. The same four conventions were tested for both phi and mu.

### Repeating matrix-additive interpretation

The 25 entries of Kphi or Kmu were flattened row-major and repeated as a GP29 additive key. Both directions, C-K and C+K, were tested under continuous-book and page-reset alignment: 2 keys × 2 directions × 2 alignments = 8 candidates.

The earlier p05 experiment already tested the phi-derived additive key on p55. This test extends that candidate to the complete p0–p55 stream and adds the corresponding mu-derived key. No arbitrary phase, key rotation, or alphabet remapping was searched.

### Prime magic-constant pair

Since both 1033 and 3301 are prime, their totients provide two source-derived residues, 17 and 23. The reproducer tested [17,23] and [23,17], both additive directions, and global/page-reset alignment: 8 candidates. No other seed or key values were searched.

### Scoring

The score is the mean smoothed English quadgram log-frequency from **resources/control/duko_round27_english_quadgrams.txt**, after converting GP29 indices through the repository's source-calibrated translit array. This is a ranking diagnostic, not proof of plaintext.

## Results

| Input | Mean quadgram score | GP29 IoC |
|---|---:|---:|
| Raw p0–p55 | -7.440422 | 0.034478 |
| Best of 16 Hill-5 candidates: mu, inverse-transpose, global | -7.461061 | 0.034494 |
| Best of 8 matrix-additive candidates: mu, C-K, global | -7.453372 | 0.034515 |
| Best of 8 prime-pair candidates: reverse order, C+K, page-reset | -7.478973 | 0.034499 |
| Known plaintext p57 positive control | -4.420906 | 0.062710 |

All three full-book families score slightly worse than raw ciphertext and remain far from the known plaintext control.

For p55, the best of 16 source-framed Hill candidates is phi(B) transpose on the remove-literal-F 75-rune framing:
- mean quadgram score: **-7.154399**;
- output begins **DROEPPRULAEFINOOOEDARAELCUMOFEEOIAJTHDTHOFNGBI...**;
- this is not coherent English and remains far below the p57 control.

The small p55 score increase is selected from 16 variants on a 75-rune sample and is not evidence of decryption. The full-book results are the stronger negatives.

## Interpretation and next action

The tested direct constructions do not support:
1. elementwise phi or mu, modulo 29, used as a Hill-5 matrix;
2. the flattened 25-symbol phi or mu matrix repeated as a GP29 additive key;
3. the two prime magic constants transformed by phi and used as a two-symbol GP29 additive key.

Do not continue tuning phase, padding, matrix orientation, key rotation, or other variants without an independent source-visible selector.

The source clues may still select a different operation or a different role for the 1033 square. Such a continuation needs an independent source-visible selector and a discriminating prediction on untouched LP2 ciphertext. Do not promote the 1033/3301 relationship or the p05 reverse artifact to LP2 plaintext.

## Reproduction

Run from repository root:

    node sims/lp1_p05_totient_mobius_hill_original_sft.cjs

The script reconstructs the 1033 matrix from the already verified 360-byte original sidecar, checks the independent 2014 square, derives both number-theoretic matrices and the prime-constant pair, performs the 16 Hill-5, 8 matrix-additive, 8 prime-pair, and 16 p55-framed tests, and prints the exact scores and previews. The earlier version passed Node 22 SFT workflow #928; rerun after the prime-pair extension.
