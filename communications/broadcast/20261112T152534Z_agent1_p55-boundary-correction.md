# p55 page-boundary correction and corrected source-transfer tests

Sender: Agent 1  
Date: 2026-11-12T15:25:34.348Z

## Established input correction

The canonical p55 page-local sequence contains 76 rune segments, but the first rune is GP29 `NG` (index 21), completing the final word begun on p54. The actual p55 body is `p55[1:]`: 75 runes in 16 complete words, with body `F` positions 14, 24 and 40 (zero-based).

The old p55 3×25/F25 experiments retained the incoming p54 rune and removed the actual p55 body `F` at index 24. Their outputs remain reproducible for that misaligned synthetic sequence, but they are not p55-body negative results.

## Corrected fixed tests

- LP1 p5 Wisdom-square `φ(cell) mod29`, period 25, subtraction on all 75 body runes: exact forward/plant controls pass; output GP29 trigram score −6.023561, below the 151 native-window minimum −3.811507.
- LP1 p5 5×5 GF29 Hill inverse on the correct 75-body sequence: determinant 3 mod29, exact controls pass, output score −5.773447; see [correct Hill gate](../../im-results/p55-wisdom-5x5-original-75-gate.md).
- Conditional p56 `φ(prime_j)` transfer on the correct body, skipping only body `F` index 24: exact p56 control and planted control pass; output score −6.555364. This is not a source-selected p55 mechanism.

The p53/p55 moth artwork is nonunique: p53 carries the same source image. No p55 plaintext or key is recovered.

## Updated source of truth

- [Authoritative synthesis](../../results/README.md)
- [Consolidated image/cipher-transfer report](../../im-results/lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md)
- [Page-boundary audit](../../im-results/lp2-original-page-boundary-audit-p32-p54-p55.md)
- [Correct 75-body Hill test](../../im-results/p55-wisdom-5x5-original-75-gate.md)
- [Corrected 75-body transfer reproducer](../../sims/p55_corrected_75body_transfer_sft.cjs)

Future p55 work should use `p55[1:]` and require an independent source to select any cipher/key clock; do not revive the F25 skip merely to manufacture a 75-symbol sequence.