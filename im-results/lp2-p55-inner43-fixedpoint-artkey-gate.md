# LP2 p55 word-interior polynomial: fixed-point artwork anchors and a failed historical inverse

**Status (Agent 20, 14 November 2026): exact original-source arithmetic, independently dated illustration relationships, and two bounded direct original-input decoder negatives. No authenticated plaintext, unknown-page key, author-specified polynomial instruction, or continuation destination has been recovered.** The fixed-point graph and its two source-page/artwork numerals extend the [previously documented p55 43-interior polynomial orbit](p55-inner43-base29-polynomial-bridge.md); the already-known \(24\to18\to23\to4\to6\to19\to22\) orbit and the p5/p55 and p22/LP1 illustration matches are not newly discovered.

## Causal hypothesis and original source

The only solved LP2 page that explicitly mentions a geometric operation is physical p57, which says, “WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.” Physical p55 has 76 original GP29 runes, the final ciphertext before the 85-rune solved p56. Its visible word segments (including a one-rune carry from p54) have lengths

\`[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]\`.

Removing the first and last *rune* of every page-local printed word leaves **43 exact source runes**. This literal source operation was already proposed in the earlier p55 polynomial bridge. Read those 43 GP index values in source order as **ascending** polynomial coefficients over GF(29). The source neither names this polynomial interpretation nor selects ascending exponents. The signed 2013 BASE29 example 3301→3QO actually defines an ordinary **descending** positional numeral, so the orientation remains a conditional research choice.

A new test evaluates the complete function \(f:\mathbb F_{29}\to\mathbb F_{29}\), \(f(x)=\sum_{i=0}^{42}a_ix^i\bmod29\), rather than observing just the previously recorded orbit from 24.

## Exact original polynomial graph

The 43 ascending GP29 index coefficients are

\`[19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18]\`.

The **entire** 29-input function, in argument order x=0..28, is

\`[19,25,6,25,6,5,19,18,11,10,15,14,25,25,3,6,20,5,23,22,26,10,22,4,18,0,24,18,1]\`.

Its only fixed points are **5** and **22**. No cycles of any other length occur. Exactly **two of the 29 inputs, 5 and17, converge to 5**. The other **27 inputs converge to 22**. In particular, the previously observed cross-round square-residue chain belongs to the larger basin:

\`3301 mod29=24 → 18=1033 mod29 → 23 → 4 → 6 → 19 → 22 → 22\`.

The new fixed-point pair gives an exact polynomial factorization:

\[
f(x)-x=(x-5)(x-22)Q(x)\quad\bmod29
\]
\[
(x-5)(x-22)=x^2+2x+23\pmod{29}.
\]

The scalar **23** in the factor also equals the original p57 *terminal 23-dot punctuation* count, and the signed 2013 DH protocol's worked prime23. This is a retrospective coincidence, not an authenticated algebraic instruction. The complete **41-index** quotient is

\`[21,20,13,26,7,16,2,9,15,25,11,3,15,28,28,9,2,0,28,1,21,24,27,23,10,1,0,2,28,28,2,14,17,6,19,7,17,7,18,4,18]\`.

These factor equations reconstruct all 43 coefficients exactly from the quotient, without fitting any ciphertext language model.

### Artwork anchors: independent source observations, retrospective joint selection

The two numerals 5 and22 happen to coincide with two independently recorded manuscript-to-manuscript image-reuse relationships:

- Solved **LP1 physical p05** contains the original moth and prime/totient injunction. **LP2 p55** reproduces the same moth; original **p53 also reproduces it**, so it does not uniquely point at p55.
- **LP2 physical p22** mirrors the reclining figure used on solved **LP1 pp14–16**.

The original pixel registration and ambiguity are documented in [the pre-existing cross-release artwork study](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md). Neither original page explicitly states “evaluate a word-interior polynomial and use its fixed points as page addresses.” This candidate therefore proposes a **possible address to source-known illustrations**. It does not establish that the creator engineered either fixed point, nor does it select a key or actual plaintext decoder.

## Concrete inverse attempted, and its decision

To test a source-relevant operation with no adjustable phase, divide \(f(x)-x\) by the exact quadratic \(x^2+2x+23\), and treat the **41 GP29 quotient residues** as a stream. The direct source-runic transliteration is

\`NGLPYWTTHNSAEJOSEAEANTHFEAUNGAIADIUFTHEAEATHXBGMWBWERE\`.

A plausible historically available *single* direct consumer of this data is the **known solved p56 prime-totient cipher**, since p5's source illustration points to the prime/totient text. Invert it on the 41 original quotient residues with zero-based first-prime clock and subtraction \`P_i=C_i−φ(prime_i) mod29\`. Where a ciphertext rune is F, permit either the exact historical plaintext-F transparent bypass (without advancing the clock) or a shifted reading; forbid a nontransparent output F. There are precisely two F sites, so the complete **four-mask space** is tiny and independent of any English scoring.

The three legal inverses are:

| F-bypass mask | 41-rune GP IoC | Direct output transliteration |
| --- | ---: | --- |
| 1 | 0.04390244 | \`LENLYRSLOEYIAERSJSTHFYOENIWEANNGTTNWGROSYREOAEUEOL\` |
| 2 | 0.04512195 | \`LENLYRSLOEYIAERSJSTHIALEWROOEUBFTNWGROSYREOAEUEOL\` |
| 3 | 0.04146341 | \`LENLYRSLOEYIAERSJSTHFYOENIWEANNGFEPNIEWNGEAXXTHWTY\` |

**No direct candidate is readable GP-native English and none recovers original p55 plaintext.** The exact solved p57 first-41-rune plaintext is independently encrypted and completely recovered by the same literal-F prime-totient inverse, confirming the tested historical operation works when its stated assumptions are met. The direct test excludes *only* the fixed quadratic quotient followed immediately by solved p56's cipher; it does not exclude other source-selected operations or the algebraic roots as a later navigation clue.


### Two artwork-linked historical operators: complete order test

The **5** art page (solved LP1 p05) explicitly says the totient function is sacred. The **22** art page (LP2 p22) mirrors the figure from *solved* LP1 pp14–16, whose authenticated decryption used the specific 13-rune Vigenère key **FIRFUMFERENFE**. This provides one more sharply bounded, independent source-inspired consumer for the **same exact 41-rune polynomial quotient**: apply the historical p56 prime-totient decoder and historical LP1 p14 Vigenère decoder **once each**, using their **unchanged zero-phase keys**, in either of the two complete operator orders. No arbitrary shift, key variation, phase adjustment, source-page characters, hidden alphabet or plaintext-selected filter is fitted.

Both operations use the historically documented plaintext F-transparent rule: an original ciphertext F can be a literal F that does not advance that layer's clock, or an encrypted non-F; ordinary non-F decoded F is disallowed. The exhaustive branch trees across the two layers contain only **three valid complete ciphertext decodings**:

| Actual inverse order | Valid outputs | GP29 IoC | Complete output transliterations |
| --- | ---: | --- | --- |
| Totient → FIRFUMFERENFE | 2 | **0.02804878, 0.03292683** | \`LHCLAEXSTHEHUAESSUJTHEAWOELGEMNOFEOCIBBNGIIAEOEWIAY\`; \`LHCLAEXSTHEHUAESSUJTHEAWOELGEMNOTGCWCXOYOESOAEEOEOI\` |
| FIRFUMFERENFE → Totient | 1 | **0.03536585** | \`LHCLAEXSTHEHUAESSUJTHIAMEAWSEARNGBAEEOYEANGEAWPIAIABIYBX\` |

All three outputs forward-encrypt **41/41** exact source quotient runes, and every operator order completely recovers independently encrypted **41/41 solved p57 GP-native control runes**. The first 41 native p57 GP runes have **IoC 0.05609756**. None of the proposed outputs is intelligible natural GP plaintext and all three have IoC below **0.036**. This is a more directly motivated two-artwork-key consumption than choosing arbitrary keys, but it remains a conjectural two-layer cipher, and the tested key output is a *polynomial quotient*, itself only conditionally selected.

**Decision:** The rooted-artwork double operation does **not** recover original unknown p55 text or an intermediate native-GP key in either order. Retire this complete fixed-key, fixed-clock, literal-F-transparent two-operation family. If an original clue points to a *different* actual intermediate, it must specify the operand and rule independently.

[Standalone original source and positive-plant SFT](../sims/lp2_p55_fixedroot_two_historical_keys_sft.cjs), passed [Windows Node22 read-only Actions run 43652029146](https://github.com/FlareZ123/liber-primus/actions/runs/43652029146).

## Discriminating controls and selection caveats

- Full **76-rune** original p55 polynomial (rather than word interiors) has fixed points **1,24**; reversed 43 interiors have only **20**. The other moth-bearing original **p53** strict-interior polynomial has only fixed point **7**. Thus the exact claimed pair requires this order and strict word-interior extraction.
- Among all **57 rune-bearing physical pages p0–p57**, only **p34 and p55** have a two-singleton-cycle graph with basins of sizes 2 and27 under this same word-interior ascending-polynomial operation. The specific anchored fixed-point pair [5,22] appears on **p55 only**.
- For an ideal uniformly random function on 29 nodes, the **predeclared shape alone**, without page or fixedpoint selection, has probability \((29\cdot28\cdot27^{26})/29^{29}\approx0.00519364\) by rooted-tree enumeration.
- To preserve the actual **43-rune multiset**, a separately executed source-fixed **100,000-permutation** Fisher–Yates null (seed \`0x20261114\`, xorshift32) found **492** graphs with any two singleton fixed points and 27/2 basins, **50** with the specific fixed points 5 and22, and **zero** simultaneously with those fixed points and 27 states flowing to 22. Zero in this fixed family is a finite sample observation, not a proof of impossibility or a genome-wide significance figure.
- Crucially, this is **not a preregistered detection test**. A researcher selected the original p55, its interior extraction, exponent orientation, fixed-point summary and illustration-page interpretation while investigating earlier p55 arithmetic. The counts cannot be converted into a valid significance probability for historical authorial intent. Many prior page/field/word transforms are available to the research population.

## Decision and next step

The exact new information is **a factorized 43-rune source polynomial with the sole 5/22 attractors, 27/2 basin split and a 41-symbol quotient**. Those facts provide a small, checkable address hypothesis to two already established art-linked pages. Direct transfer of the historically solved prime-totient operation, alone or composed once in either order with the art-linked original FIRFUMFERENFE key, has failed. **Do not issue unconstrained page5/page22 substitution, key, phase or field-generator sweeps** just to force the quotient to resemble plaintext. The useful next prerequisite is an original-author clue selecting whether the fixed points represent *page numbers*, *GP rune values*, *field elements* or *nothing*, and what to read from those indicated sources; a convincing independent answer would define one decoder that recovers at least 40 actual original unknown-runic plaintext symbols and forward-encrypts them without tuned exceptions.

**Reproduction.** Node.js22 CommonJS, no dependencies: \`node sims/lp2_p55_inner43_fixedpoint_artkey_sft.cjs\`. Uses original repository \`resources/liber-primus/{lp2-corpus.json,lp2-transcription.txt,lp2-ink-annotations.json}\`. The **Windows** \`manual-readonly-commonjs-sft.yml\` execution [run 43651173240](https://github.com/FlareZ123/liber-primus/actions/runs/43651173240) succeeded, reproducing all exact source values, all 100,000 seeded permutations and the native p57 positive plant. Source: [reproduction program](../sims/lp2_p55_inner43_fixedpoint_artkey_sft.cjs) · [earlier p55 polynomial bridge](p55-inner43-base29-polynomial-bridge.md) · [illustration-source registration](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md).
