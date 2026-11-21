# 2014 first-onion service archive recovery

**Status:** positive for the service root page and its directly linked image; not a Cicada-signed server response and not an LP2 decryption.

## Scope and decision

The target was the first 2014 hidden service derived from the signed Twitter/Emerson book code: auqgnxjtvdbll3pv.onion. The decisive test was whether a dated, independently traceable archive preserved either the root response or a file linked directly from it. The recovered HTML links only to 1033.jpg, so both directly visible objects are covered.

## Recovered objects

The strongest contemporaneous source is [micheloosterhof/cicada-2014 commit 2547f5f](https://github.com/micheloosterhof/cicada-2014/commit/2547f5f08f06f8f514329c5d533b0a99968e365e). GitHub records the commit as authored by micheloosterhof at **2014-02-13 22:41:35 UTC**. At that commit, the stage2/ tree contains:

1. [stage2/index.html](https://github.com/micheloosterhof/cicada-2014/blob/2547f5f08f06f8f514329c5d533b0a99968e365e/stage2/index.html), 104 bytes, Git blob SHA-1 807541d764ed33c976717b7ee2d08ac0720ce56b:

        <html><head><title>For Every Thing That Lives Is Holy</title><body><img src="1033.jpg" /></body></html>

2. [stage2/1033.jpg](https://github.com/micheloosterhof/cicada-2014/blob/2547f5f08f06f8f514329c5d533b0a99968e365e/stage2/1033.jpg), 342,361 bytes, Git blob SHA-1 90d04bc54e9a35e3171a92386b5932a2dfb8e98f. The same blob's SHA-256 is recorded as 15b2b99fe15ff34ef3eab574bb84bfaad0a119674be2ca5baf65951e6a9bd865 in the [Dukotah mirror manifest](https://github.com/Dukotah/cicada3301/blob/7a264cb643c7e6a3076a318e82734472da37ee5d/liber-primus/analysis/armada_osint/artifacts/mirror-manifest.sha256).

The contemporaneous [Stage 2 README](https://github.com/micheloosterhof/cicada-2014/blob/2547f5f08f06f8f514329c5d533b0a99968e365e/stage2/README.md) explicitly instructs the solver to fetch http://auqgnxjtvdbll3pv.onion/ and /1033.jpg, run OutGuess, verify the PGP signature, then decrypt RSA. The same commit preserves [1033.jpg.outguess](https://github.com/micheloosterhof/cicada-2014/blob/2547f5f08f06f8f514329c5d533b0a99968e365e/stage2/1033.jpg.outguess), 1,498 bytes, Git blob SHA-1 cd529671eac6458a790f047d23895af264b11751. That blob is byte-identical to the signed [1033.jpg.asc](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/002-first-onion/1033.jpg.asc) in the pinned neuroretransmit archive. The preserved payload explicitly names Crypt::RSA::ES::OAEP and includes the public exponent and modulus.

## Cross-copy byte check

The 104-byte root HTML and 342,361-byte image have the same Git blob IDs in the 2014 micheloosterhof snapshot and later copies in [iBotPeaches/cicada_3301](https://github.com/iBotPeaches/cicada_3301/tree/09a6fa4848e5943dbb48c738584f2ec8442ec2a4/onions/auqgnxjtvdbll3pv.onion/post) and [krisyotam/cicada3301](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage02/auqgnxjtvdbll3pv.onion). This establishes exact byte identity across the copies. The later mirrors do not count as independent provenance; the key provenance is the contemporaneous 2014 commit.

## Archive boundary and provenance limits

The existing [Dukotah Wayback report](https://github.com/Dukotah/cicada3301/blob/7a264cb643c7e6a3076a318e82734472da37ee5d/liber-primus/analysis/round43/F5-stored/wayback-log.md) records zero direct CDX rows for auqgnxjtvdbll3pv.onion. The 31 .onion.to records are redirects, errors, or gateway placeholders rather than the hidden-service page. Thus the recovery is not a Wayback capture. It is a contemporaneous participant-maintained Git archive.

The 2014 repository proves the HTML and JPEG were present in a public source-controlled archive by 13 February 2014. It does not preserve original HTTP headers, response dates, server logs, or a Cicada signature over the HTML. The HTML itself is unsigned. The linked JPEG's extracted OutGuess payload is separately PGP-signed; that authenticates the payload, not the HTML wrapper or the date the image was served.

## Result and downstream consequence

**Positive completion of the archive-recovery task:** the first onion's exact root HTML and linked JPEG are recoverable with a contemporaneous, traceable repository snapshot. The visible page is minimal: a title and one image. The page and image reveal no RSA private key, factor, or LP2-specific selector. The next stage is the signed RSA-OAEP challenge, not a hidden private-key handoff in the Stage 1 HTML.

Do not repeat generic Wayback or mirror searches for this exact root and image unless a new source class or timestamped capture becomes available. The remaining private-input question belongs to the bounded RSA handoff task, not to this archive-recovery task.
