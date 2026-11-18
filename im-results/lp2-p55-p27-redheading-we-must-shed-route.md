# p55 -> p27 red-heading instruction chain: WE / MUST / SHED

**Agent14, 18 November 2026. Status: intermediate source-constrained route. No unknown LP2 plaintext, creator-supplied key, or complete inverse is recovered.**

## Upstream selector

This investigation starts only after the already-established finite-source terminal handoff. The 2013 \`prime_echo\` exhaustion family selects p55 boundary300, and the first intact complete-word pair after that boundary is \`DJU / BEI\`. It is the sole repeated adjacent complete-word pair in p0-p55 and its only other occurrence is p27 line2. The calibrated evidence therefore selects **p27** independently of the red-heading arithmetic below. See [the corrected terminal report](lp2-primeecho-terminal-duplicate-mapline.md).

The maintainer's human-puzzle criterion is important here: once p27 is selected, inspect the conspicuous source-visible objects on that page before inventing another cipher.

## Exact p27 source object

Original p27 begins with one red span of **19 runes**, split into three printed words of lengths **3 / 12 / 4**:

\`MPY / LSOAAEHLEEOIML / LSCP\`

The span is immediately followed by a red **13-dot** mark. Its first rune is **M**, GP29 index **19**.

Using the manuscript's published GP prime values, the complete 19-rune heading has prime sum

\[
1109,
\]

and 1109 is the **186th prime**. Clear p57 \`MUST\` has GP-prime sum **186**. The same value is a valid zero-based row-major p50 address: cell186 prints \`0J\`, whose source-adjudicated byte value is **19**. Thus the same route returns both the heading length and its first-rune index:

\[
\operatorname{rank}_p(\Sigma_p(H)) = 186 = \Sigma_p(\text{MUST}),\qquad
T[186] = 19 = |H| = \operatorname{GP}(M).
\]

Across all **18** original red spans, p27 is the only span whose full prime sum has a prime ordinal equal to any p57 complete-word prime sum, and it is also the only span for which the resulting p50 byte equals both the span length and first-rune index.

## Literal circumference shedding

The p57 sentence begins \`WE MUST SHED OUR OWN CIRCUMFERENCES\`. Apply the literal word operation to the selected p27 red heading: remove the first and last rune of each of its three printed words.

The remaining lengths are **1 / 10 / 2**, totaling **13 runes**, exactly the size of the immediately following 13-dot mark. The survivor is:

\`PSOAAEHLEEOIMSC\`

Its GP-prime sum is **673**, the **122nd prime**. Original p50 cell122 prints \`1Q\`, byte **86**, and clear p57 \`WE\` has GP-prime sum **86**:

\[
T[\operatorname{rank}_p(673)] = T[122] = 86 = \Sigma_p(\text{WE}).
\]

Across all 18 red spans, p27 is the only span whose once-shed interior has prime sum with a p50-at-prime-rank byte equal to any p57 complete-word prime sum. It is also the only marked red span whose shed-interior rune count equals the size of the following large mark.

Shed the circumference of those three surviving parts once more. The five runes removed on this second step are:

\`PSMSC\`

Their GP-prime sum is **233**. Because 233 is prime, the solved-p56 authenticated totient operation gives

\[
\varphi(233)=232,
\]

and clear p57 \`SHED\` has GP-prime sum **232**.

The three exact p57 values are therefore **86 / 186 / 232 = WE / MUST / SHED**.

## Ordering limitation

The arithmetic does **not** yet author the output order. Natural structural evaluation of full heading, first shed, then second shell gives \`MUST / WE / SHED\`. Matching the p57 sentence uses the order first-shed / full-heading / second-shell, yielding \`WE / MUST / SHED\`.

That inner-before-outer choice is currently an underselected convention. Do not label the three words recovered plaintext. Their value is that the independently selected p27 source object lands repeatedly on an already-clear Cicada instruction under operations already present in the manuscript.

## Discovery-aware control

The reproducer conditions on the independently selected p27 **3/12/4** word geometry and randomizes only the exact multiset of the **225 original red rune identities** across red slots. To account for post-discovery flexibility, each of the three geometric objects is allowed a broad finite operator grammar:

- GP prime sum;
- GP index sum;
- \(\varphi\) of prime sum;
- prime ordinal of prime sum;
- one zero-based row-major p50 lookup applied to any of those scalars when addressable.

All six permutations of the three objects are allowed, and any consecutive p57 three-word sum sequence counts as a hit.

With deterministic seed \`0x6d2b79f5\`, **10 / 200,000** shuffled headings hit some consecutive p57 triple under this broad grammar. **0 / 200,000** also satisfy the original full-heading self-check \`T[rank(sum)] = 19 = first-rune index\`. This is a matched scale control, not an authorship p-value. The operator family was developed from the observed object, so the result supports prioritization rather than proving intent.

## Direct receiver gate

The once-shed 13-rune survivor is an obvious candidate key, but its simplest same-page receiver fails immediately under an authenticated solved-LP convention. Use the black p27 body after the red heading, phase zero, repeating GP29 additive key, and plaintext-F transparency. Under the standard subtract direction, a non-F ciphertext would have to decrypt to forbidden plaintext F at body offset **5**. The opposite sign dies at offset **61**.

Therefore the 13-rune survivor is **not** a direct solved-style transparent-F Vigenere key for the p27 body in either sign. Do not widen phases, reversals, or unrelated ciphers without a new source selector.

## Decision

This route materially strengthens the existing p55 -> p27 handoff. The selected destination contains a unique red-heading structure that repeatedly closes against p50, p56, and clear p57:

1. full heading: \`1109 -> prime rank 186 = MUST\`, with p50 returning the self-value 19;
2. first literal circumference shed: 13 survivors matching the printed 13-dot mark, then \`673 -> rank122 -> p50 byte86 = WE\`;
3. second shed shell: \`233 -> phi = 232 = SHED\`.

The productive missing step is now **a source-authored ordering/receiver rule** that turns this validated instruction chain into a reversible operation on unknown ciphertext. The direct 13-rune Vigenere receiver is excluded. Preserve the chain as an intermediate solve-path candidate and use it to constrain the next receiver rather than as license for a free cipher search.

Reproduce with [the single-file Node.js test](../sims/lp2_p27_redheading_we_must_shed_sft.cjs).
