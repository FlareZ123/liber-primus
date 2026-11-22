# LP2 p50 numeric table: 2014-second-seeded Mersenne Twister continuation gate

**Agent30, 14 November 2026. Original-input finite exclusion, with an exact positive. No recovered key, new plaintext or destination.**

## Causal path to a possible full-book key

The original LP2 pp49–51 print 256 two-character numbers in a 32×8 rectangle. Under the repository's pinned radix-60 reading, these are 256 bytes. If those bytes were consecutive outputs of a timestamp-seeded Mersenne Twister, a player could recover the original 32-bit clock seed and generate an unlimited continuation for use as a ciphertext key. Python's built-in `random.Random` is a historically available, deterministic MT19937 implementation. **The manuscript gives no instruction to choose MT19937, a timestamp, a byte extraction, or this particular encoding**, so this is an inexpensive bounded hypothesis, not an authenticated solution route.

The exact original 256-byte row-major binary array from [the source grid](../resources/liber-primus/lp2-grid-256.json) has SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Test only the original row-major and unrotated column-major readings, with the original eight starting bytes respectively `cb e7 a7 ba 61 ed 7e b7` and `cb 5c 79 6d 73 50 fd fe`. The original 2014 manuscript distribution falls within the independently predeclared UTC clock window **25 April 2014 00:00 through 9 May 2014 23:59:59**, a total of **1,296,000 possible integer-second seeds**.

For each seed, instantiate CPython 3.11 `random.Random(seed)`. Check the exact eight prefix bytes of each printed reading using each of three public fixed methods:

1. `getrandbits(8)` once per byte.
2. `randrange(256)` once per byte, including Python's rejection draws.
3. `int(random() * 256)` once per byte using the native 53-bit float.

A surviving eight-byte seed would be independently checked against **all 256 original bytes**. No seed survives eight bytes:

| Source reading | MT byte contract | Matches first 2 bytes | Matches first 8 or all 256 |
|---|---|---:|---:|
| Row-major | getrandbits(8) | 24 | **0** |
| Column-major | getrandbits(8) | 21 | **0** |
| Row-major | randrange(256) | 15 | **0** |
| Column-major | randrange(256) | 21 | **0** |
| Row-major | int(random()*256) | 21 | **0** |
| Column-major | int(random()*256) | 22 | **0** |

For each extraction contract, the exact same search recovers a **256-byte independently planted seed** at the first second of the stated clock interval, including its full 256-byte output. The original source hash, 32×8 row geometry and both eight-byte prefixes are asserted by the test. [Read-only standalone Python SFT](../sims/lp2_p50_2014_python_mt_epoch_sft.py); [passing Windows 3.11 manually dispatched run 43621317091](https://github.com/FlareZ123/liber-primus/actions/runs/43621317091).

**Decision:** The printed 256 grid bytes cannot be a consecutive native byte stream produced by any of these three Python MT extraction contracts from a *UTC integer-second seed within the checked April–May 2014 window*, in either checked physical table traversal. This closes that **particular route to a recoverable PRNG state and continuation**. It says nothing about other seeds, Python 2 implementation differences, skipped generator output, different state initialization, other traversal orders, encrypted outputs, or the grid's true purpose. No extension of this family is justified without an independent first-party clue to the generator.

**Relation to stronger prior work:** Existing [xorshift32 original hidden-state exclusions](grid-truncated-xorshift32-original-state-gate.md) and [all-secret 32-bit affine LCG exclusions](p50-legacy-lcg-highbyte-secretstate-gate.md) cover entirely different state machines. They do not imply this Python MT epoch-seed negative. The table's byte appearance alone is not evidence of a particular generator.
