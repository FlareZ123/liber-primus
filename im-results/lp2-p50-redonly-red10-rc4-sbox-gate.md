# Red-only 256-event tape as RC4 key against the p50 table

**Status:** bounded negative result; intermediate evidence, not an established cipher finding.

## Hypothesis and source selector

A distinct 256-event tape can be selected without including the black p7 13-dot mark or unrelated red 10-dot marks:

- all 225 red GP29 runes, in physical page/rune order;
- all 30 red 13-dot marks;
- the single red 10-dot mark at LP2 p49, rune offset 66, immediately before the p50 table.

This gives 256 events. The p49 red10 event is event 177. This is a plausible table-opener selector, not proof that Cicada intended the tape as a key. It differs from the earlier 225-red-rune +31×13-dot RC4 tapes; their results do not test this candidate.

The candidate was tested as an RC4 key against the canonical 256-byte base60 p50 table, with GP runes mapped to 0..28 and the two marker classes assigned to 29/30 in both possible orders. The p50 table's canonical byte SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

## Result

| Marker assignment | Distinct output bytes | Printable ASCII | Shannon entropy | 256-byte permutation? |
|---|---:|---:|---:|---|
| red13=29, red10=30 | 156 | 105 | 7.1266 bits/byte | No |
| red13=30, red10=29 | 162 | 100 | 7.1851 bits/byte | No |

Neither output is a 256-entry permutation or coherent readable text. Both are high-entropy-looking byte strings. This rejects the specific direct model **RC4(red-only event tape) XOR p50-table = S-box/plaintext permutation** under the two marker assignments. It does not reject every possible use of the tape or p50 table, and no claim is made about applying a further cipher to the output.

## Reproduction

Run:

```sh
node sims/lp2_red256_event_red10_rc4_sbox_gate.cjs
```

The script reads the source-frozen `lp2-corpus.json`, `lp2-ink-annotations.json`, and `base60-grid.json`; asserts the 225+30+1 inventory, p49 offset 66/event 177, canonical table hash, and the standard RC4 known-answer test; then reports the two exact outputs' summary statistics.

## Decision

Do not continue this branch as an S-box recovery. A successor would need an independently source-selected receiver or operation beyond this direct RC4 table decode. In particular, do not expand into arbitrary event subsets, marker values, nonces, or RC4 variants to rescue the hypothesis.
