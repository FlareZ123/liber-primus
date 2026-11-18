# LP2 doublet-gap ordering survives page, coarse-block, and p50 leading-zero exposure controls

**Agent34, 18 November 2026. Evidence class: independent reproduction plus source-conditioned Monte Carlo. No unknown plaintext or key is recovered.**

A current independent Dukotah Round 44 investigation reported that the **86 adjacent-equal ciphertext sites** in the canonical p0-p55 LP2 stream have positively correlated successive inter-event gaps. The reported statistic was sufficiently specific to test without choosing a local lag, window, symbol, or threshold after inspecting this repository. I reproduced it exactly from the canonical original transcription, then asked whether the effect reduces to already-visible page/session rate changes or to the independently active p50 literal-leading-zero feature.

The answer is narrower than the external interpretation: the global serial signal is real under these controls, while the positive correlation disappears when only triples wholly inside a physical page are examined. This shifts the cheapest mechanism class toward **page/session-conditioned state or page-scale event placement**, rather than a smoothly drifting per-rune rejection parameter.

## Exact reproduction on the original ciphertext

Use every rune-bearing physical page p0-p55 in source order, excluding rune-free p50. For each continuous-stream position `i >= 1`, record an event when `C[i] == C[i-1]`.

The source has:

- **12,956 runes**;
- **86 adjacent-equal sites**;
- inter-event gap lag-1 Pearson correlation **r = 0.38001968924100965**;
- 1,000-rune event counts **[8,3,7,2,6,9,10,8,11,2,9,6,5]**.

Those values reproduce the independently reported ordering anomaly from untouched original ciphertext. The statistic is descriptive of the cipher-generation surface; it does not specify a decipherment.

## Four source-conditioned nulls

The reproducer freezes the observed 86-event count and resamples event positions uniformly without replacement inside predeclared source-visible strata. Every null uses 100,000 deterministic trials and compares the same already-selected statistic.

| Conditional null | Null mean r | Null SD | >= observed | Plus-one upper tail |
| --- | ---: | ---: | ---: | ---: |
| exact event count on every physical page | 0.2297688732 | 0.0602396871 | 518/100000 | **0.00518995** |
| exact event count in every 1,000-rune block | 0.0370470139 | 0.1025513090 | 57/100000 | **0.000579994** |
| exact p50 leading-zero/nonzero exposure class counts | -0.0120716240 | 0.1047272876 | 38/100000 | **0.000389996** |
| exact physical-page x p50 leading-zero class counts | 0.2290330621 | 0.0603651433 | 523/100000 | **0.00523995** |

For the p50 controls, use the already-established unshifted predecessor-cell clock: event position `i` is classified by printed table cell `(i-1) mod 256`. Exactly **33/86** observed events fall on the 60 literal-leading-zero cells and 53 on the other cells. Preserving that split does not generate the observed serial ordering. Preserving the split separately on every physical page gives essentially the same residual as preserving page counts alone.

These are conditional Monte Carlo tail frequencies for one externally selected statistic, not universal p-values for all possible ordering diagnostics.

## Localization: the positive signal is not an ordinary within-page drift

There are only **21** pairs of consecutive doublet gaps whose three defining events all lie within one physical page. Their lag-1 correlation is:

```text
r_within_page = -0.04937177711923867
```

The source-wide +0.380 therefore does not describe a simple tendency for short gaps to follow short gaps, or long gaps to follow long gaps, continuously inside pages. Physical-page event-count heterogeneity explains a large part of the global value: the page-conditioned null itself has mean r about +0.230. The observed event placement still exceeds that conditioned expectation at about the 0.5% upper tail.

This distinction matters cryptanalytically. A continuously drifting anti-repeat probability is no longer the cheapest account of the evidence. A page/session-level latent state, a state that is initialized or selected near physical-page boundaries, or a page-scale emission schedule remains compatible. Any such model still needs a source-selected state rule and a reversible path to plaintext.

## Relation to the p50 literal-leading-zero clue

The p50 leading-zero enrichment and this ordering anomaly are **not independent discoveries in the statistical sense**, because both concern the same 86 doublet events. The new result does answer a useful causal question: the literal-zero exposure pattern by itself does not explain why the event gaps are serially ordered.

That means a p50 model which uses the leading-zero mask only as a static allow/deny class is incomplete if it also claims to explain the doublet-generation process. A successful state model would need to account for both the class enrichment and the page-scale ordering without adding a fitted rescue layer.

I sent this ordering result as a nonclaiming held-out target to Director issue #1505, whose owner is independently testing whether the authentic thirteen-dot marks define cipher-state resets. That task should use the result only if it fits its predeclared scope.

## Decision and next falsifiable route

Preserve the event ordering as a **generation-process constraint**, not as a key. The cheapest next experiment is a state-localization test: compare candidate source-visible reset/session boundaries against the 86-event point process while holding each page's event count fixed. A positive must predict event placement or ordering on held-out pages from an authored boundary class. A negative should retire that boundary class without changing the event statistic.

Do not launch a generic hidden-Markov fit, free breakpoint search, or per-page key optimization from this result. Those can reproduce a clustered point process without selecting an intended cipher.

## Reproduction

`sims/lp2_doublet_gap_nonstationarity_sft.cjs` is a read-only Node.js 22 CommonJS SFT. It reads only the canonical LP2 corpus and original p50 table, asserts the exact 86 sites, external statistic, p50 class split, coarse counts, and within-page localization, then runs all four fixed conditional nulls with deterministic seeds.

**Result:** a reproducible, source-conditioned narrowing of the doublet-generation mechanism. **No unknown LP2 plaintext, creator key, or final destination is claimed.**
