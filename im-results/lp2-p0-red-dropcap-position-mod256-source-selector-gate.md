# Red-dropcap global offsets do not select a p50 modulo-256 address map

**Disposition: negative at the source-selector gate.** No modulo addresses were computed, and no p50 consumer was tested.

## Candidate rule under review

The original-image red-channel inventory yields 13 dropcap global rune offsets:

[0, 729, 848, 1541, 1874, 3612, 5506, 6527, 7960, 8051, 9519, 9640, 12648]

The proposed bridge was exactly:

1. concatenate LP2 rune pages in canonical reading order;
2. take each red dropcap's global rune offset;
3. reduce the offset modulo 256;
4. use the result as a row-major address into the p49–p51 256-cell table.

This is a specific candidate, but the modulo step and the connection between the two artifacts require a source selector before any output is examined.

## Source-selector audit

### Authenticated 2016 signed message

The signed message says: "Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction." It does not mention red marks, global rune offsets, modulo arithmetic, 256-cell addresses, or row-major indexing. It supports a word/number navigation hypothesis in general, not this exact offset-to-cell operation.

### Original p50 table layout

The derived table record describes a 32-row by 8-column grid across p49–p51, with 256 tokens and byte rule 60*digit(first)+digit(second). The visible grid supplies an ordinary row-major reading order and a candidate base60 interpretation. It does not label its cells with global LP2 rune offsets, specify wraparound, or instruct a solver to reduce unrelated offsets modulo 256. The table record itself keeps base60 distinct from the competing base59 interpretation.

### Original 2014 Onion2 artifact

The surviving 170-byte and 201-byte HTML snapshots contain the "Patience is a virtue" comment and the growing hexadecimal output. The 256-byte stream is a separate historical artifact. Neither snapshot connects its length, byte positions, or timing intervals to the LP2 red-dropcap offsets or to p50 cell addresses. Equal lengths do not establish an addressing rule.

### 2013 CicadaOS source

The preserved cicada2013-os-original-prime-echo.sh is a 12,248-byte prime-stream script. Its occurrences of the digits 255 are prime values such as 2551 and 2557; the script contains no 256, mod, modulo, percent operation, byte-address convention, or offset-to-table rule. It supplies no contemporaneous selector for this bridge.

### Red-channel inventory

The global offsets are derived measurements from the canonical concatenated rune stream. The original pages show red dropcaps, but do not print their global offsets or assign them to p50 cells. The offsets are therefore analyst-derived numbers, not source-authored coordinates.

## Decision

No reviewed first-party text, original page layout, or contemporaneous Cicada convention selects the exact global-offset → modulo-256 → row-major p50 address operation. The 256-cell table and the 256-byte Onion2 stream do not by themselves supply the missing link.

**Reject this modulo-256 positional bridge as unselected.** Do not compute its 13 addresses, compare them to p0 K13, try another modulus, or search alternative sorting/indexing rules. Preserve the 13 dropcap offsets as verified source measurements only.

A separate open source-inventory task, #2003, is re-extracting the pinned 2013 CicadaOS ISO. If that original rootfs later yields an explicit first-party instruction connecting global positions to 256-cell addressing, the Director can reopen this decision with that new source. Until then, the bridge is retired.

## Sources inspected

- resources/historical/cicada2016-4gq25-outguess.asc
- resources/liber-primus/lp2-grid-256.json
- resources/liber-primus/lp2-ink-annotations.json
- resources/historical/cicada2014-onion2-20140107-170byte.html
- resources/historical/cicada2014-onion2-20140107-201byte.html
- resources/historical/cicada2013-os-original-prime-echo.sh

No cryptanalytic output was generated, because the source-selector prerequisite failed.
