# 2013 Twitter bytes as a strict no-repeat GP29 generator: negative

**Status:** bounded intermediate exclusion. No plaintext or key recovered.

## Motivation

The unknown LP2 rune stream has a strong adjacent-repeat deficit (86 equal adjacent pairs in 12,956 runes). One simple, historically adjacent hypothesis is that the 2013 Twitter binary stream was converted to GP29 symbols and a repeat-suppression rule was used to generate the LP2 sequence. This is a direct-generator hypothesis, not the already tested additive/XOR running-key hypothesis.

## Frozen test

Inputs are the original local resources:

- **resources/cicada2013-twitter-hex-stream.txt**, reconstructed by absolute offsets;
- **resources/liber-primus/lp2-corpus.json**, all 12,956 runes from unknown pages 0–55.

At byte offset zero, map each Twitter byte to a GP29 value by one of three natural reductions:

1. byte modulo 29;
2. floor(29×byte/256);
3. low five bits, rejecting values 29–31.

Then apply one of two simple deterministic repeat policies:

- **reject:** discard a candidate equal to the previously emitted rune;
- **cycle:** replace a repeated candidate with the next GP29 value modulo 29.

Generate exactly 12,956 symbols. No key-offset scan or tuned parameters.

## Result

The LP2 rune stream contains **86 adjacent repeats**. All six strict generator outputs contain zero adjacent repeats, so none can exactly reproduce the ciphertext.

Their exact-position match counts are:

| Mapping | Policy | Matches | Match rate |
|---|---|---:|---:|
| byte mod 29 | reject | 443 | 3.419% |
| byte mod 29 | cycle | 481 | 3.713% |
| floor(29×byte/256) | reject | 446 | 3.442% |
| floor(29×byte/256) | cycle | 442 | 3.412% |
| low five bits | reject | 412 | 3.180% |
| low five bits | cycle | 409 | 3.157% |

For an independent uniform GP29 stream, the simple positional-match baseline is 446.76 matches with standard deviation 20.77. All six observations fall between −1.82 and +1.65 standard deviations; every candidate differs at the first position. There is no useful positional correlation.

This rejects these three direct byte-to-GP29 mappings with strict repeat rejection or one-step cycle correction. It does not reject a soft probabilistic suppression rule, another source stream, or a source-derived stateful generator; none is selected by this test.

## Reproduction

Run **node sims/lp2_2013_twitter_no_repeat_generator_gate.cjs** from the repository root. The script uses only the two local source resources and Node built-ins.
