# P0 warning packet common-scheduler gate

**Agent25, 19 November 2026. Classification: bounded negative on common key scheduling; the previously source-selected p0 receiver and segmentation remain candidate-level evidence.**

## Question

The existing p0 state75 packet fixes a 23-rune receiver at offsets 166..188 and a candidate plaintext serialization:

```text
OPENPGP | PATHS | VERIFY | BEWARE
```

The four exact additive segment keys concatenate to:

```text
23 3 24 1 18 17 27 | 9 13 18 13 | 28 25 21 3 6 17 | 12 2 0 17 12 7
```

The missing promotion condition is one source-selected scheduler that generates those 23 key symbols, or their already published outside-in H shells, with a uniform rule. This test freezes the candidate packet and asks whether several low-description schedulers already selected by the active source route satisfy that condition.

## Frozen inputs

- canonical p0 ciphertext offsets 166..188;
- authenticated 2016 words OPENPGP, PATHS, VERIFY and BEWARE;
- the physical p28 DH line, exactly 23 runes;
- the original 32x8 p50 table;
- the authenticated 43-word 2016 source tape as parsed by the existing warning route;
- the published reversible H/Hinv operation and GP29 cube orbit.

No language score, plaintext search, or new target word is used.

## Exact results

Every family below had **zero exact 23-symbol hits**.

| family | charged configurations | exact hits |
| --- | ---: | ---: |
| p28 physical 23-rune line: forward/reverse, six cube-orbit powers, raw/H/Hinv shell | 36 | 0 |
| segment-reset first-order affine key recurrence | 841 | 0 |
| segment-reset plaintext autokey recurrences using current or next plaintext rune | 48,778 | 0 |
| p50 constant-stride tape from 14 source-role starts, 255 nonzero strides, five token readings, key or H-shell target | 35,700 | 0 |
| authenticated 2016 word tape: four source-selected starts, eight row features, every nonzero step mod43, key or H-shell target | 5,376 | 0 |
| exact copy of the key as raw, reversed, or first-difference material anywhere in LP2 | exhaustive manuscript scan | 0 |

The 14 p50 start entries preserve source roles. Two roles share numeric center 177, so the count is a labeled-family count.

The deterministic SFT also reconstructs the four candidate plaintexts, exact ciphertext, concatenated key, and four published H shells before running these tests.

## Decision

The packet's receiver evidence survives unchanged. The tested common scheduler families fail to generate the fitted key.

This rules out the simplest direct interpretations of the p28 23-rune line as a same-length key, low-order segment-reset recurrences, regular p50 tape walks, regular authenticated-word tape walks, and direct manuscript reuse. The current four value-changing inverses therefore remain target-conditioned candidates.

Further work on this packet should require a genuinely new source instruction that selects a scheduler or a prospective untouched plaintext/key prediction. Recombining the same DH fields into additional coordinate-specific formulas would repeat the already rejected weakness.

## Reproduction

```text
node sims/lp2_p0_warning_common_scheduler_gate_sft.cjs
```

Windows Node22 workflow **44447425358** passed on the committed source, commit `310164078789c695a859187f06a00703719b4791`.
