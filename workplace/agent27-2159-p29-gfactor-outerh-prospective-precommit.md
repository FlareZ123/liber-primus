# Frozen p28→p29 G-quotient and outer-H original-cipher inverse

**Agent27 / issue #2159. Frozen before evaluating decoded original p29 output.** This is a single exploratory source-motivated *two-layer* candidate, not a claim that two consecutive operations were independently commanded by Cicada.

## Human-visible premise and strongest rival

The physically adjacent p28 candidate `READ OUT THE` and source-phrase continuation `THEIR NUMBERS ARE THE DIRECTION` point conditionally to signed source index29 / physical p29. The original p39 isolated red triad supplies GF29 polynomial `G(X)=15X²+5X+27`; the 277-rune original p29 polynomial is exactly divisible by G with 275 coefficients in its quotient. The solved p57 words `SHED OUR OWN CIRCUMFERENCES` and existing independently fixed p28 H operator `H(x,y)=(x-y,x+y) mod29` motivate peeling outer-rune pairs from a complete register. Alternative explanation: the repeated factor and local p28 words are unrelated numerical echoes; no two-layer cipher was intended.

## One fixed, complete inverse

Input: original **physical p29** page (not the 2016 29th word), `resources/liber-primus/lp2-corpus.json` `pages[29].indices` in original 277-rune reading order. No image alignment, word insertion, phase, ciphertext rotation, parameter fitting or source rune correction.

1. Perform ordinary high-first polynomial long division over GF29 by `G=[15,5,27]`, using 15⁻¹=2 mod29. Require the original two-coefficient remainder to be exactly [0,0]. Name the ordered 275-coefficient quotient `Q`.
2. Interpret the 275-coefficient Q as a complete **single** circumference register. For `i=0..136`, take the source pair `[Q[i],Q[274-i]]` and append `[(Q[i]-Q[274-i]) mod29, (Q[i]+Q[274-i]) mod29]` to the plaintext readout. Append unpaired center `Q[137]` as rune275. Output exactly 275 GP29 runes. **Do not** run further cube maps, reverse pair order, swap H components, fit a key, reinsert word spaces or try other delimiters.
3. Invert the operation by `H⁻¹(d,s)=[15(d+s),15(s-d)] mod29` to reconstruct Q in its exact original indices, then multiply by G and demand exact **277/277** original coefficients.
4. Assess the **entire** 275-rune output as an unspaced GP29 stream. Use the repository source-native LP1 trigram scorer, compare against the original C29, Q and solved-p57 native score. Require a recognisable contiguous >=150-GP-rune message with conventional GP-native text score; implementation plants alone do not count. If it fails, reject exactly this two-layer hypothesis, do not rescue with extra stages.

This is the only original target. The signed clause selects the page but does **not** independently select the G-division or H ordering, so even if an English-looking result appears it needs an independent original receiver. If it does not, the p28 phrase does not supply a full-body cipher for #2159.

## Prospective discriminators

Expected authentic result: a continuous nontrivial native-GP plaintext passage, trigram score comparable to solved LP1/p57, exact inversion and independent follow-through without changing the rule. Expected null: low language score and no complete message despite exact mathematical round-trip. Independent positive: apply forward Q-shell inverse plus G multiplication to source-native solved plaintext of length275 and recover it exactly.
