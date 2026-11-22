# Original pp36–38 five-numbered single-rune round-robin: exact negative decision

**Decision (22 November 2026).** The source-visible numbered passages 1–5 do not yield readable GP-native prose under the literal, unkeyed, one-rune-at-a-time round-robin. The output below consumes **all 553 original runes exactly once**, and its exact inverse restores each glyph to its original physical position. The source rule is fixed before inspecting output; no rune loss, invented key, arbitrary lane order or Caesar substitution is admitted. This closes only the pure single-rune interleave, leaving an unknown additional source-selected operation conceivable.

## Input, coordinates and reversible operation

Input is the original 2014 LP2 physical pp36–38 from `resources/liber-primus/lp2-transcription.txt`, cross-checked rune-for-rune against `lp2-corpus.json` and `lp2-ink-annotations.json`. The five visible units have rune lengths **[139, 91, 98, 96, 129]**, total 553. Within them physical pages contribute **139/228/186** runes respectively on p36/p37/p38. All **553 unit runes are black**; original printed numerals and punctuation remain attached to original source positions and are not interpreted as GP ciphertext. The fourth unit spans the original p37→p38 seam.

Let `lane[k][i]` be the i-th rune of physically printed numbered unit k, zero-based within that unit. For i from 0 to 138, emit `lane[1][i]`, `lane[2][i]`, …, `lane[5][i]` whenever that lane still contains rune i. The inverse receives the emitted stream in that same fixed schedule and deposits each rune back into its original lane offset. The SFT records the original page, page-local rune index and ink for each emitted glyph, checks every glyph against the canonical corpus and asserts 553/553 recovery. The fixed schedule has a completely determined tail after shorter lanes exhaust.

The original one-rune readout, grouped for display at 79 runes per line (display line breaks are artificial; no new word separators inferred):

```text
ᛚᚾᛞᛝᚻᚦᚣᚢᛄᚫᛇᛖᛈᛋᛉᛟᛉᚹᛄᚦᚪᚾᚾᛗᛒᚫᚢᛖᚱᛟᛠᛉᚪᛗᛏᛗᛁᚱᚾᛟᛉᛝᛚᛒᚹᚻᛏᛁᛋᛄᚳᛈᚹᛗᚫᛉᚹᚫᛉᛠᚪᛋᛉᛞᛗᛏᚣᛝᚻᚠᚦᛏᚠᛉᚫᚫᛠᛞᛁ
ᚳᛉᛈᚪᚣᚷᚩᛉᚠᛡᛇᛋᚪᛒᚻᚻᚳᛁᛄᚣᚹᛞᛄᛉᛠᛗᛏᛋᛞᛉᚻᚣᚱᛄᚻᛝᚹᚪᛝᛞᚣᚾᛏᚣᛖᛁᛟᛋᛇᚹᚩᛏᛝᚪᛖᛁᛉᛏᚫᚦᛏᚹᚳᛄᚢᛁᛁᚷᛝᚳᛖᛟᚳᛈᛉᛡᛄᚻᚪ
ᛗᛄᚠᛖᚢᚪᛗᛁᛟᛠᚣᚣᚩᚱᛇᛠᛚᛁᚪᛏᚹᚻᚱᛡᚱᚫᚱᛋᚻᛖᚪᚩᛉᚳᚫᚳᛞᚾᛝᛗᚢᛒᛗᛒᚫᚫᛡᚪᛖᛠᚳᛈᛡᚱᚻᛇᛠᚱᛠᛁᚳᛗᛈᚪᚫᚣᚳᛋᛚᛟᛡᛠᛞᛟᛠᚫᛖᛁᛖ
ᚹᛏᛒᛟᛚᚳᛖᚢᚻᚪᛄᚳᚷᛖᚦᚦᚠᛁᛏᛋᚻᛋᚦᚢᚳᛡᚻᛟᚹᚹᚩᛋᚫᛠᚱᚢᚱᛡᛟᚹᚩᚢᚻᛞᚩᚦᚦᛝᛟᚻᚷᛁᛖᛄᚣᛡᛋᚾᛁᚢᚻᛝᚱᛝᛝᛋᛗᛠᛡᚩᚷᛞᛡᛄᛈᚪᚫᛋᚱ
ᛚᛁᚢᚻᛞᛁᛟᛠᛏᛗᛏᛞᚢᛝᛒᚪᚪᚪᚻᚩᚠᛄᚾᚪᚳᛋᛁᛝᚷᚩᛝᚹᚳᚩᚦᛞᛡᛖᛝᛟᚳᛒᛈᚫᚱᚪᛗᚹᚹᚢᚱᛝᛉᛚᛚᛒᛡᚢᛏᚢᚹᛞᛉᚱᚦᛈᚠᚫᚷᛋᚾᛒᚾᛁᚢᚩᛋᛈᚾ
ᛞᚦᛏᚳᛖᛚᚳᛒᚻᛠᚷᚦᚷᚱᛄᛁᚾᚠᚣᛡᚣᛗᚷᚹᛞᛝᚩᛟᛚᛋᚩᛖᚢᛉᚻᛟᚣᚳᚱᛝᛁᛇᚫᛒᚾᛖᚾᛏᛗᚳᚣᚠᛁᚫᛋᛖᛒᛖᛟᚾᚠᚱᚣᛞᛇᚷᚩᛇᛝᛗᚳᚾᛒᚣᛇᛋᛚᚪᛗ
ᛁᛁᚷᚳᚢᚹᛡᚣᚱᚠᛝᛟᛚᚾᚫᛟᚣᛒᛇᛟᛚᚷᚩᛄᚳᚪᛞᚾᚾᛗᛝᚫᚷᚣᛡᚦᛝᚠᛄᛁᚻᛒᛄᛝᛚᛈᛠᚾᛟᛁᛄᚱᛏᚷᚷᛄᛚᛇᛒᚫᛝᚻᚢᚪᛏᚱᚻᛉᚳᛉᚩᛚᚾᚫᛞᚣᛒᚾᚪ
```

## Independent language control

The complete result has **IoC 0.03423356133867966**, necessarily unchanged by any pure transposition of the original 553 rune multiset. The unfitted source GP29 bigram score, trained on authentic LP1 source material disjoint from a native 553-rune plant, is **−0.5729005397 nats/rune**; the unmerged numbered-source stream scores **−0.5711130583**. Its best selected contiguous 150-rune window (start 39) scores **−0.4336388011**. Genuine solved-LP1 plaintext of 553 GP runes scores **+0.6001048276**, while authentic p57 readable text scores **+0.7174887773** under this same language scoring rule. Both the original 553-rune interleave and the 553-rune native-LP1 plant pass exact unmerge/remerge. These diagnostics do not exclude a stronger cipher layered after transposition; they reject this literal direct reading as a full decipherment.

The earlier word-wise and physical-line-wise readings were separately retired in [the predecessor report](lp2-five-numbered-passages-parallel-word-line-original-gate.md). A previous independent implementation in `sims/lp2_five_numbered_rune_roundrobin_source_sft.cjs` was present but its exact equality assertion used an inaccurately rounded IoC literal (0.03423356125979035). This run repairs that checksum and adds source-page/ink coordinate verification and a disjoint native-LP1 language plant in `sims/lp2_five_numbered_passages_single_rune_roundrobin_original_sft.cjs`. The existing manual Windows Node22 workflow `.github/workflows/agent6-five-numbered-rune-original.yml` checks both.

## Decision boundary

**No unknown plaintext or key recovered.** Five labels give a reading order, with no source-defined substitution, state transition, initialization or validated receiver. Do not search further lane orders, offsets or second-layer keys chosen from this nonprose output. Reopen only if independent period evidence identifies a typed second operation or another authentic artifact specifies a new consumer. The remaining broad question is whether pp34–39 are five individually encrypted numbered sayings or a more complex executable program, handled by other tasks.
