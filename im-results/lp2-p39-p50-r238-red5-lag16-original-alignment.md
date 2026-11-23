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

### Degree-238 finite-field inverse, original p39 (Agent8, 23 November)

The irreducible monic p50 quotient **R238** defines a finite field `GF(29)[X]/(R238)` of dimension 238, matching the source-proposed outer-shed p39 body. The visible p39 red polynomial `G(X)=27+5X+15X²` and the independent p15 unsigned 16-cell spiral polynomial `A15(X)` are field units. Field division uses modular polynomial inversion, a different operation from the previously tested polynomial long division in GF29[X]. The original-source first-stage unit family was frozen at **G, G⁻¹, A15, A15⁻¹, A15/G, G/A15, G·A15, (G·A15)⁻¹**, each in two original coefficient directions.

All **16 original p39 238-rune full-register inverse/readout candidates** remain nonprose with IoC **0.03283–0.03641**; maximum **0.0364145658** for A15/G in high-degree order, below the author's genuine p57 solved passage's IoC **0.06271**. Both original field inverses satisfy product=1 modulo R238. A 238-rune source-native solved-p57 positive plant multiplied by G recovers all 238 runes using G⁻¹, with exact forward replay. The G⁻¹ high-degree readout contains an isolated `CREATE` Latin transliteration, arising from the six original-GP rune values `[5,4,28,16,12,18]` transcribed as `C|R|EA|T|EO|E`; it crosses source word boundaries and produces no native connected plaintext. It is a short incidental substring.

This bounded source-defined field consumer supplies no authentic unknown plaintext or key. The physical source still lacks an instruction selecting finite-field multiplication, a 22-position interpolation/erasure schedule, or the rule decoding its other 200 unmatched positions. Do not try free field powers or fitted masks as a rescue. The same [original-source Node22 SFT](../sims/lp2_p39_p50_r238_red5_lag16_sft.cjs) reproduces all original outputs and a positive solved-native plant.


### No-fitted-key 16-phase invariants against native solved manuscript (Agent8, 23 November)

Under a hidden period-16 additive key, or even **16 entirely secret independent GP29 permutations**, equality between two symbols in the same phase column is preserved. This lets the p15-selected 16-phase receiver be tested without guessing any of its possible keys. The exact original p39 residual `C-5Q` on the previously fixed 238-rune page-outer interior has **22 equal adjacent lag-16 pairs**, alongside only **75 equal pairs among all 1,652 within-phase pairs**. A phase-local secret alphabet cannot change either number. Source-native controls from the nine original solved LP1/LP2 sections, read as consecutive 238-rune windows **within** each section, give **1,421 overlapping controls**: no solved-native window has more than **20** adjacent lag-16 equalities, and only **15/1,421** have 75 or fewer all-phase collisions. None jointly reproduces the original (75,22) fingerprint. The control’s same-phase count ranges down to 73, so no absolute impossibility is claimed.

A p15-defined shift was artificially applied to a genuine solved-native 238-rune passage, and the invariants were retained exactly, validating that this is an **all-secret necessary condition** for the fixed-phase model. These 1,421 overlapping windows are correlated, cover a limited author corpus and do not provide a familywise p-value. They disfavor reading the residual directly as ordinary native solved-style GP29 prose after any single fixed 16-phase permutation, supplementing the previously rejected 256 source-numbered key candidates. They leave per-position changing keys, altered separators, other languages, and an independently selected different receiver open. The [same exact-source SFT](../sims/lp2_p39_p50_r238_red5_lag16_sft.cjs) reproduces the original and planted results.


### Unrestricted unknown period-16 additive key: original plaintext-directed attack (Agent8, 23 November)

A second and more direct plaintext recovery attempt asks whether the source-identified lag16 residual `R_i=C_i−5Q_i mod29` is an ordinary 16-position Vigenère-style ciphertext with a **completely unknown** 16-digit GP29 key. This is a full-register original-cipher attack that allows **all 29¹⁶** possible secrets in its search space rather than only the 256 source-numbered keys; the 16 is motivated by the printed p15 grid and the observed p39/p50 lag16 recurrence. No key is claimed to have been supplied by the creator. All operations remain fixed on the original 238-rune first/last-trimmed p39, without fitting the 22 matching positions.

A dedicated deterministic native-GP quadrigram search, trained on **218,800** conservatively transliterated GP indices of the project's Shakespeare source and **2,044** original solved GP-rune indices (with a completely independent solved `LOSS OF DIVINITY` section excluded), optimizes the **16 secret additive phases** across **130 independent annealing restarts ×4,400** proposals. It first encrypts a genuine **238-rune held-out Cicada `LOSS OF DIVINITY`** passage with a separately chosen 16-digit key `K_i=(11+7i) mod29`. The same frozen solver exactly recovers all **16/16 secret key digits** and **238/238 native plaintext runes** from that planted ciphertext. The method is demonstrably capable of decrypting a same-size English passage behind a secret16-period additive pad.

On the **actual original p39 residual**, the best search raises native GP quadrigram log score from **−824.4024** to only **−768.4163**. Forty-four authentic solved-native 238-rune donor windows, evaluated by the same independent scorer, range **−547.5375 to −256.0600**, and the withheld planted native passage scores **−528.3589**. The optimized original still has no connected plaintext, with isolated short English-looking substrings amidst runic noise. The original is more than **220 log-score units below even the weakest of those donors**. This is a bounded, source-registered **negative for ordinary period16 GP29 additive decryption on this exact residual**, not a proof against a secret16 nonlinear alphabet, alternative language, a source-unselected registration or changed-state cipher. It does rule out attributing failure solely to the absence of a known 16-digit key in a vulnerable known-language model. Reproduction: [standalone Windows-compatible original and planted CJS SFT](../sims/lp2_p39_p50_r238_lag16_ukey_anneal_sft.cjs).


### Solved-p56-style literal-F masks and key-free phase-16 capacity (Agent8, 23 November)

The **authentic solved p56 decoder** allows selective ciphertext GP-F (index0) runes to pass literally as plaintext F and **not consume a keystream element**: among its five original ciphertext F locations, only the fourth is literal in the verified prime-totient solution. This prompted a *separate bounded p39 model* based on real source semantics: retain the 238-rune original p39 outer-trim receiver `C`, original p50 high-degree R238 quotient `Q` and source p39 red multiplier5. Treat any subset of the **four actual original p39 ciphertext F locations [42, 48, 153, 213]** as literal zero-output, no-key-advance. Every remaining site has plaintext `P_i=C_i−5Q_i−K_{t mod16} (mod29)` for a completely unspecified 16-symbol GP29 key `K`, with `t` advancing only at ordinary sites.

The **exact source-glyph F-mask family contains 16 masks**. For a frozen mask, equality between any two ordinary sites sharing one key phase is invariant under **every one of the 29¹⁶ possible keys**. Applying this to all 1,421 consecutive **238-rune windows from nine authentically solved GP29 sections** gives original same-phase collision totals by mask0–15:
`[75,79,76,70,72,69,64,65,64,70,67,61,71,68,63,65]`.
The native donor windows with collision total *at most the original under that identical clock* number:
`[15,69,28,3,0,6,0,0,0,3,2,0,0,7,0,0]`.
A donor must **also** have a plaintext GP-F at every position declared literal. After that independent necessary condition, matching donor counts are:
`[15,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`.
Thus only **mask0 (no literal Fs) and mask1 (p39 local position42 literal)** have any solved-native examples surviving both necessary conditions; the other fourteen mask conventions, including the p56-style fourth-F selection **mask8**, are absent in this finite native sample. This is an *all-secret* gate: none of those 14 masks can be repaired by fitting a different hidden period16 additive key against any listed native control window. A complete source-native encrypt/decrypt plant passes exact 238/238 on all 16 masks.

A distinct *nonzero28-symbol alternative*, where all original F glyphs are universally literal and `G=5Q` and the secret 16-position additive key act in `Z/28Z` on symbols1–28 with a non-F clock, does likewise **16/16 planted secret-key recovery and 238/238 plaintext recovery**. Its best unchanged-original decoder remains nonprose at native quadrigram log-score **−762.34517**, versus the solved-native donor range **−547.53749 to −256.06004** and genuine planted **−528.35887**. Its original decoder round-trips exactly. This model is a *hypothetical*, stronger universal-F convention; it does **not** assert that solved p56 really uses modulo28 or treats all its ciphertext Fs as literal, since the authentic p56 method selectively skips only one of five Fs.


**Surviving first-F mask1 fully secret key attack:** The only *new* nonempty p56-style F-skip mask with any joint native control candidate, original p39 position42, was subjected to the complete unknown-key GP29 quadrigram attack, with the key phase counter advancing only at ordinary sites and source coefficient Q still indexed to its actual physical rune. A **genuine 238-rune solved native passage** from `LOSS OF DIVINITY`, starting at its internal rune offset428, happens to contain GP-F at local position42. Encrypting it with a separately chosen 16-digit secret key, red multiplier5 and the exact published Q, then decrypting through the proposed literal-F mask, yields **16/16 key digits and 238/238 genuine plaintext runes** without giving the key to the solver. The authentic p39 original attains best GP quadrigram log-score **−767.15667** (initial **−824.40238**) against independent solved-native scores as high as **−256.06004** and at lowest **−547.53749**. The output remains nonprose and exact original-cipher forward replay succeeds. [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45289462827) and [original-data source code](../sims/lp2_p39_p50_r238_lag16_mask1_secret16_sft.cjs). Both mask0 and mask1 now have full secret16 language-directed negative, with the remaining14 masks independently limited by the fixed-native necessary conditions. This bounds this cipher family without requiring a source-unknown 16-digit key.

**Decision:** Source-typed F skipping has now been examined without assuming a known 16-digit key, through exact native collision invariants and a separate fully secret 28-symbol plaintext-directed inverse. No original p39 plaintext, true F mask, cipher key or source-chosen full-register operator has emerged. Fourteen F-mask families have a finite ordinary solved-native donor obstruction; two residual masks remain conditional and their direct keyless invariants alone do not prove plaintext impossible. Fully reproducible [all-16-mask Windows CJS](../sims/lp2_p39_p50_lag16_fmask_allsecret_native_sft.cjs) and [complete 28-alphabet unknown-key annealer](../sims/lp2_p39_p50_r238_lag16_ukey_ftransparent_sft.cjs) retain the exact original bytes and native plants.


### Complete GF(29²³⁸) Frobenius-orbit inverse on original p39 (Agent8, 23 November)

A distinct *nonlinear* complete-register route uses only the same independently printed irreducible p50 **R238**, 238 source coefficients from the original p39 exterior and p39's central red value **5** as a candidate extension-field Frobenius exponent. If p39 were generated by the reversible field automorphism `x ↦ x^(29^k) mod R238`, its inverse would be `x ↦ x^(29^(238−k))`, without any secret 238-rune pad. The source alone does not instruct exponentiation or identify k, so the exact test **exhausts all 238 possible Frobenius exponents** in both untouched p39 coefficient directions. Every one of the **476 original full-register candidates** remains statistically random at native-GP29 scale: the maximum IoC in printed order is **0.03779740** at exponent11; in reversed coefficient order **0.03850654** at exponent160. Neither reaches **0.05**, let alone the genuine native solved-passages' IoC around **0.06**; no original decrypted prose appears. A 238-rune genuinely solved `LOSS OF DIVINITY` GP29 passage planted with source-red exponent5 and inverted with exponent233 recovers **all 238/238 original runes** exactly, with source-native IoC **0.06424848** and encrypted IoC **0.03410985**. This strictly excludes a single finite-field Frobenius automorphism on the source-selected exterior-shed p39 body as the plaintext-recovery mechanism; it leaves composed cryptography or another receiver untouched. [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45290562259), [complete source-typed SFT](../sims/lp2_p39_p50_all238_frobenius_fullinverse_sft.cjs).


### Red rune *prime values* as source-authentic field coefficients (Agent8, 23 November)

The three p39 red GP runes have two natural numerical interpretations. The original ordinal coefficients tested above are **[27, 5, 15]**. Under the *other literal first-party Gematria Primus mapping*, their exact printed prime weights are **[107, 13, 53]**, reducing to **[20, 13, 24] modulo29**. This is a genuinely different source-defined **degree-two finite-field unit**, invertible modulo the authentic monic p50 R238. A complete original 238-rune p39 inverse was tested for this prime-valued red unit, its modular inverse, its product with the source p15 16-cell spiral polynomial and the corresponding product inverse, each in both original and reverse coefficient orders. All **8** source-typed candidates have IoC **0.03304613–0.03641457** and nonprose GP transliteration. Both field-unit inverses recover the original native 238-rune planted plaintext exactly; actual ciphertext remains unreadable. The result excludes the direct *printed-prime rather than alphabet-index* coefficient interpretation from this bounded single-field-product family, without claiming that the artists instructed field arithmetic or that the p39 registered receiver is authenticated. [Exact original-source CJS](../sims/lp2_p39_p50_r238_red5_lag16_sft.cjs), [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45290769936).


### Keyless multiplicative field reciprocals on p39 (Agent8, 23 November)

A final bounded reversible GF29^238 consumer tests **field inversion of the original 238-rune p39 register itself**, instead of only multiplying by a named field unit. In the original p50 R238 field, `1/C` is an exact source-key-free involution for nonzero registers; `G/C` with the original p39 red **ordinal** coefficients [27,5,15], and `Gprime/C` with the equally literal **prime-value** coefficients [20,13,24], are two further complete reversible named-unit outputs. All three were evaluated in both original register orientations with the first and last physical p39 rune removed. Across these **six actual original full-register candidates**, IoC is **0.03350707–0.03460625**, no original passage is readable and the source-native 238-rune plaintext control survives exact field reciprocal inversion twice. The test specifically eliminates a direct p39 reciprocal and the two source-red coefficient-scaled reciprocals; arbitrary field expressions require new clues. [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45291134644); [same exact original-data CJS](../sims/lp2_p39_p50_r238_red5_lag16_sft.cjs).

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
