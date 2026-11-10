# Red-79 and eight-column AES-256 rank-byte inverse

**Agent 47, 10 November 2026. Evidence classification: complete finite source-key original-ciphertext inversion and blind planted-key recovery, negative for original LP2 under the declared model.** No previously unknown LP2 plaintext, authentic key, cipher or destination was recovered. The model is conditional and combines several independently visible clues; their combination is not authenticated as Cicada's design.

## Specific possible human solve path

The original three red passages on physical LP2 pages **40, 15, 53** contain exactly **8+20+51=79** runes. The first-occurrence ordering of those 79 runes gives **28 of the 29 GP glyphs, omitting only E (GP index18)**. This is a source-visible way to suggest the otherwise missing 29-symbol cycle needed to emit 28 distinct successors from the previous glyph. The 29 possible placements of E and the two traversal directions yield **58** completely determined cycle candidates.

The original 55 rune-bearing unsolved pages have **12,956** glyphs and **86** within-page immediate duplicate events. Treating each duplicate as a key-nonconsuming marker gives exactly **12,870 = 165×78** emitted ranks. The p15 prime spiral independently contains the ordinary prime 79, whose totient is 78. Every **78 successive radix-28 ranks** can represent a **47-byte** integer packet; native ASCII text consisting of upper-case letters/spaces fits this format without numeric overflow.

The original numeric page table on p49–51 has **32×8** byte cells. Its eight columns, or eight contiguous 32-byte row-major slices, can each be interpreted as one **AES-256 key** for the manuscript's eight section-start clocks, reset at physical pages **0,3,8,15,23,27,33,40**. A zero-IV AES-256-CTR stream supplies byte pads reduced modulo28 to the emitted rank digits. This encryption acts **on the radix-28 ranks before numeric-to-byte conversion**, so a true source-like ASCII message fits the 78-to-47 transport regardless of the AES output's bit distribution.

## Executed original-source competition

The [dependency-free Node 22 reproducer](../sims/red79_grid_aes_byte_transport.cjs) uses the canonical original LP2 rune indices, original colored-rune annotations and checked-in number table. It enumerates **1,856 exact complete inverse models**: 58 source-red cycle orders × 2 rank/packet digit orientations × 2 byte interpretations of the grid (radix59 or radix60) × 2 grid-to-key arrangements (columns or contiguous row-major blocks) × 2 section-key directions × 2 additive pad signs. AES-256-CTR counters begin at zero in each of eight source-section clocks; output bytes are reduced modulo28. All original rune positions and repeat markers are preserved. The initial unprinted prior rune is assigned source-missing E and is not learned from the ciphertext.

Only the first **55/165** decoded packets, exactly **2,585 bytes**, select the best-ranked model; the last **110/165**, exactly **5,170 bytes**, are held out. The independent test checks printable ASCII byte prevalence and exact output, rather than GP plaintext letter frequencies, which would be wrong for a byte transport.

| Measurement | Original source | Exact model-matched encrypted source plant |
| --- | ---: | ---: |
| Number of complete candidate models | 1,856 | 1,856 |
| Printable characters in best training-selected prefix | **1,065 / 2,585 (41.20%)** | **2,585 / 2,585 (100%)** |
| Printable characters in that candidate's heldout suffix | **1,922 / 5,170 (37.18%)** | **5,170 / 5,170 (100%)** |
| Maximum printable byte run anywhere over all candidate outputs | **16 bytes** | **7,755 bytes** for the recovered source candidate |
| Candidates exceeding 90% printable over complete decoded book | **0 / 1,856** | at least the exact source-true candidate |

The original training winner uses source order forward with E insertion10, radix59, reversed row-major key blocks, positive pad sign, and normal packet orientation. Its first 20 decoded bytes are `6be43f0931cf53847ba7a91f31edcfd178dbadc4`; the byte output does not resemble text. Even selecting retrospectively on the untouched suffix itself, the best original candidate gives only **2,074 / 5,170** printable bytes. This latter maximum is diagnostic and not an independently selected validation.

**Exact planted-language source control:** A separate **7,755-byte** upper-case ASCII stream derived from the checked-in solved LP1 reference file (including its descriptive header) is encoded into all 165×78 complete base-28 packets, then encrypted under the source's radix60 grid-column keys with eight section resets, positive rank pad, and a source-red cycle with E inserted at position11. All **86 original duplicate positions** are reproduced as nonconsuming markers; the synthetic book has exactly the original **12,956** physical glyph slots. The search receives no true key/order/insert-position labels: among all **1,856** settings it independently chooses **the exact hidden order, E insertion, key arrangement, sign and packet orientation** as rank one, and reconstructs **7,755/7,755 authentic source bytes**. The next-ranked setting produces only **4,230/7,755** printable bytes. The synthetic ciphertext and inverse roundtrip are asserted symbol by symbol in the program.

**Executed, successful original-input and exact positive run:** [manual GitHub Actions run 42879181342](https://github.com/FlareZ123/liber-primus/actions/runs/42879181342), invoked by input `grid-aes-bytes` in the already existing [manual source-capacity workflow](../.github/workflows/red79-base28-capacity.yml). No per-commit CI was created.

## Decision

The exact source-red79 alphabet, original 86 marker positions, source-79 78-digit packet size, eight source-derived AES-256 keys and specified zero-IV/section-reset mod28 pad **do not decrypt original LP2 into readable ASCII**. The blind full-book positive proves this finite search has the ability to recover a genuine source-ciphered message with unknown red-alphabet placement and key-table orientation. Its successful synthetic recovery is an algorithmic capability, **not original plaintext**.

This does not exclude alternate original word/section clocks, evolving or packet-specific alphabet rotations, IVs derived from other source material, a different cryptographic key extractor, an encrypted/compressed non-ASCII inner payload, or different packet geometry. The 78 packet factorization and the first-occurrence use of red79 are retrospective; absent a new source instruction, widening arbitrary AES seeds or moving packet boundaries would be weak. The next useful direction is a historically motivated independent state/nonce rule or plaintext-bearing source clue, rather than more post-hoc pad parameter sweeps.
