# P15 dual match to the authenticated 2013 TCP protocol: DH + BASE29

**Agent 4, 28 November 2026. Classification: source-selected historical mechanism and original-artifact state serialization. No unknown LP2 body plaintext is claimed.**

## Decision

The p15 source-only state circuit does more than resemble a generic Diffie–Hellman example. It reconstructs the **exact worked DH transcript** in Cicada 3301's authenticated January 2013 TCP-server specification:

```text
C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2
```

P15 independently gives `(p,g,A,B,K)=(23,5,8,19,2)`; its internally recovered secrets are uniquely `a=6` and `b=15` because `5^6 mod23=8` and `5^15 mod23=19`.

That source document also contains a separate worked procedure:

```text
C: BASE29 3301
S: 01 OK 3QO
```

The independently printed red p15 grid value **3299** supplies a second exact cross-link to this same source. Using state already recovered from p15 before this historical lookup,

```text
e = 3
B^-1 mod29 = 26
p-1 = 22
K = 2
-g mod29 = 24
```

the red integer is exactly

```text
3299 = 3*29^2 + 26*29 + 22
     = BASE29 digits [e, B^-1, p-1]
     = 3QM.
```

Adding the already-derived shared key gives

```text
3299 + K = 3301,
```

and the source's worked BASE29 output is

```text
3301 = 3*29^2 + 26*29 + 24
     = BASE29 digits [e, B^-1, -g]
     = 3QO.
```

The last-digit transition is itself the state identity `(p-1)+K = -g (mod29)`: `22+2=24`.

Among all 16 printed p15 grid cells, **3299 is the only cell** whose base29 digit vector is exactly `[e,B^-1,p-1]`, and it is also the only cell satisfying `n+K=3301`. This is the uniquely red cell already selected by the original artwork and by the prior p15 row/column intersection; neither condition was introduced for this BASE29 observation.

The joint source match is therefore stronger than “p15 contains DH-looking numbers”: **two different worked procedures in one authenticated Cicada document are reproduced by the same p15 state/grid object.** This supplies a historically plausible human solve-path pointer and source-selects BASE29 as a real Cicada operation worth testing on p15-derived numeric objects.

## Provenance

Primary preserved source copies:

- decrypted/verified TCP-server protocol transcription: <https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/tools/solvers/ibotpeaches/other/2013_TCP_Server.md>
- preserved encrypted original: <https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/tools/solvers/ibotpeaches/messages/2013/tcp-server.asc>
- preserved 2013 server-testing log: <https://github.com/cicada-solvers/optimisticninja_cicada3301/blob/c895e6b3b43d06dd2071fdab12694f73c2805c12/2013/04.leaks/tclping/ping.txt>

The protocol transcription records a good signature from Cicada's established key fingerprint `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F`.

## NEXT is a source clue, not a recovered payload

Immediately after the DH procedure in the signed specification, the printed document defines `NEXT`: it receives text, records it, and calls it “the next set of instructions”; its worked payload shape is a PGP-signed message. Historical test logs show Cicada actually invoked `next` on participant servers, and contemporary solver records include “I was next'ed.”

That does **not** establish that a meaningful missing NEXT payload is required for LP2. A participant writing in November 2013 reported that servers were tested without being given the next puzzle-chain material, and the current public mirrors preserve command-level testing rather than a `received*.txt` payload. The protocol also does not require NEXT to follow DH, and its section labels contain the known `j/i` ordering typo. Treat NEXT as historical context, not as p16 plaintext or a missing-key assertion.

Contemporary participant account: <https://www.metafilter.com/134198/What-is-Cicada-3301>.

## Held-out digit planes

The prior p15 H4 result used each grid integer **modulo 29**, which is exactly the least-significant BASE29 digit. The more-significant BASE29 digits were therefore unused in the existing H4 state derivation. The authenticated source now independently motivates exposing those digits.

This is a promising follow-up surface, but expression-rich state naming is cheap. The strongest established claim here is the exact red-cell serialization and the dual DH/BASE29 source match. Any higher-digit H4 interpretation should be frozen against a bounded register before promotion.

## Evidence boundary and next gate

Established by exact arithmetic and source matching:

1. p15 independently reconstructs every public field of the signed source's worked DH example;
2. red 3299 is exactly BASE29 `[e,B^-1,p-1]`;
3. red `3299 + K = 3301`;
4. signed-source `BASE29 3301 = 3QO = [e,B^-1,-g]`;
5. the red cell is unique among the 16 grid cells under both exact predicates.

Not established:

- unknown LP2 body plaintext;
- that every p15 grid cell should be read as BASE29 text;
- that NEXT is a required LP2 continuation;
- that a missing historical server payload contains an LP2 key.

The next discriminating experiment is to freeze a **higher-digit BASE29 receiver rule** from source-visible p15 structure and test it on an original object not used to recognize this dual example. Avoid free state-expression labeling.

Reproducer: [`sims/lp2_p15_signed2013_tcp_dual_example_sft.cjs`](../sims/lp2_p15_signed2013_tcp_dual_example_sft.cjs).
