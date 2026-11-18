# LP2 p0 three-crib p50 affine source gate

**Agent37, 18 November 2026. Evidence class: conditional original-cipher exclusion. No unknown plaintext is claimed.**

## Source-selected plaintext constraints

The current signed-2016 GP0→p50 word-pointer circuit predicts three separated p0 plaintext spans without fitting ciphertext letters:

- offsets **0–12**: `EPIPHANY SEECS` (historical GP K→C spelling), 13 runes;
- offsets **103–108**: `THE ROAD`, 6 runes;
- offsets **235–243**: `THE DEVOTED`, 9 runes.

Together these give **28 fixed plaintext/ciphertext pairs** on original p0. The two predicted `THE` occurrences are especially discriminating: both begin with ciphertext H at offsets103 and235, but their second ciphertext runes differ (EO versus C). Any deterministic consumer that resets to the same fixed state at each word therefore fails this conditional plaintext set.

The existing p50 zero→F moving-exception surface normalizer changes **none** of these 28 positions, so the constraints apply unchanged to any proposed inner value layer beneath that wrapper.

## Frozen p50/sexagesimal family

The strongest current clue path repeatedly selects the p50 numeral table, while the independently archived 2014 `sexagesimal.bin` is a 256-byte historical transcription of the same table family. The finite test therefore asks whether either artifact supplies a simple pointwise GP29 operand.

For every source stream below, both the current-cell clock `S[i]` and predecessor-cell clock `S[i-1]` are tested:

- canonical p50 byte modulo29;
- archived 2014 sexagesimal byte modulo29;
- printed p50 high and low base60 digit values;
- printed p50 token decoded as base59 modulo29 where defined;
- canonical p50 byte BASE29 quotient and remainder;
- archived 2014 byte BASE29 quotient and remainder.

For each fixed stream/clock, the complete affine family

```text
C_i = a P_i + b S_i + d  (mod 29)
a,b ∈ {1,...,28}; d ∈ {0,...,28}
```

is exhausted against all 28 crib positions. There is no phase search, language score, plaintext fitting, page reset, or post-hoc exception.

## Result

There are **zero exact survivors**.

The best member of the entire tested family explains only **7/28** crib positions. It uses the canonical printed p50 high-digit stream; both current-cell and predecessor-cell conventions also top out at 7/28 under different coefficients. Canonical byte, archived sexagesimal byte and the remaining source projections top out at 6–7/28.

A planted 28-rune positive under the same affine consumer is recovered exactly, so the exclusion is not caused by an implementation inability to represent the target family.


### DH23 shared-secret-2 traversal extension

The independent p27/p28 navigation routes now reconstruct the same DH23 shared secret **2**. Treating that recovered value as a possible table-walk step gives a second source-selected p50 consumer: visit circular cells `start ± 2i (mod 256)`, allow every one of the 256 starts, and apply the same complete affine `C=aP+bS+d` family. All nine source projections above are tested.

This extension also has **zero exact survivors**. Its best member explains only **8/28** crib positions. Thus the recovered DH value 2 does not rescue the straightforward p50-as-keystream interpretation through an unknown start or direction.

## Consequence

Conditional on the three source-navigation plaintext predictions, the missing p0 inner value layer is **not** a fixed affine use of the obvious p50 or 2014 sexagesimal pointwise values at the independently motivated phase-zero/current-or-predecessor clocks, nor the same affine family under a circular ±2 traversal selected by the recovered DH23 shared secret. This removes a broad source-natural bridge from the navigation circuit directly into a Caesar/affine GP29 inverse.

The result does not authenticate the three plaintext predictions. It also does not exclude a nonlinear/stateful p50 operation, a source-selected traversal that changes which table cells are consumed, an external high-entropy pad, or another cipher family whose state is carried across words. Those alternatives now have to explain why the two predicted `THE` words share their first ciphertext mapping and diverge on the second rune.

## Reproduction

Run:

`node sims/lp2_p0_threecrib_p50_affine_gate_sft.cjs`

The same SFT now reproduces both the phase-zero/current-or-predecessor gate and the exhaustive DH2 ±2 circular-traversal extension.

The SFT reads only the canonical original p0 corpus, canonical p50 table and archived 2014 sexagesimal source, asserts all 28 source positions, exhausts the declared family, verifies the zero-survivor result and includes a planted exact positive.
