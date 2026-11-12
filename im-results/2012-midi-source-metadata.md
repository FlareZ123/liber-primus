# Original 2012 Cicada MIDI: complete metadata/SysEx source gate

**Issue #462. Bounded original-file result, 12 November 2026.** The exact participant-preserved 2012 MIDI file contains **12 standard metadata events and zero SysEx events**, and no hidden lyric/marker/track-name/copyright instruction. The sole text payload is the same original timestamp on all three tracks. The ordinary tempo, time signature and key signature are identical on both musical tracks. The 2012 source already provides a different explicit solve instruction through the signed poem's **chorus** and the note-off value/timing substitution; the note cipher and its decoded 49 words remain genuine original 2012 content. Nothing in the additional MIDI *metadata* selects a new GP29 mapping, LP2 page, cryptographic key or reversible original-LP2 inverse.

## Byte-pinned original and parser

- Original [2012 participant archive `song.mid`](https://github.com/neuroretransmit/cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2012/009-midi-puzzle/song.mid), exact commit `b13600373d3400d75ec4208198019f3d92a304dd`, Git blob `11924e0e195208c2eea757655035e149fb8a190f`.
- File length: **10,889 bytes**, SHA-256 `e6c5b86bb1a95f1a2239237eaf9d060ba708f07d46ffe8c4bce4fca06a5c529c`. Standard MIDI file MThd length6, format **1**, tracks **3** (one metadata-only track, two musical tracks), division **96 ticks per quarter note**; original file ends exactly at last MTrk with zero trailing bytes.
- [Single-file read-only parser](../sims/cicada2012_midi_metadata_sft.cjs) verifies the original Git blob before parsing every VLQ event, MIDI running status, meta-event, SysEx and channel-event byte boundary. Its complete JSON output, including original byte offsets/hex, is preserved in [successful manually dispatched GitHub Actions run 43131633490](https://github.com/FlareZ123/liber-primus/actions/runs/43131633490), using [workflow](../.github/workflows/cicada2012-midi-container-source-manual.yml). This does not depend on a guessed transcription or synthesized MIDI export.

## Exhaustive original metadata inventory

All offsets below are **zero-based original file byte offsets** for the beginning of each delta-time field. All events occur at tick0 except the terminating end-of-track events. Original field bytes are preserved.

| Track | Offset | Meta | Raw data (hex) | Interpretation |
|---:|---:|---|---|---|
| 0 | 22 | `01` text | `43696361646120617420467269204a616e2032302030333a35373a33392032303132` | `Cicada at Fri Jan 20 03:57:39 2012` |
| 0 | 60 | `2F` end-of-track | empty | Ends at tick0 |
| 1 | 72 | `01` text | identical to track0 | Same timestamp |
| 1 | 110 | `51` tempo | `07a120` | 500,000 μs per quarter note |
| 1 | 123 | `58` time signature | `07011808` | 7/2; 24 clocks per click; eight notated 32nds per quarter |
| 1 | 131 | `59` key signature | `0100` | One sharp, major |
| 1 | 4833 | `2F` end-of-track | empty | Ends at tick 81,912 |
| 2 | 4845 | `01` text | identical to track0 | Same timestamp |
| 2 | 4883 | `51` tempo | `07a120` | Identical to track1 |
| 2 | 4896 | `58` time signature | `07011808` | Identical to track1 |
| 2 | 4904 | `59` key signature | `0100` | Identical to track1 |
| 2 | 10885 | `2F` end-of-track | empty | Ends at tick 93,936 |

The complete inventory contains only: three text timestamps, two tempo, two time-signature, two key-signature and three end-of-track events. **Zero** SysEx, sequencer-specific, markers, cue points, lyric, track/instrument-name, copyright, channel/port prefix, SMPTE or other metadata fields occur. Musical channel events remain **1,118** (track1) and **1,430** (track2); the first track has no channel events. The parser recognizes all original bytes and rejects any trailing data. Hence no hidden payload is present in a MIDI meta/SysEx field of this pinned source.

## Source clue and transfer decision

The [archived signed original 2012 MIDI email](https://github.com/neuroretransmit/cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2012/009-midi-puzzle/README.md) explicitly instructs the player to follow the song's **chorus**, and the contemporary reconstruction identifies the two original track-wise note-off substitution texts. The second track repeats the Blake chorus; the first supplies the instructions and 49-word submission list. The archived README independently mentions the `Cicada at Fri Jan 20 03:57:39 2012` metadata text, so it is previously visible and does not become a novel date key by discovery here.

The original **7/2** signature determines bar geometry and has already been investigated in the [original note timing gate](../sims/2012_midi_timing_source_gate.cjs); its existence alone does not select an LP2 key schedule or page address. A generic period MIDI comparison is informative only insofar as these are legal standard metadata types; the exact file-level enumeration already excludes extra metadata records regardless of typical MIDI prevalence. The decoded 49 words and earlier note-stream investigations are outside this assignment and have not been repeated.

**Decision:** close the MIDI-*container-metadata* channel. No uninspected LP2 location/rune can be predicted from the existing metadata without inventing an extra selector. Reopen only if an independently authentic new 2012 attachment or contemporaneous instruction specifically names the timestamp, 7/2 meter, or a distinct MIDI meta convention and fixes a reversible original-LP2 consumer. This is a negative channel finding, not a universal exclusion of uses for the decoded chorus and 49-word list. No new LP2 plaintext, authentic key or destination was recovered.
