# A 75-rune p55 inverse from the signed 2016 byte packet and p32 ring lengths

**Classification (12 November 2026):** original-input, source-motivated bounded negative. No newly deciphered Liber Primus plaintext, authentic key, or destination.

## Human route and exact proposed consumer

Original LP2 physical p32 (scan 49.jpg) has a 5×5 central ring whose sixteen GP-prime weights, in the previously recorded clockwise traversal, are

`[67,47,19,89,53,89,107,61,37,109,107,79,41,107,17,107]`.

They sum to **1,136**, the exact length in bytes of the independently authenticated 2016 OutGuess-signed ASCII message in `resources/historical/cicada2016-4gq25-outguess.asc`. This correspondence and its historical limits were already established in [the p32 source report](tree-prime-canvas-partition.md). The original p55 illustration also contains a source-corrected **16 complete printed words** following one incoming p54 word-carry rune. Their exact lengths are

`[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`, totaling **75**.

The new potential handoff pairs these two *independent sixteen-item source partitions*. Partition the complete 1,136-byte signed ASCII into the sixteen consecutive ring-sized chunks; within chunk `i`, take the central `L_i` raw ASCII bytes, without discarding newlines, armor, or signature. Concatenate the extracted chunks in source order into an exact 75-byte candidate key. Every ring size is odd, so for the even-length target words the source offers two symmetric center conventions. Fix either **left-middle** or **right-middle globally**, without choosing independently per word. For p55 body offsets 1–75, decode `P_i=(C_i ± (K_i mod29)) mod29`; p55 offset0 is a carry from p54 and is *outside* this complete-word candidate. The sign choice is the two historically used GP additive orientations. No runes are deleted or rearranged.

**Unsupported premise:** Neither the signed 2016 message nor the original illustrations tells the solver to use centers of byte segments as rune shifts. The original 1,136-byte file's natural lines do not align with these sixteen chunks, which include the PGP armor and high-entropy base64 signature. The six distinct centered-word widths have no historical marker selecting this consumer. This is a low-cost *attempt to derive a full source-available p55 body key*, with an exact original readout that could immediately distinguish success.

## Completed original-input result

The exact 1,136-byte source has SHA-256 `fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010`. Canonical p55 has 76 runes, one incoming p54 carry and **75 new-word runes**; the untouched 75-rune body has GP29 index of coincidence **0.038558559**.

| Signed-chunk center | GP29 inverse | 75-rune output IoC | Plaintext outcome |
|---|---|---:|---|
| Left-middle | subtract key residues | **0.037837838** | No discernible sentence or GP vocabulary |
| Left-middle | add key residues | **0.031351351** | No discernible sentence or GP vocabulary |
| Right-middle | subtract key residues | **0.038918919** | No discernible sentence or GP vocabulary |
| Right-middle | add key residues | **0.029549550** | No discernible sentence or GP vocabulary |

Representative complete decoded GP transliterations, using the GP native alphabet, are:

- Left/subtract: `NODYTXYCUNHEANGEOTIXWABLBEAFHBHEEOLTEALUTNEIWSTHCMEEOPAEPFGBTLTWNGMNHTHNEOENGEOTHSWEXESLA`.
- Right/subtract: `NOFOEEOBFTEOXJPEIEOBXWNGGLBEAFHBHEEOLTEALUTOETHOFSEOEAXMNMEAPFGBTLTWNGMNHTHNIAEOEOUOEFIACEXESLA`.

The extracted **left-middle ASCII** begins with `---\ns hee roadd.\n\n\nG--/9lqvu/` and continues into signature data. The alternative reads the same header/signature regions with other center positions. All four original-cipher inverses are approximately random-text-level under a one-gram measure and have no identified authentic plaintext. A 75-rune original GP p57 passage serves as an exact encode/decode plant for both center conventions and signs. All outputs re-encipher the untouched p55 body symbol-for-symbol; as for any invertible additive cipher, this controls implementation, not key authenticity.

## Direct source-number-as-word-index readout

The 2016 signed instruction calls the manuscript's **words** a map and its **numbers** a direction. That supplies a second, simpler finite readout independent of the unsigned packet's ASCII bytes: use each of the sixteen p32 ring prime values as a *cyclic character index* in the corresponding p55 complete word. The only two standard character indexing conventions are zero-based `j=prime mod wordLength` and one-based `j=(prime−1) mod wordLength`; the two source ring directions are original clockwise order and its reverse. The p55 word and rune sequence remain unaltered, and no shifts are fitted.

| Ring order | Index convention | Complete 16-rune GP-native readout |
|---|---|---|
| Clockwise | zero-based | `WBMAEURXSHEIEOOEXUI` |
| Clockwise | one-based | `ISXTHCWFMBEOESTHCJE` |
| Counterclockwise | zero-based | `WBMAEIARMSHEGTHOEEAUE` |
| Counterclockwise | one-based | `ISXTHFWIMBEOXTHTHCJB` |

These GP strings contain **16 original rune symbols** each (several transliterate as two Latin characters). None provides an obvious GP-native English instruction, a hexadecimal or Tor address, or an authenticated manuscript key. More importantly, the signed 2016 prose does **not** prescribe cyclic reduction of prime values by word length, and the p32 ring starting position is one of several human-plausible conventions. Thus no result is accepted as plaintext or as a key; inventing extra shifts, row start points, and word permutations would amount to a new unconstrained search.

The same [reproducer](../sims/p32_ring1136_center75_p55_sft.cjs) now asserts all four exact source readouts alongside the central-byte full-text inverse. This book-code test is distinct from the four 75-rune additive decryptions and does not assert a reversible entire-page decoder.

## GP-word-prime address into segmented authenticated packet

One last distinct, source-directed consumption of these same objects uses the **numeric value of a complete original p55 word** as the 2016 message's stated “direction.” Compute each of the 16 complete p55 word sums in the original GP-prime alphabet:

`[222,114,118,306,283,30,596,365,138,108,341,291,88,284,129,159]`.

Partition the authenticated 1,136-byte ASCII into the 16 unmodified consecutive p32-ring-width segments. For word `i`, select precisely one **ASCII** byte in its segment at address `sum_i mod width_i` (zero-based) or `(sum_i−1) mod width_i` (one-based). Original clockwise and reverse ring orders are the only ring directions tested. These source-locked choices yield:

| Ring order | Address base | Complete 16-byte ASCII readout |
|---|---|---|
| Clockwise | 0 | ` eit 7criwznvUIY` |
| Clockwise | 1 | `De  e PHmH5mzOF\\n` (last character is LF) |
| Reverse | 0 | `IswG-WYO7Li1fF6q` |
| Reverse | 1 | `Gi \\n-J4XL5jEpTRu` (fourth character is LF) |

These are direct ASCII bytes from the original signed message. The source includes plaintext header plus an armored RSA signature, so a randomly selected ASCII subsequence is expected to contain readable punctuation and letters even for a wrong key. None selects a well-formed address, recognizable instruction or source-authenticated GP29 decryption key. The modulo-address convention remains inferred, and no handwritten text points from the p55 word prime sum to the signature packet. The same SFT now asserts all sixteen-byte original outputs and stops at this four-case gate. Expanding arbitrary indices after this failure is not licensed.

## Decision

**Retire this fixed sixteen-ring-size / sixteen-p55-word-size middle-extraction and direct GP29 additive consumer.** The source equality 1,136 remains real and its potential as a packet locator remains open; the tested central substrings supply no usable p55 key. The whole 56-page unsolved manuscript remains unrecovered. Avoid individualized center offsets, source-file slicing corrections, fitted GP residues, or new algorithm layers without an independent original instruction. This is a different finite hypothesis from the existing *unsegmented* p32 ring-periodic pad and packet-columnar experiments and does not change the established broad research synthesis.

**Reproducer:** [Windows-compatible CommonJS self-contained SFT](../sims/p32_ring1136_center75_p55_sft.cjs), with exact signed-byte digest, source layout assertions, native GP p57 positive plants, original reencryption and full four readouts. Its underlying four original-input calculations were executed directly against the repository-hosted canonical data during this invocation; the new standalone Node script is preserved for independent execution and has not yet been dispatched through CI.
