# P7 red-word quartic as a fourth-order long-period GF29 key generator

**Agent19, 23 November 2026. Verdict: original-source negative for a fully specified degree-four cipher generator; no newly recovered Liber Primus plaintext.** [Source-exact Node22/CommonJS reproducible test](../sims/lp2_p7_quartic_irreducible_lfsr4_original_sft.cjs), [successful GitHub Actions run 45116446699](https://github.com/FlareZ123/liber-primus/actions/runs/45116446699).

## Independent source selector and why this is distinct

The last five **complete red words** of original physical LP2 p7 occupy original rune indices194–207 and yield the previously established GP29 ordinal products

`[11,26,8,15,2]`.

In their printed order, the five values define a genuine **degree-four** polynomial in GF29:

`Q(X)=11+26X+8X²+15X³+2X⁴`.

The immediately adjacent physical p8 opens with a **four-rune** red word `XIXM` followed by an **eight-rune** second red word. A 2014 solver might interpret a 4-rune red word as the initial four state symbols and use a monic degree-four field polynomial as a linear-feedback key. This is structurally different from the repository's previously tested **fifth-order** recurrence, which used all five products as lag1–5 coefficients and has period1,876.

The quartic as printed is **irreducible over GF29**. Exhausting all 29 roots and 29² possible monic quadratic divisors finds none. The element `X mod Q` in GF(29⁴) has exact multiplicative order **29,470 = 2 × 5 × 7 × 421**, long enough to traverse every one of the book's 12,956 unsolved runes without repeating. The script checks the order with exact modular polynomial exponentiation and all its prime divisors. Only **2/120** permutations of these five printed coefficients have this particular irreducible quartic root order; there are 38 irreducible quartics in all. This specificity is **conditional on the retrospective quartic construction** and is not a probability that Cicada intended it.

**Critical missing selector:** neither the p7 image nor authentic Cicada documentation instructs the solver to build an LFSR, use the four-rune p8 red word as the seed, or apply additive versus integrated ciphertext feedback. The arithmetic motivates a finite experimental hypothesis, not a claimed recovered key.

## Fixed original inverse

Normalize the quartic, yielding the fourth-order recurrence

`K_i = 7 K_(i−1) + 25 K_(i−2) + 16 K_(i−3) + 9 K_(i−4) (mod 29)`.

The original printed p8 `XIXM` supplies `[14,10,14,19]` as a four-symbol source IV. This predicts the next eight key symbols `[15,24,16,21,22,20,10,9]`. They match **0/8** printed symbols in the adjacent second red word `[1,14,19,5,2,13,3,17]`, so a direct continuation-copy interpretation fails immediately.

Treat the original intact **p8–p14 seven-page section** as the target, preserving all **1,729** rune symbols. Keep the first four printed p8 runes as IV and derive a 1,725-symbol key stream with the frozen recurrence. Exactly four direct, conventionally reversible original-source decoders are considered:

- `P_i = C_i ± K_i` (direct additive).
- `P_i = (C_i − C_(i−1)) ± K_i` (integrated ciphertext feedback).

All four are exactly reencribable to every one of the 1,729 original runes. An independent 95-rune **authentic solved p57** GP29 plaintext, repeated to the same full length, is encrypted and recovered exactly under each rule.

| Decoder on p8–p14 after IV | Original decoded GP29 coincidence |
| --- | ---: |
| Additive, minus key | 0.034374390531 |
| Additive, plus key | 0.034449039981 |
| Integrated, minus key | 0.034543864958 |
| Integrated, plus key | 0.034523689431 |

All outputs remain indistinguishable from the original ciphertext's near-uniform one-symbol distribution and have no readable contiguous GP29 prose. The full decoded prefix of the first model is `S M O P N OE OE H H W E P B NG F A S E O A H E C W`; it begins with the printed p8 red second word. This negative rejects the fully specified source-IV, quartic-additive or quartic-integrated interpretation as a *direct* native-GP29 plaintext receiver.

## Stronger hidden-IV rejection on intact printed words

The four-rune IV may have been hidden rather than printed. For the fixed **linear** recurrence this objection is decidable without enumerating any of the `29⁴ = 707,281` possible seeds.

If a complete original p8 ciphertext word `C_0..C_(L−1)` encrypts native GP29 plaintext `P_0..P_(L−1)` by `C=P+K`, then its inferred `K=C−P` must satisfy **every five-symbol sliding recurrence equality** whenever `L ≥ 5`. These equalities apply independently of all four hidden initial key values or the global stream phase. The direct sign reverses `K` but leaves its homogeneous recurrence unchanged.

The six physically complete original p8 black words with GP29 lengths **[9,10,12,10,9,9]**, at page8 black-body offsets **[8,112,128,160,174,221]**, provide six independent tests. Use exactly the source-native English GP29 word encoder calibrated from original solved LP1, and the same pinned **29,157-word TextBlob** source lexicon already used in the repository's prior *fifth-order* work. Also test every word of the independent **39,835-word Latin Vulgate** GP29 reference, preserving its original word boundaries. Crucially this is a *new* **fourth-order** source polynomial, so the prior fifth-order exclusions did not answer this question.

Run the word-implied keystream through both the printed and reciprocal quartic recurrences (the reciprocal's lag1–4 weights are `[24,23,25,13]`). Results:

| Complete original p8 black word | English words of same GP length | Latin words of same GP length | Valid keys / plaintext words, either polynomial |
| --- | ---: | ---: | ---: |
| offset8, L9 | 3,409 | 1,892 | **0** |
| offset112, L10 | 2,392 | 1,229 | **0** |
| offset128, L12 | 772 | 453 | **0** |
| offset160, L10 | 2,392 | 1,229 | **0** |
| offset174, L9 | 3,409 | 1,892 | **0** |
| offset221, L9 | 3,409 | 1,892 | **0** |

Every native-source dictionary word of these lengths fails at least one exact **seed-independent** GF29 recurrence equation on every original word, for **both** polynomial directions. The same test accepts an actual native-GP positive plant with source-derived quartic encryption and rejects a deliberately corrupted plaintext control.

This result excludes the broad class of original p8 **fixed-clock additive fourth-order p7-quartic LFSRs with any hidden seed**, for English/Latin words represented in these source lexica and genuine printed word boundaries. It does not cover plaintext-dependent key clocks, nonlinear alphabets, non-GP output, transparent interrupters, altered word segmentation, or a different source-selected cipher.

## Direct original four-rune field multiplication using adjacent source registers

The p7 red quartic is irreducible and thus creates a field **GF(29⁴)**. The next p8 red title starts with exactly four GP29 indices **A=[14,10,14,19]**. Those are physically adjacent original operands for a candidate **fixed four-rune block multiplier**: interpret four consecutive ciphertext symbols as a polynomial-basis field element, then multiply by the field inverse of A modulo p7's original source quartic. The exact field inverse is **A⁻¹=[18,18,28,23]**, with A×A⁻¹=[1,0,0,0].

Freeze the two operation directions (multiply by A⁻¹ or A), and the three natural original p8 recipient starts (whole p8 at0, after first red word at4, after full red title at12). The intact original p8–p14 register contains **1,729** GP29 runes. Whole four-rune blocks are transformed and the 0–3 remaining original tail runes are copied unchanged, keeping the receiver completely invertible without a fitted key.

| Original recipient starts at p8 offset | Multiply by A⁻¹: decoded GP29 IOC | Multiply by A: decoded GP29 IOC |
| --- | ---: | ---: |
| 0, complete p8–p14 section | **0.03453613** | **0.03441898** |
| 4, after the initial red four-rune word | **0.03453647** | **0.03441407** |
| 12, after both red heading words | **0.03452178** | **0.03440842** |

All six exact original outputs remain close to uniform ciphertext with no continuous native GP29 prose. Their every original rune exactly reencrypts, and every model recovers all **1,729** symbols of an independently encrypted solved-p57 GP29 positive. The complete source-first inverse starts `U F F F O E S EA T EO A A`, inconsistent with a native title. These tests sharply reject this particular complete GF(29⁴) block-cipher interpretation, while leaving arbitrary **unknown** four-rune mappings outside their scope.

**Source-selector limitation:** the two original operands are real and adjacent, but Cicada supplies no instruction to interpret the p7 five-word products as a polynomial basis or to multiply the p8 red4 field element. Source arithmetic and cipher plausibility must remain distinct.

[Read-only Windows/CommonJS original-and-positive SFT](../sims/lp2_p7_gf29quartic_p8_red4_blockmul_original_sft.cjs) · [original-input GitHub Actions CI](https://github.com/FlareZ123/liber-primus/actions/runs/45119364598).

## Authentic Cicada p56 literal-F clock transfer (separate, stronger failure)

Because the solved original p56 has an authentic **literal-F transparent key clock**, a direct fourth-order key test alone is insufficient: a 2014 solver might apply exactly that already demonstrated author operation to the independently printed p7 field polynomial. Here the rule is precise: original ciphertext `F=0` may represent literal plaintext `F=0` with **no** key advance, or an encrypted **non-F** rune consuming one key; any other ciphertext rune must be encrypted **non-F**, consuming one key. This strictly preserves the existing source's F behavior. No extra escape codes, secret skip flags or fitted key schedule are allowed.

Preserve the exact fourth-order recurrence `K_i=7K_(i−1)+25K_(i−2)+16K_(i−3)+9K_(i−4) mod29`, and derive each of four physically contiguous source-visible four-rune IVs before reading the next unknown body:

- first p8 red word **XIXM**: `[14,10,14,19]`, with body starting after either this word (original p8 offset4) or its complete two-word red title (offset12);
- first four runes of the p8 second red word: `[1,14,19,5]`, body offset12;
- last four runes of that second red word: `[2,13,3,17]`, body offset12;
- last four original p7 red runes: `[28,6,28,19]`, body starting at p8 offset0 or offset12.

For each of these six original recipient/seed placements and both additive signs, exhaust **every permitted literal-F skip branch**, recomputing all four key-state registers exactly; a branch is discarded only when an encrypted rune would illegally decode to plaintext F. A source-normalized symbol index at which **zero** legal histories remain is an exact contradiction even without natural-language tests.

| Source four-rune IV | First impossible original p8 rune offset, subtract / add key |
| --- | --- |
| p8 XIXM, decrypt after its four runes | **18 / 87** |
| p8 XIXM, decrypt black body after red12 | **14 / 55** |
| p8 second-red first4, decrypt after red12 | **14 / 19** |
| p8 second-red last4, decrypt after red12 | **55 / 14** |
| p7 last red4, decode all p8 | **9 / 8** |
| p7 last red4, decrypt after p8 red12 | **79 / 18** |

**All twelve original-input branches become algebraically impossible within p8's first 88 runes.** The most any state frontier contains is **two** legal states, so there is no beam/heuristic pruning. Every test includes actual original letters at every step and never scores English. For a positive, the same original p57 plaintext repeated to255 GP29 runes is **actually encrypted** under each of eight source-visible IV/sign combinations with literal-F bypass. The exhaustive inverse preserves the true key state through all255 ciphertext runes in each positive (8/8), demonstrating that the algebraic impossibility on original p8 is a real discrimination.

**Decision:** fixed source-word quartic LFSR plus the *authentically solved* p56 F-transparent skip cannot decode any of the six natural adjacent p8 title/body placements even with exhaustive branching. This strengthens the earlier random-looking direct output: these twelve exact historical-operation transfers do not exist as legal original inverses, whatever the plaintext language. The source leaves no reason to add further arbitrary skip classes or tuned initiation.

[Read-only CommonJS exact F-branch SFT](../sims/lp2_p7_quartic_lfsr4_Ftransparent_original_sft.cjs) · [successfully executed CI with both original tests](https://github.com/FlareZ123/liber-primus/actions/runs/45117543172).

## Next decision

The degree-four construction is a plausible new mathematical reading of five red words and the four-rune adjacent opening, but its simplest complete consumers fail an untouched native-GP original. **Retire the source-derived degree-four additive key generators, their authentically observed p56 F-transparent clock variants, and the directly adjacent red4 fixed GF(29⁴) multiplier absent a genuinely new first-party state-update or output selector.** The irreducibility and period are reproducible mathematical facts, not an authenticated encrypted message or recovered key. No new source-independent parameter search is recommended. The next useful result needs a first-party instruction selecting a genuinely evolving original-cipher inverse, or authentic key material, sufficient to predict contiguous plaintext without fitting it.
