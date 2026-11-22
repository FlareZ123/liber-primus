# Floral left13/right31 and filled3/5 as a ciphertext-fed nonlinear two-register cipher

**Agent39, 22 November 2026, Director #2246.** Original-input source-motivated bounded negative on all **3,008** GP29 runes of the complete floral chapter pp40–53, including genuine cross-page words and a rune-free p50. No authentic unknown plaintext or author-selected key/state-update operation recovered.

## A bounded human-plausible reading of the original ornaments

All sixteen original floral margins, physical pp40–55, have the same five-dot left/right stencil. Two left dots are hollow and eight are filled. An original-image-confirmed top-clockwise binary rendering reads left **01101₂ =13** and right **11111₂ =31**, giving two register initializers; the left/right *filled* dot counts are **3** and **5**, suggesting two distinct exponent kernels. Cicada's earlier authentic 2013 challenge used modular exponentiation and explicitly defined BASE29; these facts motivate testing a nonlinear GP29 field mechanism with exactly two source-numeric registers. The original 2014 illustrations **do not themselves state** any register, exponentiation, input clock, modulus, xor/addition or update opcode. An ornamental template is an independent rival explanation, and source pixels prove all sixteen margins are identical, so there is no distinct per-page visual IV.

A single explicitly defined test fixes everything **before reading original output**: left seed L=13, right seed R=31 (reduced to2 in GP29), exponent kernels based on left/right filled counts3/5, and one ciphertext-driven second-order state update

```text
L[0]=13, R[0]=31 mod 29
K[i] = L[i]^3 + R[i]^5 (mod 29)
P[i] = C[i] - K[i] (mod 29)
L[i+1] = R[i]
R[i+1] = L[i] + C[i] (mod 29)
```

Encryption uses C[i]=P[i]+K[i] mod29, then the **same ciphertext-fed transition**, so the entire cipher is reversible given only the public two-dot initial state. Every actual GP29 source symbol advances once, including original F=0; punctuation has no phantom cipher value. The state advances continuously across every word and page, with original p50 contributing zero runes, and no fabricated reset at a real page-crossing word. No secret coefficients, word skips, random phases, unprinted entropy, or optimized parameters are introduced.

This **whole-chapter 3,008-symbol nonlinear ciphertext-feedback model** is distinct from the stationary predecessor-affine all-secret negative, all841 floral lag13/31 models, prior static p50 row13/31 scans, 8/5-lane cubic rotor, and the #2244 86-rune paired-static Feistel cipher.

## Full original result and untouched pages

Original source p40–53 includes the per-page rune lengths

`[231,273,272,274,273,270,270,274,271,66,0,92,263,179]`

for physical pages40..53 inclusive. P50 is the original 256-token numerical plate with **no runes**. Every source rune is consumed and exactly recovered under forward replay.

| Test | Full GP29 index of coincidence |
|---|---:|
| Untouched original 3,008 ciphertext runes | **0.034542627486** |
| Frozen continuous nonlinear 13/31 full inverse | **0.034389173489** |
| Independently solved native-GP p56/p57 control tiled to 3,008 | **0.047436743344** |

The entire original output remains in a near-random GP29 regime. The **231-rune first full floral page p40** outputs GP29 IoC **0.033239225**, the held-out physical **272-rune p42** has **0.034241372**, and the physically separated **179-rune p53** has **0.036155922**. The SFT prints the first 32 decoded GP transliteration glyphs from every page and their complete page-level IoC. No 200-rune paragraph or independent page yields coherent GP29 text. The source contains no instruction fixing the output alphabet as a novel substitution, and no attractive short phrase is interpreted as a key.

As the exact illustration is repeated on every page, a separate artificial per-page reseed is the clearest source-visible rival. Running the *identical* decoder with fresh L=13/R=31 at each physical page instead gives no hidden plaintext either, and on independent p53 yields **0.033205700**. The source does not choose between a continuous state and repeated resets; this exploratory rival check does not license inventing page-specific IVs.

An independent source-native positive uses **the full 180 GP runes of solved p56+p57**, repeated to the exact 3,008-symbol target shape, then generates an unknown ciphertext with the fixed nonlinear state law. Decoding with the original ornament seed recovers all **3,008/3,008** authentic GP runes, including transitions at page boundaries. Re-encrypting the 3,008 original-decoded symbols exactly restores all 3,008 unchanged original ciphertext runes. The deliberately wrong left/right seed exchange `(31,13)` fails to recover the positive, confirming the model's effective dependence on the printed seed. These tests demonstrate a functioning fully reversible model; they do not authenticate the ornament interpretation.

## Decision and missing clue

**Retire the explicit two-register floral13/31, nonlinear filled3/5 power, ciphertext-sum feedback decoder.** The source supplies enough *numbers* to write an inexpensive two-state cipher, but no first-party *opcode* selecting modular exponentiation, the plus register feedback or the GP29 register representation. The original 3,008-rune message remains opaque under this complete direct model and its page-reset rival. Repeating the same identical artwork on sixteen pages also supplies no distinct per-page key or IV, so a retuned per-page cipher would require an independent external operand. That limitation is the source-selection decision; it is not a blanket mathematical impossibility theorem for other two-register or externally keyed stream ciphers.

A productive successor needs a genuinely authored state-update instruction or external key/IV format and a source-selected long text recipient, with a predeclared inverse that produces authentic plaintext outside the chosen page. More arbitrary GP29 polynomials or fitted transitions cannot establish creator intent.

**Read-only Node22/CommonJS SFT:** [full original 3,008-rune source and solved GP-positive](../sims/lp2_floral13_31_evolving_nonlinear_twostate_original_sft.cjs). **Windows Node22 success** [run45016895231](https://github.com/FlareZ123/liber-primus/actions/runs/45016895231). Source motif from original-pixel confirmation: [floral dots13/31](lp2-floral-dot-masks-grid-row-original-gate.md).
