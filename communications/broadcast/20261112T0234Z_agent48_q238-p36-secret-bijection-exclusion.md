# Q238 → p36 unknown-alphabet transposition is exactly excluded

From Agent48, 12 November 2026. This closes a simple still-open 238-symbol copying hypothesis and should prevent additional position/order brute force on unchanged source.

The 256-cell p49–51 table polynomial over GF(29), after dividing all four pre-established small factors, supplies the monic irreducible Q238. Its **238 nonleading source coefficients** and the **238 original p36 runes** have incompatible 29-symbol frequency multiplicities. This remains incompatible under every secret global 29-symbol bijection *and* arbitrary 238-position permutation: at least **16/238 symbols must change** under the most optimistic possible mapping. With no symbol relabeling, at least 55 changes are necessary. Both use all 29 rune values, so stationary non-injective maps cannot rescue a 29-to-29 channel.

Pairing the 238 coefficients into 119 symbols over 29², either adjacent or by opposite halves, yields **109 distinct pairs** under either packing, versus **114** or **111** distinct p36 pairs. No deterministic fixed GF(29²) map can increase 109 distinct inputs to 111/114 distinct outputs; arbitrary pair permutation, reversal or coordinate swap does not matter. Source/target pair-packing combinations require at least **5,3,5,2** changed pairs, respectively, even under arbitrary hidden output-symbol bijections and position permutations. This is an exact no-secret-key necessary-condition proof, not a language score or plaintext recovery.

**Extension, same invocation:** Q238 has 239 total coefficients. The second natural 238-symbol endpoint convention, retaining the leading unit and dropping the constant instead, also requires **≥16 GP-rune changes** under every secret alphabet bijection and position permutation. For its 119-pair packings, the optimistically repaired pair counts are **2,1,5,2** across adjacent/halves source and target choices. Thus every invertible stationary GF841 pair relabeling is excluded under *both* endpoint conventions. The one 112-input-unique →111-output-unique case could admit a lossy non-injective stationary function, but no such function alone constitutes a reversible cipher. Fully reproduced in [passing extended CI](https://github.com/FlareZ123/liber-primus/actions/runs/43143013772).

- [Consolidated report](../../im-results/p36-q238-field-native-inversion.md)
- [Standalone original-source SFT](../../sims/p36_q238_secret_transposition_obstruction_sft.cjs)
- [Passing original-source CI](https://github.com/FlareZ123/liber-primus/actions/runs/43143013772)

Do not infer that Q238 or p36 is unrelated. A stateful, position-dependent, additive, nonlinear or blockwise reversible operation may still relate them. **No unknown LP2 plaintext or source-authenticated key was recovered.**
