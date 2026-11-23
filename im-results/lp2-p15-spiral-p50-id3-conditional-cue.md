# Conditional LP2 p15 spiral → p50 table → historical ID3 metadata cue

**23 November 2026, Agent31. Status: source-exact cross-artifact hypothesis, not an authenticated decryption, key, file, or selected indexing rule.** The original p15 Fibonacci-prime spiral and its red 3299 seed, the independently original 256-cell p49–51 number panel, and the archived 2013 761.MP3 ID3 tag jointly give a specific three-byte label. The first step linking p15 to the 256-cell panel is still an *unsourced modulo-256 choice*. No unknown LP2 plaintext or cipher has been recovered.

## Independently pinned inputs

- LP2 physical **p15**, source image [32.jpg](../resources/liber-primus/32.jpg), has a uniquely red **3299** in a 4×4 numerical grid. The source-exact numerical formula and spiral order are already established in [the original grid decipherment](../results/lp2-p15-fibonacci-prime-spiral.md): its outward path is **3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516**. Each entry equals `abs(3301 - prime(distinctFib(n)+1))`; the red cell establishes the spiral start and the original geometry establishes the path.
- The original **32×8 = 256** printed numeral panel spans p49–p51. Both conventional base60 and the still-possible f-omitted base59 codebook can decode all tokens; see [the first-party digit-source ambiguity](lp2-p50-radix-codebook-overlap-source-gate.md). The independently reread original table is [lp2-grid-256.json](../resources/liber-primus/lp2-grid-256.json).
- The authentic previously available 2013 [761.MP3](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3) has an ID3v2.3.0 header and a `TXXX` frame containing the already solved **p57 PARABLE** text and `Parable 1,595,277,641`. Its title's GP-prime sum is 761; see [the pinned original-byte ID3 inventory](audio761-original-id3-frame-inventory.md). That 2013 file and its readable metadata are actual historical objects, though their reuse in LP2 remains conjectural.

## Exact proposed human operation and outcome

**Conditional operation:** take the source-visible p15 outward spiral in order; for each **printed decimal cell value N**, compute its zero-based **N mod 256** address in the printed p50 panel, and read the selected two-character token. This is an executable, elementary operation a contemporary solver could perform. Nothing in the original grid *explicitly says* to apply it.

| Spiral n | Original p15 N | N mod 256 | Original p50 token | Base60 byte | Base59 byte |
| ---: | ---: | ---: | :--- | ---: | ---: |
| 0, red seed | 3299 | 227 | `49` | 249 | 245 |
| 1 | 3298 | 226 | `1D` | **73 = I** | 72 = H |
| 2 | 3296 | 224 | `18` | **68 = D** | 67 = C |
| 3 | 3294 | 222 | `0p` | **51 = 3** | 50 = 2 |
| 4 | 3288 | 216 | `2M` | **142** | 140 |

Thus **the three immediately post-red-seed bytes** read **`ID3`** under conventional base60, and **`HC2`** under f-omitted base59. The complete **16 original base60 bytes** are:

```text
f9 49 44 33 8e 7f 13 99 8e 33 3b f0 96 b0 a7 69
```

The [read-only Node22 SFT](../sims/lp2_p15_p50_id3_spiral_source_sft.cjs) rebuilds the p15 spiral from the prime/Fibonacci rule, verifies the 256 original table token/byte readings, obtains both codebook results, and tests one finite 16-byte-key binary recipient.

**Important negative:** `ID3` is at output offsets1–3, preceded by `f9`, and followed by **`8e`**. As an ID3v2 tag, byte immediately following `ID3` must be a valid tag major version (historically 2, 3 or 4). `8e` is none of them. The original 16-byte result is therefore **not an actual ID3 header or complete extracted file**. Only the label is present, with a hypothetical routing meaning. Calling this a recovered steganographic MP3 or a decryption would be wrong.

## Complete 16-byte key as a direct AES-128 receiver: bounded negative

The extracted spiral emits **exactly 16 bytes** and the p50 panel is **exactly 256 bytes**, making an AES-128 block-cipher transfer a cheap, complete, source-sized candidate. The author has not prescribed AES, a key/IV role or a plaintext framing, so this is a *testable exploratory consumer*. Freeze the above spiral as the AES-128 key `f94944338e7f13998e333bf096b0a769`, preserve the entire original 256-byte base60 panel in printed row-major order as ciphertext, and try only original-start **ECB** and **CBC with zero IV**. Both are full-byte, reversible and verified by exact reencryption; no IV search, password stretching, key phase, skipped values or invented serialization enters this check.

| Receiver | ASCII printable or tab/CR/LF out of256 | Longest contiguous plain ASCII run | Valid terminal PKCS#7 padding |
| --- | ---: | ---: | :---: |
| AES-128-ECB | 101 | 6 | No |
| AES-128-CBC, zero IV | 109 | 5 | No |

The ECB plaintext starts `1e9ffcd0d82340f29c980d9e7500432f`; CBC with zero IV shares that first block. Both continue as random-like bytes and yield no coherent English or recognizable complete file envelope. The same original-source SFT carries these exact tests. An independently executed AES implementation (`cryptography` Python) yielded these numbers before the Node implementation was committed. This **retires these two direct original-table AES-128 consumers only**, including the obvious 16-byte key hypothesis; it does not reject other modes/recipients whose selection would require a first-party instruction.

## Collision calibration and uncharged choices

In the actual base60 panel, byte `I` (=73) occurs4 times, `D` (=68) twice, and `3` (=51) twice. Conditional on three **fixed distinct** panel addresses and an exchangeable 256-cell byte multiset, the exact chance of ordered `ID3` is

```text
4 × 2 × 2 / (256 × 255 × 254) = 1 / 1,036,320.
```

At 14 possible ordered triple starts along this 16-cell source spiral, the corresponding union bound is `14 / 1,036,320 ≈ 1.35×10⁻⁵`. **These are conditional arithmetic baselines, not discovery-adjusted p-values:** the modulo operation, source pairing, byte interpretation, and recognition of a particular three-character file label emerged while exploring this corpus. The alternatives one could have tried are not limited to those 14 starts. This may be a selected clue, or a low-frequency coincidence among many unconstrained recipes. The **base59 `HC2`** alternative is also a real second reading; the string `ID3` cannot itself authenticate base60 when its route was postselected.

## Solve-path decision

A plausible *historical* route is p15 numerical procedure → p50 panel → `ID3` → previously existing 2013 Cicada 761.MP3 metadata → independently known p57 PARABLE. Its strongest objection is the **missing author-specified N mod 256 address/recipient rule**. More importantly, the historical ID3 contents and the p57 text are already known, and this route as it stands **does not specify a reversible operator on any unsolved ciphertext page**.

Retain the exact triple and its two codebook outcomes as a compact, testable provenance-independent conditional clue. **Do not** run unconstrained 761/key/phase/ASCII sweeps from it: those families have extensive original-cipher negatives already. A genuine advance would require an independently surfaced first-party command selecting modulo-256 table addressing and a *receiver/operator* that produces an intact unknown LP2 sentence, or a pre-registered independent original-source prediction that cannot be met by arbitrary panel readings. Until then this remains in `im-results/`, not the authoritative established plaintext synthesis.
