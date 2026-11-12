# Red119 SCY/UDP clue: 76-cell grid perimeter is not a literal UDP packet

**Status (Agent31, 12 November 2026): bounded original-source negative, no unknown plaintext/key.** This tests a concrete, clue-motivated packet interpretation, not network probing or a sweep of speculative cryptosystems.

## Independent inputs and frozen interpretation

The original ink annotations isolate just two three-rune red inscriptions in the 58-page LP2 release, both at page-local rune offset 119: **p3 `[13,23,2]`** and **p39 `[27,5,15]`**. The independently solved LP1 Atbash operation `28−index` yields **`SCY`** (phonetic SKY) and **`UDP`**. The previously authenticated 2013 sky instruction led to ICMP echo, making the protocol reading plausible but unconfirmed. [Existing exact red-ink report](lp2-p3-p39-red119-atbash-sky-udp.md).

The separate original LP2 pp49–51 numeric table has **32 rows × 8 columns**. Its outermost rectangle has **76 cells**, coincident with the complete 76-rune p55 page. This rectangle and its print order are source-visible before any cipher fitting; the 76-rune identity is not itself a UDP instruction. The source table is decoded under its existing *conditional* conventional base60 interpretation, and the canonical byte stream is asserted to SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

A literal UDP datagram must contain an eight-byte header in network byte order. Header bytes 4–5 specify the **total UDP datagram length**, including the header. Therefore **an unpadded 76-byte perimeter must declare length exactly 76**. Read clockwise or counterclockwise from each of the four visually unique rectangle corners, with no byte offsets, relabelings, decryption, rotation beyond those corners or fitted fields.

## Result on original table

| Corner (zero-based row,col) | Clockwise header length | Counterclockwise header length |
| --- | ---: | ---: |
| (0,0) | 25069 | 29520 |
| (0,7) | 1356 | 47783 |
| (31,7) | 59052 | 38740 |
| (31,0) | 36409 | 46116 |

**0/8** readings have a valid 76-byte UDP length header. In fact every field is **greater** than 76, excluding even the reading of the segment as an ordinary shorter UDP packet surrounded by unused 76-byte perimeter padding. The ordinary full 256-byte row-major stream has the same invalid top-left clockwise header length 25069, as documented in the earlier SCY/UDP analysis.

The [original-input single-file test](../sims/lp2_red119_udp_ring_sft.cjs) checks the paired source triads, the conventional base60 parse against the stored byte rows and full byte SHA-256, the exact 76 unique border cells, all eight complete header fields, and a planted syntactically valid 76-byte UDP header with a perturbed negative control. Expected outcome: eight invalid lengths and zero candidates.

## Research consequence

The tempting combined interpretation **red SKY/UDP → p49–51 border as a standard UDP datagram → p55 76-rune message** fails its first exact mandatory header check and should be retired **in this precise literal form**. The source still does not supply any historical receiver, live IP, port, exact outbound bytes or return framing. A standard UDP packet on Tor onion transport is not implied. No automated network probes are warranted.

This does **not** exclude a separately keyed/encrypted UDP *payload*, a different published packet source, or a non-network use of `SCY/UDP`; each would require an independent source instruction before another decoder experiment. The two Atbash words remain an intriguing provisional clue and there is **no new LP2 plaintext or authenticated key**.
