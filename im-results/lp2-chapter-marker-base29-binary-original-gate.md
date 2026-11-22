# LP2 continuous BASE29 binary transport: original chapter and marker gate

**Agent18, 22 November 2026. Bounded original-input negative, not plaintext recovery.** [Exact CommonJS SFT](../sims/lp2_chapter_marker_base29_binary_transport_sft.cjs) · [Windows Node22 original-source PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45008484660) · [Director decision #2207](https://github.com/FlareZ123/liber-primus/issues/2207).

## The human route and the distinct tested model

The historically authenticated 2013 Cicada BASE29 example converts 3301 to \`3QO\`. This authenticates a standard positional integer representation. The original LP2 manuscript has nine visibly illustrated chapters and thirteen-dot section marks. An original GP29 rune stream interpreted as one continuous base29 integer per original region could serialize a **binary text or file**, explaining why printed word segmentation and ordinary GP English statistics are weak. It is a separate premise from the previously excluded complete-word numeral ciphers and does not presume the printed words are plaintext boundaries. A competing explanation is a cryptographic transformation with no BASE29 byte transport.

The test reads **all 12,956 original GP29 runes on physical p0–55**, including the p49→p51 table gap without losing any rune. There is exactly one complete global region; the nine illustration-delimited chapter regions have rune lengths **729/1145/1729/1903/1021/1433/1680/3008/308**. The original thirteen-dot marks create **26 nonempty** regions with their exact source offsets; repeated coincident marks are deduplicated, and physically absent rune p50 consumes zero digits. Only authentic printed chapter/mark boundaries, including the small 3-rune and 8-rune isolated spans, are admitted.

For each source-frozen region, interpret its GP29 digits as one nonnegative positional base29 integer. Convert to unsigned binary bytes by conventional minimal big-endian serialization or fixed binary capacity (ceil(L×log₂29/8) bytes retaining leading zero padding), with direct or reversed digit order and direct or reversed byte output. There are **36 regions × 8 modes = 288** original decodings. All 288 reencode bit-for-bit to the **same original source rune sequence and region length**; no chosen key, numeral rotation, secret offset, fitted prefix or arbitrary compression variant is allowed.

## Original outputs

| Region | GP29 runes | Big-endian minimal binary bytes | First 16 bytes, hex | ASCII-printable fraction |
| --- | ---: | ---: | --- | ---: |
| Entire unsolved manuscript | 12,956 | 7,868 | \`08734843a55193dcbb7231b564a2a088\` | 0.3842 |
| Chapter p0–p2 | 729 | 443 | \`1759b774a590ef75c921dd8fcc0a4733\` | 0.3883 |
| Chapter p3–p7 | 1,145 | 696 | \`03ae7c53329e6a19c89ec6f1859e8ae9\` | 0.3807 |
| Chapter p8–p14 | 1,729 | 1,050 | \`568b6382e9e32b9c4911482420a7795b\` | 0.3905 |
| Chapter p15–p22 | 1,903 | 1,155 | \`0dea61948244b36b8731aba95fed3c76\` | 0.3844 |
| Chapter p23–p26 | 1,021 | 620 | \`1032d4e90101414aecf22671166a02a6\` | 0.3645 |
| Chapter p27–p32 | 1,433 | 871 | \`01e1f098bfb6f84a365058a55cae35e0\` | 0.4030 |
| Chapter p33–p39 | 1,680 | 1,021 | \`0224e7f776075c8313e516337d6dbcba\` | 0.3839 |
| Chapter p40–p53 | 3,008 | 1,826 | \`52876495b72a948cd6be291075106755\` | 0.3844 |
| Chapter p54–p55 | 308 | 188 | \`010490bde021d22c8fb147f16c0a2536\` | 0.3830 |

Across all 288 outputs, **zero headers** for gzip/zip/PNG/PDF/ELF/OpenPGP armor/bzip2/xz/zlib/zstd/7zip/RAR/PE/Ogg were found at source-region starts where sufficiently many bytes exist. There were **zero ≥32-byte readable UTF-8 candidates** under the deliberately permissive criterion of ≥80% printable ASCII-range bytes plus strict UTF-8 decoding. The maximal printable fraction for any output ≥32 bytes was **0.5200** in the 81-rune section (50 bytes under reverse GP29 digit order); a second 690-rune section reached 0.4296. Shannon byte entropies approach random-byte values for longer source regions; this is descriptive and does not establish cryptographic security or prove randomness.

Controls: the signed 2013 3301→3QO BASE29 digit example passes; an independently planted UTF-8 string \`PARABLE: THE PRIMES ARE SACRED\` survives the exact same long-integer transport; the authentic solved p56/p57 source sequences and all unknown source regions replay exactly. Windows Node.js22 PASS run **45008484660** shows the entire 288-case output, source counts, and controls, without a custom CI workflow.

## Decision and remaining options

The **direct, unkeyed**, source-delimited, ordinary unsigned-integer BASE29 → standardized file/plaintext byte interpretation produces neither readable unknown text nor a typed payload. There is no source-selected standard payload decoder to apply next. Retire this finite original-input model rather than expanding into unconstrained invented framing, arbitrary packing or compression searches.

This does **not** rule out an authenticated external key, encryption of a binary payload, another base29 serialization (including a fixed-width per-k-rune codec), or a rune-level transformation before BASE29 transport. Those require independent first-party evidence for their codec/key and a long untouched original-source confirmation. No unknown LP2 plaintext, author key or final destination was recovered. The larger repository frontier is unchanged.
