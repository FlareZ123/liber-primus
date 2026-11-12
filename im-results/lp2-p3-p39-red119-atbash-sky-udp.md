# Two source-matched LP2 red119 triads under solved GP29 Atbash: SCY / UDP

**Status (12 November 2026, Agent3): exact original-image/text observation with a historically motivated but unconfirmed meaning.** This is the first bounded test of the two complete, isolated red three-rune spans as a pair. It yields a six-rune candidate clue, **not authenticated unknown-page plaintext, an original-cipher inverse, an identified endpoint, or a solution to an unknown chapter**.

## Source-visible selection, with no fitted rune offsets

The [original LP2 ink annotations](../resources/liber-primus/lp2-ink-annotations.json) encode **18 isolated red spans** across all 58 physical pages. Only **two** spans contain exactly three GP runes, on physical LP2 **p3** and **p39**. Both occur after exactly **119 preceding page-local rune positions**, at zero-based offset119, and both are bracketed by red 13-dot punctuation immediately before offset119 and after offset122. Original images are archival scans `20.jpg` (p3) and `56.jpg` (p39). The [canonical corpus](../resources/liber-primus/lp2-corpus.json) fixes the GP29 symbol indexes.

| Physical page | Red original runes | GP29 indexes | Original transliteration | Atbash `28−index` | Atbash GP text |
| --- | --- | --- | --- | --- | --- |
| p3:119–121 | `ᛈᛞᚦ` | `[13,23,2]` | `PDTH` | `[15,5,26]` | **`SCY`** |
| p39:119–121 | `ᛡᚳᛋ` | `[27,5,15]` | `IACS` | `[1,23,13]` | **`UDP`** |

The single operation is the **GP29 Atbash** `Pᵢ = 28 − Cᵢ` used in Cicada's independently solved LP1 `A WARNING`; it is an exact involution without key, alphabet reorder, language-model score, phase, or symbol substitution. Because Gematria Primus has a rune transliterated `C` for both conventional English C and K, `SCY` has the plausible English spelling **SKY**. `UDP` needs no such normalization.

The two fragments were selected **only** by their already-defined original red-ink and punctuation boundaries. The repeated offset119 was not searched or aligned after seeing output. The source-exact test asserts the two spans, offsets, red13 brackets, GP indexes and exact reversible Atbash: [CommonJS SFT](../sims/lp2_p3_p39_red119_atbash_sft.cjs).

## Human-solve-path hypothesis and independent historical anchor

The [original reconstructed signed 2013 second-onion clue](2013-icmp-echo-packet-reconstruction.md) says that sometimes one must **knock on the sky and listen to the sound**. It is signed at 2013-01-14 05:31:07 UTC, prior to Liber Primus's 2014 release. This supplies genuinely independent earlier creator-side **SKY** wording; it does not authenticate the proposed **Atbash** red readout. In that historical 2013 chain, the successful player operation was **ICMP echo**, which recovered a signed message naming another onion; **UDP did not implement the documented solve**. Cicada also used a separate authenticated **TCP** server challenge in 2013, showing protocol vocabulary was in-period.

One immediate candidate readout **does fail** without any guesswork: the complete original pp49–51 **256-byte base60 table**, interpreted in source order as a raw UDP datagram, has the 16-bit network-order UDP length field (bytes 4–5) equal to **25069**, whereas the complete datagram is only **256 bytes**. The header's source/destination ports would be 52199 and 42938. Thus these bytes are **not a complete standard UDP packet** in printed order. Treating the table as a *payload*, as encrypted data, or under a new framing would require a separate historical clue; no viable datagram has been reconstructed. This gate is conditional on the base60 byte parse.

The paired `SCY/UDP` makes an unusually specific original-source hypothesis: a returning 2014 solver might apply the previously learned Atbash to exceptionally marked red triplets, recognize the earlier sky clue and consider a different packet transport. At the time of this report, neither fragment supplied a destination. A later p56 factorization yields a candidate IP/port and p55-length UDP packet shape (128.118.244.163:281/UDP; 76-byte page-local BASE29 body; 84-byte datagram), but this is an unverified structural hypothesis, not an authenticated endpoint, live service, packet trace, or GP29 inverse. See p56-factorization-udp-endpoint-hypothesis.md. No network traffic was sent. Direct repeating-key and eight-byte-row UDP-header tests below also fail. The 2013 participant-documented server address does not establish a 2014 live listener. Sending a UDP packet to an ordinary Tor onion is also not a supported direct transport, so a viable proposal must identify an actual period-available network endpoint instead of assuming the historical onion accepted UDP.

## Two 119-rune prefixes as literal GP29-to-UDP datagrams (Agent11, 12 November 2026)

The two red119 markers each select the **entire 119-rune prefix immediately before** the isolated SKY/UDP fragment. This differs from the pp49–51 numeric-table UDP-header tests above. A finite natural hypothesis treats GP29 ordinal indices as base29 digits in printed order, forms one big-endian integer per prefix and serializes each into the minimum-width 73-byte big-endian string. The authenticated 2013 BASE29 service establishes a radix operation, but **does not** establish that its ASCII numeric alphabet is interchangeable with GP29 rune indices or that either prefix carries network bytes.

A literal IPv4 UDP datagram with 73 total bytes must declare **73** at header bytes 4–5. The original prefixes both produce 73 bytes, but the resulting header fields are:

| Original prefix | First 16 bytes (hex) | Source port | Destination port | Declared UDP length | Result |
| --- | --- | ---: | ---: | ---: | --- |
| p3:0–118 | 0303a98d2c66cbccb9b60e3ccd98a316 | 771 | 43405 | **11366** | Invalid for 73 bytes |
| p39:0–118 | 0240ce33c8df038466b845ff5da9e9ab | 576 | 52787 | **51423** | Invalid for 73 bytes |

Thus neither **direct** base29-prefix readout is a complete literal standard UDP datagram. The [original-corpus SFT](../sims/lp2_red119_base29_direct_udp_sft.cjs) tests both exact inputs, integer-to-rune reversibility, the byte headers, a syntactically correct 119-digit / 73-byte planted packet and a corrupted-length control. This excludes only the frozen GP29-ordinal, forward, big-endian, minimum-width **direct UDP-header** interpretation, without proving that SKY/UDP specifies packets or ruling out an independently encoded payload. The p3 prefix itself includes a separate red heading and is not marked as an isolated binary field.

## Source-fixed consumers of the paired triads (Agent18, 12 November 2026)

A separate, bounded original-cipher check treats the source-extracted Atbash readouts **SCY** and **UDP** as possible three-rune repeating Vigenère keys for the respective **black passage immediately after** each red triad and its closing red13 mark. All three positions, the phase-zero start at local offset122, and the historically demonstrated mod29 additive operation are fixed from sources. The historical literal-F pass-through / no-key-consumption variant is tested separately. A combined **SCYUDP** six-rune periodic key is also tested on all 12,956 unsolved LP2 runes in physical source order, with no phase, case, period, or skip-rule search. These are candidate consumers, since no original instruction explicitly says to use the two red words as cipher keys.

| Passage | Source length | No-skip C−K IoC | No-skip C+K IoC | Literal-F-transparent C−K IoC |
| --- | ---: | ---: | ---: | ---: |
| p3 following red triad | 95 runes | **0.03874580** | 0.03426652 | 0.03516237 |
| p39 following red triad | 118 runes | **0.03882370** | 0.03636100 | 0.03447776 |
| Entire unsolved LP2, key SCYUDP | 12,956 runes | **0.03450439** | 0.03448884 | 0.03580708 |

The p3 source's **first complete three-rune black word** is EO-D-EO. Under the direct no-skip C−SCY inverse it becomes **YES**, a short candidate that must not be treated as established plaintext: its following source words become **ISH, EOW, THOE, ...**, and the full passage remains random-like. With literal-F interruption the subsequent text also fails to turn linguistic. The p39 following passage with key UDP starts **EOFTHY, UDSJDNG, AEDNDI, ...** under C−K. The six-rune key on the full book remains near 1/29 IoC (raw 0.03447840). Its literal-F-transparent result has IoC 0.03580708–0.03610812, with 458 ciphertext F runes passed through; this statistic is partly elevated by that fixed F mass and is not evidence of English plaintext. No independent recovered phrase, key schedule or continuation follows from the p3 one-word fit.

The original **32×8** pp49–51 numerical table supplies a second strictly source-shaped test: eight bytes is exactly the length of a standard UDP header. Under the previously documented *conditional* conventional base60 byte mapping, none of the **32 printed eight-byte rows** can be a complete, header-only UDP packet: the declared UDP lengths (network-order row bytes 4–5) range from **3,348 to 63,236 bytes**, with **zero** length-eight headers. The port fields contain neither source-visible cuneiform number **1033** nor **3301** in any row, and the source-documented 2013 “sky” host IPv4 address **106.187.103.122** does not appear as four contiguous table bytes. This only rejects a direct literal UDP-header or directly embedded historical-host interpretation. It does not rule out a separately encrypted/encoded payload, a missing historical endpoint or an actual UDP transport chosen by another source.

All original-input assertions, complete-segment IoCs, direct header lengths, and first-three-rune result are in the [one-file CommonJS reproducer](../sims/lp2_red119_skyudp_source_consumers_sft.cjs). These negatives constrain the direct consumers of an unusually source-specified red pair; they do not diminish the exact source placement or prove whether the SKY/UDP clue was intended.

## Original-punctuation completion gate: no longer local instruction (Agent12, 12 November 2026)

**Director #588 decision.** The two original scans, `resources/liber-primus/20.jpg` and `56.jpg`, independently show a red 13-dot break immediately *before* the three-red-rune heading and a second red 13-dot break immediately *after* it. Freeze the complete bracket as page-local **[119,122)** on each physical page. The printed full-page word segmentation and independent canonical GP29 corpus agree at **all 217 p3 and 240 p39 rune positions**. The enclosed passage consists of exactly one three-rune word on both pages: no black word, extra rune or second red word lies between the two marks. There is therefore no additional complete instruction available by extending the existing **source-enclosed** Atbash readout.

| Original page | Complete red13 enclosure | Immediate previous black word, **outside** enclosure, under Atbash | Immediate following black word, **outside** enclosure, under Atbash |
| --- | --- | --- | --- |
| p3 | `ᛈᛞᚦ` → **SCY** (SKY) | `ᛞᛠᛖᛡᚾᛏ` → `CFIUMEO` | `ᛇᛞᛇ` → `TCT` |
| p39 | `ᛡᚳᛋ` → **UDP** | `ᛗᛋᚹᛟᚻ` → `NPNGGL` | `ᛈᛞᛋᛡ` → `SCPU` |

These adjacent words are the **one** mechanically defined immediate-word extension on either side, reported as a diagnostic, not added to the red-marked ciphertext. Their fixed Atbash outputs give no full grammatical command or cryptographic operation, and the closest black words are independently separated by visible red13 marks. p3 also has its separate red16 heading at offset0 and its earlier red13 break at offset16; its enclosing prefix is structurally different from the all-black p39 prefix. Neither manuscript image selects an alternative pair of extended boundaries or licenses arbitrary flank sizes.

The [single-file bracket-boundary reproducer](../sims/lp2_red119_bracket_boundary_sft.cjs) fixes both source intervals and immediate printed words; asserts corpus/transcription equality, source red13 markers, zero additional enclosed words, both unchanged GP29 Atbash fragments, and solved-p57 `PARABLE` as a counterexample to general red-ink Atbash. This **closes the strictly local instruction-extension route**. Recovering a host, port, packet payload or third-passage cipher from SKY/UDP now requires an independent original/author-authenticated selector; no free-radius or free-shift flanking search is justified. The 2013 ICMP historical comparison and other bounded consumers in this report remain unchanged.

## Shared-pad interpretation of the two 119-rune prefixes

The two source-selected red triads each follow a complete 119-rune printed-word passage. An independent [exact dictionary-product inverse](lp2-p3-p39-red119-sharedpad-wordgrammar.md) now tests whether those two passages reused any common additive GP29 pad, granting its entire 119-symbol key to remain unknown. Using **32,081** GP-normalized English lexical forms from Shakespeare, Gibran, Emerson, and the TextBlob spelling lexicon, the complete word-preserving common-pad pair becomes algebraically incompatible with the source by original rune **11** (both forward) or **6** (second passage mirrored). Entire 119-rune native positive plants succeed in each reading. This is an all-pad *dictionary-and-original-boundary* exclusion, not a general rejection of layered encryption or of the red triads as clues; the operation and English plaintext assumption were never authenticated by the author.

## Fixed red119 Vigenère autokey continuation (Agent 32, 12 November 2026)

The uniquely bracketed three-rune red source spans on p3/p39 yield the existing Atbash clue candidates **SCY** and **UDP**. An additional historically recognizable, source-fixed operation is to seed a three-rune Vigenère autokey with each clue and read the black text immediately after its closing red13 bracket (local122). Both plaintext- and ciphertext-feedback autokey, with either modular addition or subtraction, are reversible candidates. These eight complete outputs use the unmodified 95 p3 and 118 p39 runes with no phase, skip or key search.

| Original paragraph | Raw IoC | Plaintext autokey subtract / add | Ciphertext autokey subtract / add |
| --- | ---: | ---: | ---: |
| p3:122–216, 95 runes | 0.033595 | **0.031131 / 0.038522** | **0.034267 / 0.033371** |
| p39:122–239, 118 runes | 0.036071 | **0.035202 / 0.035637** | **0.033029 / 0.040127** |

The p3 first three decrypted runes spell **YES** under subtraction, confirming the earlier short fit, but plaintext autokey continues `YESEATHMEAINNYIBCLLJJPYI...` and ciphertext autokey continues `YESPYOETHNGDIALEAJJXUAE...`. The p39 subtractive versions begin `EOFTHSACUITHNGNCEH...` and `EOFTHXUNGEIFGXFB...`. The complete eight source-conditioned outputs remain nonlinguistic. As exact positive controls, eight ciphertext streams independently produced by autokey-enciphering the original solved-p57 passage all decode back to **95/95** authentic runes. The expanded [original-source SFT](../sims/lp2_red119_skyudp_source_consumers_sft.cjs) reproduces every variant. This retires this narrowly specified use of the two red triplets, without interpreting `YES` as recovered original plaintext.

## Held-out red-ink control: Atbash does not decode arbitrary red spans

Applying the same frozen GP29 Atbash to other source-visible red fragments does **not** recover ordinary headings. For example, the original p0 red13 heading becomes `PLIAEOENUEAPTHIWD`, the p3 initial red16 becomes `HBTLWDYEOOBEOXLEOIAG`, and p33 red10 becomes `CTXDEAERNGLOE`. Most decisively, the **genuinely solved p57 red heading** spells `PARABLE` directly; applying Atbash would corrupt it to `SRARJHI`. The SFT asserts this solved-page negative control.

**Interpretation:** The hypothesis must be restricted to the uniquely paired, 13-dot-bracketed, length-three red spans on p3/p39. The red ink in general is not an Atbash instruction, and it does not license applying Atbash to every other unsolved rubric. This narrow selection is externally observable before decryption but still lacks proof of author intent.

## The strongest counterexplanation and decision gate

Two three-letter outputs are short enough to invite post-hoc semantics. `SCY` requires the conventional C/K phonetic normalization; `UDP` is a common internet acronym, and neither fragment includes the word `SEND`, `PORT`, an address or a separate 2014 source instruction selecting this Atbash application. It is possible that both are encrypted decorative rubrics and their matching offset119 is ordinary page composition. Statistical language hits would be unconvincing when selected after seeing the outputs.

The [bounded historical packet-source audit](lp2-red119-dated-udp-packet-source-audit.md) has now searched **five Git-blob-pinned original 2014–2016 IRC files, 54,969,358 bytes / 707,345 lines**, finding no author-attributable UDP instruction, receiver or LP2 datagram response. Its apparent UDP references are ordinary NTP, Viber, unrelated SSH/113 confusion or speculative discussion; 9133/3319 were guessed unsuccessfully as ports. The **remaining decisive missing input** is an independently archived **2014-author-attributable** instruction that actually selects UDP and fixes a destination, port and original payload, or a later signed Cicada artifact that consumes the source fragments. A useful affirmative result must supply a reproducible new message, keyed operation or unknown-page plaintext; a three-letter interpretation alone stays provisional. Do **not** spray UDP probes at stale IPs, sweep ports, or search guessed address encodings to force a hit.

**Current conclusion:** the exact Atbash conversion and matched page structure are established. Their intentional status is unresolved; the documented 2013 ICMP operation is a competing explanation and constrains any claimed UDP continuation. No complete LP2 section has been decrypted by this test.

### Source pointers

- [Original 58-page rune corpus](../resources/liber-primus/lp2-corpus.json) and [rune/ink source annotations](../resources/liber-primus/lp2-ink-annotations.json), pinned to scan order.
- [Signed January 2013 sky hint and reconstructed ICMP episode](2013-icmp-echo-packet-reconstruction.md), [pklmx chronology caveat](pklmx-2013-onion-continuation-gate.md).
- [Historical 2013 BASE29/TCP signed source](../resources/external/2013-tcp-server-signed-source.md).
- [Source-exact red119 Atbash SFT](../sims/lp2_p3_p39_red119_atbash_sft.cjs).
