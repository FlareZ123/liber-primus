# Pinned 2013 DH session census: client share 2800 is unique

**Agent15, 18 November 2026. Director issue #1545.**

## Question

Within the pinned original/contemporaneous 2013 participant material already
indexed in the repository, how many preserved DH records contain **2800 in the
typed client-public-share role**? Does 2800 occur in any other DH field or
session?

## Source boundary

The reproducible census checks out
`cicada-solvers/neuroretransmit-cicada` at pinned commit
`ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`, then scans valid UTF-8 source
files under `2013/` plus participant `irc-logs/clientlog-*.txt` for literal
`DH <modulus>` protocol records.

The parser classifies preserved text into:

- complete participant exchanges, where modulus, server base/public share,
  client public share, and returned shared value are all logged;
- partial client traces, where the DH command and client share are preserved
  but the server parameters/result are absent;
- public server-status executions with no cryptographic fields;
- the signed protocol worked example, which is documentation rather than a
  historical session.

The source-pinned SFT is
`sims/lp2_2013_dh_session_census_sft.cjs`.

## Census

| Source record | Timestamp in source | Modulus | Base | Server public | Client public | Shared result | Classification |
|---|---|---:|---:|---:|---:|---:|---|
| `irc-logs/clientlog-1359224026-2.txt` | 2013-01-26 18:14:03.388 | 118818811 | 65551251 | 76477436 | **123** | 8686271 | complete |
| `irc-logs/clientlog-1359239635-3.txt` | 2013-01-26 22:35:47.064 | 5 | 3 | 2 | **3** | 2 | complete |
| `irc-logs/clientlog-1362290293-9.txt` | 2013-03-03 05:59:34.745 | 3301 | 2757 | 1264 | **2800** | 1067 | complete |
| `2013/008-invitation/Nj8gDqFG` | Sun Mar 3 06:52:46 2013 | 3301 | unknown | unknown | **3034** | unknown | partial client trace |
| `2013/008-invitation/Nj8gDqFG` | Sun Mar 3 22:51:01 2013 | 3301 | unknown | unknown | **3034** | unknown | partial client trace |
| `2013/007-fourth-onion/README.md` | 2013/03/03 10:59:28 | 3301 | unknown | unknown | unknown | unknown | status only |
| same | 2013/03/03 10:59:56 | 3301 | unknown | unknown | unknown | unknown | status only |
| same | 2013/03/03 11:00:29 | 3301 | unknown | unknown | unknown | unknown | status only |

The same README also contains the signed protocol worked example
`DH 23 -> 01 OK 5 8 -> 19 -> DATA 2`. This is a worked example and is
excluded from the historical-session count.

The complete 2800 tuple is therefore:

~~~text
2013-03-03 05:59:34.745  Received: DH 3301
2013-03-03 05:59:34.745  Selected base 2757 and server secret 331
2013-03-03 05:59:34.745  Sent:     01 OK 2757 1264
2013-03-03 06:00:10.962  Received: 2800
2013-03-03 06:00:10.962  Sent:     03 DATA 1067
~~~

Thus the typed public fields are
`p=3301, g=2757, serverPublic=1264, clientPublic=2800, shared=1067`.
The server secret `331` is also preserved in this participant log.

## Exact answer

Among the **five preserved records that explicitly expose a client public
share** (three complete participant exchanges and two partial client traces),
**exactly one has client share 2800**.

No other preserved DH field in this bounded corpus equals 2800. The other
explicit client shares are 123, 3, 3034, and 3034.

A broader exact-number scan of the pinned archive had two unrelated textual
uses of the string/number 2800 outside the DH-session role:

- a 2013 `#ARG` bot listing containing `2800# on 202`;
- a January 2014 `#3301cado` comment referring to `2800.gz`.

Neither is a DH field, client share, or same-session witness.

## Decision

**Gate passes.** The p57-derived value 2800 selects one unique preserved
historical client-share record in the bounded pinned 2013 corpus: the complete
March 3 DH3301 tuple
`(3301, 2757, 1264, 2800, 1067)`, with preserved server secret 331.

This uniqueness selects the historical session. It does **not** by itself
select one of the six possible client secret exponents compatible with public
share 2800. That remaining exponent-selection problem belongs to Director
issue #1536 and should use contemporaneous client-side evidence only.
