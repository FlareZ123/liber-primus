# LP2 p55/p56 77-rune seam: historical Stage05 plus prime151

**17 November 2026, Agent14. Bounded original-cipher negative; no new unknown plaintext, authenticated key or destination.**

## Causal source hypothesis

Original physical LP2 **p55 has 76 runes**. Appending the **first printed p56 ciphertext rune** yields exactly **77 = 11×7**. P56 is independently and exactly decrypted through the genuine consecutive-prime-totient algorithm, so the logical plaintext at its first position is **A**. The p27/p55 duplicated seven-rune fragment and the unique **[59,58,52,51]** 1-by-7 numerical stencil in a p0-selected p50 row motivate the historical **2014 Stage05 seven-position transposition** (inverse permutation `[0,6,2,5,1,4,3]`). The solved p57 word **FIND** has original GP-prime sum **151**, suggesting a possible starting prime for the independently authenticated p56 **prime-totient/F-transparent** cipher.

Both operations are authentic historical primitives, but their **combination, order and seam receiver are investigatory hypotheses**. The relevant prior tests already rejected Stage05 alone at the seam and prime151 alone on p55; this experiment addresses their distinct two-layer composition.

## Frozen complete original inverse

Use all **77 original source rune values** in printed order, and exactly four operation choices per transposition direction: either transform seven-rune blocks before decrypting the consecutive-prime-totient stream or after, with each arithmetic sign. This is **eight frozen variants**, no fitted cipher offset, selected F mask, alphabet or seeded state. At any original ciphertext F, enumerate both legal transmitted-literal-F/key-skip and encrypted-non-F branches; a non-F ciphertext that forces plaintext F is a strict historical contradiction.

| Seven-block direction | Sign | Transpose then prime: survivors, last GP rune | Prime then transpose: survivors, last GP rune |
|---|---|---|---|
| Historical inverse | Subtract | 0 | 0 |
| Historical inverse | Add | 0 | 2: D,D |
| Reverse historical inverse | Subtract | 0 | 0 |
| Reverse historical inverse | Add | 2: H,H | 2: U,U |

**No variant can produce the independently known plaintext A at seam position 76**, counting positions from zero. The six noncontradictory paths produce nonprose prefixes, and all six re-encrypt the complete original 77-rune source exactly. Eight different genuine GP-native **77-rune p57 controls**, each independently encrypted under the specific proposed two-layer method, are each recovered **77/77** by the same branch-complete decoder. A failure on original source therefore cannot be blamed on the inverse implementation.

The result excludes only the **source-motivated 77-rune common-plaintext seam** under this frozen two-layer family. It does not exclude a p55-only cipher, or using the p56 rune as padding, or an independently source-selected different prime/state. There is no original instruction explicitly to cross the boundary, and p56 already has its own cipher; that is the major upstream objection.

## Reproduction and decision

[Read-only Windows Node22 CommonJS reproducer, all eight original inverses, all eight native plants and roundtrips](../sims/lp2_p55_p56_seam_stage05_prime151_sft.cjs). Exact data: `resources/liber-primus/lp2-corpus.json`; historical Stage05 inverse and p56's authentic F-transparent totient rule.

[Passing Windows Node22 source-original manual CI run 44141275760](https://github.com/FlareZ123/liber-primus/actions/runs/44141275760) checks every original variant and all eight exact planted positives.\n\nRetire this exact composite, rather than rescuing it with adjusted key phases, extra transpositions or reinterpretation of the known p56 A. The unresolved p55 inner/outer-ring map still needs an explicit author-supplied reversible operation.
