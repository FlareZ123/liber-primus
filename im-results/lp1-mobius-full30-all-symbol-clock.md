# LP1 Möbius full 30-symbol projective alphabet: global-clock gate

**Classification:** exact source-derived 30-point embedding of the LP2 rune-and-word-separator alphabet, followed by four finite global positional inverses. All four are reversible and all planted controls recover exactly; none produces LP2 plaintext. This is a bounded negative for the global all-symbol rotor, not a rejection of the underlying LP1 matrix identity.

## Human-solver hypothesis

The LP1 p05 **MOBIUS** cell has GP-prime sum 226, giving the source-derived seed \(226\bmod29=23\). The p05 and p16 corner matrices are

\[
M_{05}=\begin{pmatrix}11&6\\6&11\end{pmatrix},\qquad
M_{16}=\begin{pmatrix}28&9\\9&28\end{pmatrix}
=21M_{05}^{6}\quad\text{in }PGL_2(\mathbb F_{29}).
\]

Their projective orders are 28 and 14. The LP2 alphabet has 29 GP rune symbols; with the printed word separator, this gives 30 symbols, exactly the 30 points of \(P^1(\mathbb F_{29})\). This suggests completing the existing p05 28-cycle mapping with the two fixed points:

- GP rune EA (index 28) → fixed projective point 28;
- word separator → the other fixed point 1;
- the remaining 28 GP runes (indices 0–27) → the p05 \(M_{05}\) orbit seeded at 23, including projective infinity.

Both \(M_{05}\) and \(M_{16}\) fix 1 and 28, so this embedding preserves EA and spaces. It is a complete bijection, but assigning the remaining fixed point to a word separator is still an interpretation, not an explicit LP2 instruction.

The distinct operation tested here is a **global symbol-position clock**: apply \(M_{05}^{i}\) or \(M_{16}^{i}\) (or its inverse) to the projective point at absolute zero-based position \(i\) in the concatenated stream. The clock advances for every rune and every space; it does not reset at word boundaries. This differs from the already-tested word-local \(M_{05}^{\pm j}\)/\(M_{16}^{\pm j}\) rotors, which reset the exponent within each printed word.

## Frozen data and finite models

The canonical parser preserves words that cross physical page boundaries. The stream contains **2,896 words**, **12,956 runes**, and **2,895 separators**, for **15,851 symbols**. No ciphertext-derived phase or permutation is fitted.

Only four models were tested:

1. \(M_{05}^{i}\)
2. \(M_{05}^{-i}\)
3. \(M_{16}^{i}\)
4. \(M_{16}^{-i}\)

The inverse applies the opposite matrix power at the same absolute symbol position. Because spaces and EA are fixed points, every model preserves all 2,895 word separators.

## Original-cipher results

Raw original GP29 ciphertext: IoC **0.03447840**, top-12 mass **0.42976227**, GP trigram **−14.00447** nats/rune, within-word GP trigram **−13.99008**.

| Global clock | IoC | Top-12 mass | GP trigram | Within-word GP trigram |
|---|---:|---:|---:|---:|
| \(M_{05}^{i}\) | 0.03446862 | 0.43053412 | −14.01904 | −14.01657 |
| \(M_{05}^{-i}\) | 0.03445476 | 0.42922198 | −14.00929 | −13.99005 |
| \(M_{16}^{i}\) | 0.03448106 | 0.43292683 | −14.03934 | −13.99228 |
| \(M_{16}^{-i}\) | 0.03448009 | 0.43146033 | −13.99303 | −13.99063 |

The best flat score, \(M_{16}^{-i}\), is only 0.01144 nats/rune above the raw ciphertext. The previews are nonlinguistic; the score remains near the raw stream rather than approaching the native-English reference in the existing paired-square SFT. The small score differences among four fixed models are not evidence of a key.

## Reversibility controls

For each model, a native-English Emerson GP control was truncated to 12,956 runes, split into the original 2,896 word lengths, and encoded with the same global clock. All four inverse implementations recovered **12,956/12,956 runes and all 2,895 spaces exactly**. Each original LP2 inverse also re-enciphers exactly. These are implementation controls, not authentication of the candidate cipher.

Reproducer: [sims/lp1_mobius_full30_all_symbol_clock_sft.cjs](../sims/lp1_mobius_full30_all_symbol_clock_sft.cjs). Existing word-local controls: [lp1_mobius_full28_word_rotor_sft.cjs](../sims/lp1_mobius_full28_word_rotor_sft.cjs) and [lp1_mobius_word_rotor_sft.cjs](../sims/lp1_mobius_word_rotor_sft.cjs).

## Decision

Retire this exact global all-symbol positional rotor under the complete 30-symbol \(P^1(\mathbb F_{29})\) embedding. The embedding is mathematically neat and the p05/p16 matrix relation remains established, but the original output is still ciphertext-like. Do not expand into arbitrary phase offsets, page/line resets, or new matrix choices. A further PGL2 attempt needs an independent original clue selecting a different state update or plaintext representation, not another clock fitted to the same ciphertext.

**Outcome:** no unknown plaintext, authentic key, or intended destination recovered.
