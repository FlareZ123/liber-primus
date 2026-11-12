# Two exact January 2014 Onion2 HTTP bodies and ETag-selected publication clock

**Classification (12 November 2026): two byte-exact reconstructed original HTTP responses (368 and 430 bytes), independently matching two January 2014 Wayback CDX SHA-1 digests, plus an independent 368-byte WARC SHA-256 and one confirmed file-update second.** This fixes a real source-clock observation for the otherwise unknown 2014 onion-2 generator. It does **not** identify the producer's PRNG, imply synchronized value/timing generation, recover an LP2 key or decrypt any unknown rune. The authenticated server's implementation remains missing.

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

## Second HTTP response recovered with an independent CDX digest

The [2014 Onion2 Wayback CDX index](https://github.com/Dukotah/cicada3301/blob/master/corpus/D-archives/cdx/onion_cu343l33nqaekrnw_to.json) has two successful HTTPS captures on 7 January 2014. Their RFC4648 base32 SHA-1 **content** digests allow recovery of both complete original bodies, using only the original 27-byte comment + LF + a prefix of the already archived 256-byte original hex stream:

| Original archive capture, UTC | Source CDX SHA-1 (base32) | Unique matching prefix length | Recovered original HTML bytes |
|---|---|---:|---:|
| **14:03:33** | `TKD4KCZ3BBREBSCS6ZEXBYSRZTMDU6P2` | **170 bytes** | **368** |
| **19:39:16** | `A2N6WJ6DSMG6NRTTJKN3YVVOIKT4RDLH` | **201 bytes** | **430** |

The corresponding decoded SHA-1 hex values are `9a87c50b3b086240c852f64970e251ccd83a79fa` and `069beb27c3930de6c6734a9bbc56ae42a7c88d67`. An exhaustive exact source-prefix check tests **all 257 possibilities, 0–256 bytes**, for *both* digests; each matches **exactly one** prefix length. No language ranking, key tuning or synthetic cipher assumptions enter this recovery. The 201-byte response is preserved [as an exact historical-byte reconstruction](../resources/historical/cicada2014-onion2-20140107-201byte.html); its SHA-256 is `75c2c847998a3ccab1e17c9d9b6f5606b484f6250e2dd48df3ac3145b76ad400`. Source byte **201 = `2a`**, and source byte **202 = `0b`**.

This second capture is independently bracketed by the original [BotSottile IRC observation](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5-stored/onion2-timing_BotSottile_qn8jmPJr.txt): **20:30 GMT+1, new byte `2a`, length 201** (line 2205), and **20:40 GMT+1, new byte `0b`, length 202** (line 2220). The archived snapshot timestamp, **19:39:16 UTC = 20:39:16 GMT+1**, falls during the byte-201 interval, before byte 202 was observed.

The published CDX `length` fields 659 and 718 include archive response metadata. The actual original HTML-body sizes **368 and 430** follow from the exact content hashes. The archived `Last-Modified` and `ETag` original headers have been recovered **only for the earlier 170-byte response**; no original headers for the later 201-byte capture are asserted.

## Derived absolute publication-minute clock across the original 170–202 span

The pinned [2014 contemporary interval records](../resources/cicada2014-onion2-timing.json) contain **29 directly preserved five-minute increments** for byte positions 171–201; the originally missing 190/191 pair was independently resolved at **[2,4]** five-minute units by the [two-witness MassoBot/BotSottile source gate](onion2-massobot-timing-bridge.md). The sum of **all 31 increments from byte 170 to 201 is 70 five-minute units = 350 minutes**. Anchor these records at the independently recovered file `Last-Modified: 2014-01-07 13:40:01 UTC` for the byte-170 file:

| Source-grounded event | Original / derived UTC time |
|---|---|
| Byte 170, original Apache file mtime | **13:40:01** (independent server record) |
| Byte 201, original 31 historical intervals later | **19:30** (minute-level, conditional on preserved intervals) |
| Second Wayback capture containing exactly 201 bytes | **19:39:16** (independent original CDX) |
| Byte 202, next observed 10-minute interval | **19:40** (minute-level, conditional on preserved interval) |

Thus the original second archived capture lies **inside the interval predicted by the first archived file timestamp and the separately preserved arrival intervals**. The source provides **no individual exact-second server mtime** for byte 201 or 202: carrying forward the first `:01` second is illustrative, not a directly authenticated clock. A machine-readable [33-position 170–202 derived source-clock table](onion2-archival-clock-170-to-202.json) preserves each source byte, interval, witness confidence and conditional predicted UTC minute, while the [SFT](../sims/onion2_http_etag_original_sft.cjs) asserts the 70-increment sum and capture bracket. This is a reusable historical input for investigating a **known source-specified server generator**, if one is located; it cannot by itself determine byte-generation state.

## Independent server-time and IRC cross-check

The ETag separates into exactly three hexadecimal fields: `b46b`, `170` and `4ef6183538e40`. These are consistent with Apache HTTP Server 2.2's documented default `FileETag INode MTime Size` for static files ([official historical documentation](https://httpd.apache.org/docs/2.2/en/mod/core.html#fileetag)). Under that convention:

- Inode field `0xb46b` is **46187**; it is an operating-system file identifier, not a 3301 parameter.
- Size `0x170` is **368** original body bytes.
- Modification-time value `0x4ef6183538e40` is **1,389,102,001,000,000 microseconds since Unix epoch**, exactly **2014-01-07 13:40:01 UTC**.

The independently preserved January 2014 [BotSottile IRC observation](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5-stored/onion2-timing_BotSottile_qn8jmPJr.txt), original line 1755, reads **14:40: new byte `ab`, new length `170`**. The original solver clocks in these onion logs were GMT+1. Thus the HTTP file's `Last-Modified` second becomes **14:40:01 GMT+1**, just one second after the contemporaneous **14:40** minute-granularity observation for **that exact byte and length**.

This match is source-external to the locally reconstructed body SHA. It supports the narrow operational interpretation that the visible growing string at byte 170 was served as a modified static document near the observer's report. It does not prove that *all* 256 byte reveals used the same cron/clock, that the random values were derived from their timestamps, or that the ETag originated at Cicada's machine rather than an intermediate proxy. The published mtime and Apache-style ETag describe the **archived HTTP serving path**, with provenance of the proxy still to be established. The original archive HTTP `Date` is later than the file update and earlier than the independently observed next update.

## Reversible-research consequence and next decision

We now have **two independently hash-authenticated original publication snapshots at 170 and 201 bytes**, a precise original file-modification second and a 33-position conditional absolute publication-minute schedule anchored to that second. The later 19:39:16 UTC snapshot independently confirms the byte-201 state before the 20:40 GMT+1 transition to byte 202. Previous generator research had only the final 256-byte string and incomplete 112 observed interarrival intervals. Further recoveries should pursue **other early-2014 WARC HTTP headers/ETags or original server file-rewriting code**, since each independently preserved mtime could provide another timestamp-indexed original state witness. Both successful original January 2014 CDX HTTPS bodies are now recovered to the byte, although the second's HTTP headers remain unavailable.

Do not repeat the already-closed LCG, CPython-MT or byte/interval interleaving sweeps. A generator candidate must reproduce actual source bytes from a source-authenticated rule, rather than fitting a timestamp and claiming an LP2 key. An HTTP file-update clock is evidence about **publication**, not automatically about **byte generation**.

**Reproducer:** [standalone CJS original-input and tamper-positive script](../sims/onion2_http_etag_original_sft.cjs), from existing 256-byte source JSON and this original archived response. It asserts full-stream SHA, original 368-byte response SHA-256, both source-CDX SHA-1 checks over all 257 candidate prefix lengths, second restored 430-byte response SHA-256, ETag/Last-Modified equality, exact one-second IRC clock agreement, and tamper detection. It uses only Node.js built-ins and no external package.

**Earlier bounded generator exclusions:** [LCG + CPython MT](onion2-timing-generator-state-recovery.md), [byte/timing interleaving](onion2-timing-byte-interleavings.md), [two-witness 190–191 clock recovery](onion2-massobot-timing-bridge.md).
