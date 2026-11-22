# Agent1 broadcast — authenticated 2012 MIDI and 2016 continuation echo

**Sender:** Agent1  
**Run:** `agent1-gpt6-20261121T162128Z-draw5-issue-directed`  
**Date:** 2026-11-21 17:16 UTC

## Corrected source fact

The embedded `PGP MESSAGE` in `resources/historical/cicada2012-midi-email.asc` is **compressed and signed, not encrypted**. GnuPG packet inspection shows:

1. ZIP-compressed data packet (tag 8)
2. One-pass signature (tag 4), key ID `181F01E57A35090F`
3. Literal-data packet (tag 11), filename `Cicada.mid`, 10,889 bytes
4. Trailing signature (tag 2), same key ID

No public-key session-key, symmetric-key session-key, or encrypted-data packet is present. GnuPG verifies the inner signature against fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`; trust remains unknown. The extracted MIDI SHA-256 is `e6c5b86bb1a95f1a2239237eaf9d060ba708f07d46ffe8c4bce4fca06a5c529c`, and its Git blob SHA-1 `11924e0e195208c2eea757655035e149fb8a190f` matches the pinned external archive.

The outer clear-signed email and inner MIDI signature both verify with the same key. The updated CI workflow passed: [run 44929003399](https://github.com/FlareZ123/liber-primus/actions/runs/44929003399). Its logs show the packet sequence, absence of encrypted packets, a good inner signature, and the exact file hash.

## Reproduced musical decode

The second musical sequence has 714 note events, exactly three repetitions of the 238-letter Blake chorus. Deriving the note/duration substitution from that known text, then applying the octave-shifted table to the first sequence, reproduces its 558-letter instruction and 49-word list.

The 49-word list is therefore authenticated as a deterministic decode of this signed MIDI **for this recipient**, but remains recipient-specific; it is not a universal LP2 key.

## Potential human-solve-path connection

The 2012 introduction says: “This song is your own path,” “Another stop on the road toward enlightenment,” and “Follow it.” The 2016 signed message opens: “The path lies empty; epiphany seeks the devoted.” The path/road, enlightenment/epiphany, and follow/devoted parallels are a plausible cross-round continuation cue. They do not specify a new reversible operation or prove that the 49-word list is intended as an LP2 key.

## Research impact and decision request

The previous claims that the embedded PGP block was encrypted and that the MIDI was not separately signed have been corrected in:

- `im-results/2012-midi-source-metadata.md`
- `im-results/2012-midi-chorus-p36-238-gate.md`
- `im-results/2012-midi-49word-parable-continuation-gate.md`
- `im-results/lp2-2012-blake-chorus-56-page-gp28-original-gate.md`
- `im-results/lp2-2012-chorus-base56-wordmap-gate.md`
- `resources/external/cicada2012-midi-source.json`

The existing LP2 consumer tests remain negative: the 238-letter chorus→p36 test, 56-word GP28 repeat-key test, 49-word-list→p50 address test, and 49-word-list→parable continuation test. Please do not commission repetitions of those tests. The remaining decision is whether the 2016 wording echo selects a genuinely different operation using the signed 2012 song/chorus or whether it is thematic continuity only. Any successor should name an independent source selector and a locked test on original LP2 ciphertext.
