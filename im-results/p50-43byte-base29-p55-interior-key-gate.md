# p50 43-byte BASE29 channels to p55 43 interiors

**Classification: source-constrained, finite original-input negative.** This tests an exact 43:43 alignment between a bounded p50 numeric interval and the p55 word interiors. It recovers no plaintext, authentic key, or established cipher.

## Why this route merits a direct test

The signed 2016 message's map/direction language and the p50 table's paired 0x3D markers identify a bounded numeric interval. The bytes strictly between the markers are exactly 43 long. Separately, p57's circumference instruction applied to p55's 16 complete words leaves exactly 43 interior runes.

The 2013 Cicada challenge authenticates BASE29 as an operation. A byte B has two natural BASE29 digits:

- high digit Q = floor(B/29)
- low digit R = B mod 29

Each channel therefore supplies exactly 43 GP29 symbols. The solved p56 page supplies a source-grounded additive direction: subtract the key symbol modulo 29. This is a small, discriminating experiment: test Q and R independently, without inventing a combination.

The weak premise is that the p50 interval is intended as a key for p55, rather than merely sharing a count. The 43:43 alignment and independent page instructions make the test worthwhile, but do not prove that relationship.

## Frozen source inputs

- p50 byte table: 256 row-major bytes.
- The left 0x3D marker is at byte offset 83; the right 0x3D marker is at offset 127.
- The selected interval is offsets 84–126 inclusive:

  173,28,111,65,211,220,198,49,236,84,56,35,222,150,72,34,83,229,32,206,122,63,31,218,14,184,32,115,73,143,197,247,54,171,35,184,42,237,86,54,13,20,163

- Physical p55 has 16 complete words with lengths 4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3.
- Removing each word's first and last rune gives 43 symbols:

  M I EO G D TH IA A B C EA F X I M U C P H NG L S D IA P H EO E I G X G S EO TH TH E EA I M C J E

## Exact BASE29 channels

High digits:

  5,0,3,2,7,7,6,1,8,2,1,1,7,5,2,1,2,7,1,7,4,2,1,7,0,6,1,3,2,4,6,8,1,5,1,6,1,8,2,1,0,0,5

Low digits:

  28,28,24,7,8,17,24,20,4,26,27,6,19,5,14,5,25,26,3,3,6,5,2,15,14,10,3,28,15,27,23,15,25,26,6,10,13,5,28,25,13,20,18

Apply the same fixed inverse independently:

  P[i] = C[i] - key[i] mod 29

No sign flip, phase, reversal, digit mixing, word reset, or skip is fitted.

## Original-input results

**High-digit key (Q):**

  X I N R T A NG D N O IA EA W C B F O G W X T P OE L P TH J S H TH H IA X W U AE B L H E C J P

**Low-digit key (R):**

  L J B EA S X O R P H U D A C C AE N T C E X I NG EO EA IA N M A H L L M S AE NG C D J D NG L F

Neither output is recognizable GP-English plaintext. The original word-fragment boundaries are retained by the reproducer for inspection. No statistical significance is claimed for a 43-symbol sample.

The reproducer asserts both 0x3D markers, the exact 43-byte interval, p55's 16-word/43-interior structure, the exact original GP indices, both BASE29 digit streams, exact forward re-encryption, and independent synthetic positive controls for both channels.

## Decision

**Reject both direct 43:43 additive-key channels:** neither the BASE29 high digits nor the low digits of the p50 interval decrypt p55's 43 interiors under the p56 subtraction direction.

This does not invalidate the p50 interval selection, BASE29 conversion, p55 circumference instruction, or p56 decoder separately. It rejects only the two fixed one-digit-per-byte direct key interpretations. Do not continue with digit combinations, offsets, phases, reversals, or fitted word resets without a new primary-artifact instruction.

**Reproducer:** sims/lp2_p50_43byte_p55_interior_base29_key_sft.cjs.
**Related prior work:** im-results/lp2-2016-p50-p55-43unit-source-selector-gate.md, im-results/lp2-2013-base29-grid-two-digit-inverse.md, and sims/authentic_lp2_p56_totient_regression.cjs.
