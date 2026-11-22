# LP2 p15 source DATA/560.13: GP28 binary transport before historical XOR

**Agent 34, 12 November 2026. Original-cipher negative with exact historical and independently encoded positives. No recovered LP2 plaintext, key, historical cipher identification, or destination.**

## Source-led hypothesis and the unproven bridge

The physical page-15 upper red nine-rune heading has GP29 indices `[0,1,20,19,24,28,26,22,24]`. Treating the heading as a positional BASE29 numeral gives `29,553,734,724=3301×8,952,964+560`. The historical 2013 CicadaOS disk supplied actual high-entropy `DATA/560.13` bytes, and its original puzzle demonstrably used consecutive-byte XOR against a source-file slice. The p15 Fibonacci-prime construction contains suffix candidate 13, but not alternate file suffixes 0 or 17. These precise source observations previously motivated a file/offset hypothesis in [the source-selector gate](lp2-p15-base29-56013-selector-gate.md). Neither the source nor the puzzle author proves that GP29 ciphertext should be converted to binary before XOR.

Two earlier tests found the conventional GP29 additive and direct rune/prime-byte XOR unhelpful; a separate test treated the GP28 exclusion ranks as a single base28 integer and looked directly for a conventional file header. The present distinct experiment tests **actual historical bytewise XOR after binary conversion of the 28-choice ciphertext ranks**. No byte-phase, pad offset, unknown key, GP alphabet, or ciphertext text selector is optimized.

## Exactly specified original-input inverse

The unchanged ciphertext is the **1,894 GP29 runes** from physical p15 after its first nine red runes through the end of p22. Its first rune is a transmitted previous-symbol state. At the ten source-observed adjacent identical rune events, positions `[240,777,968,995,1060,1101,1162,1463,1649,1864]`, treat the identical successor as a marker that emits no data digit. Every other successor is mapped reversibly to a value in 0–27 by either the **cyclic rank** `((Cᵢ−Cᵢ₋₁+29)%29)−1` or the **sorted rank** `Cᵢ−[Cᵢ>Cᵢ₋₁]`. This yields exactly **1,883 base28 digits**.

For each of the two rank maps, use two fixed, normal binary framings: (1) one big-endian unsigned base28 integer converted to its minimal big-endian byte buffer; (2) split at the ten original repeated-rune markers, convert each of the eleven base28 packets to minimal big-endian bytes and concatenate. XOR each resulting byte, starting at source offset **8,952,964**, with the matching byte from the exact 118,818,811-byte historical `DATA/560.13` file, whose SHA-256 is `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`.

## Executed original-data results

[Manual Windows/Node22 run 43279772218](https://github.com/FlareZ123/liber-primus/actions/runs/43279772218) successfully downloaded the full original historical file, verified its source SHA-256, decoded the original 2013 historical onion address **exactly** using original `DATA/560.13` bytes starting at offset 12,821, and ran the complete four-model test:

| Original rank / binary framing | Reconstructed bytes | Printable ASCII bytes | Spaces | Empirical byte entropy | Original output SHA-256 |
| --- | ---: | ---: | ---: | ---: | --- |
| Cyclic / single integer | 1,132 | 434 | 8 | 7.796339 | `18a8deef4fa567ef172e17ffd87d939853fd22e5da0678082df0381e65e2f8d7` |
| Cyclic / eleven packets | 1,136 | 400 | 3 | 7.814542 | `a93ca8536776c7aae840015510526cc52fdc68c2a8ab7f6f8e75534b9bca092c` |
| Sorted / single integer | 1,132 | 415 | 4 | 7.843355 | `8d8ce76a2d12f5f875d28dcbfe863b0c5fbe0ad0590fbcabda5a3a9096ed1f9d` |
| Sorted / eleven packets | 1,136 | 433 | 2 | 7.830977 | `08244208820d0fed6c30ddbf4b3b60267660cdb75befd8b63fbd040364b36f24` |

None begins with the declared PDF, PNG, ZIP, gzip, JPEG, bzip2, xz, zstd, or armored PGP signatures, and none yields an ordinary ASCII phrase. The one observed longer printable span (`j~<p~46flWV%`) is gibberish. All original outputs look like unstructured high-entropy binary, not a directly exposed human-readable payload.

**Positive control:** The independently authored 1,131-byte ASCII buffer begins `%PDF-1.7\nSOURCE-LOCKED 2013 HISTORICAL XOR CONTROL\n`. Each of both GP28 map variants enciphers it under the same genuine original 2013 pad at offset 8,952,964 and then recreates exactly the ten actual original ciphertext repeated positions. The declared inverse recovers all 1,131 original ASCII bytes exactly without seeing the planted plaintext. A one-byte wrong pad start does not recover it. Both controls passed in the successful original-file run, alongside the independent period-2013 onion-control check.

## Decision and scope

**Retire this exact source-selected file/offset combined with predecessor-exclusion GP28-to-binary readout followed by direct historical XOR.** It cannot expose ordinary ASCII text or a conventional header at byte zero under the specified two rank and two packet layouts. It also does not authenticate the 2013 source as an LP2 key, or prove the 10 repeated rune events are markers. Compressed/encrypted high-entropy downstream material, a different source-specified transport/key schedule, and wholly different plaintext registers are outside this gate. Do not widen offsets, endian conventions, or arbitrary extra cipher layers solely to rescue an unselected model.

**Reproducer:** [`sims/lp2_p15_56013_rank28_binary_xor_sft.cjs`](../sims/lp2_p15_56013_rank28_binary_xor_sft.cjs); [manual original-file workflow](../.github/workflows/agent34-p15-56013-binary-xor-manual.yml). Both were run in [completed Actions job 131397640598](https://github.com/FlareZ123/liber-primus/actions/runs/43279772218/job/131397640598). The original-cipher test is fully executed and negative, rather than pending future downloads.
