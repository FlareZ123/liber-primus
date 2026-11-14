# Completed CPython 2.7 MT19937 S2 exact-key search: original-cipher crosser adjudication

**Decision (14 November 2026).** The previously incomplete 32-bit S2/exact seed space has been exhaustively covered in the sense of the documented source and new partition checkpoints. One seed in the newly enumerated 2,059,271,710 words exceeded the frozen 120-rune R36 claim bar, but an independent unmodified decoder test on the original 729-rune opening chapter shows a severe loss of signal on previously unselected text. **No original LP2 plaintext or creator-derived key was recovered.** Retire this specific 32-bit source generator/reducer/decoder cell; the historical 2,235,695,586 words were scored under a mixed old/R36 instrument and were not all uniformly re-scored with R36.

## Frozen source and decisive original-input test

- Historical upstream repository: `Dukotah/cicada3301` pinned to Git commit `9087dc36b5aa64c1786428e32180261ab9420c29`; R36 12-register panel's original `panel_lm.f32` SHA-256 `e46d4bb73d16adeb02262361325b2a6ff578ae436b1374a7725a0a240f7e9928`. The panel input is checked against the SHA-256 recorded inside the source `engine.dat`; its original calibration vectors `MU` and `SD` govern each 120-rune score. GP29 ciphertext comes from the original `round25/compute-tail/runner.U` source.
- Fixed hypothesis: CPython 2.7 MT19937 `init_by_array([w])`, `random29` reducer, offset zero, sign minus, and keyskip1/`exact` with a beam of 64 at length 120. No tuning of seed, alphabet, alignment, phase, clock or register is permitted after the reported score.
- Exhaustive source checkpoint before this invocation: 2,235,695,586 examined words, source frozen status digest `1aa529444548e3e1f3add420936ddfd40ee9b9fe4cb6d25b74c197a2e070c2ba`. Exact unswept partition: six bands, 16 shards each, **96 successful status/receipt/candidate validations**, newly covering 2,059,271,710 unique words. [Sweep Actions 43612834637](https://github.com/FlareZ123/liber-primus/actions/runs/43612834637) and [strict independent merge 43616793647](https://github.com/FlareZ123/liber-primus/actions/runs/43616793647).
- 234,296 new screen candidates scored at least 5.0, of which one reached the original claim bar 7.6341931878728095: seed **1288211095**, screen `pmax=7.839010536552472`, band1/shard9. All 64 frozen source vectors and source-native planted control were checked before the sweep.
- Single frozen key independently adjudicated using `sims/lp2_py27_s2_claimbar_oracle.py`. It imports the upstream `runner.word_stream` and `runner.DB.beam_decode` unchanged; only original R36 trigram panel `panel_lm.f32`, `MU` and `SD` calculate scores. The exact 120-rune C/Python original-input parity error is **0.0**. [Successful original-input Actions 43619029318](https://github.com/FlareZ123/liber-primus/actions/runs/43619029318); 90-day artifact `lp2-py27-s2-seed1288211095-oracle` retains every decoded GP29 index up to 729 and all twelve register scores.

## Independent original-cipher behavior

| Source segment scored with frozen 120-rune R36 reference | Trigram-panel pmax | Best of twelve registers |
| --- | ---: | ---: |
| 120-rune preselected screen (beam 64) | **7.8390105366** | 3 |
| Same 120 after 729-rune full-length beam (beam 400) | 6.4866029856 | 3 |
| Previously unselected positions 120–239 | **1.1678372878** | 1 |
| Previously unselected positions 240–359 | **1.5170154300** | 5 |
| Previously unselected positions 360–479 | **1.2444563543** | 4 |
| Previously unselected positions 480–599 | **1.2714424963** | 1 |
| Previously unselected positions 600–719 | **1.0724770119** | 4 |

The five held-out 120-rune segments average **1.2546457161**, with best 1.5170154300. The 120- and 240-rune original inverse share their initial 120 index decisions exactly; a separately optimized 729-rune beam changes 17/120 initial decisions (85.8333% agreement), which signals optimization-path sensitivity. Its full 729-rune GP29 index of coincidence scaled by 29 is **1.0139661436**, near the random 1.0 reference. The 240-rune joint decode has a second-window pmax **0.5303860560**. Original first-window GP transliteration begins `PTHOOIPSDEMIRALETERWEEDILAEXEATMBFCENUJBEOA`, and the subsequent text has no coherent source-native language.

**Interpretation.** The one score crossing arose in a search over billions of seeds and is compatible with a selected high-scoring prefix of nonlinguistic text. The more decisive observation is that neither 120-rune heldout segments nor full-chapter output preserves the apparent language signal. These are actual original LP2 ciphertext runes, not synthetic text. No original-text plaintext recovery or independent source-selected seed emerged. This is a bounded negative for the exact specified generator and decoder; it says nothing about other MT reducers, unknown offsets/seed types, other ciphers, or missing languages. The mixed old/R36 historical coverage is a documented exhaustive seed-identity union, **not** a homogeneous calibrated 2^32 R36 score sweep.

## Reproduction

To inspect the particular candidate without rerunning four billion keys, dispatch the existing manual-only workflow `.github/workflows/lp2-py27-s2-claimbar-oracle-manual.yml`. It retrieves the frozen upstream source, validates the original panel hash and independently reproduces the first 120 score, then decrypts the 240-rune and 729-rune original prefix with fixed keyskip1/exact rules. The source script prints the per-window scores and decoded text and saves an atomic JSON artifact. Full-space interval integrity and source status hash checks are defined in `sims/lp2_py27_mt32_uncovered_shards_sft.cjs` and `sims/lp2_py27_mt32_merge_receipts_sft.cjs`. There is no value in another search of this same key domain unless a new authenticated rule changes which generator/clock/source input must be tested.
