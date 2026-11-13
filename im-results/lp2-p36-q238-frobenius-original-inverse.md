# Exact GF(29^238) Frobenius-automorphism inversion: original p36

**Agent 3, 13 November 2026. Original-cipher family rejection; no unknown LP2 plaintext, historical key, or continuation recovered.** A manually dispatched, source-exact Node 22 run passed: [GitHub Actions 43496531057](https://github.com/FlareZ123/liber-primus/actions/runs/43496531057). [One-file reproducer](../sims/lp2_p36_field_frobenius_orbit_sft.cjs).

## Source-selected question

The unmodified 256-cell LP2 pp49–51 grid, under its independently documented base60 reading, has a unique monic degree-238 irreducible factor R238 over the original 29-symbol Gematria Primus field. Physical p36 prints **238 runes**; the same previously established algebraic source record links its coefficients to R238 and the p3 red quadratic ([existing field result](p36-grid238-dh11-field-multiplication-gate.md)). The 2013 authenticated Diffie–Hellman operation makes field powers a plausible historical type of operation. These facts make the canonical **Frobenius automorphisms** an inexpensive, fully determined inverse family to test.

In K=GF(29)[X]/R238, every automorphism fixing the GP29 alphabet has the form F_k(y)=y^(29^k), for k=0,…,237. They are exactly reversible, F_238=identity, with no fitted coefficient, hidden key or unbounded power search. The important weakest assumption remains **reading this field automorphism as an encryption step**, which the creator did not explicitly instruct.

The SFT reconstructs R238 from all **256 original printed grid values**, independently checks the published source-byte SHA-256, and builds the 238×238 linear matrix of X^(29j) mod R238. It applies all 238 automorphisms to each of these source-fixed GP29 vectors:

1. The 238 physical p36 rune indices as coefficients in printed order.
2. The same rune indices in reversed coefficient order.
3. The preexisting 238-rune candidate formed by reversing the first 119 runes of p39 followed by the first 119 of p3.

Every branch completes exactly 238 powers and returns **all 238 original input coefficients** at step 238.

## Observed original-output decision

| Frozen 238-rune input | Best exponent k | Highest IoC across 238 outputs | Lowest IoC | Outputs above IoC 0.040 |
| --- | ---: | ---: | ---: | ---: |
| Original p36 | 103 | **0.0374073680** | 0.0320887849 | **0** |
| Reversed p36 | 103 | **0.0379746835** | 0.0316278410 | **0** |
| Reversed p39[0:119] + p3[0:119] | 160 | **0.0388965713** | 0.0318760416 | **0** |

For a source-native English scale, the SFT uses the same GP29 transliteration convention as the repository's cipher controls (including ING→NG, IO→IA, QU→CW and V/K/Q/Z normalization). It fixes a window length of 238 runes and a stride of 29 independently of the original scores:

| Independent textual control | GP29 runes | 238-rune windows | Minimum IoC | Maximum IoC |
| --- | ---: | ---: | ---: | ---: |
| Gibran, *The Prophet* | 62,492 | 2,147 | **0.0516966280** | 0.0826153246 |
| Shakespeare first 300k text characters | 217,106 | 7,479 | **0.0482927348** | 0.0852037017 |

**Positive control:** A 238-rune Gibran GP29 passage (IoC **0.0585753289**) is encrypted under F_87 and decoded under F_151; all **238/238** original runes are recovered exactly. The comparison is finite-source/native-English conditional; source reference windows overlap. It does not exclude all possible languages, compression or a separately masked field output.

## Research consequence

The complete set of field automorphisms does not directly map any of the three tested original 238-symbol vectors into native-GP English comparable to the two independent reference corpora. This is stronger than testing a handful of arbitrary field exponents because **every** possible automorphism of the fixed field over GF29 is covered. It retires this source-derived automorphism-only decoder and prevents further arbitrary Frobenius-phase fitting.

It does not exclude field-based key scheduling, unrelated basis transforms, a missing plaintext representation, or field elements used in an independently selected operation. These would require new source evidence selecting an inverse or original plaintext crib. The overall status remains **56 unsolved LP2 pages**.

## Reproduction

Run: node sims/lp2_p36_field_frobenius_orbit_sft.cjs on Node 22.

Inputs: resources/liber-primus/base60-grid.json, resources/liber-primus/lp2-corpus.json, resources/control/gibran_prophet_58585.txt, resources/control/shakespeare_first300k.txt.

Manual-only workflow: .github/workflows/p36-q238-field-key-manual.yml, suite frobenius. The [passing CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43496531057) asserts the published reference-window counts, all three maxima, and round-trip controls.
