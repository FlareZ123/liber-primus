# A 21-rune carried key from the shared p29/p50 quadratic

**Agent49, 18 November 2026. Original-source plaintext recovery, bounded negative.** The physical p39 red GP29 numbers define the repeated-root quadratic G(X)=15X²+5X+27. Both original physical p29 (277 runes) and the printed 256-byte p50 numerical table have exact zero remainder on division by G over GF29. Their high-first source polynomial quotients have **275** and **254** symbols, respectively, yielding an exact surplus of **21** on p29. The difference suggests one economical *hypothesis*, unselected by any manuscript instruction: perhaps p29 carries a 21-rune repeated key as its first or last 21 quotient symbols, followed or preceded by a 254-rune encrypted body also usable on p50.

**Four original source-locked consumers:** use *only* the complete first21 or last21 quotient symbols as a GP29 additive key, applied repeatedly at source phase zero with `P_i=C_i±K_(i mod21) mod29`. Take the remaining **254** p29 quotient symbols as one target, and the complete independent p50/G **254** quotient as the second target. The source thus fixes all input, key length, key material, alignment, and recipient boundaries, except the two literal end choices and standard two signs.

| Original 21-rune donor | Sign | p29/G 254-rune decoded IoC | p50/G 254-rune decoded IoC |
| --- | --- | ---: | ---: |
| First 21 of p29/G | subtraction | **0.03395475** | **0.03383026** |
| First 21 of p29/G | addition | **0.03526190** | **0.03389250** |
| Last 21 of p29/G | subtraction | **0.03470169** | **0.03569761** |
| Last 21 of p29/G | addition | **0.03432822** | **0.03414148** |

The two unmodified source quotient IoCs are **0.03405441** (p29/G) and **0.03277209** (p50/G). All eight original decoded streams remain uniform-like and contain no coherent native-GP prose, instruction, or key. Every original output exactly reencodes under its corresponding repeating 21-rune shift; this is necessary for a real cipher but is not evidence of a solution. A separate genuine p57-native-GP plant, expanded to254 runes and encrypted under **each of the eight exact candidate models**, recovers its native message perfectly under each prescribed inverse. The tool checks actual original table SHA-256 and both zero factor remainders.

The [Windows Node22 original-input SFT](../sims/lp2_p29_p50_g21_surplus_key_source_sft.cjs) passed [GitHub Actions 44287752720](https://github.com/FlareZ123/liber-primus/actions/runs/44287752720). It prints each actual native-GP candidate opening and full original counts.

**Decision:** Reject only the source-exact first/last 21 GP29 repeating-key extraction from the p29/G quotient and its two 254-rune recipients. This is distinct from the earlier **direct p29/p50 two-time shared-pad joint inference**, which fits unknown original pair plaintexts and never posits a recovered 21-rune key. The quotient surplus alone is weak evidence: its existence follows arithmetically from source lengths and degree2 division, and the author gives no opcode to extract a boundary key. There is no recovered unknown plaintext, authentic author key or final destination.
