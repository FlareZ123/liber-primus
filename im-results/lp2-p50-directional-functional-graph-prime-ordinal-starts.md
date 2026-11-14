# p49–51 directional graph: canonical base60 structure and false-path controls

**Status: original-page numerical selector now converges with the independently proposed 2016 prime-dimension start on the same GEM three-cycle. This is a stronger cross-artifact navigation hypothesis, still without an authenticated operation, unknown LP2 plaintext, key, or complete inverse.**

## Source objects and codec

The original p49–51 table contains 256 two-character cells in a 32×8 row-major layout (80 + 104 + 72 cells on the three physical pages). The canonical byte interpretation is base60, as implemented in `sims/p50_miracl_base60_alphabet_match_sft.cjs`; that implementation matches the independent external `canon_256.hex` stream at **256/256 positions**. The table uses 59 distinct printed characters because lowercase `f` does not occur. Removing `f` therefore creates a tempting 59-symbol countermodel, but observed-character coverage alone does not override the independently matched base60 byte stream.

For each canonical byte (B), split (B=29q+r), with (q=lfloor B/29\rfloor) and (0\leq r<29). The remainder (r) names a Gematria Primus rune. A candidate direction channel interprets (q+1) as a standard 3×3 numeric keypad (1=SW, 2=S, 3=SE; 4=W, 5=stay, 6=E; 7=NW, 8=N, 9=NE), with no wrapping at the 32×8 boundary.

The 2016 signed message says “their numbers are the direction,” and the original p49–51 artwork contains repeated bilateral five-circle ornaments. A pixel-level comparison of the original full-scan images 66.jpg, 67.jpg and 68.jpg (LP2 pages49–51) shows that the 260×280 left and right ornament crops are each **identical across all three pages**. Each cluster is visibly three filled circles plus two outlined circles. The ornaments therefore provide no page-varying key bits or page-specific direction state; they may still be a global marker, but they do not specify a nine-state keypad, its rotation, or a centre state. Treat (q+1) as a testable investigator convention, not an established author instruction. Exact crop hashes and the reproduction script are below.

Historical context is consistent with caution: the 2014 `#cicadaops` log records participants noticing dots in `liber.jpg`, then dismissing them as an OutGuess payload after comparison with known OutGuess images. This is solver discussion, not author confirmation; it shows that dot/steganography interpretations were already considered, not that the later direction hint selects a keypad. [Original 2014 IRC log](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%23cicadaops.freenode.log).


## Pixel-exact border-motif control (Agent24, 14 November 2026)

The original numerical pages are full-scan files 66.jpg, 67.jpg and 68.jpg (LP2 pp49–51). In each image, the left and right five-circle ornaments are part of the repeated plant border. The half-open crop boxes are left (280,1400,540,1680) and right (1860,1400,2120,1680), each 260×280 grayscale pixels. Across all three source pages, every left crop is pixel-identical to the other left crops, and every right crop is pixel-identical to the other right crops: **six page-to-page comparisons, zero differing pixels**.

- Left crop SHA-256 of grayscale pixel bytes: 55e0d53df488a0707d28e24b962626593a4ab27c0ddaed5434a46fe296f4c0bb.
- Right crop SHA-256 of grayscale pixel bytes: 68ef60fc7798581cd2a04afba6112bda4a2b2d89d3251e631cedb9674bed1683.

This establishes that the five-circle pattern is a reused static border element across the three table pages, not a page-varying data channel. It does not prove the ornament is meaningless: a constant global marker remains possible. But the visible pattern has five positions, not nine, and cannot independently authenticate the proposed 3×3 keypad, its orientation, or its centre-state convention. The q+1 directional graph and its GEM cycle remain exploratory; this result removes the border dots as independent support for that specific keypad mapping.

Reproduction: [pixel-exact Pillow SFT](../sims/lp2_p50_dot_motif_reuse_sft.py).

## Canonical base60 graph

### An original-page selector independent of the 2016 image

Original **physical p10** (image `27.jpg`) prints the lone non-list decimal **7** immediately before a one-rune word **ᚷ (G)** at original page-local rune offset **169**. In the original GP table, G has one-based rune ordinal 7 and prime weight **17**. The **candidate multiplication** `7 × 17 = 119` addresses the 119th of the exact 256 original printed table cells. This start is independent of the 2016 image dimensions and was already isolated in [the preexisting p10 address report](p10-7g-p50-cell119-phase119-gate.md), which tested a *different* period-256 direct additive key and found no original plaintext.

Under the **already specified, unchanged** base60 `29q+r` / keypad graph, starting at one-based cell **119** gives the *entire directed cycle*:

| One-based cell | Original token | Base60 byte | Quotient q, remainder r | Rune | Following cell |
| ---: | --- | ---: | --- | --- | ---: |
| **119** | `0Z` | 35 | 1, 6 | **G** | 127 (S) |
| **127** | `2h` | 163 | 5, 18 | **E** | 128 (E) |
| **128** | `3D` | 193 | 6, 19 | **M** | 119 (NW) |

The spelling **GEM** comes from the published GP29 rune transliteration and the preexisting keypad interpretation; nothing was tuned after selecting start119. The same preexisting p10 experiment found the selected cell is physical p50 local row5/column7, its printed value **35=5×7**, and the *only* cell in all three table pages where the original base60 byte equals the product of its **physical-page-local** row and column numbers. The table has no printed row/column indices, so this auxiliary equality is conditional and does not prove intended indexing.

The original transcription has five other decimal-label/next-rune pairs: their products select cells **73, 58, 267, 316, 115**, respectively; two exceed the grid, and the others enter **NG/IA, TH, and D/C** cycles under exactly this graph. None reaches GEM. That makes the p10 selector distinct from the nearby numbered lists, without validating the multiplication operation.

A *direct onward-word hypothesis* uses the already historically attested GP-prime sum of a recovered complete word to select the next one-based table cell. For the recovered **GEM**, its original GP-prime weights are **G=17, E=67, M=71**, totaling **155**. The unchanged graph starting at **155** visits **155 → 162 → 154**, emitting **X–X–R**, then enters the **X–R** two-cycle. This is neither a continuing English message nor a source-authenticated key. The exact output closes the simplest `recovered word → GP-prime sum → next original cell → another word` recursion without tuning. It does not exclude a separately instructed continuation or an external key. As a second frozen counterfactual, removing the unused lowercase `f` from the base60 alphabet creates a 59-symbol register: start119 still follows **119→127→128→119**, but reads **G–S–T** instead of GEM. The base60 convention is independently established from all 256 table cells, while a meaningful transliteration after choosing a radix remains exploratory.

### Independently published 2016 dimension starts

The archived 2016 image is 563×569 pixels; these dimensions are the 103rd and 104th primes. Under the same candidate (q+1) mapping:

- Start 103 (width prime ordinal) emits **O → O → G → E → M**, then enters the unique three-cycle **G → E → M** at cells 119 → 127 → 128 → 119.
- Start 104 (height prime ordinal) enters the two-cycle **O ↔ G** at cells 96 and 104.
- The base60 graph has 49 cycles: 29 self-loops, 19 two-cycles, and one three-cycle (GEM). Across all 256 starts, 60 trajectories leave the finite grid and 196 reach cycles; the longest transient is six moves and no cycle exceeds length three. It is therefore **not a long keystream generator**. At most it supplies a short navigation marker.
- The GEM cycle's reverse basin has 11 nodes (eight in-tree nodes, five leaves, maximum depth four). This resembles a tree structurally, but the shape is a property of the selected graph, not independent evidence of creator intent.
- A shuffle calibration found the fixed cell-103-to-GEM event in 2/100,000 global shuffles, 61/100,000 row-preserving shuffles, and 19/100,000 column-preserving shuffles. These are controls for the fixed experiment, **not p-values**: the graph mapping and start were noticed after exploration, so selection effects remain.

The earlier 2012 image dimensions (503×509; prime ordinals 96 and 97) provide controls: 96 enters the O/G two-cycle, while 97 reaches a Y self-loop. The 2016 dimension pair selects a different local structure, but prime-ordinal indexing is itself a hypothesis.

**Cross-round image-size control:** The archive-pinned original 2012 first JPEG is **509×503**, while the verified 2016 signed-image carrier is **563×569**. As *unordered pairs* the prime dimensions change from **503,509 to 563,569**, i.e. **+60 for both sorted entries**; source width/height orientation is reversed, so do not claim a literal +60 to each original axis. Sixty is the radix of the separately established conventional table encoding. This makes an independently visible historical numerical parallel, and 2012's first-image dimensions were deliberately used by its original phone clue and PGP UID as a product with3301 ([source audit](../im-results/cicada2012-pgp-uid-original-prime-domain-resolution.md)). But the 2012 procedure multiplied *prime dimension values*; it did not instruct prime-ordinal indexing or a later radix transfer. The +60 correspondence was recognized retrospectively with the base60 hypothesis already in view. It supplies **no source-authenticated table opcode or plaintext by itself**.

## The signed-message word “lies”: a useful false-path control

The frozen base58 word map gives (operatorname{primeSum}(	ext{lies})=224=58\times3+50), selecting physical p50 and zero-based local word index 3. Because p50 is rune-free, interpreting that index as a table-cell index is a **new semantic extension**, not part of the established rune-word map. Under the row-major 256-cell layout, local index 3 is global one-based cell 84, token `3D`.

Under canonical base60, cell 84 is (193=29\times6+19) (M), followed by cell 75 (205=29\times7+2) (TH), then cell 67 (25=29\times0+25) (AE). If hollow-corner directions (q=0,8) are treated as stops, the conditional readout is **M–TH–AE**, terminating at cell 67. Without that stop rule, the path continues into a short NG/IA cycle.

A noncanonical base59 `f`-skip fork changes the same cells: 84→75→66 emits T–EA–M, which concatenates as **TEAM**, and stops only if (q=8) is declared hollow. This attractive English word is **not a decryption**: it depends on the noncanonical radix, an unverified keypad mapping, a selected hollow-stop rule, and transliteration rather than the rune meanings emphasized by the signed message. The base60 canonical stream gives no such word. Retain TEAM only as an example of the false paths warned about in the 2016 text.

A second candidate marker is cell 81, the first p50 table cell. Its token `2M` is base60 byte 142, so (142=29\times4+26): the candidate keypad maps (q=4) to stay and (r=26) to Y, producing a Y self-loop. Agent5 identified two word-map-derived paths converging on p50 word 0/cell 81 (2014 div331 and 2016 image height569); this is a candidate source convergence, not a validated address rule. The 2016 word “direction” has prime sum 337, which also selects cell 81 under one-based modulo-256 indexing, but that modulus/offset is another analyst choice.

### Original p50 first-cell Y → GP-prime 103 → existing GEM path

A further source-visible connection begins from a fixed position without choosing an arbitrary cell number: **the first printed numerical token on the rune-free middle physical page p50** is `2M`, joined-grid **cell81**. Under the already frozen canonical base60 interpretation it is byte **142 = 29×4 + 26**. Quotient 4 is the centre/stay position of the provisional standard 3×3 keypad, and remainder26 is **Y**, whose authentic GP prime weight is **103**. If, **only at a stationary cell**, the solver treats the remainder's GP prime weight as a fresh one-based table address, then the additional exact source step is:

```text
p50 first cell81: 2M = 142 = 29×4+26 → Y (GP prime 103)
jump 103 → 111 → 119 → 127 → 128 → 119...
          O     O     G     E     M      [repeat GEM]
```

The resulting **Y/O/O/G/E/M** route supplies an independent starting-cell rationale for exactly the **same previously frozen 103→OOGEM** path selected by the signed 2016 JPEG width's prime ordinal103. The earlier p10 7×G-prime marker independently selects cell119, the start of the GEM loop. Of the **29 centre/stay cells in the unchanged full table**, exactly **two** produce the GEM cycle by this GP-prime reroute: cells **81 and 217**. Both encode Y, which makes this an exact identity of the source table rather than three unrelated rune decodings.

The **critical missing source step is the rerouting rule**. No authenticated Cicada instruction says that keypad-centre/stay means jump to the GP-prime-indexed table cell; its introduction is retrospective, following the discovery of GEM. The numeral table starts physically at p49, not p50; choosing the rune-free middle page's first cell is a plausible separate layout cue, not an explicit start command. This equality reuses the original GEM event and is **not an independent statistical confirmation** of the keypad. A centre-jump extends the original graph by a new state transition and remains a short navigation hypothesis, with no plaintext/key material. The original source-locked [p10/2016 SFT](../sims/lp2_p10_7g_p50_gem_crossartifact_sft.cjs) now asserts the entire first-cell/prime-address route and tests all 29 centre cells.

### Direct historical-carrier attempt: frozen `GEM` as an OutGuess password

**Original-input negative, 14 November 2026.** The source-table graph above spells **GEM** under the already declared canonical base60/GP29 reading. This supplies one specific possible password for the historical JPEG steganography tool OutGuess, previously used by Cicada. Without fitting the password to the ciphertext, Agent6 invoked the repository's pinned original-image OutGuess 0.4 extractor with the literal uppercase key **`GEM`** on **all 58 original LP2 JPEGs** (scans17–74). The [completed and successful original-input manual CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43610189239) preserves every nonempty candidate extraction and its metadata in artifact `outguess-lp2-keyed`.

All **58/58** exact original images were attempted; **19/58** returned a formally consistent OutGuess header, but **0/58** returned a recognized PGP, ZIP, gzip, PNG or printable message. All 19 header-consistent outputs have **identical claimed seed30798 and length57,277 bytes**, with a common leading 32-byte prefix `4e78bddfe987781569e9150150520f87d79ebf3575286b62805e4852bd652c42` and entropy approximately **7.996–7.997 bits per byte**, despite differing payload hashes. The authentic default-key original LP1 JPEG controls **00.jpg/08.jpg** passed, and a new 47-byte message embedded and retrieved under source-unrelated test key `79` recovered **exactly**. Crucially, an independent **payload-free synthetic JPEG** under the same `GEM` key also returned a plausible but false OutGuess header (seed64366, declared length22,405, no recognizable content). Header success is therefore insufficient to authenticate any of these 19 extracts. The extractor also encountered 36 original image `SIGFPE` exits and three status1 exits, without unexpected wrapper errors.

This **retires the literal `GEM` OutGuess passphrase as a source-supported way to recover a recognized LP2 JPEG message** under the documented historical extractor. It cannot exclude hidden, separately encrypted binary data, a different steganographic format, or unrelated keys. There is no identified plaintext, verified hidden message, LP2 cryptographic key, or destination. The graph's GEM spelling was itself exploratory, so this test is a modest discriminating consumer, with no reason to expand into a spelling-variation password hunt.

## Decision and next work

The q/r graph is a bounded navigation hypothesis, not a cipher inverse. Physical p10's independently printed 7–G marker now offers a concrete *additional start selector* to the exact GEM cycle, distinct from the 2016 prime-dimension route. But the author never explicitly instructs a player to multiply the decimal by the next rune's GP prime, decompose base60 bytes into GP29 quotient/remainder, or interpret the quotient as a keypad direction. The 2016 “numbers are direction” phrase motivates testing directionality without authenticating the keypad, orientation, centre/stay state, hollow-corner stop rule, or prime-ordinal starts. The base59 TEAM readout is rejected as plaintext because it does not use the canonical byte stream. The base60 GEM cycle is a structural observation, not recovered text; rune meanings may matter more than transliteration.

Do not continue arbitrary keypad rotations, wrap rules, start offsets, or language scoring. A worthwhile successor must turn this new original-page selector into an author-supported **key, decoding operation, or locked prediction on another untouched unknown ciphertext interval**. The short GEM/Y marker alone does not establish a cipher or a page-length message. The previously negative period-256 source-key screen must not be rerun simply because two candidate starts now converge.

## Reproduction and related evidence

- **New original-file cross-artifact SFT:** [p10 7–G → GEM / signed 2016 JPEG dimensions](../sims/lp2_p10_7g_p50_gem_crossartifact_sft.cjs); reads source p10 transcription, canonical table, and actual 2016 JPEG, checks all six printed decimal controls, exactly reconstructs GEM, and asserts the base59 GST counterfactual without modifying any bytes.
- Original independent printed-numeral address and p50 local row/column identity: [p10 source-marker report](p10-7g-p50-cell119-phase119-gate.md).

- Canonical base60 cross-check: [`p50_miracl_base60_alphabet_match_sft.cjs`](../sims/p50_miracl_base60_alphabet_match_sft.cjs).
- Base59/base60 comparison: [`p50_radix59_vs60_factor_gate_sft.cjs`](../sims/p50_radix59_vs60_factor_gate_sft.cjs).
- Earlier sequential keypad-trail negative: [`p50_base29_high_digit_keypad_sft.cjs`](../sims/p50_base29_high_digit_keypad_sft.cjs) and [source gate](p50-base29-high-digit-radix9-source-gate.md).
- Signed-message address and p50 “lies” pointer: [full word-map report](lp2-2016-signed-message-base58-word-map.md) and [source script](../sims/lp2_2016_message_base58_word_map.cjs).
- Short-period bound: [Agent5's graph analysis](../communications/agent6/20261114T1245Z_agent5-directional-graph-6step-short-period-bound.md).
- Shuffle calibration: [Agent1's control](../communications/agent6/20261114T1256Z_agent1-p50-gem-shuffle-calibration.md).
- The 2013 missing-prime 180-position family is already covered by [the existing terminal-180 gate](2013-telnet-missing-primes-terminal-180-76.md); do not repeat it.
