# 2013 Cicada OS wisdom/folly: exact raw-generator state gate

## Question

Can the surviving 3,368-byte historical wisdom/folly object supply a reproducible generator state rather than an arbitrary pad? Its length exceeds a full MT19937 state in bits. The source does not identify a generator; the following is a bounded direct test of historical raw-output conventions, not a claim that LP2 uses one. Source and extraction: [classification](2013-os-wisdom-folly-source-classification.md). Source SHA256: `7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a`.

## Exact tests

For packed 32- and 64-bit MT words, invert tempering on the first 624 or 312 outputs and predict the remaining words from the recurrence, both byte orders. For truncated 32-bit outputs, construct symbolic recurrence and tempering bit equations over GF(2), granting all 19,968 bits of the initial stored window independently (a superset of valid MT states); perform exact elimination. Any contradictory row excludes every initial state, not merely tested seeds. Test both high and low bytes of each output and of alternate outputs. The high-byte stride-2 convention includes historical Python floating random scaled by 256. Also grant the previously considered four-byte prefix frame.

| Model | Original result | Four-byte prefix removed |
|---|---|---|
| MT19937 packed LE/BE | 0/218 predicted words each | 0/217 each |
| MT19937-64 packed LE/BE | 0/109 each | 0/108 each |
| MT high8 stride1 | contradiction at byte 2493 | 2493 |
| MT low8 stride1 | contradiction at byte 1250 | 1249 |
| MT high8 stride2 | contradiction at byte 2181 | 2181 |
| MT low8 stride2 | contradiction at byte 2493 | 2492 |

Byte positions are zero-based. Java Random.nextBytes: exhaust all 65,536 low state bits consistent with first 32-bit output; no candidate survives second word with or without prefix. Default glibc degree31/lag3 additive random() low byte: output recurrence differences mod256 must be 0 or 1; 3310/3337 and 3306/3333 violations respectively.

## Controls and limitations

Four packed plants predict the entire held suffix; 64-bit reference output checked against known standard vector. Java plant uniquely recovers the state path; additive glibc recurrence plant passes every test. Four independent Python Random truncated plants are consistent over all 3,368 bytes; freeze first 3,000 bytes and test held suffix. High8 stride1 and low8 stride2 determine every held bit, all correct. Low8 stride1 and high8 stride2 leave free state dimensions: respectively 1,880 and 261 individually forced held bits, all correct, and no uniquely forced complete byte. An arbitrary completion matches only 118/368 and 61/368 bytes; these are not rejection evidence. The exact contradiction test, not an arbitrary state's predictive mismatch, decides the original. Full plant streams have no contradiction. The float convention was checked against Random.random()*256.

No original plaintext, state or key recovered. Retire these exact raw-output models; transformed, encrypted, skipped irregularly or differently generated data are not excluded. No source-selected LP2 receiver follows. Do not expand seed searches in these already impossible models.

Reproduce with [Python SFT](../sims/wisdom_generator_sft.py) and [recorded output](cicada2013-wisdom-folly-generator-state-output.json). Locally executed Python 3; no third-party dependencies. Reference implementations: [MT author code](https://github.com/MersenneTwister-Lab/dcmt/blob/master/lib/mt19937.c), [Java 7 Random](https://docs.oracle.com/javase/7/docs/api/java/util/Random.html), [Python 2.7.3 random](https://github.com/python/cpython/blob/v2.7.3/Lib/random.py).
