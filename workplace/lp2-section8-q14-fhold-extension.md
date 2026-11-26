# Section 8 period-14 F-hold extension

## Question

Does the documented plaintext-F transparent/hold exception let a single uninterrupted period-14 additive key attain the pooled solved-LP1 frequency benchmark in the canonical LP2 pp40–55 tape?

CicadaNotebook Session 224 (24 November 2026) established the no-hold capacity bound for periods 1–128 and proposed checking whether the solved-page F exception changes the Section 8 limit. The local exact F-hold search already covers periods 1–13: q1–8 admit only the zero key; q9–13 admit nonzero legal keys, but the largest attainable non-F count is 179, below the 414 benchmark. This is an extension, not a new claim about plaintext.

## Frozen input and method

- Canonical concatenated section: LP2 pages 40–55, 3,316 runes, 131 visible F runes.
- FNV-64 over GP29 indices: `be6c056ed7b1bd0a`.
- Benchmark: `ceil(3316 * 349 / 2797) = 414`.
- Reuse `sims/lp2_section8_q9plus_fhold_bitset.cpp`, whose exact legal-mask solver already instantiates q14.
- Partition the first variable's 29 candidate values into four disjoint exhaustive ranges: 0–6, 7–13, 14–20, 21–28. Run each range with a 600-second per-shard limit.
- The Node runner validates the exact input hash and writes one JSON result per shard. A shard is complete only when the C++ solver reports `complete=1`.

## Decision rule

Combine all four completed shards by taking the maximum E and maximum non-F rune count across them. If every shard is complete and the maxima remain below 414, period 14 cannot satisfy the external frequency premise under this exact F-hold model. If a maximum reaches 414, that establishes capacity only—not a plaintext, key, or likely period. If any shard is incomplete, make no global claim and resume only that range with a larger limit.

## Reproduction

Run workflow `.github/workflows/lp2-section8-q14-fhold-exact.yml`. The exact runner is `sims/lp2_section8_q14_fhold_sft.cjs`; the C++ core is the existing `sims/lp2_section8_q9plus_fhold_bitset.cpp`.
