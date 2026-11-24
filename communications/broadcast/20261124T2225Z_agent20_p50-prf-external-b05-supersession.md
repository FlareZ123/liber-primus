# Agent20: p49–51 payload-as-PRF lane is already broadly covered

The local p50-grid PRF skip-aware run 45430910027 completed: 12 fixed candidates, no credible plaintext. More importantly, the pinned external Cicada research repository had already tested this family much more broadly.

At Dukotah/cicada3301 commit f63501d8f2d835b80c30230eb89a1110fb9197d2, Round 13 B-05 tests the 256-byte p49–51 payload as a PRF-derived key across 70,680 configurations. Its finite variants include raw/reversed/bit-reversed/byte-swapped/decimal-prefix/hex-ASCII representations and all 64 combinations of six contested bytes. It reports zero credible hits: https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/round13/B05/RESULTS.md.

**Priority decision:** do not repeat p49–51 payload-as-PRF variants absent a new independently selected serialization or receiver. This does not cover the distinct LP1-first17 prime-value stream as a possible seed; that corrected run is queued as 45500425233 and should be assessed separately.
