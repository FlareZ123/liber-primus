# Signed 2013 DH23 worked example: player-visible clue gate

**Agent1 / Agent4, 18 November 2026. Director #1635 and follow-up #1637. Classification: authenticated historical semantics with pre-Cicada pedagogical provenance; no LP2 receiver or plaintext.**

## Decision

The tuple `(p,g,serverPublic,clientPublic,shared)=(23,5,8,19,2)` is genuinely **player-visible and source-fixed** in the Cicada-signed 2013 TCP-server specification. A stronger provenance check now shows that the complete toy exchange predates that specification: a surviving Cibertec cryptography course deck self-dated **17 April 2012** prints `p=23`, `g=5`, private exponents `a=6` and `b=15`, public values `8` and `19`, and shared value `2` (https://aulavirtualsi.cibertec.edu.pe/aula_virtual/DocumentosC/21247520120516163518.pdf).

The signed Cicada text therefore reused an already circulating pedagogical Diffie-Hellman example. The five public transcript values remain authentic historical control data because Cicada deliberately included them in material sent to participants. Their existence does not supply independent Cicada-specific evidence for a 2013-to-LP2 handoff. A later LP2-native p28 selector now supplies the handoff from the manuscript side.

No recovered external first-party 2013–2016 source tells a solver to carry the worked example into Liber Primus. That external-source negative remains true, but it is no longer the decisive handoff question: physical p28 now contains an LP2-native DH23 selector. The p27/p50 circuit should still be classified as structural rather than as plaintext because no post-DH receiver or KDF is selected.

## Later LP2-native selector supersedes the handoff negative

Subsequent p57/p28 work changes one conclusion of this historical gate without changing the provenance result. The conditional `FIND→28` route selects physical p28 word28. That word ends original line6, the only one of all604 physical p0..p55 rune lines whose first visible fragment is exactly `DH`. The line is23 runes; the selected word is5 runes, begins at one-based line position19, and lies on line6. Those source-visible quantities directly instantiate `p=23, g=5, a=6, B=19`; standard DH uniquely gives `b=15, A=8, K=2`.

LP2 therefore now has a manuscript-native selector for the same tuple. The 2012 deck still proves that the tuple itself is generic pedagogical DH rather than Cicada-specific historical evidence. The corrected distinction is: **the operation/tuple is now source-selected inside LP2, while its existence in the 2013 specification is only semantic control and still supplies no KDF or payload receiver.**

See `lp2-p57-find28-p28-centerword-dh87-loop.md` and `../sims/lp2_p28_centerline_dh23_sft.cjs`.

## What a 2013 participant could see

The recovered TCP-server artifact is cryptographically valid under Cicada's established signing key and has embedded signature time 26 January 2013. A contemporaneous February 2013 Twisted-Python mailing-list post independently reproduces the challenge text, establishing that the protocol was circulating in-period.

Inside procedure `g. DH [p]`, the signed text explicitly prints the complete exchange:

`C: DH 23`

`S: 01 OK 5 8`

`C: 19`

`S: 03 DATA 2`

Thus **23, 5, 8, 19 and 2 are literal source values in the signed specification**. The private exponents **6** and **15** are absent from that text. They are the unique discrete logarithms modulo 22 because 5 generates the nonzero residues modulo23: `5^6 mod23=8` and `5^15 mod23=19`.

## Pre-Cicada pedagogical provenance

The Cibertec deck is self-dated **17/04/2012**, 284 days before the embedded Cicada signature. Its Diffie-Hellman slide gives the same full example:

- public parameters `p=23, g=5`;
- private values `a=6, b=15`;
- public values `8, 19`;
- shared result `2`.

Source: https://aulavirtualsi.cibertec.edu.pe/aula_virtual/DocumentosC/21247520120516163518.pdf

This materially changes the historical interpretation. Matching the tuple can identify a standard small-number Diffie-Hellman construction without selecting the Cicada TCP-server artifact specifically. A solver who knew the 2013 challenge could still recognize the same numbers, but that recognition is no longer independent evidence that Cicada planted those values for later reuse.

## Why it is a worked example rather than a live key

The procedure text says the participant server chooses its own base and secret for each `DH [p]` request. The pinned archive census contains exactly ten clientlog files, with three executed DH requests: DH 118818811 on 26 January, DH 5 later that day, and DH 3301 on 3 March. All three use participant-selected bases/secrets and none replays the printed DH23 exchange. Only the March log contains an executed NEXT request; its separately signed payload does not authenticate the preceding DH exchange or log.

| Date | request | participant base | participant secret | server public | client public | shared |
|---|---:|---:|---:|---:|---:|---:|
| 2013-01-26 | 118818811 | 65551251 | 65974449 | 76477436 | 123 | 8686271 |
| 2013-01-26 | 5 | 3 | 3 | 2 | 3 | 2 |
| 2013-03-03 | 3301 | 2757 | 331 | 1264 | 2800 | 1067 |


The 26 January DH 118818811 record is irc-logs/clientlog-1359224026-2.txt: 1,759 bytes, Git blob SHA-1 8c0a93d7d620c35805d9be71206d593df8e15dca, raw SHA-256 6d70a085df5909fd72a64490066c3453f345a87ff23adc2d36efe2208cdb41cd. It first entered the community archive in unsigned commit f403afb9e6db2a2fb3825c7b4801c2af0ddd7228 (24 April 2024), retained in pinned commit ade9a02889ef8acbc8cde8edbfd0a785c369f4c3 (3 May 2024). The embedded 2013 timestamp is therefore not independently authenticated by archive custody. Its unique client exponent 44073865 is derived by discrete log; it is not printed. The full ten-file census and raw hashes are in the live-test vector index. The January exchange has no NEXT; the client supplies p and its public share, while the participant server selects the base and secret. This is a participant-side session, not an LP2 key handoff.

The separate March 2013 record's modulus 3301 is consistent with the independently source-selected numeral/page-pair route, but this does not source-select its client share 2800 or returned shared value 1067 as an LP2 key. The p57-to-p50 bridge to 2800 remains conditional on zero-based row-major and inner-to-outer reading; #1565 leaves the order symmetry unresolved, and #1576 found no independent pre-May-2014 exact-field witness. The participant log is the only exact 2800/1067 record, and it is not signed as a whole.

The example also sits in the specification beside analogous examples for WELCOME, RAND, QUINE, BASE29, CODE, KOAN, NEXT and GOODBYE. No source emphasis such as “remember these numbers” was found.

## Cross-year bridge audit

The bounded first-party material gives no explicit bridge from this example to LP2:

- later physical-layout analysis finds the only exact line-start fragment `DH` in p0..p55 on the source-selected p28 center line; that line also supplies 23/5/6/19 and therefore supersedes this earlier negative;
- p57's clear Instar parable supplies circumference language without naming Diffie-Hellman or the 2013 server example;
- the signed 2016 clue says that words are the map, their meaning is the road, and their numbers are the direction, without naming DH, the worked tuple, p50, or a cross-year replay;
- #1625 independently establishes that the signed DH procedure ends by returning the shared integer and supplies no KDF or LP2 payload receiver.

Public contemporaneous mirrors reproduce the same DH23 exchange because they reproduce the server specification. They do not create a second Cicada-authored reuse.

## Consequence for the p27 transducer

The p27 red13/base59 chain still reconstructs a complete, internally consistent Diffie-Hellman toy group. That remains useful structural evidence because the route returns to source quantities and supplies both private exponents from LP2 geometry.

The historical weight is narrower. Since the exact seven-number toy example already existed in pedagogical material before Cicada's signed challenge, the tuple match cannot be counted as independent evidence for a Cicada-specific carry-forward clue. The strongest remaining tests are the familywise multiplicity audit and a fresh source-selected receiver on untouched ciphertext.

Primary repository source: [`resources/external/2013-tcp-server-signed-source.md`](../resources/external/2013-tcp-server-signed-source.md). Runtime comparison: [`resources/external/2013-tcp-live-test-vectors.json`](../resources/external/2013-tcp-live-test-vectors.json).
