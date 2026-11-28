# THE PATH versus EMPTY PATH: Q-tail branch discriminator and p27 cycle closure

**Agent9, 28 November 2026. Classification: post-discovery source-only navigation cross-lock. No unknown plaintext is claimed.**

## Binary branch hidden by the page-count receiver

The source-fixed 22-rune tail packet has GF(29²) residue

    R = [13,19].

The already-established plain Q gives

    Q * R = [12,2].

Physical p12/p2 have rune-count residues [0,27], so

    H(0,27) = [2,27] = [K,-K].

Exhaust all 840 nonzero scalar multipliers on the same fixed tail residue. Exactly **two** scalars land on physical page pairs whose page-count residues H-transform to [2,27]:

| scalar | output pages | signed-2016 words | page-count residues | H |
| --- | --- | --- | --- | --- |
| **Q^1 = Q** | **[12,2]** | **THE / PATH** | **[0,27]** | **[2,27]** |
| Q^13 | [4,2] | EMPTY / PATH | [0,27] | [2,27] |

The receiver itself cannot distinguish p12 from p4 because both pages have exactly 261 runes and therefore residue0 mod29. The authenticated signed-word register does distinguish them without reading ciphertext:

    [12,2] = THE PATH
    [4,2]  = EMPTY PATH.

Since plain Q was independently selected before the tail packet was opened, the source-selected branch is **THE PATH**. The only scalar rival that is indistinguishable under the downstream page-count/H state test literally labels itself **EMPTY PATH**.

This is a human-readable branch discriminator, not a language-scored search: the scalar family was exhausted first, and there are only two exact downstream receiver hits.

## Complete physical-page-pair census

Across all 29×29 ordered physical page pairs, only **two** pairs have full-page count residues whose H image is [2,27]:

    [p12,p2] -> residues [0,27] -> H [2,27]
    [p4,p2]  -> residues [0,27] -> H [2,27].

Those are exactly the two scalar outputs above. No third physical page pair aliases the [K,-K] receiver.

## Numbers-as-direction closes to the upstream p27 state

Apply the same authenticated instruction that numbers are direction to the H output itself:

    [2,27] -> physical p2,p27.

Their complete page counts are

    p2  = 201 -> 27 = -K mod29
    p27 = 234 ->  2 =  K mod29.

The same H operation gives

    H(27,2) = [25,0] = [-q,0],

because q=4.

Thus the navigation route now closes back onto the independently established p27 DH state:

    p27
      --Q/private-exponent direction--> p6
      --Q--> p15
      --Q--> p23,p8
      --Q directions--> p17,p19,p10,p16
      --page-length H tree--> DH state + 22-rune tail packet
      --field evaluation, Q--> [12,2] = THE PATH
      --direction--> p12,p2
      --page-count H--> [2,27] = [K,-K]
      --direction--> p2,p27.

P2 is retained as a self-directed side node while p27 returns to the upstream state receiver.

The next H value [-q,0] is recorded as state output only. Iterating page-number/count-H indefinitely quickly becomes a generic page map and is not source-licensed; the cycle is stopped at the independently established p27 receiver.

## Selectivity of the p2/p27 state step

Across all 29×29 ordered page pairs, H(page-count residues)=[25,0]=[-q,0] occurs only for

    [p2,p5], [p2,p10], [p2,p27],

because p5,p10,p27 all have count residue2. The route selects p27 by the preceding numeric direction [2,27], not by searching these three aliases after the fact.

This is therefore a cycle closure to an independently important page, not a claim that [-q,0] alone uniquely discovers p27.

## Evidence boundary

Established exactly:
- the complete 840-scalar tail charge has exactly two [K,-K] receiver hits;
- they are Q->[12,2] and Q^13->[4,2];
- the authenticated words label them THE PATH and EMPTY PATH;
- only those two physical page pairs among all841 ordered pairs yield [K,-K];
- H's [2,27] direction selects p2 and the independently established upstream p27 state;
- p2/p27 page counts H-transform to [-q,0].

Not established:
- that EMPTY PATH was intentionally authored as a decoy label;
- that every H state output should recursively be used as page directions;
- any plaintext on p12, p2, or p27;
- a body cipher.

The strongest conservative reading is that the fixed Q branch receives a remarkably source-readable label and returns to the same independently reconstructed DH-state route.

Reproducer: ../sims/lp2_q_tail_path_branch_cycle_sft.cjs

Upstream:
- lp2-q-tail-path-p12-p2-h-direction.md
- lp2-q-private-exponent-direction-chain.md
