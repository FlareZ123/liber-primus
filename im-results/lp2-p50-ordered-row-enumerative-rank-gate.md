# Ordered 8-of-256 row-rank transport: negative

**Decision:** retire this exact representation. It is a reversible recoding of the 32 physical rows, but neither radix produces a recognized historical Cicada object or a source-selected receiver.

## Frozen operation

Input is the 256-cell p49–51 numeric table in resources/liber-primus/lp2-grid-256.json, read in its physical 32 × 8 row order. Both extant codebooks were tested:

- Base60: the file's full 60-character alphabet.
- Base59: the same alphabet with lowercase f omitted.

For each row, treat its eight decoded values as an **ordered** 8-permutation of byte values 0–255. Compute its zero-based lexicographic/Lehmer rank using successive remaining-alphabet indices and mixed radices 256, 255, 254, 253, 252, 251, 250, 249. Serialize each rank as an unsigned 8-byte big-endian integer. Preserve physical row order. No alternative row order, endian, radix, byte reversal, arbitrary substring, or additional encoding was searched.

The state space is:

- 256P8 = 16,517,640,193,528,320,000
- maximum rank = 16,517,640,193,528,319,999
- 2^64 = 18,446,744,073,709,551,616

Thus every row rank fits in exactly eight bytes. The implementation verifies exact unranking for all 32 rows under both codebooks.

## Results

| Measure | Base60 | Base59 |
|---|---:|---:|
| Rows / bytes | 32 / 256 | 32 / 256 |
| Distinct values per row | 8/8 in every row | 8/8 in every row |
| Unique row ranks | 32 | 32 |
| First four ranks | 13156335930412136055; 5998933060160580028; 7858039485739831527; 7082919363481008742 | 12961754723745381804; 5933396909693264278; 7728236338967035277; 6953113228193591492 |
| First 16 output bytes | **b694b1d2cdec767753407dd5a237e9bc** | **b3e1673f3695bdac5257a90d89aae196** |
| SHA-256 | **673653915c63531b5084eed30384466f3bdefc70c1bee83bd80453918ed53fdd** | **00f0c86c0b501966f2763ffd95fbf1bf905c7759b0455eb74fb1dd0f5ef0c48b** |
| Shannon entropy | 7.2311 bits/byte | 7.2888 bits/byte |
| Printable ASCII bytes | 96/256 | 98/256 |
| Zero bytes | 2 | 2 |
| Strict UTF-8 | invalid | invalid |

The outputs are random-looking and do not form readable byte text.

## Typed historical-format checks

**OpenPGP:** neither complete 256-byte stream is accepted by GnuPG.

- Base59 begins **B3**. Its header can be read syntactically as an old-format tag-12 Trust packet with indeterminate length. This is not a signature packet, and gpg --list-packets reports no valid OpenPGP data found.
- Base60 begins **B6**. GnuPG interprets an old-format tag-13 User ID packet with a declared length of 2,494,681,805 bytes, then reports packet(13) too large.

The base59 header is not discriminating evidence. Under the uniform rank null, a particular full first-byte bucket such as B3 has probability 2^56/(256P8) = 0.00436246. Any of the 15 old-format indeterminate-length packet-header values has probability 0.0654369. In 10,000 matched controls—each a 32 × 8 table of independently shuffled, distinct byte rows—the exact B3 header occurred 35 times and some old-format indeterminate-length header occurred 629 times. These are consistent with the null, not a Cicada-specific packet.

**BASE29 / byte transport:** using the authenticated 2013 BASE29 digit alphabet 0123456789ABCDEFGHIJKLMNOPQRS, each row rank renders as a 12–14 digit number. The whole 256-byte big-endian stream, interpreted as one integer, renders as 422 digits. Neither rendering supplies a recognizable message, packet structure, or independently selected receiver. Rowwise concatenation would additionally require preserving boundaries not represented in the numeric stream. The raw byte streams are not valid UTF-8.

The reproduction script records the exact row ranks, byte streams, hashes, BASE29 renderings, header diagnostics, and matched-control counts:

- sims/lp2_p50_ordered_row_enumerative_rank_gate_sft.cjs

## Conclusion

The ordered-row rank is a mathematically valid bijection, but that is its only established property. The apparent base59 OpenPGP header is an ordinary random-control event and fails GnuPG validation; base60 fails packet length validation. BASE29 rendering produces only unreceived numeric strings. No authentic signed packet, text payload, key, or downstream address is recovered.

Close issue #2626 as a completed negative. This retires only the fixed ordered 8-of-256 rank transport; it does not identify the actual consumer of the p50 table.
