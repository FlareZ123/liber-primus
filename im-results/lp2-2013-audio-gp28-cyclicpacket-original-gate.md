# LP2 predecessor-cyclic base28 packets with authentic 2013 audio XOR

**22 November 2026, Agent30. Status:** A source-constrained *two-step candidate* fails both an exact canonical-packet condition and a direct English/file-recovery gate. **No unknown LP2 plaintext, secret key, mechanism or destination recovered.** This is an intermediate test, not an established historical cipher.

## Why a 2014 solver might try it

Authentic 2013 Cicada material used raw `761.MP3` at **file offset zero as a bytewise XOR pad** to recover the Gematria Primus JPEG from the Twitter byte stream. Its original ID3 metadata also contains the exact PARABLE reused in clear on LP2 physical p57. Separately, original LP2 ciphertext conspicuously avoids adjacent equal runes: just **86 / 12,901** eligible within-page pairs, suggesting 28 *nonrepeat* successor positions plus an escape or framing value. P57's reference to shedding circumferences supplies a weak verbal analogy for taking cyclic rune differences, but **no signed Cicada instruction actually selects this GP28 packet codec**. The documented 2013 XOR and source reuse motivate a bounded composition; they do not authenticate it.

The experiment deliberately does not search offsets, keys, extra opcodes, language cribs, alternate glyph orders, compressed payload types, or packet orientations. Earlier reports separately tested base28/COBS transports and direct MP3-derived keying. The finite **composition below**, with the exact historical raw XOR start fixed, is the scope of this record.

## Frozen invertible interpretation

Read the 55 rune-bearing unsolved physical pages p0–55 from [canonical original GP29 indices](../resources/liber-primus/lp2-corpus.json), in physical order. At the beginning of *each physical page*, take its first visible rune only as the predecessor seed. For every following rune compute `delta=(C_i-C_(i-1)) mod 29`:

- `delta=0`: split to the next packet, consuming the repeated rune as a separator;
- `delta=1..28`: append a base-28 digit `delta-1` to the current packet.

Convert each packet's big-endian base28 integer to its shortest unsigned big-endian byte representation (an empty packet emits zero bytes); concatenate all packet bytes in source order. XOR that complete byte stream with the *unaltered* original 2013 `761.MP3` file starting at **byte zero**.

All source rune positions round-trip exactly when the original packet digit lengths and page seed rune are retained as transport-side metadata. These lengths exist visibly in the source. Crucially, this is weaker than showing that a hypothetical encoder would produce *canonical minimal* base28 digit strings, addressed below. The source MP3 is identified by SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460` and its Git commit [rtkd/iddqd@f2267b0](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3).

## Exact original result

| Source/result | Value |
| --- | ---: |
| Original rune-bearing pages | 55 |
| Original GP runes | **12,956** |
| Visible adjacent equalities, now assumed packet joins | **86** |
| Packets after per-page segmentation | **141** |
| Page-initial runes reserved as seeds | **55** |
| Serialized bytes before XOR | **7,746** |
| Raw transport byte SHA-256 | `372d141437a384c16a894bd06c60f0c05eaefbc14602298f427d2b71d2d31540` |
| XOR-result byte SHA-256 | `04b1b53ead5626242e2d610b06e92e04885286e82ecdf4631e1bbbc2ad8dc948` |
| XOR-result printable fraction | **0.384198** |
| XOR-result empirical entropy | **7.976504 bits/byte** |
| Longest printable run in full XOR output | **9 bytes** |
| Recognized start-of-file signature | **none** |

Actual XOR result first 32 bytes: `6e13093464277f753139099dfc38f1a57434dd7376aea1d73edc2b890d44c993`. These diagnostics show no direct readable English or recognizable JPEG/PNG/ZIP/gzip/PDF file. They **do not prove that the bytes could not be some opaque binary ciphertext** or that a different encoding would fail. The raw byte transport itself is similarly high-entropy (7.975491 bits/byte), with printable fraction 0.373870.

The single-run **positive control** takes actual clear p57 GP runes, serializes their 100 ASCII transliteration bytes, XORs them with the original MP3, encodes the resulting byte integer into a 167-rune artificial GP28-cyclic stream, then reverses every step. It recovers all **100/100 original ASCII bytes exactly**. It is a synthetically encrypted *source-native control*, rather than evidence that any unsolved page uses this cipher.

### Exact canonical-encoder obstruction

**Five** original packets begin with base28 digit zero followed by further payload digits (not simply a single zero). A minimal positive integer's canonical positional base28 rendering cannot begin with digit zero. Their first zero-rank destinations (zero-based within actual physical page) are:

| Physical page | Original rune destination | Immediately preceding source event |
| ---: | ---: | --- |
| 9 | 217 | After same-rune delimiter G |
| 15 | 1 | After page-initial F seed |
| 24 | 53 | After same-rune delimiter G |
| 25 | 1 | After page-initial H seed |
| 30 | 1 | After page-initial D seed |

Thus the strict variant in which every source packet is the *shortest possible base28 representation of its source byte integer* is **already impossible on untouched runes**, even before applying any candidate MP3 key. Permitting externally specified fixed widths or noncanonical leading-zero padding escapes that exact obstruction, but the manuscript supplies no packet-width readout beyond the packet text itself. The implementation retains those widths to compare the more generous byte decoder fairly.

## Decision and reproduction

The full observed original manuscript, plus a genuine p57-based planted positive, was executed successfully under Windows Node.js 22: [CI 45080906924](https://github.com/FlareZ123/liber-primus/actions/runs/45080906924). Program: [`sims/lp2_761_base28_packet_xor_sft.cjs`](../sims/lp2_761_base28_packet_xor_sft.cjs). Pinned original audio is fetched by [workflow](../.github/workflows/agent30-gp28-audio-xor-sft.yml) and checked byte-for-byte before testing.

**Retire this precise raw-byte XOR consumer and its strict minimal-base28-packet encoder.** Continue seeking source-selected alternate operations or genuine plaintext; do not convert opaque random-like output into a speculative success by fitting a second key, arbitrary padding, or an undocumented offset. No update to the established recovered-plaintext synthesis is justified.
