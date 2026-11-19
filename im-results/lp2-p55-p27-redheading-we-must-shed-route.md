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

The handoff itself fixes the sentence entry. The unique repeated pair \`DJU / BEI\` lands on **p27 printed line2**. That line has GP index sum **186 = MUST**. Its GP-prime sum is **673**, prime ordinal122, and p50 cell122 has byte **86 = WE**. Across all **594** printed p0-p55 lines, p27 line2 is uniquely the only line with index sum186 and uniquely the only line whose prime-rank p50 lookup returns86.

The exact handoff line therefore carries both **MUST** and **WE** checksum values. It does **not** by itself order them as WE then MUST: the source-natural computations above produce index-sum **MUST=186** and then prime-rank/table **WE=86**.

Execute the next clear verb literally. Shed the first and last rune of each of the three red heading words. The remaining lengths are **1 / 10 / 2**, totaling **13**, exactly the following red 13-dot mark. The survivor is \`PSOAAEHLEEOIMSC\`; its GP-prime sum is673, the 122nd prime, and p50 cell122 again returns **86 = WE**.

Shed those three surviving parts once more. The removed five-rune shell is `PSMSC`, prime sum233, and \(\varphi(233)=232 = SHED\). The full heading supplies **MUST=186** through its prime ordinal. The natural nested-object derivation remains **MUST / WE / SHED**, giving the numeric values **186 / 86 / 232**. A later independent p11 bridge now supplies the missing order: p11 word11 uniquely emits source indices **25 / 26 = THEIR / NUMBERS** under its untouched sum/difference packet, and the authenticated continuation is **ARE THE DIRECTION** at indices27..29. Following that source corridor in increasing numerical direction orders the p27 values as **86 / 186 / 232 = WE / MUST / SHED**. See [the p11-p27 ordering bridge](lp2-p11-p27-numbers-direction-order.md).

A broad discovery-aware null preserves the 3/12/4 geometry, shuffles the exact multiset of 225 original red rune identities, permits prime sum, index sum, totient, prime ordinal, one p50 lookup, and all six object orders. Ten of 200,000 trials hit some consecutive p57 triple. Zero also satisfy the p27 full-heading 19 self-check. This calibrates the scale of the aggregate pattern; it is not an authorship p-value.

## Ordering gate resolved by p11 THEIR NUMBERS

Director #1653 correctly left the p27 values unordered because p27 itself supplied no independent layout rule for the WE/MUST swap. A later source-selected p11 result now provides that missing rule without changing any p27 arithmetic.

P11 same-index word11 is the untouched two-rune packet `[11,14]`. Reading its fixed H coordinates as sum before difference gives:

```text
11 + 14 = 25
11 - 14 = 26 mod29
```

Authenticated source indices25 and26 are **THEIR / NUMBERS**. Across all 465 complete two-rune manuscript words, p11 word11 is the only word whose sum/difference packet is `[25,26]`.

The authenticated continuation is the increasing source-number corridor:

```text
25 THEIR
26 NUMBERS
27 ARE
28 THE
29 DIRECTION
```

so the first-party instruction is literally **THEIR NUMBERS ARE THE DIRECTION**. P27 is the corridor's index27 page.

The three already-fixed p27 word values are:

```text
186 = MUST
 86 = WE
232 = SHED
```

Following the corridor's increasing numerical direction gives:

```text
86 < 186 < 232
WE   MUST  SHED
```

This fixes the formerly underselected order as **WE MUST SHED**. No p27 rune identity, checksum, prime operation, p50 lookup, or shedding rule is changed. The new bridge selects only the order of the three values.

The p11 result does not turn **WE MUST SHED** into unknown LP2 plaintext. These words are still identified by equality to clear p57 word sums. Its contribution is narrower and important: it supplies the independent first-party ordering instruction that #1653 required.

Reproduction: [p11-p27 ordering bridge](lp2-p11-p27-numbers-direction-order.md) and `sims/lp2_p11_p27_numbers_direction_order_sft.cjs`.

## Third sentence: FIND THE DIVINITY WITHIN

The same circumference operation applied to every printed black-body word gives a deterministic endpoint. After five shedding layers, only four rune-centers remain:

\`OC / EOR\`

Their combined GP-prime sum is **72 = THE**.

Exactly two p27 body words survive to that fifth layer, both length12. One of them is:

\`EORNSOOCAEYEE\`

Its whole-word prime sum is562, and \(\varphi(562)=280 = INSTAR\). This makes it the body counterpart of the red heading's 12-rune \`INSTAR\` word.

Shed that body word exactly two layers. Its eight-rune interior is:

\`NSOOCAEY\`

and its GP-prime sum is **376**, exactly the p57 prime sum of \`DIUINITY\`.

This is manuscript-wide unique. Across all **18** complete 12-rune words in p0-p55, this p27 line5 word is the **only** one whose twice-shed eight-rune interior has prime sum376. The only two 12-rune words whose whole-word totient is **280 = INSTAR** are the red p27 heading word and this p27 body word. The heading therefore selects an \`INSTAR\` class whose only other manuscript member contains \`DIVINITY\` within.

The outermost circumference of the same body word supplies a supporting \`FIND\` checksum. Its two outer runes have prime sum108, \(\varphi(108)=36\), and **151 = FIND** is the 36th prime. This ordinal relation is secondary evidence because the literal verb \`FIND\` already tells the solver to search for the unique inner 376 object.

The relation now reads literally: **FIND THE DIVINITY WITHIN**.

The same printed line containing the unique \`DIVINITY\`-within word supplies two additional visible checks. P27 line5 has exactly **21 runes = OUR**, and the GP-index sum of the first/last-rune circumference of each of its five printed words is **151 = FIND**. Across all 594 printed lines, the rune-count21/circumference-index151 conjunction occurs twice, on p27 line5 and p46 line7. Only p27 line5 also contains a 12-rune word whose twice-shed interior sums to376, so the conjunction becomes unique after the DIVINITY selector is applied.


The p27 black body after the red heading contains exactly **215 runes**, equal to the p57 GP-prime sum of \`AND\`. Among the nine p0-p55 pages with an initial red span, p27 alone leaves a 215-rune body after removing that initial red span.

The upstream p55 handoff boundary is **300**, equal to the p57 GP-prime sum of \`EMERGE\`.

This closes the tail as a source-shaped instruction:

\`FIND / THE / DIVINITY / WITHIN / AND / EMERGE\`

Here \`WITHIN\` is literal containment; the 13-dot stencil independently supplies 115 as described below. \`EMERGE\` also returns the route to the p55 boundary that selected p27.

## The 13-dot stencil

Direct inspection of the original p27 image fixes the stencil geometry as five center dots and four staggered left/right pairs, for 5 center + 8 side dots. Mapping the 13 shed-survivor runes top-to-bottom through that printed geometry gives:

- center-five GP index sum **72 = THE**;
- side-eight GP index sum **115 = WITHIN**;
- center-five GP-prime sum257, whose prime ordinal is **55 = OWN**.

Among all \(\binom{13}{5}=1287\) possible five-of-thirteen subsets, six satisfy the joint center-index72 / complement-index115 / center-prime-rank55 condition.

**Original-image geometry audit (#1633, Agent1): the 5+8 split is not a p27-specific stencil clue.** All **30 red** thirteen-dot marks and the single **black** thirteen-dot mark in the original JPEG set use the same five-center/four-left/four-right glyph geometry. After translation to the p27 glyph, every red dot center is within **0.839 source pixels** and the black p7 glyph within **0.622 pixels**. P27 is still unique in the tighter source family for a different reason: among red spans immediately followed by red13, it alone yields a one-circumference-shed survivor of exactly **13 runes**; under the fixed center positions `[0,3,6,9,12]` that survivor reproduces 72/115/prime-rank55. There are only **four** complete 13-rune words across p0–p55, and none satisfies the same joint fixed-partition condition.

The artwork therefore supplies a generic partition available at every thirteen-dot ornament rather than an independent selector for p27. Preserve the 72/115/55 arithmetic as supporting structure **conditional on the already-selected p27 13-rune survivor**, and do not count the stencil geometry itself as separate confirmation or expand rotations/subsets. Reproduction: [`sims/lp2_p27_red13_stencil_geometry_sft.py`](../sims/lp2_p27_red13_stencil_geometry_sft.py), Windows PASS **44409382775**. **Solved-page punctuation control (Agent1, 18 November):** thirteen-dot marks are demonstrably a recurring punctuation class. The same glyph follows solved p56 title `AN END` (5 runes) and clear p57 title `PARABLE` (7 runes), and another terminates p56; across LP2, 24/31 thirteen-dot marks terminate a red span and/or a page. The 16 adjacent red spans have lengths 3–51, so the dot count13 is not the adjacent object's length. Treat the p27 shed-length13 match as conditional evidence that the punctuation count is intended numerically, not as an independently authenticated instruction ([punctuation gate](lp2-red13-punctuation-semantics-gate.md)).

## Historical solve-path context

The p57 text is the 2013 `761.mp3` "Instar Emergence" parable. In the documented 2013 puzzle, that audio participates in an exact offset-zero bytewise XOR reconstruction: `twitter.bin XOR 761.mp3 -> gematria.jpg`, after which OutGuess exposes a Cicada-signed message. Historical source: [neuroretransmit 2013 Twitter reconstruction](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/README.md).

Director #1650 tightens the relevance of that precedent. The p27 INSTAR relation is a **scalar checksum identification**: the 12-rune middle word has prime sum710 and `phi(710)=280`, equal to the GP-prime sum of INSTAR. It does not literally recover the six INSTAR runes or supply a GP29-to-byte serialization, equal-length LP2 byte operand, MP3 offset/clock, or target. The historical XOR opcode is validated by the recovered JPEG, while the surviving archive presents it as solver reconstruction rather than a signed command. One exact LP2 receiver has already been tested without alignment search: original p27 `44.jpg` and p55 `72.jpg` were XORed byte-for-byte from offset zero with preserved `761.mp3`; both outputs remained near-max-entropy binary data with no recognized payload. The direct Instar→XOR bridge is therefore closed until a first-party LP2 byte contract appears ([#1650 source gate](lp2-p27-instar-2013-xor-source-gate.md); [historical contract](../resources/external/2013-instar-xor-source.md)).

## GP0 handoff pair now enters the DIVINITY carrier

The later replicated signed-2016 GP0→p50 byte grammar now supplies the missing continuation from the independently selected `DJU / BEI` pair. The two source words map as `35→39` and `45→107`; those bytes land on the last rune of two separate three-rune p27 words. Their GP0 sums are40 and55, and both map to byte **80**. Offset80 is exactly the first rune after one circumference is shed from the 12-rune body word beginning79 whose twice-shed interior is the manuscript-unique **DIVINITY=376** object below.

Among all 51 adjacent p27 pairs, only two produce a second-step convergence; the other is already a same-byte collision at the first step. DJU / BEI is therefore the unique **distinct-branch** convergence under the frozen operator. This makes the route causal from the p55 handoff into the DIVINITY/3301 parser rather than leaving the pair as a terminal landmark. [Source-exact report](lp2-p27-dju-bei-gp0-divinity-convergence.md) · [Windows PASS 44417202214](https://github.com/FlareZ123/liber-primus/actions/runs/44417202214).

## Terminal-prime serializer candidate

The selected eight-rune \`DIVINITY\` interior now yields a typed historical value without applying another generic cipher.

Its GP-index sum is **103**, and original p50 cell103 is the literal token **\`3Q\`**. The red13/DH circuit independently reconstructs the server private exponent **6** from \(19-13\). The **sixth rune** of \`NSOOCAEY\` has GP index **24**. In the documented 2013 server's BASE29 alphabet, digit24 is **\`O\`**.

Therefore the source-derived serialization is:

\[
T[103]\;||\;\mathrm{BASE29digit}(24)=\texttt{3Q}||\texttt{O}=\texttt{3QO}.
\]

The documented 2013 server protocol gives the explicit example **\`BASE29 3301 -> 3QO\`**, so this reconstructs the terminal Cicada prime **3301**.

A widened manuscript control keeps the same serializer and scans every contiguous eight-rune window inside all 2,896 complete p0-p55 words. There are **731** such windows. \`NSOOCAEY\` is the **only** one that serializes to \`3QO\`.

This is still a post-discovery construction because combining a p50 two-character token with one BASE29 digit was discovered from the selected object. Its strength is the convergence of independently fixed ingredients: the manuscript-unique DIVINITY interior, p50 address103, the DH-derived secret6, and an exact historical protocol output.

The concurrent p27/DH \`EMERGE\` circuit independently routes the table walk to the p55/p56 page pair. That creates an obvious receiver test: apply the authenticated p56 prime/totient cipher to p55 beginning at recovered prime3301. In the p56 clock, prime3301 is zero-based prime index463. The exact F-transparent inverse becomes impossible after **11/76** p55 runes. Using historical pause prime1033, index173, fails after **59/76**. Thus neither 3301 nor 1033 is a direct p56 clock for p55 under the solved forward orientation.

## The 3301 branch now closes back through p0 THE / WAY

After `3QO=3301`, `3301 mod256=229` selects p50 token `00` / byte0. A later independent holdout strengthens p0 as its receiver: authenticated source-order **THE / WAY** bridges through original p0 and exits at80, exactly the endpoint already fixed by the p27 DJU/BEI convergence. Across 56 unknown pages × 42 signed adjacencies, this is the only source-order chain ending at80; p25's first-hop rival exits at65. The parser therefore participates in `DIVINITY→3301→p0→THE/WAY→80→DIVINITY carrier`. [Cycle](lp2-p0-the-way-p27-80-navigation-cycle.md) · [PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44418189200).

## Receiver gates already closed

Several obvious receivers were tested and rejected:

- the once-shed 13-rune survivor as a repeating GP29 key on p27 and p55;
- the twice-shed red-heading eight-rune core as a repeating GP29 key;
- the newly found `NSOOCAEY` DIVINITY-sum interior as a phase-zero transparent-F key: it dies after 68 runes on the forward p27 receiver and after 9 runes on p55;
- the known solved \`DIVINITY\` key under all eight cyclic phases with WELCOME-style F interrupter freedom on p27; every p27 phase fails algebraically;
- direct p56 prime/totient interpretation of the eight-rune core as \`DIVINITY\`;
- p56 clocks seeded by the historical Instar numbers and line sums; survival is common and the selected outputs are low-IoC nonprose;
- reversed Gematria on the fixed nested heading objects; it supplies none of the missing parable words.

These exclusions prevent the strong p27 parser from becoming a license for unconstrained cipher search.

## Decision

The p55 -> p27 handoff now has a coherent structural relation to the clear p57 parable. The exact handoff line uniquely supplies the checksum pair **MUST=186 / WE=86**. The later p11 **THEIR NUMBERS ARE THE DIRECTION** bridge resolves the former #1653 ordering gate, placing the fixed p27 values in increasing order as **WE MUST SHED**. Nested heading words uniquely supply **LICE THE INSTAR** and **TO THE**; literal circumference shedding matches the 13-dot mark; the body contains a manuscript-unique **DIVINITY** interior selected by the same operation; the remaining structure closes on **WITHIN**, **AND=215**, and the upstream **EMERGE=300** boundary.

The selected `NSOOCAEY` object now reconstructs terminal prime **3301** through p50, DH secret6 and the historical BASE29 protocol. The p27/DH `EMERGE` circuit also routes to p55/p56. A direct p56 clock beginning at prime3301 is algebraically excluded on p55, so the next useful work is to determine what 3301 selects **before** the p55/p56 receiver, or whether the page-pair route defines a different authenticated data operation. Keep this in `im-results/` until the circuit recovers unknown plaintext, an authentic key application, or another independently verifiable destination.

Reproduce the source arithmetic and manuscript-wide controls with [the SFT](../sims/lp2_p27_redheading_we_must_shed_sft.cjs).
