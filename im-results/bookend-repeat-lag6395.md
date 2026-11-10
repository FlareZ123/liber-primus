# LP2 bookend ciphertext echo: 6,395-rune global pad reuse is unsupported

**Agent 43, 2026-11-10. Evidence class:** tested, specifically bounded **conditional negative**, including an authentic-cipher alignment, an 812-candidate affine pad search with frozen holdout, an output-alphabet-invariant test, and independently calibrated positive controls. No new plaintext, key or destination was recovered.

## Six repeated glyphs and the unseen prediction

The genuine two-word ciphertext phrase **ᛞᛄᚢ-ᛒᛖᛁ** appears at global zero-based unresolved rune positions **6555–6560** (physical LP2 page 27, archive 44.jpg) and **12950–12955** (physical page 55, archive 72.jpg). Their exact displacement is **6395 runes**. These six selected matching glyphs are deliberately excluded from all results below.

The full unknown-cipher stream contains 12,956 GP-index runes. The untouched alignment comprises **6,555 pairs** of positions (i, i+6395) with i from 0 through 6554. Only **193/6555 = 0.0294432** are equal, and the largest of the 29 modular difference bins contains **263** pairs. That is much less shared structure than one would expect if a 6,395-rune pad recurred over an English-like GP plaintext.

As an initial positive, independently sourced contiguous GP-English segments were encrypted with a random truly repeated 6,395-rune additive pad. To reproduce the source's unusual ciphertext doublet scarcity, 81% of adjacent raw ciphertext collisions were overwritten with a uniformly different rune. Across 400 independent samples per author, mean aligned-equality counts were **384.56** (Shakespeare), **390.02** (Gibran), **400.17** (Emerson), with minima **318**, **353**, **353**. None approached the actual 193, while the planted doublet counts averaged about 84–86, comparable to the manuscript's 86. These are model-specific source-register controls, not cryptographic proofs against arbitrary keys.

## Recovering an affine key relation if one exists

Consider all **812** explicitly invertible synchronized key relations

\[
C_i=P_i+K_i\pmod{29},\qquad K_{i+6395}=aK_i+b\pmod{29},
\quad a\in\{1,\ldots,28\},\ b\in\{0,\ldots,28\}.
\]

The keystream cancels in the directly observed difference

\[
C_{i+6395}-aC_i=P_{i+6395}-aP_i+b\pmod{29}.
\]

For each a, compute the 29-value expected difference distribution from independently sourced Shakespeare GP-English unigram frequencies (pseudocount 0.5). Choose a,b maximizing the log-likelihood ratio against uniform from the **first 3,277 unseen ciphertext pairs only**. Lock those parameters before testing the remaining **3,278 held-out pairs**.

- Original ciphertext winner: a=6, b=15; training logLR **-0.00213040 per rune**, frozen holdout **-0.00547071 per rune**, both against a zero-score uniform baseline. No evidence for an English-language affine recurrence.
- Matched null: 500 far-offset circular alignments of the unchanged manuscript, retaining every actual glyph and its no-repeat structure. All 812 possibilities were reselected on each training half. **143/500** nulls scored at least as well in the frozen holdout, corrected p **0.28743**.
- Authentic-register planted ciphers: three independent English corpora × keys (a,b)=(1,0),(6,15),(27,24) × 40 plants each, with exact affine key recurrence and 81% collision repair. True affine keys were recovered **352/360** times; all **360** positive heldout scores beat the real manuscript. Mean planted doublet counts were close to 86.

**Source:** [sims/longlag_affine_key_holdout.cjs](../sims/longlag_affine_key_holdout.cjs). Exact successful [on-demand GitHub Actions run 42760010795](https://github.com/FlareZ123/liber-primus/actions/runs/42760010795), Node.js 22, rotation seed 0x430f6395.

## No dependence under unknown alphabet permutations

A stronger necessary-condition test removes the assumption that both compared fragments expose the same fixed rune alphabet: their 29×29 joint-table mutual information is invariant under **independent arbitrary bijective relabeling** of the two streams. A synchronized random additive pad on English-like GP symbols should induce measurable dependence even after distinct unknown outer symbol permutations.

- Original ciphertext, **6,555 pairs** with the six discovery positions excluded: mutual information **0.0627778074 nats**.
- **1,000** seeded long-distance circular-alignment nulls: mean **0.0615992351**, SD **0.0030215081 nats**, with **340/1000** at least as high as original, upper p **0.34066**.
- **1,200** independent *known-reused-pad* English GP plants after 81% adjacent-repeat repair and distinct randomly chosen 29-symbol output permutations for both streams: mean MI **0.0812116** Shakespeare, **0.0821808** Gibran, **0.0842814** Emerson; minimum respective MI **0.0679154**, **0.0711153**, **0.0734584**. **0/1200** plants had MI as low as the original ciphertext. Each of 1,200 controls numerically confirmed invariance under its independently chosen permutations. Doublet means were **84.33**, **84.36**, **85.45**.
- GP-English theoretical relative-entropy excess in the ideal repeated-random-pad model is about **0.0212 nats**; the measured plants show the same positive information even with adjacent-repetition correction.

**Source:** [sims/longlag_label_invariant_mi.cjs](../sims/longlag_label_invariant_mi.cjs). Exact successful [on-demand Actions run 42760368027](https://github.com/FlareZ123/liber-primus/actions/runs/42760368027), Node.js 22, null seed 0xf00d3301.

## Consequences

The genuine six-rune phrase is an unusual, real **bookend ciphertext duplication**. The independently unseen 6,555 aligned glyph pairs carry **no detected global 6395-step repeated-pad signal**, even under the tested affine family or two independent fixed output-label permutations. The repeated phrase cannot responsibly be promoted to a global key period or plaintext crib on this evidence.

The attack requires a synchronized recurrence over thousands of positions, the declared GP-English plaintext register, and a stable relation across each compared stream. **A six-rune-only copied ciphertext, localized pad reuse near the phrase, position-dependent skip operations, nonlinear or repeatedly resetting state, an intermediate non-English code, different mappings changing inside one stream, and external dependencies remain open.** The absence of a match here is not a proof that all possible forms of key reuse are impossible.

The most useful continuation is a constrained source-derived *local* marker or key-reset mechanism that predicts new, unfitted runes. Another large search at this unchanged period without a new cipher rule would merely reproduce the bounded negative.
