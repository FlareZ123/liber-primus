# P57 DIUINITY / EMERGE center-out p50 bracket → p55 receiver gate

**Agent6, 18 November 2026. Independent follow-up to the p57 reconstruction of the p50 nested bracket.**

## Decision

The new source path makes one previously untested serialization natural:

1. clear p57 `EMERGE` and `DIUINITY` reconstruct and center the nested p50 bracket;
2. `DIUINITY` lands at zero-based cell105, the exact common center;
3. `EMERGE` motivates reading outward from that center;
4. `SHED OUR OWN CIRCUMFERENCES` supplies the 43 strict interiors of p55 as a same-length receiver.

That serialization is now tested as a complete finite additive-affine GP29 family. It does **not** recover native-looking plaintext. The best of all **3,364** frozen candidates scores **-11.92144509** mean within-word GP29 trigram log probability. Every one of **2,000** exact-p55-word-shape native English controls scores higher; the worst control is **-8.96495606**. The best fitted original result is therefore **2.95648903 nats per scored trigram below even the worst control**.

A source-shaped positive plant using the same center-out/totient receiver recovers all **43/43** runes and scores **-7.65777251**, inside the native control distribution.

Close only this center-out stationary additive-affine receiver. Preserve the p57 → bracket reconstruction and the unique center-`13` bridge.

## Source-selected route

The upstream source relation is fixed independently of this receiver test:

- p57 `EMERGE` has canonical GP0 sum83 and points to p50 cell83, printed `3D`;
- the duplicate `3D` at127 and adjacent duplicate `3L` at82/128 reconstruct the nested prime-count bracket;
- shedding the two endpoint pairs leaves cells84..126, exactly43 cells;
- p57 `DIUINITY` has GP0 sum105, exactly the common midpoint;
- cell105 uniquely prints `13`.

The existing report also identifies further source-internal word/address checks. This experiment does not re-evaluate those claims.

## Why center-out is a distinct source operation

Earlier direct 43-byte consumers keep cells84..126 in row-major order. Once p57 identifies the center and says `EMERGE`, a radial serialization becomes separately motivated: begin at the found center and move outward.

A one-dimensional odd-length interval leaves exactly one unavoidable ambiguity: after center105, visit the right or left equidistant cell first. The test therefore admits only these two orders:

- right-first: 105,106,104,107,103,...,126,84;
- left-first: 105,104,106,103,107,...,84,126.

No rotation, arbitrary permutation, phase, reverse-after-fit, or target-selected path is admitted.

## Frozen receiver family

The target is the already source-motivated p55 strict-interior stream: one carried boundary rune plus both endpoints of each of the 16 complete p55 words are shed, leaving exactly43 ciphertext runes in original word order.

For each of the two center-out orders, the 43 p50 source values are reduced in exactly two established direct registers:

- raw base60-decoded byte modulo29;
- Euler totient of that byte modulo29.

For each fixed register, exhaust the global affine additive family

`P_i = C_i + a*K_i + b (mod 29)`

for every `a,b ∈ {0,...,28}`.

This gives:

- 2 center-out orders;
- 2 source-value registers;
- 29×29 affine pairs;
- **3,364 total candidates**.

The family is finite and was frozen before original-language scoring.

## Original result

The best candidate is:

- center-out order: **right-first**;
- value register: **totient**;
- `a=8`;
- `b=3`;
- mean within-word GP29 trigram log score: **-11.9214450876**.

Its transliterated 43-rune output is:

`LNGTHOUAPGBLLJFNJWNEWEOEOBSACFSFUERILOOREAJNEABCC`

The apparent short English-like fragments are expected under optimization over thousands of candidates and do not survive the calibrated word-shape score.

The next-best candidates remain in the same non-native range. The top ten span approximately -11.9214 through -12.0885.

## Matched native controls

The scorer is the same source-calibrated GP29 within-word trigram model already used for the p50/p55 43-unit family. It preserves the exact 17 p55 page-local segment lengths:

`[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.

For 2,000 deterministic native English samples with this exact printed-word shape:

- minimum score: **-8.9649560606**;
- median: **-7.6318884391**;
- 95th percentile: **-7.1086606021**.

Thus zero native controls score as poorly as the best optimized original candidate.

This is a calibrated family rejection, rather than a visual judgment of transliteration.

## Positive control

A separately sampled native 43-interior plaintext was encrypted under the exact tested family using:

- right-first center-out order;
- totient register;
- `a=17`;
- `b=19`.

The inverse recovers **43/43** source-native runes exactly. Its recovered score is **-7.6577725134**, consistent with the native controls.

## Scope

This closes:

- center-out serialization of p50 cells84..126;
- raw-byte or totient GP29 source values;
- one global stationary affine additive combiner;
- the exact 43 p55 strict-interior alignment.

It leaves open any future receiver whose operation is independently specified by a first-party clue and is materially different from this stationary affine family.

The exact p57 `EMERGE / DIUINITY` reconstruction of the bracket remains a strong structural solve-path hypothesis. The receiver failure supplies no reason to demote that upstream geometry.

## Reproduction

Run with Node.js 22:

`node sims/lp2_p57_divinity_emerge_centerout_p55_sft.cjs`

Passing GitHub Actions run: **44414222294**.
