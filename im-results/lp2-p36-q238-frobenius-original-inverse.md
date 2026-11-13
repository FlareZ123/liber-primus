# Exact GF(29^238) Frobenius-automorphism inversion: original p36

**Agent 3, 13 November 2026. Original-cipher family rejection; no unknown LP2 plaintext, historical key, or continuation recovered.** The original pure-automorphism gate passed [GitHub Actions 43496531057](https://github.com/FlareZ123/liber-primus/actions/runs/43496531057); the extended normal-basis source-operator gate passed [GitHub Actions 43499820835](https://github.com/FlareZ123/liber-primus/actions/runs/43499820835). [One-file reproducer](../sims/lp2_p36_field_frobenius_orbit_sft.cjs).

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

## Separate canonical normal-basis coordinate inverses

A distinct finite-field reading treats a 238-symbol printed ciphertext vector as the **coordinates of an element in a Frobenius normal basis**, rather than as ordinary power-basis coefficients transformed by an automorphism. This global invertible linear map mixes every source rune with the rest of its page, so the earlier automorphism-only rejection does not cover it. We froze six natural basis generators before choosing any plaintext score, including the exact 2013 signed BASE29 quadratic and LP2 p3 source-red quadratic as independent cross-round selectors.

A generator β supplies columns β, β^29, …, β^(29^237). Gaussian elimination over GF29 determines whether those columns form a complete normal basis. For a full-rank case the code computes the exact inverse and asserts that the recovered 238 coordinates reconstruct **every original ciphertext coefficient exactly**.

| Generator β (source-visible or simplest comparison) | Basis rank / 238 | Original p36 decoded IoC | Reversed p36 decoded IoC | Reversed p39 + p3 decoded IoC |
| --- | ---: | ---: | ---: | ---: |
| X | **236** | undefined | undefined | undefined |
| X+1 (source p3 subfield shift) | **236** | undefined | undefined | undefined |
| X² | **237** | undefined | undefined | undefined |
| X²+X+1 (simple full-rank comparator) | **238** | 0.0369818814 | 0.0343225898 | 0.0341098465 |
| Signed 2013 BASE29 quadratic X²+18X+11 | **238** | 0.0363436514 | 0.0351735631 | 0.0351026487 |
| Printed p3 red quadratic 2X²+23X+13 | **238** | 0.0357763359 | 0.0357054214 | 0.0334716165 |

The canonical shift X+1 is **not a normal element** of this field, even though it produces the independent quadratic projection described in prior source algebra. Its 238 conjugates span only 236 dimensions, so direct conversion of arbitrary 238-symbol ciphertext through that “basis” is intrinsically nonunique. The two source-linked quadratic generators do give full rank and reversible coordinate inverses, but their recovered outputs remain near uniform and far below both independent native-GP text-control ranges.

These are finite, source-motivated canonical readings of fixed generators. The original does not give an instruction to employ a normal basis. The test does not reject a secret normal generator, a noncanonical or unknown basis, nonlinear field encryption, missing plaintext representation, or non-English register. It closes the exact author-linked two-quadratic generators as **direct plaintext-coordinate decoders** without fitting more free parameters.

## Research consequence

The complete set of field automorphisms, and the direct inverses under the two complete source-linked quadratic normal-basis generators, do not map any of the three tested original 238-symbol vectors into native-GP English comparable to the two independent reference corpora. This is stronger than testing a handful of arbitrary field exponents because **every** possible automorphism of the fixed field over GF29 is covered. It retires this source-derived automorphism-only decoder and prevents further arbitrary Frobenius-phase fitting.

It does not exclude field-based key scheduling, unrelated basis transforms, a missing plaintext representation, or field elements used in an independently selected operation. These would require new source evidence selecting an inverse or original plaintext crib. The overall status remains **56 unsolved LP2 pages**.

## Reproduction

Run: node sims/lp2_p36_field_frobenius_orbit_sft.cjs on Node 22.

Inputs: resources/liber-primus/base60-grid.json, resources/liber-primus/lp2-corpus.json, resources/control/gibran_prophet_58585.txt, resources/control/shakespeare_first300k.txt.

Manual-only workflow: .github/workflows/p36-q238-field-key-manual.yml, suite frobenius. The [latest passing CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43499820835) asserts the published reference-window counts, three automorphism maxima, full-rank normal-basis source inverses, singularity of the simple generators, and round-trip controls.
