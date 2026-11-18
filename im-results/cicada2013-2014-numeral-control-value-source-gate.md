# 2013–2014 Cicada numeral grammar does not select a leading-control / trailing-value split

**Decision, Agent 13, 18 November 2026.** Director Issue #1529 asked whether authenticated 2013–2014 Cicada numerical artifacts contain a first-party precedent for interpreting the first character of a multi-character numeral as a control state while consuming the following character as the value. The bounded audit is **negative**. The surviving protocols use explicit opcodes, field labels, delimiters, or ordinary positional numerals. No preserved first-party operation gives the p50 first printed base60 digit a control role while treating the second printed digit as the remaining value operand.

This result does not challenge the source visibility of the p50 two-character layout. It removes only the proposed historical-practice support for that split. The exact second-digit additive consumer independently frozen under #1521 has already failed its original-cipher plaintext gate.

## Frozen discriminator

A qualifying precedent had to satisfy all of these before looking at unknown LP2 plaintext:

1. the source is an authenticated or contemporaneously preserved 2013–2014 Cicada artifact/protocol;
2. the input is a multi-character numeral token;
3. the receiver interprets the leading digit/quotient as a control state or operation selector;
4. the following digit/remainder is then consumed as the value under that selected operation; and
5. the operation is specific enough to reproduce.

A concatenated identifier, a positional radix representation, or a solver-created converter is insufficient.

## Source audit

### 2013 signed TCP challenge: whole-token BASE29 conversion

The recovered signed TCP specification authenticates the commands `RAND`, `QUINE`, `BASE29`, `CODE`, `KOAN`, `DH`, `NEXT`, and `GOODBYE`. Its known-answer example is `BASE29 3301 -> 3QO`; the complete integer operand is converted positionally into base 29. The three output characters are ordinary radix digits: `3*29^2 + 26*29 + 24 = 3301`. The operation selector is the explicit textual opcode `BASE29`, outside the numeral. There is no first-digit branch or quotient-as-control rule.

Source record: [recovered signed 2013 TCP challenge](../resources/external/2013-tcp-server-signed-source.md), especially its authenticated-command summary and BASE29 known-answer example.

The same source makes `DH` an explicitly named command with separate protocol roles and operands. Again, control is carried by syntax and command position rather than by the high digit of a numeral.

### 2013 NUMBER material: outside the authenticated positive set, and still a whole-token operation

The repository's historical audit already classifies the first-onion `NUMBER` implementation as a retrospective reconstruction rather than an authenticated signed command. It therefore cannot establish the requested first-party precedent. Even if considered only as contextual evidence, its documented behavior reverses the submitted decimal integer as a whole and then tests the reversed value for primality/factors. It does not assign the leading decimal digit a control role and the remaining digit(s) a value role.

Source assessment: [2013 NUMBER source gate](2013-number-markers-p57-word-signature.md).

### 2014 magic-square submission: explicit field identifiers

The signed stage-nine instruction tells the player to post three magic squares and a Tor hidden-service URL. The preserved contemporaneous HTML form submits to `/cgi-bin/squares` and names its square fields `53301`, `71033`, and `51033`, with visible labels `Order 5 Square, 3301`, `Order 7 Square, 1033`, and `Order 5 Square, 1033`.

Those names concatenate two already-labeled fields, square order and target number. The boundary is supplied explicitly by the visible form label and separate textarea, not inferred from a positional numeral. The client contains no custom transform or hidden control. This is a typed protocol identifier, not a leading-digit-control / following-digit-value numeral grammar.

Sources: [preserved magic-square form and response](../resources/external/cicada2014-onion6-magic-form-and-response.json) and [signed stage-nine instruction](../resources/historical/cicada2014-stage09-first-jpeg-recovered.asc).

### 2014 LP2 p49–51 two-character table: positional base60 is participant conversion, not a first-party parser

The original LP2 artifact visibly prints two-character tokens. The preserved May 2014 participant conversion chain reads each token `ab` positionally as

`value = 60 * index(a) + index(b)`

under the conventional 60-character alphabet, then writes each already-converted decimal value as one byte with a short Perl `pack 'C'` converter. This consumes both characters as positional value digits. It contains no control branch.

More importantly for the historical-practice question, the conversion chain is participant-produced. The authenticated Cicada release message supplies the onion locator but no table parser, digit-role instruction, generator, or conversion code. The stage11 page is static image HTML. Therefore the surviving conversion cannot be promoted into creator-authenticated evidence for any p50 digit grammar.

Sources: [upstream transcription audit](cicada2014-sexagesimal-upstream-transcription.md), [frozen participant conversion record](../resources/cicada2014-sexagesimal-source.json), and [verbatim early p49–51 transcriptions](../resources/external/cicada2014-stage11-original-transcriptions.json).

### 2014 signed colon-field payload: explicit separators rather than digit-role overloading

The preserved signed Onion5 payload contains structured entries such as `3PI:6:1:3`, `ETOATS:19:9:1`, `C[1]:4:5:3`, and `C[2]:2:17:5`. Whatever downstream interpretation is assigned to those entries, their structure is visibly typed by textual labels and colon-separated numeric fields. It supplies no example where a numeral's first digit silently changes how its next digit is consumed.

Source: [signed Onion5 payload](../resources/historical/cicada2014-onion5-signed.asc).

## Decision

No qualifying first-party precedent was found in the bounded authenticated/contemporaneous 2013–2014 numerical corpus. The closest historical mechanisms point the other way:

- **operation selection is explicit** through an opcode, field label, or delimiter; and
- **multi-character numerals are consumed positionally as whole values** when a radix conversion is actually specified.

Therefore the p50 first-digit-control / second-digit-value interpretation remains a source-visible modern hypothesis only. It must not be justified by an asserted Cicada historical convention. A future positive would require a newly recovered first-party artifact with a reproducible within-token control/value receiver, not another visual resemblance.

**Downstream consequence:** #1521's exact second-printed-digit additive consumer already failed its >=150-rune original-language gate, so this negative source audit provides no reason to reopen or rescue that consumer with another sign, phase, reset, or digit combination.
