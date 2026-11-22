# Archive Team Tor WARC source gate: indexed, inaccessible, no new p56 bytes

## Decisive result

The independently attested Internet Archive collection [`archiveteam_tor`](https://archive.org/details/archiveteam_tor) is real, but its **entire publicly enumerated 14-item inventory** currently exposes **no readable original WARC or CDX** to the anonymous original-byte probes. Its contents are capture batches from **September 2017 through November 2018**, well after Cicada's original May 2014 Stage11 distribution. No unknown LP2 plaintext, authenticated p56 destination, hash preimage, decryption operator, or key was recovered.

This is an **access-blocked archival source**, not a negative search over the captured URLs. The fact that a domain is absent from item-level metadata says nothing about domain occurrences inside protected CDX indexes.

## Original lead and independent positive contextual witness

On **6 March 2024, 07:02:18–07:04:14**, Archive Team operators publicly identified `https://archive.org/details/archiveteam_tor` as the repository for prior ArchiveBot Tor WARCs and cited an original **28 August 2017** Wayback .onion replay as a capture example ([operator transcript](https://irclogs.archivete.am/archiveteam-bs/2024-03-06)). The historical 2014 Cicada Stage11 site used `ky2khlqdf7qdznac.onion`, as preserved by the source-authenticated release; **p56's still-missing deep-web target must not be assumed equal to that distribution host**. The 2017 example is an operator-supplied attribution, not an HTTP/WARC positive independently extracted here.

The index and source-byte access gates use a deliberately separate retrieval surface from the previously exhausted general Wayback/CDX, Archive-It, Arquivo.pt, Archive.today, Stage11 index mirrors and Wiki-830 image searches.

## Executed original-source tests, 13 November 2026

[Full successful CI index run 43442023680](https://github.com/FlareZ123/liber-primus/actions/runs/43442023680) used the public Internet Archive collection metadata endpoint and an exact paginated `collection:archiveteam_tor` `advancedsearch.php` query with `rows=500`. It returned **14/14** advertised item IDs, without pagination truncation; all **14/14 item metadata requests** returned with filenames and sizes. Every batch has a `.warc.gz` and associated `.cdx.gz` / `.cdx.idx` files marked `private: "true"` by the Archive metadata API. The public collection title is *Archive Team: The TOR Undarked Web*.

Captured source metadata has exactly four September 2017 batch IDs `archiveteam_tor_20170918143618`, `...19`, `...20`, `...23`; `archiveteam_tor_20180102080000` additionally has a source `date` field of `2017` despite its 2018 batch identifier. The remaining listed batches have 2018 identifiers. The full 14 identifiers, public titles, timestamps, WARC/CDX filenames, byte sizes, and per-file restriction flags are in the immutable run artifact `archive-team-tor-manifest`.

[Successful access-gate run 43442456452](https://github.com/FlareZ123/liber-primus/actions/runs/43442456452) tried three **small, exact, originally listed index files**, without downloading speculative multi-gigabyte WARCs:

| Original file | Expected metadata size | Direct HTTP result |
|---|---:|---|
| `archiveteam_tor_20180102080000.cdx.idx` | 48 B | **403** |
| `archiveteam_tor_20181101052100.cdx.gz` | 10,302 B | **401** |
| `archiveteam_tor_20170918143620.cdx.idx` | 25,646 B | **401** |

All three returned only error payloads. No original CDX line was readable; consequently the historical Cicada host could not be queried against this collection's URL inventory, and no raw WARC HTTP positive could be established. The CI code and its exact finite scope are [collection manifest probe](../sims/archive_team_tor_manifest_probe.cjs), [small-index access gate](../sims/archive_team_tor_access_gate.cjs), and [dispatch-only workflow](../.github/workflows/archive-team-tor-collection-manual.yml). The second run's artifact contains both original JSON outputs.

## Decision and next action

**Close the named collection's public-access route as blocked.** A justified successor requires newly granted WARC/CDX access, an independently published host-bearing CDX/manifest, or an identifiable archive operator who can search the protected index for the period-authenticated Cicada host without public raw downloads. If that source becomes available, first require one independently identifiable benign original 2017 WARC record, then search the exact historical host and any authenticated p56-derived host. Preserve timestamp, original URL, original HTTP bytes, MIME, and digest before interpreting any key material.

Nothing here proves that the original 2014 .onion service was uncaptured or that a 2017 service could contain the p56 preimage. Repeated generic CDX searches and unbounded WARC downloads have no justified value until access or a new primary index is obtained.
