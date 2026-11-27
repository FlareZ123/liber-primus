# Fixed 16-rune BASE29 affine block inverse, #3162

**Decision:** no authenticated framing or original plaintext/key. The exact finite known-donor gate rejects every tested reference window; a calibrated blind inverse returns nonprose on withheld original data. This is a fixed-framing exploratory result, not a universal BASE29 exclusion.

## Historical/physical selector

The verified 2013 signed TCP protocol explicitly defines BASE29 3301→3QO and a DH23 modular exchange ([historical source](../resources/external/2013-tcp-server-signed-source.md)); BASE29(1033)=16I follows. These specify numerical representation and modular exponentiation, not GP29 integer multiplication or an LP2 block cipher. The original p15 spiral has 16 cells, and the rubric/body boundary after 20 runes of p15–22 is the previously registered chapter-body boundary ([source spiral group-order decision](lp2-p15-spiral-group-order.md)). This licenses **one exploratory framing**, not an authenticated rune-block width. Freeze ordinary consuming, big-endian GP indices, n=16, origin at that boundary, 117 complete blocks from 1883 body runes. The final 11 runes are outside the test; no origin, size, sign, F-hold, phase, or tail-rule sweep.

Prior #2745 additive carry period8, arbitrary word-integer endpoint bounds, whole-chapter short multipliers, and shared long chapter affine anchors are distinct. Here each block is a full 16-digit integer, one common full-width unit and offset. The protected least significant digit is indeed a fixed affine substitution (already understood); the higher digit carries constrain all other phases jointly, unlike arbitrary position-dependent substitutions or GF29 Hill blocks.

## Exact inverse and key elimination

Write Q=29^16, P=A*C+B mod Q, A a unit. If C1-C0 is a unit, two complete known pairs determine A=(P1-P0)/(C1-C0) mod Q, B=P0-A*C0 mod Q. A nonunit A rejects the invertible map. Given lower digits of A,B and incoming carry, next plaintext digit at block j is (carry + sum_{k<d} A_k C_{j,d-k} + A_d C_{j,0}+B_d) mod29. Each level has only 841 extensions (812 at d=0); all earlier plaintext digits are immutable. This is exact lifting, not a 29^32 key enumeration. Independent full BigInt encode/decode checks the recovered solution.

For each contiguous native donor window, derive low A,B from the first two unit-difference original blocks; if their 80 low fit digits match, derive the complete unique key and predict 37 held blocks. All 596,420 windows actually scanned. The known-pair inverse separately solves the first two actual p56 block pairs, but only those two of five complete blocks match; p56's authentic historical method is not the proposed affine map. The known-pair claim is not a cross-cipher transfer.

## Results

The blind 64-wide beam lifts both operands with reversed native Gibran unigram, bigram and trigram scores across 80 training blocks. No held original blocks consulted. Two fixed-seed full-width synthetic-key controls: exact transcribed solved GP source and independent Emerson. Both independently recover all 32 key digits, 1280/1280 fit and 592/592 withheld runes. Known-pair inverse recovers the same keys; B+1 wrong-key control recovers 0/117 exact blocks in both. These controls validate receiver sensitivity, not historical authorship. Beam is not exhaustive.

| Scope | Fit score (nats/rune) | Held score | Decision |
|---|---:|---:|---|
| Solved native GP plant | -2.4216 | -2.5391 | exact key and plaintext |
| Emerson plant | -2.4717 | -2.5711 | exact key and plaintext |
| Original p15–22 | -3.8135 | -4.2838 | nonprose; no authentic key |

The original fitted key A=75159073679170517530521, B=9893891659568850603029 is merely a language-score optimizer winner. Initial reading JEALHHLYHNGOEPHEBOAEJREGGPUPYURFNIIIAEORRFEANIMMB... is not a message. It replays mechanically because A is a unit; no unknown plaintext claim.

| Finite donor source | Windows | Maximum matching low fit digits /80 | Exact low-digit survivors |
|---|---:|---:|---:|
| Gibran | 60621 | 14 | 0 |
| Shakespeare | 215235 | 14 | 0 |
| Emerson | 319456 | 15 | 0 |
| Native solved GP | 1108 | 12 | 0 |

The finite gate includes every possible full-width key under the chosen framing if plaintext is literally one of these contiguous windows. It does not reject all native prose. No use of printed lexical boundaries. Retire this specific frame; no broadened length/origin sweep absent a new source selector.

Reproducer: [sims/lp2_p15_block16_affine_integer_sft.cjs](../sims/lp2_p15_block16_affine_integer_sft.cjs), executed connected V8 core; standalone Node wrapper not run. Raw [output](lp2-p15-block16-affine-integer-output.json), commit a6237d2ef02f838f4b0daeae4e7a796422ce7210. Inputs pinned corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; solved GP 1b064ef6d85819b7d96adaff31a82d1ec551598f; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare and Emerson pinned existing control files. Code 69fc5a15660c752a6b268117244f0c2cb1a1530a.
