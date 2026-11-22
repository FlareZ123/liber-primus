# NIST Beacon global pad anchored by 2014 00.jpg signature — NO-GO

**Decision:** reject this exact construction. It did not recover plaintext from original LP2 pages 0–2.

## Hypothesis tested

The OpenPGP creation time attached to the original Liber Primus `00.jpg` is
2014-01-07T03:16:41Z (Unix 1389064601). The NIST Beacon V1 pulse immediately
at or before it is 03:16:00Z (1389064560). Hypothesis: concatenate consecutive
512-bit `outputValue` records from that pulse, map bytes modulo 29, and use
the result as one continuous pad from offset zero across the first 729 LP2
runes (pages 0–2), with the exact `keyskip1` anti-repeat channel motivated by
the ciphertext's adjacent-doublet deficit.

This is distinct from per-page timestamp indexing, which the external C8
investigation closed because the unsolved LP2 pages have no individual
signatures. The weaker premise here is that the signed `00.jpg` timestamp
anchors a global pad for LP2.

## Reproducible test

- Original target: 729 runes, pages 0–2 concatenated in page order.
- NIST source: 16 consecutive V1 pulses beginning 2014-01-07T03:16:00Z;
  1,024 pad symbols after byte-mod-29 mapping.
- Decoder: pinned `Dukotah/cicada3301` commit
  `fd13fe88a0bfef13f07c03c666b831e9ddae7f2d`; exact `keyskip1` preset,
  max_skip=3, max_free=0, start_slack=0, sign=-1, continuous key clock,
  offset zero.
- Positive control: the same NIST source and exact decoder recovered the
  known Cicada-register control text at offset137 with **1.000** recovery;
  the wrong-date control recovered **0.0323**. This validates the fetched
  pulse chain and the keyskip decoder on the planted control.
- Target winning path consumed only real fetched pad symbols: pointer749,
  with21 skips; it did not need zero-padding.

## Original-target result

| Start/key control | Mean quadgram score | Held-out self-consistency |
|---|---:|---:|
| Source-selected 03:16 pulse | -7.2406 | 0.7550 |
| One pulse earlier | -7.3377 | 0.9287 |
| One pulse later | -7.2689 | 0.9287 |
| Deterministic random key, seed3301 | -7.2940 | 0.9982 |

The source-selected candidate's score margin over the best control was only
**0.0283**, below the preregistered 0.50 screen; its held-out self-consistency
was worse than every control. The decoded preview was not readable English.
The right pad was consumed without exhaustion, so this is not a short-pad
failure.

The full HITFN panelmax gate was not run: the pinned external checkout lacks
the Mabinogion training corpus needed to build its panel. The direct
known-plaintext control and held-out beam screen are nevertheless sufficient
to reject this candidate; they are not a formal panelmax result.

## Conclusion and scope

Reject the exact joint model:

`2014-01-07T03:16:41Z` → preceding NIST pulse → consecutive outputValues →
byte mod29 → continuous p0–p2 stream → exact keyskip1, offset0, sign−1.

Do not rescue it by tuning offsets, alternate byte builders, page resets,
signs, or cipher families. This result does **not** exclude every use of the
PGP timestamp or every public-randomness source; it rejects this specific
source-to-receiver route. The timestamp is attached to `00.jpg`, and no
source evidence establishes it as a global LP2 pad anchor.

## Reproduction

- Script: [`sims/lp2_nist_signature_global_pad_skipaware_sft.py`](../sims/lp2_nist_signature_global_pad_skipaware_sft.py)
- Workflow run: [45084582049](https://github.com/FlareZ123/liber-primus/actions/runs/45084582049)
- External C8 source: [`run_c8.py`](https://github.com/Dukotah/cicada3301/blob/fd13fe88a0bfef13f07c03c666b831e9ddae7f2d/liber-primus/analysis/round24/C8-date-indexed-pad/run_c8.py)
- Timestamp ledger: [`SIGNATURE-TIMELINE.json`](https://github.com/Dukotah/cicada3301/blob/fd13fe88a0bfef13f07c03c666b831e9ddae7f2d/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json)
