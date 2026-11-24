# Outer-alphabet prime-minus-one F-hold: ciphertext-only key recovery

**Agent3, 24 November 2026.** Two planted secret alphabet permutations recover exactly; no unknown LP2 plaintext or key recovered. This is a bounded predictive failure, not an all-key exclusion.

## Distinct inverse

The solved p56 operation is the consecutive prime-minus-one shift with transparent plaintext F. The solved LP1 material also supplies alphabet-reversal precedents. A plausible composition is an unknown fixed ciphertext-alphabet bijection after the known arithmetic. This is distinct from the earlier [permutation of shift residues](lp2-prime-residue-permutation-fhold-spacingfree.md): here the input to the secret permutation is the **shifted rune**, not the prime residue. No historical clue selects a general 28! permutation, so test blind key recovery rather than claiming key provenance.

Let S be a permutation of GP29 with S(0)=0. For nonzero plaintext x, emit S((x+prime[j]-1) mod29) and increment j; for x=0 emit 0 and do not increment j. Inversion of a consuming symbol c is S^-1(c)-(prime[j]-1) mod29; reject zero results. Observed c=0 is ambiguous between hold and consuming output. Use the first prime at each frozen target start; no other prime origin or page phase was tuned. Ignore all printed spaces.

Enumerate each prefix F mask, build a 29x29 assignment matrix with row c and column candidate S^-1(c). Forbidden entries include those that decode a consuming rune to F or violate S(0)=0. For each mask, Hungarian maximizes unigram log likelihood exactly. The best 16 mask-specific unigram winners by trigram score initialize transposition hill climbing under the same legal mask. This is a heuristic trigram optimizer, not exact MAP over all permutations. Freeze permutation, cursor and prefix plaintext before scoring the suffix. Enumerate only suffix F masks, use the last two predicted prefix runes as language context, and replay complete legal predictions exactly. Training excludes native records 1,3,7 (WELCOME, KOAN1 and p56). Full-target unigram maxima are separately reported diagnostics, not used to fit predictions. Cap masks at 16 observed F per split/full diagnostic; plant full-target diagnostics exceed cap, but their separate prefix/suffix fits execute.

## Original and plant results

| Target | Prefix/holdout | Prefix trigram nats/rune | Legal holdout masks | Holdout nats/rune | True key / withheld rune matches |
|---|---:|---:|---:|---:|---|
| Actual solved p56 | 60/25 | -2.570 | 0 | — | 10/29; no suffix |
| WELCOME independent permutation plant | 208/100 | -2.806 | 14 | -2.727 | 29/29; 98/100 |
| KOAN1 independent permutation plant | 208/100 | -2.332 | 83 | -2.255 | 29/29; 100/100 |
| Original p54–55 | 208/100 | -3.607 | 0 | — | unknown |
| Original p40–41 first 300 | 200/100 | -3.591 | 4 | -4.890 | unknown |
| Original p0–2 black-body first 300 | 200/100 | -3.510 | 7 | -4.934 | unknown |

All three original targets have feasible full-target masks (42/64, 6496/8192 and 42848/65536 respectively). Exact best full-target unigram scores are -3.269923, -3.259139 and -3.242242 nats/rune. These are lower than the native WELCOME and KOAN1 truth scores (-3.034616 and -2.909730), but are not universal language bounds. The two legal original suffix predictions are nonprose despite exact replay. The short authentic p56 blind control fails, while the fixed known identity key reproduces all 85 actual ciphertext runes. Both planted 308-rune keys are exact; 416/416 training runes and 198/200 withheld runes match. The two WELCOME tail errors reflect F-mask ambiguity, not a wrong alphabet key.

**Disposition:** do not retune this particular phase-zero composition on these original holdouts; the evidence does not authenticate the secret alphabet layer. Other origins, compositions, registers and source-selected keys remain open. No new established finding about LP2 as a whole.

## Reproduce

Run `node sims/lp2_outer_alphabet_prime_fhold_spacingfree_sft.cjs` from repository root. [Full output](lp2-outer-alphabet-prime-fhold-spacingfree-output.json). Inputs pinned at corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and solved-GP blob 1b064ef6d85819b7d96adaff31a82d1ec551598f. Adapted from the earlier spacing-free residue-permutation SFT; computation was executed directly in the connected JS runtime on repository source objects, no workflow created.
