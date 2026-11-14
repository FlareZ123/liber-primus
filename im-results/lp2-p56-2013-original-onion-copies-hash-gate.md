# P56's 128-hex destination digest against preserved 2013 signed/onion pages

**Agent 4, 14 November 2026. Original-source historical preimage attempt, finite negative. No recovered destination or LP2 plaintext.**

## Why these exact historical targets

The authentic solved LP2 p57 *PARABLE* text already appeared verbatim in the original 2013 `AUDIO/761.MP3` metadata, prior to the 2014 LP2 page release. This makes it plausible, without establishing that p56 also existed in 2013, that some earlier Cicada material could be relevant to the manuscript's final-page instruction. Solved LP2 p56 specifically describes **a deep-web page that hashes to** the 128-character hex digest:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

The immediate, direct human-style check is whether preserved actual source material for early authenticated 2013 onion pages already has that digest, rather than guessing hundreds of spellings, fictitious hosts or appended URLs.

## Fixed byte inputs and hash operations

A [read-only, deterministic single-file SFT](../sims/lp2_p56_2013_original_onion_copies_hash_sft.cjs) hashes exactly **14 source-preserved raw files**:

- Eight dated 2013 source artifacts stored directly under `resources/historical/`: the original first-onion `hello.asc`, forest clue, two second-onion signed files and the accompanying literal ICMP-echo hex transcription, plus three archived Cicada OS original shell/message files.
- Six original-file participant copies under `resources/historical/pklmx-2013/`: standby, Annapolis and Okinawa `.html` and their respective `.txt.asc` PGP clearsigned companion files. Their archived byte counts, original upstream Git blob identifiers, PGP verification and HTML-versus-signed-body caveats are documented in [the existing 2013 archive source account](../resources/historical/pklmx-2013/README.md).

The main historical 512-bit digest is **SHA-512**, with BLAKE2b-512 (published 2012) and modern SHA3-512 evaluated as explicit comparator functions. For these exact bytes, **14 inputs × 3 digests = 42 comparisons**, no speculative hash wrapper, newline permutation, source concatenation, URL candidate, binary reconstruction or phrase-generated plaintext. SHA-512's independently known standard `abc` test vector is asserted by the code and each original raw source file's SHA-256 digest is printed for exact reproduction.

## Result and interpretation

**Zero exact matches in 42 source-bounded comparisons.** Original bytes may nevertheless be missing. In particular, the preserved `pklmx` HTML copies are **participant-archive pages**, *not* original 2013 HTTP responses; a separate contemporaneous HTTP header reports a **1,869-byte entity** that was not recovered, compared with participant standalone copies of **976–983 bytes**. Hashes are sensitive to every original source byte, encoding and serialization choice. Thus this is a real negative for archived preserved files, not a negative for all historical hidden pages, not proof of SHA-512 selection, and not evidence that p56's deep-web page was distributed by 2013.

This finite check leaves the most actionable prerequisite unchanged: **a surviving exact historical HTTP entity body, identifiable by a contemporaneous linked hidden-service URL or original archive capture**. Obtain that first, then compare the exact source bytes to the displayed p56 target. A true match would establish the missing page independently, even if it did not automatically decrypt the 12,956 unsolved runes.

**Reproducer:** [`sims/lp2_p56_2013_original_onion_copies_hash_sft.cjs`](../sims/lp2_p56_2013_original_onion_copies_hash_sft.cjs), [Windows Node22 manual CI PASS 43629915573](https://github.com/FlareZ123/liber-primus/actions/runs/43629915573). No ciphertext decryption or authentic target hash preimage was recovered.
