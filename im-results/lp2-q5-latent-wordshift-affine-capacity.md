# Latent-word shared five-phase cycles: constructive inverse and all-key affine capacity

Agent 5, 2026-11-26. Printed separators are not assumed to delimit plaintext words. This investigates the alternative that the lag-five structure arises from a shared short cycle with fresh wordwise phase and shift, rather than a conventional stationary clock.

## Constructive additive word-shift inverse

Model: for every actual word, choose an independent start phase and additive word shift; emit C_j=P_j+b_w+K_(r_w+j mod 5) mod 29. The shared cycle of differences D_j=K_(j+1)-K_j has sum zero. Subtracting adjacent runes eliminates b_w. Rank **all 141,457 rotational classes** of zero-sum five-tuples using lexical difference-fragment evidence on the ciphertext prefix. Evaluate the best 96 by exact marginalization over latent word boundaries, phase and shift. The prefix is 515 runes and the holdout is 201, with no printed separators used. Code: [q5 inverse](../sims/lp2_q5_latent_wordshift_cycle_sft.cjs).

| Input | True cycle recovered | Held rune accuracy | Held log likelihood/rune |
|---|---:|---:|---:|
| Gibran, synthetic | yes | 76.6% | within −2.88 to −2.76 |
| Shakespeare, synthetic | yes | 77.1% | within −2.88 to −2.76 |
| Emerson, synthetic | yes | 83.1% | within −2.88 to −2.76 |
| Three iid pads | n/a | n/a | −3.6642 to −3.6446 |
| Original p0–2 body | unknown | n/a | −3.611733 |

Original winner D=[1,18,22,25,21], prefix −3.531007. No coherent text and no independently supported key. Full per-case results: lp2-q5-latent-wordshift-{control0,control1,control2}-{positive,negative}.json and lp2-q5-latent-wordshift-original.json. Ranking is exhaustive over cycles, but full lexical marginal evaluation is shortlisted, so this is a constructive negative rather than a mathematical exclusion.

## Exact capacity with arbitrary wordwise affine scales and direction

Strengthen the model to C_j=a_w P_j+b_w+K_(r_w+d_w j mod 5) for every consuming rune in a latent word; a_w nonzero, b_w arbitrary, d_w either sign. In the literal-F version plaintext 0 emits ciphertext 0 without advancing; non-F can still encrypt to 0. The shared cycle is unrestricted.

For any candidate lexical word aligned anywhere in ciphertext, every consuming lag-five difference satisfies
    C_(j+5)-C_j = a_w (P_(j+5)-P_j) mod 29.
A nonzero plaintext difference fixes the scale, all others check consistency; if every difference is zero, every nonzero scale is considered. Six active positions determine the five consecutive key differences from the first five adjacent differences. Longer words impose additional consistency. The resulting zero-sum cycle is canonicalized over rotations and reversed-negated rotations (allowing either direction). An interval matched to a cycle can coexist with other intervals only when disjoint. Processing intervals in increasing end order and greedily accepting earliest finishing compatible intervals gives the exact maximum number of disjoint lexical anchors, for every key. Missing keys have zero matches. No printed grouping, key ranking, scale restriction, or likelihood cutoff enters this bound.

The six-active-rune bound is too permissive to identify the true cycle in the first control (true cycle capacity 52, true words 32, global max 55). With thresholds 7–10, **all six independently planted cases identify the correct cycle uniquely at each threshold**, including three with literal-F holds, arbitrary random scales/shifts, phases and directions. These controls establish exact implementation coverage, not original plaintext.

The comparison floor counts fully contained lexicon-covered words of the specified consuming length in **every contiguous rune window** of equal length in Gibran, Shakespeare, Emerson. No demand for boundary-aligned endpoints. This is a necessary condition for any such donor window, not a universal English theorem.

| Scope | Clock | Consuming threshold | Maximum original anchors | Minimum donor-window anchors |
|---|---|---:|---:|---:|
| p0–2 body, 716 | ordinary | 7/8/9/10 | 9/2/1/1 | 7/2/0/0 |
| p0–2 body, 716 | F-hold | 7/8/9/10 | 9/2/1/1 | 6/1/0/0 |
| p40–53, 3008 | ordinary | 7/8/9/10 | 22/5/2/1 | 50/20/6/0 |
| p40–53, 3008 | F-hold | 7/8/9/10 | 22/4/2/1 | 47/15/5/0 |

**p40–53 is incompatible with every tested contiguous literary window under this entire shared-five-cycle model**, even with arbitrary latent word segmentation, independent wordwise affine masks and direction, and either historical clock. The seven-rune threshold yields gaps of 28 and 25 anchors respectively. The opening scope remains unexcluded by these floors. A different lexicon/register, changing cycle between words, nonaffine transform, nulls or inserted/removed symbols remains outside the claim.

Reproduce: [exact capacity](../sims/lp2_q5_latent_affine_long_capacity_sft.cjs), e.g. `node sims/lp2_q5_latent_affine_long_capacity_sft.cjs p40 hold`; omit hold for ordinary. Control selector 0/1/2. Raw results lp2-q5-latent-affine-long-{control0,control1,control2,p0,p40}-{ordinary,hold}.json. The calculations ran in connector JavaScript using the exact repository source and data; standalone Node CLI was not separately executed. All results are scoped to the existing GP encoding and the 31,629-word lexicon of the shared q8 core.

## Stronger projective cycle: arbitrary wordwise cycle amplitude

Allow C_j=a_w P_j+b_w+t_w K_(r_w+d_w j mod5), with both a_w and t_w arbitrary nonzero residues independently. This includes affine masks applied before or after the shared cycle. The lag-five equations still fix a_w; the inferred adjacent key differences now equal t_w D, so quotient the zero-sum cycle by every nonzero scalar, rotation and reversal. Canonicalize each oriented rotation by scaling its first nonzero component to one, and take the lexicographic minimum (the all-zero cycle is its own class). This gives at most 2,557 classes. Interval packing and finite donor floors remain exact. The separate Shakespeare ordinary and Emerson F-hold controls retain all actual covered words and uniquely recover the true projective class at thresholds8–10, not uniquely at threshold7.

| p40–53, 3008 runes | Threshold | Maximum original | Minimum donor window |
|---|---:|---:|---:|
| ordinary | 7/8/9/10 | 179/17/4/1 | 50/20/6/0 |
| F-hold | 7/8/9/10 | 168/16/4/1 | 47/15/5/0 |

The broad projective receiver is excluded at threshold9 under both clocks (gaps2/1), and at threshold8 ordinary (gap3). Lower thresholds are insufficient. This is still conditional on every tested donor window supplying its actual covered words, shared cycle up to independent amplitude, and no length-changing operation. No new key or plaintext.

[Projective SFT](../sims/lp2_q5_latent_projective_long_capacity_sft.cjs); raw lp2-q5-latent-projective-{1-ordinary,2-hold,p40-ordinary,p40-hold}.json. Executed via repository JS source in connector runtime.
