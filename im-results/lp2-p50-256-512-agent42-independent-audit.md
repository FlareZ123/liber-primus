# Independent audit: p50 256/512 doublet-phase anomaly

## Decision

The 256/512 recurrence is **not familywise robust** once the full source-motivated period family and the observed page/line/word/predecessor/leading-zero structure are accounted for. The nominal (P=512) result does not survive a standardized max-statistic over all 48 tested periods. A distinct held-out chapter does not reproduce it. This is a statistical observation, not an LP2 cipher, key, or decoder.

Issue: #2107 (independent replication / retire decision).

## Exact event reconstruction

The independent reconstruction used the canonical rune transcription and checked each page's rune sequence against the repository's page-index corpus:

- 55 rune-bearing pages (p50 is the numeric 32×8 grid page, not a rune-text page)
- 12,956 runes
- 12,901 eligible within-page adjacent pairs; page-boundary pairs are excluded, but the global rune clock continues across pages
- 2,896 printed words
- 86 within-page adjacent-equal-rune events

The event coordinate is the zero-based global index of the *second* rune in the repeated pair. The complete 86-row record (page, line, word, preceding/current rune, predecessor p50 cell and token, leading-zero flag) is emitted by `node sims/lp2_p50_256_512_agent42_audit.cjs`.

For compact independent comparison, the 86 global offsets are:

```text
122, 207, 347, 435, 455, 494, 587, 673, 720, 743, 814, 852,
1022, 1052, 1088, 1096, 1126, 1306, 1394, 1454, 1471, 1528,
1571, 1587, 1595, 1605, 1767, 1804, 1815, 2241, 2442, 2616,
2816, 3083, 3106, 3231, 3261, 3286, 3415, 3428, 3640, 3712,
3813, 3984, 4018, 4060, 4067, 4148, 4151, 4273, 4478, 4612,
4636, 4727, 4850, 5002, 5134, 5234, 5352, 5438, 5825, 6081,
6153, 6231, 6251, 6330, 6415, 6637, 6806, 7048, 7256, 7466,
7586, 7831, 7839, 7852, 7902, 7915, 7986, 8385, 8497, 8892,
9311, 9432, 9576, 9597
```

Observed same-phase pair counts are (S_{256}=27) and (S_{512}=16). The 2014 p50 table makes 256 cells / 512 printed characters a motivated period pair, but the full neighbor families were also tested: 245–267 and 500–524 (48 periods total).

## Conditional max-statistic null

The conditional strata preserve, jointly:

- physical page
- printed line
- printed word identity
- preceding rune value
- whether the predecessor p50 table token has a leading zero

There are 86 event-bearing strata: 50 events are fixed by singleton eligible strata and 36 can move among alternative sites. Each Monte Carlo draw preserves the event count in every joint stratum and samples without replacement. The full raw max statistic is the maximum (S_P) across all 48 periods.

| Statistic | Observed | Conditional-null result |
|---|---:|---:|
| Max (S_P), P=245–267 | 27 at P=256 | (p=0.395) |
| Max (S_P), P=500–524 | 16 at P=512 | (p=0.0426) within this family |
| Max (S_P), all 48 periods | 27 at P=256 | (p=0.395) |

The high-period family alone has a nominal tail probability near 0.043, but the source-motivated full family does not. To avoid the lower-period family dominating simply because raw pair counts have a larger expectation, an independent two-stage max-(T) test estimated each period's null mean/SD on 30,000 pilot draws and evaluated the maximum standardized score on a separate 30,000 draws. The observed maximum is (Z=2.131) at P=512; the full-family max-(T) tail probability is **(p=0.579)**.

All simulations use fixed recorded seeds and partial Fisher–Yates sampling without replacement. The script is dependency-free Node.js and emits the complete event list and period-by-period scores.

## Hotspot and holdout checks

Four events use predecessor cell 192, whose printed token is `00`. Their repeated rune values, in page order, are Y, O, U, A:

| Global offset | Page | Line (0-based) | Repeated rune |
|---:|---:|---:|---|
| 2241 | 9 | 5 | Y |
| 5825 | 24 | 4 | O |
| 6081 | 25 | 4 | U |
| 8385 | 34 | 9 | A |

Removing all eligible sites at predecessor cell 192 leaves 82 events, (S_{256}=21), (S_{512}=13); the full 48-period raw max-statistic null gives (p=0.89). The four-event `00` hotspot therefore accounts for a substantial part of the apparent recurrence; the Y/O/U/A sequence is recorded, not interpreted as plaintext.

A separate cuneiform-chapter holdout (p33–p39, not the p50 grid page) contains 12 events and has (S_{256}=0), (S_{512}=0). Its full-period conditional max-statistic test gives (p=0.511). This is a diagnostic holdout rather than a pre-registered confirmatory split.

The first physical-page block p0–p26 has 40 events and (S_{256}=8,S_{512}=3); p27–p55 has 46 events and (S_{256}=5,S_{512}=4). At the fixed global midpoint 6478, 14 of the 27 P=256 pairs and 9 of the 16 P=512 pairs cross the midpoint. Thus most of the apparent exact-period pairing is cross-half alignment, not a recurrence that independently appears within each block.

## Positive control

A synthetic positive control planted the same per-page event counts at eligible sites whose actual p50 byte is below 64. It produced (S_{256}=58) and (S_{512}=34), substantially above the observed 27 and 16. The detector has power against a strong table-phase effect; the observed effect is simply not robust under the full conditional family.

## Conclusion and next action

Retire the claim that the 256/512 recurrence, by itself, identifies a cipher mechanism or key. Preserve the exact 86-event set and the cell-192 Y/O/U/A observation as structural data, but do not extend this into more period, radix, or key searches. A future revival requires a source-authenticated reversible operation that predicts the event locations before inspecting them.

Reproduction:

```bash
node sims/lp2_p50_256_512_agent42_audit.cjs
```

The script uses `resources/liber-primus/lp2-transcription.txt`, `lp2-corpus.json`, and `base60-grid.json`; no external packages are required.
