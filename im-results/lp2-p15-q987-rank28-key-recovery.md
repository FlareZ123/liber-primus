# P15 maximum Fibonacci ordinal: blind and source-addressed period-987 key recovery

## Decision

A blind long-key decoder recovers 964/987 and 943/987 secret shifts from two independently keyed native prose controls, correctly identifying the escape, clock and transport. It recovers 3,240/3,316 and 3,161/3,316 withheld runes respectively. The original p16–55 receiver produces incoherent held text, with only 2/15 withheld singleton positions in the native A/I/O grammar. Retire this particular source-sized receiver unless independent evidence selects a different representation. This is a predictive search negative, **not an exhaustive exclusion of all period-987 keys**. A subsequent historical fixed-row operand construction also fails four bounded layouts and four receiver families; see the source-addressed continuation below.

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


## Source-addressed key continuation — Agent48, 27 November 2026

A distinct fixed-key construction connects the p15 spiral to the documented 2013 Twitter data dimensions. The [archived Twitter instructions](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/README.md) give `Offset: 0, Skip: 0, Col: 65, Line: 988`. The original p15 Fibonacci indices are F = 0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987; its grid equals abs(3301 − prime(F+1)). Thus the 1-based prime ordinals also index 16 real records of the 988-row historical stream. Selecting F in ascending byte-address order produces precisely 987 bytes (15 full rows of 65 and the 12-byte final row). This is a concrete retrospective correspondence, **not an independently authenticated LP2 instruction**: selecting any fifteen full rows plus the final row would have the same length.

### Receiver and result

Pin archive commit ade9a02889ef8acbc8cde8edbfd0a785c369f4c3. Reassemble the actual 64167-byte tweet stream T by hex offset (record i starts at 65i); align it with the archived b64.txt B and gematria.jpg G. The documented XOR relations select six aligned byte operands T, B, G, T XOR B, T XOR G, B XOR G (the last two are reconstructed audio/data prefixes, not newly downloaded full original files). Select the fixed sixteen rows from each. Four layouts are tested: spiral versus physical row-major grid order, with concatenated records or column-wise readout skipping absent final-record bytes. All preserve exactly the same 987 byte positions. The latter layouts are conventional bounded choices, not claims of authored direction. No arbitrary row permutation or phase tuning.

Three local starts: p15 lower rubric at rune 9, black body at rune 20, and p16 at rune 0. Test both additive signs, direct GP29 addition and first difference, exact transparent-F branch reachability, literal byte XOR, and three nonrepeat rank28 transports with all 29 escape runes and both repeat clocks. Key byte reduction and periodic continuation are hypotheses. Score the first 987 decoded runes, freeze the selected rank configuration per source/start, and score p40–53 (3008 runes) without refit. The score is a smoothed trigram log-likelihood ratio versus uniform, trained on 2585 LP1 editorial native-orthography runes; withheld LP1 408 runes score +0.892812 and clear p57 +0.831319 nats/rune. Higher is better.

| Layout | Best direct fit / hold | Best rank28 fit / hold | Longest transparent-F prefix |
|---|---:|---:|---:|
| Spiral rows | −1.9591 / −2.1283 | −1.7972 / −2.0379 | 218 |
| Spiral columns | −1.9584 / −2.1370 | −1.8009 / −2.0056 | 187 |
| Physical rows | −1.9230 / −2.1858 | −1.7957 / −1.9909 | 334 |
| Physical columns | −1.9558 / −2.1735 | −1.8328 / −2.0118 | 341 |

All 288 direct and 25,056 rank configurations are nonprose, with no positive fit score. All 144 transparent-F receivers have no full legal decoding path. All 72 literal XOR attempts produce out-of-alphabet indices. The spiral-row F failures precede the first divergence from the unselected historical stream at byte 260; this subset cannot independently discriminate record selection. The other layouts diverge earlier. Positive planted controls: 96 direct roundtrips, 48 F path-existence checks, 288 rank roundtrips, using the same withheld native donor. All pass. Exact original replay for direct and selected rank candidates is an implementation invariant, not key evidence. No unknown plaintext or authentic key recovered.

The first four spiral-selected records are consecutive, so any zero-origin direct 256-byte test against p50 is already covered by the historical full-stream tests and is not repeated. Retire these fixed-row receivers; do not infer new byte selection, ordering or phase from failure. The source correspondence remains a documented hypothesis, and neither this nor the earlier blind inverse excludes arbitrary period-987 constructions.

Reproduction: [SFT](../sims/lp2_p15_twitter_fibonacci_rows_sft.cjs) (historical directory argument, then optional layout name: spiral-rows, spiral-columns, physical-rows, physical-columns); [spiral-row raw](lp2-p15-twitter-fibonacci-rows-output.json), [other layout raw](lp2-p15-twitter-fibonacci-layout-output.json). Exact computation executed in V8; standalone Node wrapper and CI not separately executed. Wrapper checks pinned input Git blobs. Original corpus and editorial reference unchanged.
