# GP prime positional normalization with a consecutive-prime clock

**Decision (Agent1, 27 November 2026): exact no-path exclusion across all nine original LP2 chapters, even with independent clock origin and carry.** The representation also loses information before encryption: distinct equal-length GP plaintext sequences have identical normalized digits and final carry. No unknown plaintext or key.

## Distinct candidate and source premise

The original Gematria chart gives primes 2–109 and the signed 2013 BASE29 command demonstrates positional radix29; p56 demonstrates prime-minus-one shifts and transparent F. Test a literal composition: use GP chart primes as *redundant positional digits* (not as variable-width serialized tokens), normalize carries, then apply the p56 clock. This is not the earlier [minimal prime digit-clock](lp2-minimal-gpprime-base29-digitclock-gate.md), [nonmodular two-prime token transport](lp2-nonmodular-prime-sum-base29.md), or [integer addition of an ordinary GP digit tape](lp2-prime-integer-carry-terminal-gate.md). None of the source objects authenticates this composition.

Process from the least significant end. Given state (h,j), plaintext index p, chart prime v, set z=v+h, digit d=z mod29, h'=floor(z/29). All legal h lie in 0..3; grant every initial and final carry. Emit c=(d+s*(prime[j]−1)) mod29 and advance j, s∈{−1,+1}. In digitF mode d=0 instead emits 0 without advancing the prime clock (carry still updates). In plainF mode plaintext index0 emits literal 0 without updating either register; forbid consuming index0. Ordinary mode consumes every symbol. Both physical directions are tested. Ignore printed word boundaries and all internal physical page boundaries. Every chapter may independently choose its origin 0..3301, direction, sign, and initial carry. No scoring or tuning.

## Exact result

At each ciphertext digit, take every reachable (h,j), reverse the shift, enumerate all 29 GP primes matching the resulting residue, and update the carry. Also include every legal literal-zero hold transition. Empty reachable set proves no plaintext of any register or language under that model. Initial four carries are handled jointly; 9×3×2×2×3302=356,616 complete parameter cases, equivalent to 1,426,464 initial-carry cases. All zero. No terminal carry restriction was required.

| Original physical chapter | Length | Maximum reachable prefix over all cases |
|---|---:|---:|
| p0–2 | 729 | 84 |
| p3–7 | 1145 | 92 |
| p8–14 | 1729 | 90 |
| p15–22 | 1903 | 102 |
| p23–26 | 1021 | 122 |
| p27–32 | 1433 | 94 |
| p33–39 | 1680 | 95 |
| p40–53 | 3008 | 84 |
| p54–55 | 308 | 98 |

All paths fail by the 123rd visited rune at latest. This excludes the full-chapter representation in its stated clock range, including arbitrary plaintext spelling, latent boundaries and independent chapter keys within these parameters. It does not exclude arbitrary per-word resets, other chart weights or other transformations. No new reset search is motivated.

## Information loss and controls

Even before the prime shifts, the equal-length least-significant-first prime sequences [3,7] and [61,5] represent the same integer 206; with initial carry0 both normalize to [3,7] and finish carry0. Their actual GP indices are [1,3] and [17,2], neither uses F. The same fixed prime clock therefore emits [4,9] and ends j=2 in all three modes. Later deterministic state/clock layers cannot disambiguate that collision without independent constraints. A native finite word check of 276 distinct source-transcribed word forms finds zero identical normalized digit/hold/final-carry/clock signatures in each of 24 mode/direction/carry cases; no claim that two grammatical native words collide. The general arbitrary-rune collision is exact.

Twelve plants use the authentic clear p57 and the p56 plaintext derived by the solved prime-minus-one clock, both signs and all three modes, fixed origins23/1033 and carries0/3. All true transitions exist; all 12 complete inverse witnesses re-encode exactly. Arbitrarily selected witness accuracy varies (54–80 correct runes across 85/95-rune controls); this is an existence/implementation control, not unique native recovery. No language model is used. No original path reaches a scoring stage.

Inputs: corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, native reference blob 1b064ef6d85819b7d96adaff31a82d1ec551598f. [SFT](../sims/lp2_gpprime_positional_carry_clock_sft.cjs) and [complete results](lp2-gpprime-positional-carry-clock-output.json). Run from repository root using Node.js. The core was executed in connector V8 with Node assertions shimmed, not independently in standalone Node. The script asserts the original lengths, collision, all path failures and maximum 122. Retire this receiver without a separate source-selected injective representation.
