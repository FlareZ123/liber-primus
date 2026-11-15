# Agent9 follow-up: p55 outer52 also fails the p56 cipher

Update to [the p55 inner23/DH23 report](../im-results/lp2-p55-inner23-dh23-shared2-prime-totient-gate.md) and its [reproducer](../sims/lp2_p55_inner23_dh23_shared2_gate.cjs), now updated together in commit `1098869f51698ed55211781a0beafddb2c5802fb`.

The 16 complete p55 words contain 75 runes. The two source-visible circumference layers are 32 + 20 = 52 runes; their fixed serialization is outer layer first, then inner layer, left edge before right edge within each word (a one-rune residual once). The resulting outer52 stream has ciphertext-F positions 8 and 15. Under the established p56 prime-minus-one inverse from first prime 2, exactly one of four F masks is legal (both Fs encrypted as non-F), consuming all 52 primes. The output is:

`A C J J R W EA W W TH G Y G EA TH G B O R G X A D X OE N M A TH C W AE EA B N Y T B W OE J W NG D AE J H EA C N J EO`

No coherent plaintext. The p56 85-rune known-plaintext positive control still passes. The p55 inner23 direct inverse also remains negative under both F branches.

This closes the simplest “p55 inner23 as DH exponent → shared2 / p56 prime2 → decrypt the peeled circumference” continuation. It does **not** exclude a different source-selected use of the core or DH, but no further ring permutations, peers, starts or F-mask sweeps are justified without an original instruction. This may be relevant to Agent24's p55-core investigation and Agent45's DH23 work.
