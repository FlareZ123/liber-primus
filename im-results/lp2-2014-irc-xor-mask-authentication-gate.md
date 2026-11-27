# 2014 IRC 20-byte XOR-mask authentication gate

**Director #3114 — Agent26, 27 November 2026.**

**Decision:** retire the 20-byte mask `8c12a10087bd6a798609216c13c8fdcf6773ea0d` as an unauthenticated solver-supplied operand. Its earliest recovered occurrence is an unsigned 2 November 2014 IRC post by nickname `guy1__`; no recovered first-party object, signature, derivation, URL, or typed receiver supplies the bytes. The historically exact 4 November JPEG XOR scan is therefore evidence of what solvers tried, not evidence of an intended LP2 key.

No new XOR/cipher search is justified. No unknown LP2 plaintext, authentic key, complete inverse, or destination is recovered.

## Exact recovered provenance chain

The pinned period corpus consists of three original IRC blobs documented in [the source locator](../resources/external/2014-cicadasolvers-freenode-log-corpus.md):

| source | bytes | pinned Git blob |
| --- | ---: | --- |
| `#cicadasolvers.freenode.log` | 18,487,233 | `bdd277c14f94c34b5ae714cd00c238065beeed4e` |
| `#cicadasolvers.freenode.2.log` | 27,234,234 | `72634a9d071d32af767edbffc0493d810e88cd0d` |
| `#33012014.freenode.log` | 8,629,610 | `a2880b1db31ce523599ef30ca2e55291bf295900` |

Agent32's source-identical selector run verifies these blobs before scanning them and produces exactly six mask-text occurrences, all in the second log:

1. **2014-11-02 14:25, L24628, `guy1__`** — `the end is near. 8c12...ea0d Good luck. 3301`
2. **2014-11-02 14:34, L24643, `guy1__`** — bare 40-hex mask
3. **2014-11-04 13:05, L26002, `Nem0`** — bare repost
4. **2014-11-04 13:06, L26004, `Nem0`** — `-hex` repost
5. **2014-11-04 13:06, L26006, `crashdemons`** — string-length check of the same 40 hex characters
6. **2014-11-04 13:26, L26034, `Nem0`** — verbatim quote of the `guy1__` claim

The same exact-byte audit finds **no raw/hex/base64 occurrence in the repository `resources/` corpus**. Global GitHub code search in this run finds no separate indexed occurrence of the lower-case hex, upper-case hex, base64 `jBKhAIe9anmGCSFsE8j9z2dz6g0=`, or spaced-hex form. Exact public-web searches for those encodings and the distinctive `the end is near` formulation likewise return no independent source.

These broad negative searches are not a proof that no private or vanished copy ever existed. They establish that the earliest **recovered** source is the unsigned IRC post, exactly the provenance threshold requested by #3114.

## What the contemporaneous solvers thought the object was

The 4 November context is especially discriminating because participants do not treat the bytes as a known first-party key:

- `crashdemons` says there is too much byte range for a static shift/static XOR.
- Immediately after `Nem0` re-quotes the alleged message, `crashdemons` reports that it is **not a SHA hash in online rainbow tables**.
- The next proposed action is `xor scan?`.
- Ten minutes later `crashdemons` posts the 58-image text-XOR scan to Pastebin.
- Later messages continue testing whether objects XOR together and whether a common SHA-512 lookup applies.

This is the behavior of participants trying to discover what an unexplained 20-byte value might be. There is no quoted signed Cicada object, source URL, PGP armor, derivation, or author-selected consumer in the recovered context.

The mask's 20-byte length is compatible with a SHA-1 digest, but length alone is not provenance. The contemporaneous hash lookup was negative, and no source-known preimage is recovered here. Treating the bytes as a SHA-1 value, XOR key, seed, or ciphertext would each require an additional unsupplied operation.

## Historical XOR scan remains exactly reproducible — and irrelevant to authentication

The existing [source-operand report](lp2-2014-irc-source-operand-index.md) reconstructs the later 4 November scan exactly. The recovered Pastebin contains 271 printed 20-byte windows from original LP2 JPEGs. Agent32 inferred the full mask from three records and reproduced all 268 holdout rows under a frozen rule: XOR each candidate 20-byte JPEG window with the fixed mask beginning at mask index zero, render printable ASCII/TAB/LF, and score printable count.

That result proves the historical experiment and its exact operand. It does **not** authenticate the operand. The scan itself produced no meaningful plaintext; its author characterized the result as `pretty much nothing there`.

This distinction matters: a perfectly reproducible failed solver experiment does not become author-selected merely because its input is recoverable.

## Authentication criteria

#3114 required either:

1. a dateable authenticated source/derivation supplying all 20 bytes and naming an intended receiver; or
2. a bounded provenance chain showing that the earliest recoverable source is the unsigned solver message.

The evidence satisfies **(2)**.

The first `guy1__` line has Cicada-like wording but no signature. Since Cicada had already committed in 2012 to cryptographically signing messages, unsigned stylistic imitation is weak evidence. Nickname attribution itself is unauthenticated. No period source links that nickname or these bytes to the Cicada key lineage.

## Reproduction

- Existing exact selector: [`sims/lp2_2014_irc_xor_mask_selector.cjs`](../sims/lp2_2014_irc_xor_mask_selector.cjs), successful CI run 45914325976.
- Exact XOR reconstruction: [`sims/lp2_2014_irc_xor_scan_inverse.cjs`](../sims/lp2_2014_irc_xor_scan_inverse.cjs), successful corrected CI run 45914290494.
- Additional provenance-audit script added by this issue: [`sims/lp2_2014_irc_xor_mask_provenance.cjs`](../sims/lp2_2014_irc_xor_mask_provenance.cjs). It verifies the same three Git blobs, searches multiple textual encodings/prefixes, and inventories the sender/context. Its manual workflow is [`agent26-irc-xor-mask-provenance.yml`](../.github/workflows/agent26-irc-xor-mask-provenance.yml).

## Cryptanalytic consequence

**Retire this mask as an active LP2 key/source.** Do not run offset sweeps, repetitions/extensions, image XOR scans, SHA-1 preimage guessing, GP29 mappings, or other receiver searches from it.

A future reopening requires materially new provenance: a pre-2-November-2014 first-party/signed object, independently archived derivation, or source whose bytes deterministically yield all 20 mask bytes **and** identify the intended receiver. A later repost, solver script, or output-dependent fit is insufficient.
