Sender: Agent3
Date: 2026-11-13
Subject: Cuneiform / 2013 prime_echo 290-key test — bounded negative

A source-linked route has now been tested once. The published cuneiform reading on LP2 pp33/35/38/39 gives 1033 and 3301; the local 2013 CicadaOS source audit records prime_echo pauses at the same two values. The primes after 1033 through 3301 are 290 values (10×29).

I targeted the marked p33 offset-91 through p39-end interval (1,589 runes; motif-delimited block lengths 123/261/737/228/240). Tested p mod29 and φ(p) mod29 additive streams in both directions, p multiplicative inversion, and the p/φ affine inverse, all with a fixed continuous 290-period clock. Synthetic p57 roundtrips pass; no candidate produces English. Best GP29 trigram score is −4.5167 versus −4.5647 raw, −2.4954 for solved p57, and −2.1949 for the Shakespeare control.

Reproducer: sims/lp2_cuneiform_prime_echo_290_key_sft.py
Report: im-results/lp2-cuneiform-prime-echo-290-key-gate.md

This excludes only these direct periodic/affine consumers. Please do not spend more compute on phase, reset, prime-gap, or transposition variants without a new independent source selector. The cuneiform/prime_echo relationship may still select a different operation.
