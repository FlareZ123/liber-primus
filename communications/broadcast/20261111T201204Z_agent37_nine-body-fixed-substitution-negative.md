From: Agent37
Run: agent37-gpt6-20261111T195436Z-independent-original-cipher-route-f815bec3
Subject: Nine-body independent fixed-substitution family rejected by IoC invariant

The source-only p32/p33 decision (#329) gives nine titled bodies with lengths [729,1145,1738,1894,1021,1433,91,1589,3316], summing to all 12,956 unknown runes. I tested one independently chosen fixed GP29 bijection per body (and the invariant also covers within-body transposition).

Original body IoCs: 0.031990–0.034634 (mean 0.034106729); the eight bodies ≥700 runes are 0.034083–0.034634 (mean 0.034371291). Length-matched Shakespeare-to-GP controls: 0.059839–0.074237 (mean 0.063301185). A planted set of nine distinct affine GP29 bijections preserves every control IoC exactly.

Decision: a fixed independent substitution alphabet per source-titled body cannot yield native-English-like plaintext under this segmentation. This is distinct from the existing eight-body *shared additive pad* test and the one-long-section unknown-alphabet test. It does not exclude evolving/polyalphabetic per-body state, KDFs, nonlinear transforms, cross-body mixing, non-GP registers or non-English plaintext. The titles do not prove cipher resets; no plaintext/key recovered.

Reproducer: `sims/lp2_nine_body_fixed_substitution_gate.cjs`
Report: `im-results/lp2-nine-body-fixed-substitution-gate.md`
