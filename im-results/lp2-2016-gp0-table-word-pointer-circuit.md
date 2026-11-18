# Signed-2016 GP0 table word-pointer circuit into p0 and p27

**Agent23, 18 November 2026. Classification: high-priority source-internal navigation mechanism with a strong p0 crib placement. The route recovers a reproducible pointer circuit; it does not yet recover the full p0 cipher or establish all target letters cryptographically.**

## Decision

A single frozen operation now links three independently selected source objects:

1. normalize a source word into canonical GP29;
2. sum its zero-based GP indices without reduction;
3. use that sum as a zero-based address in the original 256-cell p49–51 table;
4. read the conventional base60 byte at that cell as a page-local rune offset when a receiver page has already been selected.

Under that operation, the authenticated 2016 clue's adjacent words **EMPTY / EPIPHANY** are the **only adjacent pair among all 43 signed words whose table bytes are consecutive**. Their outputs are exactly **236 / 237**. On original p0 those are the two sides of the page's only later 2-rune / 7-rune word boundary: rune236 is the last rune of the two-rune word and rune237 is the first rune of the following seven-rune word. The signed clause itself supplies the matching phrase **“epiphany seeks the devoted”**, whose final two GP word lengths are 2 / 7.

The same target closes through the map. The two-rune p0 ciphertext word has GP0 sum13; table cell13 is literal token `04`, byte4; zero-based signed word4 is **EMPTY**; EMPTY has GP0 sum92; table cell92 returns byte236, exactly the final rune of that two-rune word. Across **all eight** p0 words whose GP0 table byte is a valid zero-based index into the 43-word signed message, this is the **only** route whose selected signed word maps back to either boundary of the originating p0 word.

The following seven-rune p0 ciphertext word has GP0 sum101; table cell101 gives byte229. Independently, the p27 route reconstructs integer3301, and `3301 mod 256 = 229`; table cell229 is literal `00`, byte0. The seven-rune target therefore returns to the exact table address already implicated in the conditional `3301 -> 229 -> 00 -> p0` navigation route.

This is strong evidence that the signed sentence and p50 table form a real navigation layer. It upgrades p0's red 8–5 opening **EPIPHANY / SEEKS** and the later 2–7 pair **THE / DEVOTED** from a bare word-shape coincidence to a source-selected crib placement candidate. Full plaintext status still requires a reversible p0 cipher or another independent letter-level prediction.

## Frozen source facts

The authenticated 2016 clear-signed body contains exactly 43 alphabetic words when the numeric terminal `3301` and hexadecimal key-ID fragments are excluded. Its opening clause is:

`Hello / The / path / lies / empty / epiphany / seeks / the / devoted`

The canonical p0 transcription contains 59 complete words and 262 runes. Its first two words have lengths **8 / 5**. After those opening words, the page contains exactly one complete **2 / 7** adjacent word pair:

| p0 word | zero-based rune start | length | ciphertext GP indices | GP0 sum |
| --- | ---: | ---: | --- | ---: |
| word52 | 235 | 2 | `[8,5]` | **13** |
| word53 | 237 | 7 | `[15,22,16,22,21,1,4]` | **101** |

Thus the relevant boundary is **236 / 237**.

The canonical signed words have GP lengths `EPIPHANY=8`, `SEEKS=5`, `THE=2`, `DEVOTED=7` under the existing K→C and V→U normalization. No ciphertext values are used to choose those lengths.

## EMPTY / EPIPHANY direction pair

Canonical GP0 sums are:

- `EMPTY = 92`
- `EPIPHANY = 121`

Both addresses lie inside the independently established p50 strict-interior bracket at cells84..126. Reading the original base60 table gives:

- `T[92] = 236`
- `T[121] = 237`

Across all 42 adjacent pairs in the 43-word signed message, **EMPTY / EPIPHANY is the only pair whose table-byte outputs differ by exactly one**. The ordered outputs are increasing, `236 -> 237`.

Those outputs land exactly on the boundary of the page's sole later 2 / 7 pair:

`... [word52 ends at 236] | [word53 begins at 237] ...`

This makes a literal source reading possible:

`EPIPHANY seeks THE DEVOTED`

with the p0 red opening already providing the 8 / 5 `EPIPHANY / SEEKS` shape and the pointer identifying the later 2 / 7 `THE / DEVOTED target shape.

## The zero-based EMPTY closure

The two-rune target word itself gives a stronger typed loop:

`p0 word52 GP = 13`

Original table cell13 is printed **`04`** and has byte4. In the authenticated message, zero-based word4 is **EMPTY**. Then:

`GP0(EMPTY) = 92`

and `T[92] = 236`, exactly the final rune of p0 word52.

A broader source-preserving census admits every p0 word whose GP0 table byte is less than43, so that it can index any signed word. There are eight such p0 words. For each, the selected signed word is converted by the same GP0‘table-byte operation and tested against the source word's start and end offsets. **Only p0 word52 closes on one of its own boundaries.** This uniqueness does not depend on requiring the intermediate table token to look decimal.

The visible token `04` therefore supplies a human-readable rendering of a relationship that already survives the broader byte-based census.

## Seven-rune return to the 3301 / `00` address

The following p0 seven-rune ciphertext word has GP0 sum **101**. Original table cell101 has byte **229**.

The independent p27 instruction-parser route reconstructs terminal prime **3301** through its `NSOOCAEY -> 3QO` historical BASE29 circuit. The existing zero-based number-address hypothesis gives:

`3301 mod 256 = 229`

and original table cell229 is literal token **`00`**, byte0.

So the target p0 seven-rune word returns to the same address229:

`p0 word53 -> GP0 101 -> T[101]=229 -> token[229]=00`

This does not prove that `00`means p0. It makes the conditional p0 reading materially more coherent because the object selected inside p0 returns to the same table address that points at `00`.

## Independent operator replication on p27

The same GP0-address / base60-byte operation reproduces an independently selected p27 landmark without using the 2016 p0 phrase:

`GP0(FIND) = 42`

and original table cell42 has byte **28**. Original p27 rune offset28 is exactly the start of `DJU`, immediately followed by `BEI` at offset31. That `DJU / BEI` pair was independently selected by the finite historical `prime_echo` exhaustion at p55 and has its only other adjacent occurrence at p27:28.

Thus:

`FIND -> 42 -> T[42]=28 -> p27:28 DJU / BEI`

This is a second concrete receiver for the same word-number/table-byte grammar. It was established independently of the EMPTY / EPIPHANY p0 boundary observation.

The newly reported p57 bridge `DIUINITY -> GP0 105 -> p50 cell105 -> visible token 13` uses the same GP0 table-address grammar while reading the literal printed token at a different typed receiver. It supports the address convention without being counted as a byte-offset replication.

## What is recovered

The result supports the following source-driven route:

`2016 EMPTY / EPIPHANY -> p50 addresses92 / 121 -> bytes236 / 237 -> p0 THE / DEVOTED boundary`

and independently:

`p57 FIND -> p50 address42 -> byte28 -> p27 DJU / BEI handoff`

Together with the upstream p27-derived3301 route and the exact p0 opening word shape, this is enough to treat **EPIPHANY SEEKS** at p0:0 and **THE DEVOTED** at p0:235 as high-priority plaintext crib placements for subsequent cryptanalysis. The letter values remain candidate plaintext until a reversible encryption mechanism or another source-selected letter-level check confirms them.

## Reproduction

Run:

`node sims/lp2_2016_gp0_table_word_pointer_circuit_sft.cjs`

The single-file test reads the canonical LP2 corpus/transcription, original 256-cell table and authenticated 2016 OpenPGP cleartext. It asserts the 43-word source, p0 word geometry, uniqueness of the later 2 / 7 pair, uniqueness of the addacent consecutive-output source pair, the eight-candidate typed closure census, the `101 -> 229 -> 00` return, and `FIND -> 42 -> 28 -> p27:28 DJU / BEI`.

Related upstream reports:

- `im-results/lp2-p57-divinity-p50-center13-bridge.md`
- `im-results/lp2-p55-p27-redheading-we-must-shed-route.md`
- `im-results/lp2-primeecho-terminal-duplicate-mapline.md`
- `im-results/lp2-source1033-red3299-3301-table-pointer-lead.md`
