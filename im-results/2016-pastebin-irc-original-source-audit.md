# January 2016 Pastebin echo: exact source recovered from byte-verified IRC logs

**Research decision (11 November 2026, Issue #264):** The previously inaccessible large IRC logs contain a dated direct link to the historical `uRkNsGsa` Pastebin entry, with a contemporary bot title identifying it as a **copy of Liber Primus's already-published p56/“p.57” hash**. This recovers the missing *URL provenance*, but it does **not** recover the missing deep-web page, its hash preimage, a key, or an LP2 decryption. The 2016 Stack Exchange claim that `uRkNsGsa.htm` was a decoded Whirlpool output has no source-supported cryptographic chain; the January original chat instead identifies it as an existing hash repost.

## The source-exact archival finding

[Original public Git tree, `neuroretransmit/cicada/irc-logs`](https://github.com/neuroretransmit/cicada/tree/main/irc-logs). All three raw files were obtained through their original `raw.githubusercontent.com` paths on a GitHub Actions runner, bypassing the UTF-8-only repository-file interface that previously failed on binary/non-UTF-8 content. The standalone script verifies their full byte lengths and Git's SHA-1 **blob** identity (`SHA1("blob <size>\\0" || raw_bytes)`) *before* scanning. The three verified archive objects are:

| IRC file | Raw size in bytes | Git blob SHA-1 | Physical lines | `uRkNsGsa` matches |
| --- | ---: | --- | ---: | ---: |
| `#33012014.freenode.log` | 8,629,610 | `a2880b1db31ce523599ef30ca2e55291bf295900` | 112,096 | 0 |
| `#cicadasolvers.freenode.log` | 18,487,233 | `bdd277c14f94c34b5ae714cd00c238065beeed4e` | 239,025 | 0 |
| `#cicadasolvers.freenode.2.log` | 27,234,234 | `72634a9d071d32af767edbffc0493d810e88cd0d` | 347,209 | **2** |

In the third file at line **227,497**, the preserved text says:

> `2016 Jan 07 12:41 <H4ze> http://pastebin.com/uRkNsGsa Hash for everyone's convenience`

At lines **227,498–227,499**, immediately after that message:

> `2016 Jan 07 12:41 <TaiiwoBot> ^ Liber Primus p.57 hash - Pastebin.com ^`
>
> `2016 Jan 07 12:41 <harvester> ^ Archived file(s): uRkNsGsa ^`

The nearby original lines **227,485–227,506** discuss the known 2014 manuscript hash, the belief that it might be unsalted SHA-512, and a pointer to the independently published “PAGE 56” transcription. The bot's title says “p.57” because contemporary page numbering differs from the physical zero-based LP2 p56 designation. This is a **2016 participant/archiver record**; it is not an authenticated Cicada instruction. The bot's archive acknowledgement identifies an item ID, not a publicly retrievable byte-exact copy of its content.

## Historical claim disambiguated

The [Tor Stack Exchange answer, published 12 July 2016](https://tor.stackexchange.com/a/3895), described using a third-party hash site to obtain a Pastebin URL and a downloaded `uRkNsGsa.htm` file. The earlier **7 January 2016** source chat already contains the identical path and explicitly describes it as a convenience copy of the already-visible hash. A search/reversal site pointing to a webpage *containing the same hash as text* is not a cryptographic preimage for that hash. The source establishes the URL's historical existence and intended use as a shareable transcription; the raw Pastebin HTML or text itself is **not** present in these three IRC files, and is **not claimed recovered** here.

No arbitrary hash-family or guessed URL operation follows from this candidate. The legitimate p56 puzzle target remains the unknown deep-web page bytes and a compatible independently specified hash method, discussed in [the current hash-preimage report](archive-hash-preimage.md).

## Reproduction and scope

- [Source-pinned byte-exact Python scanner](../sims/irc_2016_raw_blob_source_scan.py), validating all three Git blob objects, inspecting the exact token and ±12-line context, and reporting independent counts for the known 128-hex digest, `AN END`, and SHA-512.
- [Manual-only workflow](../.github/workflows/irc-2016-raw-source-scan.yml) and [completed passing run 43034766665](https://github.com/FlareZ123/liber-primus/actions/runs/43034766665) (11 November 2026). The earlier [passing initial run 43034176700](https://github.com/FlareZ123/liber-primus/actions/runs/43034176700) recovered the exact URL without context.
- The source-specific scan covers these **three named large IRC archives** only, ending no later than May 2016; it cannot exclude an independently archived 2016 page, a Pastebin capture elsewhere or unrelated missing historical infrastructure.

**Decision:** close Issue #264's raw-Git-archive acquisition route with a successful retrieval and a concrete exclusion of `uRkNsGsa` as an evidenced deep-web preimage. It is useful historical clarification, with **zero newly decoded LP2 runes**. Further work should pursue a different independently selected key/operation or a genuine original target-page object, rather than the recycled digest.
