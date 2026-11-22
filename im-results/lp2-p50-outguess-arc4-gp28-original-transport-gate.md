# Source-led OutGuess ARC4 + LP2 GP28 transport: one frozen full-book inverse

**Agent 2, 14 November 2026. Experimental bounded negative.** Original-input test: [single-file SFT](../sims/lp2_p50_arc4_delta28_compressed_original_sft.cjs), verified **PASS** in [Windows Node22 manual Actions 43647916622](https://github.com/FlareZ123/liber-primus/actions/runs/43647916622). **No unknown LP2 plaintext, historical key, or intended continuation was recovered.**

## Why this exact route was worth one test

The [source of OutGuess 0.2](https://sources.debian.org/src/outguess/1%3A0.2-8/arc.c), a documented Cicada 2012–2014 tool, explicitly says it uses an **ARC4 stream generator for encryption and pseudorandom numbers**. Original LP2 visibly prints a **32×8 numerical table** spanning physical p49–51, whose source-canonical base60 reading is **256 bytes**. Original encrypted text on physical p0–55 contains **12,956 GP29 runes with only 86 immediately identical predecessors** (book-continuous). This combination supplies a source-era cipher primitive, a visible 256-byte candidate key, and a candidate radix28 transport (28 possible nonrepeat successors).

There is **no authored instruction** selecting this composition, no original statement that numeric cells are an ARC4 key, and no authenticated serialization convention. Existing direct byte-mod29 ARC4-to-GP29 tests and keyless base28-to-compressed-byte tests address *different* operations: [direct p50 ARC4 rune shift](lp2-p50-rc4-key-original-gate.md) and [no-key base28 inflation](lp2-delta28-direct-compressed-transport-original-gate.md). Combining both adds an unproven layer. This one-pass check is a search for a recognizable original file member rather than an asserted key discovery.

## Predeclared inverse

1. Use all original unknown physical pages **p0–55**, omitting the rune-empty p50, with a globally continuous source-ordered rune clock. The first rune is an IV. Compute each next modular predecessor step **d = (current − previous) mod 29**. For the **86 exact zero steps**, preserve original skip sites; for other steps append **d−1** as one base28 digit.
2. Interpret all **12,869 nonzero digits** as one MSD-first base28 integer. Serialize as minimal unsigned big-endian bytes, giving **7,734 bytes**. Recorded skip sites are needed to reverse this conditional transport.
3. Interpret the entire **256-byte row-major original p49–51 table** as a literal ARC4 KSA key. No KDF, salt, orientation search, initial drop, page restart, key rotation, XOR mask or fitted phase. XOR **7,734 standard ARC4 stream bytes** against the original serialized bytes.
4. Check for a **source-start complete GZIP, BZIP2 or zlib frame**, or a substantially printable plaintext register. No internal-offset search, reverse-key option, fitted pad, or second cipher menu after failure.

Frozen source inputs: [canonical LP2 rune arrays](../resources/liber-primus/lp2-corpus.json) and [source numerical grid](../resources/liber-primus/base60-grid.json).

## Original outcome and positive control

The canonical base28 source byte stream begins:

02bf8b71cd485188fb34d4ce15c54dacf1fafe333a910212

The complete 7,734-byte stream has SHA-256:

c4744d04b4679960b73e5892729d8bb6cbb3a4b491fa4d0fe0dd1876c3df52ef

XORing with standard ARC4 keyed directly by the full original 256-byte table produces:

27f88b233d97dcf507390cf87d94f5f42cbb2b5041a178f2

There is **no GZIP, BZIP2 or zlib source header**, and **2,911/7,734 = 37.639%** of output bytes are printable ASCII. There is no plaintext, recognizable compressed member or authored key.

The implementation verifies original full-source rune roundtrip; exact original 86 zero-step positions; byte-to-radix28 inversion; classical ARC4 Key vector EB9F7781B734CA72A7; and a **source-shaped planted control**: a genuine 7,683-byte GZIP member passes through the same XOR, base28 big integer, all **12,956** GP29 slots, and the **same 86 original zero-step sites**. Reverse reconstruction restores the exact GZIP bytes and decompresses the planted payload. This demonstrates reversibility *when skip metadata are known*, not historical validity.

**Decision:** Retire this one literal row-major p50 key, source-order nonrepeat rank, continuous base28 integer, standard ARC4, source-start file composition. Do not proliferate ARC4 KDFs, page starts, clock variants, passwords or compression offsets without an independently authenticated operation. The decisive missing information remains a creator-visible clue specifying **cipher/key and state schedule**, potentially from historical infrastructure that no longer survives.
