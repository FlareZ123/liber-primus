# Exact-union cross-check of the p27 red13 / DH23 familywise audit

**Agent5, Director Issue #1634, 18 November 2026. Evidence class: independent source-family reproduction and exact-token-multiset calibration. No unknown LP2 plaintext, KDF, key stream, or receiver is recovered.**

## Decision

The p27 red13/DH23 construction survives the declared familywise audit. A direct exact-union control over the two documented global coordinate origins gives a familywise matched-multiset rate of **7.6283363e-6**, about **1 in 131,090**, consistent with Agent50/#1636's origin-by-origin conservative union bound of 7.71712e-6 (about 1 in 129,582).

The earlier fixed-cell diagnostic of about 1 in 200 million remains a post-discovery conditional number and should not be used as the familywise rate. The source route is still a strong local structural candidate. It does not provide an authenticated historical LP2 handoff or a reversible unknown-ciphertext receiver.

## Independent source gate

Using the original ink annotations, the visual family is exactly the six red rune spans of length at least13 immediately followed by a red 13-dot mark: p0, p3, p7, p23, p27 and p53. Their GP-prime sums are 662, 742, 766, 786, 1109 and 2262. Only p27 is prime, with prime ordinal186.

For p27, one-based forward marker position13 selects I, GP prime31, while the visible residual is 19−13=6. The product is 31×6=186. Original table cell186 is `0J`, which decodes to19 under both frozen numeral readings and closes back to the red-span length. The two documented global coordinate origins for (31,6) are:

- zero-based: address254, source token `39`, base59=186 and base60=189;
- one-based: address245, source token `0u`, base59=55 and base60=56.

Only the zero-based source cell supplies the DH transducer. The previously documented one-based-forward selectors then recover modulus23 and client secret15; the visible residual6 gives the server secret. The signed public tuple is (p,g,serverPublic,clientPublic,shared)=(23,5,8,19,2).

## Exact-union matched-token control

The null preserves the exact 256-token p50 multiset and the original source-side p27 arithmetic. Because the local source closure is already part of the frozen route, cell186 must be the unique `0J`, giving probability 1/256. After fixing that cell, the two copies of `39` occupy an unordered pair of the remaining255 locations. There are 32,385 possible pairs and exactly **507** pairs place at least one `39` in the union of the two documented coordinate addresses {245,254}. Thus the exact upstream union probability is:

`(1/256) × (507/32385) = 6.115389069e-5`.

Conditioned on that exact union, 500,000 deterministic exact-multiset trials (seed `0x1634BEEF`) randomized all remaining token locations. Each trial allowed both frozen radix maps, both pointer directions, and every player-visible signed DH value {2,5,8,19,23} as a first-arrival step count. Results:

- any declared pointer-family hit: **62,370 / 500,000 = 0.12474**;
- exact source-typed base59 186→189 first arrival at serverPublic8: **6,504 / 500,000 = 0.013008**;
- endpoint189 base59 self-pointer: **8,109 / 500,000**;
- pointer-family hit plus endpoint self-pointer: **664 / 500,000**.

Multiplying by the exact upstream union probability gives:

- declared broad family: **7.6283363e-6**, about **1 in 131,090**;
- exact typed base59-forward-hop8 path: **7.9548981e-7**, about **1 in 1.257 million**;
- broad pointer family plus the endpoint self-pointer: **8.1212367e-8**, about **1 in 12.31 million**.

The endpoint fixed point is reported separately rather than used to rescue the declared core family. The four circumference depths add no independent token-shuffle probability once the DH addresses are fixed: depth2 alone contains both addresses, and its geodesic15 equals the client discrete logarithm.

## Reconciliation with the broader exploratory envelope

A broader exploratory event that drops the already-frozen `cell186=0J=19` closure, mixes row and column origins independently, or allows the private exponents6/15 as pointer step counts produces a much larger matched-null rate. Those choices are outside the family specified by #1634/#1636. They are useful sensitivity checks, but they should not replace the declared familywise calibration.

## Consequence

The independent exact-union calculation supports #1636's decision: retain the p27 red13/DH23/base59 construction as a strong local structural mechanism, while treating the 2013 tuple as historical control data unless an LP2 bridge is independently found. Further arithmetic elaboration of the same tuple has low value. The next useful advance must identify a source-visible reversible receiver on untouched ciphertext or make a blind original-source prediction.

Reproducer: `sims/lp2_p27_red13_dh_exact_union_crosscheck_sft.cjs`.
