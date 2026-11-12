# Exact January 2014 Onion2 HTTP response and ETag-selected publication clock

**Classification (12 November 2026): recovered original 368-byte historical HTTP body with a SHA-256-independent witness and one contemporaneously corroborated update second.** This fixes a real source-clock observation for the otherwise unknown 2014 onion-2 generator. It does **not** identify the producer's PRNG, imply synchronized value/timing generation, recover an LP2 key or decrypt any unknown rune. The authenticated server's implementation remains missing.

## New primary archive constraint

A [2014 Onion2 Tor2web snapshot indexed and byte-pinned by Dukotah](https://github.com/Dukotah/cicada3301/blob/master/corpus/D-archives/manifest_normalised.jsonl) survives under `captures/cu343l33nqaekrnw.onion.to/20140107125633/index.html`. The preserved archive record has SHA-256

```
b9722427c162f3b2cc15ea5f9785ead5a5ba0ffb702010bcce85591e83fcf1dc
```

Its recorded original HTTP response fields are:

| Field | Archived value |
|---|---|
| `Content-Length` | `368` |
| `Last-Modified` | `Tue, 07 Jan 2014 13:40:01 GMT` |
| `ETag` | `"b46b-170-4ef6183538e40"` |
| `Date` | `Tue, 07 Jan 2014 14:03:35 GMT` |
| `Server` | `Apache` |

The CDX indexing label is **12:56:33**, whereas the preserved response `Date` is **14:03:35 UTC**. Those values differ and cannot be silently conflated. The archive record has an HTTP→HTTPS redirect provenance, so the HTTP `Date` and `Last-Modified` fields, rather than its CDX filename timestamp, are the appropriate server-time witnesses.

## Byte-exact recovery

Independently from that archived checksum, the [surviving original 256-byte growing string](../resources/cicada2014-onion2-timing.json) and the known original page comment permit one natural reconstruction with **zero fitted cipher parameters**:

```text
<!--Patience is a virtue-->
<the first 340 hex characters of the pinned 512-character historical string>
```

The comment is exactly 27 ASCII bytes, followed by **one LF byte** and the first **340 hex characters = 170 bytes** of the final preserved stream. Total: **27 + 1 + 340 = 368 original HTML bytes**, with **no trailing newline**. Its SHA-256 is **identical, all 256 bits**, to the separately archived `b9722427...` value above. That is independent evidence for the **whole original response**, not merely a 170-byte length coincidence. The complete byte-identical recovered original response is preserved as [a small reference artifact](../resources/historical/cicada2014-onion2-20140107-170byte.html).

The 170th byte in the full original stream is hex **`ab`**, and the 169th is `9b`. A one-bit corruption of the recovered body changes the SHA-256 as checked by the reproducer.

## Independent server-time and IRC cross-check

The ETag separates into exactly three hexadecimal fields: `b46b`, `170` and `4ef6183538e40`. These are consistent with Apache HTTP Server 2.2's documented default `FileETag INode MTime Size` for static files ([official historical documentation](https://httpd.apache.org/docs/2.2/en/mod/core.html#fileetag)). Under that convention:

- Inode field `0xb46b` is **46187**; it is an operating-system file identifier, not a 3301 parameter.
- Size `0x170` is **368** original body bytes.
- Modification-time value `0x4ef6183538e40` is **1,389,102,001,000,000 microseconds since Unix epoch**, exactly **2014-01-07 13:40:01 UTC**.

The independently preserved January 2014 [BotSottile IRC observation](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5-stored/onion2-timing_BotSottile_qn8jmPJr.txt), original line 1755, reads **14:40: new byte `ab`, new length `170`**. The original solver clocks in these onion logs were GMT+1. Thus the HTTP file's `Last-Modified` second becomes **14:40:01 GMT+1**, just one second after the contemporaneous **14:40** minute-granularity observation for **that exact byte and length**.

This match is source-external to the locally reconstructed body SHA. It supports the narrow operational interpretation that the visible growing string at byte 170 was served as a modified static document near the observer's report. It does not prove that *all* 256 byte reveals used the same cron/clock, that the random values were derived from their timestamps, or that the ETag originated at Cicada's machine rather than an intermediate proxy. The published mtime and Apache-style ETag describe the **archived HTTP serving path**, with provenance of the proxy still to be established. The original archive HTTP `Date` is later than the file update and earlier than the independently observed next update.

## Reversible-research consequence and next decision

We now have a **hash-authenticated original publication snapshot at exactly 170 bytes** plus a byte-specific historical release second; previous generator research had only a later final 256-byte output and incomplete 112 observed interarrival intervals. Further recoveries should pursue **other early-2014 WARC HTTP headers/ETags or original server file-rewriting code**, since each independently preserved mtime could provide another timestamp-indexed original state witness. The current [CDX listing](https://github.com/Dukotah/cicada3301/blob/master/corpus/D-archives/cdx/onion_cu343l33nqaekrnw_to.json) also indexes 7 January 2014 HTTPS snapshots at 14:03:33 and 19:39:16 UTC, but their separate response bodies/headers were **not** recovered in this study, so no timestamp or byte count is imputed to those records.

Do not repeat the already-closed LCG, CPython-MT or byte/interval interleaving sweeps. A generator candidate must reproduce actual source bytes from a source-authenticated rule, rather than fitting a timestamp and claiming an LP2 key. An HTTP file-update clock is evidence about **publication**, not automatically about **byte generation**.

**Reproducer:** [standalone CJS original-input and tamper-positive script](../sims/onion2_http_etag_original_sft.cjs), from existing 256-byte source JSON and this original archived response. It asserts full-stream SHA, original 368-byte response SHA, 170th original byte, ETag/Last-Modified equality, exact one-second IRC clock agreement, and tamper detection. It uses only Node.js built-ins and no external package.

**Earlier bounded generator exclusions:** [LCG + CPython MT](onion2-timing-generator-state-recovery.md), [byte/timing interleaving](onion2-timing-byte-interleavings.md), [two-witness 190–191 clock recovery](onion2-massobot-timing-bridge.md).
