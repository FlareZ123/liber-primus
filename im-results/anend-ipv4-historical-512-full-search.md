# P56 hash: complete canonical IPv4 preimage search under SHA-512 and original BLAKE-512

**Decision (Agent 23, 12 November 2026):** A complete, source-motivated search of all **4,294,967,296** possible canonical dotted-decimal IPv4 address strings returns **no digest match under either SHA-512 or original BLAKE-512**. This closes these two *exact historical participant hypotheses*, not the broader unknown p56 hash problem. No LP2 unknown-page plaintext, source key, or destination was recovered.

## Why these two algorithms and this exact input

The solved physical LP2 page 56 says a deep-web page has a **512-bit hash** and prints the exact 128-hex-character target:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

A historical public Cicada research repository retains two concrete source examples: [`hash_bruteforce_blake.pl`](https://github.com/trizen/experimental-projects/blob/master/cicada-3301/scripts/hash_bruteforce_blake.pl) and [`hash_bruteforce_sha512.pl`](https://github.com/trizen/experimental-projects/blob/master/cicada-3301/scripts/hash_bruteforce_sha512.pl), both testing the literal ASCII decimal address `a.b.c.d`, with each octet in 0..255, no zero-padding or newline. The archived BLAKE script has an unconditional `die $digest` *before* its comparison; its claimed loop cannot establish exhaustive prior execution. The SHA script starts with a participant-configured `$from = 27`, but has no preserved completed-run evidence. They do not establish creator intent to hash an IPv4 address.

Use **original BLAKE-512** (the pre-BLAKE2 SHA-3 finalist), not BLAKE2b-512. The two original scripts are independent algorithm selectors from external participant attempts. The exhaustive experiment resolves their finite candidate class without trying more URL formats, salts or encodings.

## Source-locked scanners and positive controls

- [`sims/anend_ipv4_blake512_scan.c`](../sims/anend_ipv4_blake512_scan.c) is a specialized original BLAKE-512 implementation for 7–15-byte single-block messages. Before scanning, it checks the published BLAKE-512 vector of the **one-byte zero input** and exits if the 64-byte digest disagrees.
- [`sims/anend_ipv4_sha512_scan.c`](../sims/anend_ipv4_sha512_scan.c) already existed in the repository (Agent16). It uses OpenSSL SHA-512 and checks the official SHA-512 **`abc`** test vector before scanning.
- [`.github/workflows/anend-ipv4-blake512-sweep.yml`](../.github/workflows/anend-ipv4-blake512-sweep.yml) and [`.github/workflows/anend-ipv4-sha512-sweep.yml`](../.github/workflows/anend-ipv4-sha512-sweep.yml) are **manual-only** GitHub Actions launchers. Each `full` launch uses 16 independently logged first-octet intervals, with four OpenMP threads per runner; `smoke` launches only octet 0. No inferred password or key is fitted.

For each algorithm, the full disjoint coverage is `a=0..15,16..31,...,240..255` (all 256 first-octet values). Each completed job prints exactly `268435456` tested addresses (=16×256³), the full status line, and its own preserved text artifact; these totals yield **16×268435456=4294967296 exact candidates**. Both algorithms hash 7–15 bytes without null termination and compare all 64 digest bytes. A found match would emit `MATCH ...`, changing each job's final decision from `no-hit` to `hit`.

## Executed exhaustive results

| Algorithm | Smoke run | Complete full run | Verified coverage | Exact target hits |
|---|---|---|---:|---:|
| Original BLAKE-512 | [43164048804](https://github.com/FlareZ123/liber-primus/actions/runs/43164048804) | [43164174106](https://github.com/FlareZ123/liber-primus/actions/runs/43164174106) | **4,294,967,296** | **0** |
| SHA-512 | [43164690617](https://github.com/FlareZ123/liber-primus/actions/runs/43164690617) | [43164895409](https://github.com/FlareZ123/liber-primus/actions/runs/43164895409) | **4,294,967,296** | **0** |

All **32 full matrix jobs** completed successfully (16 per algorithm). Every original job log was inspected. Each had one `DONE a=start..end candidates=268435456 ...=no-hit` line, with no `MATCH`. Thus the combined test performed **8,589,934,592** complete 512-bit hashes against the original target, after algorithm-specific positive control. This is an exhaustive negative for the frozen ASCII IPv4 class.

### What the result changes

The page-56 target is **neither SHA-512 nor original BLAKE-512 of any plain canonical IPv4 address**. A prefix in the original participant script should not remain a pending search task. Larger hash-family, Tor URL, file-content, or transformed-address searches need an *independently observable* source selecting their input serialization; nothing in these negative runs authorizes expanding into unbounded guesses. A recoverable archival original deep-web object or a genuine creator-supplied hash preimage remains higher-value evidence than further speculative brute force.
