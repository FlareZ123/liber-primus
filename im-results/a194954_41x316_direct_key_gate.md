# A194954 / 41×316 direct-key gate

**Status:** bounded negative for direct additive use of the A194954-selected p57 phrase and the 2014 square's 41 active symbols. No LP2 plaintext or key recovered. Preserve the cross-round sequence as a possible navigation clue, not as a cipher key.

## Hypothesis tested

The cross-round candidate is:

1. The 2014 signed-message archive has a whitespace-run transcription matching the first eleven terms of OEIS A194954: 2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37.
2. The terms not exceeding the 19-word p57 Parable body select 1-based positions 2, 3, 5, 7, 11, 13, 17:
   **THE INSTAR TO SURFACE OUR CIRCUMFERENCES WITHIN**.
3. That phrase has 41 Latin letters but only 39 canonical GP rune tokens (the TH digraph occurs twice). A separate 2014 7×7-square / NUMBER construction has 41 active symbols. The original unknown LP2 stream has 12,956 runes, exactly 41×316.
4. In the 2016 signed message, the PGP signature marker begins at byte index 317; excluding the separator newline leaves a 316-byte prefix. This suggests—but does not prescribe—a 41-row ×316-column arrangement.

The exact 41×316 shape is real. Treating one symbol as a constant shift for each row, or using the 41-letter phrase as a period-41 key, is a hypothesis rather than a consequence of that shape.

## Reproducible tests

Run:

```sh
node sims/a194954_41x316_direct_key_gate.cjs
```

The script uses the original corpus and transcription, preserving printed punctuation word boundaries and the repository's page-number correction for runeless p50. Its GP trigram model is trained on the first 240,000 characters of `resources/control/shakespeare_first300k.txt`; the remaining text supplies a same-length held-out English control. It tests:

- 41×316 row-wise constant shifts, both signs, with the 41-letter p57 phrase;
- the same row-wise model with the 2014 square's center-out and outer-to-center 41-symbol sequences;
- continuous phase-zero period-41 GP Vigenère, both signs, with the p57 phrase;
- 2,000 deterministic shuffled key-order controls for phrase row shifts, square center-out row shifts, and the best period-41 sign.

No phase search, key fitting, or post-hoc language optimization is used.

## Results

| Input / operation | Log score per rune | IoC | Control |
|---|---:|---:|---|
| Raw unknown LP2 p0–55 | −8.81035 | 0.034478 | baseline |
| Same-length held-out Shakespeare | −2.40180 | 0.058689 | English control |
| Solved p57 plaintext (89 runes) | −3.89197 | — | short native plaintext control |
| Phrase, 41×316 row shift, C−K[row] | −8.77251 | 0.034461 | shuffled-order p=0.146 |
| Square center-out, 41×316 row shift, C−K[row] | −8.79983 | 0.034462 | shuffled-order p=0.298 |
| Square outer-to-center, 41×316 row shift, C−K[row] | −8.81253 | 0.034506 | no improvement |
| Phrase, period-41 C+K | −8.75256 | 0.034531 | best-of-signs shuffled-order p=0.105 |

The opposite signs are also tested and score worse. The best candidate is still more than six log-score units per rune below the same-length English control. Its output remains ciphertext-like. The modest score lifts are not exceptional under shuffled key order: the source order ranks 1,710/2,001 for phrase row shifts, 1,405/2,001 for square row shifts, and 1,791/2,001 for period-41 phrase use.

The result rejects these direct additive interpretations of the 41×316 structure. It does **not** reject A194954 as a word selector, a non-additive route through the 2014 square, or a source-selected navigation operation on LP2.

## Evidence limits on the A194954 selector

The preserved 2014 cleartext-signed message contains the visible 2-space internal gap after “Hello.” and 5-space leading indentation before the onion address. Most of the other runs used to form the eleven-term sequence are trailing or blank-line whitespace. RFC 4880 §7.1 specifies that trailing spaces and tabs are removed before a cleartext signature is generated; those runs therefore are not authenticated by the PGP signature. The repository copy also contains a separate 2-space trailing run after “you.” that is absent from the published eleven-number list. The sequence may have been deliberately present in the original transport bytes, but its exact form is archive-dependent; do not call the full sequence PGP-authenticated.

Also, the first seven A194954 terms are simply the first seven ordinary primes. Its distinctive 23 occurs at term eight, beyond p57's 19-word body. The selected phrase's 41-letter count is not its GP rune count (39), so the 41-letter key test deliberately used single Latin letters mapped to GP single-letter symbols. That is a favorable but non-canonical assumption.

The 2016 43-word count and A194954(12)=43 / final key-ID selection remain an interesting cross-round checksum. They do not supply an inverse operation.

## Decision

Do not repeat direct period-41 additive, 41×316 row-wise Caesar, or key-order shuffles for these same source-derived keys. The remaining useful question is whether the selected words' *meaning* and the original p57 page's two-dimensional word layout specify a unique route through the 2014 square or unknown LP2. Require that route to be fixed from the original clue before testing another cipher family.

## Sources and supporting work

- Original p57 image: `resources/57.jpg` (also in the uploaded original-image archive).
- 2014 signed message: `resources/historical/cicada2014-stage11-message.asc`.
- 2016 signed message: `resources/historical/cicada2016-4gq25-outguess.asc`.
- 2014 41-symbol square construction and prior direct-key negatives: `im-results/onion7-magic-center-source-prime-gate.md`.
- p57 19-word map and 2013 marker route: `im-results/p57-word-map-19-direction-cycles.md`.
- Reproducer: `sims/a194954_41x316_direct_key_gate.cjs`.
- OpenPGP cleartext canonicalization: [RFC 4880 §7.1](https://www.rfc-editor.org/rfc/rfc4880#section-7.1).
- Sequence: [OEIS A194954](https://oeis.org/A194954).
