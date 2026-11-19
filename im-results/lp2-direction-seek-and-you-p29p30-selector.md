# DIRECTION SEEK AND YOU selects p29/p30 and closes a direct p32 Hill4 consumer

**Agent4, 19 November 2026. Classification: new source selector for the established p29/p30 complementary spectral pair; prospectively frozen direct p32 consumer is negative. No unknown plaintext is claimed.**

## Source-selected pair

The authenticated signed source has:

```text
29 DIRECTION
30 SEEK
31 AND
32 YOU
33 WILL
34 BE
35 FOUND
```

The p32/p33 `THEIR RISE` chain independently reaches index29 `DIRECTION`, so this is a continuation of an already selected source position rather than a fresh word search.

Physical p29 is uniquely the unknown page with a double GF29 root24. Physical p30 is uniquely the unknown page vanishing at both p15 complementary roots8 and17. Therefore the consecutive source words **DIRECTION29 / SEEK30** select exactly the already established adjacent p29/p30 spectral pair before consulting its factors.

This gives a second, simpler source route to the pair alongside the p57 FIND -> p28 prime-run -> shed-endpoints interpretation.

## AND supplies the missing sum instruction

The prior p29/p30 spectral report defined:

```text
A = P29(M)
B = P30(M)
K = A + B
```

where M is the signed p15 GF29 matrix. A and B each have rank2, `AB=0`, and K is full-rank. That report explicitly marked the choice to sum A+B as exploratory because no source instruction selected it.

The authenticated next word is **31 AND**. Under the same source-number route, AND supplies a direct human-facing reason to combine the selected p29 and p30 objects. This strengthens K as a source-motivated object. It does not by itself specify a ciphertext receiver or prove that matrix addition is the intended semantic of AND.

## Precommitted p32 receiver gate

Before opening p32 outputs, `workplace/agent4-direction-seek-and-you-p32-precommit.md` froze one direct interpretation:

```text
DIRECTION29 -> p29
SEEK30      -> p30
AND31       -> K=P29(M)+P30(M)
YOU32       -> physical p32 receiver
```

P32 has121 runes. Without padding there are exactly two complete 120-rune boundary windows, leaving either the first or last rune unmatched. Charge K, K^-1, transpose(K), and transpose(K^-1), giving eight reversible outputs. The primary target was a prefix equal to canonical GP29 `YOU WILL BE FOUND`; the secondary fixed diagnostic searched the same complete phrase anywhere in each output.

Windows run [44458531520](https://github.com/FlareZ123/liber-primus/actions/runs/44458531520) passes the frozen test. All eight outputs round-trip exactly and the planted source-native control is exact.

Result:

```text
prefix hits: 0 / 8
anywhere hits: 0 / 8
IoC range: 0.03165 .. 0.03894
```

Every fixed prefix is nonlinguistic. The direct summed-Hill4 p32 consumer therefore fails.

## Decision

Preserve two distinct conclusions:

1. `29 DIRECTION 30 SEEK` is a source-side selector for the already unique p29/p30 complementary spectral pair.
2. `31 AND` gives the previously missing human reason to consider the existing full-rank sum K=A+B.

Retire the direct interpretation `32 YOU -> apply K or K^-1 to a raw 120-rune p32 boundary window`. Do not tune p32 phases, affine offsets, matrix permutations, padding, alphabet maps, or hidden layers after this miss.

The next useful consumer must be selected by another authored feature of the sentence or manuscript, rather than rescued from the failed p32 matrix outputs.

## Reproduction

- Precommit: `workplace/agent4-direction-seek-and-you-p32-precommit.md`
- SFT: `sims/lp2_direction_seek_and_you_p32_gate_sft.cjs`
- Workflow: `.github/workflows/agent4-direction-seek-and-you-p32.yml`
- Windows PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44458531520
