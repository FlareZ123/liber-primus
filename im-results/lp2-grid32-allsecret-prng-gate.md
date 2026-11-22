# LP2 256-byte table: bounded 32-bit generator inverse

**Classification:** Intermediate negative, original-input and all-secret. No unknown plaintext, usable key, seed, generator, or destination was recovered.

## Why this could have produced plaintext

The original pp49–51 object has **32 rows of eight two-symbol numbers**. The source-preserving conventional base60 reading supplies 256 bytes, enough to expose 64 consecutive 32-bit outputs of a small-state generator. If those outputs came from a recurring 32-bit linear state or LCG, its unknown recurrence could be recovered from the printed values and then assessed as key material elsewhere. The 2016 signed message does not specify a PRNG, so this remains a bounded exploratory consumer of an unusually explicit numeric artifact.

## Exact original-input decision

The input is [the fixed base60 table](../resources/liber-primus/base60-grid.json), SHA-256 of its row-major 256 bytes:

3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290

The [CommonJS SFT](../sims/lp2_grid32_allsecret_prng_sft.cjs) evaluates **32 complete configurations**: natural row-major or column-major bytes; byte offsets 0–3; big- or little-endian four-byte packing; forward or backward word progression. There are 63–64 complete words in each configuration.

For every arrangement, the test grants **every** possible affine 32-bit map over GF(2), with no selected transition matrix or state. It uses the precise invariant that all GF(2) linear dependencies among successive input-state differences must hold among the corresponding output differences. All 32 arrangements contradict that condition after observation 24–33. Every arrangement also fails **every** recurrence of the form

\[
s_{n+1}=a\,s_n+c\pmod{2^{32}}
\]

with unknown 32-bit multiplier and increment. For an observed odd consecutive-state difference, these parameters are uniquely determined modulo \(2^{32}\), then checked without refitting against the entire observed sequence.

Synthetic 64-output **xorshift32 plus secret affine output-offset** and **LCG32** plants pass the corresponding exact tests. Both planted families are recoverable by these checks without knowing their coefficients in advance.

## Interpretation and boundary

The original table is incompatible with being **directly serialized consecutive full 32-bit outputs** from either stationary affine GF(2) state evolution or a 32-bit LCG, in all 32 source-specified byte groupings. This includes ordinary xorshift32 with a fixed affine 32-bit output map. A fixed global byte permutation is itself GF(2)-linear, so it cannot repair a failed all-secret affine test.

The conclusion does **not** apply to cryptographic streams with larger internal state (including MT19937 and ChaCha), hashed or truncated generator outputs, word-dependent salts, nonlinear output encodings, independent per-column generators, or the possibility that this table is an unrelated ciphertext or compressed payload. Nothing in the original artifact independently authenticates a 32-bit PRNG interpretation. No plaintext, key or codebook follows. Do not expand this branch without a source-selected generator or word serialization that yields a new decisive original-cipher operation.
