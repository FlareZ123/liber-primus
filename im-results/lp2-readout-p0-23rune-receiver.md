# READ OUT selects a 23-rune p0 receiver

**Status:** source-constrained receiver identified; plaintext not recovered.

## Result

The p28 cube-layer candidate produces the two-word output **READ OUT**. Treating that output as an instruction and applying the established GP0/table pointer grammar gives a specific interval on p0:

| Output word | GP0 sum | 256-cell table token | Base-60 value | Base-59 value |
|---|---:|---|---:|---:|
| READ | 55 | 1K | 80 | 79 |
| OUT | 20 | 1g | 102 | 100 |

The base-60 values select p0 rune offsets 80 through 102, inclusive. Both endpoints are exact word boundaries: offset 80 begins p0 word18, and offset 102 ends p0 word21. The selected block therefore contains four complete words of lengths 3, 7, 5, and 8: **23 runes total**.

That length matches the independently reconstructed p28 Diffie–Hellman modulus p=23. The base-59 interpretation gives offsets 79 and 100, a 22-rune interval whose endpoints do not delimit the same four complete words. This is a discriminating radix prediction.

The two table addresses also reuse independent anchors in the existing pointer research:
- T[55]=80 is already the p27 DJU/BEI endpoint.
- T[20]=102 is already the 2016 THE pointer landing at the end of p0 word21.

This makes the READ OUT → p0 interval a stronger route than a numerical coincidence: the phrase supplies two existing pointer addresses, and their outputs delimit a block whose length is independently selected by the p28 DH construction.

## Exact selected material

One-based p0 word positions and transliteration:

| p0 word | Rune start–end | Length | GP29 transliteration |
|---:|---:|---:|---|
| 18 | 80–82 | 3 | NGAETH |
| 19 | 83–89 | 7 | IAEHXTHPG |
| 20 | 90–94 | 5 | YFNGCJ |
| 21 | 95–102 | 8 | THAMINGIIAY |

Concatenated transliteration:

NGAETHIAEHXTHPGYFNGCJTHAMINGIIAY

GP29 rune indices, zero-based:

[21,25,2,10,25,8,14,2,13,6,26,0,21,5,11,2,24,19,10,21,10,27,26]

The interval crosses a printed line break, but it is word-aligned. It is not a complete printed line.

## What has and has not been established

Established computationally from the canonical corpus and table:
- GP0(READ)=55 and GP0(OUT)=20.
- Global table cells 55 and 20 contain 1K and 1g.
- Under the table's base-60 alphabet these decode to 80 and 102.
- Those offsets delimit exactly p0 words18–21 and 23 runes.
- Under base59 they decode to 79 and 100, which do not delimit that block.
- The 23-rune length matches the p28 DH prime.

The upstream READ OUT plaintext remains a candidate from the p28 investigation, not an independently established manuscript plaintext. The receiver selection does not decrypt the 23 runes. Initial tests of uniform ±K shifts, simple cube powers, H on the whole span and on wordwise nested shells, and a repeating-key Vigenere interpretation did not yield readable plaintext. These negative tests do not exclude a different DH-derived reversible operation or the possibility that the block is key material rather than plaintext.

## Next decisive question

What reversible operation, if any, does the independently reconstructed p28 H/DH construction prescribe for this exact p0 receiver? Test that operation without changing the selected endpoints, rune order, word boundaries, or radix to rescue a result. A valid continuation must produce reproducible plaintext or independently verifiable key material; the 23-rune length match alone is not a decryption.

## Reproduction

Run:

`node sims/lp2_readout_p0_23rune_receiver_sft.cjs`

The script recomputes the phrase word sums, table lookups under both radices, p0 word boundaries, selected rune sequence, and the DH-length comparison from repository resources.

## Related research

- Upstream p28 candidate: `im-results/lp2-p28-readout-cube-layer-candidate.md`
- Existing 2016 GP0/table pointer circuit: `im-results/lp2-2016-gp0-table-word-pointer-circuit.md`
- p28 DH/H reconstruction communication: `communications/broadcast/20261118T2350Z_agent50_p28-reversible-shell-dh.md`
