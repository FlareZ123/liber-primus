# p15 finite S4×S4 block-transposition receiver (#3289)

**Agent17, 28 November 2026.** A conditional, source-bounded finite family has been exhausted; no unknown plaintext or key recovered. The original p15 plate supplies the shape, not an explicit instruction to use a separable permutation.

## Frozen hypothesis

The known p15 numeral solution is a literal 4×4 array. The immediately succeeding p16–22 rune stream has 1744 = 109×16 symbols, so there is no partial-block/padding choice. The historical 2014 solved column permutation provides an operation precedent; p56 provides an independent native clock control. Fix the row and column sets {0,1,2,3} in natural source order. Every independently permuted row/column pair gives one unique mapping of 16 positions, hence 4!×4!=576, ordered lexicographically by row permutation then column permutation. The inverse set is the same domain. This is distinct from the fixed/progressive p15 spiral route and p15 Hill receivers. No fitted prime origin, direction, phase, alphabet, other key family or recipient.

Define K_j=(prime_j−1) mod29, prime_0=2. The inner encryption emits F=0 unchanged, without advancing the prime clock, and otherwise C=(P+K_j) mod29 with clock advance. One fixed outer permutation writes the inner ciphertext of each successive 16-rune block to position (row[r],col[c]) for original row-major (r,c). The original candidate is deinterleaved by its exact inverse. For every consuming state i−h after i source symbols and h literal-F holds, allow the consume edge iff the recovered rune is nonzero; allow the hold edge iff the ciphertext is F. Retain every reachable hold count, not just the best path.

Freeze the row/column key using only the first 864 runes (54 complete blocks), ranking exact legal prefix paths by smoothed native bigram score with deterministic tie-break. The remaining 880 runes (55 blocks) are continuation. The F mask may be resolved by full ciphertext after key freeze. The separate training set is native solved material excluding the four named donor records. Two overlapping 1744-rune native donor windows are planted under two distinct nontrivial domain keys; this is not two independent prose corpora. The genuine p56 control reproduces all 85 original ciphertext runes. Every outer permutation is checked by exact inverse replay.

## Results

| Input | Legal prefix keys / 576 | Selected key ID | Full legal runes | Held exact native runes |
| --- | ---: | ---: | ---: | ---: |
| Original p16–22 | 0 | none | — | — |
| Plant 1, true 137 | 1 | 137 | 1744 | 880/880 |
| Plant 2, true 502 | 1 | 502 | 1744 | 880/880 |

Original maximum legal prefix is **423/864**. Thus all 576 possible fixed separable row/column permutations have an empty true-F reachability set before the freeze boundary, independent of language or ranking. No suffix is used for key selection. Controls recover the true row and column permutations uniquely by feasibility alone, with 1744/1744 and 1742/1744 total plaintext recovery; both exact held continuations, and both reencrypt exactly (the second has a residual prefix F-mask ambiguity). Held mean native bigram log probabilities −2.849157 and −2.807121.

The geometry is independent of the ciphertext score, but the separable row/column key family itself is **a conditional human-plausible interpretation, not an independently authored domain**. The p15 plate fixes a finite row/column shape and its solved spiral, not a choice of arbitrary permutations or an opcode that transfers them into p16. Hence this is an exact exclusion for a motivated candidate, not proof that all physically motivated finite domains fail. No new inverse should expand the origin or operator family without a new source instruction.

[Source-original CommonJS reproducer](../sims/lp2_p15_s4xs4_block_phiF_sft.cjs) · [complete 576-key original output and controls](lp2-p15-s4xs4-block-phiF-output.json). Exact computational core executed in the connected V8 runtime on the pinned repository inputs; standalone Node wrapper/CI not separately executed.
