# Ordered 8-of-256 row-rank transport: negative

**Decision:** retire this exact representation. It is a reversible recoding of the 32 physical rows, but neither radix produces a recognized historical Cicada object or a source-selected receiver. The later independent order/membership split below is also negative as direct GP29 text or an affine-remapped repeated additive key on p51–55; its order tape is invariant under both radices.

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


## Independent order/membership rank channels and original affine receiver (Agent43, 25 November)

The earlier full ordered-8-of-256 rank entwines the two independent choices in a physical row: the selected eight values and their relative ordering. This complementary exact decomposition tests whether either channel separately carries a key. Every physical row has eight distinct values under both candidate radices. Sort the row, rank its permutation lexicographically among 8! possibilities, and rank the sorted subset by the canonical combinadic colex rank ∑ C(s_i,i+1), i=0…7. Pack each of the 32 row ranks in its natural mixed radix (40320 or C(256,8)=409663695276000) in printed row order. Convert each resulting nonnegative integer to minimal-width BASE29 digits, matching the historically attested positive-integer formatting. This hypothesized rank split and mapping to Gematria indices are not independently authored instructions. The relative permutation is exactly invariant under the monotone base59/base60 codebooks; membership differs. Together the two channels reconstruct all 256 cells under each radix, with no lost bits or normalization. The order-only channel has capacity 489.574657 bits, membership 1553.325868 bits, and the 32-row joint capacity is 2042.900525 bits (only 5.099475 below 2048). No significance is assigned to that capacity.

| Channel | Actual integer bits | GP29 digits | Direct trigram score | Direct IoC |
|---|---:|---:|---:|---:|
| order | 490 | 101 | -3.498975 | 0.033861 |
| membership59 | 1553 | 320 | -3.489368 | 0.033954 |
| membership60 | 1553 | 320 | -3.494062 | 0.034894 |

None of these three direct GP29 readouts is prose. The invariant order tape is `9PSM65KEIF604BKM3CO82E7G0QQLD142NFN8RFBNPQ04MSR5K36M0QPC5GCLLLG28RLMBB8BFQ2PEQS3K4LA35FOE2A1H6166NLB5`.

**Actual original-cipher receiver:** consume the immediately following original p51–55 runes (842 total), with p51–53 (534) as development and p54–55 (308) frozen as continuation. A candidate repeated tape d is transformed by every nonzero affine GP29 mapping K_j=(a d_j+b) mod29, a=1…28, b=0…28. This explicitly grants arbitrary affine digit conventions including both additive signs, rather than attributing an undocumented alphabet convention to the historical BASE29 protocol. Every starting phase is allowed. The native transparent-F receiver requires plaintext F to emit ciphertext F without advancing, and every consuming transition to decode to non-F; an encrypted non-F may also emit ciphertext F. A bitset of possible cursor positions exactly propagates every legal history from the union of all start phases. No lexical or word-break assumptions occur in that reachability test. The ordinary consuming-clock model is independently searched exhaustively on development using an add-0.3 GP29 trigram table trained on the seven native reference sections excluding p56 and p57; only its single prefix winner per channel is carried forward to p54–55.

| Channel | All affine/phase pairs | Transparent-F max prefix | Affine maps reaching dev (any phase) | Full maps | Ordinary prefix winner (a,b,phase) | Dev score | Heldout score |
|---|---:|---:|---:|---:|---|---:|---:|
| order | 82012 | 646/842 | 3 | 0 | 13,24,89 | -3.421077 | -3.513276 |
| membership59 | 259840 | 653/842 | 18 | 0 | 21,16,160 | -3.413410 | -3.497480 |
| membership60 | 259840 | 666/842 | 16 | 0 | 16,18,18 | -3.415586 | -3.466648 |

The fixed identity/negation maps at phase zero reach 23/82, 56/13, 30/45 runes respectively; even granting all phases their maxima are 329/405, 406/372, 320/382. The exhaustive affine relaxation allows 37 distinct affine-map candidates to reach development, but **none reaches the complete original continuation**. The ordinary candidates exactly reencrypt (an implementation invariant only), yield near-uniform IoC, and remain nonprose in both original intervals. Native p56 and p57 independently score -2.660966 and -2.652200 nats/rune with the same table. The ordinary prefix-selected text excerpts are preserved in the raw JSON, not promoted to plaintext.

**Positive controls:** encode the authentic solved p56 and p57 native rune tapes concatenated (180 runes; 85 development and 95 heldout) with each actual derived channel and a distinct hidden affine map and phase. The identical exhaustive ordinary search obtains:

| Channel | Hidden a,b,phase | Selected a,b,phase | Full correct | Heldout correct | True-phase transparent-F reach |
|---|---|---|---:|---:|---:|
| order | 7,11,37 | 7,11,37 | 180/180 | 95/95 | 180/180 |
| membership59 | 13,3,159 | 13,3,159 | 180/180 | 95/95 | 180/180 |
| membership60 | 19,24,247 | 19,24,247 | 180/180 | 95/95 | 180/180 |

The controls establish the native-clock reachability implementation and calibrate the ordinary hidden-parameter search on authentic target-excluded text; they do not establish the historical use of a row-rank tape. All results were executed in connected V8 from the same core preserved in the read-only CommonJS SFT; no Windows/CI execution claimed. [SFT](../sims/lp2_p50_split_row_rank_base29_sft.cjs) · [complete rank tapes, all affine reachability maxima, exact ordinary inverses and control scores](lp2-p50-split-row-rank-base29.json).

**Decision:** retire this exact order/membership split as direct GP29 text or repeated additive key for the adjacent p51–55 stream under both ordinary and native transparent-F clocks, including every affine digit map and phase. No new unknown plaintext, key or radix selection. This leaves a different independently specified rank consumer, other table representations and nonperiodic clocks open; do not reopen these precise receivers by choosing an original-output-conditioned framing.
