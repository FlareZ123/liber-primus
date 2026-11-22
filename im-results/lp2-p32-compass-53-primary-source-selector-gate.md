# p32 five-byte 5+3 compass convention: original-source selection gate

**Decision, 14 November 2026:** A fixed 5-bit distance / 3-bit eight-way direction packet is a reasonable interpretation of a 32×8 byte-valued table, but **no inspected primary Cicada instruction independently authorizes that grammar and a unique compass convention**. The earlier five-byte p32 path remains an unselected navigation interpretation. There is no resulting authentic original-page key, recovered plaintext, or external destination.

## Why a new source selector was necessary

[Original terminal-fiveunit result](lp2-terminal-fiveunit-primeordinal-grid-compass-HOMEX.md) derives the five bytes **[51,111,194,148,110]** from the solved p56 heading and four solved p57 units via prime-ordinal positions in the 256-cell printed table. Reading each byte as 5-bit distance and 3-bit direction yields one five-step route from a post-period printed HOMEX prefix at original physical p32 offset 33 to the X at offset 37, under the chosen N,NE,E,SE,S,SW,W,NW compass code, 11×11 toroidal wrap and row-major grid. The table itself has **32 rows × 8 columns**, providing an independent *geometric possibility* for a 5/3 partition. This does **not** specify that table cell *values* should be split as navigation packets.

The recorded original-input countercheck holds the same five bytes, address ordering and starting cell and rotates/reverses the conventional eight compass labels: **four of sixteen** equally simple orientations reach the same X. Thus merely ending at the already visible X fails to identify one direction-code convention. Further flexible stops, bit splits or starts would inflate the selection freedom.

## Period-primary-source audit

Read the exact archived source text, without treating a modern walkthrough as Cicada authority, from [the pinned krisyotam/cicada3301 archive commit 76d3ee8](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469), using the GitHub repository source API. The 2012–2014 clear-signed messages below were searched for an explicit textual direction convention, a compass orientation, a bit-packet allocation and associated distance semantics. All matched **zero** literal compass, north/south/east/west, distance, direction and five-/three-bit definitions:

- **2012, seven preserved .asc files:** key-announcement, key-in-front-of-you, book-code-poem, coordinates, second-chance, end-of-puzzle, final-message.
- **2013, five entries:** opening-book-code, rune-table-morse, telnet-hello, cicada-os-message in both preserved named versions. The two OS entries have identical preserved sizes (948 bytes); do not count as independent clues.
- **2014, six entries:** final-message, liber-primus-hash-block, onion-welcome, onion5-liber-primus, opening-book-code, liber-primus-release. Their archived files range 1,010–25,994 bytes.

Also inspected source-archive original 2014 onion HTML/index texts from stages 02,03,04,05,08,10,11 and the archived solved 56.decoded / 57.decoded. The stage10 signed original on-wire instruction specifically asks the pilgrim to **paste the magic squares into designated text areas and give a Tor hidden-service upload URL**; it provides no navigation packet or compass. Original Stage11 contains the LP2 images with title 133 and no directions. No explicit 5+3 eight-way compass instruction was found in these bounded original witnesses. Long binary/hex stage-carrier payloads and every possible recovered external page are **outside** the textual audit.

The **2016 signed public message** provides the positive source rationale for investigating navigation: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.” It contains **no** source definition of packet bits, cardinal code order, north reference, distance units, torus wrap or destination operation. A general fact that 3 bits label eight directions, also found in unrelated technical teaching materials, cannot supply a missing *Cicada-selected* convention.

## Retained inference and actual decision

The original 32×8 table and 2016 word-map direction message leave this mechanism *possible*. The unpublished directional convention and lack of independent p32 page selector remain a genuine blocker: selecting the compass order by its HOMEX endpoint would be post hoc, and the literal original intermediate readout W–NG–EA–D–X is not recovered plaintext. Four successes among sixteen common orientation variants are already quantified in [the earlier original-input report](lp2-terminal-fiveunit-primeordinal-grid-compass-HOMEX.md), with exact SFT [lp2_terminal_fiveunit_grid_compass_homex_sft.cjs](../sims/lp2_terminal_fiveunit_grid_compass_homex_sft.cjs).

**Gate fails under #799 completion criteria.** Retire this *specific* five-byte 5/3 compass route as an author-selected decryption operation until a genuinely independent primary input fixes the bit semantics **and** one unique code orientation, ideally with a predicted original unknown-rune readout. The absence of a phrase in this finite corpus does not prove Cicada never encoded a navigation key elsewhere. Do not try another 16 orientations, flexible starts or table phases without that source.
