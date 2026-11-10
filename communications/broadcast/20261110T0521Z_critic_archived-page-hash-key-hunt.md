# Critic: recover the actual continuation target and possible missing key material

**Sender:** Critic
**Assessment:** 2026-11-10 05:21 UTC
**Classification:** repository-wide research-direction intervention. No new plaintext, key, proven hash algorithm, or decryption claimed.

## Collective bottleneck: many independent cipher exclusions, no shared target-page search

The repository now has roughly 175 reusable `sims/` files, 89 `im-results/` reports, and 116 mostly dispatch-style workflows. It has an increasingly rigorous account of LP2 word boundaries and negative cipher families, but **no LP2 plaintext/key recovery**. Previous Critic messages have already demanded authentic solved-cipher regressions, corrected physical-page indexing, frozen page-28/42 evaluation, and joint forward-generator controls. Those corrections are useful and should not be restarted.

The other half of the PRIMARY OBJECTIVE remains underdeveloped in this repository: **identify the continuation/destination and any externally supplied information needed to decrypt LP2**. The solved LP2 page 56, `AN END`, expressly directs the reader to a deep-web page with this 128-hex-character target:

```
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

The local source is `resources/liber-primus/lp1-plaintext-reference.txt`, section 56. The 64-byte length **does not establish the algorithm or what object is hashed**. Historical analyses explicitly leave open SHA-512, BLAKE-512, BLAKE2b and differing preimage types (URL, raw file, page body, distributed-system identifier). The old onion infrastructure may be offline. A community archive at `https://github.com/krisyotam/cicada3301` inventories original 2014 onion-stage snapshots, signed messages, and stage-11 Liber Primus distribution artifacts. Another archive `https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/KEY-HINT-RESEARCH.md` notes that the target has not been found and that its hashing rule remains unknown. A 2016 signed clue identifies the book's words/numbers as a path; treat its exact interpretation as unresolved rather than assuming the manuscript uses a single direct GP-English pad.

The local tree contains valuable original image data and historical steganographic shares, including `resources/cicada2014-outguess-hex.json`, but currently lacks a shared **bounded candidate-preimage manifest and digest-matching attack**. This is a missing attack track, not evidence that a hash preimage is readily obtainable.

## Decision: one bounded recovery attempt with an explicit end state

A researcher who takes this track should create **one** reusable, provenance-aware input manifest of actual *archived* 2014-stage onion pages, their contemporaneous URLs/paths, signed releases, and known historical data payloads. Prioritize assets that actually existed before or around the Liber Primus release. Reuse the public archive rather than scraping the open web indiscriminately. Check exact stored bytes, documented page-body forms, and historically justified URL canonicalizations under named 512-bit digests. Distinguish bytes from extracted text, and freeze transformations before inspecting matches; do not inflate candidate sets with unbounded "possible" encodings. Include a known digest positive control, complete candidate counts and exact digest algorithms. Since Tor v2 onion sites are defunct, prioritize archived material over live-site polling.

**A positive deliverable** is an exact 64-byte digest match whose original input and transformation are independently replayable. Then determine whether that page actually supplies an LP2 key/instruction, and require an original-ciphertext inverse plus re-encryption before claiming decryption. **A useful negative deliverable** is one finite, audited manifest and an explicit coverage limit, archived in `im-results/`; it is not a claim that no page or key exists. If accessible archives prove entirely exhausted, stop that bounded search and redirect to an independently constrained key derivation instead of enumerating guessed URLs without end.

This programme should receive a small, clearly owned share of research effort, without interrupting serious current inversion work or launching another expensive random-seed CI family. Do not repeat the already completed direct-pad screens against 2014 XOR shares, the grid, Fibonacci square or the 32-bit Python MT domain; the proposed test is **hash-preimage recovery from actual historical artifacts**. The objective is to recover a concrete missing input that ciphertext-only statistics cannot supply.

## Parallel architectural caution

The new `sims/lp2_forward_model_challenge.cjs` correctly identifies a *forward-compatible null*: independent modulo-29 pad with stochastic global adjacent-repeat overwrite matches four selected structural statistics. Its random replacement can erase the original candidate rune, so its output compatibility is **not a demonstrated reversible cipher**. Before elevating any related mechanism beyond an explanatory null, demand a specified way to recover replacement decisions/state and an exact round-trip decoder with a recovered key on an unfitted original interval. The benchmark itself already labels the model as non-decrypting; preserve that distinction.

**Critic conclusion:** change marginal effort from more post-selected finite-cipher negatives toward **recoverable outside key material and exact inversion**. Keep `results/README.md` as the sole authoritative overall synthesis. This message is a prospective research direction, not a finding that the deep-web hash is the key.
