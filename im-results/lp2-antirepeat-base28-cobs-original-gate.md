# Original LP2 anti-repeat base28/COBS byte transport, frozen packet decision

**14 November 2026, Agent35; Director #829. Experimental negative, not a Liber Primus decipherment.** The proposed lossless binary transport is explicitly tested on unmodified original LP2. No unknown plaintext, key, payload, or continuation destination was recovered.

## Motivating clue and precise historical limitation

All 56 unknown physical LP2 pages contain **12,956 GP29 rune symbols**, including only **86 adjacent same-rune transitions** in the nine image-defined visual chapters. A predecessor-excluding output alphabet gives 28 possible nonrepeat symbols; a repeated symbol can provide the normally reserved delimiter. Binary byte-stuffing has been available since 1997: Stuart Cheshire and Mary Baker, [*Consistent Overhead Byte Stuffing*, SIGCOMM 1997](https://sigcommconfs.hosting2.acm.org/sigcomm/1997/papers/p062.pdf). This supplies a **period-available independent transport definition**, not an authenticated Cicada command to apply it. The manuscript lacks a selector for base28 packet integers, COBS, or a container type.

Related earlier work [`sims/lp2_gp29_differential_cobs_sft.cjs`](../sims/lp2_gp29_differential_cobs_sft.cjs) applies **native 29-way COBS to modular rune differences** and finds seven valid fragments among 141 page-scoped frames. The present model is materially different: it converts nonrepeat 28-rank digits to **canonical byte integers**, then checks *standard byte* COBS with exact image-chapter framing. It neither repeats the direct ranked-GZIP header sweeps nor creates free unknown keys.

## Frozen inverse, with all exceptional original runes consumed

1. Reset at each of the nine image-defined visual chapters. Its first rune initializes `prev` and carries no byte data.
2. For each next ciphertext rune `c` and previous rune `p`: if `c=p`, end the current packet and begin the next; otherwise emit the rank `d=c` when `c<p`, or `d=c-1` when `c>p`. Thus `d` is in `0..27`; the previous rune always advances to `c`, including delimiter repeats.
3. Interpret each packet of ranks as a big-endian base28 integer, serialize as minimal-length big-endian bytes, then run the unmodified **COBS byte** decoder. COBS syntax requires every code byte nonzero and every code-run to fit within its remaining packet.
4. The inverse first COBS-encodes a byte packet, converts its positive-valued byte integer to canonical base28 digits, maps each digit to one of the 28 glyphs unequal to the predecessor, and inserts a repeated predecessor between packets. The original rune seed is preserved. Empty source packets are representable; arbitrary leading-zero digit strings are outside this canonical code. No unknown sidecar, secret phase, fitted alphabet, padding, or source-dependent exception is admitted.

The source-native functional control takes the complete **95 solved physical p57 GP runes**, transliterates them using the corpus's original 29 entries, compresses two complete source-text spans with GZIP, plants both byte streams through this same COBS/base28/rune encoder, then checks exact inverse bytes, GZIP decompression, recovered source text, and exact rune reencryption. It is an **explicitly planted** control; no historical Cicada COBS-positive bytes have been found. A malformed COBS byte example must fail.

**Real period-compressed source positive (performed after the negative was frozen):** the archived Cicada 2014 Stage05 `avowyfgl5lkzfj3n.onion/post/index.html` source blob, Git SHA-1 `f8b6e108b8dab4fa095356f73a4f53e41918cb55`, preserves a hexadecimal **2,532,309-byte original GZIP stream**. Uncompressing it yields the known original four-image source of **3,010,703 bytes**, SHA-256 `8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a`. The independent [source-native control](../sims/lp2_antirepeat_cobs_stage05_sourcepositive_sft.cjs) retrieves and Git-blob-hash-checks that historical exact archive, partitions the untouched compressed bytes into **13,190 newly planted packets of at most 192 bytes**, emits **4,255,156 runes** under the same GP29/COBS transport, decodes all packets, verifies byte-exact reconstruction and complete GZIP decompression against the archived output digest. It is a genuine period-compressed source **transport control**, though the GP29/COBS wrapping is artificial and was never claimed as an original 2014 Cicada encoding. It therefore tests implementation power without providing a manuscript-selected operation. The [14 November 2026 manual CI run 43570324445](https://github.com/FlareZ123/liber-primus/actions/runs/43570324445) passed both the historical binary-source positive and the untouched original-LP2 negative, independently.

## Untouched original chapters

In each row, `packets = repeats + 1`; `distinct byte pairs` counts unique consecutive 28-rank pairs **within each repeated-rune-delimited packet**, reset at the boundary. The first six bytes are the candidate byte-integer serialization of the first packet, before COBS.

| Original visual chapter | Runes | Repeat delimiters | Packets | Valid byte-COBS packets | Distinct rank pairs | Odd-rank packets | First six candidate bytes |
|---|---:|---:|---:|---:|---:|---:|---|
| p0–2 | 729 | 4 | 5 | **0** | 296 | 2 | `0fe05a1a4b0f` |
| p3–7 | 1,145 | 6 | 7 | **0** | 403 | 0 | `019c04d4c5e7` |
| p8–14 | 1,729 | 9 | 10 | **0** | 525 | 5 | `11e96cf86099` |
| p15–22 | 1,903 | 10 | 11 | **0** | 559 | 2 | `078448f86d51` |
| p23–26 | 1,021 | 11 | 12 | **0** | 379 | 5 | `04d09781155f` |
| p27–32 | 1,433 | 13 | 14 | **0** | 479 | 9 | `04e7fc2a90dc` |
| p33–39 | 1,680 | 12 | 13 | **0** | 504 | 11 | `1acaa36549ea` |
| p40–53 | 3,008 | 18 | 19 | **0** | 682 | 9 | `233f8835d498` |
| p54–55 | 308 | 3 | 4 | **0** | 137 | 2 | `07238d68c33a` |
| **Total** | **12,956** | **86** | **95** | **0** | | | |

The independent **stationary two-rank-symbol-per-byte** variant also fails without guessing a 256-entry secret codebook. If every fixed two-rank pair encodes exactly one of the 256 possible byte values and every repeated rune is a packet separator, at most 256 distinct within-packet rank pairs may occur under *any* secret mapping. **Eight of nine whole visual chapters exhibit 296–682 distinct pairs**, exceeding 256, and several packet rank lengths are odd. This necessary-condition failure excludes that narrow two-rank/byte architecture regardless of secret byte assignments. It does not exclude variable-width codes, changed codebooks, encryption, different markers, or nonbinary plaintext.

## Decision and reproduction

Run [`sims/lp2_antirepeat_cobs_packet_sft.cjs`](../sims/lp2_antirepeat_cobs_packet_sft.cjs) with Node.js 22 from the repository root. The actual-corpus [manual GitHub Actions run 43569487873](https://github.com/FlareZ123/liber-primus/actions/runs/43569487873) completed successfully on 14 November 2026, with the intended COBS job step passing; the log records zero valid packets, eight chapters exceeding two-rank-byte capacity, and exact planted recovery. The succeeding [CI 43570324445](https://github.com/FlareZ123/liber-primus/actions/runs/43570324445) additionally reproduces the complete original 2014 Stage05 GZIP byte-positive above. It reads `resources/liber-primus/lp2-corpus.json`, uses original indices without corrected/derived plaintext, executes the source-native compressed two-packet plant and malformed input control, then asserts all 12,956 original runes, 86 delimiters, 95 packets and zero valid COBS byte frames. It also reproduces the exact in-packet pair counts and source-token hex diagnostics above.

**Fork:** the frozen historically possible COBS-over-base28 transport yields **zero valid typed payload packets**. It therefore provides no original-text inference and should be retired, along with the separately excluded fixed two-rank-per-byte family. A new route needs a manuscript or authenticated historical source cue selecting a genuinely different byte framing/variable-length code or key, rather than post hoc tuning of these failed frames. This negative is scoped; it is not proof that LP2 is not encoded binary.
