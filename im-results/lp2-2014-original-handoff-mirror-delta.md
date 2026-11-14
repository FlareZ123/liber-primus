# Original 2014 LP2 handoff: exact modern-mirror object difference

**Agent 3, 14 November 2026. Director Issue #827.** Two independently preserved modern mirror families supply no previously missing signed 2014 LP2 key, operation, or original ciphertext carrier. They expose an important practical fact: a widely copied modern Stage11 JPEG set is not byte-identical to the 2014 participant archive.

## What contemporary players received

The May 11, 2014 participant repository (micheloosterhof/cicada-2014, commit 6c3421a4d245596e403c88e037509d162a2afd17) preserves the bare 1,640-byte seventh-onion HTML image index, Git blob SHA-1 303db130705f0ef9be2a738f4336d5cfcebde80c. It lists exactly 58 relative filenames numbered 0.jpg through 57.jpg. All 58 original page bytes and Git identities are pinned in [the primary manifest](../resources/historical/stage11-2014-index-manifest.json). The already preserved, separate signed 2014 redirect directs a solver to ky2khlqdf7qdznac.onion but specifies no key, cipher or reset.

## Distinct 2022 mirror: a 35/23 image split

The later [neuroretransmit Stage11 mirror](https://github.com/neuroretransmit/cicada/tree/main/2014/011-seventh-onion) first appears in a repository created December 2022, whose original image commit is dated December 15, 2022. Every one of its 58 image files is shorter than the exact 2014 original.

| Original physical LP2 pages | Count | Exact byte relationship |
| --- | ---: | --- |
| 35 original **three-component RGB** JPEGs | **35** | Mirror JPEG is exactly the original with the initial 18-byte JFIF APP0 segment removed (JPEG offsets 2 through 19). All 35 expected mirror Git blob SHA-1 values match independently published mirror metadata. |
| 23 original **single-component grayscale** JPEGs | **23** | Mirror size is 17,365 to 28,666 bytes shorter; removing only the JFIF segment fails the mirror SHA-1 and size test. These files underwent further, uncharacterized byte changes. |

The second group consists exactly of pages **16–21, 24–25, 28–31, 41–48, and 50–52**. This 35/23 classification agrees precisely with JPEG SOF0 component counts parsed from untouched originals. We have not recovered the changed 23 mirror binaries and do not claim a proven specific recompression method. The image differences are not a new encrypted payload: the preserved, larger original JPEGs remain the source artifacts, while the modern smaller copies are derived and have no independent first-publication custody.

The mirror's HTML index is 1,639 bytes and differs from the 2014 original only by removal of its last newline. Its Git blob is edd9b062db1e064c360951b6fd53baa53573da03. The folder also holds 19 non-image objects including modern README, scripts, rune transcriptions, OutGuess .bin output candidates and .check logs. None has original May-2014 served-file attribution. Its author describes the 8.jpg.bin OutGuess COM candidate as likely unimportant; these are post-release solver products.

## Signed handoff variants

The 2026 [Dukotah primary-signature registry](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json) records the genuine handoff PGP signature-packet ID FPjtqb5zyNAgftimJVfvuUF8wMU under key 181F01E57A35090F. Its preserved 1,183-byte primary text is byte-identical to the handoff in this repository (Git blob e2b7382ac2cfb0adfe028cc063fc6048e0ad718e). The same mirror's iBotPeaches / ky-prefixed copies share the same armored signature and are 1,010-byte versions with trailing whitespace normalized (blob 5bfaaeaf5364291e8a38d27222946f9db93cd50b).

The neuroretransmit signed copy is 1,182 bytes (blob adc4a41fab31905ff9417646a14e507a5e1fdb45). After OpenPGP cleartext whitespace canonicalization, it has the same text and no additional instructions; the changed blanks and trailing spaces illustrate why the handoff's prime-sized *whitespace* remains unauthenticated as a creator-selected sequence. This finding adds no LP2 key.

Dukotah's finite signature timeline includes 15 distinct 2014 events, all earlier Cicada stages or the existing LP2 handoff, and no additional later signed LP2 decoding instruction. It cannot rule out privately distributed messages or an unarchived HTTP object.

## Exact reproducible decision

The [machine-readable 58-page source/mirror delta](2014-handoff-original-mirror-differences.json) stores all original/mirror Git blob IDs and lengths plus 19 sidecars and signed copies. [Read-only Node22 test](../sims/lp2_2014_handoff_mirror_delta_sft.cjs) tests the original 58/58 JPEG hashes, page component counts, **35/35 exact JFIF-only transformations**, and the **23/23 changed grayscale entries**. It also reproduces the one-newline HTML difference and canonical original signed-message Git blob. This passed on [Windows CI run 43564556743](https://github.com/FlareZ123/liber-primus/actions/runs/43564556743).

**Director decision:** the named mirror comparison yields **zero new original-era key or decryption instructions**. Retire these sources as key-discovery candidates; preserve the complete index so the actual original JPEGs are used for future byte-level steganography. Reopen only for a genuinely contemporary signed instruction, different original release member, or authenticated original HTTP capture. Unknown LP2 plaintext remains unresolved.
