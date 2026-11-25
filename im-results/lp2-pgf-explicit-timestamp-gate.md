# Explicit PGF 2.10 timestamp seeds, continuous soft rejection (#2674)

## Decision

Retire the explicit historical timestamp/PGF 2.10/randominteger/continuous keyskip1 conjunction. This does not retire other TeX mechanisms or establish that the ciphertext was produced with TeX. No original plaintext was recovered.

## Period implementation and input boundary

The exact [PGF 2.10 random source](https://github.com/pgf-tikz/pgf/blob/2.10/generic/pgf/math/pgfmathfunctions.random.code.tex) (blob 2811d67c1014471a4b573bf4294195945eba670c) and [parser](https://github.com/pgf-tikz/pgf/blob/2.10/generic/pgf/math/pgfmathparser.code.tex) (81f6545897edbc2bd53c74637c82206bef4f5ff1) implement the Schrage recurrence equivalent to z <- 69621*z mod 2147483647, with randominteger 0..28 returning z mod 29. Explicit bare decimal seed is passed through to the count assignment. Of the frozen 433 historical candidates, 321 are valid nondegenerate literal seeds; 112 exceed TeX's signed count range. No arbitrary reduction of those literals was added. Local installed PGF 3.1.10 gave the same four 16-output vectors (including seed 2147483646); seed 2147483647 yields all zeros, and 20170404232328 gives Number too big on the first draw. The 2.10 source was inspected but a complete 2.10 distribution was not executed. See [vectors](../sims/lp2_pgf_timestamp_vectors.tex).

## Frozen test

[Preregistration](lp2-pgf-explicit-timestamp-prereg.md), [SFT](../sims/lp2_pgf_explicit_timestamp_keyskip1_sft.cjs). Canonical 12,956 runes; continuous offset zero; soft rejection .81288; all valid paths up to three consecutive skips, drift cap 800. Uniform plaintext marginal likelihood from #2665. The threshold log(321/.05)=8.767173396684006 nats is a familywise bound under the iid uniform-key model; it is not an exact tail guarantee for deterministic PGF states. Independently sampled 500 distinct noncandidate PGF states were also tested on both original and planted ciphertext.

| Panel | N | Mean LLR | Maximum | Above threshold |
|---|---:|---:|---:|---:|
| Historical valid literal seeds | 321 | -13.8164 | 2.790230 | 0 |
| Wrong PGF states, original | 500 | -13.7010 | -2.489090 | 0 |
| Wrong PGF states, plant | 500 | -13.7902 | 1.495597 | 0 |
| Literary correct-key plants | 16 | 17.7729 | 29.7879 | 14 |
| Uniform correct-key plants | 16 | 18.0940 | 40.9594 | 16 |

Maximum recorded edge mass zero. All correct-key plants had at most three consecutive skips. Literary controls are overlapping excerpts rather than independent books. This gate has demonstrated imperfect sensitivity (two literary misses), so its negative result is a calibrated rejection, not a mathematical impossibility proof.

The top original seed 1357187610 (rank 88) has LLR 2.790230, mean posterior skips 404.9500. Highest-provenance rank 1, seed 1325734783, has LLR -12.302793. Top ten by LLR plus rank 1 were decoded with the fixed exact-relation GP trigram beam, width 64, final 512 runes held out from prefix selection. Their best whole-book score is -5.761163; no coherent passage. Rank 88 scored -5.792988 overall, -5.840801 holdout; rank 1 -5.794303 overall, -5.831333 holdout. Correct-key literary beam control recovered 12945/12956 and 510/512 held-out runes, with true/recovered skip count 381. Paths in the output forward reproduce ciphertext under the tested relation; this is necessary but not independent evidence of plaintext because wrong-key paths can also reproduce it.

## Data

- [Candidate scores and controls](lp2-pgf-explicit-timestamp-candidates.json)
- [Null panel 0–249](lp2-pgf-explicit-timestamp-nulls-000-250.json)
- [Null panel 250–499](lp2-pgf-explicit-timestamp-nulls-250-500.json)
- [Top decodes and paths](lp2-pgf-explicit-timestamp-top-decodes.json)

The actual computation ran in V8 with frozen repository inputs; the standalone CJS file-loading wrapper was not independently executed. An initial write conflicted with concurrent repository changes, so only the affected partitions were recomputed. No further seed-family sweep is warranted without a new selector.
