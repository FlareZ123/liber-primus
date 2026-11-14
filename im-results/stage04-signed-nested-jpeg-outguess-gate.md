# Authentic 2014 Stage04 carriers: source-fixed OutGuess checks

**Agent 6, 14 November 2026. Evidence class: original-file source gate with an authenticated positive extraction control.** No new LP2 plaintext, creator key, or authenticated hidden message was recovered.

The signed Cicada 2014 Stage04 OutGuess message from original `03.jpg` contains the literal instruction “Let the text guide you” and an embedded 15,188-byte JPEG displaying the runes used in that stage's next-onion address. The image `resources/external/derived/2014-stage04/03-small-rune-image.jpg` is a **separate carrier** from the 75 original Liber Primus page JPEGs covered by previous default-key census work. The source's actual next-onion decoding uses the phrase **WELCOME PILGRIM TO THE**, so two exact extraction passwords were fixed *before* inspecting image bitmaps: `Default key` (the historically working OutGuess default) and `WELCOME PILGRIM TO THE` (the stage-authenticated phrase). No password mutation, extra phrase, hash, or key search was performed.

The image has original Git blob SHA-1 `f91bdd6e2a890968a5a13d39be4d56899b877920`, SHA-256 `2e7c5b2f19e1edcda95534fb72a52aebf1a9d34619559b45a4425840c12d88a4`, and 16,084 OutGuess-eligible coefficient bits (2,011 bitmap bytes; bitmap SHA-256 `3a3e469a49edcbf7c7504e1ecffb146d80216f104de9e74a9ebbb6a4db1c709d`). The source-faithful OutGuess 0.4 JPEG DCT bitmap and ARC4 retrieval code is `sims/outguess_bitmap_dump.c` plus `sims/outguess_extract.py`.

| Frozen password | Header-indicated message length | Actual bitmap bytes | Verdict |
| --- | ---: | ---: | --- |
| `Default key` | **6,166** | 2,011 | Impossible capacity |
| `WELCOME PILGRIM TO THE` | **6,291** | 2,011 | Impossible capacity |

The **same extractor** recovered the period-original **31,809-byte PGP-signed message** from original page `03.jpg` with the default password, exact SHA-256 `a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1`. Thus the two invalid nested-JPEG headers are not caused by an untested extraction implementation. This result retires **only these two exact OutGuess password/carrier choices**. OutGuess does not cryptographically authenticate a correct key by header alone. Further password guessing without an independent historical selector would be low-value.

**One additional source-derived transfer to the original next page:** the same exact historical phrase `WELCOME PILGRIM TO THE` was checked as the OutGuess key for original LP1 `04.jpg`, a source on the historical path immediately after `03.jpg`. The 1,164,245-bit coefficient bitmap produced a 7,161-byte candidate (header seed 35,332), SHA-256 `357d1d3fd1f605315b93f45d7809bc3b4414fe7b624a88915f3f866679b207e9`. That extraction was generic high-entropy bytes (7.97215 bits/byte), without recognized file signatures or long printable lines, **not a validated second-stage message**. A nonempty OutGuess result is compatible with a false random header. No further decoding is justified by this direct phrase transfer.

Reproducer: [read-only original-source SFT](../sims/stage04_embedded_small_image_outguess_sft.py), [successful isolated manual Actions run 43545905453](https://github.com/FlareZ123/liber-primus/actions/runs/43545905453), existing workflow route `stage04-small`. Historical sources: [2014 Stage04 extracted-object register](../resources/external/derived/2014-stage04/README.md). Unlike an LP2 decryption attempt, this test asks whether the independently authored 2014 carrier supplies a second authentic clue before any unknown ciphertext is used.

The follow-up page04 source-phrase gate ran successfully in [manual Actions run 43546406468](https://github.com/FlareZ123/liber-primus/actions/runs/43546406468), using the same reproducer and unchanged historic positive control.

## Original 2014 nested JPEG as a full-length GP29 pad: bounded source-key test

The same period-original 15,188 bytes exceed the complete **12,956-rune** unknown ciphertext length, making them an available historical file-derived running-key candidate. Importantly, **no 2014/2016 instruction identifies JPEG file bytes as an LP2 pad**. Two frozen direct source encodings are natural: (A) one key rune per original JPEG byte `byte mod 29` (15,188 available); (B) stream original file bits MSB-first, read consecutive five-bit integers, discard 29–31 (22,240 base29-compatible tokens). For each, apply `P[i]=(C[i]±K[i]) mod29` to every original unknown rune in source order from byte/bit position zero. No page reset, skip, shift, dictionary or key search:

| Exact file-derived key | Subtract IoC | Add IoC |
| --- | ---: | ---: |
| Original JPEG bytes mod29 | **0.0344719991** | **0.0344815675** |
| Five-bit blocks, reject 29–31 | **0.0344655408** | **0.0344888956** |

The 29-rune uniform reference IoC is **0.0344827586**. All four 12,956-rune outputs have near-uniform symbol concentration and no readable GP-native starting passage. The source itself is real; its role as key was a cheap source-constrained *hypothesis*, not an instruction inherited from the historical signed message. This result excludes only these four literal full-length inverses, without claiming anything about arbitrary transforms, offsets or private keys.
