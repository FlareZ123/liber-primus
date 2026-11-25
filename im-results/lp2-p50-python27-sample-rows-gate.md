# LP2 p49–51 table: Python 2.7 per-row sample gate

## Decision

Director [#2681](https://github.com/FlareZ123/liber-primus/issues/2681): zero matches for the fixed hypothesis `Random(literal_seed).sample(range(256),8)` once per physical row, across all 32 rows without generator resets. Neither base59 (drop f) nor base60 has a first-row match in the 433 pinned timestamp seeds. The table's row distinctness does not select this generator or seed. No key/plaintext/continuation recovered.

## Exact model and nonduplication

All 32 original physical rows contain eight distinct values under either radix. This motivates an exploratory per-row without-replacement operation, distinct from the iid byte-generator screens in #2029/#1382 and row-membership consumer #2660. No authentic document specifies this particular operation.

- Original source: `resources/liber-primus/lp2-grid-256.json`, blob 2550eae357442912220e05dc51147523a61dd75a; row-major pages 49/50/51, original 10/13/9 row counts.
- Frozen seed prior: [Dukotah timestamp candidates](https://github.com/Dukotah/cicada3301/blob/0335ecf3f0d47c0dc6ecd953bcc729bce6ccad46/liber-primus/analysis/round18/L8-provenance/TIMESTAMP-SEED-CANDIDATES.json), blob 49d32c4b5edb4355d97ce8025279e9e0bb63825f. All 433 distinct literal integer values, including full-width millisecond/date integers, no truncation, offsets or warmups.
- Period implementation: CPython [v2.7.6 Lib/random.py](https://github.com/python/cpython/blob/v2.7.6/Lib/random.py), blob 1a3a13ee862309618505a271f6a9beecc20cd63d, and [Modules/_randommodule.c](https://github.com/python/cpython/blob/v2.7.6/Modules/_randommodule.c), blob 8bb9e37d16bfe4e9425b6f71b501501571644f22. Integer seed magnitude split into low-first 32-bit chunks and fed to MT init_by_array; random() combines two tempered outputs into a 53-bit fraction. At n=256,k=8 the sample setsize threshold is 85, so the selected-set algorithm repeatedly draws floor(256*random()), rejecting a duplicate within the current row. Reset the set, not the generator, for each of the 32 calls.
- All 433 seeds generated 256 values in selection order, compared to both frozen original readings. No alternative sample API, range, generator, row reordering, or restart.

## Results

| Reading | First physical row | First rows matched | Full tables matched | Maximum matching prefix | Maximum positional agreement |
|---|---|---:|---:|---:|---:|
| Base59 |200,227,164,183,96,233,124,180|0|0|0|5/256|
| Base60 |203,231,167,186,97,237,126,183|0|0|1|5/256|

The base59 maximum agreement was shared by seeds 1358529318 and 1326628800; base60 by 1326629812000. These are incidental agreement counts, not candidate keys.

Four complete planted tables using seeds 1325734783, 1358023192, 1357837200, 20120109000000 were uniquely recovered 256/256 from the entire 433-seed domain. Five two-row independent vectors from the integer-seeded Python 3 MT implementation plus the verbatim period sample branch matched the source-level JS emulation, including seed 1325734783000. Python 2.7 itself is not installed in the local runtime; the test is source-level reproduction with independent modern MT vectors, not a native period interpreter run. No CI execution is claimed.

Under independent uniform ordered 8-of-256 samples, there are (256)_8 = 16,517,640,193,528,320,000 equally likely rows. A union bound over 433 seeds and two readings is 866/(256)_8 = 5.24288e-17 for the first row, and log10(866/(256)_8^32) = -612.0368 for the whole table. These are idealized match bounds, not claims about deterministic seed independence.

## Reproduce and next decision

Obtain the exact pinned seed JSON above, then from repository root run:

```
node sims/lp2_p50_python27_sample_rows_sft.cjs path/to/TIMESTAMP-SEED-CANDIDATES.json
```

The test was executed on the original source inputs in a JS runtime. [Script](../sims/lp2_p50_python27_sample_rows_sft.cjs), commits 48b0385fefb7fdc014247fd44b712529e16c5881 and 951efac3b9dc77db0c243ecdf58cdc48f1786b96 (log-space full-table chance calculation).

Retire this exact fixed row-sampling, literal-timestamp hypothesis. No downstream rune key continuation is justified. Row distinctness could occur by chance or through another generator; do not expand the search without an independent creator-selected operand.
