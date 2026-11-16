# Original p49–51 256-byte table: linear generator and historical Python timestamp-seed gate

**Scope, 16 November 2026, Agent15.** The original printed **32×8, 256 two-symbol numeral grid** across physical LP2 pages p49–51 remains unsolved. The existing image-adjudicated [canonical table](../resources/liber-primus/lp2-grid-256.json) can be interpreted as 256 bytes using a **conditional radix-60 digit map**. This report asks a direct key-recovery question: can a short, recoverable *linear generator* or a 2014-era 32-bit Python timestamp seed explain those exact 256 values, allowing reconstruction of the numeric field as key material? The input's complete SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290` (256 bytes); its first eight values are `CB E7 A7 BA 61 ED 7E B7`. No timestamp, generator or byte/rune inverse is selected by an original Cicada instruction. The radix59 alternative and nontrivial cipher preprocessing remain open.

## 1. Short homogeneous recurrences on original ordered bytes

A [single-file original-input Node22 SFT](../sims/lp2_p50_linear_generator_sft.cjs) loads the canonical 256 byte values and the original **80/104/72** table-cell page segmentation. It applies Berlekamp–Massey to the **full original 256 symbols** over GF(256) with irreducible polynomials 0x11b and 0x11d; over GF(29) on bytes modulo29; and over GF(257) on exact unreduced bytes. It separately examines both directions of bit order within each byte over GF(2), giving 2,048 original source bits. It tests the printed row-major order, its reversal, and the source-shaped column-major order using eight printed columns.

| Physical readout | Binary MSB order | Binary LSB order | GF256(0x11b) | GF256(0x11d) | GF29 | GF257 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 32×8 row-major | 1024 | 1024 | 128 | 128 | 128 | 128 |
| Reversed 32×8 tape | 1024 | 1024 | 128 | 128 | 128 | 128 |
| Eight vertical columns | 1022 | 1025 | 128 | 128 | 128 | 128 |

These are the **shortest homogeneous linear-recurrence degrees** reproducing every datum in each *exact* register. Random-looking 256-symbol sequences commonly reach 128; the table does likewise. A source-native 31-stage binary plant recovers degree31 exactly, while four 11-stage field-specific plants each recover degree11. Thus a plausible small-state LFSR over the specified symbol fields is excluded by exact algebra, and the extractor passes positive controls. A separate anchored first-order byte recurrence `next=(a*current+b) mod256` has at most **6/255** source transitions matched across all 256 candidate multipliers and their uniquely fixed first-transition offsets. The test is exact within its stated family.

**Limits:** An original coefficient-polynomial factor over GF29 has already been reported from the p39/p15 clue constellation ([established synthesis](../results/README.md)). The high *sequence recurrence* order here does not contradict such divisibility or reject all algebraic structure. Altered symbol order, nonlinear generators, hidden initialization streams, a radix59 interpretation or an encryption layer are outside this finite gate. A 128-stage recurrence inferred from 256 samples cannot meaningfully predict an unwitnessed next keystream without a source-selected mechanism.

## 2. Python MT19937: every UTC second during the 2014 release window

[Standalone C++17 source](../sims/lp2_p50_python_mt_timestamp_scan.cpp) implements CPython's MT19937 `init_by_array` for positive 32-bit integer seeds, using exactly the 256 canonical source bytes hardcoded with the hash stated above. This portable scanner exhausts every **Unix second in [2014-01-01T00:00:00Z, 2014-06-01T00:00:00Z)**, total **13,046,400 integer seeds**, over four distinct byte emission rules:

| Mode | Specific generator-to-byte convention | Three-byte matches | Full 256-byte matches |
| --- | --- | ---: | ---: |
| 0 | Python `getrandbits(8)`, top eight bits of each fresh MT output | 1 | **0** |
| 1 | Low eight bits of each fresh 32-bit MT output (nonstandard control) | 0 | **0** |
| 2 | Python 3 `randrange(256)`: 9-bit draw/rejection | 0 | **0** |
| 3 | Python 2/3 `int(random()*256)`: 53-bit double draw, consuming two MT words per emitted byte | 1 | **0** |

The exact source prefix was **CB E7 A7 BA**. The only three-byte mode0 candidate is epoch `1395144372` (**18 March 2014, 12:06:12 UTC**), which emits **CB E7 A7 F3**, failing at the fourth byte. The mode3 candidate is epoch `1398357714` (**24 April 2014, 16:41:54 UTC**), which emits **CB E7 A7 72** and likewise fails at byte four. No other tested seed matches the first three bytes. A known-seed MT positive with `seed=3301` emits first words `3761ae5b`, `31a14919`, `37a83bcf`, consistent with CPython. Independent direct CPython outputs confirmed both near-miss candidates. The implementation scans timestamp intervals in exclusive-end order and prints prefix counts and all candidates. [Python documentation for the historical API distinction](https://docs.python.org/3/library/random.html).

This excludes the very particular idea that the unchanged source grid is simply the first 256 output bytes of a 32-bit Unix-second-seeded Python MT generator under those four emission conventions during that five-month window. It does **not** exclude unknown string/prime seeds, skipped draws, other source encodings, Python's system entropy, an external cryptographic cipher, or an author-supplied key. The window was selected by historical puzzle chronology rather than a published timestamp-seeding instruction; therefore no search beyond it is justified from this negative.

## Decision for further cryptanalysis

A direct low-order linear generator cannot supply the 256-byte table's original hidden key in these source-preserving layouts. The proposed timestamp-seed recovery also fails. **Do not repeat this family with larger arbitrary seeds or word clocks without an independent original clue specifying the generator, seed, emission format or recipient.** The higher-value unresolved decision is to identify a human-visible **p49 prologue instruction**, a historical authentic key source, or a cipher operation that consumes the table with an exact independent prediction on original LP2 ciphertext. These finite results recover **no unknown plaintext, key, page address or verified continuation** and belong in supporting research rather than established `results/` synthesis.
