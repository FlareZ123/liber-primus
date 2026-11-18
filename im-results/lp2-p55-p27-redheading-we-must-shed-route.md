# p55 -> p27 Instar-parable parser

**Agent14, 18 November 2026. Status: strong intermediate solve-path candidate. No unknown LP2 plaintext or complete inverse is recovered.**

## Independent destination selector

The pre-existing finite 2013 \`prime_echo\` exhaustion family selects p55 boundary **300**. The first intact complete-word pair after that boundary is \`DJU / BEI\`. That adjacent pair occurs exactly twice in p0-p55, and its only other occurrence is p27 line2. This selects p27 before any arithmetic below. See [the corrected terminal handoff](lp2-primeecho-terminal-duplicate-mapline.md).

This matters because p57 \`EMERGE\` has GP-prime sum **300**. The clear parable's final verb therefore lands on the already-selected p55 boundary.

## The selected p27 red heading

Original p27 begins with one red 19-rune span, printed as three words of lengths **3 / 12 / 4**:

\`MPY / LSOAAEHLEEOIML / LSCP\`

A red 13-dot stencil follows it immediately. The first rune is M, GP index **19**.

The complete heading has GP-prime sum **1109**, the **186th prime**. Clear p57 \`MUST\` has GP-prime sum **186**. Zero-based p50 cell186 has byte **19**, returning both the heading length and its first-rune index:

\[
\operatorname{rank}_p(\Sigma_p(H))=186=\Sigma_p(\text{MUST}),\qquad
T[186]=19=|H|=\operatorname{GP}(M).
\]

Across all 18 original red spans, p27 alone has a full prime-sum ordinal equal to any p57 complete-word sum, and p27 alone also satisfies the p50/length/first-rune self-check.

## First parable sentence inside the printed words

The 12-rune middle word is \`LSOAAEHLEEOIML\`.

Apply the same literal circumference operation p57 describes, taking a word's inner runes and its two-rune outer shell. Using the authenticated GP prime values and totient:

- once-shed 10-rune interior: prime sum 564, \(\varphi(564)=184=\Sigma_p(\text{LICE})\);
- outer shell \`LL\`: prime sum146, \(\varphi(146)=72=\Sigma_p(\text{THE})\);
- whole 12-rune word: prime sum710, \(\varphi(710)=280=\Sigma_p(\text{INSTAR})\).

Reading from the inside outward gives **LICE THE INSTAR**, exactly the first three words after \`PARABLE\`.

This is manuscript-wide selective. The p0-p55 canonical complete-word corpus contains **18** words of length12. Under this fixed inside / shell / whole totient rule, p27's red middle word is the **only** one that yields any consecutive p57 three-word sequence.

The third heading word \`LSCP\` continues the same construction:

- shed interior \`SC\`: prime sum **66 = TO**;
- whole word: prime sum182, \(\varphi(182)=72 = THE\).

Among all **513** complete four-rune words in p0-p55, \`LSCP\` is the **only** word whose fixed interior-sum / whole-totient pair equals any consecutive p57 pair.

The intervening clear words \`TUNNELNG\` and \`SURFACE\` are a plausible description of the traversal, because the extraction moves from nested interior to outer surface. That interpretation remains a hypothesis until it selects a further operation.

## Second sentence: shed the heading

Shed the first and last rune of each of the three heading words. The remaining lengths are **1 / 10 / 2**, totaling **13**, exactly the size of the following red 13-dot stencil. The survivor is:

\`PSOAAEHLEEOIMSC\`

Its GP-prime sum is **673**, the **122nd prime**. P50 cell122 has byte **86**, equal to the p57 prime sum of \`WE\`.

Shed those three surviving parts once more. The removed five-rune shell is \`PSMSC\`, prime sum **233**, and:

\[
\varphi(233)=232=\Sigma_p(\text{SHED}).
\]

The full heading already supplies \`MUST=186\`. These objects therefore hit **WE / MUST / SHED**. Their arithmetic evaluation order does not itself spell that sentence order. A cleaner human reading is to enter the clear p57 instruction at the already-selected \`MUST\` and execute **MUST SHED OUR OWN CIRCUMFERENCES** on the visible heading.

A broad discovery-aware null preserves the 3/12/4 geometry, shuffles the exact multiset of 225 original red rune identities, permits prime sum, index sum, totient, prime ordinal, one p50 lookup, and all six object orders. Ten of 200,000 trials hit some consecutive p57 triple. Zero also satisfy the p27 full-heading 19 self-check. This calibrates the scale of the aggregate pattern; it is not an authorship p-value.

## Third sentence signals

Repeatedly tunnel into the 12-rune middle word until its deepest even center, \`HL\`. Its prime sum is96, \(\varphi(96)=32\), and p50 cell32 has byte **115**, equal to the p57 prime sum of \`WITHIN\`.

The p27 black body after the selected 19-rune heading contains exactly **215 runes**. P57 \`AND\` has GP-prime sum **215**. Among the nine p0-p55 pages with an initial red span, p27 alone leaves a 215-rune body after removing that initial red span.

The handoff's p55 boundary is **300**, equal to the p57 prime sum of \`EMERGE\`.

This gives a source-shaped tail:

\`... WITHIN / AND / EMERGE\`

The missing \`FIND THE DIVINITY\` operation is still unresolved.

## The 13-dot stencil

Direct inspection of the original p27 image fixes the stencil geometry as five center dots and four staggered left/right pairs, for 5 center + 8 side dots. Mapping the 13 shed-survivor runes top-to-bottom through that printed geometry gives:

- center-five GP index sum **72 = THE**;
- side-eight GP index sum **115 = WITHIN**;
- center-five GP-prime sum257, whose prime ordinal is **55 = OWN**.

Among all \(\binom{13}{5}=1287\) possible five-of-thirteen subsets, six satisfy the joint center-index72 / complement-index115 / center-prime-rank55 condition. The printed geometry selects one of those six. Treat this as supporting structure rather than a standalone decode.

## Historical solve-path context

The p57 text is the 2013 \`761.mp3\` "Instar Emergence" parable. In the documented 2013 puzzle, that audio was also XORed byte-for-byte with the Twitter-derived binary to recover the Gematria Primus image. Historical source: [neuroretransmit 2013 Twitter reconstruction](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/README.md).

This makes the p27 parable match historically meaningful. The 2013 XOR operation still lacks a source-selected LP2 binary operand, so no free XOR alignment search is justified.

## Receiver gates already closed

Several obvious receivers were tested and rejected:

- the once-shed 13-rune survivor as a repeating GP29 key on p27 and p55;
- the twice-shed eight-rune core as a repeating GP29 key;
- the known solved \`DIVINITY\` key under all eight cyclic phases with WELCOME-style F interrupter freedom on p27; every p27 phase fails algebraically;
- direct p56 prime/totient interpretation of the eight-rune core as \`DIVINITY\`;
- p56 clocks seeded by the historical Instar numbers and line sums; survival is common and the selected outputs are low-IoC nonprose;
- reversed Gematria on the fixed nested heading objects; it supplies none of the missing parable words.

These exclusions prevent the strong p27 parser from becoming a license for unconstrained cipher search.

## Decision

The p55 -> p27 handoff now has a coherent human-facing reason to exist. The destination contains manuscript-wide unique nested matches to **LICE THE INSTAR** and **TO THE**, a literal 13-rune circumference shed matching the printed 13-dot mark, repeated p57 numeric closures, a unique **AND=215** body length, and an upstream **EMERGE=300** boundary.

The productive missing step is narrow: recover a source-authored **FIND THE DIVINITY** operation or receiver that acts on the selected p27 structure and produces unknown plaintext or a genuine key. Until that selector appears, keep this in \`im-results/\` rather than promoting it to established plaintext.

Reproduce the source arithmetic and manuscript-wide controls with [the SFT](../sims/lp2_p27_redheading_we_must_shed_sft.cjs).
