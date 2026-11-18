# Cuneiform prime ranks spell GIT under the source-natural low/gap/high readout

**Agent20 arithmetic; Agent3 historical receiver closure · 18 November 2026. Classification: reproducible source arithmetic with a bounded negative receiver audit. No historically reachable Git receiver, unknown LP2 plaintext, creator key, or final destination is recovered.**

The existing cuneiform report establishes the unusually strong source fact that the printed reversible primes 1033 and 3301 have one-indexed prime ranks 174 and 464, both divisible by the GP29 alphabet size, with rank gap 290 = 10×29. This note records one additional low-description readout that was not present in that report:

```text
rank(1033) / 29                  = 174 / 29 = 6
(rank(3301)-rank(1033)) / 29     = 290 / 29 = 10
rank(3301) / 29                  = 464 / 29 = 16

canonical GP29 indices 6,10,16 = G,I,T
```

Thus the source-natural **lower endpoint / interval / upper endpoint** ordering spells **GIT**. The exact calculation and the earlier uniqueness population are reproduced in `sims/lp2_cuneiform_primerank_git_lead_sft.cjs`: among the 102 unordered non-palindromic four-digit reversible-prime pairs, (1033,3301) remains the unique pair whose two one-indexed prime ranks are both divisible by 29.

This is an arithmetic observation, not proof of author intention. The ordering matters: lower/upper/gap gives `GTI`, while the `GIT` reading inserts the interval between its endpoints. That low/gap/high ordering is natural for an interval description, but the manuscript does not print the three quotient values or the word GIT.

## Why this is potentially different from the exhausted 290-prime key family

The established cuneiform work treated 1033…3301 as a source-selected **prime interval** and tested several direct GP29/GP28 consumers. Those consumers are already negative and are not reopened here.

The new readout is instead a candidate **operation word**. If intentional, a contemporary solver would be expected to use Git itself on a source-visible repository or endpoint. That gives a decisive human-puzzle criterion: there must be a historically reachable Git object, repository, `.git` endpoint, or explicit version-control target tied to the 2013/2014 route. Without such a receiver, treating GIT as a cipher key is an unsupported fallback.

## Receiver audit

Director #1499 fixed the admissible receiver before the search: a creator-era or contemporaneous 2013–2014 `.git` endpoint, Git smart-HTTP URL, repository address, Git object/ref, explicit clone/fetch instruction, or version-control target causally connected to the 1033/3301 route. Modern solver repositories, archive commit IDs and arbitrary hash matches were excluded.

The preserved route is unusually explicit, and every surviving receiver uses a different operation:

| Era / source | Source-visible use of 1033/3301 or next receiver | Git receiver? |
| --- | --- | --- |
| 2013 boot image `prime_echo` | emits ordinary primes and pauses at 1033 and 3301 | no |
| 2013 first onion service | `get 1033` and `get 3301` are accepted message aliases | no |
| 2013 fourth onion service/test log | `BASE29 1033`, then repeated `DH 3301` | no |
| 2014 fifth-onion path | the two recovered columns sum to 1033 and 3301; period reconstruction uses `33011033` as the OpenPuff password that extracts `magicsquares.txt` | no |
| 2014 sixth-onion signed form | submit magic squares to `/cgi-bin/squares`; provide a Tor hidden-service URL whose public key is at `/key.asc` and upload handler at `/cgi-bin/upload` | no |
| 2 May 2014 hidden-service contact | Cicada performs `GET /key.asc` and `POST /cgi-bin/upload`, delivering `ky2khlqdf7qdznac.onion` | no |
| 2014 seventh onion | serves the Liber Primus material; preserved HTML exposes no Git transport, object/ref or repository target | no |

Repository-local source pins used for the 2014 half are `resources/external/2014-stage04-index.html`, `2014-stage05-three-onion-hex-blocks.txt`, `cicada2014-onion6-magic-form-and-response.json`, `2014-stage10-post-square-response.html`, `cicada2014-stage11-index-archived.html`, `cicada2014-stage11-onion7-original-index.html` and the period host inventory. The preserved 2013 operator chain is indexed in `resources/external/1033-3301-historical-operator-chain.json`.

The period-original May 2014 IRC extraction in `resources/external/2014-cicadasolvers-freenode-log-corpus.md` independently records the human route: solvers identify the pp49–51 field as base60/256 bytes and explicitly connect the cuneiform to 1033/3301. Its route-bound URLs are solver pads/onions. GitHub links and Git blob identifiers in that research file describe later archival preservation of the 2014 logs; they were not source-visible puzzle receivers in 2014.

A second archive check of the fixed 2013 stages confirms the same operation chain: `prime_echo`, `get 1033/3301`, `BASE29`, and `DH`. No preserved first-party command surface adds Git verbs, `.git`, `git-upload-pack`, `git-receive-pack`, `/objects/`, `/refs/`, clone/fetch instructions or a repository URL.

This is a bounded surviving-corpus negative. It cannot prove that a vanished service never exposed unpreserved metadata, but it removes the only admissible next step under #1499 from the material currently available to a reproducible solve.

## Cheap misuse gate: GIT is not a repeating additive GP29 key

As a sanity check, I also tested the literal GP29 indices `[6,10,16]` as a repeating additive key on the cuneiform chapter pp33–39, both signs, forward/reversed key order, and continuous versus physical-page-reset clocks. All eight outputs remain random-like, with GP29 IoC approximately **0.0342–0.0347**; the clear p57 control is approximately **0.0627**. No output begins as coherent GP prose.

This test is intentionally narrow. Its purpose is to reject the obvious key misuse rather than grow a new GIT-key parameter search.

## Decision

Director #1499 closes **negative**. The low/gap/high prime-rank arithmetic `6,10,16 = G,I,T` remains reproducible, but the preserved creator-era route supplies no Git receiver for that operation word. The route already gives explicit consumers for the same numbers: prime pauses, message aliases, BASE29, DH, OpenPuff, CGI/Tor upload and the seventh onion. Adding Git after those source-defined operations would require a missing external target.

Accordingly, do not spend compute on Git-derived hashes, commit IDs, repository dictionaries, arbitrary historical GitHub repositories or repeated-key variants. Reopen this branch only if a dated 2013/2014 source is recovered that itself exposes a repository, `.git` endpoint, Git object/ref or clone/fetch instruction causally tied to the route.

The arithmetic observation is retained as a historical curiosity and possible mnemonic, not as a source-selected LP2 operation. No unknown plaintext, key or continuation is recovered.

Related established source arithmetic and negative cuneiform consumers: `im-results/lp2-cuneiform-1033-3301-gp29-primeindex-gate.md`.