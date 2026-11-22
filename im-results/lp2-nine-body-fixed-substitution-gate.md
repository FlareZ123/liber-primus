# Nine-body fixed GP29 substitution invariant

**Classification: bounded negative; no unknown plaintext, key, or complete cipher recovered.**

## Source-selected segmentation and hypothesis

The original-image decision in [Issue #329](https://github.com/FlareZ123/liber-primus/issues/329) establishes that p32 closes at its 13-dot mark and that p33's red headings at local offsets 0 and 91 each begin a distinct titled unit. The current source synthesis therefore partitions all 12,956 unknown runes into nine bodies:

`[729, 1145, 1738, 1894, 1021, 1433, 91, 1589, 3316]`.

A natural, bounded question is whether each of those nine source-titled bodies uses its own fixed monoalphabetic substitution over the 29 GP symbols. This is distinct from the prior [red-title shared-additive-pad test](red-title-body-key-reuse.md), which tested whether one *same* additive stream restarts across eight title-anchored bodies. It also complements the [long-section unknown-alphabet test](grid-long-section-unknown-alphabet.md), which focused on one long section and hidden key skips.

The typographic boundaries do **not** prove cipher resets; they merely give a source-defined partition on which to test this simple architecture.

## Decisive key-independent invariant

For any fixed bijection of the 29 GP symbols within a body, the body's index of coincidence (IoC) is exactly invariant. A permutation of rune positions within that same body also preserves IoC. Therefore a fixed per-body substitution/transposition model cannot turn near-uniform ciphertext into native-English-like plaintext, whatever the nine secret alphabets are.

No key search, plaintext fitting, phase selection, or alphabet permutation is involved.

## Original-source inputs

- Canonical GP29 stream: `resources/liber-primus/lp2-corpus.json`, Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; all 55 rune-bearing unsolved pages, 12,956 indices.
- Nine-body source boundaries: `workplace/lp2-section-clock-ambiguity.md`, Git blob `a6462a1c31333a5b7c91c321b40a70f99d32e9f5`.
- English positive control: `resources/control/shakespeare_first300k.txt`, Git blob `94c677ad9dd50771c6670e0c4e4dad9052b46d85`, encoded with the repository's existing GP transliterator from `sims/word_partition_invariant.cjs`.

The English control is sliced into the same nine rune lengths as the original, so each body is compared with a length-matched sample.

## Results

The uniform 29-symbol baseline is (1/29 \approx 0.034482759).

| Body | Original runes | LP2 IoC | Shakespeare GP control IoC |
|---:|---:|---:|---:|
| 1 | 729 | 0.034082516 | 0.063966897 |
| 2 | 1,145 | 0.034633707 | 0.063369164 |
| 3 | 1,738 | 0.034486003 | 0.062867145 |
| 4 | 1,894 | 0.034494896 | 0.061249387 |
| 5 | 1,021 | 0.034274356 | 0.061786791 |
| 6 | 1,433 | 0.034186202 | 0.060340459 |
| 7 | 91 | 0.031990232 | 0.074236874 |
| 8 | 1,589 | 0.034349820 | 0.062054458 |
| 9 | 3,316 | 0.034462827 | 0.059839491 |

| Set | IoC range | Mean |
|---|---:|---:|
| All nine original bodies | 0.031990–0.034634 | 0.034106729 |
| Eight original bodies of at least 700 runes | 0.034083–0.034634 | 0.034371291 |
| Length-matched English controls | 0.059839–0.074237 | 0.063301185 |

The 91-rune p33 interlude is a small sample and should not carry the conclusion by itself. The other eight bodies, each at least 729 runes, all remain close to the 1/29 baseline and well below the English controls.

The positive control applies nine different affine GP29 bijections (x \mapsto ax+b \pmod{29}), one per body, and asserts that each body's IoC is preserved exactly. This verifies that independent secret alphabets cannot evade the invariant.

## Decision

**Reject the literal model of one fixed independent GP29 substitution per each of the nine source-titled bodies**, as well as any within-body transposition, conditional on native-English-like plaintext and no cross-body mixing. The observed body frequencies do not contain the collision structure that any such bijection would preserve.

This does not reject:
- evolving or polyalphabetic keys within a body;
- title-dependent KDFs, nonlinear transforms, or cross-body mixing;
- non-GP intermediate registers;
- non-English plaintext.

No cipher reset is inferred from the titles. This remains an intermediate exclusion, not an established decryption, so it is not promoted to `results/README.md`.

## Reproduction

Run:

```sh
node sims/lp2_nine_body_fixed_substitution_gate.cjs
```

The script asserts the exact nine-body source lengths and canonical 12,956-rune input, computes all original and matched-control IoCs, and verifies the nine independent-bijection positive control.
