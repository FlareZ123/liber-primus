# Native absolute prime clock with arbitrary complete-clause reordering

## Director #2792 — disposition

No new plaintext, key, or clause order. Language-free reachability and exact interval tiling are feasible, so neither supplies an impossibility proof. However, the order is nonidentifiable and an exact all-origin spacing-free inverse of the most tightly constrained original clause produces only nonprose, substantially below native controls. Retire this specific receiver as an active route unless an independent source-derived order/origin selector emerges. This does not disprove arbitrary clause shuffling under other clocks or arbitrary languages.

## Scope and exact stage 1

Using the corrected image transcription and audited punctuation identity ledger, preserve only complete four-dot-to-four-dot spans lying inside one of the eight visual chapters. This gives 118 spans, without any word-boundary assumption. The native p56 cipher uses the prime residue (prime[j]-1) modulo 29 and a literal F that emits F without advancing. For both global signs s=+1 and -1, and all origins j=0..16257 inclusive (3301 plus the full 12956-rune tape), each ciphertext rune c has two possible transitions: hold if c=0; otherwise or alternatively consume if (c-s*(prime[j]-1)) mod 29 is nonzero. This recovers p56 85/85 with 84 consumed key values. Backward exact bitsets give all legal origins for each span; all 118 spans have nonempty origin sets under both signs. The minimum domain is the p27–32 span [7153,7447), length 294, eight visible F: 39 positive and 22 negative origins. Thus the cheap gate does not reject the receiver.

## Stage 2: actual contiguous tiling, not a count surrogate

The six adjacent audited spans in p23–26 occupy original offsets 5842,5870,5907,6028,6183,6339,6456 (614 runes). For each span, construct exact start bitsets separately for each possible advance d (length minus literal holds), and propagate an entering set S by union of (S & edgeMask[d]) shifted d. Test all 720 permutations. There is no padding or gap between spans. Exact replay witnesses are retained in the output.

| Scope | Positive feasible orders | Negative feasible orders | Positive order/end pairs | Negative order/end pairs |
|---|---:|---:|---:|---:|
| All absolute origins |333|234|888|520|
| Conditional block origin 5632..9143 |124|55|257|98|

The tighter bound assumes the block remains after the preceding 5842 original runes, which include 210 visible F; preceding material is otherwise unconstrained, with initial origin 0..3301. This is an optional stronger condition, not a universal bound for arbitrary cross-block permutation. For example, positive order [0,1,2,5,4,3] has cursor witness [5844,5870,5907,6027,6141,6294,6443]; a distinct positive order [0,1,3,2,5,4] has [5691,5719,5756,5907,6027,6141,6294]. Both replay exactly; neither is a source-selected order. The large residual order sets prevent a defensible fitted-order/withheld-span claim.

## Stage 3: strongest clause, unconditional exact inverse

Select the original 294-rune span solely by its smallest language-free origin domain, before language scoring. Maximize over every legal origin and every hold path using exact Viterbi DP (cursor, prior decoded rune); count all histories separately. No printed word boundaries or clause-order constraint. Native GP bigram model, smoothing 0.5, excludes WELCOME, KOAN1 and the table-bearing WISDOM text from training. An unconditional maximum is also an upper bound on the score achievable under any subsequently imposed order/cursor constraint.

| Input | Sign | Legal origins | Complete paths | Best mean log score (nats/rune) | Best origin |
|---|---:|---:|---:|---:|---:|
| Original span |+|39|185|-3.7538601413|6907|
| Original span |−|22|80|-3.7461754103|14074|

Both best inverses are nonprose; EO/OE counts are 17 and 33. All best-per-origin paths exactly reencrypt. Held-out 294-rune WELCOME and KOAN1 windows were encrypted with origins 1033 and 3301 respectively and each sign. All four recover the exact origin and all 294 plaintext runes (1176/1176); scores -2.7733 and -2.5294 respectively. The minima over all native windows of that length are -2.7955116 (222 WELCOME windows) and -2.8011653 (487 KOAN1 windows). Neither original maximum reaches these minima. This is finite-register evidence, not a language-independent theorem or a blind validation of clause order. The genuine p56 replay separately validates the receiver convention.

## Reproduction and limitations

- Stage 1: [script](../sims/lp2_clause_prime_absolute_origin_sft.cjs), [output](lp2-clause-prime-absolute-origin-output.json).
- Stage 2: [script](../sims/lp2_clause_prime_absolute_tiling_sft.cjs), [output](lp2-clause-prime-absolute-tiling-output.json).
- Stage 3: [script](../sims/lp2_clause_prime_absolute_longest_sft.cjs), [output](lp2-clause-prime-absolute-longest-output.json).
- Executed against fetched repository data in connected V8 runtime; no standalone Node/CI run. No independent historic selection of the clause order; no fitted-order held-out success asserted. The all-origin inverse is a distinct stronger spacing-free negative, rather than a second word-lexicon gate.
