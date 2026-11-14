# Authentic 2014 nested JPEG: two source-fixed OutGuess checks

**Agent 6, 14 November 2026. Evidence class: original-file source gate with an authenticated positive extraction control.** No new LP2 plaintext, creator key, or hidden message was recovered.

The signed Cicada 2014 Stage04 OutGuess message from original `03.jpg` contains the literal instruction “Let the text guide you” and an embedded 15,188-byte JPEG displaying the runes used in that stage's next-onion address. The image `resources/external/derived/2014-stage04/03-small-rune-image.jpg` is a **separate carrier** from the 75 original Liber Primus page JPEGs covered by previous default-key census work. The source's actual next-onion decoding uses the phrase **WELCOME PILGRIM TO THE**, so two exact extraction passwords were fixed *before* inspecting image bitmaps: `Default key` (the historically working OutGuess default) and `WELCOME PILGRIM TO THE` (the stage-authenticated phrase). No password mutation, extra phrase, hash, or key search was performed.

The image has original Git blob SHA-1 `f91bdd6e2a890968a5a13d39be4d56899b877920`, SHA-256 `2e7c5b2f19e1edcda95534fb72a52aebf1a9d34619559b45a4425840c12d88a4`, and 16,084 OutGuess-eligible coefficient bits (2,011 bitmap bytes; bitmap SHA-256 `3a3e469a49edcbf7c7504e1ecffb146d80216f104de9e74a9ebbb6a4db1c709d`). The source-faithful OutGuess 0.4 JPEG DCT bitmap and ARC4 retrieval code is `sims/outguess_bitmap_dump.c` plus `sims/outguess_extract.py`.

| Frozen password | Header-indicated message length | Actual bitmap bytes | Verdict |
| --- | ---: | ---: | --- |
| `Default key` | **6,166** | 2,011 | Impossible capacity |
| `WELCOME PILGRIM TO THE` | **6,291** | 2,011 | Impossible capacity |

The **same extractor** recovered the period-original **31,809-byte PGP-signed message** from original page `03.jpg` with the default password, exact SHA-256 `a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1`. Thus the two invalid nested-JPEG headers are not caused by an untested extraction implementation. This result retires **only these two exact OutGuess password/carrier choices**. OutGuess does not cryptographically authenticate a correct key by header alone. Further password guessing without an independent historical selector would be low-value.

Reproducer: [read-only original-source SFT](../sims/stage04_embedded_small_image_outguess_sft.py), [successful isolated manual Actions run 43545905453](https://github.com/FlareZ123/liber-primus/actions/runs/43545905453), existing workflow route `stage04-small`. Historical sources: [2014 Stage04 extracted-object register](../resources/external/derived/2014-stage04/README.md). Unlike an LP2 decryption attempt, this test asks whether the independently authored 2014 carrier supplies a second authentic clue before any unknown ciphertext is used.
