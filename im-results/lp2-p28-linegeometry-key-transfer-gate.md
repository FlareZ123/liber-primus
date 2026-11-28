# P28 THE key equals line geometry, but fresh same-page transfer rejects a reusable line-key rule

**Agent 9, 28 November 2026. Classification: retrospective local convergence plus prospectively frozen same-page negative.**

## Retrospective convergence

Director #3443 independently established that the existing p28 THE receiver is the unique **interior printed-line-start complete two-rune word** on physical p28:

`offset140`, printed line7.

The existing independently derived THE key is:

`[22,7]`.

Original p28 line geometry gives:

`line7 length = 22`.

Therefore the complete key is exactly:

`[line length, line ordinal] = [22,7]`.

A matched charge over the nine frozen +6/H-shell two-rune source pages shows this exact key/line equality only on p28 (1/9). In particular, the other local H-shell success p34 BE has key `[24,5]`, while its selected receiver lies on line1 of length22, so the equality is not a hidden general explanation for both successes.

Because the p28 key and receiver were known before this observation, this is supporting convergence only.

## Prospectively frozen transfer

To test whether p28 itself supplies a reusable line-key rule, the only other complete canonical two-rune word beginning a printed line was selected without reading its rune values:

- p28 offset0;
- page-opening line1;
- line1 length23;
- frozen geometry key `[23,1]`.

Pretarget commit:

`f679d5cedd9283f65ae8d664920a0cc4c7b27687`

The direction was frozen as subtraction, matching the existing THE candidate. No sign/order/phase variants were allowed.

Success required the output to equal a canonical two-GP-rune word in the authenticated 43-word signed-source register. That register's two-rune words reduce to the exact GP values for:

- THE = `[2,18]`;
- IS = `[10,15]`;
- BE = `[17,18]`.

## Reveal

Only after the pretarget commit:

```text
p28 offset0 ciphertext  [13,5]
geometry key            [23,1]
subtract mod29
output                   [19,4]
```

Transliteration: `MR`.

Exact authenticated two-rune source matches: **0**.

## Decision

The p28 THE receiver has a real page-local coincidence/convergence:

`source-derived key [22,7] = [selected line length22, line ordinal7]`.

But the same literal line-key operation fails on the only other p28 line-start two-rune receiver under a prospectively frozen test.

Therefore:

- keep the equality as **retrospective local supporting evidence** for the already source-selected p28 THE coordinate;
- do **not** promote `[line length,line ordinal]` to a p28 cipher/key generator;
- do not use line-key variants to repair the fresh miss.

This result is compatible with Agent3's narrower #3443 conclusion: printed geometry independently chooses offset140 once p28 and the two-rune receiver type are fixed. It does not supply the decryption key law.

Reproducer: `sims/lp2_p28_linegeometry_key_transfer_sft.cjs`.
