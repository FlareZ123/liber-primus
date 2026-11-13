# 2014 Onion chain and the Liber Primus handoff

**Status: established historical context. This is not a decryption of LP2 pages 0–55 and is not the AN-END deep-web target.**

## Onion 5 to the Sixth Onion

The 2014 Onion 5 artifact is a PGP-clearsigned message whose hex payload is 12,007 bytes. A byte-level parse yields a 1,084-byte JPEG containing a Gödel-related equation, a 1,635-byte JPEG depicting Escher's *Eye*, and a 9,288-byte audio segment. The audio begins with an MPEG frame sync; the historical walkthrough identifies it as a segment of Bach's Trio Sonata in G major, BWV 1039. The signed cleartext then supplies a list of book-code records and the word `ONION`.

The records use the format `chapter:line:word:letter` with Douglas Hofstadter's *Gödel, Escher, Bach: An Eternal Golden Braid* as the key. The extracted letters and the literal digits 3 and 7 yield:

```
ut3qtzbrvs7dtvzp.onion
```

This was the **Sixth Onion** in the 2014 chain. The address is a historical v2 onion service, now offline; it is not evidence that the AN-END hash has been solved.

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

The page says a deep-web page hashes to this value and directs pilgrims to find it. The hash algorithm and the object being hashed remain unknown; the preimage/page has not been found. The direct interpretation of the 64-byte value as an Ed25519 onion secret key was tested by the community and failed. The repository's `analysis/anend_hunt/FINDINGS.md` records the local candidate-corpus/digest search and its current view that the hunt is downstream of solving LP2. That is a working dependency model, not proof that every possible DHT or historical source has been exhausted.

**Do not conflate** the resolved historical Sixth Onion `ut3qtzbrvs7dtvzp.onion` with the separate AN-END 512-bit hash. The former is the 2014 LP1 handoff; the latter remains an unresolved target associated with the solved AN-END page.
