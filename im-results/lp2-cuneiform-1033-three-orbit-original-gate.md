# Original p33–39: exact 1033-rune partition and reciprocal modular cycles

**Evidence class:** exact derived source geometry and modular arithmetic; tentative causal interpretation; **no recovered unknown-page plaintext, key or authenticated decoder**. This note replaces no established explanation of the cipher. Original inputs are `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt` and `lp2-ink-annotations.json`. The original p33–39 marks are visible in scan50.jpg through scan56.jpg. Run `sims/lp2_cuneiform_1033_three_orbit_original_sft.cjs` with Windows Node.js 22 for the complete reproducible source-locked check.

## What the printed source fixes

The same Babylonian numerical header is printed throughout p33–39, with ordinary left-to-right readings **1033** and **3301** (see the prior sign audit [#2169](https://github.com/FlareZ123/liber-primus/issues/2169)). The actual seven physical pages contain **1680 runes**. The cuneiform-bearing unit begins at the second red heading on p33, after its first **91** runes, giving **1589** consecutive runes. That start is chosen by a physically visible rubric, not by numerical output.

Five adjacent, source-numbered 1–5 passages are the exact **553-rune** block at zero-based offsets **754 through 1306** in this 1589-rune unit. Their sizes are `139,91,98,96,129`, verified independently against the JPEGs in [#203](https://github.com/FlareZ123/liber-primus/issues/203). The remaining **1036** runes consist of a 754-rune introduction and a 282-rune tail. Within the latter, p39 has an independently distinguished **three-rune red span** at local rune offset 119, chapter offset **1468–1470**.

Consequently, the source admits this exact typed partition:

| Physical register | Original rune count |
|---|---:|
| Before five numbered passages | 754 |
| Numbered passages 1–5 | 553 |
| After passages, before p39 red triplet | 161 |
| Special p39 red triplet `ᛡᚳᛋ` | 3 |
| After p39 red triplet | 118 |
| Entire source-visible cuneiform unit | **1589** |
| Non-numbered runes **excluding** p39 red triplet | **754 + 161 + 118 = 1033** |

The independently printed **1033** is therefore exactly the length of the unnumbered ordinary register after singling out the genuinely red p39 triplet. This is a **new source-conditioned alignment**, yet its interpretation is uncertain: both the removal of the p33 pre-rubric and the special treatment of the p39 red3 affect the equality. Those decisions are physically intelligible, though this match was found retrospectively.

## Arithmetic consequences and the first original inverse

Both printed values are prime. Under the period-available modular arithmetic of Cicada's 2013 signed DH challenge, they specify two sharply defined, reciprocal operations:

1. **Modulus 1033, multiplier 3301.** Since `3301 mod 1033 = 202` has order **516**, multiplication on positions `0..1032` has exactly **three disjoint orbits**, with canonical starts `0,1,5` and lengths **1,516,516**. This happens to equal the number of physically isolated red runes. The obvious literal three-anchor interpretation fails: the true source initial ciphertext runes on those orbits have GP indices `21,2,5`, whereas p39 red3 has `27,5,15`. A reversible orbit-difference decoder `(C[(202*i)%1033]-C[i])%29` applied to the unchanged 1033-runic register gives IoC **0.034101398**, with no GP-native plaintext.
2. **Modulus 3301, multiplier 1033.** Here `ord_3301(1033) = 550`, exactly **three less** than the five numbered passages' combined 553 runes. The natural source-order `1033^(i+1) mod 3301`, reduced modulo 29 and subtracted as the known LP2 p56-style GP29 additive key, yields original-numbered IoC **0.034469429**; no readable passage emerges. The source supplies no actual rule for which three runes would be framing or for how to convert this recurrence into the author's cipher.

Independently, the p39 red3 has GP-prime weights `107+13+53=173`, and `1033` is the **174th prime** (zero-based ordinal **173**). The red sum itself was previously observed in [#771](https://github.com/FlareZ123/liber-primus/issues/771); its prime-ordinal interpretation is a **candidate cross-check**, not an independently authenticated instruction. No source text prescribes zero-based prime-ordinal addressing here.

As a direct plaintext gate, pairing the 553 numbered runes with the **first 553** of the physically unnumbered 1033-rune register and performing literal mod29 subtraction gives IoC **0.034115628**, or **0.033702859** for addition, compared with solved-native p57 IoC **0.062709966**. The 553-rune known-p57 planted positive reencodes and recovers **553/553** under the same additive operator. These complete tests reject the cheapest key/consumer readings; they do not exclude other stateful cryptography.

## A new first-opcode candidate with direct contemporary NUMBER semantics

The source's **first** p33 red heading has ten true GP29 runes, prime weights adding to **379**. A documented 2013 participant **NUMBER** operation reverses decimal digits and factors the result, though the signed 2013 TCP specification does **not** authenticate NUMBER; see prior [#771](https://github.com/FlareZ123/liber-primus/issues/771). Its literal read is:

`379 → 973 = 7 × 139`.

This points to **seven original p33–39 pages** and the **139-runic first numbered passage**, both identifiable from source ink without consulting transformed output. The latter is a named receiver. A precise DH-like modular action selected by the same factor pair, `i ↦ 7i (mod 139)`, divides exactly **139** positions into **three orbits of sizes 1,69,69** with first positions `0,1,2`. In this candidate, the original **three** p39 red runes could serve as natural three-orbit IVs. This is a second three-orbit construction independent in arithmetic from `3301 mod 1033`, with the **source-selected size 139** of the *first* numbered passage. It improves the plausibility of an intended group-action clue relative to an unconstrained prime search, while simultaneously increasing the need for a genuine independent validation.

The cheapest **fully reversible** first-passage additive feedback inverse has explicit convention: for each orbit's first position, `P[start]=(C[start]−red3[orbit]) mod29`; all other orbit positions are `P[i]=(C[i]−C[prev in orbit]) mod29`. Forward cumulative re-encoding reproduces original **139/139** GP ciphertext exactly, but decrypted text remains random-like: first-unit ciphertext IoC **0.034198728**, decrypted IoC **0.032739026**, compared with solved p57 **0.062709966**. The complete tested operator, all three IVs and full original output are reproducible in the linked SFT. Both decipherment and source-authenticated selection **fail**. We must not silently promote the 2013 participant NUMBER account to signed Cicada authority; no true plaintext or IV rule is established.

## Decision and next actual solve requirement

The numerical and cycle counts are independently reproducible properties of original ciphertext and visible special marks. The **three-cycle/red-three** alignment, **550+3** alignment, and **1033-count** alignment together nominate a bounded mechanism to pursue **only if** further first-party text selects the missing operator: an initialization mapping for the red three, a path through the modular cycles, a GP29 symbol-changing rule and a rule for consuming all five numbered ciphertext passages. Those choices cannot be inferred solely from the numeric equalities. Tests with one additive pad or unframed differences are negative, so automatically searching orientations, red-runic affine maps or extra exponents would overfit.

**Outcome:** exact new source-conditioned register length and algebraic structure, no asserted decryption. Keep the existing 56-unknown-page status unchanged. The causal route to plaintext remains contingent on an independently selected orbit-state/receiver operation.
