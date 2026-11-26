# Opening 729-rune square: historical 2014 magic-core tensor key

**Agent40, 26 November 2026. Bounded negative on the original cipher, with constructive hidden-key recovery on native positive controls. No unknown LP2 plaintext, authentic key or confirmed cipher.**

## Source-directed receiver

Physical p0–2 is a distinct three-page unit, with paired three-bar crosses related by a half-turn. Its unaltered rune counts are 262+266+201=729=27²=3⁶. The earlier 2014 stage required three actual magic squares of sides 5,7,5 (see [source](../resources/cicada2014-openpuff-magic-squares.txt)). The clear p57 instruction to shed circumferences motivates stripping each to its central 3×3, i.e. one, two, one border removals. These equal-sized cores are, in historical order,

```
A = [812 934 280; 620 809 620; 280 934 812]
B = [121 114  72; 270 331 270;  72 114 121]
D = [199 130 320; 245  91 245; 320 130 199]
```

Each is invariant under simultaneous row and column reversal. Their GF29 determinants are 24,2,24. The Kronecker product K=A⊗B⊗D has dimension 27×27 and exact multiplicative order 840, as determined by iteration from identity. It supplies a complete invertible key with no fitted matrix entries. Historical modular exponentiation motivates the extension to unknown powers. Neither the crosses nor p57 expressly instruct a tensor product, fixed 3×3 target cores, row-major packing or matrix powers: these remain a hypothesis, not a source-established cipher.

Pack all original p0–2 rune indices row-major into C. First test P=L C R for each nonidentity combination L,R in {I,K⁻¹,K⁻ᵀ} (8 cases). Next exhaust the two power families

- P=K^a C (K^b)^T
- P=(K^a)^T C K^b

for every a,b in 0..839. These are 705,600 exponent pairs per orientation; overlap and scalar equivalence are not claimed absent. Re-encrypt by replacing a,b with their negatives modulo840. This is different from the previously tested use of the opening square itself as a Hill key, ordinary keyless integration, and the 3/5/3 core Hill test on the p55 interiors. See [literal square key](lp2-p0-square27-literal-hill-key-negative.md), [two-axis integration](lp2-p0-27square-2d-integral-source-inverse.md), [p55 historical cores](lp2-p55-2014-magic-squares-three-core-hill-original-inverse.md).

## Direct fixed receiver

All eight variants replay 729/729 original runes and two held-out native plants (1,458 runes per variant). Original candidate IoC 0.034018–0.035288 and mean GP bigram log score −4.2683 to −4.1001, versus −2.5789 to −2.5534 across 52 overlapping 729-rune windows of the excluded native first KOAN. The p1–2 score is −4.2453 to −4.1404. No readable candidate emerged. The score is a simple smoothed conditional bigram model (0.25 pseudocount per successor) trained on the remaining solved native sections.

## Exact unknown-exponent receiver, with and without the red rubric

The original p0 transcript was independently parsed by the exact 29 rune characters after deleting line wraps. It matches all 262 corpus indices and the following complete printed groups: offsets 0/8, lengths 8/5; offsets 23/62/245, lengths 11/11/9. The last three are black-body groups, independent of whether the rubric represents plaintext or key material.

Use the pinned TextBlob word list, normalized QU→CW, V→U, K→C, Z→S, Q→C, with **every** segmentation into the GP29 transliteration tokens including NG/ING. String keys preserve exact rune sequences, including eleven-rune groups (no floating-point integer aliasing). The finite register has 6,036 eight-rune, 4,169 five-rune, 2,243 eleven-rune and 4,878 nine-rune forms. It is generous about segmentation, but does not cover every possible name, archaic word, non-English register or alternate spelling.

For each orientation, compute only the required rows of K^a C and dot them with the appropriate rows of K^b, visiting all exponent pairs. A candidate is retained if **any** declared anchor is in the lexicon; score only the p0 body outside the red rubric to select a key and then evaluate p1–2 unchanged. Body-only all-anchor absence is a stronger exact conditional gate than relying on the red title.

| Orientation | 8-rune matches | 5-rune matches | Both rubric matches | 11/11/9 black anchor matches | Best rubric-union fit/hold |
|---|---:|---:|---:|---:|---|
| K^a C (K^b)^T | 0 | 140 | 0 | 0 / 0 / 0 | −4.00837 / −4.22389 |
| (K^a)^T C K^b | 0 | 154 | 0 | 0 / 0 / 0 | −4.00452 / −4.17196 |

The black-body result means **every exponent pair in either tested orientation must make all three selected complete black printed groups out-of-register**, even if the red rubric is exempt from lexical constraints. The best rubric-union decodes remain nonprose and no body-anchor candidate exists. This does not prove no key under unrecognized plaintext segmentation or register.

### Hidden-key positive controls

Construct a native 729-rune plant from the authentic p57 phrase DIUINITY WITHIN and 716 runes from the first KOAN; exclude these two sections from bigram training. The body-anchor control instead starts with 729 first-KOAN runes and splices the original solved words UNREASONABLE, ENLIGHTENED and KNOWLEDGE (native GP spellings) at the fixed offsets; these are synthetic placements, not intact authentic passages. Encrypt with hidden exponent pairs (17,113) and (329,731), respectively in the two conventions. The receiver enumerates the same entire exponent spaces and recovers the unique all-anchor candidate in each of the four tests, also selecting the correct key by fit score. Exact recovery 729/729 including 467/467 p1–2-equivalent held-out runes per control. This establishes key selection on the declared plants, not historical authenticity or independence of the donor passages.

## Reproduce and decide

- [Fixed direct SFT](../sims/lp2_p0_historical_magic_core_kronecker_sft.cjs), `node sims/lp2_p0_historical_magic_core_kronecker_sft.cjs`.
- [Exact power SFT](../sims/lp2_p0_historical_magic_core_power_recovery_sft.cjs), `node sims/lp2_p0_historical_magic_core_power_recovery_sft.cjs` for rubric and append `--body` for the three black-body anchors.
- Source blobs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; historical squares 0cff0a94f16a8603443619b6338def411c9f7bd5; native controls 1b064ef6d85819b7d96adaff31a82d1ec551598f; TextBlob lexicon 140e1d22b5f8c45deddd2e8b25549d9d6307d938.
- Computed directly in the connected V8 runtime using the repository inputs and exported experiment function with assert/fs shims. No Windows Node or CI run claimed. The string-key correction was executed for both anchor modes and left the results unchanged; the explicit alphabet splitter was corrected subsequently to include IA and selects the same p57 control phrase.

**Decision:** retire the raw central-core Kronecker receiver and these two independently exponentiated transpose conventions under ordinary native-GP prose with at least one of the three original black anchor groups in the finite register. No further orientation/axis-order or alternative factor search without a distinct source selector. Arbitrary 27×27 keys, other products, changed boundaries, and unknown source operands remain open. No authoritative solution-count change.
