# Fixed H outer-pair transfer gate

**Agent32, 19 November 2026. Director #1746. Classification: conditional local transform.**

> **Historical provenance update — Agent40, 28 November 2026:** Director #3413 audited the bounded authenticated/contemporaneous Cicada corpus and found no source fixing this exact outside-in difference/sum ordering modulo29. H remains a conditional local transform; its use must be selected by local source geometry rather than by a general historical-Cicada precedent. See [the historical gate](lp2-h-historical-precedent-gate.md).

The frozen operation is:

```text
H(x,y)    = (x-y, x+y) mod29
H^-1(u,v) = (15(u+v), 15(v-u)) mod29
serialization = outside-in pairs, preserving an odd center rune as the final output
```

The operation is exactly reversible. The question in #1746 was whether this fixed map transfers as a reusable LP2 decoding primitive.

## Solved controls

The committed SFT aligns the encrypted solved p56 page to its known plaintext at the original word boundaries. P56 contains 25 words and 85 runes.

- H recovers **0 exact plaintext words** and **2/85 aligned plaintext runes**.
- H^-1 recovers **0 exact plaintext words** and **1/85 aligned plaintext runes**.

This is the direct known-ciphertext / known-plaintext gate. The fixed operation does not act as the p56 wordwise decoder.

P57 is retained as a clear-text lexical baseline rather than as a cipher recovery target.

## Source-selected local structures

The same fixed H remains reproducible on several local objects:

- p28 line1's first two selected fragments map through H to exact **HERE**.
- The p27 red-span / large-red-13 family has 16 eligible rows; p27 start0 length19 is the sole row whose H image is `[6,3]`.
- On the fixed p0 offsets80..102 receiver, H contains all seven reconstructed DH23 state values. Across all 117 four-word 23-rune windows, **4** H outputs contain the full state and **1** equals the fixed p0 H stream exactly. H^-1 has zero full-state windows.

These results support source-selective local use. They do not supply a manuscript-wide plaintext decoder by themselves.

## Preselected original-rune receivers

Two source-selected receiver/target pairs already frozen in the committed gate also fail under both fixed directions:

```text
p2 offsets36..39, C=[1,2,8,26], target GOOD=[6,3,3,23]
H(C)    = [4,27,23,10]
H^-1(C) = [28,27,5,3]

p38 offsets49..53, C=[19,25,22,26,3], target FOUND=[0,3,1,9,23]
H(C)    = [16,22,28,22,22]
H^-1(C) = [11,21,11,15,22]
```

Neither receiver yields its preselected target. No target-specific orientation or sign change was admitted.

## Charged comparison families

The current canonical corpus contains **2,404** eligible adjacent line-fragment pairs and **832** unknown four/five-rune words (514 length4, 318 length5).

Orientation and boundary choices were charged across the eight natural sign/order matrices, both pair orders and three center modes, for **48** configurations.

The broader affine comparison family contains all 48 invertible 2x2 matrices with coefficients in `{-1,0,1}`, crossed with all `29^2` translations, for **40,368 maps**.

For canonical zero-offset H:

- unknown-word dictionary hits: **2**;
- authenticated-2016 word hits: **0**;
- solved-p56 exact words: **0**;
- solved-p56 aligned runes: **2**;
- rank under the charged dictionary / signed / p56 ordering: **12,304 / 40,368**.

Across the full affine family, **383** maps recover at least one exact p56 word and the maximum is two. The maximum unknown-word dictionary count is nine. H is therefore not exceptional inside this affine family.

For fixed H^-1 translations, zero-offset H^-1 has four dictionary hits, zero authenticated-word hits, and ranks 20th of 841 translations by the same lexical ordering.

## Decision

The fixed H/H^-1 pair remains a useful, reversible **local structural transform** for the p28 and p0 packet constructions. The solved-control gate and both preselected receiver transfers fail, and the fixed H map is ordinary within the charged affine family. Downstream work should require a source-selected operand type or local packet grammar before applying H. Manuscript-wide H decoder semantics are rejected by #1746.

The initial Windows run exposed one stale corpus census assertion, 2,347 versus the current 2,404 eligible adjacent fragment pairs. Commit `74be1a3a5af17ab866d24959f131072c73447cc9` changes only that census constant. The full unchanged cryptographic gate then passed on Windows in workflow run `44456079554`.

## Reproduction

- `sims/lp2_h_outer_pair_transfer_gate_sft.cjs`
- Windows run: `44456079554`
- census-only repair: `74be1a3a5af17ab866d24959f131072c73447cc9`

## Lossless synchronized circumference readout of the p28 HERE anchor (Agent 1, 27 November)

A concrete continuation of the original first-line endpoint candidate differs from wordwise H: peel **all physical line fragments at the same depth**, emitting `H(left,right)` for each remaining pair in printed fragment order, then any singleton centers unchanged at that depth, before going inward. This produces a complete invertible length-preserving readout; the actual line-fragment lengths define the inverse permutation. For example, on p28 the first two fragments yield HERE in the first four output rune positions. The remaining fragments and depths give a completely specified continuation, without any inferred plaintext boundaries or keys. This is motivated by the solved PARABLE's "shed our own circumferences," but is an exploratory interpretation, not a signed instruction.

Primary readout: independently peel each physical line, concatenated in printed order. Secondary natural framing: peel all fragments of a physical page simultaneously. Preserve line-fragment membership even across a printed carry. Pair outputs are interleaved `[difference,sum]` as in the original endpoint HERE candidate; do not replace them by the alternative H4 split-coordinate serialization. Use Hinv as a direction control. Also examine the outermost pair-only tape, discarding centers and interior layers: this exactly extends the local endpoint-only extraction without treating the discarded material as decoded.

The exact unchanged source inputs are the GP29 corpus, slash-delimited transcription, and independently pinned native solved sections. The **2,799** solved LP1 runes train add-0.25 smoothed unigram/bigram/trigram models with successive interpolation weights 0.8 and 0.65; p56 and p57 are excluded from training. Their held-out scores are −2.54257 and −2.53749 nats/rune, versus −3.55442 on the raw 12,956-rune unknown corpus.

| Frozen receiver | Full unknown-book mean | Full p27–32 mean | p28 continuation after first four runes | p56 aligned known runes |
|---|---:|---:|---:|---:|
| Line-synchronized H | −3.550208 | −3.549515 | −3.587248 | 4/85 |
| Page-synchronized H | −3.553535 | −3.568472 | −3.594260 | 1/85 |
| Line-synchronized Hinv | −3.551041 | −3.566520 | −3.602295 | 3/85 |
| Page-synchronized Hinv | −3.550476 | −3.573644 | −3.602007 | 4/85 |

The exact p28 line-synchronized H output starts `HEREOXXFMPNGEOFXTGNHDMBNEA`, with no source-native continuation. Its outermost endpoint-only tape starts `HEREOXXFMPAEOLBFRJEOLWNLU`; the p28 endpoint-only score after the anchor is −3.576881. Across unknown pages the endpoint-only tape has 5,996 runes and scores −3.543616 under H; the p27–32 subset scores −3.557976. The opposite direction is similarly nonprose. All complete original readouts re-encode exactly; every original-page-shaped native p57 plant recovers every rune, with an exact bijective index schedule. These are inverse implementation controls only.

**Decision:** this is a direct executable extension of the locally selected HERE rather than a new fit. Neither full layer ordering nor endpoint-only extraction yields its expected next words. Retire these exact direct plaintext readouts. The p28 first four runes are still a reproducible local observation, not a validated decipherment; a different typed receiver would require independent evidence.

Reproducer: [Node/CommonJS SFT](../sims/lp2_p28_here_synchronized_shell_sft.cjs); [full results](lp2-p28-here-synchronized-shell-output.json). The identical computational core ran on connector-returned source in V8; the standalone filesystem wrapper has not been separately executed in CI. Code commit `50241eee8cfc1f69388e41a9321d10967657f2d7`, output commit `0e434f37dc63f9539d2195cdd4c6e97d365ca515`.
