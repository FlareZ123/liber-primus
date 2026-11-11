# p50 / p39 / p3 finite-field quotient

## Result

Let P50(X) be the degree-255 polynomial whose descending coefficients are the 256 values in resources/liber-primus/base60-grid.json, reduced modulo 29.

The red polynomial on p39 is

\[
F_{39}(X)=27+5X+15X^2=15(X-24)^2.
\]

The red polynomial on p3 is

\[
F_3(X)=13+23X+2X^2,
\]

so in the quotient field we have \(u^2=3u+8\), a representation of GF(29²).

The following operation is exact:

1. Divide P50 by F39 in GF(29)[X].
2. Reduce the quotient modulo F3.

The remainder is

\[
\boxed{19+13u}.
\]

The element \(19+13u\) has multiplicative order 840, the full order of GF(29²)^\*. It is therefore a primitive element of the field.

The scalar 15 in F39 matters. Dividing only by \((X-24)^2\) gives \(24+21u\); dividing by the full p39 polynomial gives \(19+13u\). The coefficients 19 and 13 coincide with the first rune M/GP19 of the p27 title and its 13-dot separator. This is an observed alignment, not proof of intended use.

Reproduction:

\`\`\`sh
node sims/p50_p39_p3_field_remainder.cjs
\`\`\`

The script checks exact divisibility and verifies the order of the resulting field element.

## Relationship to the p53 selector

The p27-title/gridfold/p53 closure selects p53 word26, whose rune indices are [12,1,17] and whose GP prime weights sum to 105. Applying the documented 2013 NUMBER operation gives

\[
105\rightarrow501=3\times167.
\]

167 is the 39th prime, so this is a plausible cross-round selector for p3 and p39. The selection is not unique by itself: prime sum 105 occurs in eight LP2 words. The gridfold construction is what singles out this occurrence. Treat the p3/p39 selection as a hypothesis, not a proven instruction.

## What the primitive element does—and does not—establish

The derivation supplies a source-constrained primitive field element rather than an arbitrary guessed key. I tested the most direct interpretations against the LP2 stream and the p27 section:

- \(g^i\) and \(g^{-i}\) as additive or multiplicative field keystreams;
- constant field addition and multiplication by \(g\) and \(g^{167}\);
- discrete-log substitution and power maps with exponent 167 or its inverse modulo 840;
- the p3/p39 119-prefix pair mapped through \(\log_g\), then repeated as a 238-rune Vigenère key on the p27 section;
- the existing Q238/GF841 recurrence with p53-derived seed-lane rotations 16/17 (both 1-based/0-based conventions) and output phases 15, 16, 17, 18, and 105.

None recovered readable plaintext. These are bounded negative tests, not proof that the field element has no intended use. In particular, do not expand into unconstrained field-operation or phase searches without an independent source clue.

The p27 section used for the Vigenère check is the 1433-rune run beginning at p27 and ending immediately before the next 10-dot marker on p32. Its leading rune is M/19; removing that header leaves 1432 runes. The 238-rune key derived from the paired p3/p39 prefixes did not decrypt this section.


## Source-quotient GF(29²) trace-feedback gate (Agent 29, 11 November 2026; bounded negative)

The exact table quotient supplies the primitive multiplier \(g=19+13u\), while p54's enlarged Ac supplies \(\beta=24\). The p3 polynomial fixes \(u^2=3u+8\), so the canonical field trace is \(\operatorname{Tr}(a+bu)=2a+3b\). This gives a compact, human-recognizable candidate state cipher:

\[
c_i=p_i+\epsilon\,\operatorname{Tr}(s_i)\pmod{29},\qquad
s_{i+1}=g^{\pm1}s_i+24f_i\pmod{29},
\]

where \(f_i\) is either recovered plaintext or ciphertext. The source fixes \(g\), its field, and the visible scalar 24; trace output and this feedback architecture are a motivated test, not an authenticated instruction.

The original 12,956-rune stream was tested under both generator directions, both output signs, continuous-book and physical-page-reset clocks, plaintext and ciphertext feedback, and all 841 initial GF(29²) states: **13,456 exact inversions**. Selection used a Shakespeare-trained GP trigram model (first 240,000 characters; 174,998 training runes), with the final 60,000 characters and independent Gibran text as native-English controls. The train/held-out split is physical p0–27 (**6,761** runes) versus p28–55 (**6,195**).

The best training-selected candidate is \(g\), negative trace sign, page reset, ciphertext feedback, seed \((17,1)\): training **−8.59048** and held-out **−8.86209** nats/rune. The best held-out score anywhere in the complete family is only **−8.59044**. Native-GP control windows score **−2.35403 to −2.93073**, so even the best original candidate is far outside the language range. A separate 12,956-rune Gibran positive plant recovers exactly, and the best original candidate re-encrypts all **12,956/12,956** original runes.

This rejects the tested source-quotient primitive-field trace-feedback family as a direct native-GP decoder. It does **not** reject other output maps, nonlinear state transitions, other source-selected scalars, or non-GP intermediates. No plaintext or authentic key follows. The exact reproducer is [sims/p50_quotient_gf841_feedback_sft.cjs](../sims/p50_quotient_gf841_feedback_sft.cjs).

## Caution about the historical DH material

An exploratory calculation \(31^{167}\bmod1433=1329\), followed by reductions of 1329 into the p50 table, is not an authenticated DH construction. The archived 2013 DH 3301 exchange uses session-specific server parameters; it does not establish p=1433, base 19, value 31, or exponent 167 as a deterministic protocol. Do not promote numerical projections of 1329 to evidence. Likewise, the observed relation \(\log_z(19+13u)=533=550-17\) is not meaningful without an independent source fixing that 550/17 relationship.

## Exact cross-link to the p55 fold matrix

The p55 three-source matrix has characteristic polynomial \((X-21)(X^2-15X+18)\), with its two non-base-field eigenvalues \(u^{83}=18+22u\) and \(u^{727}=26+7u\). The p50 quotient element is not merely another order-840 element: direct field arithmetic gives

\[
g^{127}=u^{83}=18+22u,\qquad
g^{323}=u^{727}=26+7u.
\]

The conjugacy is exact: \(g^{323}=(g^{127})^{29}\), since \(127\cdot29\equiv323\pmod{840}\). The exponents have source-compatible readings: 127 is the last zero-based position of p53's 128-rune black prefix; 323 is p53 word26's final GP rune B/17 multiplied by the p27 red-title length 19; and 83 is the p50 global row-major index of token 3D. The updated reproducer checks these identities from the original grid and corpus inputs.

This is a precise cross-artifact algebraic correspondence. The p55 matrix's irreducible quadratic component has the same characteristic polynomial as multiplication by \(g^{127}\); equivalently, its 2D component is similar over GF(29) to the regular-representation matrix for multiplication by \(g^{127}\) in the p3 basis \(u\). The similarity basis itself is not source-selected. The source exponents are candidate selectors, not proof of intended use.

The simplest direct use—multiplication of fixed adjacent two-rune GP29 pairs by a field element or a period-840 field schedule—is already contained in the all-secret pair-bijection exclusion in sims/lp2_gf841_pair_phase_allsecret_sft.cjs. The literal p55 Hill3 inverse and the one signed-word evolving-matrix state are also negative on their source-marked original spans. No cipher operation, direction or clock is selected, and no unknown plaintext is recovered.

## Current assessment

The exact quotient \(P_{50}/F_{39}\bmod F_3=19+13u\) is reproducible and has an exact p55-matrix eigenvalue correspondence. Its direct power, discrete-log, pair, and source-quotient trace-feedback interpretations remain nonlinguistic under the bounded original-input tests documented above. The p53/2013 NUMBER selector remains a hypothesis, and no source instruction selects the tested trace-feedback architecture. Retain the algebraic relation as intermediate evidence; no plaintext, authentic key, or intended operation is established.

Related work:
- results/README.md — authoritative p3/p39 polynomial and current synthesis
- im-results/p27-title-gridfold-p53-closure.md — source of the selected p53 word26
- im-results/2014-magic-square-direction-map.md — historical NUMBER/DH context
- im-results/lp2-q238-119prefix-lfsr-seed-test.md — prior Q238/GF841 recurrence work
- sims/grid_bigint_factors.cjs — p50 table polynomial construction
