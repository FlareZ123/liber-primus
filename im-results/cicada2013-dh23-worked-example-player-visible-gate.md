# Signed 2013 DH23 worked example: player-visible clue gate

**Agent1, 18 November 2026. Director #1635. Classification: authenticated historical semantics; no LP2 receiver or plaintext.**

## Decision

The tuple `(p,g,serverPublic,clientPublic,shared)=(23,5,8,19,2)` is genuinely **Cicada-authored and player-visible** in the signed 2013 TCP-server specification. It is not a participant-generated live-session tuple. However, the surviving source presents it as the sole worked example of the generic `DH [p]` procedure, in the same example format used for the other protocol commands. No first-party 2013–2016 source recovered in this bounded audit tells a solver to carry those five values into Liber Primus, the p50 table, the p57 circumference instruction, or the signed-2016 “numbers are the direction” clue.

Therefore the tuple is a valid historical control and a plausible retrospective clue candidate, but its p27/p50 numerical reconstruction does **not yet establish an intended human solve path**. That stronger claim must wait for the independent familywise audit or a separate source bridge.

## What a 2013 participant could see

The recovered TCP-server artifact is cryptographically valid under Cicada's established signing key and has embedded signature time 26 January 2013. A contemporaneous February 2013 Twisted-Python mailing-list post independently reproduces the challenge text, establishing that the protocol was circulating in-period rather than being a later reconstruction.

Inside procedure `g. DH [p]`, the signed text explicitly prints the complete exchange:

`C: DH 23`

`S: 01 OK 5 8`

`C: 19`

`S: 03 DATA 2`

Thus **23, 5, 8, 19 and 2 are literal source values chosen in the authored specification**. They are not inferred from participant code and they are not reconstructed from LP2 arithmetic.

## Why it is still a worked example rather than a live key

The procedure text says the participant server chooses its own base and secret for each `DH [p]` request. The real preserved March 2013 test session uses `DH 3301` and participant-side random state: base2757, secret331, public1264; the client supplies2800 and the server returns shared1067. The signed worked tuple is therefore structurally different from an operational session transcript.

The contemporaneous server implementations likewise implement a generic DH command. They do not hard-code the example tuple as a protocol constant. The example sits in the specification alongside analogous examples for WELCOME, RAND, QUINE, BASE29, CODE, KOAN, NEXT and GOODBYE. No source emphasis, label such as “remember these numbers,” or later first-party reuse of the five-number tuple was found.

## Cross-year bridge audit

The bounded first-party material gives no explicit bridge from this example to LP2:

- the 2014 Liber Primus source prints no `DH`, `23`, `5 8`, `19`, or `DATA 2` instruction tied to the numerical table;
- p57's clear Instar parable supplies the circumference language, but does not name Diffie-Hellman or the 2013 server example;
- the signed 2016 clue says that words are the map, their meaning is the road, and their numbers are the direction, but it does not mention DH, the worked tuple, p50, or a cross-year replay;
- #1625 independently establishes that the signed DH procedure ends by returning the shared integer and supplies no KDF or LP2 payload receiver.

Public contemporaneous mirrors and a December 2013 preserved server implementation reproduce the same DH23 example because they reproduce the server specification. This confirms player visibility; it does not create an independent clue. Exact web searches for the printed exchange returned copies of the same specification rather than a separate Cicada-authored reuse.

## Consequence for the p27 transducer

The p27 red13/base59 chain matching all five public values is more meaningful than a match to participant-random DH3301 values because the five numbers were indeed fixed by Cicada in advance and visible to participants. That improves the historical legitimacy of using the tuple as a **control target**.

It does not resolve the strongest rival: after extensive LP2 arithmetic work, many source objects, marker conventions, coordinate origins, radix readings, table walks and historical examples could have been inspected. The separate Director familywise audit (#1634/#1636) must measure that search freedom. Until then, classify the DH23 tuple as **authored worked-example data with no authenticated LP2 handoff**, rather than as an established intended key or destination.

Primary repository source: [`resources/external/2013-tcp-server-signed-source.md`](../resources/external/2013-tcp-server-signed-source.md). Runtime comparison: [`resources/external/2013-tcp-live-test-vectors.json`](../resources/external/2013-tcp-live-test-vectors.json).
