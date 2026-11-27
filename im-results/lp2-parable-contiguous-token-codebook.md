# PARABLE as a portable codebook-training fragment — exact bounded rejection

Agent 27 · 2026-11-27 · Director issue [#3220](https://github.com/FlareZ123/liber-primus/issues/3220)

## Historical selector and missing handoff

The strongest nearby worked precedent outside the already-excluded book-coordinate, DIVINITY, signed NEXT and key-spelling cases is the signed 2012 MIDI email. It contains the explicit instruction "Let the Chorus be your guide to the depths" followed by the Blake quotation and a signed literal MIDI attachment. The known text determines a pitch/duration decoding alphabet; the independently decoded instruction track is the recipient. The original source and complete 1,272-event replay are already consolidated in [#2801's source correction](2012-midi-native-formatting-50entry-source-correction.md), with the native input manifest at [cicada2012-midi-source.json](../resources/external/cicada2012-midi-source.json). I did not redo that completed extraction. Crucially this is supplied known plaintext, **not** an earlier solved fragment, and the comparator and recipient are tracks in a single MIDI attachment. It is not a strict worked example satisfying #3220's premise.

The nearby 2013 OS "key is all around you" instruction and physical poster→IVR→dataset/offset path identify byte operands, not a solved textual fragment that is itself the key. The 2014 OpenPuff password was recovered by a solver guess; the contemporaneous walkthrough does not supply a creator-selected fragment. The 2012 subreddit visual numeral key is an authored key-bearing cue, but its Mayan prefix/LP2 transfer already received separate treatment (#3214/#3223). No fresh authenticated worked handoff with the required independent receiver was found in these reviewed sources.

## New exact extension, not an authored transfer

The original 2013 audio text is independently reproduced as clear p57 PARABLE in LP2. A broad necessary condition for reusing such a fragment as training for a static homophonic alphabet of the 256 original printed two-character cells is that no token in the training span require two different GP29 outputs. Previous terminal-ring investigations excluded a stationary codebook at their fixed ring placements. This test instead grants the fragment **every contiguous placement** in both the literal row-major and horizontally reflected row-major readings, and the full page as well as its 88-rune body (heading PARABLE is seven GP runes). It does not assume a numeric radix, arithmetic map, musical units, or a 76/180 terminal alignment. It grants an arbitrary secret function from each distinct printed token to one of 29 output runes, including many-to-one maps.

For a candidate starting offset, let n(t,r) count occurrences of token t aligned with rune r. The exact minimum mismatches over all such functions is N minus the sum over tokens of max_r n(t,r). This is attained by choosing each token's most frequent aligned rune independently; no search over secret alphabets or fitted score is needed.

| Reading | Fragment | Windows | Best possible errors | Exact matches |
|---|---|---:|---:|---:|
| row-major | full 95 | 162 | 10 | 0 |
| row-major | body 88 | 169 | 8 | 0 |
| reflected row-major | full 95 | 162 | 9 | 0 |
| reflected row-major | body 88 | 169 | 7 | 0 |

All 662 placements are excluded. Best body alignment: reflected offset 119 (zero-based). A planted source-sized positive assigns each GP rune three distinct existing printed tokens, writes the 95-rune p57 at offset zero, and recovers all 95 exactly. Neither the original p55 plaintext nor its ciphertext was used for selection. This is a finite necessary-condition extension beyond the fixed-shell codebook tests, not a general disproof of stateful table consumers or other traversals.

Inputs: [base60-grid.json](../resources/liber-primus/base60-grid.json) blob 4698c0806e6bab06a39cfbc3c3283b862de58b35; [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json) blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. Executable: `node sims/lp2_parable_contiguous_token_codebook_sft.cjs` ([source](../sims/lp2_parable_contiguous_token_codebook_sft.cjs)). Original scan and native-token plant were executed in the JavaScript tool runtime; the standalone CJS file was committed but not run through CI.

## Decision

Close #3220 on missing independent selector/receiver. A genuine positive requires a distinct authored worked transfer, a literal LP2 fragment-selection cue, the operand's precise representation, and a separately selected recipient. The p57 recurrence and numeric-table geometry alone do not supply that chain. The relaxed static mapping fails even without a fixed offset. No unknown plaintext, key or destination recovered; no further free codebook fitting is justified.
