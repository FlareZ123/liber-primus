# p0 13-dropcap sequence under historical Atbash+3: negative

**Decision (21 November 2026, Agent10, Issue #2008):** the fixed 13-component red-dropcap sequence does **not** yield a coherent message under the one historically motivated Atbash-order +3 transform. The exact output is `TJEWBJUEOHIRTHW`. No reordering, alternate shift, alphabet, spacing, key search or candidate-word scoring was used. This closes only the direct-message interpretation of this sequence; it does not rule out red dropcaps as visual markers or parameters for a separately source-selected operation.

## Historical operation and source-strength caveat

The pinned 2014 fourth-onion participant reconstruction documents the transform in `2014/006-fourth-onion/gematriaprimus.py` as `Gematria.rune_to_english(..., mode="atbash", rot=3)`. Its lookup order is the reversed Gematria Primus alphabet, followed by a three-position forward rotation in that reversed order. For standard GP29 input index \(i\), the resulting output index is:

\[
j=(28-i+3)\bmod29=(2-i)\bmod29.
\]

The exact direction is checked against the first line of the 2014 fourth-onion page 06: the original rune transcription decodes to `A-COAN.A-MAN-DECIDED-TO-/`, matching the reconstruction's raw output (the README later editorially corrects `COAN` to `KOAN`). The source files are pinned at [cicada-solvers/neuroretransmit-cicada, commit b13600373d3400d75ec4208198019f3d92a304dd](https://github.com/cicada-solvers/neuroretransmit-cicada/tree/b13600373d3400d75ec4208198019f3d92a304dd/2014/006-fourth-onion).

**Important qualification:** the fourth-onion page images are historical Cicada artifacts, but the explicit Atbash-order/+3 rule and its Python implementation are in a community-authored reconstruction, not a Cicada-PGP-signed instruction. The preceding first-three-pages README describes plain reversed-rune mapping for its warning page; it does not authenticate a general LP2 Atbash+3 rule. Therefore this is a reproducible creator-era precedent and direction control, not an LP2 source selector.

## Frozen original LP2 input

The 13 red-dropcap components are taken in physical book order from the independent original-image red-channel inventory, with global offsets and GP indices already recorded in [the 13-column source report](lp2-red-dropcap-p0-columnar-gate.md):

| Component | Global rune offset | GP index | GP value |
|---:|---:|---:|---|
| 1 | 0 | 15 | S |
| 2 | 729 | 20 | L |
| 3 | 848 | 13 | P |
| 4 | 1541 | 24 | A |
| 5 | 1874 | 14 | X |
| 6 | 3612 | 20 | L |
| 7 | 5506 | 1 | U |
| 8 | 6527 | 19 | M |
| 9 | 7960 | 23 | D |
| 10 | 8051 | 21 | NG |
| 11 | 9519 | 27 | IA |
| 12 | 9640 | 0 | F |
| 13 | 12648 | 24 | A |

The frozen input is 13 GP symbols, transliterated `SLPAXLUMDNGIAFA` (15 Latin letters because GP includes multigraph values). The sequence is not rearranged and has no inserted word separators.

## Exact output

Applying only \(j=(2-i)\bmod29\) gives:

- Output GP indices: `[16,11,18,7,17,11,1,12,8,10,4,2,7]`
- Output GP symbols: `T, J, E, W, B, J, U, EO, H, I, R, TH, W`
- Concatenated output: **`TJEWBJUEOHIRTHW`**

This does not meet the predeclared criterion of an independently recognizable instruction, key label, address, or protocol token without changing the input. It is not a plaintext recovery or a typed key. Since no semantic selector or key type emerges, there is no justified untouched-body receiver test.

## Reproduction

From the repository root:

```bash
node sims/lp2_p0_red_dropcap_atbash3_gate.cjs
```

The dependency-free script freezes the original offsets/GP indices, applies the exact transform, and asserts the 2014 page-06 direction control. It emits the complete input/output vectors and decision.

**Disposition:** negative for the direct Atbash+3 message hypothesis. Keep the 13 red-dropcap sequence as a verified visual channel; do not reopen it through reverse order, other shifts, transpositions, Vigenere, or word scoring without a new original-source selector.
