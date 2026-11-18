# Cuneiform prime ranks spell GIT under the source-natural low/gap/high readout

**Agent20 · 18 November 2026. Classification: intermediate source-arithmetic lead, unresolved receiver. No unknown LP2 plaintext, creator key, or final destination is recovered.**

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

I searched the currently indexed creator-era primary-artifact corpus for `git`, `.git`, `github`, and `gist`; no Git target occurs there. I also searched preserved 2014 archive/walkthrough material for an exact Git endpoint associated with the cuneiform numbers or the historical onion route.

The Git/GitHub/Gist strings that do occur in broad community archives are later solver infrastructure and mirrors, including modern GitHub repositories and solver transcriptions. They do not establish a creator-authored Git receiver. No preserved first-party URL, onion path, or downloaded artifact found in this audit tells a 2014 player to clone, fetch, inspect history, or request a `.git` object.

This audit is bounded by the indexed surviving corpus. It does not prove that a vanished 2014 service never exposed Git metadata.

## Cheap misuse gate: GIT is not a repeating additive GP29 key

As a sanity check, I also tested the literal GP29 indices `[6,10,16]` as a repeating additive key on the cuneiform chapter pp33–39, both signs, forward/reversed key order, and continuous versus physical-page-reset clocks. All eight outputs remain random-like, with GP29 IoC approximately **0.0342–0.0347**; the clear p57 control is approximately **0.0627**. No output begins as coherent GP prose.

This test is intentionally narrow. Its purpose is to reject the obvious key misuse rather than grow a new GIT-key parameter search.

## Decision

Preserve **GIT** as a compact, reproducible source-arithmetic **operation lead**, because it follows directly from the already exceptional prime-rank divisibility and a natural endpoint/gap ordering. Do not promote it to an authored instruction until a creator-era Git receiver is recovered.

Do not spend compute on Git-derived hashes, commit IDs, repository dictionaries, or repeated-key variants. The next admissible positive is historical: a source-visible 2013/2014 repository, `.git` endpoint, Git object reference, or explicit Git operation causally connected to the manuscript. If such an object is recovered, inspect exactly that fixed history/object and require it to yield a source-derived key, operation, file, or LP2 prediction.

Related established source arithmetic and negative cuneiform consumers: `im-results/lp2-cuneiform-1033-3301-gp29-primeindex-gate.md`.


## Independent full-2014 IRC receiver census (Agent1, #1499 owner)

Agent1 independently scanned the three pinned original IRC blobs used elsewhere in this repository, verifying their byte counts and Git blob SHA-1 identities before parsing:

- `#cicadasolvers.freenode.log`: 18,487,233 bytes, blob `bdd277c14f94c34b5ae714cd00c238065beeed4e`;
- `#cicadasolvers.freenode.2.log`: 27,234,234 bytes, blob `72634a9d071d32af767edbffc0493d810e88cd0d`;
- `#33012014.freenode.log`: 8,629,610 bytes, blob `a2880b1db31ce523599ef30ca2e55291bf295900`.

Across **385,265 dated 2014 lines**, the fixed census found **5 direct Git-endpoint-shaped URLs, 0 explicit Git clone/fetch/pull/ls-remote commands, 116 Git-hosting URLs, 315 generic Git/repository lines, and 43 bare 40-hex strings**. All five direct endpoint hits are participant links to the **Tor Project torspec Gitweb repository**, used to discuss hidden-service protocol details; four happen to lie near broad route terms and one is in October, but none is a Cicada repository, object/ref or puzzle receiver.

A same-line route-plus-40-hex screen leaves one distinct value, repeated twice: `8c12a10087bd6a798609216c13c8fdcf6773ea0d` in November 2014 beside “Good luck. 3301”. The log itself marks the poster as trolling: participants ask for a PGP signature, note only that it could syntactically be SHA-1, and the user is kicked for trolling minutes later. It is not a creator-authenticated Git object or route-bound receiver.

This closes the surviving-log loophole left by a source-file-only audit. Reproduction is `sims/lp2_2014_cuneiform_git_receiver_sft.cjs`; successful full census run: GitHub Actions `44389648193`. The exact creator-stage route audit above remains the stronger causal evidence; this full-log census independently shows that contemporaneous public solver traffic does not preserve a hidden Git receiver either.
