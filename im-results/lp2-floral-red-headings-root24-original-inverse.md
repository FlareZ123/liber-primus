# Floral red headings share the p39/table root 24: bounded original inverse

**Agent16, 14 November 2026.** The original red headings on **physical p40** and **physical p54** each form a printed-order polynomial over GF(29) with root **24**. This is an additional exact cross-page relation to the known p29/table double-root-24 structure and p39 red triad. Its interpretation as an intentionally authored checksum remains **unproven**. Two fully specified quotient-as-key inverses, a repeating additive key and a quotient-initialized GF29 feedback recurrence, have been tested on the complete following chapter bodies. Neither recovers unknown plaintext or an authentic key. A separately tested **source-registered +1 heading-length cursor displacement** also fails the original native-English paired-text gate. Later finite tests also exclude simple zero-state Horner ciphertext/plaintext feedback, and all stationary 300-phase secret GP29 bijections on the 3,000-rune first floral body under the tested native-English plaintext register. A direct final-floral 300/299-rune key also fails every exact F-transparent inverse path under twelve bounded source orientations/signs. The separate 3,008=32×94 full-chapter/grid-row equality fails the source-visible block-origin gate: the original table occurs 30 runes into a hypothetical 94-rune block.

## Independent original-source inputs

Canonical rune values: [untouched LP2 corpus](../resources/liber-primus/lp2-corpus.json); exact original red span locations: [ink annotations](../resources/liber-primus/lp2-ink-annotations.json); original printed base60 cells: [grid dataset](../resources/liber-primus/base60-grid.json). For printed GP indices a0,..,an−1, form the **high-first polynomial** H(x) = Σ ai × x^(n−1−i) modulo29. The two original starts of the floral-bordered p40–55 chapters give:

| Red heading | Original GP29 indices | H(24) | H′(24) | Exact quotient by (x−24), high-first coefficients |
| --- | --- | ---: | ---: | --- |
| p40 first 8 red runes, F N M Y G D AE H | [0,9,19,26,6,23,25,8] | **0** | 18 | **[0,9,3,11,9,7,19]** = F N O J N W M |
| p54 first 9 red runes, A M NG D IA TH X I M | [24,19,21,23,27,2,14,10,19] | **0** | 4 | **[24,15,4,3,12,0,14,27]** = A S R O EO F X IA |

Both are **simple roots** because H′(24) is nonzero. Their final original red symbol is uniquely determined by the earlier red indices under a one-symbol GF29 parity-at-24 rule. The first rune of the p40 header is GP F=0, so its nominal degree-seven polynomial has effective degree six; retain the initial quotient zero without rewriting the source.

Across **all 18 original red spans on physical LP2 pp0–57**, these **two** and only these two have H(24)=0 under the same high-first convention, including solved red-heading controls p56 and p57. The p40 and p54 heads are naturally pre-identified by the ornate chapter boundary, rather than selected from arbitrary word windows.

Exhaustively permuting each of the two frozen heading multisets gives **1,440/40,320** p40 permutations and **6,218/181,440** p54 permutations with the same zero. Their independent-product proportion is **0.00122394** under this narrow conditional null. This is **not a discovery-wide probability**, since the root24 focus and mathematical representation were recognized during a large historical search. The p40 rune-sum modulo29 is already zero, so its separate root at x=1 holds under every permutation.

## Why root24 was already relevant and what weakens it

The original printed 256-byte grid polynomial and physical p29's 277-rune coefficient polynomial each have a **double root at x=24** over GF29. These established exact results and the original p39 red triad are documented in [the p29 source quotient report](lp2-p29-g-original-quotient.md) and [complete table factorization](grid-bigint-factor-page53.md). Also, zero-based **table row24 begins with literal 00**, selecting a 64-byte suffix whose direct hash/XOR attempts are negative ([source-fixed test](lp2-p54-row24-grid64-p56-hash-gate.md)).

**Important coefficient-orientation objection:** p39's original red triad is [27,5,15]. It equals 27+5x+15x² = 15(x−24)² in **low-first** order; in the high-first convention used above for p29, the table, p40 and p54 it has a **double root at 23**, rather than 24. The manuscript has supplied no authorial instruction resolving this ambiguity. Do not assert that all five objects prove one creator-designed common polynomial code.

## Source-derived key and complete original-cipher result

The root24 equalities determine exact seven- and eight-rune quotients of p40 and p54 without fitting. As a cheap fully reversible candidate, use each quotient as a phase-zero cyclic GP29 additive key on its following entire chapter body, trying both direct signs. Do not modify original red symbols or word boundaries.

| Original chapter body | Runes | Original IoC | Subtract quotient IoC | Add quotient IoC |
| --- | ---: | ---: | ---: | ---: |
| p40–p53 after its 8-red heading | **3000** | 0.034544403690 | **0.034471935089** | **0.034371901745** |
| p54–p55 after its 9-red heading | **299** | 0.033489708424 | **0.034903818096** | **0.036048573545** |

All four decode attempts remain close to uniform 29-symbol ciphertext (uniform IoC 0.034482758621), with **no sustained readable GP text**. Each re-encodes the original ciphertext exactly and all four positive plants using solved p57 native GP29 recover every original plant rune (3000 or 299). These are implementation controls, not evidence for authentic key material.

### Independent paired-floral shared-pad inverse (Agent11, 16 November)

The only two red headings whose original GP29 polynomials vanish at x=24 govern original floral chapters p40–53 (**3,008 total runes, including eight heading runes**) and p54–55 (**308 runes, including nine heading runes**). A concrete cipher consequence of a reused source-derived **additive key** would be `C40[i]=P40[i]+K[i]`, `C54[i]=P54[i]+K[i]` modulo29: **the unknown key cancels identically** in `C40[i]−C54[i]=P40[i]−P54[i]`. This can be tested directly on untouched original ciphertext without attempting to fit any secret key. The **two source-defined alignments** are the 308-rune title-to-title clock and the 299-rune black-body-to-black-body restart (skip the eight/nine original red initials).

Train only the source-calibrated native-GP unigram frequencies of a separate Shakespeare corpus (**217,106 GP runes**). For independent natural plaintexts, the correct *key-free* difference distribution is `q[d]=Σ_i f[i]f[(i−d) mod29]`, and the log-evidence relative to uniform GP differences is `Σ_j log(29q[Δ_j])`. On authentic source runes, title-to-title gives **12 equal symbols out of 308**, and log-evidence **−5.00723**; black-body alignment gives **9/299**, log-evidence **−8.23159**. **Three hundred** independently positioned cross-corpus native GP plaintext pairs from withheld Gibran and Emerson, at each exact original rune length, yield **minima −3.02905** and **−4.01217**, medians **+7.25060** and **+6.28707**, respectively. None of these **300/300 per alignment** is as poor as the original. The exact-source-positive encrypted with an independently generated repeated GP29 pad yields **complete 308/308 and 299/299 plaintext-pair recovery**, with exact forward re-encryption and pad cancellation.

This provides a bounded **negative for exact synchronized reused additive GP29 pad** over the two source-identical floral chapters under the source-native English-plaintext register. It covers full title clocks and both body-reset clocks, and does not claim every possible 299-rune English pair is impossible. Repeated keys with unknown relative offsets, nonlinear combination, differing state resets, or a non-native plaintext register remain untested. Neither floral title explicitly commands a two-time pad, so the test is a motivated source hypothesis rather than Cicada-authenticated decryption. [Read-only one-file Windows Node22 original source test](../sims/lp2_p40_p54_flora_sharedpad_native_inverse_sft.cjs) · [successful run 43970219783](https://github.com/FlareZ123/liber-primus/actions/runs/43970219783). No unknown plaintext or key recovered.

### Source-registered one-step body-key displacement (Agent9, 17 November 2026)

**Exact new decision, distinct from equal-body cursor reuse:** Original p40's red heading has **eight** GP29 runes and original p54's has **nine**. If the identical fixed additive pad starts at each *complete heading*, with the pad clock consuming the original heading text, then its first black-body rune on p54 corresponds to the **second** black-body rune on p40. This selects one nonzero cursor displacement **+1** before examining original ciphertext. The prior equal-first-black alignment is a different rule and was already rejected above.

Use the untouched 3,008-rune p40–53 and 308-rune p54–55 complete chapter sources; strip only their respective first 8/9 red heading runes. Compare original p40 black indices **1–299** against p54 black indices **0–298**, 299 aligned pairs. For a true reused additive GP29 pad, the unknown key cancels exactly. The frozen evaluator is the same native-English GP29 difference distribution calibrated from 217,106 independent Shakespeare runes as the earlier section, with a fresh 500-pair reference set drawn from independent GP-native Gibran and Emerson.

| Fixed source-selected body alignment | Compared pairs | Original same-rune positions | Original native-text difference log evidence | Minimum of 500 native pairs | Native controls at or below original |
| --- | ---: | ---: | ---: | ---: | ---: |
| p40 body index1 ↔ p54 body index0, **offset +1** | **299** | **12** | **−4.587396644** | **−3.056610313** | **0/500** |

The original difference distribution has 12 zero-delta pairs and an uneven pattern incompatible with the trained native-English difference law at this coarse reference sensitivity. In the independent 500-pair control, the median native log evidence is +6.532158477. A correct **299-position shared-pad positive plant** encrypts independent native Gibran and Emerson passages under one arbitrary GP29 pad, recovers both complete plaintexts and reproduces their exact key-cancelled difference, verifying the implication without fitting a secret pad.

**Boundary:** The complete 299 compared body pairs overlap with the prior full-title-to-title test's 308 pairs, so these are **two views of the same original data**, with no independent combined significance. The additional decision isolates the original black-body register and follows the different red-heading lengths, rather than padding the earlier result with a tuned shift. The source motif itself does not authenticate pad reuse. The exact +1 shared-pad interpretation is disfavored for independent ordinary native-GP English texts. No unknown plaintext, pad, destination or alternative nonzero alignment was recovered. Retire this **source-fixed single +1 cursor law**, without using its failure to exclude all possible arbitrary displacements or unrelated nonlinear mechanisms.

[Windows Node22 standalone original-source SFT](../sims/lp2_floral_heading_plus1_pad_sft.cjs) · [successful CI run 43996310438](https://github.com/FlareZ123/liber-primus/actions/runs/43996310438)

### Same heading as a self-seeded finite-field recurrence (Agent33, 14 November)

A distinct human-computable use of the printed root24 is an **LFSR whose defining polynomial is the original red heading itself**. For p40, discard only the leading zero coefficient, not an original rune: H40 = [9,19,26,6,23,25,8] and its source-exact degree-five quotient Q40 = **[9,3,11,9,7,19]** is the six-register initial state. For p54, H54 = [24,19,21,23,27,2,14,10,19] and its quotient Q54 = **[24,15,4,3,12,0,14,27]** gives the eight-register initial state.

With high-first H of degree d, the state continues without clock resets by H0·K[t]+Σ(j=1..d) Hj·K[t−j]=0 over GF29. One source-native additive inverse P[t]=C[t]±K[t] is applied to the complete following original body (p40–53 3000 runes, p54–55 299 runes). There is no guessed phase, altered word boundary or fitted seed.

| Following original body | Initial key coefficients | Subtract LFSR key IoC | Add LFSR key IoC |
| --- | --- | ---: | ---: |
| p40–p53 black body, 3000 runes | [9,3,11,9,7,19] | **0.034353228854** | **0.034465488496** |
| p54–p55 black body, 299 runes | [24,15,4,3,12,0,14,27] | **0.033848847388** | **0.034073309241** |

All four actual inverses are uniform-like GP symbol streams, without readable GP-English plaintext. Both chapter LFSR streams re-encode **all 3,000 or 299 original ciphertext runes exactly**; independent native-GP positive plants also recover the identical original source runes. This controls implementation, not historical source selection. The quotient seed is just one natural construction out of many possible uses of the red heading, and the root24 observation remains a conditional structural clue.

[Independent original-input self-contained CommonJS SFT](../sims/lp2_floral_red_root24_quotient_lfsr_sft.cjs) · [Passing Windows Node22 CI 43548517822](https://github.com/FlareZ123/liber-primus/actions/runs/43548517822).

### Root-24 Horner checksum as a ciphertext-dependent state, frozen original inversion (Agent2, 17 November)

A deterministic alternative to the earlier heading-polynomial-as-LFSR is to treat the shared root as the Horner multiplier itself, as a human checking a polynomial might. The public constant is `r=3301 mod29=24`. Scan either authentic red heading from state `h=0` with `h <- 24*h + redRune (mod29)`. **Both headers produce `h=0`**, so their subsequent black bodies have a canonically identical, source-fixed initial state without guessing a quotient, phase, offset or hidden key. An internally motivated guess for a changing-state cipher is to use the same accumulator on the adjacent ciphertext or inferred plaintext rune:

- Decode `P_i = C_i ± h_i (mod29)`, then set `h_(i+1) = 24*h_i + C_i (mod29)` (ciphertext-autokey).
- Alternatively set `h_(i+1) = 24*h_i + P_i (mod29)` (plaintext-autokey).

The sign is the only explicit inversion convention in this four-model candidate, and each model is symbolwise bijective from state 0; no word/page state resets or collision exceptions are allowed. Crucial objection: **the original images say neither to apply a polynomial rolling checksum nor to use its state as an additive GP29 output key.** These are inexpensive, precisely specified tests of an internally suggested equation, not first-party recovered instructions.

| Frozen inverse | p40–53 black 3,000-rune IoC | p54–55 black 299-rune IoC |
| --- | ---: | ---: |
| Cipher-feedback, subtract | 0.034524841614 | 0.033848847388 |
| Cipher-feedback, add | 0.034386795599 | 0.036093465915 |
| Plain-feedback, subtract | 0.034447037902 | 0.033534600795 |
| Plain-feedback, add | 0.034545292875 | 0.033983524500 |
| Untouched ciphertext | 0.034544403690 | 0.033489708424 |

All eight original-source outputs retain essentially flat GP29 symbol histograms; direct inspections of the complete original outputs find no coherent unknown plaintext, key or typed payload. In each heading group the first black rune survives unchanged (`A` for p40, `IA` for p54) because the red checksum state is zero at the boundary. No parameters were learned on the first 300 p40 body runes, so the remaining p40–53 text and full p54–55 were used only after all four variants were frozen. Exact forward reencryption recovers all original 3,000/299 rune bodies; each variant also round-trips an independently clear 95-rune p57 GP-native plant. A frozen synthetic perturbation of the **first red heading rune by +1** changes the entering black-state by exactly `24^(m−1) mod29`: **+1** for m=8 at p40 (24^7=1), **+24** for m=9 at p54 (24^8=24). All four variant encoders/decoders recover the 95-rune native plant when supplied the predicted altered state and demonstrably misdecode its first symbol if the original zero state is wrongly reused. This is a falsifiable behavior of the proposed formula on synthetic controls, not proof of its historical use. Such invertibility alone is no evidence of cipher identification. [Self-contained Windows-compatible Node22 source test](../sims/lp2_floral_root24_horner_feedback_sft.cjs).

**Independent artifact distinction:** the original archive JPEGs `57.jpg` (physical p40) and `71.jpg` (physical p54) have **exactly identical grayscale pixel values** in both exterior ornament rectangles `x=0..519` and `x=1880..2399`, `y=750..2849` (2400×3600 images). Their central text rectangles differ. This directly establishes duplicated border artwork at those coordinates, so the border itself provides no per-chapter-distinct feedback update, IV or page clock. It does not rule out an instruction encoded in the different red headings, relative layout or another page feature.

**Bounded decision:** the root-24 headings are compatible with the public zero-state checksum but do not identify a symbol-changing opcode. Both minimal Horner-feedback inverses, under both signs and with unchanged original page-carry, fail the complete-text gate. No source-selected nonlinear floral cipher has been recovered; further fitted tweaks to this same checksum equation would be unjustified without another original clue.

### Exact ten-by-300 floral body register: all-secret stationary-key decision (Agent2, 17 November)

The shared ornament invites comparing chapter extents. After the **actual eight printed red runes** of p40, its p40–53 body has **3,000** continuous GP29 runes, exactly **ten blocks of 300**. The other floral heading is **nine red runes**, and its entire p54–55 black body is **299**. Treating its last red rune as body would produce another 300-rune segment, but the original red ink and marker explicitly contradict such a reset; it is only an exploratory length echo. This gives a source-visible candidate for a 300-phase stationary key shared across the ten genuine p40 body blocks.

A decisive original-cipher constraint needs **no key recovery**. Suppose each of the 300 phase positions applies its own otherwise arbitrary fixed secret GP29 bijection independently to the plaintext, reused over ten blocks: `C[300b+j]=π_j(P[300b+j])`. The 300 maps may be any of 29! rune permutations and need not be additive, linear or related. For every pair of blocks (45 pairs) and each aligned slot (300 slots), injectivity forces `C[a,j]=C[b,j]` exactly when `P[a,j]=P[b,j]`. **All 13,500 aligned equalities are therefore a key-independent observable.** Ordinary GP-native English should have many more than a uniform 29-character stream.

| Original or independent source-native 3,000-rune controls | Aligned equalities / 13,500 |
| --- | ---: |
| **Original p40–53 black body**, ten actual 300-rune blocks | **455** |
| 300 genuine Gibran windows, minimum / median | 721 / 822 |
| 300 genuine Emerson windows, minimum / median | 742 / 831 |

The 300 control windows per author use deterministic start positions (`(137+7919k) mod (nativeLength−3000)`), separate from the training register, and are each divided into ten continuous 300-rune blocks. The source-attested GP-orthography encoder is calibrated against original solved LP1 and independently clear p57, with **no word or rune rearrangement**. **0/600 original-format literary control windows** reach the actual 455 equalities. The original count is near the no-language random expectation 13,500/29≈465.52, whereas native literary registers are around 6% aligned repeats. This is an empirical reference-class exclusion, not a universal theorem covering every possible English source.

A second **stronger but narrower** test of a *reused additive 300-rune pad* cancels its unknown values between each pair and compares the complete difference histogram to the Shakespeare-trained native-GP difference law. The aggregated original log evidence relative to uniform differences is **−266.03908**; among the same 600 genuine native controls, the smallest Gibran score is **+210.52997** and the smallest Emerson score **+187.90973**. A native source-shaped 3,000-rune planted cipher with **300 independent secret permutations** recovers all plaintext exactly and preserves its 45×300 equality count; an independently planted 300-period additive key also preserves the differential log evidence, and both schemes invert all 3,000 symbols.

**Decision and limit:** no source-fixed **phase-300 stationary permutation cipher** acting directly on ordinary preserved GP-native prose is consistent with this original p40 register, even with completely secret per-phase alphabets. This decisively retires the simple exact-300 period family and makes the floral 3000/299 length echo insufficient as a direct running-key explanation. A plaintext-F-transparent key skip, ciphertext-dependent clock or changing state breaks the fixed-phase equality invariant; these are outside this test, as are unknown non-GP plaintext representations. [Original-source all-secret CJS test](../sims/lp2_floral_300phase_allsecret_original_sft.cjs).

### Floral final section as a literal 300-symbol key, fully F-transparent original inverse (Agent2, 17 November)

A specific source-visible *nonstationary* escape from the 300-phase all-secret equality obstruction is to let the original later floral passage supply a direct key to the earlier 3,000-rune body, but **skip key consumption when the inferred plaintext is GP F=0**, precisely as the independently solved p56 does. Skips desynchronize aligned 300-rune blocks, so the previous phase-aligned equality exclusion does **not** cover this variant.

The original p54–55 heading contains **nine red runes**, and its black body **299**. Two exact 300-rune key tapes can be selected from the full **308** original p54–55 runes with no guessed characters: its *first* 300, or its *last* 300, the latter retaining the actual **ninth red rune** as key[0] and 299 following black runes. An equally literal 299-rune key is just the true black p54 body. The symmetric original floral art makes forward or reversed reading a bounded geometric alternative. None of these transfers is explicitly instructed by the author, so the 3 × 2 × 2 **twelve frozen source candidates** are a small evidence gate, not a cipher-discovery sweep.

For each source key, reading direction and arithmetic sign, process the **original untouched p40–53 complete 3,000-rune body** with an exact full inverse state set containing *every possible number of earlier transparent F plaintexts*. A consuming alternative decodes `P=(C±K_j) mod29` and is legal only if `P≠0`; at `C=0` a nonconsuming alternative gives `P=0`. The latter is the only source-authenticated p56 F-skip law. No English scorer, beam pruning, word repair, cipher reset or guessed key phase is used.

| Key tape from original p54–55 | Forward: subtract/add first impossible original position | Reversed: subtract/add first impossible position |
| --- | --- | --- |
| First 300 runes (includes red9) | **0 / 52** | **46 / 33** |
| Last 300 runes (red9th + black299) | **9 / 4** | **53 / 73** |
| Entire true black 299 runes | **10 / 84** | **53 / 73** |

All positions are zero-based relative to the source p40–53 body, and **every original inverse path set is empty before its first 100 runes**. Consequently no one of these twelve literal final-floral keys could directly encode the first floral body under the independently attested p56-style F-transparent additive cipher, in the exact prescribed orientation and phase.

**Independent reverse direction:** divide the unaltered 3,000-rune first floral black body into its exact **ten 300-rune source blocks** and test each as an additive key to the complete **299-rune final floral black body**, in original or reversed order and either sign. All **10×2×2=40** source-registered orientations have an **empty exact F-transparent inverse path set** before the final source rune; the latest survivor reaches only zero-based position **206/298** (p40 block7 reversed, sign+). Each variant encrypts and then exactly recovers the independent 95-rune native p57 positive plant, including F nonconsumption. This closes direct fixed-key reuse in **both** directions under the historical p56 operation, even when F-skips desynchronize the native period. Neither test addresses a changing PRNG seeded by floral body, nor any other opcode. This is an algebraic obstruction that would hold even for arbitrary non-English plaintext. For every signed/reversed key, an independently clear **95-rune p57 GP-native PARABLE** is encrypted with that key and the identical skip rule, its complete path survives, and using the known planted F-branch selector recovers **95/95** source-native runes exactly. [One-file read-only Windows Node22 reproducer](../sims/lp2_floral_tail300_ftransparent_original_gate.cjs).

**Scope:** A phase that the original source independently selects, a changing key state, a true nonadditive collision filter, a key schedule employing separate red and black streams, or nontrivial table decoder lies outside this exclusion. Nor does the attractive 3000/299 arithmetic prove the later section was written to key the earlier. This result prevents further recycling of a conventional repeated 300/299-digit cross-floral pad in either direction.

### Original 32×94 floral-to-grid chapter register: source-origin obstruction (Agent2, 17 November)

The 256 printed numeric cells on physical pp49–51 form **32 rows of eight**. The unmodified surrounding floral chapter p40–53 contains **3,008 GP29 runes, including its eight originally red opening runes**: 3,008=32×94. Director #1418 therefore proposed assigning 94 source runes to each grid row and, only if an original mark specified the reader, using that row's eight bytes as a changing key. This is distinct from the 3,000-rune black-body/300-phase test above. The source geometry is sufficient to check whether the 32×94 decomposition existed for a human solver.

The complete literal line/page transcription, all original rune values and the printed 32×8 table were joined and compared. At the only whole-chapter origin printed as a beginning, the first rune of physical p40, the **31 interior 94-rune boundaries intersect exactly eight printed word breaks, two printed line ends, zero physical page ends, and zero printed full stops**. Therefore **23 of the 31 artificial cuts fall strictly within printed words**. The paper's actual p49→p51 table interruption is at uninterrupted chapter rune **2,474**, at **94×26+30**: the original printed table lies **30 runes into the alleged 27th 94-rune block**, rather than between row blocks. Although shifting a 94-rune tiling can yield more apparent word boundaries, the manuscript gives no phase or cyclic wrap instruction, and a source-text-aware phase search would violate the clue-selection gate. Under the author-visible red-to-black start at offset8, precisely **3,000 black runes** remain, which is not divisible by94; including the red heading is therefore essential for the 3,008 coincidence. Also **94 mod8=6**, so eight cells cannot each consume an equal integer number of body runes per row without an unprovided allocation rule.

The original red 51-rune p53 ending begins at chapter offset2,957, **43 runes into the last artificial 94-rune block**. This identity is forced by its position at the end of 3,008−51, so it does not independently select that block layout. Full original-rune, ink, line/page and byte-table assertions are in [the read-only Windows Node22 source SFT](../sims/lp2_floral_32x94_source_layout_sft.cjs).

**Decision:** the 32×94 decomposition is exact arithmetic, but its natural phase does not coincide with the physical row or word geometry; the table interrupts rather than separates a hypothesized text row. Neither the page nor the original table supplies a cell-to-94-rune state transition, equal-length column allocation, red/black clock rule or independent row-start selector. Therefore #1418 stops **before any fitted cipher**: its premises do not select one freezeable reversible output, and a blind 138/170-rune flanking-sentence test would amount to tuning unprovided assumptions. This does not rule out a different nonuniform table reader if first-party instructions establish it.

**Decision:** preserve the paired heading root24 equality as a candidate single-parity relation and retain the exact 3,000-rune body as a visible architectural clue. Direct quotient repeating keys, quotient-LFSR streams, two minimal checksum-based nonlinear Horner feedback clocks, equal/+1 shared pads, any fixed 300-phase positionwise secret GP29 substitution, and the twelve literal p54-to-p40 length-300/299 key transfers under exact native F-transparent addition have now failed their distinct, explicitly defined original-cipher gates. No source-authenticated instruction chooses a moving-state opcode, F-transparent key clock, orientation or input register. Further exception-fitting or arbitrary secret replacements should await independent original instructions. No unknown-page plaintext, key or final destination has been recovered.

**Reproduction:** [one read-only Node22 CommonJS SFT](../sims/lp2_red_floral_root24_quotient_key_sft.cjs) checks original spans and coefficients, all exact roots and nonroots, the 7/8 source quotients, both whole-chapter inverses and exact native-GP planted controls. [Successful read-only Windows GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43543857247). The separate quotient-LFSR original inverse and its native plant passed [Windows CI 43548517822](https://github.com/FlareZ123/liber-primus/actions/runs/43548517822).
