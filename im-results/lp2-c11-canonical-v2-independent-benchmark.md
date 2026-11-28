# Canonical C11 erasure benchmark — independent Agent5 adjudication

**Issue:** #3341  
**Date:** 2026-11-28  
**Agent:** Agent5 / `agent5-draw7-2026-11-28T06:26:14.089Z-directed`  
**Decision:** **FAIL the preregistered architecture-preservation gate.** V-SILENT is strongly recoverable under the correct key, but V-DELETE reaches only 30/40 retained-plaintext recovery passes, below the frozen 32/40 requirement. No tuning after inspection is authorized by this test.

## Scope and frozen implementation

This is a controlled synthetic calibration only. It does not use unsolved LP2 ciphertext and does not claim an LP2 key, plaintext, sender, or hidden-state source.

The tested implementation is the Critic-repaired `Agent9-erasure-alignment-C11-canonical-v2` harness:
- `sims/lp2_alt_erasures_alignment_decoder.cjs`
- `sims/lp2_alt_erasures_c11_benchmark.cjs`
- workflow `.github/workflows/agent9-alt-erasure-alignment-manual.yml`

The corrections under test are commits `5b3ab5b240e0da10b72169110be0ba63855cbe12` and `9648418444a0c9c56b4d5c822c06075f92374957`: canonical GP tokenization, null scoring for invalid/short outputs, exact-retained reporting, parameter validation, and fixed workflow argument dispatch.

Both runs used seed `20261128`, beam `320`, `maxHidden=2`, and `maxReject=2`. Training is the harness's pinned Gibran + Blake + solved-LP1 material; held-out plants come from Emerson. The known-key and independent wrong-key receivers are identical apart from the key.

## Preregistered decision rule

Before the repaired run, Issue #3341 comment `7235594676` froze:
- smoke: 1 plant per variant per shard over 8 shards;
- scale: 5 plants per variant per shard over 8 shards = 40 plants per variant;
- recovery: each of V-DELETE and V-SILENT must have at least **32/40** plants with retained-rune normalized LCS >= 0.85;
- discrimination: for each variant, at least **32/40** valid correct-key quadgram scores must exceed the nearest-rank 95th percentile of the 40 wrong-key scores;
- at least **38/40** valid score pairs per variant;
- exact retained-sequence matches are reported but are not required;
- no original-LP2 sweep.

Wilson 95% intervals below use z=1.9599639845.

## Smoke

Workflow run [46118778876](https://github.com/FlareZ123/liber-primus/actions/runs/46118778876) completed successfully on all eight shards.

| Variant | LCS >= .85 | Mean retained LCS | Valid score pairs | Exact retained |
|---|---:|---:|---:|---:|
| V-DELETE | 7/8 | 0.8977 | 8/8 | 0/8 |
| V-SILENT | 8/8 | 0.9822 | 8/8 | 0/8 |

The one V-DELETE smoke miss was plant 3 at LCS 0.83884. All smoke correct-key quadgram scores exceeded their paired wrong-key scores. This was sufficient to establish that the repaired harness was operational, so the preregistered scale run was launched unchanged.

## 40-per-variant scale result

Workflow run [46118993343](https://github.com/FlareZ123/liber-primus/actions/runs/46118993343), head `3c9cbbddecb7bb39e964aa224f9d269c1bc2a8c2`, completed successfully on all eight shards. Every decoder invocation returned a valid >=4-rune output, so there are 40/40 valid score pairs for each variant and zero correct-key or wrong-key decoder failures.

| Metric | V-DELETE | V-SILENT |
|---|---:|---:|
| Recovery passes (LCS >= .85) | **30/40 (75.0%)** | **40/40 (100%)** |
| Wilson 95% CI | 59.81%–85.81% | 91.24%–100% |
| Mean retained LCS | 0.87431 | 0.97584 |
| Exact retained sequence | 0/40 | 1/40 |
| Valid correct/wrong score pairs | 40/40 | 40/40 |
| Correct scores above wrong-key 95th percentile | **40/40** | **40/40** |
| Discrimination Wilson 95% CI | 91.24%–100% | 91.24%–100% |
| Correct/wrong decoder failures | 0/0 | 0/0 |

The nearest-rank 95th-percentile wrong-key thresholds from the emitted per-plant logs are approximately **-6.228** for V-DELETE and **-6.569** for V-SILENT. The result is stronger than the percentile gate: the worst correct-key scores are still above the *maximum* wrong-key scores (V-DELETE worst correct about -5.942 vs wrong maximum about -6.105; V-SILENT worst correct about -5.501 vs wrong maximum about -6.493). Thus the discrimination conclusion is insensitive to three-decimal log rounding.

Per-shard recovery pass counts were:

| Shard | V-DELETE | V-SILENT |
|---:|---:|---:|
| 0 | 4/5 | 5/5 |
| 1 | 3/5 | 5/5 |
| 2 | 2/5 | 5/5 |
| 3 | 4/5 | 5/5 |
| 4 | 4/5 | 5/5 |
| 5 | 4/5 | 5/5 |
| 6 | 4/5 | 5/5 |
| 7 | 5/5 | 5/5 |

The eight shard runtimes sum to 1004.513 CPU-wall seconds across runners; maximum shard wall time was 154.793 s and median 131.387 s.

## Adjudication

The benchmark answers two different questions:

1. **Can the receiver distinguish the correct key from a random wrong key?** Yes, decisively, for both constructions under these synthetic plants.
2. **Does the frozen canonical-v2 receiver recover the retained plaintext reliably enough to preserve both constructions under the preregistered gate?** No. V-DELETE fails 30/40 against the required 32/40. V-SILENT passes 40/40.

The failure was already mathematically irreversible after seven shards: V-DELETE stood at 26/35, so even a perfect last shard could reach only 31/40. The final shard produced 4/5, yielding 30/40. No beam widening, hidden-depth increase, seed change, tokenizer change, or threshold relaxation was performed after seeing the result.

This is a bounded decoder-calibration negative, not a proof that LP2 cannot use deletion or another erasure channel. Separate local latent-state implementations remain useful experimental tools. What this run removes is a justification for spending further compute on this exact canonical-v2 C11 architecture **before** an original source supplies a key, latent clock/state, recoverable redundancy, or other side information. The scientific blocker remains source selection and reversibility, not wrong-key discrimination.
