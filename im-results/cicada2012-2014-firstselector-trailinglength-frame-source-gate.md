# No 2012-2014 Cicada-authored first-selector / trailing-length byte-frame precedent

**Decision, Agent 13, 18 November 2026.** Director Issue #1579 asked whether an authenticated or source-pinned Cicada protocol from 2012-2014 provides a byte-exact precedent for the two framing equalities observed in the fixed p55 quintet candidate:

1. the first decoded byte repeats an immediately external selector, type, or index; and
2. the final decoded byte encodes the total frame length or payload length.

The bounded audit is **negative**. No recovered Cicada-authored protocol in the repository uses both conventions in one frame. The surviving custom protocols instead expose control through textual opcodes, delimiters, named fields, or signed prose. Binary framing that does appear comes from standard third-party formats such as JPEG, OpenPGP, MIDI, RSA/OAEP, bzip2, MP3, and OpenPuff. Those container rules are not Cicada-authored packet semantics, and none supplies the specific p55 first-selector / terminal-length pair.

This leaves the p55 header/footer conjunction as a calibrated statistical event without a historical packet-format interpretation.

## Qualification rule

A positive precedent had to be a reproducible first-party Cicada format with both properties present in the same transmitted or stored frame:

- a leading byte whose value is defined by an external selector/type/index immediately outside the frame; and
- a final byte whose value is defined as total frame length or payload length.

A generic file header, ordinary packet length field, PGP packet tag, HTTP content length, RSA block size, or solver-created serialization does not qualify.

## 2012 campaign

### First image and OutGuess route

The byte-pinned 2012 first image is a JPEG carrier with a 61-byte post-EOI suffix and historical OutGuess content. The JPEG marker grammar and OutGuess embedding are third-party format/tool behavior. The recovered Cicada clue is carried through image suffix text, Caesar manipulation, and OutGuess extraction. No Cicada-authored binary record with an echoed selector first byte and terminal length byte is present.

Source: [2012 first-image source witnesses](../resources/historical/cicada2012-first-image-source.md).

### 845145127 coordinate, whitespace, and book-code stages

The preserved source inventory describes signed coordinate payloads, a signed ten-filename whitespace-decoded payload, image OutGuess extractions, and later book-code material. The original HTML server bytes are incomplete, while the recoverable signed objects are textual OpenPGP messages. No custom Cicada binary framing rule of the required form survives.

Source: [845145127 source inventory](../resources/external/2012-845145127/README.md).

### Participant RSA/OAEP exchange

The preserved participant-specific 2012 RSA material uses Crypt::RSA::ES::OAEP and compressed serialized ciphertext. The reconstructed payload has conventional serialization fields such as a header and ciphertext length, while the actual cryptographic block framing belongs to the third-party Crypt::RSA OAEP implementation. The Cicada-side instruction tells the participant to decrypt a number and submit it. No first-party frame defines byte 0 as an echoed external selector and the final byte as a frame or payload length.

Source: [2012 RSA participant recovery](2012-rsa-participant-page-recovery.md).

### Signed MIDI stage

The authenticated email directs the player to follow the chorus. The participant-preserved MIDI is a standard MIDI file with MThd/MTrk chunks, VLQ event lengths, ordinary metadata events, and no SysEx events. Its container framing is standard MIDI syntax. No Cicada-authored record overlays the requested first-selector / trailing-length semantics.

Source: [2012 MIDI source metadata audit](2012-midi-source-metadata.md).

## 2013 campaign

### Signed TCP server challenge

The authenticated TCP challenge defines textual commands `RAND`, `QUINE`, `BASE29`, `CODE`, `KOAN`, `DH`, `NEXT`, and `GOODBYE`. Control is explicit in the command token. Participant-output responses are text framed with status text such as `01 OK` and a terminal dot. `BASE29` consumes a whole integer token. `DH` has explicit protocol roles and textual operands. None of these commands defines a byte frame whose first byte echoes an external selector while its last byte carries length.

Source: [recovered signed 2013 TCP challenge](../resources/external/2013-tcp-server-signed-source.md).

### 2013 OS and signed onion material

The preserved original OS scripts print a tab-separated prime sequence, with timing pauses at 1033 and 3301, then display a text message. The signed onion messages are OpenPGP clear-signed prose. No custom binary packet grammar is present.

Sources: [original cicada.sh](../resources/historical/cicada2013-os-original-cicada.sh), [original prime_echo.sh](../resources/historical/cicada2013-os-original-prime-echo.sh), and [signed 2013 onion message](../resources/historical/cicada2013-second-onion-everything-you-need.asc).

## 2014 campaign

The reconstructed 2014 chain uses several real operations:

- equal-length XOR of three 991-byte OutGuess-extracted shares;
- a 14-column text transposition;
- GP Vigenere and Atbash-family transforms;
- OpenPuff extraction from an MP3;
- a textual GEB book code;
- an ordinary HTML form submission with named URL-encoded fields;
- signed OpenPGP instructions and static HTML/image delivery.

The three-share XOR has fixed equal-length inputs but no p55-style selector or terminal length record. The transpositions/ciphers operate on text/runes. OpenPuff, MP3, bzip2, JPEG, and OpenPGP are third-party formats. The Onion6 square submission uses explicit fields `53301`, `71033`, `51033`, and `onion` under standard form encoding; the Cicada-side CGI implementation is unrecovered. The seventh onion is a static image index. None supplies the requested byte-frame convention.

Sources: [historical solve-path synthesis](../workplace/historical-solve-path-to-original-lp2.md), [Onion6 CGI source boundary](2014-stage10-squares-cgi-source-boundary.md), and [signed Stage11 message](../resources/historical/cicada2014-stage11-message.asc).

## Decision for the p55 packet branch

No byte-exact first-party framing precedent matching both p55 equalities was found in the bounded authenticated/source-pinned 2012-2014 corpus.

The current p55 evidence should therefore remain separated into:

- a calibrated source-statistical conjunction: first decoded byte equals the preceding GP index and final decoded byte equals frame length;
- no authenticated Cicada packet grammar that assigns those two values the corresponding selector/length roles;
- no source-selected 5-GP29 to 24-bit transport or typed consumer.

A future positive requires an original Cicada-authored frame or instruction that actually defines both byte roles. Generic packet analogies or standard container conventions do not satisfy this gate.
