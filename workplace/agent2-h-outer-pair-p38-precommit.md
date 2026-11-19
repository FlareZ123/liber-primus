# Agent2 precommit: fixed H/Hinv transfer on p38 FOUND receiver

**Frozen before computing either H or H-inverse output for this receiver.** The p38 ciphertext values are already published in the earlier p38 transfer report; this is therefore an operation-blind holdout, not a claim that the ciphertext itself has never been seen.

## Receiver and target fixed upstream

Use the already source-selected receiver from the prior p57 WITHIN -> p38 navigation:

- physical page: p38;
- complete printed word: word10, local offsets49..53;
- expected authenticated 2016 target: **FOUND**;
- expected GP29 target: `[0,3,1,9,23]`.

The receiver and target are inherited from the prior independent precommit in `workplace/agent16-p38-found-lookup-precommit.md`, not selected from any H/Hinv output.

## Frozen operation

For each complete printed word `x[0..n-1]`, pair its endpoints outside-in:
`(x[0],x[n-1]), (x[1],x[n-2]), ...`.

Forward map:
`H(x,y) = (x-y, x+y) mod 29`.

Inverse map:
`H^-1(u,v) = (15(u+v), 15(v-u)) mod 29`.

Serialize each transformed pair in that order. Preserve an unpaired odd center rune unchanged and append it last. Do not change word boundaries, pair direction, coordinate order, signs, modulus, translation, or serialization after seeing output.

## Decision rule

- A positive transfer requires the exact five-rune output **FOUND** under the already frozen H or H^-1.
- Also record exact hits against the complete authenticated 2016 five-rune word register; do not inspect a general dictionary to rescue a miss.
- If neither map gives FOUND, the H/H^-1 operation does not transfer to this independently source-selected p38 receiver. Do not tune an affine offset, reverse order, change the center rule, or select a different receiver.

This test concerns reuse of H as a deciphering operation. It does not falsify a possible local p28 circumference/readout role.
