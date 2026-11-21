# Source-derived full-rank Hill-4 quotient: original p40–p53 and p54–p55 receiver tests

**Status:** direct plaintext-consumer hypothesis negative on the full p40–p53 floral receiver and the previously tested p54/p55 terminal receivers. The source-derived operator, inverse, exact forward reconstruction, and positive controls all pass.

## Fixed source-derived operator

The operator is frozen from three independent artifacts:

- p15 supplies the Fibonacci-sign-corrected 4×4 matrix
  \[
  M=\begin{bmatrix}
  10&3&20&22\\
  1&22&21&25\\
  11&17&19&7\\
  8&12&12&22
  \end{bmatrix}.
  \]
- The p39 red triad is \([27,5,15]\), giving the monic factor \(G(X)=(X-24)^2\) over GF(29).
- The original p50 256-cell table supplies the 256 coefficients \(P\), reduced mod 29. Its SHA-256 is \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.

The exact high-first quotient \(R(X)=P(X)/G(X)\) has 254 coefficients and zero remainder. Evaluating the full quotient at M gives the fixed full-rank operator

\[
R(M)=\begin{bmatrix}
21&27&22&0\\
28&10&13&22\\
12&0&9&13\\
12&24&7&3
\end{bmatrix},
\quad
R(M)^{-1}=\begin{bmatrix}
10&15&11&26\\
28&16&11&9\\
26&28&5&5\\
4&27&11&6
\end{bmatrix}.
\]

The quotient is not interchangeable with the singular \(P(M)\) or the shortened identity \(12M+15I\). The reproducer recomputes the quotient from the original table and asserts both matrix products equal identity.

## Receiver selection and distinction from earlier work

The p39 red factor and p40 red heading both select root 24. The original p40 ink annotation has an 8-rune red span at the start; the p40 scan begins immediately after p39. The present receiver includes that red heading.

The earlier p40–p53 “black-body” negative in \`lp2-p15-p39-signed-matrix-eigen-crosslink.md\` is a **different operator**: an M-eigenvector additive pad on the 3,000-rune body after excluding p40's red 8-rune heading. It is not this full-rank quotient Hill-4 transform. The quotient operator had previously been tested only on p54 and p55. This test therefore covers the previously untested full 3,008-rune p40–p53 receiver, including the red heading.

The canonical corpus page counts are p40–p53: 231, 273, 272, 274, 273, 270, 270, 274, 271, 66, 0, 92, 263, 179, totaling **3,008 runes = 752 four-rune blocks**. p50 is the numerical table and contributes zero runes. The transcription omits that table: blocks 0–49 map to p0–p49 and blocks 50–56 map to p51–p57. The reproducer explicitly checks each of the 13 textual page blocks against the corpus before preserving its word boundaries in the transformed output. The rune clock is continuous from the first p40 rune through p53; no page reset or phase search is used.

## Fixed test and results

Both directions were applied to the complete 3,008-rune p40–p53 stream in consecutive printed-order vectors of four, with no reset:

- \(R(M)\) applied to the original stream.
- \(R(M)^{-1}\) applied to the original stream.

Both opposite-direction transforms exactly reconstruct the original ciphertext. This is the expected algebraic property of an invertible matrix, not evidence of decryption.

| Diagnostic | Original p40–p53 | \(R(M)\) output | \(R(M)^{-1}\) output |
|---|---:|---:|---:|
| Rune IoC | 0.034543 | 0.034601 | 0.034440 |
| LP1-only character-bigram log score | −3.481255 | −3.466956 | −3.525773 |

The fixed \(R(M)\) direction improves the bigram score by only 0.0143 per character; the inverse direction is worse. Both remain far below the held-out authentic plaintext controls: p56 scores −2.495522 and p57 scores −2.533368. The word-boundary-preserving output begins:

**\(R(M)\):**
\`DIT NGNGFAJ. OMIAOEG LINAE TS ...\`

**\(R(M)^{-1}\):**
\`CWP EAEPHJ. ENGEAOH YOST AEU ...\`

The complete output contains no substantial coherent GP-native plaintext. The per-page scores and full word-boundary-preserving previews are emitted by the reproducer.

### Source-native positive controls

The p56 plaintext control is the 85-rune GP encoding of:

\`AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE\`

It is authenticated before use: applying the original p56 prime-minus-one stream, with the literal F at offset 56 not consuming a key value, exactly recreates the original p56 ciphertext; 84 key values are consumed. The p57 parable is the separate 95-rune clear-text control.

Each control was repeated to 3,008 runes, transformed by \(R(M)\) and by \(R(M)^{-1}\), and recovered exactly by the opposite matrix. Thus the positive controls verify the four-rune serialization, both directions, and the implementation on authentic GP plaintext. They do not validate the candidate as an LP2 cipher.

The earlier p54/p55 results remain unchanged: p54 (232 runes) and p55 (76 runes) also produce nonlinguistic outputs in both directions, with exact reconstruction and a p57 planted-text control.

## Decision

The full-rank quotient is a reproducible algebraic object, but the direct Hill-4 plaintext-consumer hypothesis fails on the strongest remaining p40–p53 receiver as well as p54/p55. The slight bigram-score movement is not coherent plaintext and does not justify tuning. The strongest rival remains that the quotient is an integrity/algebraic construction rather than a direct text cipher.

Close the exact consumer as negative. Do not search other block orders, matrix powers, phases, resets, alphabets, or page receivers without a new source-selected instruction. No unknown plaintext, authentic LP2 key, or destination was recovered.

## Reproduction

- Script: \`sims/lp2_p50_p39_signedp15_quotient_matrix_p55_sft.cjs\`
- Original inputs: \`resources/liber-primus/lp2-corpus.json\`, \`lp2-transcription.txt\`, \`lp2-grid-256.json\`, and the original p15/p39/p40/p50 scans.
- Existing terminal-page evidence: this report's earlier p54/p55 test is retained in the same script.
