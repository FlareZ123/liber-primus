# 2014 Onion chain and the Liber Primus handoff

**Status: established historical context. This is not a decryption of LP2 pages 0–55 and is not the AN-END deep-web target.**

## Onion 5 to the Sixth Onion

The 2014 Onion 5 artifact is a PGP-clearsigned message whose hex payload is 12,007 bytes. A byte-level parse yields a 1,084-byte JPEG containing a Gödel-related equation, a 1,635-byte JPEG depicting Escher's *Eye*, and a 9,288-byte audio segment. The audio begins with an MPEG frame sync; the historical walkthrough identifies it as a segment of Bach's Trio Sonata in G major, BWV 1039. The signed cleartext then supplies a list of book-code records and the word `ONION`.

The records use the format `chapter:line:word:letter` with Douglas Hofstadter's *Gödel, Escher, Bach: An Eternal Golden Braid* as the key. The extracted letters and the literal digits 3 and 7 yield:

```
ut3qtzbrvs7dtvzp.onion
```

The seven-onion sequence reconstructed in the external hunt is `auqgnxjtvdbll3pv` → `cu343l33nqaekrnw` → `fv7lyucmeozzd5j4` → `avowyfgl5lkzfj3n` → `q4utgdi2n4m4uim5` → `ut3qtzbrvs7dtvzp` → `ky2khlqdf7qdznac`; the seventh onion published Liber Primus. This was the **Sixth Onion** in that chain. The address is a historical v2 onion service, now offline; it is not evidence that the AN-END hash has been solved.

## Bach score provenance: first-party audio, participant-sidecar notation

The 9,288-byte Bach excerpt is included in the signed OutGuess payload and is a genuine first-party Onion5 asset. The score image is not. The preserved Onion5 `pre` and `post` responses distinguish the longer `Interconnectedness` stage from the later Goya portrait carrier: the `post/index.html` object is byte-identical to the 359,282-byte Goya JPEG (Git blob `58de2bf93cc61e6817f7cae98afd690df9b9d039`), not an HTML score page. OutGuess of that portrait yields the signed message with two JPEGs, the 9,288-byte Bach audio and the GEB book code; it contains no score, notation, note list or pitch mapping. See the [archived Onion5 state](https://github.com/iBotPeaches/cicada_3301/tree/master/onions/q4utgdi2n4m4uim5.onion) and [Stage08 payload](https://github.com/micheloosterhof/cicada-2014/blob/master/stage08/index).

The 180×159 `McLEj0T.png` score thumbnail is a separate Wikia CDN upload, versioned `__cb20140202145619` and captured as an image on **2014-02-27 04:21:20 UTC**. The surviving Wikia export is a 2021 revision; the participant says they identified the clip as BWV 1039, used the public IMSLP score, made a screenshot of bar 18, re-transcribed the notes in Finale, and linked their Dropbox and Pastebin work. Thus the score, transcription and six pitch-number mappings are participant sidecar, not Cicada-authenticated inputs. The preserved Wayback record is the Wikia thumbnail, not the original Onion5 page HTML. **Keep the audio as historical context; retire the score as an LP2 selector unless an independent Cicada-authored instruction selects a musical operation.** See the [consolidated source and cryptanalytic gate](../im-results/lp2-onion5-bach-musical-square-source-gate.md).

Primary artifact mirror: [PGP-clearsigned Onion 5 message](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc). The external artifact inventory records the payload metadata in [PAYLOADS.json](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/signed-payloads/PAYLOADS.json). This invocation parsed the cleartext and embedded byte structure but did not independently verify the PGP signature.

## What the Sixth Onion delivered

The Sixth Onion served four initial Liber Primus pages. Their plaintext was not enciphered; it covered loss of divinity, consumption, preservation, adherence, wisdom, and an instruction to program one's mind and reality. Each page also contained a PGP-signed OutGuess message. The border values 3, 3, 0, and 1 yielded 3301.

The subsequent signed instruction asked participants to submit three magic squares and a Tor hidden-service URL, with the explicit instruction to work alone. The required squares were:

- order 5, magic sum 3301;
- order 5, magic sum 1033;
- order 7, magic sum 1033.

The matrices are preserved in `resources/cicada2014-openpuff-magic-squares.txt`. The 2014 walkthrough says the squares were recovered from the MP3 `Interconnectedness` using OpenPuff. After submission, three images (107.jpg, 167.jpg, 229.jpg) were returned. The final rune image was decoded with Vigenère key `CIRCUMFERENCE` to a koan. This is a solved historical stage; `CIRCUMFERENCE` is not thereby established as a key for LP2.

The detailed community reconstruction is [OpenPuff for experts — Cicada 3301 recruitment puzzle 2014](https://embeddedsw.net/doc/Openpuff_for_experts_Cicada_3301_recruitment_puzzle_2014.pdf). It documents the GEB book code, Sixth Onion, four LP1 pages, upload instructions, three-square criteria, and final koan.

## The p05 OOB matrix is already known prior art

The 179-byte header extracted from `resources/liber-primus/05.jpg` is the same Onion 3 out-of-bounds (OOB) payload documented in the walkthrough. The PDF prints the same hex sequence, reverses it to recover the 5×5 square with magic sum 1033, and notes that the lower half of the image encodes the same matrix. The word `MOBIUS` is one of the square's cells; it is not independent evidence for a new cipher. The cyclically rotated 18-cell triplet and the short `0x02` separator are features of the known OOB representation, not a newly established key or Möbius operation.

The local reproducer `sims/lp1_p05_trailer_matrix_sft.cjs` verifies the file-level trailer packaging and re-derives the 179-byte matrix. See `im-results/lp1-p05-trailer-mobius-matrix.md` for the corrected scope and the bounded, negative p55 key tests. Do not continue treating this known OOB payload as a p55 key.

## Keep the AN-END hash separate

The solved AN-END page gives a different 512-bit target:

```
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

The page says a deep-web page hashes to this value and directs pilgrims to find it. The hash algorithm and the object being hashed remain unknown; the preimage/page has not been found. The direct interpretation of the 64-byte value as an Ed25519 onion secret key was tested by the community and failed. The external [AN-END hunt findings](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/anend_hunt/FINDINGS.md) reconstruct the seven-onion chain and conclude that the AN-END address is gated behind solving the preceding LP2 pages. That analysis reports 2,574 representation/hash tests plus 132 tests on additional original 2014 artifacts, all null, and finds no retrievable, correctly targeted archive corpus. Treat this as a strong, source-supported dependency conclusion within the reconstructed chain, not a mathematical proof over every possible future network or artifact.

**Do not conflate** the resolved historical Sixth Onion `ut3qtzbrvs7dtvzp.onion` with the separate AN-END 512-bit hash. The former is the 2014 LP1 handoff; the seventh onion published Liber Primus. The latter remains a separate unresolved target associated with the solved AN-END page.
