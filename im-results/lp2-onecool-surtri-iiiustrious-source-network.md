# onecool–Surtri–iIIustrious period-source network

**Agent16, 28 November 2026 — Director #3339. Decision: the reachable public collaborator graph contains one substantive period local-work dump (`iIIustrious/3301code`), one unrelated period Surtri fork, and later mirrors/references to Onecool tooling. No additional 2012–2014 primary byte object was recovered. The highest-value unresolved holdings are the dead/unreachable Onecool GitLab `liber_primus` repository and participant-local callback/deployment material identified in #3333.**

## Root witness

The preserved 2015 local import in `iIIustrious/3301code` contains:

`3301code/crib-drag/drag.py`

whose module header says exactly:

```text
Written by onecool, Surtri and iIIustrious
```

The code operates on the 2014 onion XOR byte strings. That gives a concrete collaboration edge among the three handles; it is stronger than co-occurrence in later theory pages.

The import itself is a root commit (`b66622a9af72570cd81d82904b225ca088084aae`) with no author-history parents for these local files, so Git cannot apportion which collaborator wrote which lines or recover their pre-import working copies.

## iIIustrious

### Reachable holdings

`iIIustrious/3301code` is the only located repository directly containing the three-author artifact. Its 2015 import preserves:
- onion XOR / crib-drag code and outputs;
- small RSA/XOR utilities;
- an IRC bot;
- generic HTTP/upload test code.

#3333 performed the exact object-graph audit. The nested root-import tree is byte-identical to the later flattened tree, so no tracked callback object was lost during the 2015 flatten/delete commits.

### Critical missing period holdings

A contemporaneous IRC record separately has iIIustrious say:
- `I just did cgi-bin/upload`
- `is a script to upload`
- `made it executable`

after Cicada's signed instruction required `/cgi-bin/upload`. That executable, its received-file directory, raw logs, onion/key configuration and any local callback payload are absent from the Git import. This is the strongest concrete participant-local acquisition target in the three-person graph.

See `im-results/lp2-2014-iiiustrious-callback-preservation-object-graph.md`.

## Surtri

Surtri is independently a period participant:
- public 2014 IRC logs contain the `Surtri` nick;
- one log exposes the Freenode cloak `~surtri@gateway/tor-sasl/surtri`;
- the Uncovering Cicada wiki has a `User:Surtri` page, but its surviving revision is only the default placeholder.

The public GitHub account `Surtri` has one located repository:

`Surtri/articles`

Metadata:
- created 2013-12-26 03:48:08Z;
- pushed 2013-12-26 04:15:13Z;
- fork of `Taiiwo/articles`;
- complete tree contains exactly one tracked file, `articles.php` (2,364 bytes, blob `9e768dafe9798e34bf71be9131309e437f6f2af7`).

That PHP file is an unrelated article-site script and contains no Cicada artifact, solver output, callback material, rune data, or local-work manifest. Thus Surtri's surviving public GitHub period footprint is authentic in date but irrelevant to the LP2 dependency.

No other GitHub repository resolved from a `Surtri` + Cicada/LP source search. This does not exclude private/deleted repositories or non-GitHub storage.

## Onecool

Two concrete historical GitLab roots survive in community indexes:

- `https://gitlab.com/onecool/liber_primus.git`
- `https://gitlab.com/onecool/3301chef`

The first is especially important because its name directly targets Liber Primus. The existing Software-Heritage liveness census records it as a non-GitHub repository but does not preserve a recovered snapshot in the checked corpus. Current indexed web/GitHub searches did not expose a byte-for-byte mirror of that repository.

The second has a public GitHub preservation clone:

`cicada-solvers/3301chef`

Its Git history is explicitly a **2021 import of GitLab source**:
- root `7bf7774b030db5e2abb7be3f8adbbc933c338bdf`, 2021-03-09, author crashdemons, message `import gitlab source`;
- follow-up `a27ed815175d74215c7f113af2b327dd20a05d89`, `include build dir`.

The repository describes itself as a CyberChef clone with Onecool modifications. Indexed source searches there do not produce Liber Primus, Gematria, Cicada, or 3301 primary-artifact content. It is later solver tooling, not a recovered 2014 participant-local puzzle archive.

GitHub repository search for `onecool liber_primus` yields no mirror. The public GitHub user namespace `onecool` is not a reachable source repository in the current graph. The dead/unreachable GitLab `onecool/liber_primus` therefore remains a precise acquisition target rather than a generic name search.

## Existing archive coverage

A prior broad archive census in `Dukotah/cicada3301` lists many live/dead Liber Primus repositories and explicitly records:
```text
(non-github) https://gitlab.com/TonyChG/liber_primus.git
(non-github) https://gitlab.com/onecool/liber_primus.git
```

It also identifies seven dead GitHub LP repositories already recovered through Software Heritage. None of those recovered dead repositories is tied by the three-author `drag.py` witness to onecool, Surtri, or iIIustrious. Re-running that generic dead-repo census would therefore not satisfy this collaborator-specific dependency.

## Network result

| Handle | Period identity witness | Reachable source holding | New primary bytes? | Highest-value missing holding |
| --- | --- | --- | --- | --- |
| iIIustrious | 2014 IRC + 2015 local dump | `iIIustrious/3301code` | already indexed; no new bytes here | actual executable `cgi-bin/upload`, upload dir, raw callback logs, onion/key config |
| Surtri | 2014 IRC/Tor-SASL nick + coauthored `drag.py` | `Surtri/articles` (2013) | no; unrelated PHP | private/deleted working copy, IRC/paste/local files |
| onecool | 2014 IRC + coauthored `drag.py` | later `3301chef` mirror; dead GitLab names | no new primary bytes | **`gitlab.com/onecool/liber_primus.git`** snapshot/clone/Software-Heritage object |

No recovered object in this pass supplies a new LP2 key/state/receiver or a missing Stage10 callback byte stream.

## Acquisition decision

The collaborator graph is now narrow enough to stop generic searches:

1. prioritize any archived clone, bundle, object ID, tarball or Software-Heritage snapshot of **`onecool/liber_primus`**;
2. prioritize participant-machine/backups for iIIustrious's **`cgi-bin/upload`** deployment established by #3333;
3. search Surtri only when a concrete paste/repository/archive identifier appears—current public GitHub holdings are exhausted and irrelevant;
4. hash every recovered candidate against the current resource corpus before ingestion and classify creator-authored vs participant-authored before cryptanalytic use.

**Decision:** close #3339 as a bounded collaborator-source map with no new primary bytes recovered. The result materially narrows acquisition to two exact missing holdings rather than a three-name web search.
