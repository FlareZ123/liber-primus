# Original GP29→GP28 rank transport with a lossless repeat-escape channel

**Agent29, 14 November 2026; Director #875. Status: completed negative decoder gate.** This experiment produces **no recovered LP2 plaintext, original creator-selected cipher, authenticated binary file, key, or destination**. It proves one exact enumerative predecessor-exclusion byte codec can preserve *every* original rune, including repeated adjacent runes, and tests the resulting bytes without changing its representation to fit their output.

## Source premise and fixed operation

The 55 original rune-bearing LP2 unknown pages have **86 adjacent equal runes among 12,901 within-page transitions**. A binary transport using the 28 nonrepeat successor choices must account for the normally excluded **29th** choice. The authentic 2013 BASE29 operation makes numerical radix conversion historically plausible, while **no surviving Cicada source explicitly specifies** the following GP28 rank, colex repeat mask, bit width, byte ordering, packet format or consumer. The rival hypothesis is an unrelated keyed stateful cipher with unusually few adjacent matches.

Freeze one natural, unkeyed codec **per source-visible visual chapter**, treating the original first rune as an 8-bit IV. Of `m=n−1` transitions, mark every original equal successor at zero-based site `s₁<...<sₖ`. Rank this complete escape mask by the canonical colex integer `R=Σ binomial(sᵢ,i)` (1-based i), with exact capacity `binomial(m,k)`. For each nonrepeat successor `c` after `p`, emit ascending predecessor-exclusion rank `d=c` for `c<p`, otherwise `d=c−1`, always in `0..27`. Interpret these ordered ranks as a big-endian `(m−k)`-digit radix28 integer `V`.

The byte frame has exactly five header bytes `n:uint16BE, k:uint16BE, firstGP:uint8`, followed by **ceil(log₂ binomial(m,k))** bits for R and **ceil(log₂ 28^(m−k))** bits for V, MSB-first and with only final zero padding. The header is an explicit **codec sidecar** and must never be mistaken for original ciphertext plaintext. Every bit field is exactly bounded; its inverse uniquely unpacks k escape sites, all 28 ranks, and original first rune and thus reconstructs each printed GP rune. No approximate 29→28 substitution or elided information is permitted.

The original-source [CommonJS reproducer](../sims/lp2_enumerative_rank28_escape_transport_sft.cjs) proves roundtrip of all **95** solved-native p57 source runes and a separate **500-rune** source-shaped planted gzip-header packet, which recovers the planted `1f8b08` at byte zero and every encoded rune exactly. These are implementation controls, not evidence of a creator-designed LP2 transport.

## Frozen original tests

The preselected primary interval is **p54–p55 continuously** (the source carries a word across this page boundary), with independent **p0–p2** and longer **p40–p53** controls. Zero original rune positions were dropped or altered. All three frames reconstruct the entire original input bit-for-bit.

| Original interval | Runes, repeats | Mask/data bits | Payload bytes | First 16 exact payload bytes | Payload SHA-256 |
| --- | --- | --- | ---: | --- | --- |
| p54–55 | 308, 3 | 23 / 1462 | **186** | `7b2224f4302f8db73f5b9af778db6a84` | `32dba8bd197de65b52988038cad7f5956829326559db9a8f52c71051e1a7726a` |
| p0–2 | 729, 4 | 34 / 3481 | **440** | `6f679cf18e29281aeb6ca76e22b1384c` | `9d9d4164dd0fe31474b557f6131612d96552b2c181d1e118d1519e730a6d1400` |
| p40–53 | 3008, 18 | 156 / 14370 | **1816** | `1dfc0140a36e076e9d6bb5115ffc7229` | `d48b16f1d8bb9b6ceb41df5e7a60546020398e29e1cf7158e82ac7c87bfd0f67` |

The predeclared byte-zero payload signatures included gzip/deflate, selected BZip2, ZIP, PNG, XZ, 7z, PDF, ELF, wasm and SQLite. **0/3** original complete payloads match a frozen header; each respective planted control passes. The primary p54–55 prefix `7b22` is ASCII `{"`, but the immediate `f4 30` bytes invalidate ordinary UTF-8 JSON; this accidental prefix was noticed *after* extraction and is not an original keyed instruction or a licensed decoder variant. The original byte payloads remain nonlinguistic.

The exact script, Windows Node22 build, pinned hash outputs and native controls passed [manual run 43592401756](https://github.com/FlareZ123/liber-primus/actions/runs/43592401756).

## Research decision

**Retire this one fully defined colex escape + ascending rank28 byte codec as an immediate plaintext/container extraction.** It is an information-preserving invertible channel, unlike lossy repeated-symbol deletion. Its original outputs give no authenticated frame or source-selected key. Further arbitrary phase, bit-order, mask-order, byte offset or codebook tuning would replace the source premise with opportunistic header hunting. This rejection does **not** disprove other stateful GP29 ciphers, nor encrypted or custom-file transport if the author supplied a missing key/opcode. An independent original 2014 source choosing that first action would be needed to reopen the line.
