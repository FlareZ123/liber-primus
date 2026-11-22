# LP2 p49–51 numeric object: complete 64-bit-round trace and AES-256 expanded-key checks

**Agent25 · 22 November 2026 · Director #2251. Bounded original-input negatives; no recovered LP2 plaintext, author-selected key, complete receiver or destination.**

## Original source and the intended human decision

The source-page images `66.jpg`, `67.jpg`, and `68.jpg` print a continuous **32-row × eight-token** table: ten rows on physical p49, thirteen on p50, nine on p51. P49 carries three runic lines before the table, and p51 four runic lines after it. The 256 printed two-character tokens constitute a 2048-bit object **only after** one adopts the documented base60 digit alphabet. Independent image adjudication and the original token register are at [`resources/liber-primus/base60-grid.json`](../resources/liber-primus/base60-grid.json) and [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json). The canonical base60 256-byte reading has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The source itself does not specify base60 rather than the historically proposed omitted-`f` radix59.

The exact dimensions suggest at least two *finite, historically available* self-contained cryptographic data structures: (1) a trace of **32 cycles on one 64-bit block** under TEA/XTEA, in which every printed row records the two 32-bit cipher halves; and (2) the **240-byte AES-256 expanded round-key schedule** together with an adjacent 16-byte IV. Both formats would permit strong original-byte tests without a guessed password or human language scorer. If either fitted, it could expose a 128-bit/256-bit key and suggest an explicit flanking-runic receiver. The rival hypothesis is that the 256 bytes are opaque ciphertext, random key material, or a stage operand with a missing external format instruction. **No first-party Cicada clue has been located selecting TEA, XTEA, AES expansion, an IV, or a receiver on p49/p51**: the geometries motivate the finite screens but do not authenticate these mechanisms.

## Test 1: 32 consecutive TEA/XTEA 64-bit round states

Treat each row of eight decoded bytes as two unsigned 32-bit words. The candidate set is strictly:

- Original source-derived base60 versus omitted-`f` base59;
- Both normal endiannesses for each four-byte word, optional order swap of the two 32-bit halves;
- Original row direction or its complete reversal;
- Whether the first printed row is the **input** before cycle 1 or the **state after cycle 1**.

This gives **32 complete trace interpretations**, not independent free keys. Both ciphers use the documented `0x9E3779B9` delta and the original 32-cycle count. The initial 64-bit data block remains unrestricted.

For **TEA**, the low bit of each updated 32-bit half is an *exact key-independent invariant*: because addition modulo 2 has no carry and the `<<4` term vanishes at bit0, the inferred bit0 of `k0 XOR k1` and of `k2 XOR k3` must be constant across all 31 adjacent printed-state transitions. Every original interpretation violates both conditions, with at least **22** contradictory bit assignments across its two necessary-bit classes (the minimum is computed by the SFT). Even an arbitrary secret 128-bit TEA key cannot satisfy the original states under these conventions.

For **XTEA**, each observed complete-cycle transition determines the exact 32-bit value of one indexed key word for the first half and one for the second half, because the mix expression `F(v)` and the round sum are known. All **62** source-row half-transitions are consumed. In every original interpretation, **only 4/62 inferred key observations agree** with the first observed value for each of the four indexed 32-bit words; **the remaining 58 observations contradict** those four values. A fixed 128-bit key is impossible under these conventions. This failure is stronger than an output-frequency diagnostic: no candidate key exists for the proposed full trace.

The read-only original-input SFT is [`sims/lp2_p50_tea_xtea_state_trace_original_sft.cjs`](../sims/lp2_p50_tea_xtea_state_trace_original_sft.cjs), [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45018453167). Independent positive controls generate complete authentic **32-state TEA and XTEA traces** under a synthetic fixed key; TEA's invariants pass, and XTEA recovers all **four 32-bit key words exactly**. A one-bit tamper of each planted trace fails as required. Reference: Needham/Wheeler's historical XTEA/TEA formulations and publicly available implementations (e.g. [FFmpeg XTEA code](https://ffmpeg.org/doxygen/3.4/xtea_8c_source.html)).

## Test 2: AES-256 240-byte key expansion plus 16-byte IV

AES-256 key expansion deterministically produces `w[0]…w[59]`, exactly **60 × four-byte words = 240 bytes**. The other 16 bytes could, *if specified by an author*, carry an IV in the same source object. Only two geometry-visible placements of an entire unbroken 240-byte schedule are used: **byte offset 0** (16-byte suffix) and **byte offset 16** (16-byte prefix). Check both original proposed radices, giving **four** cases. Word endianness cannot affect the bytewise relation.

For every AES-256 expanded key, FIPS 197 defines `w[i] = w[i−8] XOR w[i−1]` at exactly 39 word indices between 8 and 59 (those with `i mod 8` neither 0 nor 4). This rule is mandatory **for every secret key** and needs no S-box inversion or brute-force search. All four original interpretations fail **39/39** available key-independent word equations. The first failure is already word9, with nonzero four-byte XOR residues:

| Source digit scheme | Schedule offset 0 | Schedule offset 16 |
| --- | --- | --- |
| Base60 | `24 CF 3E 95` | `CD 32 88 3C` |
| Base59, omit `f` | `24 D6 3D 96` | `C8 3F 8E 23` |

Thus none is an intact standard 240-byte AES-256 expanded key with a contiguous 16-byte companion. The [`AES-256 schedule SFT`](../sims/lp2_p50_aes256_schedule_240plus16_original_sft.cjs) constructs a real expansion from NIST's official FIPS 197 Appendix A.3 seed, confirms expected `w[8]=9ba35411`, passes each legal 16-byte placement, and rejects a deliberately corrupted word9. Normative source: [NIST FIPS 197](https://csrc.nist.gov/pubs/fips/197/final). The check rules out only an *expanded key schedule*. A raw 256-bit AES secret, encrypted AES blocks, or a key requiring an outside KDF cannot be identified by this test.

## What follows for the actual LP2 solve

The *full 256 printed cells* have now been consumed by two independent structured models capable, if correct, of recovering a key and opening a 2014-plausible route to original plaintext. The original fails exact original-state/key-schedule constraints before any language heuristic. Neither test reinterprets cells as a postselected key when the result fails.

P49's three preceding and p51's four following lines are **runic ciphertext**, not an authenticated visible opcode identifying TEA, AES, a byte serialization, a nonce or a specific receiver. The original source and first-party Cicada evidence presently supply neither an author-selected self-describing file grammar for the 256 tokens nor a type/clock/key linkage between any decoded binary object and one intact GP29 flank. Earlier direct format exclusions include RC4 S-box, SHA-256 K-table, DEFLATE, OpenPGP packet, and source-aligned Reed–Solomon codewords (see [p50 RS gate](lp2-p50-rs255-original-codeword-gate.md) and Director #2183). Expanding the format hunt without a new clue would multiply uninterpretable decoders.

**Decision for Director #2251:** Retire p50-as-*standalone self-explaining format* on the currently documented first-party inputs. Leave the materially distinct [#2242 external locator/typed-address route](https://github.com/FlareZ123/liber-primus/issues/2242) open; an authenticated instruction, original external payload, or explicit p49/p51 recipient would justify reopening a **specific** format. Do not generalize these two exact exclusions to all key material, ciphertext or steganographic interpretations. No unknown LP2 text has been deciphered.
