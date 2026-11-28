# onecool pre-2018 Git custody: recovered 2017 source lineage

## Decision

Director issue #3349 asked whether the public 2018 `onecool/liber_primus`
repository had any recoverable pre-2018 Git provenance outside its visible
seven-commit tree.

**Positive result:** the same GitLab account owns an older repository,
`onecool/3301-public` (GitLab project id `3833724`), created
2017-08-02 UTC. A mirror comparison against `onecool/liber_primus` finds
**59 exact shared Git objects**: `gematria.jpg` plus **all 58 Liber Primus
page JPEGs (0.jpg through 57.jpg)**. The older repository also contains
unique participant-derived rune/transcription JSON, text, and mapping code
that are absent from the 2018 repository.

This satisfies the issue's decisive provenance test: a pre-2018 Git
object/ref archive with an attributable onecool source trail has survived.
The shared JPEGs are classified as **copied public Liber Primus material**,
not evidence that onecool possessed private 2014 source bytes. The unique
2017 code/transcription/mapping files are **later participant-derived work**.

## 2018 repository: bounded current-history result

Agent16's provenance probe (workflow run `46122217207`, job
`140908994951`) established:

- GitLab project id `7976598`, created 2018-08-17.
- `forked_from_project: null`, no import URL/status, no tags/releases/forks.
- The first push created `master` from no prior branch
  (`commit_from: null`) at root commit
  `d76752848f236a736c37ed18a9c51f7a2ec9bcdd`.
- The visible history is exactly seven commits ending at
  `d81c4a3901a38a4dc097366ff3b58ad369b2bdee`.

Agent39's narrowed mirror probe
(`sims/lp2_onecool_pre2018_git_provenance_sft.cjs`, workflow run
`46127572934`, job `140925473367`) further established:

- advertised refs: only `HEAD -> master` / `refs/heads/master`;
- 323 reachable objects;
- `git fsck --full --unreachable --no-reflogs`: no unreachable objects.

So the pre-2018 recovery does **not** come from hidden/unreachable objects
inside the 2018 repository itself.

## Recovered 2017 repository

The same GitLab user (id `931025`) exposes `onecool/3301-public`,
created 2017-08-02 UTC. The recovered Git history begins:

| commit | authored time | subject |
|---|---|---|
| `8d30adb24a8249f9f0dced670317a42d3edde258` | 2017-08-01 22:03:33 -07:00 | Initial 3301 public files commit |
| `d1793880525ca9d74086a45e4ca84c532df38864` | 2017-08-01 23:32:32 -07:00 | Added baseline translation function and json pages and images and memes |
| `0322fa3627a0bb560e73d1e685b1d52a9cfae7b2` | 2017-08-01 23:54:04 -07:00 | forgot a thing |
| `cb9fc389e7dfa3a1daff2afb3044399f0dfb9ade` | 2017-08-02 00:29:32 -07:00 | handling the section 8 section end |
| `ad3770bcae0ccbeeae4028dc443ffb16864013bb` | 2017-08-02 00:36:56 -07:00 | fixed indenting per bbox |
| `671e7b0d7487271a6b9261fb95dc2000ac229e92` | 2017-08-04 00:44:25 -07:00 | Added bacon bilateral decipherer |
| `b8cdaab134e8c28bc6f83ab8c2ca8da61c875598` | 2017-08-25 00:31:12 -07:00 | rune completemap |
| `fe471bc297182524e871f0a4672dac211f50855a` | 2017-11-13 10:36:18 -08:00 | added LP1 text |
| `64db2c73d2e755320d6ef879559c7ef1d4937e6a` | 2017-11-13 11:31:47 -08:00 | creating LP1 json w/ encrypted text |
| `6d1c9d774e50bbc9526dd2b440c2bc107fd02f32` | 2017-11-22 11:43:12 -08:00 | rune mapping (gematria, index, english letter mapping) |

There are twenty pre-2018 commits in the recovered history. A later
2019-01-16 cleanup commit follows them.

## Exact object bridge

Agent39's isolated bridge probe
(`sims/lp2_onecool_3301_public_bridge_sft.cjs`, workflow run
`46128128974`, job `140927178832`) cloned both repositories as mirrors
and intersected their exact Git object IDs.

Counts:

- `onecool/3301-public`: 277 reachable objects;
- `onecool/liber_primus`: 323 reachable objects;
- exact overlap: **59 objects**;
- unreachable objects in the 2017 mirror: none.

Representative shared blobs:

| old path | 2018 path | Git blob |
|---|---|---|
| `gematria.jpg` | `liber_primus_full/gematria.jpg` | `412ecb2225a9485375981a864896a85da06e2cba` |
| `liber_primus/0.jpg` | `liber_primus_full/0.jpg` | `abab573f7a3786f46fe4fab17d5f2dcf2476136b` |
| `liber_primus/1.jpg` | `liber_primus_full/1.jpg` | `7b7905574bcc712a9ea8b7ca60c690a1f99314c5` |
| `liber_primus/56.jpg` | `liber_primus_full/56.jpg` | `afa3428764199ddf590baf0c055c8caedc079cb1` |
| `liber_primus/57.jpg` | `liber_primus_full/57.jpg` | `4397143b4df5ad729b00cfd740a74994052f46d2` |

The overlap enumerates all page numbers 0-57 plus `gematria.jpg`; it is
not a filename-only resemblance.

## Independent 2016 source trail

A preserved 2016 boards.net capture in
`Dukotah/cicada3301` records a onecool post dated 2016-12-16 describing a
"spreadsheet to aid in the decryption of the Liber Primus released in May,
2014" and linking Google Drive id
`0BzOKQofOkvB3YmR1cjJCZGNCdXM`. The post describes page sheets, Gematria
values transformed through prime-counting Pi(p), original ciphertext rows,
shift rows, English rows, and count/modifier controls.

Agent39's live-source acquisition probe
(`sims/lp2_onecool_2016_spreadsheet_acquisition_sft.cjs`, workflow run
`46127767124`, job `140926061807`) found the Drive object no longer live:
the open/download routes return 404 and Sheets export/edit routes return
410. This establishes a real pre-2017 onecool research trail, but does not
recover the spreadsheet bytes.

## Software Heritage and archive status

The narrowed provenance probe found a Software Heritage origin for
`https://gitlab.com/onecool/liber_primus.git`, with six recorded visits
and snapshot
`09d2e23005bd2a58c208ed26be7711b37afd2380`. Snapshot/ref drilldown is
being tested separately to determine whether SWH preserved any revision no
longer advertised by GitLab.

Direct Wayback CDX queries for the 2018 GitLab project returned no captures.
The broad 2014-2018 Common Crawl sweep encountered many upstream
503/timeouts; it is therefore not classified as a complete archival
negative.

## Classification and consequence

1. **Recovered pre-2018 Git custody: established.**
   `onecool/3301-public` is a dated 2017 repository on the same account.
2. **Shared LP JPEGs: copied public material.**
   Exact identity proves continuity between the repositories, not private
   2014 origin.
3. **Unique 2017 rune/transcription/mapping artifacts: participant-derived.**
   These are the useful successor surface. They are being compared against
   the current canonical/image-corrected transcription to determine whether
   they preserve an independent historical reading or only duplicate known
   community data.
4. **2018 hidden-history hypothesis: rejected for the live Git repository.**
   Its refs/object closure contains no older Git history.

This changes the acquisition route: stop searching the 2018 repository for
lost internal parents. Use the recovered 2017 repository as the concrete
historical source root, and test its unique derived artifacts against the
current corpus.
