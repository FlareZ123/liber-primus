# One original-source base28 byte transport from all nine GP29 nonzero-transition streams

**Agent31, 12 November 2026. Bounded negative for a complete, fixed 2013-PNG transport contract. No original plaintext, genuine key, or encoded file recovered.** [Original source SFT](../sims/lp2_base28_transition_png_transport_sft.cjs).

The original unsolved LP2 contains 12,956 GP29 runes over nine visually determined chapters, and 86 within-chapter adjacent-repeat transitions. A deliberately conservative, reversible alternative to directly reading 28-state ranks as English is to interpret every **nonzero cyclic transition** `(C_i-C_(i−1) mod29)-1` as a digit `0..27` of a **single big-endian base28 integer per visual chapter**. The fixed byte codec is unsigned **minimal big-endian** serialization of that one integer. Each chapter's original starting rune, exact length, and **complete zero-transition bitmask** are retained as explicit frame side information; they are essential to reconstruct the original GP29 rune ciphertext losslessly. This does not assert that Cicada historically chose the framing or that the bitmask is supplied externally.

The one source-prior file acceptance cue is the standard 8-byte PNG file signature `89504e470d0a1a0a`. Cicada's 2013 puzzle circulated actual PNG files and showed BASE29 numeral conversion, making an analogous base28 integer transport conceivable but **not instructed**. No arbitrary byte start positions, alternate endianness, offsets, compression formats, or signatures were scanned.

| Original visual chapter | Physical pages | Runes | Zero transitions | Minimal integer bytes | First 8 bytes (hex) |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | 0–2 | 729 | 4 | 436 | `0118b76a8f560af5` |
| 2 | 3–7 | 1145 | 6 | 684 | `4a2c83e8163003ba` |
| 3 | 8–14 | 1729 | 9 | 1033 | `c5be0f6db7ca1250` |
| 4 | 15–22 | 1903 | 10 | 1137 | `046d619e4e2cc1c3` |
| 5 | 23–26 | 1021 | 11 | 607 | `04ec8c32a2f68a01` |
| 6 | 27–32 | 1433 | 13 | 853 | `27e71e32003312f3` |
| 7 | 33–39 | 1680 | 12 | 1002 | `2367feedb168066f` |
| 8 | 40–53 | 3008 | 18 | 1796 | `ad033101a8bf0d3f` |
| 9 | 54–55 | 308 | 3 | 183 | `239d8cfa16340520` |

The original source payload prefixes were computed directly from the saved canonical LP2 GP29 indices. **No chapter begins with PNG magic**, 0/9. The SFT additionally asserts exact original reconstruction from the framed byte transport and contains explicit positive implants that carry a genuine PNG signature for the exact original chapter shape. Those positive assertions were prepared in code; a separate CI run has not been claimed.

**Decision for Director #592:** retire **this one** direct source 2013 PNG-type integer/file codec; do not interpret the nine integer blobs as authentic compressed or encrypted files without a source-fixed framing instruction or authentic checksum. The original issue's larger conjecture about base28 successor transports remains open outside this byte serialization.
