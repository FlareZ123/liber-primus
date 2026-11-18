# 2013 XOR pad vs 2014 printed table: direct source-fragment decision

**Result (18 November 2026): no shared source fragment.** The first-party 2013 telephone-stage XOR pad `DATA/560.17` and original 2014 256-byte sexagesimal table are independently authenticated Cicada inputs. We tested whether the 2014 table copied an unchanged excerpt of the earlier pad, which would identify a key-source address without fitting unknown plaintext. Neither the historical 2014 256-byte `sexagesimal.bin` nor the printed LP2 256-cell table shares **even one contiguous 16-byte substring** with the full 1,183,811-byte 2013 pad, testing both byte directions. No 256-byte table copy occurs in that pad. This excludes only literal fragment reuse and recovers no unknown LP2 plaintext.

## Fixed inputs and complete experiment

- Original 2013 pad: `neuroretransmit/cicada` Git commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`, Git blob `49df8e57f8e6052eb2d5c2b483282461e53ef5ff`, path `2013/002-3301/3301-contents/data/560.17`, 1,183,811 bytes. Whole-file SHA256: `d5676b1e01fd371cb13415b59b2eca4336e96f7bb05e789198b8d6baab580c19`. Its original authored use was an explicitly addressed XOR phone-stage receiver.
- 2014 historical 256-byte `sexagesimal.bin`: exact bytes archived as `binary_hex` in `resources/cicada2014-sexagesimal-source.json`. Original LP2 printed version: `resources/liber-primus/lp2-grid-256.json`. These differ at exactly ten source positions, so both survive as separate fixed inputs.
- For each original table, search the **entire unchanged 2013 pad** for the complete 256 bytes and every 16-byte contiguous window in both forward and reversed order. Report any address that matches; do not fit XOR masks, arbitrary GP29 mappings, table permutation or scored plaintext.

| Table candidate | Full 256-byte match | ≥16-byte common contiguous window |
| --- | --- | --- |
| 2014 original | absent | absent |
| LP2 printed | absent | absent |
| 2014 original reversed | absent | absent |
| LP2 printed reversed | absent | absent |

**Scope:** The hypothesis that the printed table exposes a literal 2013 pad excerpt is rejected. This does not exclude transformed/keyed source uses or say anything about the separate ~118MB `DATA/560.13`. No original instruction selects a cipher receiver from a mere random-byte nonrelation. No `results/README.md` change is justified.

Reproduce using [read-only Windows Node.js 22 CJS](../sims/lp2_2013_dataset17_table_literal_fragment_sft.cjs) and [successful manual GitHub Actions run 44375453715](https://github.com/FlareZ123/liber-primus/actions/runs/44375453715). Its completed output reports source integrity and all four negative fragment decisions. This report prevents a repeat of a bounded source-pair test; it is not a recovered key, plaintext or destination.
