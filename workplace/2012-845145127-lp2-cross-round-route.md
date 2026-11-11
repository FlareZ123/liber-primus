# 2012 845145127 chain: candidate bridge to LP2

## Established source facts

The community archive [`cicada-solvers/neuroretransmit-cicada`](https://github.com/cicada-solvers/neuroretransmit-cicada/tree/b13600373d3400d75ec4208198019f3d92a304dd) preserves the three-phase 2012 `845145127.com` material under `2012/005-845145127.com/`. The whitespace page, its extractor, and the decoded signed message are present:

- `whitespace/whitespace.html`
- `whitespace/extract-binary.py`
- `whitespace/whitespace.asc`

The extractor maps space to 1, tab to 0, and flushes each line as bytes. The decoded payload is a PGP clear-signed message by the same Cicada key used by later artifacts (issuer key ID ending `7A35090F`). It lists ten 12-digit image names:

`162667212858, 414974253863, 598852142735, 876873892385, 935691396441, 316744223127, 427566844663, 644169769482, 889296759263, 963846244281`.

The mirror contains only the first of those ten numbered images, `img/162667212858.jpg`, with its extracted `.asc` payload. That payload begins with the “In twenty-nine volumes, knowledge was once contained” / Mabinogion clue and gives a sequence of coordinate-like pairs. A separate `img/everywhere.jpg` and `.asc` payload begins “A poem of fading death, named for a king” and gives another coordinate sequence. The archive also contains the 2012 countdown and locations image/message pairs.

The 2012 locations PGP message contains a dash-escaped line (`- -33.90281, 151.18421`); correct OpenPGP cleartext signature verification must remove the leading `- ` before canonical hashing. Do not treat a parser that omits dash-unescaping as evidence of a bad signature.

## Candidate human solve path (unproven)

The 2016 signed text says that the words are the map and the numbers are the direction. The 2012 chain supplies a signed ten-number image index, a “twenty-nine volumes” clue, and coordinate-like sequences. The shared 29 motif may connect to the 29-symbol Gematria Primus alphabet, but this is only a hypothesis; it does not establish that the 2012 coordinate cipher is an LP2 key.

A plausible intended sequence is: decode the 2012 whitespace page; retrieve all ten numbered images; extract their payloads; resolve the Mabinogion and king-named-poem references; then test whether their coordinates or recovered words select an operation on LP2. The immediate blocker is that nine numbered images are absent from this mirror. Search other historical mirrors/archives for those exact filenames before inventing substitute coordinate interpretations.

The 2012 artifacts are not yet mirrored into this repository's `resources/`; upstream archive commit is pinned above. No LP2 plaintext, key, p56 preimage, or destination has been recovered from this route.
