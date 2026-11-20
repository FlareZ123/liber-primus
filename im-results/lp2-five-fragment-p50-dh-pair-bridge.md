# Five-fragment row-sum to p50 DH-pair bridge

**Status: intermediate, source-indexed DH-state path candidate. No unknown LP2 plaintext is recovered.**

## Result

Agent47's five-fragment row-sum candidate selects the signed-2016 word indices:

    [12, 29, 30, 12, 26]
    THE / DIRECTION / SEEK / THE / NUMBERS

Applying the already frozen p57 GP0-word-sum -> p50 native-base60 byte -> divmod29 register to those five words gives:

| 2016 word index | Word | GP0 sum | p50 byte | divmod29 pair | DH-state interpretation |
|---:|---|---:|---:|---:|---|
| 12 | THE | 20 | 102 | [3,15] | [e,b] |
| 29 | DIRECTION | 112 | 73 | [2,15] | [K,b] |
| 30 | SEEK | 56 | 254 | [8,22] | [A,p-1] |
| 12 | THE | 20 | 102 | [3,15] | [e,b] |
| 26 | NUMBERS | 83 | 193 | [6,19] | [a,B] |

The independently established 2013 DH state has e=3, b=15, K=2, A=8, p-1=22, a=6 and B=19. Thus four of the five pairs are exact members of the frozen p57 vocabulary; the remaining pair [2,15] is the direct cross-pair [K,b] of two known DH values. The word DIRECTION maps to that [K,b] pair.

The sequence is ordered exactly as the row-sum readout, not sorted or rearranged. It is a compact bridge from the five-fragment instruction to the DH state.

## Discriminating controls

The expected ordered sequence is:

    [3,15], [2,15], [8,22], [3,15], [6,19]

- Across all 256 cyclic rotations of the 256-byte p50 table, the exact sequence occurs only at authored shift 0. The maximum position-by-position match is 5/5, also unique at shift 0.
- Across all 32,768 invertible affine address permutations, the exact sequence occurs only for the identity address map. The maximum position-by-position match is 5/5, also unique.

The [2,15] pair is not unique to DIRECTION in the entire 43-word source: it also occurs for HELLO and LIBER. The row-sum readout specifically selects DIRECTION at index 29. The full five-pair ordered sequence, rather than that pair in isolation, is what passes the controls.

Reproducer: sims/lp2_five_fragment_p50_dh_pair_bridge_sft.cjs.

## Why this matters

The 2016 signed source says that its words are the map and their numbers are the direction. The five-fragment row-sum operation extracts THE DIRECTION SEEK THE NUMBERS; the fixed p57 register then maps those words to a DH-state pair sequence. This is a stronger cross-route alignment than the earlier inventory of isolated word hits.

This is distinct from Agent28's low-digit/index/GP-length bridge and Agent20's p55 recursive-shedding route. It nevertheless reuses the same authenticated 2016 message and p50 table, and depends on Agent47's inferred word-index-to-page/fragment convention and row-sum operation. It is therefore a cross-route consistency result, not independent source-level replication or a blind prediction.

## Evidence limits and next decision

1. The 2016 word-index-to-page/fragment convention and the five-fragment row-sum operation remain intermediate hypotheses, although the p36 GOOD fragment provides an existing anchor.
2. The GP0 -> p50 -> divmod29 register was fixed from the p57 analysis; its use on the five row-sum words is a held-out application, but the p50 table and 2016 message are shared with other current routes.
3. The [K,b] pair is a pairing of known DH fields, not itself one of the five p57 training pairs. Its role in the protocol is not yet established.
4. The five-pair sequence is state/navigation evidence, not a cipher or recovered plaintext. Direct pair-as-period-two-additive and affine page-key interpretations remain negative.

**Next decisive question:** does the ordered state sequence [e,b] -> [K,b] -> [A,p-1] -> [e,b] -> [a,B] select a specific operation or receiver in the original DH/LP2 materials? Investigate that source question before testing any further cipher family. The existing p55 recursive-shedding route remains the stronger full-state reconstruction and should not be duplicated.

Related work:
- Agent47: im-results/lp2-five-source-indexed-fragments-row-sum-readout.md
- p57 register: im-results/lp2-p57-divmod29-register-audit.md
- 2013 DH state: results/2013-original-gp29-source-map.md
- Agent20 p55 route: im-results/lp2-p55-recursive-word-core-within.md
