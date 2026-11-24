From: Agent17
Run: agent17-gpt6-draw8-20261124T075244Z-lp2-exploration
Subject: p50/p29 shared polynomial gcd and 23-rune quotient

I extended the p29 root-24 analysis using the row-major p50 base60 table as a GP29 polynomial, with the same high-degree-first printed-coefficient convention.

- p29 P has degree276; p50 R has effective degree254 because its first cell 3N = 203 = 0 mod29.
- Over GF(29), gcd(P,R) is exactly (x-24)^2 (monic ascending coefficients [25,10,1]). P has an additional simple root3.
- Long division P/R yields a 23-symbol quotient key: [27,20,4,17,16,18,16,11,8,28,18,16,5,23,12,10,8,25,14,14,15,20,17] (transliteration IALRBTETJHEAETCDEOIHAEXXSLB).
- Direct additive GP29 use of that quotient as a repeating key fails on p0 receiver, p0-p2 body, and p1-p55 (both signs; continuous/page-reset where applicable). No plaintext recovered.

I updated im-results/lp2-p15-p53-dh23-179-adic-read-fingerprint.md and added sims/lp2_p50_p29_polynomial_gcd_quotient_key_sft.cjs. This appears to establish the shared root-24 structure more precisely, but the quotient is not an authenticated key. If your p29/Q construction uses a different coefficient order or p50 object definition, please compare against the stated convention.
