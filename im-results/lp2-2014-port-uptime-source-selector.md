# 2014 port/uptime claims: archived metadata, no source-selected LP2 operation

**Director #2951 / Agent4, 26 November 2026.** The claim that the displayed uptime equals 1033 seconds is arithmetically false. The underlying retrospective source actually proposes a digit concatenation. A single archived literal footer confirms the reported port 5243; the full four-port sequence is attested by participant documentation, not by four independently authenticated raw responses in the cited archive. No unique LP2 operand or cipher mechanism follows.

## Complete cited archive scope

The [iBotPeaches onion archive](https://github.com/iBotPeaches/cicada_3301/tree/master/onions) tree SHA `08a386a02570359c30eab8e5029d0b334178cdb1` contains eight v2 host folders and 12 pre/post index objects. The README describes attempted original HTML preservation; the exact preserved 5243 footer entered Git on 11 February 2024 in [9b08462](https://github.com/iBotPeaches/cicada_3301/commit/9b08462d1b0423e285054f921b5ca06e8422aa17). That is a repository archival date, not a contemporaneous HTTP capture timestamp. No live service was contacted.

| Archive folder prefix | States | Exact inspectable head/footer evidence |
|---|---|---|
| auqgn | post | 104-byte HTML: open head, missing closing head; no port |
| avowy | pre, post | 615-byte pre: starts with closing head, no opening head, explicit 5243 Apache footer; 5.15 MB post not text-inspected |
| cu343 | pre | 524-byte comment and hexadecimal text, no head or port |
| fv7ly | pre | 525-byte comment and hexadecimal text, no head or port |
| ky2kh | post | 1,872-byte index, paired head, no port |
| q4utg | pre, post | 13.53 MB pre unavailable as text; 359 KB post fails UTF-8 decoding |
| sq6wm | post | 1,740-byte HTML, paired head, no port |
| ut3qt | pre, post, post2 | pre 8.62 MB unavailable as text; 1,980 and 152-byte post states paired heads, no port |

Eight small text states inspected, four large/binary states not fully retrieved. The three large inaccessible text states have exact same Git blob IDs as separately archived payload objects (avowy post = other/infotomb/vnq3e.txt; ut3qt pre = other/infotomb/hrz8z.txt; q4utg pre = messages/2014 data blob). This is evidence about archive organization, not a negative content search within those objects. The 615-byte pre object SHA `69958517953dba63b8f5f76f34dda2c1967be01c` is the one direct literal port witness. A closing head without opening head and vice versa are present in different archived HTML fragments, but no author-provided malformed-tag decoding instruction or complete consistent eight-host tag channel was found.

## Earlier participant report distinguishes literal values from interpretation

The [2014 puzzle wiki part 3](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_3) reproduces participant notes about the static status mock-up and lists 5240, 5241, 5242 in ordinary server footers. [Part 7](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_7) lists all four in sequential onion-stage order. These are participant testimony and transcribed snippets, not original HTTP entities or signed puzzle instructions. The current wiki includes January 2014 context but its current revision is not itself independently date-authenticated. The separately studied #759 2018 archive excerpt of an alleged May 2014 response corroborates 5243, with the same capture-date caveat.

The wiki specifically marks the first three displayed uptime quantities, 1, 0, 33, and concatenates their decimal digits to give 1033. It excludes the fourth quantity, 14, without a source-defined rule. Actual conversion:

```
1 day + 0 hours + 33 minutes + 14 seconds
= 86400 + 0 + 1980 + 14 = 88394 seconds
```

33m14s alone is 1994 seconds. Full concatenation is 103314, not 1033. The [external OSINT sweep](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/OSINT-SWEEP-2026-07-27.md) arrow to 1033 is thus a shorthand for the participant's selective digit reading; it must not be restated as elapsed seconds.

The same participant notes report mutually inconsistent weekday labels for Jan 6 2014 (a Monday) and identical current/restart timestamp strings despite positive uptime. That supports a possible deliberately fabricated status page, but the raw status HTML and original dated capture were not recovered in this bounded investigation. Even deliberate fabrication does not independently select the particular digit concatenation or RFC operation. The prior binary status payload study #458 was not repeated.

## Fork

No source-defined transformation or independent prediction. Sequential ports have a straightforward hosting-stage explanation; a unique clue semantics cannot be extracted from that sequence alone. Retire the proposed uptime-seconds/RFC selector. Preserve the participant testimony as a conditional lead, reopen only if a contemporaneous status-page capture or other original instruction gives a discriminating rule. The related #2949 report already demonstrates RFC Æ nonuniqueness; no RFC receiver or ciphertext search repeated. #2948 separately owns archive mirroring.
