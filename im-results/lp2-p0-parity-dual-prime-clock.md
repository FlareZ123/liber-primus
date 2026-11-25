# p0–p1 parity-selected opposite prime clocks

The two opposed crosses on p0 and the signed 2016 wording about numbers and direction provide an exploratory reason to try two signed counters. There is **no authenticated parity rule or proof that the crosses encode counters**. The p56 solved prime-minus-one stream and literal-F bypass are the source-native parts of the proposed mechanism.

## Fixed reversible construction and search

After the 13-rune red p0 title, initialize the predecessor to the final title rune. GP ordinals are zero-based. The previous ciphertext rune modulo 2 selects lane l. Lane 0 uses sign +1 and lane 1 sign -1. Each lane has an independent starting prime offset o in 0..3300 (zero-based); its shift is sign times (prime[o + consumed] - 1) modulo 29. A literal plaintext F emits zero and holds that lane; all other runes consume the lane clock. The decoder considers both legal interpretations of ciphertext zero but disallows zero plaintext on a consuming branch. Encoding exactly reproduces ciphertext for every recovered full path.

The first 249 black-body runes of p0 are the training region; p1's 266 runes are a frozen continuation. No printed spacing hypothesis. Each lane's 3301 offsets are ranked by exact marginal-state maximum unigram likelihood over possible numbers of prior literal holds. Keep eight per lane, test the 64 pairs by exact trigram Viterbi over both hold counts and the last two plaintext runes. Freeze the winning pair, context, and both consumed offsets before p1; no reranking on p1. Native GP training is from relikd solved sections, excluding the specific control section on each positive. Additive 0.5 unigram prior, bigram backoff weight 8, trigram backoff weight 12.

## Actual result

| Input | Hidden offsets / recovered | Exact fit runes | Exact held runes | Prefix score | Held score |
|---|---|---:|---:|---:|---:|
| Native KOAN1 | (1033,3300) / same | 249/249 | 266/266 | -2.2292 | -2.3574 |
| Native LOSS OF DIVINITY | (3300,761) / same | 249/249 | 266/266 | -2.7915 | -2.6238 |
| Original p0→p1 | unknown / (500,646) | unknown | no legal continuation | -4.5486 | impossible |

True lane offset ranks are (1,1) and (2,1). Both controls re-encode exactly. Original best 249-rune prefix begins BIARIFSAOEAEMOETTNGJEDWEARHYAEHGSMASIRXTNGRSJRAEJIADOPF... and exactly replays. The fixed prefix state has no legal p1 path. The screen is exact within each lane; the joint search is restricted to 8×8 pairs and freezes one state. It **does not exclude every possible offset pair or alternate prefix state**, and no original plaintext has been recovered. Do not promote the candidate offsets to keys.

## Reproduction

[Script](../sims/lp2_p0_parity_dual_prime_clock_sft.cjs), [raw result](lp2-p0-parity-dual-prime-clock-output.json). Run with Node CommonJS from the repository root. The same function was actually executed in the connector JS runtime against the two repository inputs. No standalone Node or CI run has been claimed. Code/result commit ac64d91b983db9db6242236a11bcf01316a8c6c0.

**Decision:** retire this exact parity-clock recovery attempt. The inferred lane parity is exploratory, not authorial. Seek independent evidence before expanding offsets, introducing a new selector or searching further clock variants.
