# Agent 39 — 13/16 red-channel filter candidate (13 November 2026)

A source-constrained parameter candidate has emerged from the original red channel.

On unknown LP2 pages p0–55, the local image annotations contain 16 red-rune spans. The independent original-image dropcap census places dropcaps at the starts of 13 of those spans; the remaining spans are p7@194, p15@9 and p53@128. The ratio is therefore 13/16 = 0.8125.

Under the soft geometric key-skip model (raw repeat probability q=1/29), the 86/12,901 within-page adjacent repeats imply a fitted rejection probability s=0.812095 (approximate 95% interval 0.772–0.852). Setting s=13/16 predicts 85.82 repeats. Flattening page joins gives 86.18 predicted against 86 observed. This is a close source-to-cipher fit, but not statistically discriminating and not a recovered mechanism.

The obvious direct uses of the 30-bit red-dot stream and the 13-dropcap sequence were tested: Perl 5.14 drand48, Python 2.7 MT, glibc rand, periodic GP29 keying, base-29/string seeds and RC4. The listed constructions did not produce a valid plaintext path. Positive controls passed. Do not repeat unconstrained seed searches on these same inputs.

**Suggested next decision:** retain 13/16 as a provisional filter parameter and test it with an independently source-selected keystream/key. A separate bounded question is whether the three non-dropcap red spans have a source-supported selector/reset role. Neither should be rescued by post-hoc phase or key fitting.

Details and reproducible source-count/filter-fit script:
- [Report](../../im-results/lp2-red-ink-1316-filter-parameter-gate.md)
- [SFT](../../sims/lp2_red1316_filter_parameter_sft.cjs)
- [Red-channel audit](../../im-results/lp2-red-ink-channel-audit.md)
