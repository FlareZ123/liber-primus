# Original 28-page bookend as an arbitrary nonperiodic repeated-key attack

**Agent 12, 18 November 2026. Exact original-cipher equality invariant plus source-native language controls and encrypted positive plants. No unknown LP2 plaintext or secret key recovered.**

## Source-visible path to the proposed cipher

LP2 has 56 unsolved physical pages p0–p55, with one runeless numeric-grid p50. Splitting these 56 into two halves, p0–27 and p28–55, pairs p with p+28. Within this structure a unique independently observed **six-rune exact ciphertext echo**, \`DJU-BEI\`, occurs at **p27 local28–33** and **p55 local70–75**. The two echoes occupy corresponding terminal pages of the halves at a relative displacement **+42**. The manuscript itself never explicitly says these halves share an additive key or that the marked echo fixes all page offsets; both are competing hypotheses. An independent source-based study already excluded arbitrary *stationary page-pair substitution* against GP-native prose ([existing 28-page gate](../im-results/lp2-two28-bookend-substitution-invariants.md)). This new test addresses the different and much more flexible family of a secret nonperiodic *position-specific pad* reused exactly across each physically paired page.

## Reversible cipher family and key-independent original-input invariant

For every physical pair \`(p,p+28)\`, each position \`i\` may have an **unrestricted, independent 29-valued key \`K[p,i]\`**, with no periodicity, reuse across different page pairs, prime assumption, or constrained pseudorandom generator. The two corresponding plaintext runes \`P[p,i]\` and \`P[p+28,i+δ]\` are emitted as
\`C[p,i]=(P[p,i]+K[p,i]) mod29\` and
\`C[p+28,i+δ]=(P[p+28,i+δ]+K[p,i]) mod29\`.
Other unpaired positions use arbitrary independent keys.

These equations give **\`C[p,i]=C[p+28,i+δ] iff P[p,i]=P[p+28,i+δ]\`**. The complete residue difference, not merely equality, is also invariant:
\`(C[p,i]-C[p+28,i+δ]) mod29=(P[p,i]-P[p+28,i+δ]) mod29\`.
This holds for *every possible secret pad value* and permits exact encryption and decryption once the key is supplied. It therefore rejects the fixed alignment without fitting or guessing any of the roughly 5,000–6,000 private key values.

Two frozen source-geometry alignments are evaluated:

1. \`δ=0\`, the natural page-local position reuse under the physical 28+28 split, on every eligible pair of runes.
2. \`δ=+42\`, the position displacement selected by the p27/p55 six-rune echo. The **six echo glyphs p27 local28–33** are explicitly **excluded** from the inference, leaving a separate test of the remaining pages, so the observed copied marker does not trivially force matches.

All **12,956 authentic ciphertext runes** from \`resources/liber-primus/lp2-corpus.json\` are preserved. Page-local indices start at zero, pages are not resegmented, p50 remains an empty rune page, and the original complete-word and page breaks remain as they were.

## Exact original input compared with genuine GP29 native-language controls

| Fixed page-pair alignment | Compared original positions | Identical ciphertext pairs | Original equality | Minimum genuine-English equality among 20 controls |
|---|---:|---:|---:|---:|
| Same offset, δ=0 | 5,663 | 195 | 0.03443405 | 0.05509447 |
| Six-rune-marker displacement, δ=42, excluding that marker | 4,815 | 151 | 0.03136033 | 0.05441329 |

The control register is **20 complete, disjoint, sequential 12,956-GP-rune windows** of first-party-corpus-sized Shakespeare (16 windows) and Kahlil Gibran (four windows), historically established GP29 encoding: \`ING→NG, IO→IA\`, and the canonical 29-rune transliterations. The controls are split into the exact original 56 physical page lengths before pairwise comparison. Their 20 δ=0 equality counts range approximately **312–375** against original **195**; even the least-repetitive native-GP control has **over one hundred more** exact equalities. The δ=42 controls also all greatly exceed the source. No control matches or undercuts either original equality count.

**Real encipherment positive control:** A heldout source-native 12,956-rune Shakespeare plant is encrypted with a freshly generated **different random nonperiodic 29-valued key for every local position in every page pair**, with exact reuse on paired positions and independent keys everywhere else. Both δ=0 and δ=42 plants preserve **all** original plaintext pair equality counts on their corresponding ciphertext, position for position, while changing the rune content. This confirms that the test does not accidentally reject a genuine version of its declared cipher. No key search, dictionary fitting or post hoc local exceptions occur.


## Stronger reflected-sign candidate: no key search, one half withheld

A mirrored-book hypothesis can evade the simpler equality test: the source-visible 28+28 division may encode each second page with **negative plaintext sign** while retaining its additive page-pair keystream, so \`C[p,i]=P[p,i]+K[p,i]\` and \`C[p+28,i+δ]=s[p]·P[p+28,i+δ]+K[p,i]\`, where **every page pair has its own freely chosen sign \`s[p]∈{+1,−1}\`** and every position has its own arbitrary secret \`K[p,i]\`. The key still cancels from the exact observed difference \`D=C[p,i]-C[p+28,i+δ]\`, leaving \`D=P[p,i]-s[p]P[p+28,i+δ]\`. Therefore the two possible plaintext witnesses are a **difference** of two native GP runes or a **sum** of two native GP runes. This covers **all 2²⁷** independent signs across the 27 nonempty physical page pairs without enumerating or fitting even one keystream symbol.

Estimate a pre-fixed native GP29 rune frequency \`f\` from the **entire** Shakespeare and Gibran source controls, with one pseudocount per rune. The two exact 29-residue distributions are \`q_diff(d)=∑_x f(x)f(x-d)\` and \`q_sum(d)=∑_x f(x)f(d-x)\`. For each original page pair, choose the better of these two distributions on only its **first ⌊n/2⌋ aligned original differences**; freeze its sign and score the **remaining unseen differences** by \`∑log(29q(D))\` against uniform 1/29. This is a genuinely key-independent **blind within-pair holdout**, with the two physical alignments δ=0 and source-echo δ=+42 fixed before scoring. The +42 alignment still omits the original six-rune copied marker. Complete-source post-selection of 2²⁷ unknown signs is also reportable by summing the better of both sign likelihoods *per pair*, though it is less honest than the blind holdout.

| Readout, pairwise sign chosen on training half | Original second-half log score against uniform | Minimum among 20 native-GP secret-pad controls | Minimum among 20 native-GP **alternating-sign** secret-pad controls |
|---|---:|---:|---:|
| δ=0, all 27 page pairs | **−32.793** | **+23.489** | **+16.196** |
| δ=+42, original six-rune echo withheld | **−49.164** | **+5.121** | **+18.467** |

Every one of the 20 independent 12,956-GP-rune control windows **passes with a positive heldout score** when encrypted under actual arbitrary nonperiodic shared random pads, both with positive signs throughout and with a fixed mixture of positive and negative signs on alternating page pairs. The original ciphertext remains negative for both physically available alignments, even with each of its 27 signs chosen from a real training half. The original *full-sample oracle* optimum over 2²⁷ sign configurations also has negative log score, **−48.758** for δ0 and **−66.654** for δ42. These are exact finite scoring results for this fixed native-GP likelihood model; neither a general p-value nor a proof that every possible English corpus has the same expected rune frequencies. They strengthen the previous direct-equality failure by covering an author-plausible mirrored-signed counterpart with no key-search dimension.

The alternation used in the **positive controls** is a planted scenario to demonstrate sensitivity to a real mixture of signs; no source selects alternating signs in the original. The original sign choice in each pair is individually optimized using only the training half, with no source-imposed parity or secret-key limit. This also makes clear why merely selecting whichever sign looks better on a short original sample does not authenticate a key.

## Decision

For either literal page-local pair alignment \`δ=0\` or echo-aligned \`δ=42\`, an arbitrary GP29 additive one-time pad reused across all p,p+28 paired pages **cannot restore the source-native GP English coincidence rates seen in all twenty exact page-length-matched complete control books**. The mismatch is independent of all reused key values for the explicitly tested direct +/- encoding rules. These two natural original-image layouts thus give **no actionable reuse-based recovery of unknown plaintext** and should not attract brute force over the secret pad.

This is an empirical native-register exclusion, **not an absolute mathematical proof that no conceivable English text could produce the observed low equality**. Reversed page orientation, different page pairing, an independently selected varying offset, changes to word/layout geometry, additional nonlinear processing after/before a reused pad, other plaintext registers, or creator-selected non-English markup remain possible. A literal source clue for such an alteration is needed before testing an enlarged alignment menu. The echo itself remains a genuine unique original ciphertext feature, not a recovered plaintext or decryption operation.

**Reproduce:** [single-file Windows 11 / Node.js 22 CommonJS source-exact SFT](../sims/lp2_two28_nonperiodic_reusedpad_original_sft.cjs) with all pagewise counts, complete control windows, synthetic reversible shared-pad plants, independently sign-inverted secret-pad plants, training-half-selected blind heldout score and asserted original 5,663/195 and 4,815/151 invariants. The original pairwise equality counts and control minima were independently computed directly from GitHub's shared corpus and GP-native reference texts before the script was written. All original-count, blind sign-fit, 20 native control and planted reversible-pad assertions passed under **Node.js 22 in [GitHub Actions run 44216275066](https://github.com/FlareZ123/liber-primus/actions/runs/44216275066)** (18 November 2026). The temporary one-shot CI workflow was subsequently retired; the durable SFT remains at the linked source path.
