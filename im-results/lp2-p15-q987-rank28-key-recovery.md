# P15 maximum Fibonacci ordinal: period-987 rank28 key recovery

## Decision

A blind long-key decoder recovers 964/987 and 943/987 secret shifts from two independently keyed native prose controls, correctly identifying the escape, clock and transport. It recovers 3,240/3,316 and 3,161/3,316 withheld runes respectively. The original p16–55 receiver produces incoherent held text, with only 2/15 withheld singleton positions in the native A/I/O grammar. Retire this particular source-sized receiver unless independent evidence selects a different representation. This is a predictive search negative, **not an exhaustive exclusion of all period-987 keys**.

## Hypothesis

The original p15 spiral is exactly reproduced by the Fibonacci-indexed prime construction described in [the established result](../results/lp2-p15-fibonacci-prime-spiral.md). The maximum Fibonacci ordinal is 987. Hypothesize, without asserting an authored instruction, that this fixes a repeated additive cycle of 987 rank28 shifts for the following 40 physical pages (p50 has no runes). Unlike the established period 1–256 capacity experiments, this attempts constructive key recovery beyond that range.

For successive ciphertext runes u,c, a repeat emits a fixed native escape e (all 29 considered); nonrepeat rank R is either (c−u mod29)−1, log base15 of the nonzero difference in GF29, or the sorted rank of c excluding u. Let the unknown cycle K have 987 entries mod28. The plaintext is the unrank of (R−K[t mod987]) mod28 excluding e. On a repeat either hold or consume one clock tick. Initial rune is a clear public IV. Each key has an explicit forward map; no missing sidecar is assumed.

## Recovery procedure

- Original 9,194 runes of p16–55, fit p16–39 (5,878 runes), freeze p40–55 (3,316 runes). This is an experiment-specific split, not a globally unseen manuscript interval.
- Native grammar A/I/O at the 43 printed singleton sites in the fit partition gives exact per-phase masks. All 174 original clock/rank/escape configurations survive these masks.
- Independently trained Shakespeare smoothed unigram scores maximize each phase over all allowed 28 shifts. Keep the top 12 configurations by fit score alone.
- For each, use exact open-chain bigram Viterbi, omitting the wrap edge, with all 28 shifts and the singleton masks. Then perform full-trigram coordinate refinement on the original fit only, including the wrap. This stage is approximate and may miss keys; no claim of an exact cyclic trigram optimum.
- Select the maximum fit score, freeze its complete key and replay the full original tape, then score the held runes without refitting.

## Actual results

| Input | Selected true configuration | Recovered key shifts | Frozen rune recovery | Fit nats/rune | Held nats/rune |
| --- | --- | ---: | ---: | ---: | ---: |
| Gibran, hold/cyclic, NG escape | yes | 964/987 | 3240/3316 | −2.307527 | −2.368889 |
| Emerson, consume/log15, EA escape | yes | 943/987 | 3161/3316 | −2.439288 | −2.721321 |
| Original | unknown | unknown | unknown | −3.475203 | −6.378536 |

Both hidden control configurations rank first in the independent unigram screen, and both recover recognizable continuation with minor errors. In the original, even the best fit is substantially below either native control; the frozen continuation is incoherent. Its selected configuration is hold/log15, escape IA=27. Both controls and original selected receiver have exact forward replay (an implementation invariant, not independent key evidence). Original key output is preserved as a rejected candidate, not an authentic key.

## Reproduction and limitations

[CommonJS SFT](../sims/lp2_p15_q987_rank28_key_recovery_sft.cjs), commit 83f23e308df6abd6e96813eb85b78dce0ff06d15; [raw output](lp2-p15-q987-rank28-key-recovery-output.json), commit b545d0ad373cebe97a3a9347708436c22e67185d. Exact same core executed in the connected V8 runtime; standalone Node wrapper not separately executed. Donors use existing native orthography approximation; no actual unknown text is assumed.

This is a scoped constructive negative. The source establishes the ordinal, not its use as key length. Do not repeat this receiver with arbitrary nearby lengths or phase tuning without an independent selector.
