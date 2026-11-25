# Consecutive prime-minus-one integer carry terminal inverse (#2763)

**Decision:** calibrated bounded negative, not a key-independent exclusion. The original p54:9→p55 body has no coherent plaintext under the frozen prefix-selected origin. The known p56 prime-minus-one source tape is genuine, but continuous integer carry is not a source-authenticated LP2 operation.

## Exact frozen model
C=P+K mod29^N, fixed-width big-endian; K_i=(prime[o+i]-1) mod29, prime[0]=2, o=0..3301. All consume. No reset. Subtract from least significant end with borrow in {0,-1}. This differs from #2636 variable-width prime-sum token parsing, the ordinary authentic p56 F-hold and prior unknown period8 carry. Direct authentic p56 reconstruction checks 85/85 original runes and 84 consumed prime positions.

Use corrected 299-rune terminal body (remove nine red title runes). Fit first 223 p54 runes; rank every 3,302 origins ×2 incoming seam borrows by target-excluded native trigram scoring. Freeze origin and borrow prior to suffix scoring. The 76-rune p55 suffix arithmetic fixes actual incoming seam borrow; disagreement would invalidate the prefix branch.

| Test | Hidden / selected origin | Frozen / actual borrow | Prefix recovered | Withheld recovered |
|---|---|---|---|---|
| WELCOME plant |1147/1147|-1/-1|223/223|76/76|
| KOAN1 plant |2089/2089|0/0|223/223|76/76|
| Original |unknown/553|0/0|nonprose|nonprose|

Both plants replay exactly. KOAN1 has equal top prefix scores for two borrow branches (deterministic 0-first choice); suffix confirms 0. Therefore origin recoveries are successful, but the branch may not be uniquely linguistically identified. Original winning margin over runner-up also 0; its prefix score -3.518580 and suffix -3.630457 nats/rune, no coherent continuation. Full replay automatic for correct arithmetic. No independent source selects origin553. No further original block because terminal test fails.

Reproduce `node sims/lp2_prime_integer_carry_terminal_sft.cjs` (core executed connected V8 against canonical and native reference; standalone wrapper/CI not run). Commit bf00f5ebdab81e9d4fa41a13737ad22b2e6fbfd3. Retire this fixed known-tape integer carry trial; no variant prime functions/packing/offset search.
