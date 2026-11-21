# DATA/560.13 external Git-LFS recovery decision

**Decision (21 November 2026; Director Issue [#2011](https://github.com/FlareZ123/liber-primus/issues/2011)): bounded negative for independently recoverable, source-authenticated external copies.** The exact 118,818,811-byte object is present as a member of the hash-verified 2013 CicadaOS ISO. Two independently hosted community Git-LFS endpoints contain the exact pointer but both report that the object does not exist on their servers. No external first-party copy or LP2 key material was recovered.

## Fixed object and source identity

- SHA-256 OID: `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`
- Expected object size: **118,818,811 bytes**
- Exact ISO member: `/DATA/560.13;1`
- ISO member byte offset: **4,087,808**
- The object identity is independently confirmed by extraction from the pinned ISO; this is not an external standalone copy.

## Exact external repositories tested

### 1. mrroot01011001/Cicada-3301-

Pinned commit: [`1ccf9583b7064ffd6feb52a49442311048295b41`](https://github.com/mrroot01011001/Cicada-3301-/tree/1ccf9583b7064ffd6feb52a49442311048295b41)

Pointer path: `puzzles/2013/cicada-os/DATA/560.13`

The exact 134-byte Git-LFS pointer matches the fixed OID and size. A manual Git-LFS batch download request to `https://github.com/mrroot01011001/Cicada-3301-.git/info/lfs/objects/batch` returned HTTP 200, but the object record returned **404: Object does not exist on the server**.

- Workflow: [run 44917841503](https://github.com/FlareZ123/liber-primus/actions/runs/44917841503)
- Artifact: [14712174412](https://github.com/FlareZ123/liber-primus/actions/runs/44917841503/artifacts/14712174412)
- The run completed successfully because the script records a missing LFS object as a bounded result and continues to verify the ISO member. Its 1,217-byte artifact is the JSON report, not the 118 MB object.

The pinned repository README describes a broad community research archive. It is not a Cicada-signed custody statement.

### 2. Caiobas12345/aulas-javascript

Pinned commit: [`30a9368c01dc70f1e5a0cfedb8ad086045f184cd`](https://github.com/Caiobas12345/aulas-javascript/tree/30a9368c01dc70f1e5a0cfedb8ad086045f184cd)

Pointer path: `The-Complete-Cicada3301-Archive/2013/additional files/Cicada OS/cicados/DATA/560.13`

The exact 134-byte pointer again matches the fixed OID and size. A manual Git-LFS batch download request to `https://github.com/Caiobas12345/aulas-javascript.git/info/lfs/objects/batch` returned HTTP 200, but its object record also returned **404: Object does not exist on the server**.

- Workflow: [run 44938037238](https://github.com/FlareZ123/liber-primus/actions/runs/44938037238)
- Artifact: [14720157939](https://github.com/FlareZ123/liber-primus/actions/runs/44938037238/artifacts/14720157939)
- The run completed successfully as a test harness; its 1,275-byte artifact is the JSON report, not the 118 MB object.

The pinned nested README says the archive reorganizes Uncovering Cicada Wiki material and credits the solver community. It is a community mirror, not a first-party custody statement.

## ISO identity control

Both workflow runs downloaded the same pinned 136,398,848-byte ISO and verified:

- MD5: `74062dee4093c6ca0340cda23f0e994b`
- SHA-1: `df433cba87644b35cbc47f702a02e2b58d90af6a`
- SHA-256: `784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f`

The exact `/DATA/560.13;1` member is 118,818,811 bytes, begins at byte offset 4,087,808, and hashes to the exact pointer OID above. This establishes that the pointer names a real ISO member; it does not establish that either community archive retained the LFS payload.

## Other previously identified locations

The earlier exact-OID/filename census recorded in the [#2011 issue history](https://github.com/FlareZ123/liber-primus/issues/2011) found 39 global GitHub code-search matches. Relevant `DATA/560.13` paths were 134-byte LFS pointers or later recovery receipts, not raw standalone copies. The already identified `cicada-solvers` and `krisyotam` pointers had previously documented 404 object responses. Within the mrroot archive, repeated pointer blobs under the `archives/cijhho` and `archives/scream314` subtrees are copies of the same pointer, not separate object stores. The public Archive.org URL documented for the full bytes is an inner member of `3301.iso`, not an independent standalone archive.

The existing [derived-resource note](../resources/derived/cicada2013-56013-reconstruction.md) records the 15,330-byte prefix reconstruction and the separate full ISO member. The external pnotisdev research likewise describes its full file as recovered from the ISO; its binary is not preserved as an independently sourced standalone object.

## Conclusion and stop condition

Across the exact external pointers and repositories already identified, no source-authenticated standalone object was recovered. Both newly tested, distinct public LFS backends return object-level 404s. The only byte-complete copy established here is the exact member of the pinned CicadaOS ISO; the other public copies are community archives or pointers to unavailable LFS payloads.

This is a **bounded negative over the named public sources**, not a universal claim that no private or unindexed copy exists. Do not repeat broad filename/OID searches, re-run either failed LFS endpoint, or infer a key from the 118,818,811-byte size / 2013 DH-modulus correspondence. Reopen only if a new first-party locator or independently attributable raw object is supplied; then verify its exact size, SHA-256, custody, and any explicit LP2 instruction before testing a cryptanalytic consequence.

**Cryptanalytic result:** no unknown LP2 plaintext, authentic creator key, reversible receiver, or final destination was recovered.
