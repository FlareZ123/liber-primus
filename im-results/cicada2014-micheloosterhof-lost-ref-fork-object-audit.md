# Live-period `micheloosterhof/cicada-2014` ref/fork object-graph audit

**Date:** 2026-11-28  
**Issue:** #3355  
**Scope:** Stage10/Stage11 transaction artifacts only: submitted POST bytes, server acceptance/response captures, participant callback uploads, request/response headers, local HTTP logs, and closely related solver-side raw response material.

## Decision

This is a **bounded negative over the accessible GitHub object graph and fork network**. No newly recovered Git object contains a Stage10 POST body, a participant `/cgi-bin/upload` receipt, a callback file, a raw Stage10 acceptance transaction, or a Stage11 HTTP capture beyond the already-known mirrored page/image material.

Prior issue **#551 already isolated** `~/cicada-2014/stage10/tmp/log` as the precise missing `wget -S` capture target. This audit does not claim that path as a new discovery. Its additional contribution is to bound the **lost-ref/fork/object-graph rival** requested by #3355: the public fork network and reachable alternate heads were enumerated and do not preserve that untracked runtime directory or a Stage10/11 transaction object. A maintainer filesystem backup or independently archived working-tree copy remains the motivated acquisition target; ordinary public Git refs/forks do not satisfy #2989.

No plaintext or key is claimed.

## Upstream reachable history

Repository: `micheloosterhof/cicada-2014`, created 2014-01-10.

Accessible surfaces checked: the single current `master` head; all-state pull requests (none); releases (none); accessible tag-ref namespace; the visible commit chain through the live 2014 Stage10/11 work; current code search for transaction vocabulary; and commit-message search for upload/callback/response/POST/cgi/HTTP/squares/log terms.

The Stage10/11 history is compact:

- `3b15257c5a9efada85b8ccfdb876e2ec934d5b90` (2014-02-13, **stage 10 added**) adds the signed form, three response JPEGs, a short README, and the 152-byte `squares` response. The form asks for the three magic squares and participant onion, specifies participant paths `/cgi-bin/upload` and `/key.asc`, and posts to `/cgi-bin/squares`. These are known server instructions/static response objects, not a captured successful transaction.
- `6c3421a4d245596e403c88e037509d162a2afd17` (2014-05-11, **new data**) adds the signed Stage11 handoff plus `ky2khlqdf7qdznac.onion/index.html` and `0.jpg` through `57.jpg`. The index is the known `<title>133</title>` / `<div id="331">` image list.
- Subsequent May commits add only local decoding/transcription products: `49/50/51.txt/.dec`, `56.bin`, `56.txt/.decoded/.runes/.py`, `57.decoded`, `decimal.txt`, `decimaltobyte.pm`, and `sexagesimal.bin`; `5431b03eacf15d27c5f02eae860efcfdb7f1917b` preserves the known whitespace-bearing signed handoff.
- The 2 June commits rename stage directories and move already-known onion files under onion-named subdirectories. Their Stage10/11 path changes introduce no transaction artifact.

The recursive trees at `c2dcbfdb23abf4b08064b3e2f37294b134741cbe` and live-period June head `b1d7412afae69e4109223dd8561ae57b73ac4798` were enumerated. Neither contains a path matching `tmp`, `log`, `access`, `request`, `response`, `callback`, `header`, or an upload receipt.

## Previously established untracked HTTP capture surface

Issue #551 had already established the `tools/check-onions.sh` / `stage10/tmp/log` source-availability boundary. It is repeated here only because #3355 specifically asks whether forks/lost refs recover that missing runtime output.

It was introduced at `86cb5c36159ba210fc81752d0fce99fb02200285` on 2014-02-03. Its initial behavior was:

- `cd ~/cicada-2014/stage10/tmp`;
- append a separator and `date` to `log`;
- run `torify wget -S` against known onion sites, appending stdout/stderr to `log`.

At `b0eadcce6af484e2fc6489cfc7d813e2efd58ada` on 2014-02-05 it changed each fetch to `wget -r --mirror -S`, so the working directory would hold a recursive mirror while `log` retained server-response diagnostics.

At `c2dcbfdb23abf4b08064b3e2f37294b134741cbe` on 2014-06-02 the script added:

```
torify wget -r --mirror -S http://ky2khlqdf7qdznac.onion >> log 2>&1
```

This is a historically motivated path to Stage11 response metadata, including headers emitted by `wget -S`, rather than a modern reconstruction.

However, GitHub commit-by-path history returns **zero commits** for:

- `stage10/tmp`
- `stage10/tmp/log`
- `log`
- `stage10/tmp/ky2khlqdf7qdznac.onion/index.html`

and the live-period recursive Git trees contain no such directory. The script therefore proves a local capture workflow existed, while the generated working-tree material is outside the surviving reachable Git object graph.

This does not prove the script successfully fetched the seventh onion on 2 June or that a historical local `log` still exists anywhere. It narrows the missing evidence to a named filesystem location and capture procedure.

## Fork/network census

The public network reports 21 forks. Their accessible branch heads collapse to four materially distinct lineages:

1. **June-2014 upstream snapshot** `b1d7412afae69e4109223dd8561ae57b73ac4798`. Numerous direct forks, including `cicada-solvers/document-cicada-2014-micheloosterhof`, point exactly here and add no divergent object history.
2. **Kenorb fork** `kenorb/cicada-2014`, created 2014-08-18, head `0f1ebe4a7ce6e473d6f56ea1024dec76d3639362`. It adds four fork-only 2014 commits: JPEG-string extraction/output, a post-FFD9 JPEG-tail helper, a generic onion-address database, and an MD5/SHA1 onion-name hash checker. None is a Stage10/11 POST, server response, callback log/file, or request capture. Nested forks preserve the same head.
3. **Grevutiu fork** head `4c3b53dd4798ee81e4da616907acba5b5aee3949`: one 2015 README edit adding `http://` to an early-stage Imgur `wget` command; no Stage10/11 object.
4. **Later upstream cleanup heads** `8f22c45ad14c0520cea08479378e8c1476180c88` / `d2bb5ac1d957ff5de70c24303d0f5e3cfb3152aa`, reproduced by later forks; they reorganize/modernize the same repository and do not supply a new live-period transaction source.

No accessible fork exposes an alternate branch containing `stage10/tmp` or a transaction capture.

A bounded web search for independently mirrored/bare-clone material found the public `cicada-solvers` archival fork, whose visible history reports the same 75-commit upstream lineage and whose head is the June-2014 snapshot. No independently preserved divergent pack or archived working-tree copy surfaced.

## Consequence for the solve frontier

For #3355, the strongest rival wins: the **reachable public repository history behaves as a clean puzzle/solver mirror, not a repository of participant-side callback traffic**. This extends #551's current-tree availability boundary across the accessible fork/ref network; it does not supersede or rediscover #551.

For #2989, do not spend more effort mining ordinary branches/forks of this repository for the exact successful Stage10 POST. The Git object graph contains the form and static response but not the transaction.

The justified follow-up acquisition target is narrower:

> a historical working-tree/filesystem backup from the maintainer (or an independently archived clone made with untracked working files) containing `~/cicada-2014/stage10/tmp/`, especially `log` and its recursively mirrored onion directories.

Such a recovery could carry timestamped `wget -S` response headers for the seventh onion and earlier stages. It still would not automatically contain the participant's own incoming `/cgi-bin/upload` callback or Stage10 POST; those require separate local/server artifacts.

## Reproducibility anchors

- Stage10 add: `3b15257c5a9efada85b8ccfdb876e2ec934d5b90`
- Stage11 add: `6c3421a4d245596e403c88e037509d162a2afd17`
- Whitespace-preserving signed handoff: `5431b03eacf15d27c5f02eae860efcfdb7f1917b`
- Onion-checker introduction: `86cb5c36159ba210fc81752d0fce99fb02200285`
- Recursive-mirror conversion: `b0eadcce6af484e2fc6489cfc7d813e2efd58ada`
- Seventh-onion checker addition: `c2dcbfdb23abf4b08064b3e2f37294b134741cbe`
- Live-period June upstream head: `b1d7412afae69e4109223dd8561ae57b73ac4798`
- Kenorb divergent head: `0f1ebe4a7ce6e473d6f56ea1024dec76d3639362`
