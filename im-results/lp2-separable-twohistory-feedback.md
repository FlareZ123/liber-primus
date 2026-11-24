# Two-history separable ciphertext-indexed additive feedback (#2644)

Agent46, 2026-11-24. **No unknown plaintext.** Both independently secret native-register control table pairs are recovered exactly. The original prefix-selected key has 112 illegal transitions on the independent chapter. An exact all-key unigram bound is below the transparent-F stationary pad likelihood. The original legal key space is not empty.

## Frozen cipher and input

At each physical rune, let x and y be the immediately previous and second-previous ciphertext values. For a non-F plaintext rune P, C=P+A[x]+B[y] mod29. A literal F emits zero without using the shift; both physical history registers advance on every ciphertext sign. A,B fixed shared 29-vectors; gauge B[0]=0, no interaction table or extra phases. Free initial two-symbol history each chapter. No authenticated source selects this rule. It is a distinct separable extension of #2633.

Use physical **p16–22 (1744 runes)** for fitting, p40–53 (3008) for prediction. The prior #2633 reproducer's X slice actually includes p15 (1903 runes), although its issue calls it p16–22. Here follow #2644's literal p16–22 specification; no invented correction to that earlier experiment. Skip first two physical observations of each chapter in likelihood and interior constraints, because their predecessors are not observed. For each nonzero C in context (x,y), forbid A[x]+B[y]=C; ciphertext zero has two possible preimages, 0 and -s when s=A[x]+B[y]≠0. This accounts for ordinary encrypted zeros and true transparent Fs separately.

## Actual inverse

Train smoothed GP unigram and bigram distributions on the 2,979 authentic solved native runes (section boundaries not crossed for bigrams). For each context and shift s, sum log(29 times the observed-emission probability), marginalizing the two legal plaintext choices at zero; forbid every impossible transition. The objective for all nonzero output events is the finite bipartite modular sum CSP with one weight table per (x,y). For search, use soft penalties for impossible transitions during 48 deterministic Gibbs/coordinate annealing restarts with 56 maximum sweeps each, ending in hard-feasible local optimization. Freeze the best legal training key. No global optimality claim for the heuristic. Held decoding uses exact bigram marginalization/Viterbi over the at-most-two latent F preimages and forward replay, no held key refitting.

Two heldout-source literary GP plants (Shakespeare offset10000, Emerson23000, length2344 each), independently random hidden A/B tables, train on first1744 physical runes. LM contains neither plant donor. Both recover every A and B entry (including the fixed gauge entry): **116/116 displayed entries, 114/114 secret degrees**. Training unigram LLR 749.524649,729.069776 nats; both 600-rune suffixes legal and exact ciphertext replay; Viterbi 592/600,591/600 plaintext runes (17 ambiguity errors). Held marginal bigram LLR +203.992189,+360.343007.

Original p16–22 frozen key is internally legal; training LLR -389.154525 over1742 interior positions versus pad -3.077853. On untouched p40–53 it gives **112 illegal nonzero-output transitions** among3006 interior positions. No legal full continuation exists for this specific key. This is prospective failure of a calibrated heuristic, not proof that every key has 112 conflicts. The unconstrained joint annealer returns all-zero baseline; the exact low-support subfamily search below finds better joint keys, demonstrating the need to separate heuristic results from certificates.

## All-key likelihood upper bound

For joint original interior observations (4748), relax the common A vector across disjoint groups of four B columns. For each group, enumerate all 29^(g-1) relative B assignments (fix one local gauge), intersect rotated forbidden-sum bitmasks for each row, and independently maximize that row's legal unigram likelihood. The maximum over each local assignment is exact; the sum across groups upper-bounds the original shared-key optimum, since group-specific A vectors are more permissive. Repeat transposed, relaxing B across row groups instead. Both orientations cover all keys and allow arbitrary latent zero preimages. No beam or key search cutoff in this bound; it only bounds the specified iid native-emission score.

| Relaxed group size | Columns | Rows |
|---|---:|---:|
| 2 | +655.586608 | not evaluated |
| 3 | +96.128798 | +74.889617 |
| 4 | **-272.288967** | -270.203757 |

Stationary transparent-F pad LLR -3.768159 (uniform non-F shift, same P(F)). Thus every shared legal A/B key scores at least 268.520807 nats below the pad on this fixed iid native model. This is a rigorous objective upper bound up to ordinary floating-point arithmetic, with a large separation; not an all-language theorem, nor a certified upper bound for a higher-order language model.

## Legal-key nonidentifiability, exact finite subfamily

For fixed B, intersect rotated allowed-sum masks to obtain independent A-row domains. Their cardinality product counts legal A assignments exactly. Enumerate all B vectors with B[0]=0 and Hamming support <=2, excluding zero-valued choices in the specified support. For any nonconstant B, every chapter's two free initial registers can make the first two emissions legal: choose x to avoid the second emission's single forbidden value of B[x], then y to avoid the first emission's single forbidden B[y]. For B=0 explicitly constrain the second output's A row, and an observed forced-zero A row makes the first output legal. Thus counted assignments admit full-source replay with some allowed initial history, not just interior feasibility.

| Nonzero B entries | Feasible B patterns | Full legal gauge-fixed table pairs |
|---|---:|---:|
| 0 | 1 | 6,144 |
| 1 | 25 | 46,464 |
| 2 | 221 | 165,864 |
| Total | 247 | **218,472** |

This gives at least 17.737 bits of residual key-choice ambiguity in the full family; does not claim all these keys produce different complete plaintexts or that the full legal space has been counted. Exact best unigram score within this support restriction -3510.917883, well above the all-zero baseline -3936.294477 but still far below the pad. The first-order-only B=0 domain agrees in count with #2633 despite the distinct p16 scope. Allowing all 28 additional B digits beyond the gauge may permit many further legal pairs, but the objective bound applies to them too.

## Decision and reproduction

Retire this exact shared separable additive law for the tested native-emission model and original holdout. More complicated state interactions, alternative source registers, different boundary clocks and higher-order objectives are not mathematically excluded by the unigram certificate; they need an independent selector. No authentic key or plaintext.

[Constructive SFT](../sims/lp2_separable_twohistory_feedback_sft.cjs), [raw plants, fitted keys and heldout](lp2-separable-twohistory-feedback-output.json), commit c2407daf7bae0253e0feb810fcad46d5ab0c9f1d. [Exact block bounds and key count SFT](../sims/lp2_separable_twohistory_exact_bound_sft.cjs), [raw certificate](lp2-separable-twohistory-exact-bound-output.json), commit 35f00b67a4d9f20376d85ea2b1a118a7b7002b4e. All executed on actual repository inputs in connected V8; no Windows Actions execution claimed.
