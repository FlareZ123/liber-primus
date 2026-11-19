# Historical READ OUT / HERE and p50–DH type-bridge gate

**Agent7 + Agent45 consolidation, 19 November 2026. Directors #1745 and #1711. Decision: bounded historical search is negative.** No first-party or contemporaneously preserved author-era source located here supplies the missing operation that turns the current p50/DH state into a GP29 key or ciphertext inverse.

## Question

The live p28 route contains candidate `READ OUT`, a reconstructed DH23 state, and a local `HERE` checkpoint. The missing step is a human-plausible, source-authenticated type conversion from the numeric/table/DH objects to GP29 key material. Director #1745 asked whether a preserved 2012–2017 source supplied that bridge. Director #1711 independently asks for the authenticated Cicada operation palette and an exact type check against the present operands.

This audit uses the preserved signed protocol/message records, original 2012/2014 source witnesses, the 2014 stage11 presentation and solver archive, the recovered period IRC source index, and solved LP p56/p57 controls. Modern 2026 arithmetic is excluded as independent historical evidence.

## Authenticated / historically demonstrated operation palette

Only operations whose input and output types are actually demonstrated by the preserved source are admitted. A historical operation is not automatically transferable to LP2.

| Operation | Demonstrated input | Demonstrated output | Key/state and selection | Present-operand type check |
|---|---|---|---|---|
| 2012 ASCII Caesar shift | appended ASCII text in the first JPEG | ASCII URL/text | fixed Caesar −4 in the solved route; the reached decoy explicitly points toward “guess out” | Does not consume a DH tuple, p50 numeric cells, or GP29 ciphertext without inventing a serialization |
| OutGuess extraction, 2012 and 2014/2016 | JPEG coefficient carrier | arbitrary payload bytes / signed text | selected by source context; 2012 decoy explicitly hints “guess out”; 2016 carrier is independently reproduced with OutGuess | Requires a JPEG carrier, so none of READ OUT, DH23, the 23-rune block, or p50 integers is a typed input |
| OpenPGP verification / decryption envelope | OpenPGP message plus the required public/private key material | authenticated plaintext/status | selected by explicit armored PGP object and key infrastructure | No current operand is an OpenPGP object or supplies the required private-key role |
| 2013 `BASE29 [n]` | integer | ASCII base-29 numeral over `0123456789ABCDEFGHIJKLMNOPQRS` | explicit signed command; worked example `3301 -> 3QO` | **Exact integer input match** for DH fields or decoded p50 integers. Output is protocol text, not GP29 runes; the source supplies no digit→rune coercion or cipher mixing rule |
| 2013 `DH [p]` | modulus plus participant server base/secret and client public share | integer public/share values and integer shared secret | explicit signed protocol; worked `p=23,g=5,A=8,B=19,K=2` example | Reconstructs/recognizes the present DH state, but terminates at an integer shared value. It defines no KDF or ciphertext consumer |
| 2013 `NEXT` | client-supplied text | stored text for a later instruction | explicit signed protocol | Storage, not a transform. It cannot turn READ OUT or DH state into a key |
| 2013 `RAND`, `QUINE`, `CODE`, `KOAN`, `GOODBYE` | request-specific protocol inputs | random integers, participant-selected text/source, or termination | explicit signed protocol | Either nondeterministic, participant-authored, or terminal; none supplies a shared LP inverse or key |
| Solved LP p56 prime-clock inverse | GP29 ciphertext rune stream | GP29 plaintext rune stream | contemporary decoder starts at prime 2, emits `(C - prime + 1) mod29`, advances one prime per consumed rune, and leaves source position 56 undecoded/non-consuming | **Exact GP29 stream type match** for a 23-rune block, but there is no source instruction transferring p56's page-local prime clock/reset/exception to that block and it has no slot for DH or p50 state |
| Solved LP p57 reading | GP runes | plaintext reading | no value-changing cipher is required for the clear page | Identity/transliteration supplies no state-combining operation |

Primary witnesses: [2012 first-image source record](../resources/historical/cicada2012-first-image-source.md), [signed 2013 TCP protocol record](../resources/external/2013-tcp-server-signed-source.md), [2014 OutGuess payload record](../resources/cicada2014-outguess-hex.json), [2016 signed-carrier record](../resources/cicada2016-4gq25.md), and the preserved contemporary [p56 decoder](../resources/external/2014-irc-shared/sol2ton-p56-decoder-LHTRYZjv.py).

The table exposes two superficially compatible edges and why neither completes the route:

1. `BASE29` accepts integers, but its output type is ASCII protocol digits. No source says those digits are Gematria Primus indices or specifies how to mix them with ciphertext.
2. The p56 inverse accepts GP29 ciphertext, but its key schedule is self-contained and page-local. No historical or LP source says to seed, phase, reset, or modify that clock with the DH tuple, p50 values, `READ OUT`, or `HERE`.

Composing these edges would therefore add an unauthenticated conversion or schedule. Exact reversibility after such a composition would only prove the invented bijection was implemented correctly.

## First-party sources

### Signed 2013 TCP protocol

The authenticated protocol defines `BASE29`, `DH`, and `NEXT` among its commands. Its worked examples establish ordinary integer base conversion and a DH exchange with modulus 23. The protocol returns the DH shared value as an integer.

It does not define a GP29/rune serialization, KDF, substitution alphabet, stream cipher, additive key schedule, sum/difference transform, or rule that composes `DH` with `BASE29` and then with Liber Primus ciphertext. `NEXT` stores client-supplied text rather than applying a successor transform.

Source record: [resources/external/2013-tcp-server-signed-source.md](../resources/external/2013-tcp-server-signed-source.md).

The natural `BASE29(integer)` composition has already been tested directly against p50 in several bounded families. In particular, [base29-cell-expansion-fragment-key.md](base29-cell-expansion-fragment-key.md) converts every p50 integer through the signed 2013 BASE29 operation and interprets the resulting 0..28 digits as GP indices; its direct fragment and whole-table consumers are negative. [lp2-readout-dh-adjacent-p0-type-gate.md](lp2-readout-dh-adjacent-p0-type-gate.md) records the remaining type boundary exactly: the signed protocol does not say that a BASE29 digit is a GP rune or that DH output is a GP key.

### Original 2014 stage11 presentation

The signed stage11 message says only that enlightenment awaits at the supplied onion and that Cicada looks forward to hearing from the participant. The archived onion index is a plain sequence of `0.jpg` through `57.jpg`; it contains no table/radix/key instruction.

The 256 p49–51 tokens were presented in the page images. The contemporaneous participant repository later added decimal/base60 conversions and then packed those values into a 256-byte file. The conversion is therefore a solver-side interpretation of the printed numerals, not an embedded creator instruction.

Preserved sources:
- [resources/historical/stage11-2014-index.html](../resources/historical/stage11-2014-index.html)
- [resources/cicada2014-sexagesimal-source.json](../resources/cicada2014-sexagesimal-source.json)
- [resources/external/cicada2014-stage11-original-transcriptions.json](../resources/external/cicada2014-stage11-original-transcriptions.json)

The period repository chronology makes the distinction concrete: the first p49–51 transcription commit (`19d68fbb…`, 2014-05-11 20:41:01 UTC) contains the solver's decimal conversions alongside the copied tokens; the later `a9201dd…` `bytestring` commit packages the converted decimals with a Perl `pack 'C'` loop. This does not authenticate the byte role, a table address role, or a GP29 key role.

### Signed 2016 clue

The authenticated message says that Liber Primus's words are the map, their meaning is the road, and their numbers are the direction. It does not name p50, DH, BASE29/base60, a coordinate system, a rune serialization, or a value-changing cipher.

Source record: [resources/cicada2016-4gq25.md](../resources/cicada2016-4gq25.md).

No literal cryptographic instruction `READ OUT HERE` or `READ OUT` was located in the preserved 2014/2016 source repositories. Searches for `HERE` in the 2014 archive return ordinary prose such as “post ... your Tor hidden service here” and the solved LP koan's “study here”; neither supplies an operation.

## Contemporaneous participant evidence

The recovered 2014 Freenode corpus is useful precisely because it records how the p49–51 numbers were first understood. On 4 May participants first considered base64, then recognized the Babylonian/sexagesimal notation and described the two-character pairs as one number/byte. Later discussion tried RSA, XOR, biliteral/matrix and self-synchronizing-stream ideas without a successful decode.

This is strong evidence that base60 and the byte reading were human solver interpretations available at the time. It is weak evidence for creator intent because the captured participants do not attribute a radix/key instruction to Cicada and did not obtain a successful unknown-page inverse from those ideas.

Source index and exact log coordinates: [resources/external/2014-cicadasolvers-freenode-log-corpus.md](../resources/external/2014-cicadasolvers-freenode-log-corpus.md), especially the 4–14 May table-discussion section.

## Decision

The historical branch closes at a precise missing edge:

```text
printed p50 token
    --(period solvers: sexagesimal)--> integer/byte
DH protocol state
    --(signed 2013 semantics)-------> integer shared value

AUTHENTICATED EDGE AVAILABLE:
integer --BASE29--> ASCII base29 numeral

DIRECT GP29 CONTROL AVAILABLE:
GP29 ciphertext --p56 prime clock--> GP29 plaintext

MISSING AUTHORIAL EDGE:
integer / ASCII-base29 / table / DH state
    --> source-selected ordered GP29 key/state
    --> reversible operation on the intended unknown LP ciphertext
```

The signed `BASE29` command is the closest authenticated type converter. The solved p56 inverse is the closest demonstrated GP29 value-changing operation. Neither source tells a player to compose them, nor does either define the missing serialization, receiver, reset, or state-combination rule. Direct p50 BASE29 consumers have already failed, and the direct DH-state-to-adjacent-p0 gate independently reaches the same type boundary.

**Director #1711 therefore closes at its negative fork.** No authenticated historical operation consumes the present READ OUT/DH/p50 operands and yields a source-selected GP29 key or unknown-page inverse without at least one new assumption. Further archive-query permutations over the same preserved material should stop. Reopen only for a newly recovered source object or an LP-native clue that explicitly selects the missing conversion and receiver.
