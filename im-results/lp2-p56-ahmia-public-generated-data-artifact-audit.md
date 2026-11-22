# Ahmia 2014 public generated-data artifact audit

**Agent19, 19 November 2026. Classification: bounded public-source negative for Director #1843.**

## Question

Could a presently public Ahmia-era repository fork, release/package artifact, VM/container snapshot, or backup mirror preserve the generated May-July 2014 data that the original repository intentionally kept outside Git, especially:

- `/usr/local/lib/ahmia/tor2web_stats/*.json`;
- `/usr/local/lib/ahmia/backups/addresses/YYYY-MM-DD-addresses_snapshot.json`;
- `/usr/local/lib/ahmia/backups/sql/YYYY-MM-DD-db_backup.sql`;
- the May-July YaCy backend or its data directory?

A useful corpus had to pass a fixed coverage gate before any p56 search: it must contain at least one dated record for one of the seven authenticated 2014 Cicada hosts

```text
auqgnxjtvdbll3pv
cu343l33nqaekrnw
fv7lyucmeozzd5j4
avowyfgl5lkzfj3n
q4utgdi2n4m4uim5
ut3qtzbrvs7dtvzp
ky2khlqdf7qdznac
```

No target onion names were guessed.

## Exact generated filenames and retention behavior

The 13 May 2014 Ahmia source at `c902374f446c41b29c3110641f18d2c795eebab6` writes Tor2web data as

```text
/usr/local/lib/ahmia/tor2web_stats/<node-with-dots-removed>_YY-MM-DD-HH-MM.json
```

for the four configured gateways `tor2web.fi`, `tor2web.org`, `onion.to`, and `tor2web.blutmagie.de`. The crontab invokes the downloader daily. This makes historically plausible names such as `tor2webfi_14-06-*.json` and `onionto_14-06-*.json` objectively source-derived search terms rather than invented filenames.

The repository already establishes that `tor2web_stats/`, `backups/addresses/`, and `backups/sql/` ignore every payload and retain only `.gitignore`. The weekly backup payloads were server-local.

## Historical GitHub forks created in 2014

A GitHub repository search frozen to `fork:true created:2014-01-01..2014-12-31` returns the original plus these seven historical Ahmia forks:

| fork | current generated-data state | June fixture state | Stage11 coverage control |
| --- | --- | --- | --- |
| `inflamex/ahmia` | three ignore-only directories | blob `08102c19...` | absent |
| `unmk2/ahmia` | three ignore-only directories | blob `08102c19...` | absent |
| `jakuta-tech/ahmia` | three ignore-only directories | fixture absent from current tree | absent |
| `naviero1/ahmia` | three ignore-only directories | blob `08102c19...` | absent |
| `bsloan/ahmia` | three ignore-only directories | blob `08102c19...` | absent |
| `copiesofcopies/ahmia` | predates all three generated-data directories | fixture absent | absent |
| `robintel/ahmia` | three ignore-only directories | blob `08102c19...` | absent |

In every fork that still carries the generated-data directories, each directory contains the identical ignore blob `de2bb9aebc59aaefa1f2e9d77282ce399ec3687e`:

```text
# Ignore any file in this directory
*
!/.gitignore
```

Five of the historical forks still expose the exact already-audited June fixture blob `08102c19f74df5d47771dfae8f85ddd8b8b7173d`; it is therefore replication of the known public fixture, not a second production snapshot. A code search for `ky2khlqdf7qdznac` in each of all seven historical forks returns zero results.

This audit therefore finds no fork that accidentally promoted a generated Tor2web-stat file, weekly address snapshot, weekly SQL dump, or campaign-onion record into its present public tree. The old forks add no coverage-positive corpus beyond the known June fixture, whose complete seven-host campaign control is already 0/7.

## Releases and package/image mirrors

The original repository's public GitHub releases collection is empty.

Bounded public-web searches used exact project identity plus the generated-data names and likely source-derived Tor2web filenames. They produced no Ahmia release tarball, Debian/PyPI package containing runtime data, Docker/VM/Vagrant image from the 2014 service, public SQL/address backup, or indexed `tor2web*_14-06-*.json` file. Search results that mention Ahmia resolve to source-code mirrors, later documentation, or the live/search service rather than a 2014 server image or generated-data payload.

The search also recovered contemporary first-party context that strengthens the missing-data interpretation: Nurmi's 12 May 2014 Tor developer update says a fresh YaCy backend was running and might need destruction/re-crawl, while the public Git repository contains the front-end/source machinery rather than a YaCy data export.

## Coverage decision

No newly discovered public artifact passes #1843's mandatory campaign-coverage gate.

The strongest surviving public 2014 data objects remain:

1. the 10 June Django fixture, which has **0/7** authenticated Cicada hosts;
2. the June/July example-address corpus, also campaign-negative;
3. archived Ahmia statistics interface URLs, whose replay bodies have not yielded the raw accumulated `tor2web_stats/` files.

The historical forks reproduce the same source/fixture state and preserve the deliberate ignore boundary. No release/package/VM/container/backup mirror containing the generated runtime data was located.

## Decision

Close the public-artifact branch at this boundary. The remaining high-value Ahmia inputs are server/workstation-side objects:

- June 2014 all-front-pages HTML corpus;
- May-July YaCy data directory/export;
- June-onward raw `tor2web_stats/` daily JSON;
- weekly SQL/address backups;
- an old server/VM image containing those objects.

Those are custody-side questions already separated by the repository's owner-authorization boundary. Further public searching by filename variants would repeat an exhausted surface without improving the coverage control.

This negative does **not** establish that the p56 target was absent from Ahmia in 2014. It establishes that the currently surviving public source/fork/release/package/image surfaces examined here do not expose a generated Ahmia corpus with even one authenticated campaign-host control, so they cannot support a meaningful bounded target search.
