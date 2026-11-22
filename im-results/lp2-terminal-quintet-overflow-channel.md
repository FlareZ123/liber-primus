# LP2 terminal quintet channel: 24-bit overflow and the original ornament

**Evidence classification (14 November 2026, Agent 37): exploratory source-constrained serialization, no recovered plaintext, authentic cipher, secret key or destination.** The exact original-input, reversible implementation is [`sims/lp2_terminal_quintet_overflow_sft.cjs`](../sims/lp2_terminal_quintet_overflow_sft.cjs), using the repository's unchanged [GP29 corpus](../resources/liber-primus/lp2-corpus.json). This is a bounded *binary-payload* test, not another unrestricted English scorer.

## Frozen source alignment and why the construction was attempted

Original physical p55 contains **76 GP29 ciphertext runes**; the first finishes a word carried over from p54. The other **75 runes** therefore form exactly **15 contiguous quintets**. The original p55 floral ornament has **five left positions**, outlined at positions **1 and 4**, and **five right positions**, all filled. That five-position source picture and p27's independently verified **15 wing-membrane faces** motivate checking the natural 15×5 packetization. The source does *not* explicitly prescribe binary byte packing, a high-bit threshold, or a 2014 byte decoder. The floral left/right border artwork is a **pixel-identical template shared by pp40–55** under the existing [source-image audit](lp2-floral-border-template-audit.md), so the mask cannot independently identify a page-specific key or payload. This is a critical limitation on any claim of a direct authored ornament checksum.


### 2012–2014 source gate on the transport itself (Director #1543, 18 November 2026)

The frozen question was whether evidence that predates the packet equalities independently selects the four representation choices used above: a five-rune unit, a 24-bit/three-byte payload width, the p55 phase1 start, and the quotient/overflow side bit.

The original p54→p55 layout supplies one genuine selector. P55 local rune0 finishes the word that begins on p54, so a solver following printed word continuity can set that rune aside before any byte arithmetic. This leaves the 75-rune p55 body and fixes **phase1** without consulting the resulting bytes. The remaining representation choices do not have comparable support. The five-position berry clusters can suggest the number five, yet the same floral template is reused throughout pp40–55 and does not label p55 as a five-rune byte stream. The equality 75=15×5 follows after the independently visible phase1 cut and therefore cannot by itself select a codec.

The authenticated 2012–2014 operation inventory provides no historical five-GP29-to-three-byte precedent. The 2012 route uses OutGuess, Caesar text, book-code coordinates, GnuPG and a MIDI object; none defines a GP29 binary packing. The PGP-valid 2013 TCP challenge defines **BASE29** as a textual numeral operation, with the worked control `BASE29 3301 -> 3QO`; byte-valued `RAND` responses are a separate command. It gives no rule for grouping five base29 digits or spilling a high bit. The verified 2014 chain uses hex decoding and bytewise XOR for already-typed byte shares, GP29 Vigenere/Atbash operations for rune text, OpenPuff with explicit settings, a GEB book code, and form submission of number squares. None converts five GP29 runes into a fixed 24-bit field. The exact source inventory is summarized in [the historical solve-path reconstruction](../workplace/historical-solve-path-to-original-lp2.md), with authenticated 2013 protocol details in [the signed TCP source record](../resources/external/2013-tcp-server-signed-source.md) and verified 2014 signed-message controls in [the Stage04/Stage08 source gate](cicada2014-stage04-stage08-pgp-original-source-gate.md).

Consequently, choosing `2^24` as the split point and retaining `q=floor(v/2^24)` as a side bit is a mathematically clean way to make the exploratory quintet conversion lossless, but it remains an analyst-defined representation. The source does not specify a 24-bit width, a three-byte byte order, an overflow channel, or a bit order for that channel. The observed `10010` agreement with the five-berry drawing is downstream of those choices, and the repeated border template prevents it from supplying an independent page-specific selector.

**Decision for #1543:** preserve the phase1 start as source-selected and the calibrated framing event as a real statistical observation. Keep the five-rune grouping as a visual hypothesis. Treat the 24-bit payload and overflow-bit representation as **underselected**. The 43-byte interior therefore remains a provisional derived object rather than authenticated historical puzzle data. A future binary consumer should require a first-party representation clue that fixes the byte width and spill convention before the p55 packet equalities are evaluated.

### Independent 2016 source-dated reading of the five-berry motif

The original `#cicadasolvers.freenode.2.log`, **16 February 2016 at 23:52–23:56** (original dated lines **298219–234**), preserves a first-person participant saying the hollow/filled **berries on the plants at the page margins** form the clockwise pattern `ABAAB`, with A-site positions given by `floor((5*N-1)/3)`. For positive N this enumerates **1,3,4,6,8,9,11,13,14,…**, making a periodic `ABAAB` characteristic word. The untouched original p55 left cluster indeed reads **filled/hollow/filled/filled/hollow** clockwise from its leftmost dot. Starting at the upper hollow dot yields the equivalent hollow-bit rotation `10010`, matching the first five original p55 quintet-overflow flags; the next source cluster contains five filled dots, matching the next five zero flags. This supplies a **historically independent human reading of a source-original visual motif**, although the participant was discussing XOR/addition on **OutGuess data** and gives **no signed author instruction** to convert GP29 quintets to 24-bit byte packets, select p55, or interpret the resulting bytes. The original template repeats across pp40–55. The five-bit numerical match therefore does not authenticate the 45-byte packet or alter its negative direct-consumer result. [Original-byte source](https://github.com/neuroretransmit/cicada/blob/master/irc-logs/%23cicadasolvers.freenode.2.log), Git blob `72634a9d071d32af767edbffc0493d810e88cd0d`; [preserved extraction and CI](https://github.com/FlareZ123/liber-primus/actions/runs/43613758088) using [the source-pinned SFT](../sims/lp2_2014_2016_late_irc_witness_sft.cjs).


For each of the fifteen p55 quintets after the carried rune, interpret the five original GP29 indices as a base-29 big-endian number `v` (0 ≤ v < 29⁵ = 20,511,149). Since `2²⁴ = 16,777,216`, a supposed fixed three-byte payload `v` is **invalid** whenever `v ≥ 2²⁴`. A reversible *candidate* transport instead has the unique quotient/remainder `q=floor(v/2²⁴)` (one bit, 0 or 1), `r=v−q·2²⁴` (exactly three bytes), and reconstructs `v` from `q,r` before base-29 re-encoding. This is mathematically lossless on the selected original ciphertext and on the supported 25-bit positive controls; it is not evidence that the author used it.

## Exact original-input result

The fifteen source packet high flags in normal left-to-right GP29 order are:

```text
10010 00000 00000
```

The first five flags **exactly match the already-documented left ornament's hollow-position mask `10010`**. The next five flags match the five completely filled right positions when a filled dot is coded 0. The last five flags are also zero. The 45 recovered *low-24-bit* bytes are:

```text
15023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc73106377502d
```

All **75/75 source runes reconstruct exactly** when the fifteen flag bits are retained. The source's only overflowing quintets are the **first and fourth**; a flag-free `5 runes → 3 bytes` converter is therefore *not* a lossless original-cipher inverse. The 45-byte output has no obvious ASCII sentence or recognized unencrypted file prefix. The fixed 43-byte interior has 17 printable ASCII bytes, but its byte appearance is now calibrated under the matched null in Director #1578 below and is statistically ordinary. Appearance alone therefore does not type the object as text, compressed data, ciphertext, or another binary packet format.

An independent source control tested **every possible five-rune start phase (0–4)** at each of the 55 rune-bearing unsolved physical pages, requiring all 75 source runes for fifteen quintets. This gives **267 eligible page/phase windows**; the same exact full fifteen-flag pattern occurs at `(page1,phase0)`, `(page53,phase4)`, and `(page55,phase1)`. For independent uniform GP29 quintets, the probability of this particular fixed flag pattern is `[(29⁵−2²⁴)/29⁵]² · [2²⁴/29⁵]¹³ = 0.00243131845454`. This is **not a discovery-corrected p-value**: selection of p55, the 24-bit radix, quintet grouping and the artwork mask was exploratory, and some original source positions were previously inspected for other reasons. The exact duplicate pattern in multiple page/phase controls makes the source cross-check interesting but nonexclusive.

## Additional original-endpoint byte framing, still unproven

The same exact 45-byte readout has two further **source-specific** numeric correspondences, each frozen without decoding a word:

1. **Header byte:** p55 local rune 0 is the carried `NG`, canonical GP index **21**. The first low24 byte of the first quintet, `0x15`, is also **21**. Thus an explicit one-byte source header could be read from the rune omitted to align the 75-body grouping. This is an observable equality, not an authenticated packet header.
2. **Length byte:** the last low24 byte is `0x2d` = **45**, exactly the packet's **45-byte total length**. The terminal five-runic quintet at p55 local **71–75** is `J U B E I`, also appearing at p27 local **29–33** inside the previously known 6-rune bookend. Consequently the potential length byte can be recovered independently from the p27 printed phrase. The penultimate decoded byte is `0x50` = **80**, also equal to the **sum of the canonical GP indices of the full six-rune recurrent `DJU BEI` phrase**; this equality holds for the final group only (one of 15 groups when comparing each quintet's middle byte against the sum of its five runes plus its immediate predecessor). The candidate terminal two-byte `50 2d` thus resembles a self-describing numerical footer, but neither checksum rule nor packet framing is given by the source. The arithmetic was inspected after finding the recurrence and must not be counted as independent plaintext evidence.
3. Discarding a **one-byte header** and **one-byte length footer** would leave **43 candidate payload bytes**, matching the already established **43 strict interior runes** of the p55 printed words after its carried rune. There are 16 complete body words, so the count follows arithmetically from 75 total runes and their word edges; it is *not* a recovered cipher operation.

A page/phase control over all **267 original eligible 75-rune windows** gives only **two** matches of the possible header equality between the preceding rune index and the first decoded byte: original p53 at phase4 and p55 at phase1. Exactly **four** windows have terminal byte `0x2d`, and **only p55 phase1** has *both* a matching putative header and the matching length footer; it also has the source `10010` five-dot-mask flags. P53 phase4 is a postselected interior word position, while the p55 phase1 alignment is independently selected by its single carried rune. All equalities are real, but the encoding (24-bit cutoff and 5-rune alignment) was discovered exploratorily after inspecting p55, and scanning multiple source properties creates selection bias. None is yet a validated checksum, binary format or key.

The most direct historical/native possible **43-byte decryptors** were tried on the exact 43 middle bytes without optimizing positions or keys. Source key candidates were (a) the original **43 GP indices from p55 strict word interiors**, (b) their **43 canonical GP prime values**, and (c) the printed p50 table's first 43 row-major bytes or the previously proposed 43-cell bracket positions84..126. Direct bytewise XOR and addition/subtraction modulo256 have, respectively, at most **20/43, 20/43, 20/43 and 25/43 printable ASCII bytes** for those four key choices, with no recognizable text or authenticated object. These tests do not exclude any other independently selected key. The original 43-byte candidate remains high entropy.

## Independent solved-ending controls: no shared book-wide packet format

The adjacent **85-rune solved p56** and **95-rune clear p57** also divide exactly into five-rune groups without a skip: 17 and 19 groups yielding **51 and 57 bytes**, respectively. Applying the *same* big-endian GP29/24-bit split to their **printed** rune indices gives first/last bytes **18/91** for p56 (its first rune has GP index25) and **149/65** for p57 (its first rune has GP index13). Neither independently solved page matches the p55 first-byte=opening-rune or final-byte=decoded-length properties (expected footer bytes51 and57 respectively). Thus any proposed authenticated packet format would be **special to p55**, or would require an independently specified change of scope/convention. It cannot simply be declared an LP2-wide decoder from the p55 coincidences.

## One source-derived 43-byte key consumer: historical ARC4

The p55 quintet transport also proposes a **43-byte candidate seed** (the interior of its putative first-byte header and last-byte length footer), without assuming that the 43 bytes are ASCII plaintext. This can be tested as a complete, unchanged key on the 12,956 original unsolved GP29 runes. The independently sourced 2013/2014 OutGuess stages used the ARC4 primitive, so [this exact follow-up SFT](../sims/lp2_terminal_quintet43_rc4_original_sft.cjs) fixes the 43 source bytes and examines **72 direct GP29 additive consumers**: raw seed and two historically named ASCII prefix conventions (`Seeding`, `Encryption`), raw/drop-256 ARC4, byte modulo29/scaled/rejection GP29 emission, either uninterrupted or physical-page-reset stream, and both additive signs. The named prefixes are *candidate domain separators*, not a claim that OutGuess itself initialized keys by direct concatenation. No source key offset, packet rebundling, IV, word permutation, or follow-up decoding was chosen from observed success.

Every original ciphertext decoder remains near-uniform at **global GP29 index of coincidence 0.0344452–0.0345594**, against the unchanged original **0.0344784**. The highest-scoring decoder starts with nonwordlike runes. A full-length independent canonical-GP Shakespeare plaintext plant under the same code recovers **12,956/12,956 symbols exactly** and its expected nonrandom GP29 IoC; an independently solved p57 GP29 text also round-trips. This rules out an ordinary **direct additive ARC4 key stream** from this exact 43-byte candidate under the 72 declared conventions, while preserving possible cipher-specific key-skip, non-GP packet and other original-source-consumer hypotheses. The 43-byte packet itself is still a *candidate*, with no authenticated format or checksum.

## Direct p56 digest-preimage gate for the 43-byte interior

The p56 solved ending supplies the 128-hex digest 36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4. Since the p55 quintet readout yields a framed 45-byte packet with a 43-byte interior, the simplest file interpretation is that either the raw interior, the framed packet, or the ASCII-hex form of one is the hidden page/object hashed at p56.

The exact 45-byte frame is 15023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc73106377502d; its 43-byte interior is 023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc7310637750. Eight direct serializations were tested: raw 43 bytes, raw 45 bytes, lower- and uppercase ASCII hex of the 43-byte interior, each 43-byte hex form with LF, lowercase ASCII hex of the 45-byte frame, and that 45-byte hex form with LF.

All eight representations were checked under SHA-512, SHA3-512, BLAKE2b-512, and Whirlpool: 32 digest comparisons, zero matches. The 43-byte interior is therefore not the direct raw or tested ASCII-hex preimage of the p56 digest under these four 512-bit families.

This is a bounded exclusion only. It does not rule out a URL/HTML wrapper, a different serialization, decompression/decryption before hashing, or another hash family; none is selected by the present source evidence. Reproducer: ../sims/lp2_terminal_quintet_hash_preimage_sft.cjs.

## Related five-dot chapter-body alignments: independent negative payload gate

The independently printed **p23 five-black-dot opening** and **p40 floral five-dot border** motivate the exact red-heading-trimmed visual chapters **p23–26 body 1005 = 201 quintets** and **p40–53 body 3000 = 600 quintets**. A new source-frozen implementation applies this *same* 5-rune base29-to-24-bit-plus-overflow operation at those two chapter starts without any fitted phase, preserving all original runes. The resulting **603-byte** and **1800-byte** low24 streams are both invalid UTF-8 and have no standard tested archive header; overflow flags are **30/201** and **123/600**, with distinct first-five patterns `10011` and `10000`. This neither independently confirms p55's unique first-five `10010` flag/art coincidence nor refutes non-24-bit encodings. The p40 motif also repeats across p54 despite the visible chapter break, while the p40–53 interval includes a separate 51-rune red ending and the p49–51 numeric grid; five dots do not fix those interpretive choices. Full [source-conditional chapter-body report](lp2-five-dot-chapter-body-quintet-source-gate.md) and [Windows run 43654287600](https://github.com/FlareZ123/liber-primus/actions/runs/43654287600). The original p55 packet's exceptional header/footer coincidences remain correctly scoped to p55 under their declared control, with **no transfer of a genuine byte decoder to these additional chapters**.

## Source-authentic 2013 `761.MP3` direct XOR transfer (Agent41, 15 November)

The **original 2013 `761.MP3`** has an independently established historical role as a **raw XOR operand starting at file byte zero** (its ID3 header included), and carries the exact future p57 PARABLE message. That gave one more executable consumer for the candidate p55 quintet packet without inventing a password, byte offset, or cryptographic key. The packet's original five-rune framing was held unchanged; both its full 45 bytes and its putative 43-byte interior were XORed against the first 45 or 43 bytes of the authentic historical source.

The executed [manual original-byte Windows CI 43682562692](https://github.com/FlareZ123/liber-primus/actions/runs/43682562692) independently verified the **4,010,732-byte MP3** against SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`, the 15 packet carry flags `100100000000000`, the 45-byte packet and its header/footer matches, and the XOR inverse/positive. The direct XOR outputs are:

- **Full 45:** `5c460fbfedd149598168deb6151bd09b0e218f8e1282904b670d52edb2876a391e934c6b95de90452452771c44` (19/45 printable or ASCII whitespace; longest printable span 4).
- **Interior 43:** `4b788feed14959802dceba151b889b0ead038e12d2a158740e5ce4f7967720129f557590de8b5f26574650` (17/43 printable or ASCII whitespace; longest printable span 5).

Neither is directly readable prose nor an obvious beginning of a common original payload. **This rejects only the unchanged historically used byte-zero audio-XOR transfer yielding directly readable bytes.** An encrypted binary recipient would remain logically possible, but no original clue selects one. The precise original-source and positive-test implementation is [the single-file CJS gate](../sims/lp2_p55_quintet_audio761_xor_sft.cjs). This is separate from the prior 2013-audio-to-printed-256-grid XOR test, because the recipient and input frame are different.

## Original p56 printed digest as a direct packet key (Agent43, 15 November 2026)

**Small adjacent-source consumer, negative for readable plaintext.** Previously, Agent37 found that original p55 76 rune ciphertext can be partitioned after its one carried rune into 15×5 GP29 quintets, yielding a provisional 45-byte packet with 43 interior bytes. The following independently solved physical p56 gives an actual printed 128-hex/64-byte hash of an unknown deep-web object. This small experiment instead takes that 64-byte hash as a **candidate key material for the adjacent p55 binary interior**, even though the author never instructed such a transfer.

The input frame, source hash, start, orientation and binary endianness are unchanged. Four one-shot consumers are evaluated: direct XOR of the 43 interior bytes with the first 43 printed hash bytes; AES-256-CTR with key=first32 hash bytes and IV=next16; AES-256-CTR with key=last32 and IV=first16; and AES-256-CTR with first32 key and zero IV. These are three natural byte-slice choices rather than a password, seed, offset or cryptographic-mode sweep. Their original-input outputs are:

| Direct source-fixed consumer | Printable ASCII or whitespace /43 | First 16 output bytes (hex) |
| --- | ---: | --- |
| Hash bytes0–42 XOR | **23** | 340acb8e7a3a21bc56786a092f89dd65 |
| AES front32 key, next16 IV | **19** | 6e08be1f546c2080aaea0adb6f827834 |
| AES back32 key, first16 IV | **17** | 9c04a3eaea0fc978d060b82c07f71ac8 |
| AES front32 key, zero IV | **11** | 5c1ead01020486b69ef28669add9b113 |

No output yields recognizable prose or an ordinary unencrypted file header. Each 43-byte XOR/AES operation recovers an independently planted 43-byte solved-message text exactly, with wrong AES keys rejected. The read-only [Node22 SFT](../sims/lp2_p55_quintet_p56_digest_key_sft.cjs) derives all source bytes directly from the unchanged p55 corpus and the p56 printed hash, asserts the established 45-byte framing and records every output. **Decision:** this source-adjacent digest as direct XOR / precisely these three AES-CTR consumers does not recover a p55 message. It does not establish that the speculative quintet packet is an original byte framing; other key derivations would require a new independent source selector. No unknown plaintext or authentic creator key was recovered. The exact source test passed on [Windows Node22 run 43687000284](https://github.com/FlareZ123/liber-primus/actions/runs/43687000284) after a CRLF-compatible source heading parse adjustment; the initial run 43686919316 failed solely on that platform-specific parser assertion, before any cryptographic test.

### Authenticated AES-GCM packet test on the original 45/43 bytes

The same earlier p55 candidate frame also permits a standard, directly authenticated binary packet interpretation. A **45-byte** frame accommodates **12-byte nonce + 17-byte ciphertext + 16-byte GCM tag**; the already suggested header/footer-stripped **43-byte** interior accommodates **12-byte nonce + 15-byte ciphertext + 16-byte GCM tag**. A passing 128-bit tag under the immediately following solved p56 printed hash would supply a decisive plaintext authentication signal, much stronger than English printable-byte coincidence. Neither source, however, instructs the reader to use GCM or to treat the hash target as a key.

The fixed printed 64-byte p56 hash gives exactly two natural AES-256 keys (front or back 32 bytes). Each previously defined candidate frame has two conventional field orders, nonce12-first/tag16-last or tag16-first/nonce12-last, with no associated data. Thus **8 exact, fully specified AES-256-GCM consumers** were evaluated on original source bytes, with no password, nonce offset, IV search or KDF. **All eight original inputs fail GCM authentication; none yields plaintext.** Eight byte-exact planted positives under the same keys/nonces/field layouts recover the complete 15- or 17-byte planted text; each rejects an incorrect key. The updated [single-file Node22 SFT](../sims/lp2_p55_quintet_p56_digest_key_sft.cjs) contains both authenticated and previously tested XOR/CTR consumers, with source bytes rederived independently. This rejects these eight exact authenticated binary framings only. Further derived-key/packet constructions require an independent source selector. The fully integrated XOR/CTR/GCM original-source test passed in [Windows Node22 run 43687473600](https://github.com/FlareZ123/liber-primus/actions/runs/43687473600).

## Discovery-aware familywise calibration of the byte framing (18 November 2026, Agent25)

Director #1525 prospectively froze the exact byte-framing conjunction already reported in the original #865 page/phase scan, before any matched simulation was run. The **primary event** is: among the same 267 eligible original page/phase windows, at least one window simultaneously has (1) phase > 0 with the first decoded low-24 byte equal to the immediately preceding GP29 rune index, and (2) final decoded byte equal to the fixed 45-byte packet length. This is exactly the conjunction for which original p55 phase1 is the sole source hit. The deterministic 43-byte interior length is a consequence of trimming one byte from each end of a 45-byte frame, so it is not counted as another stochastic success criterion.

The matched null preserves the manuscript's source shape aggressively: each physical page's GP29 labels are independently Fisher-Yates shuffled among that page's existing rune positions. Page length, every printed word/line/punctuation boundary, and each page's exact rune histogram therefore remain fixed. Every shuffled book is rescanned over the unchanged 267-window family under the same big-endian 5-rune/base29 → low24+carry serializer. A deterministic 20,000-trial run with seed `0x1525a25` gives:

- **118/20,000 = 0.0059** shuffled books with at least one primary header+footer hit. Every one of those books has exactly one hit; the matched mean is 0.0059 hits/book. The original has exactly one primary hit, p55 phase1.
- The exact original 15-bit carry string `100100000000000`, retained as a **secondary frozen diagnostic**, appears at least once in **9,394/20,000 = 0.4697** shuffled books. At least the original's three such windows appear in **492/20,000 = 0.0246** books. This carry string therefore does not provide a strong independent familywise discriminator by itself.
- The strict intersection of primary framing and the exact 15-bit carry string occurs in **0/20,000** matched books. Because the carry pattern and serialization were part of the exploratory discovery history, this zero count is recorded descriptively and is not promoted into a discovery-wide significance claim.
- An independently constructed synthetic phase1 packet using the exact inverse serializer, exact original carry string, header equality and length footer is detected correctly. The same synthetic page has no primary hit at phase0. This verifies power and alignment without tuning on the original book.

Reproducer: [`sims/lp2_p55_quintet_framing_familywise_sft.cjs`](../sims/lp2_p55_quintet_framing_familywise_sft.cjs). The source-exact Windows/Node22 execution passed in [run 44390877778](https://github.com/FlareZ123/liber-primus/actions/runs/44390877778).

**Decision.** The two-byte p55 framing conjunction survives the predeclared discovery-aware matched null at a familywise rate of 0.0059, with a passing independent packet plant. This supports retaining the fixed 43-byte object for **one independently source-selected typed consumer** under #1525's fork. The calibration does not authenticate the 5×GP29→24-bit+carry transport, establish that the bytes are plaintext, or supply a key. The independently visible source clue required to choose the next typed consumer is still missing. Further RC4/XOR/file-header variants chosen because they make the bytes look promising remain unjustified.

## 43-byte / 43-interior-count calibration (18 November 2026, Agent13)

Director #1556 tests whether the putative 43-byte payload length has an independent source-layout match to the strict interiors of complete printed words. The packet side is fixed by the existing construction: every eligible 75-rune window yields 45 low24 bytes, and trimming one byte at each end always leaves **43 bytes**. The source side uses the canonical project word parser and counts only strict interior runes of words wholly contained in the exact 75-rune window.

Across the unchanged **267** page/phase windows, **23 windows on 10 physical pages** have exactly 43 strict interior runes. P55 phase1 is one of those 23. Its 16 complete body-word lengths are `4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3`, whose strict interiors sum to 43.

The exact matching windows are:
`p3/4, p28/1, p28/2, p30/3, p30/4, p33/0, p33/1, p33/2, p36/0, p36/1, p36/2, p37/0, p39/0, p39/1, p39/2, p39/3, p42/2, p42/3, p42/4, p51/0, p51/2, p51/3, p55/1`.

The matched-null family from #1525 shuffles rune labels within each physical page while preserving every page length and every word/line/punctuation boundary. This length statistic depends only on those fixed boundaries and window endpoints. Every matched-null book therefore has the same 23 exact matches and a familywise any-match rate of **1.0**. A 20,000-book simulation would reproduce the identical count deterministically and adds no information.

**Decision.** The 43-byte to 43-interior equality supplies no independent packet selectivity. Keep the separately calibrated header/footer conjunction at its existing scope. The interior-count coincidence should not be promoted as another framing clue.

Reproducer: [`sims/lp2_p55_43byte_interior_count_calibration_sft.cjs`](../sims/lp2_p55_43byte_interior_count_calibration_sft.cjs).

## Four canonical quintet serializers: original convention is the sole source hit (18 November 2026, Agent38)

Director #1549 froze the p55/page-phase framing construction and varied only two canonical serialization choices: **forward versus reversed GP29 digits inside each five-rune integer**, and **big-endian versus little-endian order for each emitted three-byte 24-bit remainder**. Phase, quintet width, quotient/carry rule, 75-rune body, 45-byte frame, header/footer equalities and all 267 eligible page/phase windows stayed fixed.

| Rune order | Byte order | Original framing hits | p55 phase1 first/last byte | p55 carry bits |
| --- | --- | ---: | --- | --- |
| forward | big | **1: p55 phase1** | **21 / 45** | `100100000000000` |
| forward | little | **0** | 60 / 119 | `100100000000000` |
| reversed | big | **0** | 164 / 5 | `000000000000100` |
| reversed | little | **0** | 60 / 114 | `000000000000100` |

The existing forward/big convention is the sole source hit in this four-way family. Reusing the **same 20,000 matched books and seed `0x1525a25` from #1525**, the four per-serializer familywise hit counts are **118, 125, 94, 93**, or **0.0059, 0.00625, 0.00470, 0.00465**. A hit under any serializer occurs in **428/20,000 = 0.0214** books; 426 have exactly one hit-bearing serializer. All 118 forward/big hit books are exclusive to that arm. Four inverse plants, one per serializer, satisfy their frozen header/footer conditions exactly.

**Decision.** Original p55 selects forward/big within this finite family, improving serializer robustness. If rune/byte order was itself unfixed during discovery, the appropriate four-way any-hit background is 2.14%, weaker than the pre-fixed 0.59%. This still supplies no first-party instruction for five-rune/24-bit packing and does not authenticate the 43-byte interior.

Reproducer: [`sims/lp2_p55_quintet_serializer4_familywise_sft.cjs`](../sims/lp2_p55_quintet_serializer4_familywise_sft.cjs). Windows Node22 passed in [run 44393281389](https://github.com/FlareZ123/liber-primus/actions/runs/44393281389); deterministic counts were independently recomputed from the canonical corpus and committed seed.

## Source-selected first-local-word-start recalibration (18 November 2026, Agent1; Director #1617)

Director #1572 independently established a source-visible start rule for page-local operations: after any word fragment carried from the preceding physical page, begin at the first rune of the first word wholly local to the new page. Applying that rule manuscript-wide gives exactly one fixed start per rune-bearing physical page. P55's selected start is local rune1, matching the existing packet phase1. The one-rune carry itself remains ordinary at 9/54 page starts, so the selector here is the general first-local-word boundary rather than a claim that p55's carry length is rare.

Keeping the #1525 forward-rune, big-endian five-GP29-to-low24-plus-overflow serializer and its two-byte framing predicate unchanged, the source-selected family contains **55 rune-bearing physical pages**. Physical p50 has no runes; p49 has only 66 runes and cannot support a 75-rune body from its selected start. Thus **54 pages are length-eligible**. Of these, 23 begin at local rune0 and cannot satisfy the frozen header condition because that condition requires a preceding page-local rune; the remaining **31 positive-start pages** can in principle hit.

On the original ciphertext, **p55 phase1 remains the sole hit**. Its first decoded byte is 21, equal to the GP29 index of the immediately preceding carried rune, and its final decoded byte is 45. No other source-selected page start satisfies both equalities.

The matched null uses **100,000 deterministic within-page histogram-preserving shuffles** with every selected start held fixed. The framing predicate depends only on eleven shuffled positions per page: the preceding rune, the first quintet and the last quintet. Sampling those eleven ordered symbols without replacement is exactly distribution-equivalent to a full Fisher-Yates page shuffle for this predicate, while avoiding irrelevant work. The result is **78/100,000 = 0.00078 familywise hits**; every hit book has exactly one selected-start hit. A 95% Wilson interval for this rate is approximately **0.000625–0.000973**. The unchanged inverse phase1 plant passes and phase0 fails the header condition.

This narrower human-visible family therefore reduces the matched familywise background by about **7.56×** relative to the earlier 267-window discovery scan (0.0059). Treat this as a stronger calibration of the already-observed p55 framing under the independently motivated page-start rule, not as a second independent p-value. It still does not supply a historical reason for the five-rune/24-bit packing, identify the 43-byte interior's type, recover a key, or yield plaintext.

Reproducer: [`sims/lp2_p55_firstlocalword_framing_sft.cjs`](../sims/lp2_p55_firstlocalword_framing_sft.cjs). Windows Node22 CI: run 44403758497.

## Exact historical packing implementation census (18 November 2026, Agent1; Director #1618)

Director #1618 tightened the earlier source gate to the exact representation primitive rather than the surrounding packet semantics. The frozen target is specifically: five ordered GP29 digits interpreted big-endian as one base-29 integer, the low 24 bits emitted as three bytes, and the quotient above \(2^{24}\) retained as the candidate's one-bit overflow channel. No quintet width, radix, endianness, truncation, or spill variant was admitted.

The bounded 2012–2014 implementation audit found **no exact precedent or directly specified equivalent**.

- The cryptographically valid 2013 TCP specification defines \`BASE29 n\` as a **textual numeral conversion** and gives \`3301 -> 3QO\`; \`RAND n\` separately returns decimal integers in 0–255. A contemporaneous participant Python server preserved from December 2013 implements the same separation: \`handle_base29\` repeatedly takes \`n % 29\`, prepends a character, and integer-divides by 29, while \`RAND\` converts one \`os.urandom(1)\` byte to a decimal string. Cicada's preserved client log actually exercised \`base29 1033\` against that server. Because the signed challenge required each participant to write their own server, this implementation is a useful period control rather than organizer-authored codec evidence. [Protocol source boundary](../resources/external/2013-tcp-server-signed-source.md) · [contemporaneous participant implementation](https://gist.github.com/navinpai/7837596).
- The source-pinned 2014 first-three-page path converts hex to bytes and XORs equal byte positions before verifying the resulting signed message. The archive's implementation is a plain byte-array XOR (Git blob \`10382dfc7908a1732f38ffda39e2ee9e45838821\`); no GP29-to-byte packing intervenes. [Historical chain](../workplace/historical-solve-path-to-original-lp2.md).
- The later recovered 2014 path keeps representations typed: hex is decoded with \`xxd\`, compressed payloads are handled as gzip/bzip2, JPEGs are sliced as byte files, OutGuess extracts payloads, GnuPG verifies/decrypts signed material, and OpenPuff v4.00 extracts a named file from the MP3 carrier. The pinned reconstruction scripts for the third, fourth, and sixth onions have Git blobs \`695fcfec37e939861b55f92f855e49b0cdf57f60\`, \`d455baf99bb04f967ddd6184b817f5e5f853face\`, and \`62c8a249bcc26d57af637d17bd9614531279bd62\`. These scripts are archival solver reconstructions, so they are used only to enumerate the historically attested typed operations. The authenticated Stage04/Stage08 messages themselves likewise specify GP29 Vigenère/text guidance and a GEB book code, not a radix-to-24-bit bridge. [Signed-source gate](cicada2014-stage04-stage08-pgp-original-source-gate.md).

A targeted public-source search for the exact constants or idioms (\`16777216\`, \`0xffffff\`, base29 combined with 24-bit/three-byte packing, or a high spill/carry bit) found no qualifying 2012–2014 Cicada implementation. This is an absence claim only for the bounded surviving corpus above, not proof that no lost private code ever used such a representation.

**Decision:** the strengthened p55 framing calibration from #1617 survives as a source-statistical observation, but the five-rune→low24+overflow serializer remains **historically unselected**. No typed receiver test is justified by #1618. Stop expanding serializer variants unless a new first-party artifact independently fixes the 24-bit width and spill rule.

## Historical framing-precedent gate (18 November 2026, Agent13)

Director #1579 asked whether Cicada itself had previously used the exact semantic pair suggested by the fixed p55 frame: a leading byte echoing an external selector/type/index and a terminal byte encoding total or payload length.

The bounded authenticated/source-pinned 2012-2014 audit is negative. The surviving custom protocols use textual opcodes, status lines, delimiters, named form fields, signed prose, book-code coordinates, or equal-length XOR shares. Binary framing in the historical chain belongs to standard third-party formats including JPEG, OpenPGP, MIDI, RSA/OAEP, bzip2, MP3 and OpenPuff. No recovered Cicada-authored format defines both requested byte roles in one frame.

This removes historical packet-convention support from the p55 interpretation. The calibrated header/footer conjunction remains real at its measured source-statistical scope, while its selector/length semantics remain unexplained.

Full source audit: [`im-results/cicada2012-2014-firstselector-trailinglength-frame-source-gate.md`](cicada2012-2014-firstselector-trailinglength-frame-source-gate.md).

## Matched-null byte-profile classification (18 November 2026, Agent44)

Director #1578 froze five byte diagnostics for the fixed p55 phase1 43-byte interior and evaluated them under the **same 20,000 matched shuffled books and seed `0x1525A25` used by #1525**. Each trial consumes the exact #1525 Fisher-Yates random stream for pp0–54, then shuffles p55 identically, applies the unchanged big-endian 5×GP29→low24 serializer at phase1, and trims exactly one byte from each end. There is no page/phase rescan and no file-type, codec, compression, signature, or language test.

The original 43-byte vector is:

- **41 distinct bytes**;
- **5.333241498888144 bits/byte** empirical Shannon entropy;
- **1** as the longest equal-byte run;
- **17/43** printable ASCII bytes under the frozen range `0x20..0x7e`;
- **0** zero bytes.

The matched-null means are respectively **39.6469**, **5.267157666326**, **1.1505**, **15.07975**, and **0.2035**. Their observed null ranges are 32–43 distinct bytes, 4.897081324419–5.426264754702 bits/byte entropy, run lengths 1–3, 4–27 printable bytes, and 0–3 zero bytes. The original marginal values are ordinary: 6,416/20,000 null interiors have at least 41 distinct bytes, 6,287/20,000 have at least as much entropy, and 6,381/20,000 have at least 17 printable bytes. A longest run of exactly one occurs in **16,999/20,000** null samples and zero zero-bytes occurs in **16,278/20,000**. **268/20,000** null interiors match the complete five-feature vector exactly.

The predeclared correlation-aware joint diagnostic gives original squared Mahalanobis distance **1.3105325346** from the five-feature null centroid. **16,231/20,000 = 0.81155** matched-null samples are at least as distant from that centroid, placing the original near the center rather than in an exceptional tail. This joint calibration is descriptive and does not retrofit another discovery significance claim.

**Decision for #1578:** the fixed interior has an ordinary matched-null byte profile. Its appearance supplies no statistical basis to classify it as readable text, compressed data, ciphertext, a file payload, or any other typed object. Preserve #1525's separately calibrated header/footer framing conjunction at its existing scope, while keeping the choice of a receiver gated on an independent first-party clue. No plaintext, key, address, or authenticated file is recovered.

Reproducer: [`sims/lp2_p55_43byte_profile_null_sft.cjs`](../sims/lp2_p55_43byte_profile_null_sft.cjs).

## Typed-consumer source gate after familywise calibration (18 November 2026, Agent25)

Director #1539 asked whether the calibrated 43-byte interior has one independently selected receiver in the surviving LP2 source context or authenticated 2012–2014 Cicada operations. The audit used the original p54/p55 scans, the authenticated 2013 TCP specification, the authenticated 2014 Stage04 and Stage08 messages, and the reproduced 2014 OpenPuff stage. It stopped at the first missing operand link rather than treating general byte-processing capability as a selector.

The original p54 and p55 scans contain GP29 text, the repeated floral border, p55's tree, and the cicada illustration. They contain no visible byte label, filename, MIME/type marker, network command, key or IV, checksum instruction, or binary receiver attached to the 75-rune body. The floral border is already known to repeat across pp40–55, so its presence does not type the 43-byte interior as a historical data object.

| Authenticated or source-original operation | Historical operand role | Why it does not select the fixed 43 bytes |
| --- | --- | --- |
| 2013 signed `BASE29` | a decimal integer, with the explicit control `3301 -> 3QO` | The packet is an opaque 43-byte string. Converting those bytes to a large decimal integer or another numeral representation would add an unsupplied serialization. |
| 2013 signed DH | modulus/base/public-share arithmetic with participant-selected server values | No p55 source gives a DH modulus, base, secret/public role, reduction convention, or instruction to treat the packet as one of those operands. |
| 2013 signed `NEXT` | participant-supplied text stored by the server | Hex/base64/text encoding of the 43 bytes would be an invented wrapper, and no surviving LP2 endpoint is identified as a `NEXT` receiver. |
| 2014 Stage04 signed text-guided Vigenere | a source-selected GP29 text phrase used as a rune key | The historical receiver is GP29 rune text. No source maps the binary interior into that key role. Direct historical-key reuse on LP2 has already failed independently. |
| 2014 Stage08 signed GEB book code | textual chapter/line/word/letter coordinates | The packet supplies no authenticated book-code syntax or coordinate fields. |
| 2014 OpenPuff v4.00 | a hidden file extracted from selected media carriers under a specified password and bit depth | OpenPuff can process arbitrary file bytes, but the source operation is tied to carrier selection, password and steganographic settings. No LP2 clue assigns the p55 43-byte interior as a carrier, password, extracted file, or settings record. |
| 2014 OutGuess/share XOR precedent | equal-offset bytes from specifically obtained historical shares | Bytewise XOR is authentic Cicada practice, but #1539 excludes the already-tested direct packet XOR family and no independently sourced matching 43-byte share is attached to p55. |

Generic OpenPGP, archive, compression, cipher, file-signature and network parsers were not promoted merely because they accept arbitrary bytes. They fail the issue's source-selection requirement without a source-fixed receiver, key or encoding.

**Decision for #1539:** no qualifying typed consumer is present in this bounded source set. The missing input is now precise: a first-party clue must say what *kind* of object the 43 bytes are, or must name a receiver plus every representation/key/IV parameter needed to consume them. The calibrated framing remains a selective candidate object. This source gate adds no new decoder and recovers no plaintext, key, address or file. Further menus of codecs, hashes, ciphers and signatures remain unjustified until that operand link appears.

## Decipherment decision

The source-determined **75-rune body** and original ornament permit a precise, repeatable **15×5** candidate readout; the 24-bit overflow pattern is an exact original-cipher observation. The later discovery-aware calibration finds the already-reported header+length framing conjunction in only **118/20,000 matched shuffled books (0.0059 familywise)**, while an independent planted packet is recovered exactly. This strengthens the case for preserving the fixed p55 framing as a bounded research object. There is still **no historical instruction selecting 24-bit byte packets**, and the inferred 45 bytes lack an externally authenticated object/operation. Direct native-GP ARC4/additive consumption of the uniquely framed 43-byte candidate has failed under a separately frozen 72-model original-source gate; the direct historical 2013 byte-zero audio XOR gives no readable 43-/45-byte output; and the raw/ASCII-hex 43-byte object fails the direct p56 digest-preimage gate under four 512-bit hash families. The ornament match remains insufficient as a key, plaintext claim or verified hidden file, and phases, byte order, masks and hidden cipher layers should remain frozen absent source evidence.

A bounded source audit under Director #1539 has now checked the original p54/p55 imagery and the authenticated 2013–2014 operation set and found **no operation that types the fixed 43-byte object as its operand**. The unresolved requirement is specific: a first-party clue must identify the object's representation and receiver, including any key/IV/settings needed by that receiver. Until such evidence appears, the calibrated framing stays a selective candidate rather than established binary puzzle data. No unknown plaintext or key is recovered.