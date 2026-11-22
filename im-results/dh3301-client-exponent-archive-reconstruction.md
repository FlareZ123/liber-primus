# DH3301 client-exponent archival reconstruction

## Decision

The historical `DH 3301` transcript that contains client public share `2800` still does **not** source-select one of the six discrete-log representatives

```
11, 561, 1111, 1661, 2211, 2761
```

for the Cicada-side secret exponent. No contemporaneous client source, client RNG draw, or response-side transcript found in the checked archives exposes that secret directly.

The archival search did, however, recover two materially stronger constraints:

1. a second organizer-like March 2013 session with client public share `3034`, whose command fingerprint matches the `2800` session closely enough to make fixed-secret reuse a testable hypothesis; and
2. the exact Go server implementation behind a separate three-`DH 3301` organizer session. Its unseeded Go 1.1 `math/rand` stream reconstructs all three otherwise unlogged server bases/publics, and the third base is a primitive root modulo 3301. Recovering only that third client response from any surviving trace would distinguish all six candidates.

These are intermediate constraints, not an exponent recovery.

## Target exchange

Pinned transcript:

- https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/clientlog-1362290293-9.txt

The authenticated-looking organizer test sequence contains:

```
DH 3301
server base = 2757
server secret = 331
server public = 1264
client public = 2800
shared secret = 1067
```

Because `ord_3301(2757)=550`, solving

```
2757^e = 2800 (mod 3301)
```

gives

```
e = 11 (mod 550)
```

and therefore six representatives in `1..3300`:

```
11, 561, 1111, 1661, 2211, 2761
```

Nothing in this exchange alone chooses among them.

## Second organizer-like exchange: public share 3034

Pinned log:

- https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/008-invitation/Nj8gDqFG

The 06:51 session has the same distinctive client workflow as the `2800` transcript:

- Telnet negotiation bytes;
- `RAND 3`, `RAND 3`, `RAND 0`, `RAND 1`;
- `QUINE`;
- `BASE29 1033`;
- four `KOAN` requests;
- `DH 3301`;
- signed invitation delivered through `NEXT`;
- malformed `DH` near the end.

Its client public share is `3034`.

Modulo 3301,

```
ord(3034) = 75
```

If the same fixed client exponent `e` was reused in both organizer sessions, `3034` must lie in the image of the map `x -> x^e`. This condition rejects the two candidates with `gcd(e,3300)=33`:

| e | gcd(e,3300) | Can x^e = 3034 mod 3301? |
|---:|---:|:---:|
| 11 | 11 | yes |
| 561 | 33 | **no** |
| 1111 | 11 | yes |
| 1661 | 11 | yes |
| 2211 | 33 | **no** |
| 2761 | 11 | yes |

So **under fixed-secret reuse only**, the candidate set narrows to

```
11, 1111, 1661, 2761
```

This is not an unconditional elimination because the surviving evidence does not establish that Cicada reused one DH exponent across applicant servers.

## Three-DH Go server reconstruction

Historical command log:

- https://github.com/cicada-solvers/optimisticninja_cicada3301/blob/c895e6b3b43d06dd2071fdab12694f73c2805c12/2013/04.leaks/tclping/ping.txt

Recovered matching server source:

- https://github.com/cijhho123/cicada3301/blob/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/2013/additional%20files/Scripts/example%20TCP%20server%20coded%20in%20Go.txt

The log records the same organizer-style prelude and then three consecutive `DH 3301` commands. The source matches the log format and port and uses:

```go
b := big.NewInt(rand.Int63n(23) + 3)
s := big.NewInt(rand.Int63n(math.MaxInt64-3301) + 3301)
```

It imports `math/rand` and never calls `rand.Seed`.

Go 1.1.2's source states that the package-level generator is initialized with `NewSource(1)` and behaves as if seeded by `Seed(1)` when `Seed` is not called:

- https://github.com/golang/go/blob/go1.1.2/src/pkg/math/rand/rand.go

Before the first DH, the logged command sequence consumes exactly seven `Int31n(256)` draws from the RAND requests and four `Intn(...)` draws from the four KOAN requests. The four KOAN draws do not hit the rejection branch for any realistic koan-directory size, so their unknown modulus does not change the subsequent RNG state.

Replaying the Go 1.1 stream gives:

| exchange | base b | server secret s | server public A=b^s mod 3301 |
|---:|---:|---:|---:|
| 1 | 23 | 1976235410884494875 | 1473 |
| 2 | 20 | 2933568871211448816 | 2958 |
| 3 | 19 | 2610529275472648269 | 236 |

The reproduction program is in `sims/dh3301_go11_replay.go`.

### Why exchange 3 is decisive

The relevant base orders are:

```
ord(23) = 1650
ord(20) = 550
ord(19) = 3300
```

Thus base 19 is a primitive root modulo 3301. If the client used one of the six target exponent representatives, the third client public response would be:

| exponent e | 19^e mod 3301 |
|---:|---:|
| 11 | **218** |
| 561 | **172** |
| 1111 | **3255** |
| 1661 | **3083** |
| 2211 | **3129** |
| 2761 | **46** |

A surviving response-side trace containing the server line

```
01 OK 19 236
```

and the immediately following client integer would therefore select one representative exactly, assuming the target exponent was reused in this organizer session.

For completeness, the first two reconstructed exchanges would give:

| e | base 23 response | base 20 response |
|---:|---:|---:|
| 11 | 660 | 1587 |
| 561 | 315 | 1587 |
| 1111 | 2326 | 1587 |
| 1661 | 660 | 1587 |
| 2211 | 315 | 1587 |
| 2761 | 2326 | 1587 |

The third exchange carries all six-way discrimination.

## Response-side archival recovery (#1620)

The bounded follow-up searched specifically for the client integer returned after the reconstructed third server response `01 OK 19 236`. No contextual response was recovered. The six target representatives therefore remain

```
11, 561, 1111, 1661, 2211, 2761
```

with corresponding third replies `218, 172, 3255, 3083, 3129, 46`.

### What survives

The pinned `cicada-solvers/optimisticninja_cicada3301` `tclping` directory at commit `c895e6b3b43d06dd2071fdab12694f73c2805c12` contains exactly two entries: empty `.gitkeep` and the 1,113-byte command-only `ping.txt`. The log records the three `DH 3301` command timestamps but no server payload, client public share, or shared secret.

The matching Go server source explains the loss. Its DH handler reads the client line into `e2`, computes the shared value, and writes `03 DATA k`, but the logger is called only in the outer command dispatcher. It records `executing 'dh 3301'`; it never records `01 OK b A`, the client `e2`, or `03 DATA k`. Thus the target response cannot be reconstructed from that server log even though the server-side RNG stream fixes `(b,A)=(19,236)`.

Two independent public descendants preserve the same command-only evidence rather than a fuller trace:

- `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`, `2013/007-fourth-onion/README.md`;
- the contemporaneous Uncovering Cicada page “NEWS! TCP Servers had been tested!”, which also preserves participant chat around the pings.

Neither contains a DH response integer.

Exact indexed searches for `01 OK 19 236`, the 11:00:29 third-DH timestamp paired with each of the six predicted replies, the loopback endpoint `127.0.0.1:42483`, and the exact command-log signature found no contextual response-side trace in the checked public corpus.

### Exact archive gap

The GitHub mirror is not a historical Git clone. Its sole import commit explicitly says the original `optimisticninja/cicada3301` project came from GitLab and that the commit history was deleted during the 2022 GitHub migration. The referenced original GitLab project was not retrievable through the available public index during this search. Consequently the following source classes remain genuinely uncovered rather than disproven:

1. pre-2022 GitLab history, deleted blobs, attachments, or branches from `optimisticninja/cicada3301`;
2. the participant's local terminal capture, packet capture, or private logs;
3. contemporaneous IRC/paste material that was never mirrored or is no longer indexed.

A future recovery from one of these classes must preserve the surrounding server line `01 OK 19 236` or equivalent session/timestamp context. A bare occurrence of one candidate integer is not evidence.

## Research decision

**Bounded negative.** No response is present in the checked public corpus, and archive coverage is incomplete in the specific classes above. Preserve all six exponent representatives and stop this exponent branch. Do not rank them from LP2 arithmetic and do not promote the conditional same-secret-reuse hypothesis.

If an authentic response-side trace is later recovered, compare exactly against:

```
218, 172, 3255, 3083, 3129, 46
```

Only a contextual match plus evidence that the same client secret or implementation is relevant to the p57-selected `2800` session would justify selecting one exponent.
