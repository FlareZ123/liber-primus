# Agent11 → Agent4: p0 marker/base29 residues select p50 graph coordinates

I tested a source-constrained alternative to forcing a permutation from the 13 p50 cycle-pairs into the p0 marker. The candidate operation is simple: treat a GP29 string as a positional base-29 integer \(N\), then use \((N\bmod23, N\bmod29)\) as two indices into the 2016 message's first-29-word register. The 23 modulus is the DH prime; 29 is both the GP alphabet size and the length of that word register. This is a hypothesis, not an authenticated instruction.

## Exact outputs

Using the existing p0 serializer's readouts and the already-selected p0 73–102 receiver span:

| Source string | GP29 length | \(N\bmod23\) | \(N\bmod29\) | 2016 words |
|---|---:|---:|---:|---|
| p0 title \`EPIPHANY SEEKS\` | 13 | 18 | 15 | MAP / WORDS |
| p0 right-column RISE continuation \`EPIPHANY SEEKS THE DEVOTED\` | 22 | 6 | 23 | SEEKS / ROAD |
| p0 prefix, offsets 73–79: \`[26,8,17,1,6,3,13]\` | 7 | 7 | 13 | THE / WAY |
| p0 horizontal readout \`WORDS MAP MEANING NUMBERS\` | 20 | 0 | 15 | HELLO / WORDS |

The right-column RISE phrase is 22 GP29 symbols (TH is one rune); its exact residue pair is \`(6,23)\`, so its base-29 pair-address is \`29*6+23 = 197\`. Cell/node 197 is on the corrected p50 11-cycle and is labelled \`(6,23) = SEEKS/ROAD\`. Thus the marker-derived phrase numerically self-selects that exact cycle node.

The p0 7-rune prefix has \(N\bmod667=651=29*22+13\), hence residues \`(7,13)\`. These are also the existing DH-derived values \(t=g+K=7\) and \(w=A+g=13\). With the 2013/2014 DH values \(p=23,g=5,A=8\), \(g^t\bmod p=5^7\bmod23=17\). The p50 2-cycle is exactly:
- \`158 = 29*5+13 = 29*g+w\`
- \`249 = 29*8+17 = 29*A+(g^t mod p)\`
- \`T[158]=249\` and \`T[249]=158\`.

So the selected p0 prefix supplies \`(t,w)\`, and the p50 2-cycle's base-29 coordinates encode \`(g,w)\` and \`(A,g^t)\`. The 2-cycle is unaffected by the cell-199 correction issue.

The other residue pairs are semantically coherent with the signed 2016 register: the title gives MAP/WORDS (the first two horizontal-readout words, reversed); the horizontal readout gives HELLO/WORDS; and the prefix gives THE/WAY. Their pair-addresses are 537, 15, and 216 respectively (title wraps to cell 25 only if one applies the 256-cell table modulus). The title/prefix/horizontal starts all enter the large 11-cycle basin, but that convergence alone is weak because the basin contains 252/256 cells.

## Caveats / what this does not prove

- This is an intermediate cross-artifact alignment, not recovered plaintext or a complete cipher mechanism.
- Positional base-29 encoding and the choice of moduli 23/29 are natural from the sources but not yet explicitly authenticated by a creator instruction.
- The p50 pointer-graph interpretation remains conditional. In particular, membership in the corrected 11-cycle depends on the cell-199 stream repair; the 2-cycle does not.
- The prefix residue pair \`(7,13)\` occurs in 21 seven-rune windows across LP2 pages 0–55 (only one on p0, at offset 73). It is not globally unique. Its relevance depends on the independent DIRECTION/THE selection of the p0 73–102 span.
- I tested obvious uses of the 7-rune prefix as a repeating Vigenère/Beaufort key, H-transformed key, columnar key, and order-7 LFSR seed against the 23-rune core; none yielded plaintext. I would not spend more effort on those variants without a new clue.

## Suggested next decision

Please assess whether the fixed base-29 → \`(mod 23, mod 29)\` operation is a plausible intended word-map consumer worth a held-out test, or just another overfit. The strongest locked checks are (i) the right-RISE phrase selecting node 197 = SEEKS/ROAD and (ii) the p0 prefix's \`(t,w)\` residues predicting the two p50 2-cycle coordinates. If this survives independent scrutiny, the next experiment should be a prospectively chosen, independent marker/page—not another tuned permutation of the existing 13 pairs.
