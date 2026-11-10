# Red-pointer F79 primitive-root cycle: source-defined candidate and heldout failure

**Agent 28, 10 November 2026.** Classification: exact arithmetic plus a bounded, unsuccessful cryptanalytic inverse. The red numeric relationship was established by other agents, and its primitive-root extension is exploratory. **No original unsolved LP2 plaintext, key, cipher architecture or destination was recovered.**

## New field-group connection

Original red spans give GP prime sums p40 **435 = 29 × 15**, p15 **638 = 29 × 22**, and p53 **2262 = 29 × 78**. The independently documented page-pointer triangle interprets 15 as zero-based GP index 15 with assigned prime **53**, and 22 as the one-based ordinal of ordinary prime **79**. Since 79 is prime, its nonzero multiplicative group has **78** elements. The source-selected integer **53 is a primitive root modulo 79**: its powers include 53^6 ≡ 22, 53^26 ≡ 55, 53^39 ≡ −1 (all mod79) and 53^78 ≡ 1, with no earlier return to 1. Equivalently, for the distinct prime divisors 2,3,13 of 78, the tests 53^(78/q) ≢ 1 mod79 all pass. Thus the red page values provide a mathematically valid, fully specified 78-cycle: 1,53,44,41,40,66,22,60, ... .

The **2262 = 29 × 78** identity also equals the state count of a product clock combining the 29-rune alphabet with a 78-position field-unit cycle. It follows arithmetically from the already selected red sum and cannot be treated as independent confirmation of intent. A primitive-root relation is not intrinsically very rare (there are φ(78) = 24 primitive roots among the 78 nonzero residues). The red-triangle rule and this interpretation were post-selected; there is no independent cipher instruction specifying a modular-79 field.

## Finite source-key inverse

[Reproducer](../sims/red_field79_generator_heldout.cjs) constructs all 78 powers and asserts the exact source spans, group order and independent GP alphabet. It examines three reversible families:

- **Affine:** from source unit v_t=53^(t+phase) mod79 define a_t=1+((v_t−1) mod28), b_t=(t+shift) mod29, and C_t=sign·a_t·P_t+b_t (mod29). The multiplier is in 1..28 and is invertible.
- **Reduced additive:** C_t=P_t+sign·(a_t+b_t) (mod29).
- **Raw-residue additive:** C_t=P_t+sign·((v_t mod29)+b_t) (mod29).

In all cases phases are **{0,15,22,53}** (source-derived), b shifts **{0,15,22}**, signs ±1, and clocks are continuous across selected pages or reset for each page. This is **3×4×3×2×2=144 configured inverses**; some additive b-shift choices are equivalent under rune index-of-coincidence scoring, so there are fewer distinct distributions than 144. The reduction from 79 to 29 and the three transformations are hypothetical; they were chosen before examining heldout scores.

Original unsolved training pages are physical **p16–18 (800 runes)**. The candidate with the largest pooled plaintext rune index of coincidence on those pages is frozen, then evaluated on untouched **p19–22 (944 runes)** and on additional p40 and p53. The train winner is *reduced additive, phase0, shift0, sign+1, page reset*. The code runs all candidates, preserves their parameters, and asserts the best fit.

| Input | Untreated IoC | Frozen best inverse IoC |
| --- | ---: | ---: |
| p16–18 training | 0.034267835 | **0.035303504** |
| p19–22 heldout | 0.034356633 | **0.034606018** |
| p40 and p53 secondary holdout | 0.033883953 | **0.033633490** |

Uniform-symbol reference is 1/29 ≈ 0.034482759. No credible natural GP-English plaintext appears under this finite family; the best heldout outputs retain essentially uniform symbol collision statistics. The original continuous bookwide ciphertext also has only **390/10,694 = 0.036469048** exact rune coincidences at source-selected lag **2262**, with **456/12,878 = 0.035409225** at lag78, values near the random reference. Such raw equality tests alone are weaker than full invert-and-score because changing phases, field reductions, hidden key skips or output substitutions could conceal a periodic stream.

A source-language planted positive uses **1,744 fresh GP-transliterated Shakespeare runes** across the exact 7 training/heldout page lengths, encrypting with the source-derived affine period, phase53, shift22, sign−1, continuous clock. Its ciphertext IoC is **0.034336560**; the exact inverse recovers all 1,744/1,744 source runes and restores **0.063687252** IoC. This demonstrates the tested implementation can detect a real matched cipher with an independently sourced natural-language register.

**Reproduction:** Windows Node.js 22, execute `node sims/red_field79_generator_heldout.cjs`. Original-code [GitHub Actions success, run 42778549768](https://github.com/FlareZ123/liber-primus/actions/runs/42778549768) prints all key selections and rates.

## Interpretation and decision

The 53-primitive-root/79-field/78-order relationship is an exact new mathematical refinement of the existing red-pointer triangle. It offers an independently source-bounded candidate generator with 78 values and a product-state period of 2262. **The tested simple additive and affine mappings into the 29-rune cipher are unsupported**, including independently heldout pages. No authentic F79 plaintext representation or 29-rune embedding is specified by the artwork. More unconstrained scans of phase, offset, output alphabet and residue reduction would risk overfitting. Future use of F79 should begin by deriving an independently constrained, invertible mapping or testing a new observable that the above finite family could not reproduce.
