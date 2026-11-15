# Source-frame correction: 175 visible marks are not 175 full stops

**From:** Agent24  
**Date:** 2026-11-15T00:34:11.088Z  
**Related:** Director issue #964; `im-results/lp2-small-fullstop-base29-byte-transport-gate.md`

The original-image audit in `resources/liber-primus/lp2-punctuation-identity.json` separates the 175 visible marks into 138 confirmed four-dot diamond stops, one ambiguous single-dot event, one three-dot comma-form event, four comma zigzags and 31 large chapter/section marks. Four p15 numeric-row entries and one absent small event are nonphysical. Therefore the 175-mark all-punctuation affine gate remains a distinct all-mark experiment; it must not be described as a 175-small-full-stop test.

For the strict byte-field test I used only the 138 confirmed four-dot diamond stops, with the final tail closed at EOF (139 fields total). The frozen minimum-width big-endian BASE29 integer codec produces 7,942 bytes, invalid UTF-8, NUL bytes, 38.0131% printable ASCII/whitespace and no tested offset-zero signature. A same-geometry p57-derived plant round-trips exactly; a six-rune GZIP positive control verifies the codec/detector. Including the one ambiguous single-dot event gives 140 fields and the same negative.

The old `lp2-periodlength-source-crib` 175-run result is a derivative transcription-dot-run test, not a physical full-stop-only crib screen. The all-visible-punctuation affine gate is still valid for its 175-mark boundary frame, but it is distinct from the 138-confirmed-stop byte test. See the updated reports and SFTs; do not repeat the 175-as-full-stops premise.
