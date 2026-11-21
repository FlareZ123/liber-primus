# Three exact 308-rune source registers under p7's [5,7,11] Shamir coordinates

**Agent1, 21 November 2026. Status: finite original-cipher negative, not a recovered plaintext or authentic secret-sharing instruction.** This test combines the newly isolated original red-marker-bound p6/p7 passage with two previously independently documented 308-rune registers. Unlike two-time-pad cancellation, the proposed operation is a complete, source-numbered, keyless three-share reconstruction: it predicts every unknown rune of a putative secret if the three ciphertext registers are evaluations of the same degree-two GP29 polynomial.

## Plausible human path and its weaknesses

- The **two red 13-dot punctuation objects** enclosing the p6/p7 black interval select p6 offsets82–195 (**114** original runes) and p7 offsets0–193 (**194** runes). Their 308-rune concatenation preserves true printed reading order and one page-crossing word ([source boundary](lp2-p6-p7-markerrestored-hill5-word70-original-gate.md)).
- The independently analyzed p49–51 numeric table has an **assembled two-flank 308-rune register**: earlier pre-table source p48 suffix72 and p49 prefix66 (**138**), followed by p51 prefix92 and p52 prefix78 (**170**). This concatenated register is **discontinuous across the table** and was already compared with terminal text as a hypothetical repeated pad ([earlier flank gate](lp2-flank308-terminal308-sharedpad-difference-original-gate.md)). Its equal length depends on source-chosen cuts, not an explicit author instruction.
- Original terminal p54 and p55 together contain **232+76=308 runes**, the third book-order register. Its 76-rune second part includes the authentic page-carried beginning and is kept unchanged.
- Immediately after the red mirrored word pair at the end of p7, the **next original complete red word** (rune offsets200–202) is exactly the three GP29 indices **[5,7,11]**. It consists of increasing prime-number GP *indices*, different from Gematria Primus prime *weights*. In a hypothetical Shamir construction, those are three distinct nonzero evaluation positions in GF29. The operations and correspondence are *proposed*: the manuscript does not mention Shamir sharing, identify these three registers as shares, or instruct reading the third red word as abscissas.

Assign the three ciphertext registers in **physical book order** to x=5,7,11. A degree-two polynomial over GF29 has its secret at x=0, so classical Lagrange reconstruction fixes exactly the coefficients:

```text
secret[i] = 4 × p6p7[i] + 4 × flanks[i] + 22 × terminal[i] (mod 29)
weights [4,4,22]; sum weights = 1 mod 29
sum(weight × x) = sum(weight × x²) = 0 mod 29
```

The two equal weights make the first two register assignments interchangeable. To avoid concealing a beneficial order, the reproducer also executes the **other five physical-register-to-coordinate assignments**, which collapse to three distinct outputs. No fitted GP alphabet, phase, reverse reading, plaintext crib, cipher model or parameter is used. All source ciphertext runes remain untouched.

## Keyless original output and positive

| Which region gets the distinct coefficient 22 | Recovered GP29 IoC on 308 symbols | Plain-language recovery? |
| --- | ---: | --- |
| p54–55 terminal | **0.03318668** | No |
| Pre/post table flanks | **0.03451923** | No |
| p6/p7 red-bracketed body | **0.03447692** | No |

All three complete results occupy the random-like GP29 range. The book-order reconstruction begins `D IA O H O B A U U E F IA S M A M EO TH M H...`; it is not continuous source-native English and has no independently attested unknown-page plaintext. These results exclude exactly the proposed GF29 degree-two *secret-at-zero plaintext* reading, **conditional** on the chosen triple of source registers. They do not exclude a key/witness encoded in some other register, missing secret-sharing metadata, or the ordinary possibility that the three lengths happen to coincide.

For a substantive positive test, an independent **308-rune planted source-native solved-p57 message** was encrypted into three independently varying quadratic shares at x=5,7,11 using nonzero per-position coefficients. The identical inverse recovered all **308/308 true GP plaintext symbols**, with every polynomial coefficient annihilated by the Lagrange weights. This guards against a false-negative implementation.

**Reproducer:** [single-file read-only CommonJS test](../sims/lp2_three308_p7prime_triple_shamir_original_sft.cjs) · [Windows Node 22 PASS, GitHub Actions run 44943306250](https://github.com/FlareZ123/liber-primus/actions/runs/44943306250).

## Literal red13-dot output point, independent of Shamir's zero convention

The original p6/p7 passage is delimited by **two red 13-dot punctuation groups**, a source-visible candidate for **evaluating the recovered polynomial at x=13**, rather than adopting a generic Shamir secret-at-zero convention. Keep the same frozen three x coordinates `[5,7,11]`, identical three 308-rune source arrays, and all six register assignments. Exact GF29 Lagrange weights now simplify to:

~~~text
f(13)[i] = 1 × A[i] + 27 × B[i] + 2 × C[i] (mod 29)
         = A[i] − 2 × B[i] + 2 × C[i] (mod 29)
~~~

The natural physically ordered output has GP29 IoC **0.03432886**; the five alternate share assignments range **0.03422311–0.03595753**. All six are nonprose. A separate planted **degree-two GP29 polynomial whose 308 independent values at x=13 are known** reconstructs every target value exactly, demonstrating the alternate evaluation is implemented correctly.

To preserve the actual historical alternative to GP-native text, interpret each complete 308-output register as a **single big-endian BASE29 integer**, the explicit conversion performed in authentic 2013 Cicada stages. The resulting **187- or 188-byte** binary values in all six arrangements fail the actual first-byte magic of contemporary bzip2 (`BZh`), gzip (`1F8B`), ZIP (`PK03`), PNG, and XZ. The physically ordered output begins hexadecimal **`992f29a48b423bba`**; no typed historical payload is recovered. There is no source instruction selecting BASE29 serialization for these particular outputs, so this is a bounded transport check.

This alternate output coordinate is arguably more directly clue-motivated than x0, but it **does not rescue the Shamir interpretation**: the omitted authentication of three share regions and a page-to-coordinate map remains fatal. [Expanded original-source SFT](../sims/lp2_three308_p7prime_triple_shamir_original_sft.cjs); [Windows Node22 expanded run 44943596200](https://github.com/FlareZ123/liber-primus/actions/runs/44943596200).

## Research decision

The original p7 red word and physical 13-dot endpoints define two concrete, testable interpolation points (0 by classical secret-sharing convention; 13 by original punctuation) on any proposed three-share register; neither produces original plaintext or a typed 2013 BASE29 payload. The **critical missing source selection is assigning the visually separated flanks as a share at all**. The identical lengths and red prime triple alone should therefore not be promoted to an author-selected secret-sharing layer. Do not vary polynomial degree, insert artificial symbols, change the 308 cutpoints or scan arbitrary triplets in search of language after this failure. Seek an independently authenticated three-share grouping or alternative first-party reversible opcode before revisiting.
