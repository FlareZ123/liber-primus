# Exact latent q8 signed-word-shift anchor capacity

Agent 5, 26 November 2026. An extension of the [five-phase latent affine capacity](lp2-q5-latent-wordshift-affine-capacity.md), aimed at the historical q8 key length. Model: for each latent true word, choose arbitrary independent additive shift b, plaintext sign s∈{+1,-1}, starting phase r and direction d∈{+1,-1}; each consuming position j emits C_j=sP_j+b+K_(r+dj mod8). One arbitrary shared cycle K per chapter. Ordinary and historical literal-F hold versions are tested separately; consuming non-F can encrypt to F. No printed separators are assumed true.

For any finite-lexicon candidate word with ≥9 consuming runes at any offset, require C_(j+8)−C_j=s(P_(j+8)−P_j). Every passing match determines the entire eight-cycle of differences via seven adjacent differences and zero sum. Translation of K is indistinguishable from b. Rotation and reversed-negated rotation are indistinguishable given arbitrary r,d. Enumerating every start, word and both signs therefore determines every possible key with at least one qualifying anchor. Greedy earliest-finishing interval packing per key computes the exact maximum number of disjoint qualifying words. Unlisted keys have capacity zero. Reference floors are minima over every contiguous equal-length rune window of three fixed literary donors, counting only completely contained lex-covered words.

Two independent Gibran held-tail plants of 3011 runes, ordinary and F-hold respectively, choose random shifts, signs, directions and phases for each word and independent shared cycles. The true cycle is the unique max at thresholds 9,10,11: ordinary 22/10/5 (actual covered 20/8/4), F-hold 20/7/4 (actual 18/6/4). At threshold12 neither planted window contains a covered word, so no key-recovery claim there.

## Exact original p40–53 (3008 runes)

| Clock | Active threshold | Maximum original disjoint anchors | Donor minima Gibran/Shakespeare/Emerson |
|---|---|---:|---:|
| ordinary | 9 | 2 | 11/6/26 |
| ordinary | 10 | 1 | 1/0/10 |
| ordinary | 11 | 1 | 0/0/1 |
| ordinary | 12 | 1 | 0/0/0 |
| F-hold | 9 | 2 | 9/5/20 |
| F-hold | 10 | 1 | 1/0/8 |
| F-hold | 11 | 1 | 0/0/1 |
| F-hold | 12 | 1 | 0/0/0 |

At nine active runes, 771,950 distinct cycle classes ordinary and 681,781 F-hold have anchors, but none has more than two disjoint anchors. **Every key in the model is incompatible with every tested equal-length donor window** (positive gap4 ordinary and gap3 F-hold). This remains true despite arbitrary word boundaries, independent signs, shifts and both traversal directions. It is a conditional finite-register exclusion, not a universal language claim, not an exclusion of per-word arbitrary scales at q8, unknown alphabets, varying cycles or length-changing operations. No authentic key or plaintext.

[SFT](../sims/lp2_q8_latent_signed_wordshift_long_capacity_sft.cjs); raw lp2-q8-latent-signed-wordshift-{0,p40}-{ordinary,hold}.json. Example: `node sims/lp2_q8_latent_signed_wordshift_long_capacity_sft.cjs p40 hold`. Exact computations were run in connector JavaScript; standalone Node CLI/CI execution not claimed. The initial control start was beyond sufficient remaining Gibran text and failed explicitly; it was corrected to +400 words after the 80% training boundary before successful execution.
