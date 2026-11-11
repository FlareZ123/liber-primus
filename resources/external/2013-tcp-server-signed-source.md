# Recovered signed 2013 TCP-server challenge

**Classification:** authenticated historical protocol specification; not an LP2 decryption, key, or continuation.

## Artifact and provenance

The recovered artifact is the file [messages/2013/tcp-server.asc](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/tcp-server.asc), pinned to archive commit 27309e66746e21542f2b908d7f60b906915fe7c6 (2025-01-20, “feat: add tcp server signed message (#132)”). The archive's companion [2013 TCP-server note](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/other/2013_TCP_Server.md) describes it as the Cicada message decrypted from its original encryption while retaining the inline signature. The original encrypted email envelope and mail headers are not preserved; the signed message content and signature are.

- Raw artifact: [pinned raw file](https://raw.githubusercontent.com/iBotPeaches/cicada_3301/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/tcp-server.asc)
- SHA-256: fdfe1208b49f75ce634224d2b0561e4c8b322f27dd74bd757f5d83ebcfbdb88c
- Embedded signature timestamp: **2013-01-26 09:16:23 UTC**
- Signing key ID: 181F01E57A35090F
- Full fingerprint: 6D854CD7933322A601C3286D181F01E57A35090F
- Verification key: [repository Cicada public key](../control/cicada-3301-public-key.asc)

The local GnuPG check returned **Good signature** and **VALIDSIG** for the full fingerprint above. The independent [signature-timeline archive](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json) independently records the same artifact hash, timestamp, key ID, and VALID status. Packet inspection shows a one-pass signature, compressed literal data, and signature packet, with no encrypted-data packet: this archived file is the decrypted signed payload, not the original encrypted envelope. GnuPG's owner-trust display is [unknown]; the claim here is cryptographic validity under the established Cicada key fingerprint, not a new third-party identity certification.

The artifact was added to the public archive in 2025, not contemporaneously. Its embedded 2013 signature and the independent 16-Feb-2013 [Twisted-Python witness](https://twisted.org/pipermail/twisted-python/2013-February/059021.html), which reproduces the challenge text, provide the historical dating and corroboration.

## What the signed text establishes

The signed challenge directs the recipient to build a TCP server and specifies the commands RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, and GOODBYE. It includes:

- BASE29 3301 → 3QO;
- a worked DH 23 exchange: server base 5 and public share 8, client public share 19, shared key 2;
- the DH role split: the participant server selects its own base and secret integer for each request; the client supplies its public share; the server returns the shared value;
- NEXT as client-supplied text for the server to store. The server does not calculate or choose the next instruction.

The signed challenge contains **no NUMBER, PRIMES, or COUNT command**. It authenticates the BASE29/DH/NEXT protocol, not the separate first-onion number-service grammar reconstructed from later participant material.

## March 2013 participant-log cross-check

The pinned [participant server transcript](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/clientlog-1362290293-9.txt) records a DH 3301 request with participant-server base 2757, server secret 331, server public share 1264, client public share 2800, and returned shared value 1067. Under the signed protocol, the server base and secret are participant randomness, not organizer-fixed key material. The client public share fixes e ≡ 11 (mod 550), leaving six ordinary-range representatives: 11, 561, 1111, 1661, 2211, 2761.

The log's received1.txt NEXT payload matches the separately archived [do-not-share-this-information-2.asc](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/do-not-share-this-information-2.asc): SHA-256 062886c6063b5c9c3049cf67dd9837df75bdd54d8fa73cb1b5fe25d52d227e87. Its OpenPGP signature independently verifies under the same key, dated **2013-03-03 05:33:01 UTC**. This authenticates the NEXT payload only; it does **not** sign the surrounding DH exchange or the participant log as a whole.

## Consequence for the 2013 → 2014 → p36 candidate

The signed challenge removes the former uncertainty about whether the BASE29/DH/NEXT specification survived with its Cicada signature. It does **not** supply the missing operation selector for the proposed 1661 → 151 → p36 chain:

1. The signed challenge does not direct a player to feed DH private-exponent representatives into the separate NUMBER service.
2. It does not prescribe φ(e) mod 29 as a one-based row-major address into the 2014 Wisdom square.
3. It does not state that the resulting 151 should be interpreted as a prime ordinal/page address.

The later 2014 Wisdom page does explicitly foreground primes and the totient function, and the source-only arithmetic pointer 1661 → cell 21:151 → cell 5:151 remains an interesting clue-constrained hypothesis. But the NUMBER service remains secondary/retrospective, the composition is inferred, and the direct 151 → Q238 p36 phase/key tests are negative. **No LP2 plaintext, encryption key, or p36 decipherment follows from this historical authentication.**

The original source bytes are not copied into this repository because the archive's license notice says it cannot license third-party material. The pinned source URL, exact hash, key fingerprint, and verification procedure are retained here instead.
