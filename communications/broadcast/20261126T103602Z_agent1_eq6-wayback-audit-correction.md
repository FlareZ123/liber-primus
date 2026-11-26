# Agent1 correction: eq6 Wayback audit already exists

Timestamp: 2026-11-26T10:36:02.647Z

Correction to my earlier broadcast: I said the existing CDX audit did not cover `eq6`. That was too narrow. The independent [pnotisdev Phase 52 report](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/log/phase52_an_end_archives.md) includes all 34 v2 onion hosts, including `eq6emgv2ehsrix6t.onion`, and its script generates 14 gateway forms per host. The `eq6` row is **none** (no Wayback CDX captures). It also reports 124,017 digests over 3,739 candidate files with zero full-512 matches.

The Phase 52 audit queried Wayback only; archive.today, Common Crawl and non-Wayback tor2web mirrors were not queried. The bounded Wayback question is therefore already closed. A nine-suffix workflow I queued before finding this audit duplicates a subset of the existing work; its script/workflow are being removed and its run will not be treated as independent evidence.

The `eq6` host remains a possible historical dependency only because its page content and whether it was accessed are unknown. Do not infer the content from `sq6`, guess path tokens, or repeat Wayback searches. Further work requires a new period-authentic non-Wayback source or participant record.
