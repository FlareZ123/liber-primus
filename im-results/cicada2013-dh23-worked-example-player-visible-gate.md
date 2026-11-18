# Signed 2013 DH23 worked example: player-visible clue gate

**Agent1 / Agent4, 18 November 2026. Director #1635 and follow-up #1637. Classification: authenticated historical semantics with pre-Cicada pedagogical provenance; no LP2 receiver or plaintext.**

## Decision

The tuple `(p,g,serverPublic,clientPublic,shared)=(23,5,8,19,2)` is genuinely **player-visible and source-fixed** in the Cicada-signed 2013 TCP-server specification. A stronger provenance check now shows that the complete toy exchange predates that specification: a surviving Cibertec cryptography course deck self-dated **17 April 2012** prints `p=23`, `g=5`, private exponents `a=6` and `b=15`, public values `8` and `19`, and shared value `2` (https://aulavirtualsi.cibertec.edu.pe/aula_virtual/DocumentosC/21247520120516163518.pdf).

The signed Cicada text therefore reused an already circulating pedagogical Diffie-Hellman example. The five public transcript values remain authentic historical control data because Cicada deliberately included them in material sent to participants. Their existence does not supply independent Cicada-specific evidence for a 2013-to-LP2 handoff.

No recovered first-party 2013–2016 source tells a solver to carry the worked example into Liber Primus, the p50 table, the p57 circumference instruction, or the signed-2016 “numbers are the direction” clue. The p27/p50 circuit should consequently be classified as a strong structural match to **generic DH toy semantics** pending the separate familywise audit, rather than as an established intended historical route.

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

The procedure text says the participant server chooses its own base and secret for each `DH [p]` request. Preserved live sessions follow that rule and do not replay the printed DH23 exchange.

| Date | request | participant base | participant secret | server public | client public | shared |
|---|---:|---:|---:|---:|---:|---:|
| 2013-01-26 | 118818811 | 65551251 | 65974449 | 76477436 | 123 | 8686271 |
| 2013-01-26 | 5 | 3 | 3 | 2 | 3 | 2 |
| 2013-03-03 | 3301 | 2757 | 331 | 1264 | 2800 | 1067 |

The example also sits in the specification beside analogous examples for WELCOME, RAND, QUINE, BASE29, CODE, KOAN, NEXT and GOODBYE. No source emphasis such as “remember these numbers” was found.

## Cross-year bridge audit

The bounded first-party material gives no explicit bridge from this example to LP2:

- the 2014 Liber Primus source prints no `DH` instruction tied to the numerical table;
- p57's clear Instar parable supplies circumference language without naming Diffie-Hellman or the 2013 server example;
- the signed 2016 clue says that words are the map, their meaning is the road, and their numbers are the direction, without naming DH, the worked tuple, p50, or a cross-year replay;
- #1625 independently establishes that the signed DH procedure ends by returning the shared integer and supplies no KDF or LP2 payload receiver.

Public contemporaneous mirrors reproduce the same DH23 exchange because they reproduce the server specification. They do not create a second Cicada-authored reuse.

## Consequence for the p27 transducer

The p27 red13/base59 chain still reconstructs a complete, internally consistent Diffie-Hellman toy group. That remains useful structural evidence because the route returns to source quantities and supplies both private exponents from LP2 geometry.

The historical weight is narrower. Since the exact seven-number toy example already existed in pedagogical material before Cicada's signed challenge, the tuple match cannot be counted as independent evidence for a Cicada-specific carry-forward clue. The strongest remaining tests are the familywise multiplicity audit and a fresh source-selected receiver on untouched ciphertext.

Primary repository source: [`resources/external/2013-tcp-server-signed-source.md`](../resources/external/2013-tcp-server-signed-source.md). Runtime comparison: [`resources/external/2013-tcp-live-test-vectors.json`](../resources/external/2013-tcp-live-test-vectors.json).
