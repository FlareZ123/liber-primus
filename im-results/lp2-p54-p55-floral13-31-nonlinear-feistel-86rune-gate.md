# P54→p55 balanced 43×43 tapes: source floral 13/31 as a nonlinear Feistel cipher

**Agent39, 22 November 2026, Director #2244.** Intermediate original-source cryptanalytic decision. The newly established 86-rune paired tape is retained, and one complete **nonlinear** reversible algorithm is tested without fitted alphabet, matrix, offset or secret key. No authentic unknown GP29 plaintext, author-approved Feistel instruction or Cicada destination is recovered.

## What the original creator could see and the competing interpretation

The original p54 image (71.jpg) ends with a ten-rune word fragment whose final Y continues into the first p55 rune NG before its printed separator. P55 contains 76 authentic runes in seventeen printed fragments. Under the visible first-and-last-rune "circumferences" operation motivated by the solved p57 text, exactly 43 of the p55 runes are strict interiors and 33 are exteriors; adding the real p54 ten-rune carry yields 43 on each side. The two tapes together account for **all 86 original physical runes** and reconstruct both original pages and their genuine cross-page word.

The sixteen original p40–p55 floral plates also carry identical left/right five-dot ornaments. Source image measurements independently establish, top-clockwise with filled=1, hollow=0, the two 5-bit patterns **01101₂=13** on the left and **11111₂=31** on the right. These numbers were previously found and previously tested as p50 row selectors. A mathematically distinct use here is as the **two round exponents** of a small paired-state cipher. Exponentiation was genuinely used in Cicada's 2013 Diffie–Hellman material. The clue remains **conditional**: the images never say to use exponents13/31, a Feistel network, modulus29, or a particular interior/exterior pairing. Rival: ordinary illustration and a coincidental 43+43 count.

The simple historical analogue is a **two-round nonlinear triangular Feistel** over native GP29 symbols. For each of the 43 original-index pairs A[i]=p55 interior and B[i]=p54 carry + p55 exterior, in order, with both motifs:

```text
U = A + B^13 (mod 29)
V = B + U^31 (mod 29)

B = V - U^31 (mod 29)
A = U - B^13 (mod 29)
```

The second two equations are the exact inverse. This is a bona fide bijection on **all** 29×29 two-rune pairs, regardless of whether its round exponent is invertible; here both 13 and 31 are coprime to 28 anyway. It changes all 86 original values while respecting their original positions. The two original-image order choices are B in source order and B in full reverse, the latter mirroring the moth's wings. Neither requires inventing a control rune or suppressing the cross-page NG. Both transform directions (candidate decrypt/its inverse) are tested. These are **four** frozen original decodes rather than a key or phase sweep.

The previous complete **682,080-matrix** GL2(29) exact original13-word exclusion does **not** cover this nonlinear map. Prior unbalanced33/43 source-register additive Feistel also uses different input geometry and affine arithmetic; it is not repeated.

## Original GP29 output and positive controls

The untouched original 86-rune source has GP29 IoC **0.0361149111**. All four outputs remain unrecognizable, and none maps the original p55 13-rune word in its printed slot to any of the **422** independently attested 13-symbol GP29 word types from Shakespeare, Gibran, Emerson and TextBlob controls. These zero matches are a bounded English-register observation, not proof that all possible source languages are excluded.

| Outer tape pairing | Decoder direction | Whole-86 GP29 IoC | P55 GP29 IoC | Original p55 length13 output |
|---|---|---:|---:|---|
| Source-order B | Feistel inverse | **0.032010944** | 0.032280702 | AEAOEGNCNGHNOEXM |
| Source-order B | Feistel forward | **0.036935705** | 0.036491228 | EAIWIHWOHJSNGNGG |
| Reversed B | Feistel inverse | **0.038030096** | 0.036491228 | WHUXATIEORAETHOE |
| Reversed B | Feistel forward | **0.034746922** | 0.034736842 | NGYEAOEOEAEECTLNPH |

The SFT prints the complete **17 original-position p55 word outputs** for each model, plus exact 29-symbol vectors of the 13-rune source slot. All four outputs remain close to the uniform GP29 collision baseline and lack a coherent original paragraph. The presence of many short English-looking fragments in any 76-rune random output would not establish a cipher.

Two genuine native-GP complete positive controls are constructed from the *authenticated solved p57 source*: take its first86 GP runes, replace the original p55 length13 slot with the genuine 13-GP spelling **CIRCUMSTANCES** from the independently fixed dictionary, and encrypt the **full 86** register with the exact 13/31 map using each pairing orientation. The same frozen inverse recovers **all 86/86** source runes in both cases. Inverting with the opposite, wrong pairing fails. Every one of the four original outputs exactly forward-reconstructs the unchanged full86 input, which is an implementation condition rather than evidence of a historical decipherment. [Successful Windows Node22 Actions run 45016490513](https://github.com/FlareZ123/liber-primus/actions/runs/45016490513).

## Exact negative and missing author instruction

**Retire this specific nonlinear dual-exponent Feistel interpretation** of the source-chosen 43×43 tapes. It supplies a fully typed, native-GP full86 inverse and uses source-visible floral dot values, yet the intact original p55 text and the independent length13 print word remain unreadable for every fixed order/direction. Since no original p55 plaintext was recovered, a p54 previous150-rune transfer with invented geometry or an IV would be unjustified. The original p55 word-carry register and unusual 43+43 balance survive as genuine source evidence.

The precise missing selection is the **creator-authored symbol-changing operand**: the artwork supplies two numeric ornaments and an undirected visual mirror, while the manuscript never states to exponentiate them, use GP29 as a field, combine them via Feistel, treat p54 as the left/right register, or carry a state into earlier p54. A complete independently typed instruction/key or recoverable external object must precede further 43×43 models; an arbitrary fitted nonlinear S-box would trivially defeat the intended solve-path requirement. The expected alternative is that the 43×43 alignment has an *external key or illustration-specific codebook* that the original first-party text still does not identify. No positive unknown plaintext follows.

**Read-only Windows Node22/CommonJS SFT:** [complete original 86-rune, full-state Feistel cipher/inverse and two positives](../sims/lp2_p54_p55_floral13_31_nonlinear_feistel_original_sft.cjs). Original paired tape discovery and source census: [p54 10+33 vs p55 interior43](lp2-p54-p55-carry10-balanced-hadamard.md). Independent p55 floral dots original pixel evidence: [source 13/31 motif](lp2-floral-dot-masks-grid-row-original-gate.md). 
