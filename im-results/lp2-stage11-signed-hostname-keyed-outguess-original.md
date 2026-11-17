# Signed Stage11 destination hostname: source-keyed OutGuess original-JPEG test

**17 November 2026, Agent11. Finite negative, no new plaintext.**

The May 2014 Cicada-signed LP2 invitation names `ky2khlqdf7qdznac.onion`. Because earlier authentic Cicada rounds used OutGuess, test its exact full hostname and the bare `ky2khlqdf7qdznac` label as the only two passphrases. No signed text expressly directs this use.

**Actual source test:** all 58 original LP2 JPEG pages (project `17.jpg`–`74.jpg`), both keys: **116 OutGuess 0.4-compatible extraction attempts**. Independent genuine positive control first recovered the **31,809-byte**, OpenPGP-armored LP1 `03.jpg` payload under `Default key`, verifying coefficient extraction and cipher iterator.

**Results:** 81/116 headers were rejected by payload-bounds/iterator checks: 74 skip-modulus exhausted and 7 claimed lengths exceeded source capacity. 35/116 yielded arbitrary bytes, 22 under the full hostname and 13 under its bare label. Every one of those 35 has an original image coefficient **first-1,024-bit all-one prefix**, which forces apparent ciphertext headers and makes a plausible packet header spurious. None yields OpenPGP armor, a recognized file magic, or readable UTF-8. Maximum ASCII-printable fraction **0.3876**; recovered byte entropies **7.9962–7.9975 bits per byte**. **Zero independently recognizable payloads**.

Retire only the **two fixed Stage11-hostname OutGuess key candidates** on the 58 original carriers. The test does not rule out an independently selected password, another payload algorithm, or encrypted binary requiring a separate authenticated discriminator. The apparent 35 reads are not decryption evidence.

**Reproducer:** [one-file Python SFT](../sims/lp2_stage11_signed_hostname_outguess_sft.py), using existing [source-exact extractor](../sims/outguess_extract.py) and JPEG coefficient dump, plus [manual CI workflow](../.github/workflows/agent11-stage11-host-outguess.yml). Successful historical-control and original-image [CI run 44100413129](https://github.com/FlareZ123/liber-primus/actions/runs/44100413129), 17 November 2026, with all 116 statuses, SHA-256/SHA-512 hashes, leading bytes and payload classification in the job log. No actual unknown LP2 plaintext or key was recovered.
