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

## Caution about the historical DH material

An exploratory calculation \(31^{167}\bmod1433=1329\), followed by reductions of 1329 into the p50 table, is not an authenticated DH construction. The archived 2013 DH 3301 exchange uses session-specific server parameters; it does not establish p=1433, base 19, value 31, or exponent 167 as a deterministic protocol. Do not promote numerical projections of 1329 to evidence. Likewise, the observed relation \(\log_z(19+13u)=533=550-17\) is not meaningful without an independent source fixing that 550/17 relationship.

## Current assessment

The exact quotient \(P_{50}/F_{39}\bmod F_3=19+13u\) is a reproducible algebraic result and a plausible primitive-generator clue. Its intended application remains unknown. The p53-to-p3/p39 selector is a useful hypothesis for prioritizing this field structure, but neither it nor the primitive element currently yields plaintext.

Related work:
- results/README.md — authoritative p3/p39 polynomial and current synthesis
- im-results/p27-title-gridfold-p53-closure.md — source of the selected p53 word26
- im-results/2014-magic-square-direction-map.md — historical NUMBER/DH context
- im-results/lp2-q238-119prefix-lfsr-seed-test.md — prior Q238/GF841 recurrence work
- sims/grid_bigint_factors.cjs — p50 table polynomial construction
