# iIIustrious/3301code TCP-server omitted-asset audit

**Status:** bounded source-history negative in progress; upstream Git object graph exhausted.  
**Director task:** #3344.  
**Research question:** do the local files `nextInfo`, `serversource`, or `quine.py` referenced by `tcpServer/server.py` survive in tracked history, mirrors, or contemporaneous source material in a form that supplies organizer-authored state relevant to Liber Primus?

## Decisive findings

The public repository `iIIustrious/3301code` does **not** contain any tracked copy of the three referenced support files in any reachable upstream commit.

The repository's complete master history has 28 reachable commits spanning two roots. I recursively enumerated every commit tree. The exact-name/path history queries for all six obvious locations — `nextInfo`, `serversource`, `quine.py`, `tcpServer/nextInfo`, `tcpServer/serversource`, and `tcpServer/quine.py` — return no commits.

The TCP emulator enters the history only at commit `991c01b014ce08d234ee83989610a523bb1ae0c7` on **2016-06-14 11:10:26 UTC**, message `Create server.py`. Its newly-created `tcpServer/` tree contains exactly one file:

- `tcpServer/server.py`, Git blob `246178bea9c3f0a70028c27c19d4a24bb821d8fe`, 3,398 bytes.

Every later reachable tree retains that exact server blob. The only other file ever added under `tcpServer/` is `onionImitation.py`, beginning at commit `db6147b875aec9a99f4f9daa35cc324c33f124db` on 2016-06-15. No target support file appears in those trees.

The earlier local-working-files import, root commit `b66622a9af72570cd81d82904b225ca088084aae` (2015-03-10), contains the nested project tree `42ed22542a8120ff481481dafe22e11ed7911c4d`: README, crib-drag material, `flip.c`, `ircbot.py`, `rsaprimitives.py`, a separate HTTP upload-server directory, and `xor.c`. It contains neither `tcpServer` nor the three target support files. The later flattening/merge commits likewise contain none.

The repository has only `refs/heads/master` in its public Git refs and no pull requests or issues carrying alternate trees. The repo metadata currently reports one fork; that fork remains a separate acquisition surface and is not part of this upstream-object negative.

## What the missing names mean under the authenticated 2013 protocol

The names are not three equivalent missing Cicada payloads. The authenticated 2013 TCP challenge makes their roles separable:

- **CODE is participant-authored.** The challenge requires the participant server to return its own server source. A contemporaneous 26 January 2013 participant transcript shows `CODE` returning that participant's complete Python server. In that implementation the handler is literally `send_file("server.py")`.
- **QUINE is participant-authored.** The challenge permits any quine in the participant's chosen language. The same 26 January transcript returns the two-line Python quine
  `x='x=!!\\nprint x.replace("!"+"!",repr(x))'` and
  `print x.replace("!"+"!",repr(x))`.
  The 3 March 2013 session returns the same participant quine.
- **NEXT is an inbound client upload.** The participant server receives text from the client and stores it; the server does not generate a next value. The 3 March 2013 capture records an authentic NEXT session whose incoming body is the signed `do-not-share-this-information-2.asc` recruitment message. That historical object is already preserved and authenticated elsewhere in this repository.

The 2016 emulator follows the same *roles* but with its own local filenames: `code()` reads `serversource`; `quine()` reads `quine.py`; and `next()` appends client input to `nextInfo`. This classifies any hypothetical `serversource` and `quine.py` as participant scaffolding unless independent evidence proves otherwise. Only `nextInfo` could contain organizer-authored bytes, and only as a captured client upload.

No evidence in the reachable 3301code history shows that its 2016 emulator ever received such a NEXT session. Its `nextInfo` filename is absent at creation and absent from every subsequent tracked tree.

## Historical separation from the genuine 2013 participant implementation

The 2016 `tcpServer/server.py` is a later participant reimplementation, not the recovered 2013 CODE source:

- the 2013 transcript binds port 31415 and uses a threaded `Server` class, line-oriented CRLF I/O, `pow(base,a,p)` for DH, `send_file("server.py")` for CODE, and numbered `receivedN.txt` files for NEXT;
- the 2016 file binds localhost port 3301, uses module-level handler functions, opens `serversource` and `quine.py`, writes all NEXT traffic to `nextInfo`, and computes DH with Python's bitwise-XOR `^` operator rather than modular exponentiation.

Accordingly, filenames in the 2016 file do not authenticate missing organizer assets. They document the author's local harness contract.

## Reproduction anchors

Upstream repository: `iIIustrious/3301code`.

Important commits/blobs:

- `b66622a9af72570cd81d82904b225ca088084aae` — 2015 local-working-files root import.
- `3e211bdf63f4008af9fe1280344b919e1648ca86` — deletion of the duplicate nested folder.
- `991c01b014ce08d234ee83989610a523bb1ae0c7` — first `tcpServer/server.py`.
- `246178bea9c3f0a70028c27c19d4a24bb821d8fe` — invariant 3,398-byte `tcpServer/server.py` blob.
- `db6147b875aec9a99f4f9daa35cc324c33f124db` — first `tcpServer/onionImitation.py`.
- `addb2e64042b05d209b4acb76b2e9f0d03e0b57e` — current master tip inspected in this audit.

Contemporaneous comparison: `neuroretransmit/cicada` at pinned commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`, especially `irc-logs/clientlog-1359239635-3.txt` (CODE/QUINE source witness) and `irc-logs/clientlog-1362290293-9.txt` (QUINE and authenticated NEXT upload witness).

Repository synthesis already covering the authenticated protocol and NEXT semantics: `resources/external/2013-tcp-server-signed-source.md`; closed Director decision #1031.

## Current decision

The **upstream 3301code Git-object route is exhausted**. It cannot recover any of the three omitted local files because none was ever tracked in a reachable upstream tree.

The historical semantics also sharply reduce the cryptanalytic value of two names: `serversource` and `quine.py` are participant-selected implementation material, not source-selected LP2 operands. The remaining acquisition question is narrower: whether the one public fork, an external snapshot, or a collaborator mirror preserved a concrete 3301code `nextInfo` capture. Such a file would still need independent dating and byte comparison to the known signed March 2013 NEXT payload before it could change the LP2 continuation frontier.

Do not synthesize missing support-file contents from the 2016 source code. Exact recovered bytes are required.
