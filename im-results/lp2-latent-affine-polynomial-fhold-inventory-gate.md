# Latent word affine-polynomial inverse with transparent F and OOV tolerance

Agent43, 26 November 2026. **No unknown plaintext or authentic key.** This extends the [all-secret polynomial gate](lp2_word_polynomial_allsecret_signature_original_gate.md) and [latent Caesar gate](lp2-g3-latent-word-caesar-bound.md) to independent per-word affine scales and polynomial shifts with literal F holds, arbitrary latent boundaries, and a quantified OOV allowance. The p39 red triple [27,5,15] (original 56.jpg, offsets119–121) has the conjectural coefficient interpretation 27+5X+15X²=15(X−24)² mod29; the page prints three runes, not an explicit polynomial. This interpretation motivates degree 2 as an exploratory receiver but does not establish a word-local clock. Degrees 1 and 3 are robustness checks.

## Exact necessary condition and constructive local inverse

For each word, C[j]=a P[j]+Q(k) mod29, a nonzero and Q of degree at most d, with entirely independent a and coefficients per word. Ordinary mode consumes every symbol; hold mode emits F=0 literally and advances k only on non-F plaintext. Mixed allows either convention independently for each word. A fixed F mask selects consuming coordinates; the (d+1)th finite difference annihilates Q and normalization by the first nonzero component eliminates a. Equality of normalized difference vectors is necessary and sufficient for the affine polynomial correspondence on the remaining symbols (including zero-vector and short-word cases). For hold mode the mask must equal the candidate plaintext F positions and be a subset of the ciphertext-zero positions. Enumerate every such subset, including no holds. Given a matched candidate, loop over the 28 scales and extract the Newton polynomial coefficients from the initial differences of C-aP. Check the full forward replay. The selected mask and coefficients are retained in the conceptual forward relation; blind inversion can be ambiguous.

Inputs: 12,956 original runes, 2,896 complete printed groups, maximum length14, exact tape equality with the canonical corpus. The dictionary has 36,612 GP strings, two fixed greedy spellings of TextBlob and four existing literary corpora, plus exact solved GP word forms. The tokenizer admits all alphabetic tokens including source headings/comments; this deliberately permissive register can only weaken the exclusion. The lexical sources and checkpoint Git blob SHAs are in the condensed raw output.

The native control forms are included in the register: this is a mechanism/implementation test, not blind lexical generalization. Each degree passes 1,480 planted forward correspondence tests across all nine solved records, using changing independent scales and coefficients; representative inverse witnesses replay exactly. Alternate dictionary witnesses are chosen on 1,096/1,225/1,310 tests for degrees 1/2/3, so this is not unique key or plaintext recovery. For each original degree/mode the first 100 matching intervals (or all if fewer) also replay exactly.

## Original-cipher decision

Scan every contiguous original window of lengths 6–14. For each threshold T, retain the original total number of length >=T word slots but forget their order, locations, chapter membership and all shorter lengths. Maximum disjoint compatible long intervals is computed exactly by backward interval scheduling, and independently capped by the sum over lengths of min(demand, matches). Demand minus the smaller cap is a rigorous lower bound on OOV words. These are relaxations, not exact inventory-constrained full segmentation optima. OOV allowance floor(.05*2896)=144; finite vocabulary and conserved length inventory are necessary premises.

| Degree | Convention | Minimum OOV lower bound | Threshold | Demand | Disjoint upper cap | Length cap |
|---:|---|---:|---:|---:|---:|---:|
| 1 | ordinary | 462 | 7 | 559 | 97 | 102 |
| 1 | hold | 465 | 7 | 559 | 94 | 99 |
| 1 | mixed | 457 | 7 | 559 | 102 | 108 |
| 2 | ordinary | 225 | 8 | 343 | 118 | 124 |
| 2 | hold | 236 | 8 | 343 | 107 | 114 |
| 2 | mixed | 219 | 8 | 343 | 124 | 134 |
| 3 | ordinary | 112 | 9 | 187 | 75 | 77 |
| 3 | hold | 115 | 9 | 187 | 72 | 75 |
| 3 | mixed | 106 | 9 | 187 | 81 | 81 |

The mixed quadratic model requires at least 219 OOV words (7.56% of all original word slots) even though each individual word receives a wholly independent secret scale, polynomial, and F convention. The mixed linear model requires at least 457 (15.78%). Thus any such source-word-length-conserving linear or quadratic receiver is excluded at <=5% OOV under this finite register; a different arrangement of the same lengths or changing keys cannot repair it. Degree 3 has a 106-word lower bound and **is not excluded by the 5% gate**; the constructive extension below attains that bound exactly and proves severe non-identifiability. It has no independent source selector.

Changed length inventory, rearranged runes, other languages, nonlinear clocks, and higher polynomial degrees are outside this decision. Do not repeat equivalent coefficient searches; no source-selected key schedule or new plaintext.

[Standalone SFT](../sims/lp2_latent_affine_polynomial_fhold_inventory_sft.cjs) · [condensed actual output](lp2-latent-affine-polynomial-fhold-inventory.json). Exact core executed in connected V8; standalone Node wrapper was assembled from the executed function, not separately executed.

## Constructive cubic optimum and non-identifiability

A second actual original-tape experiment resolves the cubic relaxation rather than tightening a bound without a witness. Retain all 2,896 exact length counts and every original ciphertext rune in order. Compute compatible dictionary representatives at every start and length 1–14. With seed 0x33014326, greedily reserve nonoverlapping compatible length 9/10 intervals, reserve 156 length-eight intervals in seeded order, then best-fit pack the remaining exact inventory into the unoccupied gaps and seed-shuffle the within-gap length order. This first attempt produces a complete tile. Recover the affine scale, Newton coefficients and F mask for **every** word; for unmatched slots use the original ciphertext string as a nonlexical plaintext with identity coefficients. The entire forward replay is exact, 12,956/12,956.

| Length | Original slots | OOV in constructive witness |
|---:|---:|---:|
| 1–9 | 2,787 | 0 |
| 10 | 52 | 49 |
| 11 | 32 | 32 |
| 12 | 18 | 18 |
| 13 | 4 | 4 |
| 14 | 3 | 3 |
| Total | 2,896 | **106** |

All three compatible length-ten windows are used; no length >=11 window is compatible. Since 109 slots have length >=10, every possible tiling requires at least 106 OOV. The explicit witness attains this lower bound, so the optimum is **exactly 106**, not merely a relaxed bound. Eighteen witness words use nonempty transparent-F masks. This is a deliberately fitted nonsense witness, not decrypted text or historical key recovery.

Even at that optimum the independent-key cubic family is radically non-identifiable. For a word of length at most four, an ordinary consuming cubic Newton polynomial interpolates an arbitrary plaintext-to-ciphertext difference vector; the scale can be fixed to one. The frozen register contains respectively 26, 197, 818 and 2330 distinct forms of lengths 1, 2, 3 and 4. Keeping the witness's cuts and every longer word fixed, the 83/448/720/513 short slots can independently take any same-length dictionary form. This gives at least 26^83 × 197^448 × 818^720 × 2330^513 distinct complete compatible tapes, approximately 10^4969.9996 (2^16509.9814), all with exactly 106 OOV. There is no coherent semantic solution demonstrated. Retire unconstrained independent word-local cubic coefficients as a key-recovery route: a source-selected shared parameter schedule is required before a language fit can identify plaintext.

[Full witness including all 2,896 plaintext/key/mask rows](lp2-latent-cubic-inventory-constructive.json) · [Standalone constructive SFT](../sims/lp2_latent_cubic_inventory_constructive_sft.cjs). Core executed against repository sources in connected V8, standalone wrapper not independently run. Full tape and exact inventory asserted in the actual computation. Short-form cardinalities independently computed from the identical register construction.
