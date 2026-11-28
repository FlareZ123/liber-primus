# P30/P31 sealed source-only prefix holdout contract

**Agent38, 28 November 2026; Director #3402. Classification: reusable blind original-input decoder gate, not authenticated plaintext or a recovered key.** The existing p6 corridor proposes that the two authenticated signed-source words immediately preceding its 11-word core may belong to physical LP2 pages p30/p31. Their arithmetic fits were previously recognized after the source words were known. This packet protects their original rune coordinates as a forward test of any genuinely new p6-derived complete-key serializer.

## What the existing source fixes, and what it does not

The 2016 signed warning has an independent 13-word tail at source indices30–42. The p6 13-dot / 11-red-rune / K=2 structure independently narrows the schedule to a two-word prefix and eleven-word core. The charged p6 receiver-grid convention is **signed-source zero-based index, manuscript local one-based word ordinal**; the other three zero/one-based combinations do not produce any complete 13-lane assignment over the published finite search. That convention is frozen here, not chosen using either target word.

The fixed original receivers are:

| Physical page | Complete local word | Zero-based rune start | Canonical GP0 ciphertext | Frozen page key sum |
| --- | ---: | ---: | --- | ---: |
| p30 | 27 | 112 | `[21,3,12,11]` | 20 |
| p31 | 32 | 126 | `[12,23,1]` | 9 |

The receiver selections and their source/evidence caveats are documented in [the p6 skipped-K2 boundary](lp2-p6-skipped-k2-seek-and-boundary.md) and [the numbering-convention charge](lp2-p6-receiver-numbering-convention-gate.md). These are original complete-word runes, not the result of target-dependent marker deletions. Their full indices are pinned in `resources/liber-primus/lp2-corpus.json`.

**Crucial identifiability constraint:** knowing just each page's sum is insufficient to derive its ordered key. With arities4 and3, one independent GF29 checksum per word leaves `29^(4−1+3−1)=29^5=20,511,149` possible ordered joint additive keys. They all give distinct prospective raw output pairs and all exact original-cipher roundtrips. The source-visible operation must select **one exact ordered key pair** before reference target words are opened.

## Two-stage contract

The first program [`sims/lp2_p6_prefix_holdout_freeze_sft.cjs`](../sims/lp2_p6_prefix_holdout_freeze_sft.cjs) **does not read the authenticated 2016 source or its target words**. A new cipher model supplies a candidate JSON:

```json
{
  "schema": 1,
  "model": "A detailed source-only p6 coordinate serializer and its frozen settings",
  "keys": {
    "30": [0, 0, 0, 20],
    "31": [0, 0, 9]
  }
}
```

The numbers above are **synthetic checksum-compliant interface examples**, emphatically not a proposed historical cipher. This program asserts exact original receiver coordinates, key lengths, canonical GP0 values, frozen sums, and full forward re-encryption, and emits the **complete raw decoded outputs** plus a SHA-256 of the canonicalized frozen response. It imports no target values and cannot adaptively rank models by plaintext.

Before opening the authenticated signed source for grading, **commit** this frozen output JSON, the program that derived the keys, and the original source selection rule to GitHub; record that exact commit SHA. Do not change any of the three after target comparison.

Only then run [`sims/lp2_p6_prefix_holdout_grade_sft.cjs`](../sims/lp2_p6_prefix_holdout_grade_sft.cjs) with the committed frozen JSON, SHA-256 and pretarget commit SHA. The grader checks frozen-output integrity, original ciphertext, page sums, decoded output and full reencryption, then loads the verified signed 2016 text and checks source words30 and31. It distinguishes rune-coordinate matches and complete-word matches, with no ability to change a key. A future investigator must verify that the asserted pretarget GitHub commit genuinely precedes grading and that its complete-key rule was not inferred from these previously published source words; hashes alone cannot demonstrate intellectual independence.

Example CLI sequence after a genuinely source-derived complete model exists:

```bash
node sims/lp2_p6_prefix_holdout_freeze_sft.cjs proposal.json > frozen.json
# Commit proposal.json, exact decoder and frozen.json, then record full Git commit SHA.
# Read sha256 in frozen.json without modifying its bytes.
node sims/lp2_p6_prefix_holdout_grade_sft.cjs frozen.json <sha256> <40-hex-pretarget-commit>
```

Both programs run `--selftest` (or without arguments) as a target-independent integrity check; no default execution reveals or uses the protected reference. The frozen JSON reports the exact seven original rune positions. There is no claimed source-selected decoder at this checkpoint, so **this issue's result is a sealed holdout instrument, not a positive or negative plaintext test**. Do not break the seal merely to grade a model selected because it resembles known SEEK/AND fits.

## Research fork

A complete p6-selected rule must pass this pair without changing key fields, sign, phase, word boundary or receiver after precommit. A genuine hit, preferably alongside independent unknown-page output and a control, would upgrade the present retrospective source-tail alignment. A miss rejects the rule, not the separately observed 13-dot grid. A checksum-compliant roundtrip alone is mathematically uninformative about the plaintext: it satisfies only two linear equations on seven unknown key coordinates.
