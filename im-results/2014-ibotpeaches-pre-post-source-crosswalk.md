# iBotPeaches pre/post archive crosswalk (#2948)

## Decision

The eight named folders contain **12 state objects, not 12 new 2014 HTML pages**. One is the already local 2012 onboarding page; two are JPEGs (one misleadingly named index.html); nine are 2014 HTML snapshots. Every object is either an already-known external byte identity, a local duplicate, or one of four variants of known text. No new source-selected decipherment instruction is identified.

The exact [machine-readable crosswalk](../resources/external/ibotpeaches-onion-state-crosswalk-20261126.json) includes every path, size, Git blob SHA-1, pinned source, local exact match and canonical external counterpart. The upstream tree at 08a386a02570359c30eab8e5029d0b334178cdb1 and the comparator tree at 76d3ee8c762f60025822c8c05edbf31351636469 were nontruncated. Exact Git blob identity confirms identical file content, not independent HTTP capture provenance.

| Host prefix and state | Result |
| --- | --- |
| auq post | Exact Stage02 HTML and separate 1033.jpg in existing pinned Krisyotam corpus. JPEG 1327×1427. |
| avowy pre/post | Exact Stage05/06 external assets. Pre's 512-hex payload matches local three-block file; comment3301 and historical footer are known. Large post not fetched as raw bytes here. |
| cu343 pre | 512-hex payload equals local Stage03; HTML comment 761 instead of Patience is a virtue. 761 is already the local label of that same block. Preserve both witnesses; no new operand. |
| fv7ly pre | Same nonwhitespace content as local Stage04, including 1033 comment and hex block. One trailing newline differs. |
| ky2 post | Same nonwhitespace content as local Stage11: title133, id331, all 58 image links; indentation differs. |
| q4ut pre/post | Pre exact Stage07 external asset; post is actually a 359,282-byte JFIF JPEG, 850×1248, ending FF D9. Exact blob matches known Stage08 index.jpg and archived Brotherbox portrait. |
| sq6 post | Exact local 2012 onboarding HTML, outside 2014 scope. |
| ut3 pre/post | Pre exact Stage09 external asset; post's signed text is byte-identical to local Stage10 form and all nonwhitespace characters are identical. |

Neither JPEG is in the supplied combined LP1/LP2 JPEG zip by exact Git blob SHA-1; they are known historical assets in the separately pinned 2014 corpus, not missing LP2 leaves. Both binary signatures and dimensions were parsed from retrieved bytes.

## Scope and redistribution

The [upstream license](https://github.com/iBotPeaches/cicada_3301/blob/08a386a02570359c30eab8e5029d0b334178cdb1/LICENSE.md) expressly does not license third-party material organized by the archive. Preserve the stable metadata/links and do not duplicate raw HTML/JPEG files without permission. This is a source map rather than a new raw mirror. Three large HTML blobs are exact external Git tree matches, but their full bytes were not fetched in this invocation. No claim of independent server headers or capture dates; #2951 separately treats metadata interpretation. No new cipher or key sweep is warranted from these variants.
