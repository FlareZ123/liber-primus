# LP2 256-cell table: historical binary-consumer decision and whole-S-box obstruction

**Director #540, Agent48, 12 November 2026.** The original pp49–51 numeral grid contains 32 printed rows of eight cells, 256 two-character tokens. There remains **no author-selected binary consumer or recovered plaintext** for its numeric interpretation. This note consolidates the already bounded historical byte-identity work and adds an exact necessary-condition obstruction to one concrete 2014-available consumer: treating all 256 cells as a complete secret byte permutation or RC4 post-KSA state. [Runnable source-exact gate](../sims/lp2_p50_256_sbox_permutation_gate_sft.cjs).

## Human solve route and source boundary

The source prints a 256-cell numeral table without a label naming a binary decoder. Under the popular alphabet 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx, its two-character cells decode to 256 bytes; dropping unused lowercase **f** gives an equally lossless radix-59 interpretation that **changes 220 of 256 bytes**. The historical source-selection limit and the p39 double-root conditional discriminator are documented in [the codec report](lp2-grid-numeric-codec-ambiguity.md). This is an **inferred byte layer**; neither codec is separately declared by a signed original message.

A dated human operation **does** exist: a May 2014 participant copied the table to decimal and used a one-line Perl pack-C converter to write a 256-byte file named sexagesimal.bin. Its recorded output disagrees with the original image-adjudicated printed table at **ten** cells; the original conversion source, frozen blob identity and locations are already in [the historical binary witness](../resources/cicada2014-sexagesimal-source.json). That object attests to **a participant's serialization**, not a Cicada-supplied decryptor or an independent key. Byte export alone cannot distinguish an encrypted block, a lookup table, or key material.

Historically documented source-era operations include OpenPGP signatures, signed TCP BASE29/DH, OutGuess, XOR, Vigenère, transposition and OpenPuff. None of their preserved stage-specific instructions selects **this 256-cell table** as an input to a runnable decryption. The signed May 2014 Stage11 introduction provides an onion URL, and the original Stage11 index hands out JPEGs, without naming a table parser or key consumer. An exact byte match to prior material would be actionable, but direct comparisons to the original 2014 Stage04 256-byte object, three contemporary 256-byte onion strings and source-justified XOR/totient variants are already negative: [Stage04](cicada2014-stage04-256-p50-direct-identity-gate.md), [three streams](external-historical-repos-byte-identity-256-stream-gate.md). A separate search across **35 contemporary objects / 20,028,657 source bytes** and eight natural table readings found zero exact eight-byte row anchors; its planted 32-byte positive matched: [source-anchor study](lp2-p50-historical-exact-byte-source-anchor-gate.md).

An OpenPGP packet-format prefix was separately screened by [the independently developed community payload-forensics campaign](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/ELIMINATION-LEDGER.md); its superficial packet flag was false. The RSA-4096 two-share 256+256 direct transfer is separately excluded by an original signed positive control in [the historical RSA test](lp2_historical_256byte_rsa4096_signature_gate.md).

## Exact additional consumer constraint: complete 256-byte permutation impossible

**Concrete interpretation:** an S-box or RC4 state **after key scheduling** is a bijection from 8-bit inputs to 8-bit outputs, using all 256 byte values exactly once. A solver could read the original 32×8 table in row-major order as a complete 256-entry byte lookup. Here no language model or unknown key is required: a byte permutation must have **256 distinct outputs**, regardless of readout order.

Compute every cell under the independently documented original-character-order radix60 and omitted-f radix59, without editing printed tokens:

| Source-compatible interpretation | Distinct bytes | Distinct repeated values | Equal-value pairs | Minimum byte replacements for any permutation |
| --- | ---: | ---: | ---: | ---: |
| Base60 | **161** | 69 | **127** | **95/256** |
| Base59, omitting lowercase f | **161** | 69 | **127** | **95/256** |

The multiplicity histogram under either codec consists of **92** values occurring once, **49** twice, **14** three times and **6** four times, leaving **95** byte values absent. To obtain any complete byte permutation, at least **95 excess occurrences** must change. Reversing columns, choosing another position order, a secret 256-byte alphabet bijection, or any global relabeling preserves the **127 equality pairs**. Thus the direct fixed complete S-box/RC4-post-KSA-state family fails even granting an arbitrary unknown order and secret value permutation. This does **not** exclude these repeating bytes as an ordinary RC4 **key** (which can have duplicates), input to a separately specified key-scheduling algorithm, 29-rune output table, PRNG seed, ciphertext block or variable-state cipher.

The [CommonJS SFT](../sims/lp2_p50_256_sbox_permutation_gate_sft.cjs) decodes 256 exact source tokens and checks the canonical base60 byte_rows, both source-specific frequency spectra, a true affine 256-byte permutation positive control, and invariance under arbitrary global output relabeling plus position reversal.

## Decision

The table is a real 256-cell artifact and its GF29 factor relationships deserve separate analysis, but **no author-selected binary consumer/key or plaintext** has been recovered. Existing source-directed tests exclude direct historical byte reuse, while the new key-independent count eliminates a literal complete byte-permutation interpretation. The sole recorded original-era complete binary serialization was participant-made, with no onward source-attested decrypting instruction. Further source work needs a **new creator-attributable instruction** specifying the input alphabet, output purpose and reversible operation or a previously missing original binary with an exact source contract; repeating codec, key and table-size sweeps would not advance the decrypting decision.
