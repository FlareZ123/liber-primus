# P7's five-red-word algebra: seven-state polynomial cycle and reversible pair transform

**Agent22, 22 November 2026. Classification: exact original-source nonlinear state and reversible arithmetic clues with bounded original-cipher negatives.** Extends the prior [p7 polynomial fixed-point and derivative discovery](lp2-p7-p8-original-red-polynomial-fixedpoint.md). No unknown LP2 plaintext, historical cipher key, or verified intended continuation was recovered.

## Original source and newly discovered graph structure

The final five completely red words of physical p7 have GP29 zero-based rune-index products **[11,26,8,15,2]**. The two completely red words opening adjacent p8 have products **[4,3]**, and the final p8 red rune has GP29 index **17**. The existing source study establishes the **ascending-degree** GP29 polynomial

    P(X)=11+26X+8X²+15X³+2X⁴ (mod29).

The complete GF29 fixed points of P are **{3,4}** (p8's two red-word products, in reverse printed order), and its derivative at4 is **17** (the physically last red heading rune).

**New result:** Iterate the same already-frozen polynomial over all 29 actual GP indices. The complete functional graph has **exactly three cycles**, with no free choice of mapping, starting state, field, or coefficients:

| Cycle | Exact cycle | Basin size |
| --- | --- | ---: |
| Nontrivial seven-cycle | **5 → 15 → 28 → 9 → 10 → 24 → 7 → 5** | **26** |
| Printed red-heading fixed point | 4 → 4 | 2 |
| Printed red-heading fixed point | 3 → 3 | 1 |

The seven-cycle therefore attracts 26 of the 29 possible native GP rune indices. More selectively, the zero-initialized path is

    0 → 11 → 23 → 17 → 18 → 5 → 15 → 28 → 9 → 10 → 24 → 7 → 5 ...

It takes **exactly five** polynomial steps to reach state5 and then follows the **seven-cycle**. Five is the number of marked red p7 words; the next **p8–p14 botanical/tree chapter comprises exactly seven physical pages**, containing [255,268,263,273,261,272,137] source ciphertext runes. The match is exact and reproducible. A human-readable intended instruction to start from GP0, warm up for five steps, or use the orbit as page keys remains **unprinted and unproven**.

## All-secret conditional polynomial-family census

The independently pre-existing source constraints P(3)=3, P(4)=4, and P'(4)=17 impose three linearly independent equations on the five native GF29 polynomial coefficients. Every polynomial of degree at most four satisfying them is obtained by choosing its X³ and X⁴ coefficients freely and solving the other three. There are exactly **29²=841**, and **409** of them have the *complete fixed-point set* exactly {3,4}.

Freeze this already selected family and exhaustively reconstruct each candidate's full 29-point functional graph. The counts are:

| Among the 409 exact-root polynomials | Number |
| --- | ---: |
| At least one seven-cycle | **11** |
| Exactly three cycles of lengths 1,1,7 | **9** |
| Five iterations of index0 end at5 | **12** |
| **Both seven-cycle and five-step index0→5** | **1** |

The unique polynomial in the last row is **[11,26,8,15,2]**, exactly the five original printed word products.

These counts are exact conditional mathematical facts, **not a 1/409 probability of author intent**. The five-step and seven-page correspondence was noticed retrospectively after the original polynomial and fixed points had been identified. There are many other investigated manuscript numbers and transformations. Nonetheless, the original candidate uniquely connects several authentic source features without a fitted private key, and gives a specific seven-state orbit for an actionable future decipherment test.

## Another reversible reading of the same five printed red operands

The five authentic source red word products [11,26,8,15,2] have a compact *independent cipher-operation interpretation*, separate from calling them quartic polynomial coefficients. Read them sequentially as two GF29 inputs, two outputs and a final determinant:

    a=11, b=26, u=8, v=15, d=2
    u = a+b = 8 (mod29)
    v = b-a = 15 (mod29)
    [u,v] = [[1,1],[-1,1]]*[a,b] (mod29)
    determinant([[1,1],[-1,1]]) = 2 = d (mod29)
    [a,b] = [(u-v)/2,(u+v)/2] (mod29)

This is a **completely reversible original-source two-rune butterfly example**, without any private parameters or extra fields. The last printed red word product2 provides precisely the normalization needed for its inverse (1/2=15 modulo29). Unlike the source quartic, this algebra supplies a *direct invertible two-rune operation* that a historically plausible human could try on genuine ciphertext, albeit without a printed red-word 2|2|1 partition or instruction to apply it to adjacent runes. All **841** degree-at-most-four GF29 coefficient vectors satisfying the previously established p8 title constraints P(3)=3, P(4)=4 and P'(4)=17 were independently enumerated; **only the original printed vector** also obeys all three butterfly relations. This is a restrictive **postselected conditional constraint**, not evidence that the creator explicitly intended both structures.

An even more physical cross-page link appears in the butterfly's two outputs and the next red title:

    8² + 15² = 17² = 289 (ordinary integers).

The p8 terminal *original red rune* has index **17**. Thus the printed red middle products8,15 and next-page final red17 form the exact **primitive Pythagorean triple (8,15,17)**. The other two p8 red *whole-word* products [4,3] provide the legs of root **(3,4,5)**. A single Euclidean rule m→(m²−1,2m,m²+1) yields root (3,4,5) for **m=2**, the fifth p7 red product, and child **(15,8,17)** for m=4. This child is specifically one of the **three standard Berggren-tree branches** from root (3,4,5), already enumerated in the [prior p8 tree study](lp2-p8-berggren-original-source-selector-gate.md). The new P-iteration yields the missing hypotenuse **5** as P⁵(0), sourced from the preceding five complete red words rather than from an unprinted page9-only fragment. That may strengthen a candidate tree path. It still does not select a branch order among the complete 243 candidates or justify equating the botanical illustration with a mathematical Berggren tree.

These equalities are **algebraically interdependent**. The earlier independent [p7 red 2×2 Hill/checksum study](../sims/lp2_p7_red_fiveword_hill_checksum_sft.cjs) noted that matrix [[11,26],[8,15]] has determinant15 and fifth word2 is its inverse, because 15×2≡1. Given the butterfly and the integer 8²+15²=17²≡−1 modulo29, that checksum follows algebraically: det([[a,b],[a+b,b−a]])=−(a²+b²)=15 modulo29. They are mutually reinforcing **descriptions of the same authentic five values**, not three independent probabilistic surprises. Neither the older Hill receiver nor the new simpler butterfly decrypts ordinary original GP29 runes.

## A source-derived five-step matrix rotation with exact period seven

The *two* ordinary-integer primitive triangles are unexpectedly connected by a **single reversible GP29 matrix operation**. Normalize their ordinary rotations by their printed hypotenuses in the canonical field GF29:

    R(3,4,5)   = 5^(-1) [[3,-4],[4,3]]   = [[18,5],[24,18]] (mod29)
    R(8,15,17) =17^(-1) [[8,-15],[15,8]]= [[9,23],[6,9]] (mod29).

These are proper rotations in the finite quadratic form x²+y²: determinant1 and an explicitly computable inverse via matrix transpose. **Exact full-matrix multiplication establishes**

    R(3,4,5)^5 = R(8,15,17);
    R(3,4,5)^7 = identity;
    R(3,4,5)^j != identity for j=1..6.

The **five** marked p7 red words thus correspond to precisely **five repeated applications** of the rotation encoded by p8's red whole-word legs3,4 and the Euclid-m2 hypotenuse5, producing the rotation encoded by the **two middle p7 red whole-word values8,15 and the final p8 red rune17**. The following botanical chapter has **seven** original physical pages, and the root rotation has **exact order seven**. This is a new source-to-source relation involving complete independently printed operands and a bona fide, completely reversible finite-field operation. It provides **all seven distinct matrix keys with no secret coefficients**:

    R^0 = [[1,0],[0,1]]
    R^1 = [[18,5],[24,18]]
    R^2 = [[9,6],[23,9]]
    R^3 = [[16,8],[21,16]]
    R^4 = [[16,21],[8,16]]
    R^5 = [[9,23],[6,9]]
    R^6 = [[18,24],[5,18]]
    R^7 = identity.

**Integer-only modulus uniqueness certificate.** This relation supplies a sharper check than simply selecting GP29 because its alphabet has 29 symbols. Write the rational Pythagorean rotations as Gaussian-unit ratios z=(3+4i)/5, w=(8+15i)/17. The two source-numbered operations demand z^5=w and z^7=1. Clearing their *integer* denominators gives two exact Gaussian-integer residuals:

    17*(3+4i)^5 - 5^5*(8+15i) = -29029 - 99847i
    (3+4i)^7 - 5^7 = -1682 + 16124i.

The absolute component gcd for the **fivefold identity** is **319=11×29**, and for the **sevenfold identity** **58=2×29**. Hence **gcd(29029,99847,1682,16124)=29**. Any integer modulus m>1 for which *both complete Gaussian equations* hold must divide29. Conversely, denominators5 and17 are invertible modulo29 and the two exact matrix identities were demonstrated. **Thus 29 is the unique nontrivial integer modulus** supporting *both* original source-shape operations simultaneously, not merely the cheapest modulus to try. This is exact arithmetic, with no language score or exploratory prime sweep. The fifth- and seventh-power equations were selected after observing the five red words and seven-page chapter, so the modulus-selection theorem does not by itself establish the author's intention.

Unlike the quartic polynomial's seven-point orbit, the matrix rotation is bijective on *every* GP29 two-rune pair, potentially making it a more plausible decipherment operator. Two branches compete: the source could mean an ordinary direct Pythagorean rotation, or a page/word clock choosing one of its seven powers. Neither rotation operator nor its key-consumption direction is explicitly written by the author. The same native prime29 and seven-page count underlie both this cycle and the earlier quartic seven-cycle; they cannot be treated as statistically independent evidence. The printed numeral7 at original rune offset692 aligns with a **rune-clock** value of the quartic, while a two-rune-pair rotation clock would have 346 pair ticks and a different phase; the numeral's positional match does **not** by itself confirm this matrix consumer.

An original-input direct inverse gates the normalized **3–4–5 and 8–15–17** rotations, forward and inverse, both pair orientations, on genuine p8→p9 carry receivers of lengths244/256 and full p9–14 and independent p16–21. All **32 fixed rotation tests** produce nonprose GP29 IoC below0.037. More strongly, apply **R^j** to successive original adjacent rune pairs under its exact source period7, with only two motivated initial powers0 or5 and both inverse directions: **16 fully reversible source models** on the same four original receivers, none yielding GP-native prose. Maximum corrected IoC is **0.0361519608** for the 256-rune full-p8 plus genuine first-p9 carrier. Original whole-book p57 authentic clear-GP plants round-trip exactly under these clock models. These original negatives reject these direct receivers. The new fivefold identity itself is exact regardless of encryption interpretation.

**Reproduction:** [single read-only Windows11 Node22 complete-source SFT](../sims/lp2_p7_red_butterfly_pythagorean_receiver_sft.cjs), including complete printed words, red span checks, 29×29 butterfly inverses, two GP29 norm-one rotations, explicit integer matrix fifth/seventh powers, exact Gaussian integer gcd29 modulus certificate, all original receiver outputs and untouched native-p57 positive. [Windows Actions PASS 45050398807](https://github.com/FlareZ123/liber-primus/actions/runs/45050398807).

## An independent literal numeral-7 phase check

The *sole* non-rune Arabic numeral in the complete original p8–p14 tree chapter is a printed **7** in physical p10. There are exactly **692 authentic GP rune symbols preceding it**, counting from the beginning of physical p8, and the entire chapter has 1,729 GP runes. Independently, this is the number previously used by the [five-dot and seven-column original alignment](lp2-p7-five-dot-numeral7-nested-column-alignment.md).

The new polynomial orbit seeded from native GF29 zero and warmed up for the five p7 red words is [5,15,28,9,10,24,7]. Under a **whole-chapter clock starting at p8's first original red heading rune**, the numeral arrives at source rune offset **692=7×98+6**, exactly the phase whose derived value is **7**. This uses a real untouched numeral and a frozen cycle, with no moving its position or selecting a new key phase after inspecting the marker. Under the competing, equally natural **clock starting at the first p8 black rune**, the offset is **680 mod7=1**, which expects **15**, so the check fails. Both possible source clocks are displayed to prevent silently protecting the coincidence. The 1-in-7 phase alignment is modest, post-discovery and cannot authenticate a cipher without an independent original instruction indicating whether the red heading consumes the state.

## Original-cipher inverse decision for the butterfly

An exact source-derived cipher candidate applies the determinant-2 butterfly above directly to neighboring authentic GP29 ciphertext runes; the inverse uses the actual source-provided factor2. The lossless inverse/forward are tested on both faithful p8→p9 carry registrations (244 black-plus-first-p9 runes; 256 full-p8-plus-first-p9 runes), complete p9–p14 (1,474 runes), and independent p16–p21 and p40–p53 original holdouts. **All ten** direct forward or inverse outputs on these five receivers have GP29 index-of-coincidence below **0.037** and no sustained native-GP words. Genuine p57 native-GP test input, including its odd last rune, is exactly restored.

Because the operands were originally **whole-word products**, a different direct receiver aggregates the **383 complete printed source words** in p8–p14 to their individual GP29 products first, retaining the real p8→p9 word carry. Applying the same pair butterfly to these products gives GP29 IoC **0.03511818** (forward) and **0.03457138** (inverse), with no original prose. Eight five-word windows within the only other twelve-word all-red passage, physical p53, do not reproduce the butterfly example. These are direct consumer negatives, while the upstream source arithmetic is exact.

**Research decision:** The butterfly and the source-derived normalized **period-seven Pythagorean rotation**, whose fifth power predicts the independently printed 8–15–17 triangle, are concrete invertible operation candidates with no unfitted numeric parameters. The p7 2|2|1 values, the neighboring red 3,4,17 and a literal7 form a plausible human clue sequence. Yet neither the 2|2|1 cut, polynomial iteration, source-page/black phase boundary, Pythagorean branch order nor the destination of any transformed words is printed as an instruction. Promote only on a new actual original plaintext or an independently selected full reversible receiver.

**Reproduction:** [separate original-source butterfly/triangle/numeral7 Windows Node22 SFT](../sims/lp2_p7_red_butterfly_pythagorean_receiver_sft.cjs), with 2,896 original words/ink, all 841 coefficient controls, 29×29 round-trip, five complete source receivers and the 383-word original chapter.

## Source-fixed first direct inverse, independent native positive

The lowest-assumption hypothetical consumer treats the seven-cycle as a GP29 repeating additive key. The printed red12 title is left intact, and the first key5 starts at the **first black p8 rune**. The clock advances once per subsequent original rune across the seven physical source pages p8–p14 without page reset. Both additive signs are tested; the source does not specify one.

For original black p8 plus all original p9–p14, exactly **1,717** runes are decoded. Source-fixed readouts are:

| Readout | Full original GP29 index of coincidence |
| --- | ---: |
| Unmodified 1,717-rune ciphertext | **0.03443218** |
| One-rune cycle subtraction | **0.03455368** |
| One-rune cycle addition | **0.03445118** |

Neither provides a credible sustained native-GP plaintext signal; solved p57's genuinely clear GP29 has IoC about **0.06271**. Both complete inverses reencrypt every original rune exactly, and separately a true solved native-p57 positive plant recovers **95/95**. The full original negative concerns these specific additive readouts, and exact re-encryption alone does not authenticate a cipher.

Taking one constant cycle key per physical page, instead of one per rune, is also inadequate as a plain GP29 Caesar shift: it preserves **each page's exact index of coincidence**, and all seven original pages have near-uniform GP distributions. A more informative decoder would need a source-selected nonlinear readout or a state update that can change original within-page symbol statistics.

## Seven-point finite-field Fourier receiver across all seven botanical pages

A new direct receiver follows from the previously established **exact reversible** Pythagorean rotation rather than choosing a Fourier root by hand. In GF(29), the square roots of -1 are 12 and 17. The normalized 3–4–5 rotation represented by (3+4i)/5 has conjugate eigenvalues **16 and 20**, each a primitive seventh root of unity. That fixes the roots of a seven-point number-theoretic Fourier transform, up to reversing its direction.

The seven original botanical pages **p8–p14 contain exactly 1,729=7×247 GP29 runes**. This supports two especially simple all-rune seven-channel receivers without an invented padding or text deletion: (1) 247 consecutive original seven-rune groups, and (2) seven consecutive lanes of 247 runes, transformed at each lane coordinate. For each root16/20 and both Fourier orientations, the inverse has the canonical factor 7⁻¹=25 (mod29). All **eight** model variants are completely reversible on the original ciphertext and recover a planted native solved-p57 excerpt exactly.

Every untouched-original output remains near uniform: **0.0345702665** GP IoC for consecutive groups or **0.0345019868** for equal-width lanes, compared with source ciphertext **0.0344604835**. Neither yields sustained native plaintext. Both roots and both orientations have the same whole-output IoC within each grouping because they permute the seven Fourier output coordinates. This is a **bounded negative against a direct plaintext-yielding seven-point Fourier layer**. It does not rule out a transform preceded or followed by a different secret cipher, nor establish that the author intended a Fourier transform. It does consume a newly source-selected, fully invertible operation without key fitting, which is preferable to speculating about further free phases.

Reproduce with the read-only Windows 11 Node.js22 SFT [p7 root-seven Fourier, full original 1,729-rune receiver](../sims/lp2_p7_root7_fourier_botanical_sft.cjs). The 7-point NTT on the distinct p33–39 chapter has [a separately established root24](../sims/lp2_red_root7_fourier_original_inverse.cjs) and is not reused as evidence for this p7-derived root16/20 test.

## Seven-channel all-secret affine circulant key inference (Agent46, 24 November)

The direct seven-point NTT above fixes a basis, not a key. A materially different, fully reversible mixing law is to allow **all seven independent secret Fourier-mode multipliers** (each nonzero), together with a common additive GP29 offset. In the original coordinate basis this is exactly an invertible circulant matrix over GF29 plus a scalar bias. The two already-frozen 7×247 geometries (247 adjacent seven-rune groups and seven equal-width lanes) require no extra padding, and the literal p10 numeral 7 is retained as an unchanged non-rune. There is no first-party instruction selecting diagonal spectral encryption or intact plaintext word boundaries; this is a bounded attack on a plausible extension, not a claimed historical cipher.

Write (P_i=b+\sum_{j=0}^6 k_j C_{g,(a+j)\bmod7}\pmod{29}), where (g,a) are the original group/lane coordinate of output (i). The seven circulant coefficients and scalar bias are eight unknowns. In a complete printed word with eight linearly independent ciphertext rows, any proposed GP spelling yields exactly one key via GF29 inversion. The script enumerates every spelling of each rank-eight word in the 38,920-form pinned TextBlob/native register, verifies the **whole** word, allows singletons A/I/O/T (O generously added to native A/I/T), and rejects singular matrices. It fits only the first **1,124** original runes, six singletons, and 37 long anchors; one long anchor in each geometry has rank seven and is not decided by this inversion. The remaining 605 output runes are reserved for frozen plaintext prediction, though lane-model ciphertext coordinates inherently cross the fit/holdout boundary.

| Fixed geometry | Rank-eight training anchors | Key candidates satisfying any such anchor and all six training singletons | All-secret nonsingular keys satisfying all 11 singletons only |
|---|---:|---:|---:|
| Adjacent seven-rune groups | 36 | **0** | 121 |
| Seven lanes of 247 | 36 | **0** | 144 |

The singleton-only column uses an independent full-rank eight-row basis, enumerating all 4^8=65,536 label assignments, then checking the remaining three singletons and invertibility. Thus the grammar obstruction is conditional but exact: **each of those 36 long words in either model must be outside the fixed lexicon** if all six training singleton labels are valid. Singleton support alone is insufficient to exclude the family. No candidate key was frozen and no original suffix language was scored in the anchor attack.

Four independent deterministic secret-key plants use disjoint native solved-source donor pools of 1,610 and 1,337 runes under both geometries. The same word-anchor search and training selection uniquely rank the true key first in each case, with candidate counts 1/4/1/2, recover every coefficient and bias, re-encrypt the full input and recover all **2,050/2,050 withheld plaintext runes**. The dictionary includes native donor vocabulary (vocabulary-assisted calibration; no supplied ordered crib or key), so this is not a source-author attribution test.

Retire the exact affine circulant/constant-offset model with intact native word boundaries and this lexical register. The prior source-fixed NTT alone and this all-secret spectral-multiplier family are distinct; no unknown LP2 plaintext or author key is recovered. Different phase-specific bias, hidden F-clock, transformed word boundaries or non-circulant mixing are outside the exact decision. [Executed CommonJS SFT](../sims/lp2_p7_circulant7_affine_key_inference_sft.cjs) (connected V8 execution, no CI claim).

### Period-seven additive layer in either composition order (Agent46, 24 November)

The scalar-bias test does not cover an independently keyed ordinary period-seven additive cipher. The literal 7 and the prior seven-point NTT motivate a separate, narrowly defined layer combination. Each of the seven coordinates in either geometry has a distinct physical rune index modulo 7 (lane height 247 is coprime to 7). The composition of a fixed invertible circulant mixer and an arbitrary period-seven additive pad, in **either order**, reduces to

```
P[i] = dot(k, C[geometry-group cyclic row i]) + b[i mod 7] (mod 29)
```

where the seven circulant coefficients and seven physical phase offsets are all secret. This equivalence concerns ordinary consuming shifts, not latent-F holds; no author instruction authenticates the combination.

**Exact constructive elimination:** for each length ≥11 training word, retain one pivot position per phase. Subtract the corresponding pivot row from every additional word position and each training singleton of that phase. This eliminates all seven additive offsets. A rank-seven basis fixes the circulant coefficients from a proposed complete word spelling plus at most three selected singleton labels, with unused equations checked exactly. The offsets are recovered from the pivot plaintexts. Enumerate all eligible spellings in the 38,920-form register and all A/I/O/T singleton labels on selected rows; reject singular matrices. The union of full-rank anchor candidate sets is complete for every key admitting at least one such anchor and all six training singletons. Fit only the first 1,124 output runes, maximizing compatible anchors then ≥3-rune dictionary coverage.

| Original result | Adjacent groups | Seven equal lanes |
|---|---:|---:|
| Rank-full length ≥11 training anchors | 11 | 11 |
| Distinct nonsingular candidate keys | 2,069 | 2,101 |
| Maximum anchors compatible with any key | **1/11** | **1/11** |
| Frozen prefix winner eligible dictionary coverage | 39/1,054 | 36/1,054 |
| Frozen 605-rune suffix eligible dictionary coverage | **3/552** | **3/552** |
| Frozen suffix singletons in A/I/O/T inventory | 1/5 | 1/5 |

The 13-rune group at offset 1012 admits zero candidates in both geometries. Every key must put at least 10 of 11 selected long words outside the fixed lexicon, conditional on six native singleton labels. Both prefix winners re-encrypt the full original exactly, but their decoded strings are nonprose and their frozen continuation fails. The SFT prints both candidate readouts. No suffix language is used for selection; lane ciphertext coordinates can cross the training boundary.

The two disjoint native donor pools were encoded with new deterministic 14-coefficient keys. Separate `phase-groups` and `phase-lanes` executions use the same two keys across both geometries (controlled cross-geometry comparison, not four independent key draws). Each recovers its true key as unique top candidate, with candidate counts 1/4184 and 2/4262 respectively, and **2,050/2,050** combined withheld native runes. The lexicon includes donor vocabulary. Initial unoptimized execution timed out without a result; precomputed unused-equation projections and a frozen ≥11-rune anchor register completed each exact run in about four seconds of connected JS execution. No CI claimed.

Reproduce with the [same SFT](../sims/lp2_p7_circulant7_affine_key_inference_sft.cjs), arguments `phase-groups` and `phase-lanes`. Both geometries and both layer orders are now conditionally retired for ordinary period-seven offsets, intact printed word boundaries and the fixed native lexical/singleton register. A new source-selected state, clock or output register is required. No unknown plaintext or authentic author key.

## Exhaustive spacing-free affine circulant decision (Agent46)

The preceding lexical inverse assumes printed word boundaries. This separate inverse uses **no delimiters, dictionary or ordered crib**. With either fixed geometry, let P[g,t] = b + sum(j=0..6) k[j] C[g,(t+j)%7] mod29. The full training-group histogram and its collision count are invariant under nonzero scaling, cyclic coefficient rotation, and any common bias. The seven-point DFT over GF29 is invertible since 20 has order seven. Exactly 28^7 coefficient vectors give invertible circulants (all seven spectral eigenvalues nonzero). Each invertible orbit under scalar multiplication and cyclic rotation has size 196: a nontrivial projective rotation stabilizer would be a Fourier eigenvector with only one nonzero spectral coefficient, hence singular. Thus the complete **invertible search has 68,841,472 orbits**; including singular directions the count is ((29^7−1)/28+42)/7=88,009,579. The executed scan asserts both counts.

Choose the lexicographically largest cyclic rotation normalized to first coefficient 1. Enumerate remaining coefficients subject to every nonzero-start adjacent ratio being no larger than the first ratio, then break ties lexicographically. Precompute three-coefficient partial sums for every training row and spectral evaluation; AVX2 byte addition/modular reduction accelerates exact integer histogram counts. The first floor(65% of groups) form training, with all seven coordinates from each selected group, remaining groups held out. Original split 1,120/609; the lane split is strided, not a contiguous natural-order prefix.

Retain 64 highest exact collision directions, rank all 812 scale/bias choices by smoothed native unigram, retain each direction's top16 choices, rank seven cyclic rotations by native backoff trigram (unigram pseudocount .5; bigram strength8; trigram strength12). This is a bounded language stage, unlike the exhaustive collision stage. Score only within natural-order runs of the same split, with shorter context at split edges. Each control LM excludes all source sections in its own plaintext donor.

| Input | Fit/held runes | Exact maximum fit IoC | Frozen fit LLR (nat/rune vs uniform) | Held LLR | Held recovery |
|---|---:|---:|---:|---:|---:|
| Groups native plant | 1043/567 | 0.0613890611572 | +0.676064906234 | +0.601682153165 | 567/567 |
| Lanes native plant | 882/483 | 0.0604549046255 | +0.460891676454 | +0.661961443168 | 483/483 |
| Original adjacent groups | 1120/609 | **0.0366063449508** (45,878 ordered pairs) | −1.4207546923 | −1.79030610596 | nonprose |
| Original seven lanes | 1120/609 | **0.03663666539** (45,916 ordered pairs) | −1.42404812527 | −1.67729978445 | nonprose |

Both native plants recover their unknown direction at rank zero, and after scale/bias/rotation ranking, every coefficient and bias, all **1,050/1,050 held-out runes**. Donors are disjoint: source sections 1,3,5 (zero-based) versus all others, truncated to multiples of seven. Seeded MT19937 plants groups key [17,11,4,13,11,9,15], b=12; lanes [15,14,21,20,17,13,28], b=25. Original frozen winners [13,28,16,6,18,15,18], b=17 (direction rank63), and [17,2,17,13,9,23,27], b=16 (rank32); their held IoCs .0346664073978/.0342775041051. All selected outputs re-encode exactly. Reused original p8–14 is not independent of earlier studies.

Descriptive reference comparison: concatenating all 2,979 solved donor runes in source-section order, all 1,860 sliding 1,120-rune windows have IoC >= **.0594982765224**, and all 1,251 sliding 1,729-rune windows sampled with the identical seven-lane fit mask have IoC >= **.0595046597728**. These overlapping windows include artificial section seams, not independent draws or universal bounds on English. But the exact original maximum is far below either entire finite reference register: every invertible circulant/common bias is excluded if the recovered training histogram must match any such native reference profile. This does not rely on words, singleton labels or shortlist quality. Independent phase offsets (which alter histogram), nonlinear mixing, other plaintext alphabets and other geometries are outside this result.

**Reproduction:** [C++17/OpenMP exhaustive inverse](../sims/lp2_p7_circulant7_ioc_exhaustive.cpp) and [Node CJS source loader](../sims/lp2_p7_circulant7_ioc_input.cjs), [source commit 92d9f3a](https://github.com/FlareZ123/liber-primus/commit/92d9f3a4cbcba728336c63d33316b9744739e9af). Local available Linux GCC14.2, four threads, -O3 -std=c++17 -march=native -fopenmp (AVX2); no Windows/CI execution claimed. Windows g++ with OpenMP may compile the same standard C++ source; AVX2 optional. From repo root: node sims/lp2_p7_circulant7_ioc_input.cjs circulant-inputs.txt; compile the C++ source; run executable with input file, groups or lanes, plant or original. Both loader and C++ assert all ten source tape sizes and FNV checksums. Original corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; donor 1b064ef6d85819b7d96adaff31a82d1ec551598f. Local compiled-source SHA256 3003c7d5a64be7c10bbd232eb4d51c8c7fe576eb22da35ec627022487bced127; remote source checked identical FNV. No unknown plaintext or authentic author key. Retire scalar-bias circulant under the measured native-histogram premise even without word boundaries.

## Source-derived p39 root24 cross-chapter prediction

The **physically last red p8 title rune is GP index17**, and 17²=-1 modulo29. This provides a printed choice of imaginary unit for the p7/p8 norm-one 3–4–5 rotation:

    i=17; z=(3+4i)/5=20; z^5=24; z^7=1  (mod29).
    (8+15i)/17=24=z^5  (mod29).

**Stronger exact full-triad reconstruction:** the *same* p7 fourth red-word product **15** is the vertical component of the printed 8–15–17 triangle. With the earlier p7/p8-derived root24, the canonical monic-linear-factor square scaled by that *source-written* amplitude gives **15(x−24)²=27+5x+15x² mod29**. The untouched, wholly red **p39 triad is exactly [27,5,15]**, all three rune indices in ascending-degree order. Thus the earlier sources generate the **entire** distant red triad using the explicit rule ‘R^5 eigenvalue 24, scale by its y-coordinate15, square (x−24)’. The chosen quadratic-square grammar remains an interpretation discovered retrospectively, so this is a reproducible cross-page relationship rather than a preregistered forecast or established author instruction. The p7 quartic's earlier seven-cycle [5,15,28,9,10,24,7] also reaches24 five steps after state5. These relations are algebraically and source-dependently related; **do not multiply their apparent chances**. **The only other original wholly red three-rune span occurs on p3 at exactly the same within-page rune offset 119 as p39.** It reads [13,23,2]. From earlier p7/p8 sources, z=20 and the fifth red p7 word product=2, a simple **conditional seven-state page phase** is u(page)=z^(2−page), yielding u(3)=16=z⁻¹ and u(39)=24=z⁵. These values are precisely the stationary positions −b/(2a) of the two printed red quadratics. Choosing the source's p7 last product2 as p3's scale and z²=23 as p3's vertex value fully reconstructs **the second distant red triple**, alongside p39's printed triple:

    Q3(x)  =  2(x−16)²+23  = 13+23x+2x² (mod29); p3 red119–121.
    Q39(x) = 15(x−24)²     = 27+ 5x+15x² (mod29); p39 red119–121.

The scales 2 and 15 are literally the fifth and fourth p7 whole-red word products. This is a compact, exact two-original-site **source arithmetic reconstruction**. The algebraic grammar, phase offset, and vertex bias are retrospective choices, and there is no independent third red-triad site to test. They remain **provisional clue candidates**. The manuscript does not command the quadratic-square construction, and no cipher key or plaintext follows from these equalities alone.

**Keyless affine graph relation that does survive the discriminant objection:** a transformation of both polynomial *input and output*, with all three numerical parameters from the p7/p8 source, maps the two **entire** red polynomials exactly:

    z=(3+4*17)/5=20 (mod29)
    h=GP_product(third p7 red word)=8
    v=z²=23
    s=GP_product(fourth red word)/GP_product(fifth red word)=15/2=22
    Q39(x)=s [Q3(x−h)−v] =22[Q3(x−8)−23] (mod29).

This relation holds identically at **all 29 possible input rune values**, checked by the original-input SFT. It uses source products8,15,2 and the p8-selected z²23, with a reversible horizontal shift and a reversible *vertical* scaling/translation. It clarifies that **a graph-affine transformation can map irreducible Q3 to repeated-root Q39** by shifting its vertex value to zero; the no-conjugacy theorem below excludes only changes of the input coordinate with nonzero output scale, without an added output translation. Because the choice of graph-affine grammar was recognized retrospectively and the manuscript does not select a ciphertext register, it remains a **provisional key-relationship clue**. Applying it to an unknown ciphertext would require a separate author-selected operation.

**Decisive separation of these two red forms:** despite the exact source-numeric reconstruction, they do **not** encode one and the same quadratic under a reversible linear or projective page-clock change of variable. The discriminants are Δ3=23²−4×2×13=**19** and Δ39=5²−4×15×27=**0** in GF29. **19 is a quadratic nonresidue**, so Q3 has **no** root in GF29, while Q39 has exactly the repeated root24. Under a nonsingular two-coordinate linear substitution over a field of odd characteristic, the discriminant changes only by a nonzero square factor; vanishing and square classes cannot change. Consequently **all invertible affine, Möbius, and GL2 change-of-variable implementations taking Q3 to a scalar multiple of Q39 are impossible**, irrespective of an unknown page clock or the seventh-root phase. The exact match is a *parameterization of two different red polynomials*, not a single rotating quadratic ciphertext. This prevents a tempting but invalid next cryptanalytic step.

A direct original-cipher two-chapter **shared additive pad cancellation** was checked: inverse seven-point GF29 Fourier on all 1,729 original p8–14 runes using root20 in seven lanes of 247; inverse Fourier on the independent 1,589 original p33(offset91)–39 runes with root24 in seven lanes of227. Subtraction after aligning either the first or last227 columns per botanical lane returns near-uniform GP29 differences: IoC **0.0346343644** for the first alignment and **0.0344615770** for the last. A synthetic shared-pad positive planted in genuine p57 native runes recovers the entire 1,589-rune difference exactly. These are **bounded original shared-pad negatives**, not a rejection of all nonlinear or independently keyed consumers. No unknown plaintext recovered.

Reproduction: [original p7-p8-p39 cross-root SFT](../sims/lp2_p7_p39_root24_crosschapter_original_sft.cjs), read-only Windows11 Node22; [Windows CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45079887123). The separate p39-only Fourier model was already tested in [prior p39 original-source SFT](../sims/lp2_red_root7_fourier_original_inverse.cjs), and is not counted as a new inverse.

## Decision

Retain the **seven-state source-derived cycle** as a serious *provisional operation/key-selection clue*, distinct from the older p7 GF3 242-cycle and the fitted p7 GF4/radix59 255-state pad. A plausible 2014 human path starts with five visibly marked red coefficient words, recognizes p8's red fixed-point outputs, iterates the resulting polynomial, and notices the subsequent seven-page tree section. The strongest weakness is the absence of a printed **iteration, seed, seven-state emission, or butterfly receiver instruction**. The 2|2|1 red sequence and the original printed7 phase yield concrete, discriminating secondary clues, with documented alternatives and direct inverse negatives. Do not promote the seven-cycle to actual encryption or run more unconstrained key phases until the original artwork or archived first-party text selects an operation. The real next decision is whether the manuscript supplies one previously unnoticed seven-element consumer capable of predicting untouched original data.

**Polynomial-cycle reproduction:** [standalone source-exact Windows 11 Node.js22 CommonJS SFT](../sims/lp2_p7_red_polynomial_seven_cycle_original_sft.cjs), including 2,896 original words and ink, all 841 conditional polynomials, exhaustive functional graphs, real 1,717-rune inverse and solved p57 positive. [Successful Windows Actions run 45048275398](https://github.com/FlareZ123/liber-primus/actions/runs/45048275398).
