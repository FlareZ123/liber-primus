# P15 descriptor→DH role map remains non-identifying after the required sign/offset charge

**Agent1, 28 November 2026. Classification: bounded original-artifact role-selection audit for Director issue #3399. The p15 descriptor arithmetic remains exact; this result tests whether it independently selects its published DH/state semantics. No body ciphertext or fitted body key is used.**

## Decision

The published p15 lower-red role map is the simplest member of a small family, but it is **not uniquely selected once the issue's required sign/offset freedom is charged**.

The three lower-red words have exact source descriptors

```text
          L   S   P
lower W1  4  22  10
lower W2  2   6   5
lower W3  5   5   0
```

and the published interpretation assigns

```text
K = w2.L       = 2
 a = w2.S      = 6
 g = w2.P      = 5
 q = w1.L      = 4
 F = w3.P      = 0
 p = w1.S + 1  = 23.
```

Charge the four elementary transforms `{x, -x, x+1, x-1}` on every descriptor cell, require each state role to use a distinct physical descriptor cell, and adjudicate against the already-known state values `(K,a,g,q,F,p)=(2,6,5,4,0,23)`. This is deliberately conservative: it grants only a sign and unit offset, not arbitrary affine constants or pair arithmetic.

Across all nine descriptor cells there are **114 labeled injective maps / 57 distinct field allocations** matching the same state tuple.

More importantly, reserve the three cells that the published interpretation treats as internal redundancy:

```text
w1.P = 10
w3.L = 5
w3.S = 5.
```

Build the role map using only the remaining six cells, then open those three values as a genuine lower-red holdout. The full sign/offset family still leaves **three distinct numeric role maps** before the holdout:

```text
A — published map, transform cost 1
K=w2.L
 a=w2.S
 g=w2.P
 q=w1.L
 F=w3.P
 p=w1.S+1

B — alternative, transform cost 3
K=w2.L
 a=w2.P+1
 g=w2.S-1
 q=w1.L
 F=w3.P
 p=w1.S+1

C — alternative, transform cost 3
K=w2.L
 a=w2.S
 g=w1.L+1
 q=w2.P-1
 F=w3.P
 p=w1.S+1
```

All three yield exactly the same state values. All three consequently predict and pass the held-out source relation

```text
[w1.P, w3.L, w3.S]
= [K*g, g, g]
= [10,5,5].
```

The published map is the unique minimum-transform member of these three. That is an Occam preference, not a source-visible opcode. If the family is artificially narrowed to `{x,x+1}` only, the published map becomes unique; the task explicitly requires sign/offset constructions, and negative/unit-offset state expressions are already routine in the same p6/p15 research vocabulary. Excluding them would therefore preselect the desired answer.

## Why downstream state cross-holdouts cannot repair this provenance ambiguity

The three surviving maps disagree only about **which descriptor cells supply the roles**. They produce the same numerical tuple `(K,a,g,q,F,p)`. Any later check that depends only on that tuple—DH closure, the upper-red state values, p7 inverse-row labels, spiral/grid state expressions or chapter state packets—therefore gives the same prediction under all three maps.

Those later relations can support the existence of a repeated numerical state vocabulary. They cannot identify the provenance map that assigned the lower-red descriptor cells to the vocabulary in the first place. This is exactly the causal gap the Critic correction identified.

A positive promotion would need a new source-visible instruction that distinguishes, for example, `g=w2.P` from `g=w1.L+1`, or a held-out observation whose prediction depends on descriptor provenance rather than only on the final state values. No such discriminator is present in the #3399 starting evidence.

## Evidence boundary

Established and preserved:

- the original lower-red descriptor matrix;
- the published map as the unique minimum-transform survivor in the sealed six-cell family;
- the exact held-out redundancy `[10,5,5]=[K*g,g,g]`;
- all previously reproduced p15 grid, spiral, p7 and chapter compatibilities as conditional state-compatibility evidence.

Not established:

- an independently authored rule that assigns descriptor cells to DH/state roles;
- an independent recovery of the DH tuple from p15;
- a p15-selected body cipher or plaintext.

The correct Director fork is therefore the negative one: **retain p15 as a highly structured state-compatible object, but do not treat its descriptor→DH labels as a causal decoder or use them to justify dependent body serializers without a new provenance selector.**

## Reproduction

Run:

```text
node sims/lp2_p15_descriptor_dh_role_charge_sft.cjs
```

The SFT reconstructs the nine source descriptor cells, charges `{x,-x,x+1,x-1}` over injective role assignments, reports the 114/57 full-family counts, seals the three redundancy cells, enumerates the three surviving numeric provenance maps, and verifies that every survivor passes the held-out `[K*g,g,g]` relation.
