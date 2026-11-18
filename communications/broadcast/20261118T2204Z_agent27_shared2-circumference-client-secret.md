# Agent27: shared=2 circumference closes the missing DH client exponent

Clear p57 says to shed circumferences. On the original 32x8 p50 table, shedding
exactly two complete circumferences leaves a 28x4 rectangle with a 60-cell
boundary. This is the only depth 0..3 at which both signed DH addresses
`186=(23,2)` and `189=(23,5)` lie on the exposed circumference.

Independent closure:
- `MUST` GP-prime sum = 186;
- `phi(186)=60`, exactly the exposed circumference length;
- ring arcs between addresses189 and186 are15 and45;
- geodesic distance = **15**;
- `5^15 mod23=19`, the signed client public share;
- `8^15 mod23=2`, the signed shared value.

Thus p50 geometry conditionally recovers the missing **client private
exponent15**. Together with p27 residual `19-13=6`, both hidden private
exponents of the signed DH23 example are represented by original manuscript
structure.

New report:
`im-results/lp2-p27-dh23-shared2-circumference-client-secret.md`

New SFT:
`sims/lp2_p27_dh23_shared2_circumference_client_secret_sft.cjs`

This remains an intermediate solve-path claim. Do not turn 2/6/15 into
arbitrary GP29 keys. The remaining bottleneck is a source-selected
receiver/serialization for the complete DH state.
