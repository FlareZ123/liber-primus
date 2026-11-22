# P7 2014-square projector: authored-operator gate and prime-sum diagonal rival

**22 November 2026, Agent 3, Director #2323. Decision: neither the projector nor the alternative historically attested word-number operation currently determines an LP2 cipher/key. One fully typed 5-rune diagonal key from a source-driven rival fails two intact original recipients. No unknown LP2 plaintext, authentic author-selected key or destination is recovered.** Original-input, read-only [Windows Node22 SFT](../sims/lp2_p7_projector_prime_sum_rival_sft.cjs), [Windows Actions PASS 45074758319](https://github.com/FlareZ123/liber-primus/actions/runs/45074758319) and the prior [historical-square projector SFT](../sims/lp2_p7_2014_a_square_gf29_scaled_eigenspace_p8_original_sft.cjs).

## First-party source and human solve-path test

The complete red terminal inscription on original `24.jpg` (physical LP2 p7) has exactly five printed red words of rune lengths `[2,4,3,2,3]` at physical rune offsets194–207 and ends at a visibly drawn red **13-dot** punctuation mark. Adjacent original `25.jpg` (p8) opens with two red whole words whose zero-based GP29 products are `[4,3]`. Independently, the first authentic 2014 Stage10 **3301-sum 5×5 square** is fully present in solved LP1 p16 and the original [Stage10 form](../resources/historical/cicada2014-stage10-original-form.html) required contestants to enter all three magic squares, provide **their own** onion address, and serve `/cgi-bin/upload` and `/key.asc`.

The actual [solved LP1 p5](../resources/liber-primus/lp1-plaintext-reference.txt) states that the **primes** and totient function are sacred, and the [signed 2016 message](../resources/historical/cicada2016-4gq25-outguess.asc) calls the words/numbers a direction. Neither source says that the *ciphertext* words at p7 should be **multiplied by zero-based ordinal rune indices**, that the historical square should be divided by2, or that a characteristic-polynomial *eigenprojector* should be applied. In the 2014 form the original square is an answer to submit, with no instruction to use it as an evolving GP29 matrix cipher. An unprinted eigenvalue/eigenspace step is a substantial obstacle to a human-readable intended route.

## Key mathematical compression: the middle 13 is constrained by the outer pair

Let `A` be the unchanged first historical 5×5 integer square reduced mod29. The previously reported rank-two source polynomial projection is

```
Pi = 20 (A^2 - 25 I) (A^2 - 9 I) mod 29
   = [ 9 23 23 23  9 ]
     [23  9 23  9 23 ]
     [23 23 24 23 23 ]
     [23  9 23  9 23 ]
     [ 9 23 23 23  9 ]
```

For **every** input `v` in GF(29)^5, if `Pi v=[a,b,c,b,a]`, exact row identities force

```
c = -2(a+b) mod 29
  = v[2] - 6*(v[0]+v[1]+v[2]+v[3]+v[4]) mod 29.
```

So the palindrome is a structural property of *Pi*, and the center of its output is already determined by its first two outputs. In the previously reported zero-based word-index-product case `v=[11,26,8,15,2]`, the match `a=26=v[1], b=11=v[0]` **forces** `c=-2(26+11)=13`. The 13-dot marker remains a real separately printed target and filters the two observed reversed-outer corpus windows down to p7. It is **not an independent third free output match once the outer values are fixed**. The same simple palindrome can be constructed without the historical matrix by folding `[v[1],v[0]]` around the printed13; it is not independently diagnostic of an eigenprojector. The operator was recognized retrospectively.

## First-party number-grammar rival and one finite executable key

Read the **same five original red words** and use four complete unadjusted numeric conventions before applying the same historical Pi. These are entirely fixed from the unchanged original rune indices and actual 29 GP prime weights:

| Source word-number interpretation | Five original numeric inputs mod29 | Pi projected values |
| --- | --- | --- |
| GP **zero-based index product**, selected in the prior hypothesis | `11,26,8,15,2` | `26,11,13,11,26` |
| GP zero-based index **sum** | `26,7,23,13,24` | `18,3,16,3,18` |
| **GP prime-weight sum**, explicitly encouraged in solved LP1 | `9,16,11,11,23` | `2,14,26,14,2` |
| GP prime-weight product | `14,10,4,19,19` | `12,10,14,10,12` |

Thus the prime-weight sums do **not** reproduce the claimed direct red13 selector. Yet an interesting independent low-tech interpretation is available if we additionally divide their projected values by2 in GF29: `[2,14,26,14,2]/2=[1,7,13,7,1]`. These are precisely **one-based indices walking the main diagonal inward to the central cell** of the original 5×5 square and then walking back over the same cells, since its row-major main diagonal starts at positions1,7,13. As a **conditional source-addressed key**, reading those exact five positions of the *same historical square* gives `[434,812,809,812,434]`, or GP29 residues **[28,0,26,0,28]**. The two choices introduced here, *halving the prime-sum projection* and *interpreting its result as cell addresses*, are not selected by a signed instruction. The diagonal relationship is only a possible human-recognizable rival and may be postselection. It has the virtue that the key values and their acquisition are fully specified without fitting any unknown-cipher output.

Apply this key directly under the authentically demonstrated 2014 GP29 additive-Vigenère receiver, with no phase optimization or unmarked F bypass, to (a) all 255 original p8 runes and (b) the independent **1,005 black runes of original pp23–26**, whose p23 opening bears the same five-dot stencil as p7. Both are complete five-rune packet registers; use the key from their first runes and test both arithmetic signs.

| Untouched original receiver | Source GP IoC | Subtract key IoC | Add key IoC |
| --- | ---: | ---: | ---: |
| Full original p8, 255 runes | 0.034275127374 | **0.033564922032** | **0.034213370388** |
| Original p23–p26 after p23 red16, 1,005 runes | 0.034304572754 | **0.034381875483** | **0.034562248518** |

All decoded values remain close to 1/29 and contain no coherent native GP prose. Every full ciphertext reencrypts exactly. A genuinely solved p57 95-rune GP-native plant (repeated to the receiver's length) encrypts and exactly decrypts under both signs and on both actual source-shaped registers. The known-plaintest positive verifies the operation, without asserting this key is authentic. **Do not proceed with guessed offsets, F skips or extra ciphers.**

## Exact missing instruction and Director fork

The strongest independent objection to the earlier projector-specific path is **operand selection**: the solved author text highlights prime numbers, while the prior strongest match requires multiplying *zero-based alphabet ordinal indices* and inventing a matrix spectral projector. On the same original p7 words, the historically encouraged prime sums lead somewhere else; even the fully typed diagonal-address rival fails two disjoint original prose recipients. No contemporary Cicada instruction orders the p7 words through the source matrix, its characteristic polynomial, the factor two, a selected output pair, and a keyed LP2 recipient.

**Retire projector-dependent key-search escalation pending a genuinely first-party operator/receiver.** Preserve the original algebra and the precise red geometry as intermediate source evidence, including the newly explicit row-dependence and the conditional diagonal address. A reopen-worthy discovery must select the missing operation before reading ciphertext language scores and recover an authenticated key object or an intact original passage with a disjoint prediction. No new unknown-page plaintext has been found.
