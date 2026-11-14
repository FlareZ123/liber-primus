# Original p50 quotient under the authenticated-era BASE29 integer-to-bytes transport

**Decision, 14 November 2026 (Agent 8).** The original 256-token p49–51 table admits an exact 252-digit GF(29) quotient after division by the already established H·G source factors. One player-plausible, historically attested operation is the 2013 signed protocol's positional **BASE29**, which sends an integer as base-29 digits. Reversing that relationship into a standard unsigned big-endian byte string gives **153 bytes** from the complete source-order quotient. Those bytes are binary-like, fail strict UTF-8 decoding and start with no common file signature. Their literal translation is **not unknown plaintext** and no source instruction selects the quotient as an encoded byte stream.

## Frozen operation

The original 32×8 printed cells are converted by the existing conditional conventional base-60 codec, reduced mod29, and read as descending polynomial coefficients. Set the source-derived factors H(X)=3+26X+24X² (the 2013 3301→3QO BASE29 example) and G(X)=27+5X+15X² (p39's original red triad). Their product in GF29 has ascending coefficients [23,21,11,17,12]. The exact long division P/(H·G) yields zero remainder and a **252-position** quotient, whose first sixteen high-to-low digits are [0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]. These facts were known independently; this gate tests the **previously unselected byte transport**.

Treat the 252 digits as one unsigned base-29 integer, then serialize to the shortest big-endian byte string. Also test the fully reversed digit order as a rival. As the original nine visual chapter boundaries supply an independent possible framing, split the same quotient into exactly nine consecutive 28-digit base-29 integers; each occupies seventeen bytes, giving another 153-byte stream. No key, phase, padding byte, cipher family or language score was fitted.

## Actual byte readouts

| Frozen reading | Bytes | Printable ASCII bytes | First 32 hexadecimal bytes | Strict UTF-8 | Common prefix |
| --- | ---: | ---: | --- | --- | --- |
| Complete high-to-low quotient | 153 | 57 | `04598e588f3e70d4100f40d7489f9855a468a0d950156d2acb3e74df533723e6` | Invalid | None |
| Reversed base-29 digit order | 153 | 56 | `3ef7c86dc5ef7da8cd68d10456cd7049ae3af3a6cf3c976033228414c9fec80b` | Invalid | None |
| Nine original-order 28-digit fields | 153 | 57 | `03d1ad8f9c32ef60592ac61d54497bcfce9ea316ad3bef1268510ecf2bf81759` | Invalid | None |

The prefix check includes JPEG, PNG, GIF, ZIP, gzip, bzip2, zstd, xz, PDF, ELF and RIFF, so it can reject only directly headed versions of these formats. A compressed or encrypted *headerless* payload is not ruled out. The original p50 table is already known to have a 32×8 arrangement; interpreting each byte's eight bits as a 32×64 monochrome image, with original row and MSB-first bit order, likewise shows no legible bitmap. No image geometry was inferred from decoded text.

## Control, scope and decision

The SFT checks the independently known 2013 BASE29 example **3QO→3301**, the original 256 entries, full zero polynomial remainder, exact source quotient and each 153-byte serialization. It writes no output files. The 2013 protocol supports base-29 integer conversion; **it does not instruct a byte codec, a 9×28 split or a quotient consumer for LP2**. Accordingly these findings retire only the three frozen direct-text/standard-file readings. They provide no candidate key, authenticated destination, deciphering route or general exclusion of the table.

**Reproducer:** [single-file source-input Node.js SFT](../sims/lp2_p50_q252_base29_bytes_sft.cjs). The previously established mathematical factors, including p29's shared double root, remain in [p50/p39/p3 analysis](p50-p39-p3-field-remainder.md). Do not expand this reading by fitting encryption keys to the resulting random-looking bytes without a new source clue.
