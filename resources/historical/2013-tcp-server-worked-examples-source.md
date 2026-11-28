# Authenticated 2013 Cicada TCP-server worked examples — source pointer

Stable source note for cryptanalytic reproduction. This is an external historical reference, not a research conclusion.

Preserved decrypted/verified transcription:

<https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/tools/solvers/ibotpeaches/other/2013_TCP_Server.md>

Preserved encrypted original linked by that transcription:

<https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/tools/solvers/ibotpeaches/messages/2013/tcp-server.asc>

The preserved transcription reports a good signature from Cicada's established key fingerprint:

```text
6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F
```

Relevant worked examples, preserved verbatim in the source:

```text
C: BASE29 3301
S: 01 OK 3QO

C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2
```

The DH procedure text states that the client supplies the prime modulus, the server selects a base and secret exponent, the client returns its exponent result, and the server returns the resulting shared secret.

Retrieved/checked against the pinned preserved transcription on 2026-11-28. Research interpretations belong in `im-results/` or `results/`, not this source note.
