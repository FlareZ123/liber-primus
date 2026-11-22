# P6↔p32 visual solve-path trial: source-only freeze (Agent6)

**Blind-phase freeze:** committed as `783cdb2792ac79250171e3eb423fb73727548f45` before inspecting any derived p6/p32 correspondence report, p50 route output, derived rune indices or numeric sums. Issue [#2049](https://github.com/FlareZ123/liber-primus/issues/2049). Author: Agent6 invocation `agent6-gpt6-20261121T170641Z-948ddbfb`.

## Evidence permitted at freeze

- Original LP2 physical p6 image, upload member `liber-primus-jpegs/23.jpg`, SHA-256 `4c7dce370242c67a7b785828d75547c042717b221d9d565d7dd097834c7b25d7`.
- Original LP2 physical p32 image, member `liber-primus-jpegs/49.jpg`, SHA-256 `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72`.
- Original signed 2016 plaintext, `resources/historical/cicada2016-4gq25-outguess.asc`, says “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction”, followed by “Seek and you will be found” and a warning about false paths.

## Independent visual observations

P6's upper text block is framed by symmetric curled ornaments, ends at a red 13-dot cluster, and is followed by a conspicuous red dropcap. The next block begins with several red runes and a second red 13-dot cluster before black text resumes. The red-to-black transition could mark an instruction span, a section start or a typographic motif. The red text is conspicuous to a contemporary solver even without a transcription.

P32 has six lines of black runes, an end-of-text red 13-dot cluster and a blurred black tree below. There is no red-highlighted rune span, named page reference, matching curled illustration or arrow from p6. The tree may be a distinct art clue, and the shared 13-dot design may indicate a common delimiter or glyph, but these are also compatible with a manuscript-wide ornament convention.

The signed message favors taking printed word boundaries, meanings and numbers seriously. It does not specify p6, p32, a red-span-to-terminal-fragment relation, an 11-rune segment, a cross-page direction, or a keyed transform.

## Frozen prediction and decision threshold

**No unique p6→p32 pairing or receiver is source-selected at this stage.** A source-only solver would prioritize reading the p6 red passage on its own, inspecting the 13-dot function across the manuscript and interpreting p32's tree illustration with its own immediate text. The two specific pages are not independently selected as a pair by the permitted evidence.

No numeric sum, GP29 transform, shift, matched fragment, key, rune offset, direction or original-cipher receiver can be frozen without post-hoc input. In particular, an arbitrary p32 fragment chosen because its word lengths match the p6 red passage will fail the prospective-human-path condition unless the original artifact gives a second independent reason for that exact fragment.

On reveal, the derived relation can still be *real as a structural equality*. To count as a plausible contemporary route, the withheld report must supply a uniquely recognizable original-source selector for both spans and an operation/receiver that a solver could choose before seeing the matching numbers; otherwise verdict is **post-hoc discoverability failure**, independent of the equality's arithmetic truth. A positive would warrant a frozen ciphertext holdout; a failure ends this human-route task with no new decoder.

**Blind-phase boundary:** Everything above was written from original pixels and authenticated 2016 message only. Derived material must be consulted in a separately labeled reveal section; do not retroactively alter this freeze.

## Derived reveal and adjudication (after committed freeze)

Source: [Agent3's p6/p32 source gate](../im-results/lp2-p6-p32-11rune-direct-source-gate.md), existing bounded work under #2047.

The revealed candidate identifies exactly four red printed p6 words of lengths **4|1|4|2**, at runes [71,82), and a p32 11-rune **single printed word** at [33,44), immediately after a period. The p6 word-length product is **32**; the p32 word `HOMEXWDSLFD` can be **artificially** partitioned `HOME | X | WDSL | FD`. Its proposed internal sizes then match those at p6. The middle-X receiver and a selected four-rune sum65 are retrospective criteria. These details are independently described in the pre-existing report, with original-corpus census and code.

**Blind outcome:** the committed source-only freeze did identify the red p6 passage as conspicuous but did **not** independently choose p32, the [33,44) p32 word, the word-length-product page pointer, the internal cut positions, or an invertible GP29 operation. In the original p32 scan, all eleven runes form a single word; four internal word boundaries are absent. The p6 red13-dot marks and p32 terminal red13-dot mark are visually genuine, but do not select that exact fragment. The signed 2016 message does not supply this cross-page selection.

**Decision:** no independent human-readable p6→p32 solve path was reconstructed. The numerical and printed-word structural observations survive in the pre-existing source gate; they remain unsuitable as a prospectively selected decoder. Earlier aligned additive p6-red/p32 applications already failed on the original ciphertext (see the cited source gate). A new cipher-family search would violate the premise test. No unknown plaintext or key was recovered.

**Director fork:** close #2049 as a bounded negative on human discoverability. A future task requires a *new* period-authentic source that uniquely points to p32 and its exact receiver, then supplies a reversible operation/key with a held-out ciphertext prediction. Otherwise retire this branch; preserve Agent3's 11-rune census and the original scans as sufficient references.
