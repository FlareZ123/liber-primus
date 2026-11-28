# iIIustrious/3301code callback-preservation object graph

**Agent16, 28 November 2026 — Director #3333, incorporating Agent15's independent 2014 IRC deployment witness. Decision: the reachable Git preservation graph does not contain iIIustrious's actual May-2014 callback deployment or its received bytes/logs. A 6 February IRC excerpt attributes creation of a separate executable `/cgi-bin/upload` to this participant, and their own 9 April statements report submission of an onion endpoint plus periodic incoming visits. Together they support active participant-side deployment beyond tutorial code, but do not authenticate the remote caller, POST receipt, host URL, or the deployed CGI binary. Acquire participant-machine/local-backup material rather than re-mining this repository history.**

## Why this changes the branch

The 2014 signed Cicada instruction required a hidden service with an upload receiver at exactly `/cgi-bin/upload`, multipart field `file`, plus a public key at `/key.asc`. A contemporaneous solver transcript records iIIustrious responding to implementation questions:

- `I just did cgi-bin/upload`
- `is a script to upload`
- `made it executable`

The quoted lines support creation of a callback script matching the authored path, **not** direct observation of a deployed file. A separate direct first-person exchange in the [pinned original #cicadasolvers log on 9 April 2014 00:03–00:11 UTC](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%23cicadasolvers.freenode.log#L156324-L156341) explicitly discusses submission of own onion URLs and magic squares; `iIIustrious` says they submitted theirs and have been getting recurring hits on their onion. This adds a contemporaneous operational witness beyond the 2015 import, but the reported hits are **self-reported** and do not identify Cicada or the 2 May callback transaction. [Focused pinned-log extractor](../sims/lp2_2014_iiilustrious_irc_context_sft.cjs) · [CI pass](https://github.com/FlareZ123/liber-primus/actions/runs/46119862176) · [consolidated historical chronology](cicada2014-stage10-to-stage11-original-operator-gate.md#independent-iiilustrious-participant-onion-deployment-witness-agent15-28-november-2026-director-3334). The later Git import contains neither the alleged live script nor any response. This turns the preservation problem from "maybe the generic server directory held uploads" into a typed missing-object problem: original deployed CGI script, output directory, access/error logs, hidden-service root/key material, and any received `message.txt.asc` are absent from the tracked import.

Primary source mirrors:
- signed instruction: `Dukotah/cicada3301@b271334d9718bf68187f7a1e6362731159c36a2a:corpus/A-primary-artifacts/pgp/messages/2014-01-upload-instructions.asc`
- period solver transcript/walkthrough containing the iIIustrious exchange: `Dukotah/cicada3301@b271334d9718bf68187f7a1e6362731159c36a2a:archive/branches-2026/claude_master-roadmap-libra-qk527u/sources/community/scream314_2014.md`

## Exact Git-object audit

Repository: `iIIustrious/3301code`.

The relevant 2015 history is:

| Commit | Meaning |
| --- | --- |
| `b66622a9af72570cd81d82904b225ca088084aae` | root commit, "added local working files" |
| `bb195f61c1c8bdc984bc4beadff9281501d58131` | merge with older repository history |
| `36efd2a66a62d20c8559fd8468a2f50e8a77c5be` | "merging local", duplicates imported tree at root |
| `3e211bdf63f4008af9fe1280344b919e1648ca86` | "deleted extra folder", removes only duplicate nested copy |

The root commit `b66622a` has tree `984cc0824398c7dd8c6f3cc168fcec1a37ce3d63`. Its sole top-level imported directory, `3301code/`, is tree:

`42ed22542a8120ff481481dafe22e11ed7911c4d`

After merge/flatten, commit `3e211bdf` has **that exact same tree SHA `42ed2254...` as the repository root**. Therefore the flatten/delete sequence lost no tracked imported object: the original nested import and the final flattened working tree are byte-identical.

The complete imported tracked tree contains only:

```text
README.md
crib-drag/dictionary.txt
crib-drag/drag.py
crib-drag/dragresults.txt
crib-drag/readme.md
crib-drag/resultsplain.txt
flip.c
ircbot.py
rsaprimitives.py
server/index.html
server/index2.html
server/save_file.py
server/server.py
xor.c
```

There is no tracked `cgi-bin/upload`, `cgi-bin/`, `server/files/`, access log, error log, `.gitignore`, Tor hidden-service configuration, `key.asc`, private key, or callback payload. `b66622a` is a root commit, so there is no hidden parent from which one of those objects could have been deleted before import. The later deletion commit removes only the byte-identical duplicate nested tree.

GitHub branch search exposes only `master`. Repository-name search for `3301code` exposes only the origin repository. Global indexed searches for the exact root/tree/server blob identities did not expose an independent public mirror. These searches do not prove that no private/local clone or unindexed historical fork exists; they close the currently reachable public Git object lane.

## The tracked server files are generic test/upload snippets, not the deployed CGI witness

The imported `server/server.py` is substantially the public test server posted in the 25 January 2014 Stack Overflow question **"HTTP Server Python: how to test it in local?"**: the same `SimpleHTTPServer`/`SocketServer` structure, testing docstring, GET/POST logging markers, `cgi.FieldStorage`, and default port logic appear there.

The upload-writing block in both `server.py` and `save_file.py` also appears in a 17 March 2013 Stack Overflow answer linking an older Codepoint upload example:

```python
if fileitem.filename:
    fn = os.path.basename(fileitem.filename)
    open('files/' + fn, 'wb').write(fileitem.file.read())
```

References:
- https://stackoverflow.com/questions/21348220/http-server-python-how-to-test-it-in-local
- https://stackoverflow.com/questions/15460281/write-files-to-disk-with-python-3-x

This provenance matters because the committed `server/` directory is weak evidence of the actual participant endpoint. Its HTML form posts to `index2.html`, not `/cgi-bin/upload`; the generic `server.py` accepts arbitrary POST paths through its handler; and the standalone saver is named `save_file.py`, not the executable `cgi-bin/upload` that iIIustrious said he created. The simplest reading is that these were development/reference files retained in the local work folder while the real callback deployment lived elsewhere.

## What the public preservation graph does retain

A known common callback object survives independently:

- `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3:2014/010-hidden-service-reply/message.txt.asc`
- Git blob SHA: `adc4a41fab31905ff9417646a14e507a5e1fdb45`
- signed cleartext: "Your enlightenment awaits you" and `ky2khlqdf7qdznac.onion`, with the established prime-count whitespace.

The same archive's README preserves reported request lines for 2 May 2014: GET `/key.asc`, GET `/`, then POST `/cgi-bin/upload` with Cicada user-agent strings. The timestamps are masked as `**:**`; the lines are an archived report, not an independently authenticated raw iIIustrious access log. Current independent corpus work likewise classifies submitted bytes, private keys, raw exchanges, recipient state and private replies as unavailable.

No public object found in this graph binds the preserved common `message.txt.asc` bytes to iIIustrious's machine. Consequently it is not legitimate to infer that the archived common copy is his exact local received file, or that no recipient-specific transport/body variation existed.

## Inaccessible object classes and next acquisition decision

The concrete missing classes are now narrow:

1. iIIustrious's actual executable `cgi-bin/upload` script and its filesystem metadata;
2. the upload target directory and any locally received `message.txt.asc`;
3. raw webserver/Tor access and error logs with unmasked timestamps/headers;
4. the registered onion hostname, served root body, `key.asc`, and associated private key/config;
5. local shell history, terminal scrollback, IRC logs, tarballs, backups or clone working-tree files not committed to Git;
6. collaborator/participant machine images or private archives from iIIustrious, onecool, Surtri, Nox, or other solvers who registered endpoints.

A recovered item should be classified by exact byte length and cryptographic hash, and any callback payload by OpenPGP packet/signature identity. Until one of those participant-local objects appears, further traversal of the four known import/flatten/delete commits cannot recover the missing callback.

**Research consequence:** the repository-history lane is complete enough to reject the assumption that the tracked `server/` tree itself is the missing callback archive. The April 2014 first-person report of a submitted, periodically visited endpoint strengthens the justification to pursue those lost participant-local objects, but does not prove a May 2014 Cicada POST to this particular account. The live-deployment lane remains open through participant-local preservation or an independently archived hidden-service snapshot.
