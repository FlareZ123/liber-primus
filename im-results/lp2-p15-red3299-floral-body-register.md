# P15 red 3299 as a title-stripped floral-register size

**New exact cross-artifact alignment, not yet a decipherment.** The one red numerical cell in p15's original 4×4 Fibonacci-prime spiral is **3299**. Physical LP2 pp40–55 share identical botanical borders across sixteen consecutive pages (including rune-free p50) and contain **3316 original GP29 ciphertext runes**. Two independently visible opening rubrics, **p40 red8** and **p54 red9**, contain **17 runes**. Excluding only those two headings gives **3299 original ciphertext runes**, exactly matching p15's red cell. Red p53's 51-rune terminal text is retained as body.

## Source-bounded scope

The sixteen original page lengths, in source order, are `[231,273,272,274,273,270,270,274,271,66,0,92,263,179,232,76]`, totaling 3316. The 3299 result is **unique among the 41 contiguous sixteen-page windows** in unknown physical pp0–55 when source-visible *page-start* red rubrics are excluded by the same rule; the next closest is 3463 (pp39–54). It is an exact original-source relation with a caveat: p53 ends with red13 and p54 begins a new red title. Thus original source-visible *chapter* boundaries split these sixteen framed pages in two. Joining them depends on their common border, a possible human clue with no explicit authored consumer. The previously documented **3316 = 3301+15** relation, and earlier exploratory 16-p15-cell ↔16-floral-page mapping, are related arithmetic observations, not independent proofs of intent.

Original p15 spiral, established as `|3301 − prime(F+1)|` for sixteen distinct Fibonacci indices:

```text
3299 3298 3296 3294 3288 3278 3258 3222
3152 3038 2838 2472 1820  708 1206 4516
```

## Frozen original-cipher tests

Use exactly the 3299 titleless runes in original page/rune order. With zero-based positional addressing, the sixteen source values reduced modulo3299 select:

```text
0 3298 3296 3294 3288 3278 3258 3222
3152 3038 2838 2472 1820 708 1206 1217
```

These original GP29 runes transliterate **`A-I-B-J-EA-E-EO-Y-O-J-TH-X-U-F-TH-F`**. No readable instruction or plaintext appears from this direct source-number pointer. The original image does not explicitly prescribe that addressing rule.

An independently motivated *complete* permutation uses two facts: **3299 is prime**, and **2 has multiplicative order 3298 modulo3299**. Specifically, 3298 factors as 2×17×97, and `2^(3298/q) mod3299` equals 3298, 1355, 83 for q=2,17,97 respectively. So `[0,1,2,4,...,2^3297 mod3299]` visits all 3299 rune positions exactly once; position0 is handled separately. The initial p15 Fibonacci-indexed prime is 2, and the p15 infinity ornament makes modular cycling a source-plausible exploration. The operation is **hypothetical**, and its inverse provides no historical validation.

Original source-order 3299-runic body has **21 adjacent equal-rune pairs, 814 distinct digraphs, mutual information 0.146249 nats**. The fixed primitive-root permutation has **124 equal pairs, 824 distinct digraphs, MI 0.129298 nats**. Against 3000 deterministic exact-inventory reshuffles, the transformed sequence has **MI upper-tail p=0.368877**, and equal-pair upper-tail **p=0.164945**. This full positional read is ordinary against the matched null and preserves the original near-uniform rune inventory. No native-GP plaintext was recovered.

## Reverse link: *all* floral red runes sum to a second original p15 spiral cell, 3294

The **complete red-ink material within the sixteen flora-framed pp40–55**, as identified independently in the original ink/source images, comprises exactly three and only three contiguous red spans:

| Source span | Red rune count | GP-prime sum |
| --- | ---: | ---: |
| p40 opening rubric (including oversized red F) | **8** | **435** |
| p53 final red stanza | **51** | **2262** |
| p54 opening rubric (including oversized red A) | **9** | **597** |
| **Entire flora register** | **68** | **3294** |

The grand total **3294** is *itself exactly a printed cell* of p15's Fibonacci-indexed-prime square. In the fixed central clockwise spiral, it is the fifth cell (index4, `F=3`), whose established construction is **3294 = 3301 − prime(4) = 3301 − 7**. No glyphs were selected individually after evaluating their prime weights: this sums **every source-red glyph** across the original group of sixteen identically framed pages. The p40 and p54 red headings alone additionally sum 1032=φ(1033), with the intervening p53 red stanza contributing2262.

This makes the p15/floral correspondence **bidirectional using two different independently observable features**: p15's *highlighted red numeral*3299 equals the floral body length after excluding both source-red opening headings; the *complete source-red floral glyph population* has GP-prime sum3294, selecting another unchanged p15 printed numeral. The operator of summing GP rune-prime weights is documented for Cicada's earlier solved magic squares. It provides a candidate **seven** as a next source-derived parameter, but no manuscript instruction specifies what to decrypt with it.

The alignment receives a transparent, source-preserving *post-selection* control. In **200,000** deterministic trials, sample **8** rune positions without replacement from original p40, **51** from p53, and **9** from p54, keeping each page's complete rune inventory fixed; then evaluate the three original claims. The GP-prime total equals **any one of p15's sixteen printed cells** in **2,698** draws, add-one rate **2699/200001 = 0.0134949**; the particular observed 3294 appears **305** times, add-one rate **306/200001 = 0.0015300**. Because the matching cell was discovered after seeing the source red sum, **any of the sixteen** is the more relevant exploratory comparison.

Two related checks can be incorporated without selecting further runes. The p40 eight-rune heading has **both GP index sum and GP-prime sum divisible by29**; only **212/200,000** same-page random assignments share this condition. The combined p40+p54 red heading GP-prime sum equals **φ(1033)=1032** exactly; **151/200,000** random assignments reproduce that value. **Zero** of the 200,000 random assignments simultaneously satisfy all three properties: p40 dual-zero, heading sum1032, and all-red total matching *any* p15 printed cell. The exploratory add-one frequency is **1/200001**; a zero-hit sample gives a conservative rough 95% binomial upper bound around **3/200000 = 1.5×10⁻⁵** for this *exact conditional randomization*.

**Interpretation limitation:** all three relationships were recognized after inspecting extensive original features, and numerous alternative clues and numerical transformations have been explored across this repository. The joint control is therefore **not a globally calibrated probability of design, nor evidence for a unique decoder**. It demonstrates that the three linked original-source relations are unusual under one transparently specified, fixed-inventory, red-position exchangeability model. It is a concrete reason to investigate the bidirectional p15/floral route before generic unrelated keys, while every tested direct original-input cipher remains negative.

## Second p15-specified number: 829 and a 4×829 full-register shape

The source-derived p15 primes associated with consecutive spiral cells **2838** and **2472** are **463** and **829** (these are the 90th and 145th primes; the selected Fibonacci inputs are 89 and 144). The red square cell **3299 is itself the 463rd prime**, and the complete 3316-rune floral register satisfies **3316=4×829**. Thus **two consecutive later p15 primes** can describe distinct aspects of the same register: 463 is the prime rank of the title-stripped length, and 829 is one quarter of the full length. A four-column matrix shape also matches the four columns printed on p15.

In the same 41-window original-source scan, **only pp40–55** has full length equal to four times a prime in the sixteen-element p15 source list, with 829 as that prime. The model remains retrospective: the p15 formula already supplies sixteen prime candidates, and the manuscript does not specifically command the solver to choose 463/829 as a matrix address. These are source-pinned potential design clues, not independent confirmations of a cipher.

Two natural reversible readings of the **full 4×829** ciphertext matrix, row-major→column-major and its inverse, have ordinary digraph structure. Original full-runic source: **21** identical adjacent pairs, **815** distinct GP29 digraphs, empirical digraph MI **0.145038**. Column-first read: **121**, **822**, **0.126074**. Row-first inverse: **119**, **829**, **0.121956**. Both rearrangements reduce local dependence and cannot fix the original near-uniform one-symbol inventory. Their inverses reproduce every original rune. This retires just these direct positional reads as native-GP plaintext, leaving a source-selected *identity-changing* cipher as the missing piece.

## Red-heading sum singles out the other historic Cicada prime, 1033

The p40 eight-rune red opening has exact GP-prime-sum **435** (`2+29+71+103+17+89+101+23`). The p54 nine-rune red opening sums to **597** (`97+71+79+89+107+5+47+31+71`). Their combined **17 GP runes sum 1,032**, which is **φ(1033)** because **1033 is prime**. Both chapter openings are source-selected by the red rubric and original preceding red13 close; this is not an arbitrary subsequence fitted to 1033.

The **two source-delimited floral chapter bodies** have separately fixed lengths **3000** and **299** after their own headings, respectively, whose sum is **3299=3301−2**, the red p15 cell. Consequently the original-source register exposes both historic Cicada magic-square constants through established operations:

- `GP_prime_sum(red p40 opening + red p54 opening) = φ(1033) = 1032`;
- `runes(pp40–53 after red8) + runes(pp54–55 after red9) = 3000 + 299 = 3299 = 3301 − 2`.

A distinct associated relationship is `prime_90=463=π(3299)`, while `prime_145=829=3316/4`. Both primes 463 and 829 are in consecutive positions of the established p15 Fibonacci-indexed-prime spiral. Taken together these are a compact clue chain deserving examination for a **specified next decoding operation**.

**Crucial limitation:** Cicada's 2013/2014 puzzles already foreground 1033, 3301, GP prime sums and totients, so these numbers were natural hypotheses after seeing the pages. The reported equalities establish a mathematical coincidence across independently identified artifacts. They do **not** prove authorial intent or make the p15 body-link a complete solver instruction. The simple p463-prime-totient/column inverses below fail; an independent cipher consumer must still be found.

## Two heading checksum observations over the source GP29 alphabet

An additional, simple source arithmetic check uses the **GP29 index** convention separately from GP prime weights. The source-selected p40 opening 8 runes have index sum **116 = 4×29**, in addition to GP-prime sum **435 = 15×29**. The quotient 4 matches the printed width of p15's 4×4 grid; 15 is the count of rune-bearing physical pages among the sixteen floral-bordered pp40–55 (p50 has only a numeric table). The p40 title is the **only** one of the nine unknown top-level page-start red titles whose two sums are both zero modulo29.

The p15 red nine-rune heading's GP-prime sum is **638 = 22×29**, whereas the red-highlighted p15 number has **3299 mod29 = 22**. The p54 red nine-rune heading has GP index sum **159** and prime sum **597**. The two floral starts retain their independent combined totient relation `435+597=1032=φ(1033)`.

A narrow null gives scale: if each of the eight p40 heading glyphs were sampled independently and uniformly from the actual 29-entry GP alphabet, the **exact** probability that *both* its GP-index and GP-prime sums vanish modulo29 is **0.0008913440106** (computed by eight successive convolutions on the 29×29 residue lattice). This is a fixed-heading baseline only. The research has inspected many page features, numerical constants and transformations, so it **cannot** be used as a familywise probability that the entire correspondence happened by chance. The author supplied no instruction that titles are modular checksums, and the observed alignments do not specify the key or plaintext. Their main value is to make the p15→p40 group a targeted original-source hypothesis instead of a generic permutation search.

## A fully selected modular transposition from the two cross-references: generator 7 modulo 3299

The reciprocal p15/floral alignment now determines **both operands of one complete reversible mathematical permutation from original visible clues**. The highlighted p15 **3299** equals the title-stripped floral ciphertext length, and the source-red floral GP-prime sum **3294** selects its matching unchanged p15 square cell, whose proven inverse construction is **3301−3294 = 7**. Since **3299 is prime and 7 is a primitive root modulo3299**, the operation

```text
position order = [0, 7^0 mod3299, 7^1 mod3299, ...,
                  7^3297 mod3299]
               = [0, 1, 7, 49, 343, 2401, 312, 2184, ...]
```

reads **every one of the 3,299 original body runes exactly once**, and its inverse exactly restores all rune positions. The proof checks that the order of7 is3298, since `3298=2×17×97`. This is a distinct, clue-constrained transposition from the earlier exploratory use of2. The p15 infinity ornament could suggest a modular cycle, but **neither a generator operation nor the treatment of the zero position is specified by a surviving Cicada instruction**. Being a generator is itself common: **φ(3298)/3298 = 1536/3298 ≈46.57%** of nonzero residues modulo3299 are primitive roots, so primitivity adds little independent probability evidence.

**Direct original-cipher read:** the first original GP29 tokens are `A-P-O-B-B-E-OE-NG-L-W-L-D-TH-M-AE-Y-TH-C-A-IA`. Adjacent original repeated pairs rise from **21** in physical body order to **103** in the proposed 7-power order, and distinct digraphs rise from **814** to **825**. Its empirical digraph MI is **0.1306846154 nats**, ordinary relative to **5,000** seeded fixed-inventory null permutations (**upper-tail p=0.2909418**); equal-pair upper-tail **p=0.8612278**. The direct permutation preserves flat GP rune unigram counts exactly and produces no native-GP plaintext.

**Two source-selected identity-changing follow-ups:** compose the 7-power ordering or its inverse with Cicada's genuinely solved-page **prime-totient GP29 inverse**, starting the clock either at **prime4=7** from the 3294 selector or at **prime463=3299** from the 3299 rank. Test both signs and both layer orders, with no phases or F-skip adjustment. All **16** source-frozen candidates yield GP29 IoCs **0.0344412212–0.0345649333**, far below the solved p57 reference **0.0627099664**. Every model round-trips the exact original **3299/3299** runes and exactly recovers full-length known source-native GP plants under its matching cipher. **No plaintext, key or final route emerges from these direct consumers.** The 7-power permutation remains an exact *clue-derived candidate* pending an independently indicated cipher layer or plaintext prediction.

## Source-number 7: historical seven-rune row operation and solved-page totient inverse

The all-floral red GP-prime sum3294 finds p15's original cell `3294=3301−prime(4)`, thus **7** without free key choice. In the 2014 Cicada fourth-onion stage, an actual **period-seven row permutation** with original order **[0,6,2,5,1,4,3]** decodes the historical phrase beginning `TOBELIE...`; a regression reconstructs the genuine row `TLBEIEO→TOBELIE`. The solved p56 separately authenticates subtraction of consecutive prime totients modulo29, without instructing transferring this operation to floral pages.

A finite full-width test combines only those historical operations on the **3299-rune titleless pp40–55 register**: period-seven row order, its inverse, and identity control, preserving the final two-row-tail glyphs; apply prime-totient GP29 addition/subtraction starting at **prime4=7**, before or after the row permutation. The complete registered family is **12** original-cipher inverses, with duplicated identity controls, no fitted phase/key and no unauthorized literal-F skips.

All decoded GP29 IoCs remain noise-like, **0.0343474721–0.0345355218**; the original body is **0.0344649342**, uniform 29-symbol baseline **0.0344827586**, and solved p57 **0.0627099664**. Every compound decoder exactly re-encrypts all **3299 original ciphertext** runes and exactly recovers a full-length independently planted native-GP passage. **No unknown plaintext is recovered; this retires the fixed seven-row+prime7-totient transfer.** The red3294 ↔ p15 relationship remains a source-selected potential marker without an authenticated consumer.

## Source-fixed prime-totient plus 4×829 compound gate

The original p15 red3299 is the **463rd prime**, and the next prime is Cicada's 3301. The solved LP2 p56 provides a genuine identity-changing GP29 inverse, subtraction of consecutive prime totients. One compact candidate combines only these source objects: begin the p56 prime-totient clock at **p463=3299**, consume each of the **3316** floral ciphertext symbols with no F skips, and optionally invert one of the two natural 4×829 row/column reading orders. To avoid guessing the layer order after seeing the output, freeze **both** possible orders between transposition and the additive cipher, both signs, plus the no-transpose baseline: **10** original-input decodings total. Do not add phase/window/key searches.

The original floral source IoC is **0.034462826608**. All ten decoded candidates remain noise-like, with GP29 IoCs **0.034360393503–0.034593096773**; the independently solved original p57 native text has IoC **0.062709966405**. Each compound model exactly re-encrypts the original **3316/3316** ciphertext, and an independent source-native plaintext plant made from solved p57 runes is fully recovered. Exact re-encryption is only an implementation invariant because every incorrect bijective key would also round-trip. **No original unknown-page plaintext or authentic key** is recovered.

This retires this particular source-fixed p463 prime-totient transfer and the two natural 4×829 column reads as a direct original GP29-English decoder. It cannot exclude a different, independently instructed consumer for the 3299/463/829 relations.

## Direct p15 4×4 Hill key on the independently fitted 4×829 register

The preceding full-register divisibility makes the **literal printed p15 4×4 numerical square** a particularly direct Hill key candidate for exactly **829 consecutive 4-rune blocks** across the full pp40–55 floral register, including the two red titles. This is a different target from the already documented [whole-LP2 Hill4 negative](fibonacci-square-hill4-gate.md). Reduce the original printed square modulo29, and test exactly the matrix and its inverse under row-vector and column-vector conventions: **four** original-cipher decodings, no page-specific fitting, number reordering or arbitrary key.

Their GP29 IoCs are **0.03442116199**, **0.03461329229**, **0.03443189654**, **0.03445609477**. None approaches the independently solved p57 source reference **0.06270996641**, and the GP transliterations are nonlinguistic. Each candidate round-trips all **3316 original runes**, with an independent source-native planted inverse passing at full length.

**Decision:** the strongest obvious original clue-path `p15 printed 4×4 square → floral ciphertext 4×829 → direct Hill4` does not yield native GP plaintext. Its exact source alignment merits retention; the *linear Hill4 consumer* is rejected rather than expanded into fitted orientations or undocumented layers.

## Decision

Retain the **bidirectional original p15/floral relationships (red3299 ↔ titleless floral body3299; all floral red GP-prime sum3294 ↔ another unchanged p15 grid cell)**, the two red heading sums **435+597=φ(1033)**, and the adjacent p15 prime relations **463=π(3299)** and **4×829=3316**, as potential original scope/matrix selectors. Reject only the tested direct 16-address read, source-motivated primitive-root transposition, two natural 4×829 columnar readings, and the source-pinned 4×4 Hill inverse as plaintext-producing operations. The tested source-fixed prime-totient inverses, including the red3294-selected historical period-seven and power-seven modular compositions, are negative. Further work requires an *independently source-selected* alternative operation or a genuine original plaintext prediction. Avoid unsourced modulus-multiplier, phase, or stream-key shopping.

**Exact single runnable test file:** [`sims/lp2_p15_red3299_floral_register_sft.cjs`](../sims/lp2_p15_red3299_floral_register_sft.cjs). It reads `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-ink-annotations.json`, rederives 3299 uniqueness, checks the full p15 mathematical formula, proves exact permutation, reproduces direct readout and 3000 null draws.

Earlier distinct results: [original p15 formula](../results/lp2-p15-fibonacci-prime-spiral.md), [16 p15 pagewise prime-totient keys negative](lp2-p15-16value-to-floral16-prime-totient-gate.md), [source-visible chapter boundary atlas](lp2-global-original-visual-section-map.md).
