# LP2 p15/p39/p50 shared 3301 root, cubic source jet and localized lag-16 alignment

**Agent3, 23 November 2026. Evidence class: provisional original-cipher cross-artifact alignment.** Two mathematical cross-artifact relationships are pinned in the original LP2 sources: a common 3301 residue root with a cubic polynomial congruence, and a 22/222 modular first-difference coincidence localized to p39's interior within the entire 12,956-rune unknown text. It does **not** yield an authenticated plaintext, key, reversible decoder or continuation. The original-source [single-file Node22 reproducer](../sims/lp2_p39_p50_r238_red5_lag16_sft.cjs) includes complete positive plants and exact original constraints.

## Source-visible proposed solve path

The relevant manuscript objects are independently printed:

- Physical p15 has a red-3299-centered **16-number Fibonacci-prime spiral** in a 4×4 layout. It provides a human-visible candidate length/clock 16.
- Physical p39 has **240 runes**, including the red triad **[27,5,15]** at zero-based rune offsets119–121. The middle red rune's GP index is **5**. Treating the red triad as **ascending polynomial coefficients** gives exactly **27 + 5X + 15X² = 15(X + 5)² (mod29)**, independently selecting the doubled linear factor inside p50's F16. The later use of that coefficient 5 as an affine multiplier is an additional hypothesis. A literal application of the clear p57 instruction to shed circumferences removes its first and last runes, retaining a contiguous **238-rune** interior. This is a conditional reading of a metaphor.
- The original p50 numerical table has **256 base-60 byte values**. Interpreting them in printed row-major high-degree-first order over GF(29), the first value203 is0 modulo29; scaling the remaining degree254 polynomial by −1 yields a monic polynomial. Its documented exact factorization is **F16 · R238**, with the monic degree16 small-factor product F16 and the remaining irreducible degree238 factor R238. Exact polynomial division leaves remainder0.

Because the full table is printed highest-power coefficient first, the proposed source-normal reading of the **238 nonleading coefficients** of R238 is descending degree. Call that array Q[0..237], and the stripped p39 rune sequence C[0..237]. Both have exactly 238 GP29 symbols. A straightforward proposed equation is

    K[i] = (C[i] - 5*Q[i]) mod29

with a **source-length-16** repeating key, which makes the testable necessary condition

    C[i] - C[i-16] == 5*(Q[i] - Q[i-16])  (mod29)
    for every 16 <= i < 238.

This does not claim the creator instructed multiplication by five or a polynomial-quotient readout. It tests a concrete, fully specified source-operand receiver rather than searching for an unconstrained key.

## A second original-source relationship: the 3301 root and cubic jet

The Cicada identifier itself fixes one field element: **r = 3301 mod29 = 24 = −5**. Its role is visible in three distinct original artifacts:

1. The physically highlighted p39 triad defines **G(X) = 27 + 5X + 15X² = 15(X − r)² (mod29)**. The factor is source-exact.
2. The degree254 p50 polynomial contains that **double factor**. Its quotient **R238** is irreducible over GF29 and therefore has no root at r.
3. The original p15 red-3299-centered **clockwise unsigned** Fibonacci-prime spiral, interpreted as 16 ascending field coefficients,

       A15 = [22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21]

   has **A15(r)=0**. Its only GF29 field root is exactly r and **A15'(r)=9**, so that root is simple. The alternative row-major reading gives value15 at r; restoring two mathematically inferred negative signs before reducing to GP29 gives value2. The identity therefore selects the **printed unsigned spiral orientation** among these physically distinguishable readings, with no fitted key.

More surprising, the exact first four **Taylor coefficients about r**, computed by repeated polynomial division by X−r, are:

| Source polynomial | Constant | Linear | Quadratic | Cubic |
| --- | ---: | ---: | ---: | ---: |
| p15 original unsigned A15(r+t) | 0 | 9 | 0 | 16 |
| p50 irreducible quotient R238(r+t) | 2 | 0 | 19 | 15 |

In GF29, 2 has inverse15, and **15×9 = 19 mod29**. The source therefore satisfies this exact, parameter-free **cubic congruence**:

    R238(X) ≡ 2 + 15*(X-r)*A15(X)  (mod (X-r)^3),  r=3301 mod29.

The constant2 is also the first Fibonacci-indexed prime in the p15 construction. The congruence fails already modulo **(X−r)^4**, because the first unmatched Taylor coefficients are15 versus0. This is a restricted local polynomial equality; it is not a global identity between the manuscript pages.

One executable interpretation is **peel the known source terms** and divide by the cubic root factor:

    E235(X) = [R238(X) - 2 - 15*(X-r)*A15(X)] / (X-r)^3  (mod29).

The division is **exact with zero remainder** and yields236 original-source GF29 coefficients, so the operation is reproducible with no secret or fitted parameter. Both natural coefficient directions are nonprose; its GP29 coefficient IoC is **0.0347998558**, close to a uniform 29-symbol stream and below solved native p57 **0.0627099664**. The SFT plants a genuine solved-native GP29 passage as E235, constructs its source-compatible numerator and extracts **all236 original planted symbols exactly**. Hence the natural direct English readout fails while the mathematics is operational.

**A source-typed 236-symbol recipient was tested, not merely a coefficient readout.** Applying the same p57 circumference instruction a second time to p39 gives **236 original p39 runes** after stripping its outer two runes at each end. This exactly equals the number of E235 coefficients. Use E235 as a field keystream in each natural high-/low-degree order, both additive signs, and either the identity multiplier **1** or physically highlighted red multiplier **5**. The **eight frozen original-cipher inverses** all have IoC below **0.040**; the best is **0.03786512802019473**, using high-degree-first E235, scalar5 and ciphertext minus key. It is unreadable GP transliteration. A source-native p57-planted control roundtrips all **236/236** symbols under the same receiver. This bounded direct original-cipher negative specifically closes the natural E235-to-p39 double-circumference decoder; it cannot refute an independently source-instructed alternative receiver.

**The visually distinct p39 paragraph boundaries were retained in a second 236-rune decoder.** Original p39 transcription contains two printed text blocks of exactly **119 and 121** runes. Removing the first and last rune *within each block*, instead of removing two from each end of the joined page, yields **117+119=236** source runes. Applying the same E235 additive receiver under both source orientations, signs and scalar1/5 produces eight nonprose inverses, best IoC **0.0360980887**. This natural physical-segmentation alternative does not rescue the polynomial peel.

**Direct division by the p39 red quadratic was also tested.** The highlighted coefficient polynomial G(X)=27+5X+15X² has degree2. Interpret all **240 actual p39 runes** as a polynomial, in each physical coefficient direction, and divide by this *exact original red operator* to obtain **238 GF29 quotient coefficients** and two remainder coefficients. Original high-first polynomial reading gives remainder **[26,27]**, the reverse gives **[21,26]**. The 238 quotient coefficients have IoC **0.0347481** and **0.0350672**, respectively, both nonprose. Combining either actual quotient with the source R238 238 nonleading coefficients in either order, with both signs and source multiplier1, highlighted5, or red leading15 gives **24/24 nonprose inverse outputs**, maximum IoC **0.0364500230**. The exact positive control constructs a source-native p57 passage as the desired red-quadratic quotient and recovers all **238/238** runes, preserving the two remainder values. This tests the literal printed red divisor on the full p39 original and does not depend on a guessed alphabet clock or endpoint trim.

**Selection caution.** A hypothetical source using the same Fibonacci-prime positions and varying the center from3200 to3400 admits **three of29** possible center residue classes **9,24,25** at which its own printed unsigned polynomial has that center as root. The p15-to-3301 root equality alone has limited evidentiary strength. The cubic cross-source jet is more specific, but was discovered during exploratory inspection of several factors, directions and operands; it has no validated chance level and no independent authorial instruction selecting Taylor arithmetic. No unknown plaintext, source-selected page cipher, or deep-web preimage follows from this relation.

## Exact original-cipher observations

The necessary lag16 equation holds at **22/222** positions, with matched indices (relative to the 238-rune p39 interior):

    30, 32, 59, 74, 91, 94, 97, 111, 127, 128, 146,
    148, 152, 164, 174, 177, 195, 215, 225, 227, 228, 235

A uniform 29-symbol independent-difference baseline would average **222/29 ≈ 7.66** matches. The full original ciphertext corpus permits direct, assumption-light positional controls without random simulation:

| Fixed 238-rune recipient / coefficient direction | Multiplier | Lag16 matches |
| --- | ---: | ---: |
| **p39 interior offsets1..238, R238 high-degree-first** | **5** | **22/222** |
| p39 offsets0..237 (left endpoint preserved) | 5 | 6/222 |
| p39 offsets2..239 (right endpoint preserved) | 5 | 7/222 |
| Untrimmed 238-rune p36, R238 high-degree-first | 5 | 11/222 |
| p39 interior, R238 low-degree-first | 5 | 7/222 |

Against **every 238-rune window** in the complete 12,956-rune unknown source stream (including windows crossing pages), the exact Q, multiplier5 and lag16 reach22 matches **only** at global window index **9401**, the p39 interior beginning immediately after its first rune. The **12,719** inspected windows have second-best score19. This remains the unique highest score when scanning all29 multipliers at p39's frozen interior: multiplier5 gives22 and the next-best gives12. If all29 multipliers are instead allowed to vary independently for every 238-rune window, **three** windows across the book attain22 (two use other multipliers), showing how greater key freedom dilutes the specificity.

All 238 circular registrations of p39's interior against Q were also compared. The source registration alone attains22 under multiplier5; the others peak at16. These are **descriptive search ranks with strongly overlapping comparisons**, not independently calibrated statistical p-values. The p39 recipient, coefficient orientation, scalar and lag were motivated by original clues but examined within a broader exploratory programme. They therefore carry selection risk.


### Physical red/13-dot selector and word-order null (Agent8, 23 November)

The original physical p39 has **119 black + 3 red + 118 black runes**, and large red thirteen-dot markers after rune counts **119, 122, 240**. This supplies a visual rival to the previously chosen first/last-page-rune trim: remove two glyphs of the red coefficient triad (all three natural pair selections), or remove the runes before/after the two central marker boundaries. All six printed-feature-defined 238-rune selections yield **7/222** lag16 matches against the same source R238 high-degree order and red multiplier5, rather than **22/222** for first/last shedding. If the entire red triad is used only as an operation and removed, the remaining 237 original black runes compared to the quotient after four natural two-coefficient endpoint cuts give **6, 6, 6, 8 matches out of 221**. These original-source receiver choices do not identify the sparse 22 positions or a full reverse cipher.

For an independent null preserving actual printed words, split the original 56 physical-page master transcriptions at hyphens/periods into **2,928 exact page-local word segments**, preserve every rune and every page's segment lengths, and Fisher–Yates shuffle whole segments within each page using deterministic xorshift32 seed `0x3301abcd`. For **240** replicas run the unchanged R238/multiplier5/lag16 scan against all **12,719** book windows. Observed global maxima histogram: **18:4, 19:55, 20:96, 21:57, 22:16, 23:8, 24:3, 25:1**; **28/240 (11.67%)** attain at least the original *global* maximum22. The original p39 *fixed* window is more unusual under this model: shuffled hit counts ranged1–16, with **0/240** reaching22. This difference matters only when p39 and the full operation were selected independently of original ciphertext; retrospective model search invalidates a naive fixed-window significance claim. The test is a finite word-order control rather than a proof of independent ciphertext randomness.

**Decision:** The 22-hit alignment retains source-specific interest, but whole-book-maximality alone is weak selection evidence. Its 200 mismatches cannot be rescued by natural red/marker cuts. No first-party selector for the matched positions, reversible rule for unmatched positions, original plaintext, or authenticated key has been found. The expanded [exact Windows-compatible Node22 SFT](../sims/lp2_p39_p50_r238_red5_lag16_sft.cjs) reproduces the original and null tests. Do not fit a new sparse mask to the published hits.

## The decisive cipher gate

An authentic **strict repeating 16-rune key** would satisfy **222/222** equations, not22. The residual source array K above has only22 lag16 matches. It has **IoC 0.0329752154**, close to uniform GP29 and below the solved p57 native-GP control **0.0627099664**. Its transliteration is nonlinguistic, beginning "IXAAEOEYDRIATHOJFWCNDRWNGMEAEAEWOOENGIOCBDY...". Direct additive inversion has recovered no plausible p39 prose.

A distinct, equally motivated key rule would require K to satisfy the actual F16 order-16 linear recurrence, rather than an ordinary 16-period repeat. Its 222 predicted next symbols match at only **5** original positions. The source-file SFT explicitly plants an artificial F16-recursive key and an artificial 16-periodic key, encrypts the same Q with multiplier5, then recovers every one of the **222** predicted conditions for each respective plant. The original low hit counts cannot be attributed to a broken equation or factorization implementation.

**Source-numbered second-layer test.** A period-16 Vigenère layer could preserve within-column coincidences while concealing native GP29 English. The full original p15 magnitudes in printed row-major order, the red-3299-anchored clockwise spiral in absolute values, the mathematically signed spiral, and the actual F16 factor coefficients are four independently source-derived 16-symbol keys. Removing each one from K under **both signs, both directions and all sixteen circular registrations** supplies exactly **256 two-layer inverses**. Their maximum original p39 rune IoC is **0.0397475446**, obtained by the **F16** candidate at phase6, versus native solved p57 **0.0627099664**. Every one of the 256 outputs is below **0.040** and visibly nonprose. The SFT independently generates a planted p57-native encrypted stream under the original signed p15 spiral, recovers all238 symbols exactly, and checks its native IoC. This rejects the entire frozen source-key candidate set as a natural direct English decoder of this p39 interior.

A still simpler degree238 quotient copy model is incompatible with original p36 and p39: raw GP29 coefficient equality is **14/238** at p36 and **10/238** at p39 interior in printed-degree order. Granting **29 freely chosen, predecessor-independent output mappings** still gives at most **54/238** symbol matches for p36 and **50/238** for p39 interior. The quotient is therefore not a direct static-rune recoding of either page.

## Interpretation and research decision

These are **bounded exploratory structural observations with direct negative original-cipher consumers**. The common-root cubic peel produces a new, exact source-derived 236-coefficient object but no native plaintext. The 22-match spike is unusually localized to a human-motivated original layout. Its strength is insufficient to identify a lawful decipherment or prove a planted relationship, especially after extensive exploration of p50 and p39. One can fabricate many other 16-state or selective-mask models to fit 22 coincidences; doing so now risks numerology.

**Keep the common-root cubic congruence and exact 22-position alignment as conditional leads**, without promoting it to the authoritative results synthesis. Reopen it only if an independently recoverable original instruction or keyed artifact specifies a **selection/erasure rule** that predicts which p39 positions should satisfy the lag16 condition, or an alternative reversible receiver that predicts original plaintext in uninspected positions. An authentic full-text inverse or independent first-party key operand would be decisive. More arbitrary shifts, new multipliers, or fitted sparse masks are not justified by the present observation.

Reproduce with source-only, read-only Windows Node.js 22 script:

    node sims/lp2_p39_p50_r238_red5_lag16_sft.cjs

Inputs: [original numerical table](../resources/liber-primus/lp2-grid-256.json), [canonical rune indices](../resources/liber-primus/lp2-corpus.json). The SFT checks the table's 256-byte SHA-256, original lengths, red p39 triad, full exact factor reconstruction, 12,719-window exhaustive source comparison, all 256 source-key inverse candidates, the unsigned p15 unique-root identity, exact cubic source-jet and 236-coefficient peel, coefficient-copy capacity, local alignment controls and positive plants. The final extended original-source runner, including the physical 119/121 p39 block case and direct red-quadratic division with positive plants, **passed** on Windows Node22: [GitHub Actions run 45275756545](https://github.com/FlareZ123/liber-primus/actions/runs/45275756545). Related prior, distinct tests: [p15/p36 LFSR](p50-degree254-composite-lfsr-p15-p36-gate.md), [p15/p39 LFSR](lp2-p15-p39-trim238-p50-degree254-lfsr-gate.md). Neither tested this quotient-coefficient/lag16 equation.
