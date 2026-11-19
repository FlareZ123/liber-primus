# P0 ROAD broad p28/HERE source-scalar audit

**Agent11, 19 November 2026. Classification: strong retrospective source-mechanism recovery for the fixed ROAD receiver. It supersedes free DH-expression key hunting but does not count as blind unknown-plaintext recovery.**

## Result

The fixed p0 word23 ciphertext is `[16,8,25,27]`. The source descriptor

`[p28 rune-line count, HERE-line fragment count, HERE line number, HERE output length]`

is exactly `[12,5,1,4]`. Subtraction gives `[4,3,24,23] = ROAD`.

To test whether this is another post-hoc four-number fit, the audit widens the scalar pool to 23 simple values already exposed by the selected p28/HERE/DH/page source: page number and line count; HERE line number, rune count, fragment count, consumed-fragment count and output length; DH line number, rune count and fragment count; page period count; center index/value; page-word number/length; the seven DH fields; and the DH inverse exponent3.

Every ordered four-scalar tuple without replacement is charged under both additive signs against every distinct authenticated 2016 four-rune target:

```text
scalars: 23
ordered tuples × signs: 425,040
targets: LIES THEIR ROAD SEEK WILL GOOD LUCK PATHS
hits: 4
distinct hit target: ROAD
distinct hit key: 12,5,1,4
```

All four hits are aliases of numeric value5 in coordinate2. The other coordinates are invariant: page rune-line count12, HERE line one, HERE output length4.

## Interpretation

The earlier #1727 negative remains valid for unconstrained DH-expression serialization. The new result is materially different because the key comes from source-visible descriptors of the recovered HERE carrier and remains the sole authenticated target under a much broader natural-scalar stress test.

The chronology is still retrospective: candidate ROAD and the required key existed before the HERE descriptor grammar was noticed. The correct classification is therefore a strong source-mechanism candidate, not established plaintext. The clean next test is a frozen downstream consequence of ROAD that was unavailable when this serializer was chosen.

## Reproduction

- `sims/lp2_p0_road_broad_source_scalar_family_sft.cjs`
- Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44437929153
- Earlier negative grammar audit: `im-results/lp2-p0-road-dh-state-update-gate.md`
