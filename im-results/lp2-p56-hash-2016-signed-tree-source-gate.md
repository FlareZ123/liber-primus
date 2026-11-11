# Solved p56 deep-web hash versus signed 2016 and original tree artifacts

**Outcome:** no known preimage recovered. Source-fixed SHA-512 comparison only, tested on the original bytes in [successful CI run 42972458234](https://github.com/FlareZ123/liber-primus/actions/runs/42972458234). The existing unknown LP2 plaintext and deep-web destination remain unsolved.

The independently solved LP2 p56 prints the 64-byte deep-web digest `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. An authentic signed 2016 clue returns the player to Liber Primus and supplies a visible tree in a 563×569 JPEG, matching the prime-summed p32 11×11 rune axes. The image's authenticated 1,136-byte OutGuess message also equals the p32 middle 5×5 ring sum. That is a source-visible reason to ask whether the 2016 material finally supplies a direct preimage to the earlier hash. It does **not** establish that 2016 is the hash target, nor select a different digest than SHA-512.

The [standalone SFT](../sims/lp2_p56_hash_signed2016_original_sources_sft.cjs) hashes exactly nine frozen source interpretations: the signed 2016 JPEG file (**26,342B**), its extracted signed ASCII (**1,136B**), original LP2 illustrated p14/p32/p55 JPEGs (**436,699/362,637/614,928B**), the 2016 cleartext as originally extracted (**270B**), OpenPGP canonical CRLF cleartext (**287B**), decoded RSA signature packet (**543B**) and its exact MPI (**512B**). The known SHA-512 `abc` test vector authenticates the operation before checking all original inputs. None equals the full solved p56 digest.

Three illustrative source SHA-512 results:

- Signed 2016 JPEG: `f4ac5cb8e0a177756d4ef794287d662465a8d30e04d1fd1a133f3575e40c3622e5e811099cc81fc6afe204bb9d4282a29e033646e068df495a51186751ac7be2`
- Signed OutGuess ASCII: `d5871cd2f42910c72bf8ff2d9599776173c2e5e34859810633ce3cb8b80d2b7bd864e67bb6b0794a3600a304d4e68c358f4213ff128f953dd02df4746f375262`
- Original p32 scan 49.jpg: `2941e1b34c502ba4c24b0c2005c4c08cf9dadcc4ff7a21196f4bac15d728a141f2cc4e6e8ea4168e185ed3a7ce31d8cb459e5312da0c98f8f1e449cfb05456c3`

The exact equality fails for all nine. Do not expand this into arbitrary URL concatenations, keyed hashes, guessed encodings or more hash families without a historically sourced rule. The 2016 tree might still be a navigational image, password selector or key source; this test only excludes these specific immediate SHA-512 preimages, not a historical Tor resource whose bytes are missing.
