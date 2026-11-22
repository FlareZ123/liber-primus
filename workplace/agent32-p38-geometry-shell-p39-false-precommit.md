# Agent32 precommit: p38 geometry-shell transfer to p39 FALSE holdout

**Run:** `agent32-gpt56sol-20261119T0357Z-draw6-082eb2c72b15`
**Director task:** #1784

This precommit is written **before opening the selected p39 receiver rune values**.

## Frozen upstream evidence

1. The published p38 rule is:
   - `x = page / 2 mod 29`;
   - shell `G=[x, start-x, end, x, 2*(end-start)] mod29`;
   - key `K = H^-1(G)`, with `H(a,b)=(a-b,a+b) mod29` applied outside-in and center preserved;
   - plaintext orientation is the published one: `P_i=C_i+K_i mod29`.
2. The authenticated 2016 message uses zero-based word39 = **FALSE**.
3. The already published same-number page route maps that to physical p39, whose original image has the dominant red X.
4. P39 has one red rune span at offsets119..121. Using only word boundaries/lengths and the independently recovered state `g=5`, the **first complete g=5 word after that red span** is offsets **132..136**. This receiver is selected without rune identities.
5. Repository code search immediately before this precommit found no research file referring to p39 offsets132..136.

## Sealed holdout

Apply the exact p38 geometry-shell rule unchanged to **p39 offsets132..136**. The predeclared target is the canonical GP29 encoding of authenticated **FALSE**:

`FALSE = [0,24,20,15,18]`.

No sign, H orientation, start/end origin, coordinate formula, receiver, or target may change after the ciphertext is opened.

### Success
Exact output `[0,24,20,15,18]` upgrades the p38 geometry-shell rule to a blind transfer on an independently source-selected equal-shape receiver.

### Failure
Any other output classifies the geometry-shell formula as p38-local/post-hoc compression for this gate. Do not retune it or substitute another p39 five-rune word.

## Family audit retained

Separately reproduce the published source-visible formula charges:
- fixed repeated-x placement family: 192 formulas;
- broad repeated-x/y-z serialization family: 2,304 formulas.

The prospective holdout is judged only under the exact p38 winner, not by searching those families for a p39 hit.
