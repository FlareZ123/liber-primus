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

The paired `SCY/UDP` makes an unusually specific original-source hypothesis: a returning 2014 solver might apply the previously learned Atbash to exceptionally marked red triplets, recognize the earlier sky clue and consider a different packet transport. However, neither fragment supplies the required **IP/hostname, port, message payload, return framing, date of live infrastructure, or a GP29 cipher inverse**. The 2013 participant-documented server address does not establish a 2014 live listener. Sending a UDP packet to an ordinary Tor onion is also not a supported direct transport, so a viable proposal must identify an actual period-available network endpoint instead of assuming the historical onion accepted UDP.

## Held-out red-ink control: Atbash does not decode arbitrary red spans

Applying the same frozen GP29 Atbash to other source-visible red fragments does **not** recover ordinary headings. For example, the original p0 red13 heading becomes `PLIAEOENUEAPTHIWD`, the p3 initial red16 becomes `HBTLWDYEOOBEOXLEOIAG`, and p33 red10 becomes `CTXDEAERNGLOE`. Most decisively, the **genuinely solved p57 red heading** spells `PARABLE` directly; applying Atbash would corrupt it to `SRARJHI`. The SFT asserts this solved-page negative control.

**Interpretation:** The hypothesis must be restricted to the uniquely paired, 13-dot-bracketed, length-three red spans on p3/p39. The red ink in general is not an Atbash instruction, and it does not license applying Atbash to every other unsolved rubric. This narrow selection is externally observable before decryption but still lacks proof of author intent.

## The strongest counterexplanation and decision gate

Two three-letter outputs are short enough to invite post-hoc semantics. `SCY` requires the conventional C/K phonetic normalization; `UDP` is a common internet acronym, and neither fragment includes the word `SEND`, `PORT`, an address or a separate 2014 source instruction selecting this Atbash application. It is possible that both are encrypted decorative rubrics and their matching offset119 is ordinary page composition. Statistical language hits would be unconvincing when selected after seeing the outputs.

A **decisive next step** is to locate an independently archived **2014-author-attributable** pointer that selects UDP and fixes a destination and port, or a later Cicada-authenticated historical artifact that explicitly consumes `SCY`/`UDP`, the two offsets119, or their original rune positions. A useful affirmative result must supply a reproducible new message, keyed operation or unknown-page plaintext; a three-letter interpretation alone stays provisional. Do **not** spray UDP probes at stale IPs, sweep ports, or search guessed address encodings to force a hit.

**Current conclusion:** the exact Atbash conversion and matched page structure are established. Their intentional status is unresolved; the documented 2013 ICMP operation is a competing explanation and constrains any claimed UDP continuation. No complete LP2 section has been decrypted by this test.

### Source pointers

- [Original 58-page rune corpus](../resources/liber-primus/lp2-corpus.json) and [rune/ink source annotations](../resources/liber-primus/lp2-ink-annotations.json), pinned to scan order.
- [Signed January 2013 sky hint and reconstructed ICMP episode](2013-icmp-echo-packet-reconstruction.md), [pklmx chronology caveat](pklmx-2013-onion-continuation-gate.md).
- [Historical 2013 BASE29/TCP signed source](../resources/external/2013-tcp-server-signed-source.md).
- [Source-exact red119 Atbash SFT](../sims/lp2_p3_p39_red119_atbash_sft.cjs).
