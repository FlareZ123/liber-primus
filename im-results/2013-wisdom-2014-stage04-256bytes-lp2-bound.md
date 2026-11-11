# 2013 Wisdom square to 2014 stage04 and the 256-byte site witness: no selected LP2 decoder

**Decision for Issue #160, 11 November 2026 (Agent36).** The original 2013 `0_wisdom` mixed 5×5 table recovers the later 2014 stage04 1033 magic square exactly (13 GP-word prime-weight sums plus 12 printed numbers). This **established** cross-round transformation has no printed instruction directing its output into any of the unknown LP2 ciphertext pages. A further source-level test preserves two distinct, historically demonstrated **256-byte** hexadecimal witnesses on the 2014 second- and third-onion sites; either has the same capacity as the later LP2 32×8 number table. The direct historically demonstrated bytewise XOR/reversal bridge yields no decoded ASCII or file header. The equality in length is suggestive input capacity, not an authenticated next operation.

## Exact historical stages

The original 2013 `0_wisdom` page ([pinned runes](../resources/external/2013-0-wisdom.txt)) has the visibly printed five-by-five word/number grid and explicitly emphasizes the prime numbers and totient function. The 13 words map by ordinary Gematria Primus **sum of rune-primes** to `341, 366, 199, 130, 320, 245, 91, 226, 320, 130, 199, 366, 341` in their original source positions. With the twelve untouched integers, all 25 cells become:

```
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

Every row, column and both main diagonals sum to `1033`. This reconstruction, with its complete source input and positive controls, is already independently documented in [the magic-square report](2014-magic-square-direction-map.md) and [the complete reproducer](../sims/2014_magic_square_direction_map.cjs). It is not a new decryption of LP2.

The actual 2014 stage04 onion archive ([historical `fv7lyucmeozzd5j4.onion` directory](https://github.com/krisyotam/cicada3301/tree/main/puzzles/2014/assets/stage04/fv7lyucmeozzd5j4.onion)) preserves an original 524-byte `index.html`, beginning with the literal HTML comment **`<!--1033-->`** followed by exactly **512 hexadecimal characters** (256 bytes). Original historical Git blob SHA-1 is `81837b8d5e89f6a31731b84a217a6fdeaa62aff8`. We have preserved the unchanged original HTML under [`resources/external/2014-stage04-index.html`](../resources/external/2014-stage04-index.html). Its initial sixteen hex digits are `87de5b7fa26ab85d`.

The separate `server-status` response in the same contemporary 2014 stage04 archive yields the **2014 5×5 matrix** only after extracting and reversing the recorded hexadecimal bytes. The solver's archived [stage04 README](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2014/assets/stage04/README.md) also documents the later HTML update to a much larger hexadecimal image and a **byte reversal plus OutGuess** to reveal subsequent content. Therefore the specific `1033` HTML marker and square had a historically demonstrated purpose *within that 2014 stage*. Reusing the matrix as an LP2 cipher transform would require an additional instruction, which no located source supplies.

## Updated 3301 payload (Issue #298)

The previously unparsed Stage04 `<!--3301-->` update is now bounded by exact object identities. Its `03.jpg` and `04.jpg` are byte-identical to original LP1 resources 03 and 04; the complete `server-status.bin` is byte-identical to the full LP1 page-05 artifact. The fixed page-05 trailer extraction reproduces the same 1033 5×5 square already derived from the 2013 `0_wisdom` material. The page-03 OutGuess output contains the signed “Let the text guide you” instruction and its small rune image; the page-04 OutGuess output is retained as an opaque 7,524-byte binary. No source-selected LP2 key or operation is established. See the [full Stage04 object inventory and reproduction SFT](cicada2014-stage04-256-p50-direct-identity-gate.md).

## Separate Stage04 small-image continuation (Issue #300, 11 November 2026)

The updated third-onion page also carries a separate OutGuess result: the signed text says **“Let the text guide you”** and contains a small JPEG, \`03.jpg.asc.jpg\`. The pinned participant archive [README and extraction notes](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/005-third-onion/README.md) preserve the exact 15,188-byte image (Git blob \`f91bdd6e2a890968a5a13d39be4d56899b877920\`), its rune transcription (blob \`9a4c24fc6b6b3586fb85e5bb7453ba6e718a160b\`), the original \`gematriaprimus.py\` (blob \`e3d22a6e13abb3e319c65aa6e813c055ce4f048d\`), and the reported key phrase. The image has **18 GP runes plus the literal digits 5 and 3**.

The solved LP1 page-03 plaintext begins **“WELCOME, PILGRIM, TO THE…”**. Removing spaces gives 19 Latin letters, but the GP serialization has **18 rune symbols** because \`TH\` is one GP rune. The archive's \`key_to_shifts(..., doubles=True)\` detects the \`TH\` pair but does not consume the second character; it therefore emits 19 shifts (\`T\`, \`H\` separately) instead of 18. This is the source of its trailing \`ONPM\` mismatch and subsequent genetic-algorithm key fitting. A GP-aware tokenizer that consumes \`TH\` once yields 18 shifts, exactly matching the 18 image runes. Applying the archive's own forward-shift Vigenère lookup, retaining all ambiguous output transliterations, produces eight candidates; exactly one is \`AUOWYFGL5LKZFJ3NONION\`. With the archive's stated GP \`U=V\` equivalence and the URL separator inserted after the 16-character v2 identifier, this is **\`avowyfgl5lkzfj3n.onion\`**. The wrong LP1 phrase \`THE GREAT JOURNEY TOWARD\` and the opposite Vigenère direction produce no matching candidate.

Reproducer: [\`stage04_small_image_vigenere_repro.cjs\`](../sims/stage04_small_image_vigenere_repro.cjs). It asserts the archive's four published buggy outputs, the 19→18 key-token correction, the eight corrected candidates, the unique exact host match, and both negative controls. The archive's GA target is based on the already-known URL, so its fitted mutations are not independent evidence and are not needed for this deterministic reproduction.

**Boundary:** this is a reproducible participant-reconstructed 2014 waypoint, not an original creator-signed instruction to use that LP1 phrase as an LP2 key. The output is only the fourth onion host; it contains no LP2-specific instruction, key, or plaintext. It strengthens the historical 2014 solve path without changing the LP2 cipher frontier.

## Independent 256-byte bridge, bounded and controlled

The historical site's 256 original bytes form a fixed complete byte string, just as the manuscript's original printed 32×8 base60 table contains 256 separate byte-representable pairs. The 2014 puzzle genuinely used bitwise XOR and byte reversal elsewhere, making a direct parallel-byte XOR a finite, human-plausible **testable analogy**. There is still no direct instruction saying the two objects should be combined.

Take all source site-hex bytes as printed and all current original-JPEG-adjudicated table bytes in row-major order. Test only exact source order or reversal of the table (both operations occurred in 2014 stages). Compare a full `256`-byte XOR output for printable US-ASCII and first bytes; a valid plain ASCII output of this direct type would require every byte printable. This is an intentionally narrow test, not a search for arbitrary stego/key algorithms.

| Frozen source pairing | Exact site/table byte matches | Printable ASCII after XOR | First sixteen decoded bytes (hex) |
| --- | ---: | ---: | --- |
| Direct source order | 1/256 | **99/256** | `4c39fcc5c387c6ea7eaf588d10f10bee` |
| Reversed table order | n/a | **101/256** | `d7637fcb44c6262ce290fc4531df31aa` |

Neither output is literal ASCII text or a recognized first-byte plaintext signature. A 256-byte synthetic ASCII message combined with the same original table under XOR is recovered exactly, **256/256 printable**, so the implementation positively detects the declared simple mode.

[Reproducer](../sims/stage04_1033_html_lp2_256_gate_sft.cjs) reads the two committed source bytes locally, checks the site marker, 512-digit hex, 32×8 table geometry, and exact direct XOR output. The test was independently calculated using the exact same original byte arrays before the SFT was committed. A permutation, unknown key, later cipher layer or non-ASCII binary is outside the stated negative. The original manuscript has **no stated rule** connecting the historical site data to its 32×8 table: equality at 256 bytes is not a cryptographic relationship by itself.

The immediately preceding **2014 stage03 second-onion** preserved page is also a fixed 256-byte hex string, under a different explicit comment **`<!--Patience is a virtue-->`**; it is preserved verbatim in [`resources/external/2014-stage03-index.html`](../resources/external/2014-stage03-index.html), linked to the original [second-onion archive](https://github.com/krisyotam/cicada3301/tree/main/puzzles/2014/assets/stage03/cu343l33nqaekrnw.onion). Its full 256-byte sequence differs from stage04 at **254 of 256 positions**. The [2014 chronological walkthrough](https://github.com/scream314/cicada3301/blob/master/2014.md) reports that both onion sites transmitted growing hexadecimal streams over time, with two characters per new byte. Their 256-byte framing therefore has a documented **historical staged-release purpose**, weakening the uniqueness of the proposed LP2-table 256-byte match.

The same source-order three-way XOR (second-onion bytes ⊕ third-onion bytes ⊕ LP2 printed table) yields **91/256 ASCII-printable bytes**, first sixteen hex bytes `2f7b6e7f8a79f584a4752f1724f441dd`. Across all eight direct/reverse choices for the three complete input streams and whole-output bitwise complement, the best result is only **102/256 ASCII-printable bytes**, never a legible plaintext or source-selected file format. The exact source input bytes and complete alternatives were tested from the two archived HTML pages and unchanged canonical LP2 byte table. No arbitrary index offset, key schedule or word segmentation was fitted.

## Next decision

The 2013→2014 GP-prime-sum map is established. The contemporaneous 2014 `<!--1033-->` marker explains why 1033 was relevant in that stage. The two 2014 sites' independently framed 256-byte data are preserved as genuine historical artifacts, but direct XOR coupling of either or both with LP2's 256-byte numeral table has no recognized plaintext. Their documented slow-growing site-release role supplies a stronger contemporaneous explanation for the length coincidence. The missing LP2 continuation is a separately authenticated *selector* for stage04's bytes or matrix as a page, word, row, operation or key. Directly transferring the matrix bearing graph, selected 2014 square-cell labels, simple bytewise XOR or arbitrary 5×5→32×8 reshapes would retread already rejected, unselected routes. Unless a new source supplies that operation, the historical square should remain an explained earlier-stage artifact.

**Evidence class:** original historical solver-archive HTML and derived source arithmetic; proposed cross-stage connection remains hypothetical. No unknown LP2 plaintext, authentic key or destination recovered.
