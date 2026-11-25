# Recovered signed 2013 TCP-server challenge

**Classification:** authenticated historical protocol specification; not an LP2 decryption, key, or continuation.

## Artifact and provenance

The recovered artifact is the file [messages/2013/tcp-server.asc](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/tcp-server.asc), pinned to archive commit 27309e66746e21542f2b908d7f60b906915fe7c6 (2025-01-20, “feat: add tcp server signed message (#132)”). The archive's companion [2013 TCP-server note](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/other/2013_TCP_Server.md) describes it as the Cicada message decrypted from its original encryption while retaining the inline signature. The original encrypted email envelope and mail headers are not preserved; the signed message content and signature are.

- Raw artifact: [pinned raw file](https://raw.githubusercontent.com/iBotPeaches/cicada_3301/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/tcp-server.asc)
- SHA-256: fdfe1208b49f75ce634224d2b0561e4c8b322f27dd74bd757f5d83ebcfbdb88c
- Embedded signature timestamp: **2013-01-26 09:16:23 UTC**
- Signing key ID: 181F01E57A35090F
- Full fingerprint: 6D854CD7933322A601C3286D181F01E57A35090F
- Verification key: [repository Cicada public key](../control/cicada-3301-public-key.asc)

The local GnuPG check returned **Good signature** and **VALIDSIG** for the full fingerprint above. The independent [signature-timeline archive](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json) independently records the same artifact hash, timestamp, key ID, and VALID status. Packet inspection shows a one-pass signature, compressed literal data, and signature packet, with no encrypted-data packet: this archived file is the decrypted signed payload, not the original encrypted envelope. GnuPG's owner-trust display is [unknown]; the claim here is cryptographic validity under the established Cicada key fingerprint, not a new third-party identity certification.

The artifact was added to the public archive in 2025, not contemporaneously. Its embedded 2013 signature and the independent 16-Feb-2013 [Twisted-Python witness](https://twisted.org/pipermail/twisted-python/2013-February/059021.html), which reproduces the challenge text, provide the historical dating and corroboration.

## What the signed text establishes

The signed challenge directs the recipient to build a TCP server and specifies the commands RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, and GOODBYE. It includes:

- BASE29 3301 → 3QO;
- a worked DH 23 exchange: server base 5 and public share 8, client public share 19, shared key 2;
- the DH role split: the participant server selects its own base and secret integer for each request; the client supplies its public share; the server returns the shared value;
- NEXT as client-supplied text for the server to store. The server does not calculate or choose the next instruction.

## Alternative teaching-source provenance for the DH23 worked example (date not independently verified)

A surviving Cibertec cryptography course-deck copy carries a self-reported date of **17 April 2012** and prints `p=23`, `g=5`, private exponents `a=6` and `b=15`, public values `8` and `19`, and shared result `2`: https://aulavirtualsi.cibertec.edu.pe/aula_virtual/DocumentosC/21247520120516163518.pdf

I found no independent timestamped archive or authenticated publication record for the deck's date. Treat it as a plausible non-Cicada teaching-source analogue, not proof that the tuple predates Cicada's January 2013 signature. The 2013 challenge independently establishes that Cicada showed participants the tuple; its protocol role split still makes the DH base and private exponent participant-selected, so the worked example is not an organizer-selected LP2 key. Any LP2 route that reconstructs it must seek separate evidence for a cross-year Cicada handoff. The same date qualification is carried into the [current results synthesis](../../results/README.md) and [design profile](../../im-results/cicada-authenticated-solvepath-operation-contracts-2012-2016.md).

**CODE/QUINE/KOAN are participant-output tests, without a common LP2 key.** The original specification requires `CODE` to return the participant's own server code; `QUINE` to return any quine in the chosen language; and `KOAN` to return a participant-selected koan. Each response is participant-supplied text framed by `01 OK` and a terminal dot, with no source-authored reversible cipher. The January 26 participant transcript below includes a `CODE` call and the returned Python2 handler; the [March 3 capture](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/clientlog-1362290293-9.txt) records the participant's Python quine and four identical participant-authored prime koans, but no CODE call. These outputs provide neither a shared key nor a source-selected original-LP2 inverse; see [closed decision #199](https://github.com/FlareZ123/liber-primus/issues/199).

The signed challenge contains **no NUMBER, PRIMES, or COUNT command**. It authenticates the BASE29/DH/NEXT protocol, not the separate first-onion number-service grammar reconstructed from later participant material.

## January 2013 participant BASE29 witness (26 January)

The pinned [participant-server clientlog](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/clientlog-1359239635-3.txt) records `BASE29 30` at `2013-01-26 22:35:23.884 UTC` and response `01 OK 11` one millisecond later. The same session's `CODE` request returns the participant's Python2 server source. Its `handle_base29` parses `int(parts[1])`, repeatedly prepends the character at `n % 29` from `0123456789ABCDEFGHIJKLMNOPQRSTUVXYZ`, divides by 29 while `n > 0`, and returns `0` when the output is empty. Since the modulus is 29, only the first 29 characters are reachable: `0123456789ABCDEFGHIJKLMNOPQRS`, matching the signed challenge's effective alphabet.

The `30 → 11` response is an additional contemporaneous positive-input witness and is discriminating: a fixed three-character field would have produced `011`, while the recorded output is the minimal two-character representation. The returned handler also discards input leading zeros through integer parsing and maps zero and negative values to `0`; those are details/bugs of this participant implementation, not authenticated official semantics. The transcript and returned CODE text are not OpenPGP-signed as a whole and do not authenticate the remote client's identity. Archive record: `irc-logs/clientlog-1359239635-3.txt`, 18,221 bytes, Git blob SHA-1 `db9c74299aa61ba14ef5367d45384d32fc936aa3`; log range `2013-01-26 22:33:55.757`–`22:36:44.288 UTC`.

## March 2013 participant-log cross-check

The pinned [participant server transcript](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/clientlog-1362290293-9.txt) records `BASE29 1033` → `16I` and a DH 3301 request with participant-server base 2757, server secret 331, server public share 1264, client public share 2800, and returned shared value 1067. Under the signed protocol, the server base and secret are participant randomness, not organizer-fixed key material. The client public share fixes e ≡ 11 (mod 550), leaving six ordinary-range representatives: 11, 561, 1111, 1661, 2211, 2761.

The log's `received1.txt` NEXT payload is the text of the separately archived [`do-not-share-this-information-2.asc`](https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/messages/2013/do-not-share-this-information-2.asc). The signed upstream artifact is 3,182 bytes (LF) with SHA-256 `062886c6063b5c9c3049cf67dd9837df75bdd54d8fa73cb1b5fe25d52d227e87`; its OpenPGP signature is **VALID** under the same key, dated **2013-03-03 05:33:01 UTC**. The participant `received1.txt` copy is 3,249 bytes (CRLF), SHA-256 `c11503b04c26edd77114a79794a4b4a1c5af77cef53a07a2b672dc7e85abb768`; after line-ending normalization it matches the signed text with one extra terminal blank line. The second participant copy `2013/008-invitation/rn4gTF1Z` is byte-identical to `received1.txt` (same SHA-1 and SHA-256). This authenticates the embedded NEXT payload only; it does **not** sign the surrounding DH exchange or the participant log as a whole.


## Actual rejected-input witnesses: the complete ten clientlog files (#2793, 25 November 2026)

Inspected all ten archived participant-side `clientlog-*.txt` files in [the pinned archive's IRC directory](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs), suffixes 0 through 9. Counted only actual logged request and reply lines, not strings returned inside CODE's source listing. The 11 plain target-command requests were two BASE29 successes, five KOAN successes, three DH successes and one DH rejection. Ten actual error replies across all commands were 5 “No such command”, 4 “No command specified” and 1 “Invalid parameters”; no “Not an integer” live reply. No malformed BASE29 operand, extra KOAN operand or alternative numeric radix is paired with an accepted correction in these files.

The closest failure/correction records are:

- [Jan26 session 3, lines 2–3 and 26–31](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/clientlog-1359239635-3.txt#L2-L31), blob `db9c74299aa61ba14ef5367d45384d32fc936aa3`: at 22:34:26.818 the first attempted DH line has Telnet negotiation bytes preceding a bare `DH ` and returns `02 No such command`. At 22:35:47.064 a plain `DH 5` returns `01 OK 3 2`, followed at 22:36:09 by a bare client value 3 and `03 DATA 2`. This is a transport/command-framing contrast, not a one-variable test of operand radix or count semantics: both the prefix bytes and missing argument change.
- [Mar3 session 9, lines 62–66 and 137–142](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/clientlog-1362290293-9.txt#L137-L142), blob `02b25b72a183b8e83ef6876de69eb64218190846`: `DH 3301` succeeded at 05:59:34.745; the later exact argumentless `DH` at 06:01:07.035 receives `02 Invalid parameters`. It is followed by rejected QUIT and accepted GOODBYE, not a corrected DH invocation. This is a clean accepted/rejected arity contrast and confirms the signed specification's required modulus argument, but it occurs in the reverse temporal order and distinguishes no alternate numerical representation.
- [Jan26 session 2, lines 2–8](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/clientlog-1359224026-2.txt#L2-L8), blob `8c0a93d7d620c35805d9be71206d593df8e15dca`: a plain `dh 118818811` is accepted, then a bare client value 123 receives a DATA response. 118818811 is prime (local exact primality test). The subsequent error is for an unrelated unrecognized command, not a rejected DH modulus. The three observed accepted moduli 5,3301,118818811 are all prime; these observations cannot establish that composites are rejected. The returned Jan26 participant implementation parses an integer but does not test primality before proceeding; distinguish that source-code behavior from the signed prime-modulus requirement and actual recorded input.

The exact missing discriminator is a recorded *same-command* rejected numeric operand (for example, a nondecimal BASE29 argument or nonprime DH modulus) followed by acceptance of its controlled correction, or a documented KOAN argument contrast. The available failure cases establish transport, missing-token handling and unrelated unknown commands only. The 2013 public Gist found by #2556 contains implementation error branches, not such live request/response pairs. This bounded archive audit is not a claim that all surviving public 2013 conversations were searched or that no other private transcript exists.

**Decision:** no new LP2 operand type or numeric receiver follows. The p33 1033/3301 numerals are compatible with the already authenticated modulus/integer domains but do not specify a new command, private state or reversible operation. Do not repeat the p33 five-stage transfer or select a new numerical object on these transport errors. Retire #2793 under its missing-discriminator branch; no cipher fit, destination query or live-service interaction was performed.

## Companion variant and the meaning of “-2”

The suffix does **not** imply a missing `-1` message. The pinned [iBotPeaches 2013 message directory](https://github.com/iBotPeaches/cicada_3301/tree/a0a616d85717af59f8b806875b43d51e06e1e874/messages/2013) contains both the unnumbered [`do-not-share-this-information.asc`](https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/messages/2013/do-not-share-this-information.asc) and [`do-not-share-this-information-2.asc`](https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/messages/2013/do-not-share-this-information-2.asc). No `do-not-share-this-information-1.asc` was found in the pinned iBotPeaches, neuroretransmit, Dukotah, pnotisdev, krisyotam, or cicada-solvers repositories searched.

The independent [Dukotah signature inventory](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/A-primary-artifacts/SIGNATURES.json), [signature timeline](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json), and [GnuPG verification log](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/A-primary-artifacts/_logs/verify_sigs_run4.log) record both as **VALID**, 3,182 bytes each, signed by fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`:
| Variant | Signature time (UTC) | SHA-256 | OpenPGP signature ID |
|---|---|---|---|
| Unnumbered `do-not-share-this-information.asc` | 2013-03-03 05:32:58 | `3ffe85bf53315766b0f3172be9df795ced8813728767fb5ce02020a3b9bdfa0f` | `VCI/gm0W7bSuBVg+TzuUd4psXM4` |
| `do-not-share-this-information-2.asc` | 2013-03-03 05:33:01 | `062886c6063b5c9c3049cf67dd9837df75bdd54d8fa73cb1b5fe25d52d227e87` | `nxHaFaLu8oRg58znlpzzIY4rF9w` |

The signed bodies differ in two small typographic choices and no new instruction:
- `Congratulations.` versus `Congratulations!`;
- double versus single quotation marks around `hacker` and `warez`.

The participant archive's [`2013/008-invitation/invitation.asc`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/008-invitation/invitation.asc) is the unnumbered variant after CRLF conversion and removal of one final newline (3,245 bytes; SHA-256 `bd0022edb38c12647558fb3aa40a0aba4e640402c8035385f505748fa633505d`). The `received1.txt` and [`rn4gTF1Z`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/008-invitation/rn4gTF1Z) copies correspond to the `-2` variant. The participant README says the two solver copies were formatted differently “likely” to identify and mitigate leaks; the [iBotPeaches diff note](https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/other/watermarking/2013_Recruitment_Message_Diffs.md) makes the same watermarking interpretation. Treat recipient-specific watermarking as a plausible explanation, not an established fact.

A related [2012 stripped-signature leak](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/010-invitation/stripped-signature-leak-02-06-2012.txt) is 2,577 bytes (SHA-256 `90bc36b21c6357154ec2c7f3124f70b0091d249f86c4120f23d121687019ca54`) and has no original PGP signature. It is a related, rewritten invitation text, not a byte- or text-identical predecessor to either 2013 signed variant. The participant README's word “identical” is too strong if read literally.

**Disposition:** the unnumbered message is the companion variant; `-2` is the variant submitted through `NEXT`. The difference is consistent with a leak-tracking watermark, but carries no semantic selector, cipher key, or additional puzzle step. The 2012 stripped leak is not an authenticated predecessor. The recovered chain ends at the known 2013 recruitment/selection message, with no LP2 handoff.

## Consequence for the 2013 → 2014 → p36 candidate

The signed challenge removes the former uncertainty about whether the BASE29/DH/NEXT specification survived with its Cicada signature. It does **not** supply the missing operation selector for the proposed 1661 → 151 → p36 chain:

1. The signed challenge does not direct a player to feed DH private-exponent representatives into the separate NUMBER service.
2. It does not prescribe φ(e) mod 29 as a one-based row-major address into the 2014 Wisdom square.
3. It does not state that the resulting 151 should be interpreted as a prime ordinal/page address.

The later 2014 Wisdom page does explicitly foreground primes and the totient function, and the source-only arithmetic pointer 1661 → cell 21:151 → cell 5:151 remains an interesting clue-constrained hypothesis. But the NUMBER service remains secondary/retrospective, the composition is inferred, and the direct 151 → Q238 p36 phase/key tests are negative. **No LP2 plaintext, encryption key, or p36 decipherment follows from this historical authentication.**

The original source bytes are not copied into this repository because the archive's license notice says it cannot license third-party material. The pinned source URL, exact hash, key fingerprint, and verification procedure are retained here instead.


## Bounded p33–39 cuneiform command transfer (16 November 2026)

The original LP2 physical pp33–39 (original JPEGs `50.jpg`–`56.jpg`) visibly repeat the cuneiform-styled values **1033** and **3301** before the 1,680-rune chapter. The signed 2013 TCP challenge specifies the deterministic integer-to-BASE29 operation and prints the positive control **`BASE29 3301` → `3QO`**, since 3×29² + 26×29 + 24 = 3301. The March 3 participant transcript records **`BASE29 1033` → `16I`**, since 29² + 6×29 + 18 = 1033; the March log is not PGP-signed as a whole, and its separate NEXT signature does not authenticate this command/response. The January 26 participant transcript adds **`BASE29 30` → `11`** and returns the participant's BASE29 handler. This two-digit response rules out a fixed three-character output field and supports minimal-width positive-integer encoding. The participant logs are contemporary witnesses, not signed Cicada responses. These are base29 numeral representations, not a documented GP29-rune mapping, page address, keystream clock or inverse decoder.

The other signed commands cannot fill that gap from the printed values alone. `DH` requires a participant-selected base, secret and client public share; modulus 1033 or 3301 does not fix a shared secret. `RAND` is random, `CODE`/`QUINE`/`KOAN` are participant-chosen text, `NEXT` stores client-supplied text, and `GOODBYE` terminates a session. No `NUMBER`, `PRIMES`, `COUNT`, GP29 decoder or cross-year transfer command is signed in this protocol. The 2014 images also print no literal `BASE29` opcode or instruction to apply any resulting three-character numeral to their ciphertext. Consequently the supported transfer stops at the *numeral conversion*; an LP2 1,680-rune inverse would require a new first-party value-changing receiver and state convention. See [the bounded Director decision #1305](https://github.com/FlareZ123/liber-primus/issues/1305). No original unknown LP2 plaintext is recovered.

## LP2 quotation-span screen

The TCP-server text has now been tested as part of the bounded 2013–2014 non-literary source corpus. The reproducer fetches the pinned original PGP artifact and its upstream plaintext transcription in memory, checks the raw artifact hash and signature-inventory record, and compares the transcription against the seven original LP2 quote spans. The archive's license notice remains controlling: original third-party source bytes are not mirrored here. See [the reproducible crib gate](../../im-results/lp2-cicada-nonliterary-message-crib-gate.md); no qualifying long crib or LP2 operation was found.
