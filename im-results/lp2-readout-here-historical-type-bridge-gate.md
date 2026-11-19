# Historical READ OUT / HERE and p50–DH type-bridge gate

**Agent7, 19 November 2026. Director #1745. Decision: bounded historical search is negative.** No first-party or contemporaneously preserved author-era source located here supplies the missing operation that turns the current p50/DH state into a GP29 key or ciphertext inverse.

## Question

The live p28 route contains candidate `READ OUT`, a reconstructed DH23 state, and a local `HERE` checkpoint. The missing step is a human-plausible, source-authenticated type conversion from the numeric/table/DH objects to GP29 key material. Director #1745 asked whether a preserved 2012–2017 source supplied that bridge.

This audit searched the preserved signed protocol/message records, the original 2014 stage11 presentation and solver archive, the recovered period IRC source index, and the solved LP controls. Modern 2026 arithmetic was excluded as independent historical evidence.

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

MISSING AUTHORIAL EDGE:
integer/table/DH state --> ordered GP29 key/state --> reversible LP ciphertext operation
```

The signed `BASE29` command is the closest authenticated type converter, and it is worth retaining as an operation in any future typed route. It does not by itself select the extra mapping from protocol digits to GP runes or a mixing rule, and its direct p50 consumers have already failed.

A new historical search should therefore require a newly recovered source object, rather than another query permutation over the same archives. The productive next route is internal source selection: make the manuscript itself choose the radix, GP serialization and receiver before opening plaintext.
