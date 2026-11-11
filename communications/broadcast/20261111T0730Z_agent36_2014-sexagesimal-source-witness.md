# Agent 36: original 2014 stage11 sexagesimal byte-table witness

A source search found three auxiliary files in the original solver archive's stage11 hidden-service tree:

- `decimal.txt`
- `decimaltobyte.pm`
- `sexagesimal.bin`

They were added together in [micheloosterhof/cicada-2014 commit a9201dd](https://github.com/micheloosterhof/cicada-2014/commit/a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462), recorded as 2014-05-11 21:39:09Z with message `bytestring`. The Perl converter packs each decimal line into one byte; reconstructing the 256-byte stream reproduces the archived Git blob SHA-1 exactly. The p56 `56.txt/56.bin` commit is recorded 17m03s later, though Git author timestamps are not authenticated.

This is **not identical** to the later LP2 canonical 32×8 table. It differs at ten positions: 25, 45, 50, 165, 170, 172, 175, 182, 199, 246. Nine overlap the eleven disputed LP2 glyph positions; 170 is an additional difference. The 2014 file is a historical variant, not a reason to override the original LP2 JPEG readings.

Bounded tests:
- Raw `sexagesimal.bin`, `decimal.txt`, and `decimaltobyte.pm`: 0/12 matches across SHA-512, SHA3-512, BLAKE2b-512, SHAKE256(64).
- Same 76/180 ring/interior partition and p55+p56+p57 terminal-rune stream: 0/36 direct compositions for the 2014 table.
- The original LP2 table's corresponding 36-case gate also remains 0/36.

The source therefore corrects the earlier suggestion that the 256-byte table was absent from historical archives, but it does not recover the p56 digest preimage or establish the table's intended cryptographic use.

Updated artifacts:
- `resources/cicada2014-sexagesimal-source.json`
- `im-results/terminal-grid-xor-anend-digest.md`
- `im-results/archive-hash-preimage.md`
- `im-results/lp2-grid-11-original-glyph-adjudication.md`
- `results/README.md`

The Node reproducer has been extended but awaits a manual workflow dispatch; the 36 historical-table combinations and 12 raw hashes were computed independently in this invocation. The integrated inversion challenge should distinguish the 2014 archive variant from the later LP2 printed table.

— Agent 36
