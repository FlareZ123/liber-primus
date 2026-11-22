# A frozen offline SKY/UDP candidate using the LP2 table as a payload

**Classification (12 November 2026): exploratory source-constrained continuation hypothesis. The packet serialization is executable, but no historical UDP endpoint, authentic returned response, recovered LP2 plaintext, key, or intended operation has been established.** This tests an application-payload reading that the existing direct-header exclusions did not cover.

## Player-visible independent inputs

1. Original LP2 p3 and p39 have the only isolated three-rune red spans, each at local rune offsets 119–121 and bracketed by original red 13-dot marks. The known, solved-LP1 GP29 Atbash operation `28−rune_index` converts p3 `[13,23,2]` to **SCY**, phonetic **SKY** in GP, and p39 `[27,5,15]` to **UDP**. This reading is provisional: the Atbash instruction is not separately printed next to either triad.
2. A documented, creator-signed January 2013 **“knock on the sky and listen”** hint historically directed players to a **custom ICMP echo responder**. A participant log names `106.187.103.122` as the host then in use. This supplies independent protocol context, while **ICMP is a major counterexample** to assuming a new UDP service. No 2014 sender/receiver IP, port or service is authenticated by this record.
3. LP2 p33–39 depict the repeatedly printed cuneiform numerals **1033** and **3301**; their use as two UDP port integers is a proposed reading. The 2013/2014 archives independently highlight the same numbers as emirp primes and an OpenPuff password pair, so their relevance to the puzzle is documented, but their assignment to network-port roles is conjectural.
4. The original pp49–51 **32×8** numerical table admits the established *conditional* conventional-base60 decoding to exactly **256 application bytes** in printed row-major order, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The 256-byte payload begins `cb e7 a7 ba 61 ed 7e b7`. The source does not instruct transmission, select this payload, or prove that base60 is the intended codec.

## One concrete reversible serialization, entirely offline

Use a standard eight-byte IPv4 UDP header, keep the 256 printed bytes untouched as the **UDP application payload**, and test only the two source-provided port orderings. The historical p39 **UDP** clue motivates this packet family, but the header configuration is a proposed model.

| Source port | Destination port | Header, hex | Payload bytes | Full UDP length |
| ---: | ---: | --- | ---: | ---: |
| 1033 | 3301 | `04090ce501080000` | 256 | **264** |
| 3301 | 1033 | `0ce5040901080000` | 256 | **264** |

Field order is `source_port16 || destination_port16 || length16 || checksum16`, network byte order; length `0x0108 = 264`. The zero checksum is allowed in **IPv4 UDP**; a nonzero checksum would additionally require a specified source and destination IPv4 address. The suggested 2013 SKY host cannot safely be adopted as a 2014 authenticated destination merely because its earlier ICMP service is documented. The model deliberately sends **zero packets**.

This is different from the existing **direct raw-table-as-packet** and **76-cell perimeter-as-packet** experiments. In the former, raw bytes 4–5 imply UDP length `25069`, inconsistent with the raw 256-byte buffer; in the latter all eight fixed perimeter traversals also fail the mandatory header length. Framing the same 256 bytes **as the payload** instead produces a structurally valid 264-byte datagram by construction. Such validity is a basic syntax result and contains **no discrimination against arbitrary random 256-byte payloads**. It is not evidence of cryptographic recovery.

### Competing 2014 endpoint lead from independent Agent19 archive audit

A separate 12 November 2026 source audit by Agent19 located a *distinct* 2014 candidate: the original fourth-onion OutGuess tail **9133** was historically considered as a network port, and a third-onion server-status leak identifies **`106.186.123.224`** as the then-host. A preserved 2014 community transcript says investigators tried connecting to port **9133/3319** and saw no response, while questioning whether the values represented real ports. That historical attempt apparently concerned an onion/TCP or HTTP path; the preserved record contains **no original UDP instruction, UDP response or packet capture**. [Agent19 historical lead](../communications/agent3/20261112T155531Z_agent19_2014-port-crosslink.md).

This dated 2014 `9133` lead is an alternative to both cuneiform-derived `1033/3301` port assignments. Source-port choice remains undetermined for any proposed UDP request. It would be misleading to call any of the three possibilities an authenticated socket address, or to send datagrams to a 2014 IP which may now belong to someone else. No further header variants were run without a source discriminator.

## Falsifiable source gate and next decision

A pinned **54,969,358-byte** archive scan of five contemporary IRC channels found no author-attributable UDP command, data framing, or returned message. The historical 2014 UDP anecdotes concern NTP/123 on the leaked Linode host, Viber's 5243/9785 ports, unsuccessful guesses about 9133/3319, and later unrelated speculation. The [bounded dated source audit](../im-results/lp2-red119-dated-udp-packet-source-audit.md) and [manual original-byte run](https://github.com/FlareZ123/liber-primus/actions/runs/43256420048) preserve exact evidence. This makes the historical socket/payload link **less supported**, while leaving absent private instructions an unknown.

A positive handoff would require an independently preserved 2014 creator-attributable instruction or actual archived network trace identifying an **IPv4 UDP receiver, port and message framing** consistent with the two frozen variants, plus an independently corroborated response, signed instruction or reversible LP2 plaintext extraction. A historical captured response should be validated as source bytes with timestamp and signature where possible. An original ciphertext prediction should be held out from any key/packet design.

A negative to the present candidate would be an authoritative period source explicitly selecting ICMP/TCP only for the putative continuation, or a trusted UDP trace showing different port/payload framing. Mere lack of live service in 2026 is not a cryptanalytic negative.

**Decision:** retain the compact, reproducible offline package without launching port scans, network transmission, speculative packet headers, AES key sweeps or endpoint guesses. There is still no historical key, LP2 plaintext or authenticated destination. The contribution is a precise testable candidate for *one missing transport handoff*, useful only if new independent historical material emerges.

**Executable verification:** The frozen original-source SFT succeeded as the only selected job in [manual GitHub Actions run 43253609500](https://github.com/FlareZ123/liber-primus/actions/runs/43253609500), Node 22, with all positive/negative assertions passing. This validates the byte and packet construction, not authorial intent or the hypothesis's cryptographic usefulness.

Reproducer: [`sims/lp2_red119_udp_payload_candidate_sft.cjs`](../sims/lp2_red119_udp_payload_candidate_sft.cjs). It checks the original triad indices/Atbash, source table dimensions and SHA-256, the direct raw-header failure, the exact two payload envelopes, reversibility and a deliberately corrupted-length negative control. Earlier source work: [SCY/UDP red-fragment analysis](../im-results/lp2-p3-p39-red119-atbash-sky-udp.md), [76-cell direct-header exclusion](../im-results/lp2-red119-udp-grid-ring-header-gate.md), [2013 ICMP archive](../im-results/2013-icmp-echo-packet-reconstruction.md), [1033/3301 historical operator chain](../resources/external/1033-3301-historical-operator-chain.json).
