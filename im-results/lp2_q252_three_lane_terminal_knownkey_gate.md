# H/G numerical-table quotient as three 84-symbol terminal key lanes

**Agent 47, 13 November 2026. Status: a source-constrained, reversible original-cipher test with a key-independent linear-algebra exclusion. No unknown LP2 plaintext, key, or continuation recovered.** See the [standalone SFT](../sims/lp2_q252_three_lane_terminal_knownkey_sft.cjs).

## Proposed concrete handoff

The original pp49–51 32×8 base60 table contains 256 byte values (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). Treat its original row-major bytes modulo29 as descending coefficients of P(X). The independently known signed 2013 BASE29 3301→3QO example supplies `H(X)=X²+18X+11`, and original p39's red triple at local rune119 supplies `G(X)=(X+5)²`. As already established, **H·G divides P exactly**. The quotient retains **252 formal GF29 slots**, including the leading zero.

This count has a potential consumer: the independently solved p56 contains 85 original GP runes, but its authenticated prime-totient inverse performs **84 actual prime-key advances**, skipping the literal F at local offset56. Therefore `252=3×84` offers a particular source-shaped transport: three 84-symbol lanes might encode the solved p56 key, then provide a key schedule for adjacent still-encrypted p55 (76 runes). This is a **hypothesis**: neither the signed 2013 instructions nor the LP2 pages prescribe grouping that quotient into triples.

## Exact known-key exclusion, before reading unknown text

Freeze two ordinary lane layouts, each in both full coefficient directions: (a) three contiguous 84-long subvectors; (b) 84 successive three-symbol groups. For every layout let `L0,L1,L2` be the three 84-vectors and `k` the **actual source-verified p56 totient-key sequence** `(prime_i−1) mod29` for its 84 advances. A fixed affine transfer would require

`k_i = a L0_i + b L1_i + c L2_i + d (mod29)`

for four *arbitrary, secret* coefficients. No coefficient guessing or language test is needed: for **all four layouts** the matrix `[L0 L1 L2 1]` has GF29 rank **4**, while `[L0 L1 L2 1 k]` has rank **5**. Thus **no member of the complete fixed-affine three-lane family, including every possible 29⁴ hidden coefficient vector, reproduces the solved p56 mechanism**. An independent planted affine combination has augmented rank4 exactly, validating that this test can recognize a genuine lane-derived key.

For an even more constrained alternative, take the three coefficients from each of three independently printed original triples: p3 red `[13,23,2]`, p39 red `[27,5,15]`, and signed 2013 `3QO=[3,26,24]`. Across the four layouts, these twelve fixed combinations match only **1–7** of 84 literal p56 shifts each. Even allowing the *best* constant GP29 offset after viewing the key gives at most **10/84** matches, never 84.

## Direct p55 76-rune readout

Apply each of those twelve historically visible coefficient triples/lane-layout combinations as a complete 76-symbol key to the **unchanged p55 GP29 ciphertext**, with both source-common additive signs, 24 named inverses total. All operations exactly reencrypt the original and reconstruct an independently solved p57 first-76-rune GP plant. Their original decrypted GP29 IoCs remain **0.02877–0.04561**; the independently solved p57 first 76 GP runes have IoC **0.05965**. The strongest original p55 candidate is forward/interleaved with the p3 red coefficients and positive sign, IoC **0.04561404**, beginning `JGRYWXLWDEOUEUNTIFTGHDOBYLIALTJT`, without continuous native-GP prose.

## Decision

The source-shaped 252=3×84 construction fails to reproduce the only independently authenticated 84-step LP2 key schedule, and the three independently visible coefficient triples do not directly decrypt p55. **Retire this stationary affine terminal transfer** and do not introduce per-position fitted weights, hidden offsets, or another consumer without a new authored clue. This result is stronger for p56 than for p55: the p56 rank test excludes *every* secret affine triple weighting, whereas the p55 negative covers only the 24 explicit fixed-source readings. The broader table-factorization and its possible roles elsewhere remain open.