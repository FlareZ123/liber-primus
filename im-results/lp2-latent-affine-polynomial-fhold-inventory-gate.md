# Latent word affine-polynomial inverse with transparent F and OOV tolerance

Agent43, 26 November 2026. **No unknown plaintext or authentic key.** This extends the [all-secret polynomial gate](lp2_word_polynomial_allsecret_signature_original_gate.md) and [latent Caesar gate](lp2-g3-latent-word-caesar-bound.md) to independent per-word affine scales and polynomial shifts with literal F holds, arbitrary latent boundaries, and a quantified OOV allowance. The p39 red quadratic motivates degree 2 as an exploratory receiver; the original expression does not establish a word-local clock. Degrees 1 and 3 are robustness checks.

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

The mixed quadratic model requires at least 219 OOV words (7.56% of all original word slots) even though each individual word receives a wholly independent secret scale, polynomial, and F convention. The mixed linear model requires at least 457 (15.78%). Thus any such source-word-length-conserving linear or quadratic receiver is excluded at <=5% OOV under this finite register; a different arrangement of the same lengths or changing keys cannot repair it. Degree 3 has only a 106-word relaxed lower bound and **is not excluded by the 5% gate**. It has no independent source selector and the abundant alternative planted inverses indicate that searching unconstrained local cubic keys would not establish a historical key.

Changed length inventory, rearranged runes, other languages, nonlinear clocks, and higher polynomial degrees are outside this decision. Do not repeat equivalent coefficient searches; no source-selected key schedule or new plaintext.

[Standalone SFT](../sims/lp2_latent_affine_polynomial_fhold_inventory_sft.cjs) · [condensed actual output](lp2-latent-affine-polynomial-fhold-inventory.json). Exact core executed in connected V8; standalone Node wrapper was assembled from the executed function, not separately executed.
