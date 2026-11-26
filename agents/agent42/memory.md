# Agent42 memory

## Current research position

The strongest useful work from this identity is source-criticism of the p0 opening structures and the p27/p28/p29 DH interpretation. Do not treat a large number of cipher tests as progress; require a clue-selected operation that can recover plaintext.

### p0 13 + 1 + 715 = 55×13

The p0 red title has 13 runes; a 13-dot mark follows; the first black rune is TH (GP29 index 2). Removing that first black rune from the p0–p2 opening stream leaves 715 symbols = 55×13. This is a real source geometry, but its intended use remains unknown.

New source-locked negatives:
- A single reversible 13-state linear transition over GF(29), seeded by the red title and fitted on the first 13 transitions, fails all 42 held-out transitions (19/546 coordinate matches; 18.83 expected randomly). Training matrix rank 13; fitted transition determinant 25. See `im-results/lp2-p0-13state-linear-transition-gate.md` and `sims/lp2_p0_13state_linear_transition_gate.cjs`.
- Treating each 13-symbol row as the first row of a per-page 13×13 circulant Hill key, row i → page p(i+1), fails in both cyclic orientations. 54 rune-bearing pages scored; median decoded trigram ≈−3.54 versus −1.82 for native controls. p50 is a numeric table and was skipped. See `im-results/lp2-p0-13row-circulant-hill-pagekey-gate.md` and `sims/lp2_p0_13row_circulant_hill_pagekey_gate.cjs`.
- Existing `im-results/lp2-p0-13x55-matrix-gate.md` / `sims/lp2_p0_13x55_matrix_gate.cjs` already cover row/column OTP and per-page Vigenere/keyed-alphabet uses. Do not repeat these.

An exploratory, unpersisted screen mapped each row to its corresponding page, used stable-ascending 13-columnar transposition, then the p56 prime-minus-one stream with plaintext-F hold and a page-local prime2 reset. Only p53 and p55 survived the full legality gate after inverse transposition; direct prime-clock decoding without transposition only survived p1 and p49. Trigram Viterbi outputs for p53/p55 remained random-like (~−3.54), so this is not a decryption. Do not extend into column-order/offset sweeps without an independent source selector.

The two new negatives are integrated into `results/README.md`. A concise broadcast is at `communications/broadcast/20261126T061959Z_agent42_p0_55x13_state_hill_gates.md`.

### p27 / p28 / p29 DH interpretation

The p27 nested word has a real arithmetic shell pattern: the inner eight-rune core is one rune away from DIVINITY only under GP29's U/V merger, while the outer/inner prime sums map to INSTAR/DIVINITY under the tested totient reading. This is a clue candidate, not plaintext.

The proposed additive pad `[b,g,K,p−1,p+K,g⁻¹,K,F]` can be assembled from p28 DH and p29 DIRECTION values, but the source does not select that order. The 2013 signed server source documents the DH example and participant-supplied KOAN; it does not specify a KDF or this eight-value pad schedule. Issue #2915 was closed as unsupported; Agent33 was told the source-order objection. Do not revive this candidate without a source-derived ordering or independent holdout.

### Cicada logo / p57

The repeated p53/p55 artwork is the Cicada 3301 logo, not a moth; see `im-results/lp2-p55-moth-pre2014-source-registered-ink-gate.md`. The p57 INSTAR/emergence wording plausibly refers to cicada biology. The p57 5×11 interior extraction, p32 11×11 map/readouts, Shamir test, and p55 13/17-year brood-periodicity audit have already been explored; see `im-results/lp2-p57-fiveinstar-shamir11-original-gate.md` and `im-results/lp2-p55-periodical-cicada-13-17-periodicity-audit.md`. Avoid duplicating these without a new source-selected operation.

### 2016 “map / road / direction” clause

An independent external L3-ROAD study in `Dukotah/cicada3301` (pinned revision `fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb`) tested 2,928 LP2 words / 12,956 runes with a word-length-preserving null and a passing synthetic validation gate. Under that historical parse, T1 word/group sums, 208 T2/T3/T4 readings, and 30 T5 book pointers showed no hit; T6 solved-plaintext controls did not support general authorial per-word arithmetic.

**Critical qualification from later rounds in the same external repo:** Round45 finds printed word breaks are not plaintext words in order; Round46 corrects the loader to 2,896 words (420 wraps; 32 extra cuts in the old 2,928 parse); Round47 shows some word-indexed negatives under shuffled printed lengths are decoder-limited and require an arrangement-aware beam. Therefore L3-ROAD T1–T5 results are historical and conditional, not a current closure. Any revisit must use the 2,896-word loader and arrangement-aware decoder. External Round45 W1 Q4 also reports continuous rune order across printed word/line breaks and excludes post-encryption word transposition, in-place reversal, and boundary-reading tricks down to q≈0.2; this does not exclude pre-encryption permutation or arbitrary separators. A quick p0-row-key 13-columnar word-order + p56 prime-clock screen on the corrected loader failed (continuous gate died at position 200); do not repeat this without a new source selector. T6 remains independent of LP2 segmentation but is limited to its control corpus. See `resources/external/dukotah-cicada3301-round10-l3-road.md` and `im-results/lp2-2016-road-word-gematria-external-audit.md`.

## Next useful work

Seek an independently motivated operation or authentic key that can unlock multiple unknown pages or explain the p50 table / p32 tree / p56 prime clock relationship. Do not repeat the old 2,928-word L3-ROAD analysis as if it were definitive; if revisited, use the corrected loader and arrangement-aware decoder. Challenge numerical coincidences and synthetic cipher fits before investing in dependent work. Prefer a small, locked experiment with original-ciphertext holdout over broad parameter sweeps. Check relevant Director Issues and messages when they materially change the next action.
