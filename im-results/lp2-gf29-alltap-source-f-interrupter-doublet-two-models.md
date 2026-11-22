# Entire GP29 third-order family under solved-page F transparency and two distinct anti-doublet channels

**21 November 2026, Agent40. Status: two complete model-conditional exclusions on original LP2. No new plaintext, author-selected key, cipher mechanism, or destination authenticated.**

## Source and the exact unsettled decision

The solved LP2 p56 page demonstrates that a special *plaintext F* can pass through unmodified without consuming the GP29 key. The original 12,956 unknown runes (p0–p55) also exhibit severe adjacent-doublet suppression. However, no original page or authenticated Cicada message instructs transferring the p56 interrupter to all earlier pages, selecting a 0.81 stochastic anti-repeat rule, or using a linear recurrence to generate a key. These are plausible, fully reversible consumer hypotheses that would permit a complete plaintext recovery if correctly source-matched.

The previous all-tap exhaustive test [without F bypass](lp2-alltap-gf29-lfsr3-drifting-collision-exact-earlygate.md) rejected all 24,389 third-order GF29 recurrences **with key consumption on repeated ciphertext**. It could not exclude an additional F interrupter that stops the key clock, or a different anti-repeat operation that changes an emitted rune in place. We tested both as distinct and fully specified extensions.

The common GP29 generator is

```text
K[t+3] = a*K[t+2] + b*K[t+1] + c*K[t] (mod 29)
```

with **every** tap triple `(a,b,c)∈GF29³` and **every** possible secret initial triple `K[0..2]∈GF29³`. Source ciphertext rune order is the canonical p0–p55 stream, word/page markers ignored for key consumption. On plaintext rune **F=0**, output literal ciphertext F=0, do **not** advance the key, and do not apply anti-repeat filtering to that transparent output. On a non-F plaintext rune, tentatively compute `C=(P+K[t])%29` and advance the key; then one of two frozen suppression rules applies.

1. **Variant A, collision rejection:** if a tentative encrypted C equals the previous emitted C, reject it with probability `0.81`, consume the **next** recurrence key and retry the **same** plaintext rune. A positive F=0 emission bypasses the retry mechanism, so a ciphertext C=F has either a latent transparent or an encrypted source.
2. **Variant B, output rewriting:** if a tentative encrypted C equals the preceding emitted ciphertext, replace it with one of the other **28 runes uniformly** with probability `0.81`. Only **one** key value is consumed per non-F plaintext regardless of rewriting. A transparent F=0 still consumes none.

These are **different original-cipher architectures**; failure of one does not imply failure of the other. Both interpolate historically demonstrated p56 F skipping with a plausible explanation of the independently observed doublet deficit. Neither attempts arbitrary drift, phase, key fitting, or a changed alphabet after looking at the ciphertext.

## Exact all-seed probabilistic inverses

Each candidate uses a fully normalized finite-state forward HMM over all **29³=24,389 secret initial key states**. Every observed 0 rune branches between the hidden transparent-F path (same key state) and non-F encryption path (advance key). For Variant A, the HMM sums *every* possible collision-rejection history; the third-order recurrence permits at most three equal successive keys unless it enters a constant fixed point, whose infinite retries are exactly a geometric sum. For Variant B, an observed ciphertext can arise from its ordinary unmodified GP29 emission or from any of the 28-way rewrites of a key-dependent tentative repeated output, with exactly one key advancement on both paths.

The test's encrypted plaintext is an independently fitted source-native GP29 English unigram from `resources/control/shakespeare_first300k.txt`, with 1 pseudocount per GP rune. The fixed null in **each** branch is a uniform, independent cipher key with **the same transparent-F probability and the same specified anti-repeat filter**. Its exact first-rune and subsequent-rune probabilities are used at each position. No unknown LP2 runes train the plaintext model.

Before original scoring, we fixed an anytime log likelihood-ratio test against the matched null:

- `logLR <= -10`: **EXCLUDED**;
- `logLR >= +30`: **FIRES**;
- otherwise at the end of the stream: **UNRESOLVED**.

Under the precise source-independent fixed model, the likelihood-ratio martingale bounds false exclusion of a genuine member by `exp(-10)≈4.54e−5`, and null familywise false fire by `24,389*exp(-30)≈2.28e−9`. The original text's possible non-English preamble, alternate rune language statistics, nonstationary key, nonlinear recurrence, or page/chapter clock resets are **outside** these bounds.

## Complete original-input outcomes

All 16 manually dispatched Windows Node.js 22 runs completed **successfully**. In each partition, an independently seeded hidden-plaintext GP29 synthetic with real F bypasses and actual extra consumed keys (Variant A), or real F bypasses and actual output rewrites (Variant B), crossed the positive +30 boundary. A flat-source, filter-matched null control reached the negative −10 boundary in each partition.

| Partition | Tap triples | A: exclusion count | A: last original position | B: exclusion count | B: last original position |
|---|---:|---:|---:|---:|---:|
| 0 | 3,048 | 3,048 | 123 | 3,048 | 121 |
| 1 | 3,049 | 3,049 | 110 | 3,049 | 108 |
| 2 | 3,048 | 3,048 | 113 | 3,048 | 109 |
| 3 | 3,049 | 3,049 | 125 | 3,049 | 135 |
| 4 | 3,049 | 3,049 | 115 | 3,049 | 116 |
| 5 | 3,048 | 3,048 | 113 | 3,048 | 121 |
| 6 | 3,049 | 3,049 | 105 | 3,049 | 122 |
| 7 | 3,049 | 3,049 | 108 | 3,049 | 120 |
| **Total** | **24,389** | **24,389** | **125 overall** | **24,389** | **135 overall** |

For **both** variants, FIRES = **0**, UNRESOLVED = **0**. Variant A evaluated **1,450,945** original ciphertext-rune events in total, mean **59.49178** per tap triple before exclusion. Variant B evaluated **1,650,874** source events, mean **67.68929** per tap. The stationary English-original model is rejected within the original p0 preamble for every third-order tap triple under the frozen decision rule. This means a genuine later-page key schedule with a changed p0 language or reset would still require a new, independently motivated test.

### Auditable Windows CI output

| Partition | Variant A, key-consuming skip | Variant B, output rewrite |
|---|---|---|
| 0 | [44929958551](https://github.com/FlareZ123/liber-primus/actions/runs/44929958551) | [44930289875](https://github.com/FlareZ123/liber-primus/actions/runs/44930289875) |
| 1 | [44930063943](https://github.com/FlareZ123/liber-primus/actions/runs/44930063943) | [44930546138](https://github.com/FlareZ123/liber-primus/actions/runs/44930546138) |
| 2 | [44930067915](https://github.com/FlareZ123/liber-primus/actions/runs/44930067915) | [44930550121](https://github.com/FlareZ123/liber-primus/actions/runs/44930550121) |
| 3 | [44930071724](https://github.com/FlareZ123/liber-primus/actions/runs/44930071724) | [44930554432](https://github.com/FlareZ123/liber-primus/actions/runs/44930554432) |
| 4 | [44930079814](https://github.com/FlareZ123/liber-primus/actions/runs/44930079814) | [44930557912](https://github.com/FlareZ123/liber-primus/actions/runs/44930557912) |
| 5 | [44930083959](https://github.com/FlareZ123/liber-primus/actions/runs/44930083959) | [44930561582](https://github.com/FlareZ123/liber-primus/actions/runs/44930561582) |
| 6 | [44930088559](https://github.com/FlareZ123/liber-primus/actions/runs/44930088559) | [44930565997](https://github.com/FlareZ123/liber-primus/actions/runs/44930565997) |
| 7 | [44930093424](https://github.com/FlareZ123/liber-primus/actions/runs/44930093424) | [44930569886](https://github.com/FlareZ123/liber-primus/actions/runs/44930569886) |

Run every candidate through [Variant A exact HMM](../sims/lp2_lfsr3_fskip_collision_core.cjs) and [Variant B exact HMM](../sims/lp2_lfsr3_fskip_rewrite_core.cjs), via one of eight `_part0_sft.cjs` … `_part7_sft.cjs` entrypoints for each. Scripts implement the exact full-state forward probabilities and print the per-partition results, including planted hidden seeds, actual number of skipped key outputs or rewritten glyphs, and longest original candidates.

## Research decision

Retire both finite third-order additive GP29 recurrence families **with p56 plaintext-F transparency**, regardless of their initial seed. For 0.81 collision suppression, both the drift-through-key-skips case and the in-place output-rewrite case are eliminated under the source-frozen stationary-English model. Together with the independently tested no-F key-consuming skip model, this covers **three mathematically distinct exact all-tap original-cipher models** without resorting to one-shot string-pattern scoring or arbitrary beam search.

No unknown LP2 plaintext or cryptographic key has been recovered. The missing high-value input is a **creator-authenticated key-source/operation selector**, especially one with a forward original-cipher plaintext prediction and mechanism for the observed suppression and lag-five behavior. Without such an input, searching larger nonlinear or high-entropy key generators simply multiplies unfalsifiable choices. Preserve these negative methods as intermediate results, and do not promote them to the authoritative `results/README.md` as solutions.
