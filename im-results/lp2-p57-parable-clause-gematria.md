# p57 Parable clause-sum checksum

**Status:** verified arithmetic checksum of known plaintext; not a decryption or key recovery.

## Finding

The original p57 runic transcription contains the title word **PARABLE** followed by three prose clauses. Summing the Gematria Primus prime values of the runes in each clause gives:

| Clause | Original rune transliteration | Rune count | Prime-value sum |
|---|---|---:|---:|
| 1 | LICE THE INSTAR TUNNELNG TO THE SURFACE | 30 | **1,259** |
| 2 | WE MUST SHED OUR OWN CIRCUMFERENCES | 30 | **1,031** |
| 3 | FIND THE DIUINITY WITHIN AND EMERGE | 28 | **1,229** |

The product is exact:

\[
1259\times1031\times1229=1,595,277,641.
\]

All three clause sums are prime. The title word PARABLE (seven runes) is excluded.

## The discriminating orthography

The calculation uses the **original runic transcription**, not a fresh Latin-to-rune transliteration:

- The original word is `TUNNELNG`: the single `NG` rune represents the Latin `ING` ending. Inserting a separate `I` rune would raise clause 1's sum from 1,259 to 1,290 and change the product to **1,634,557,710**, which does not match.
- `LIKE` appears as `LICE` because the GP rune covers C/K.
- `DIVINITY` appears as `DIUINITY` because the GP rune covers U/V.

These are properties of the actual p57 rune stream, not optional normalizations selected to improve a score.

## Source status and limits

The local source contract `resources/external/2013-instar-xor-source.md` pins the 2013 `761.mp3` blob and its TXXX Parable text. An independent research record at [pnotisdev/cicada3301](https://github.com/pnotisdev/cicada3301) reports the integer 1,595,277,641 in that MP3's ID3 metadata. The p57 JPEG itself does **not** visibly print the integer. This report does not parse the MP3 binary; it independently verifies the arithmetic relation against the original p57 rune transcription and the repository's GP29 prime-value table.

## Interpretation

This establishes a source-consistent checksum for the three-clause segmentation and the GP29 prime-value convention. It confirms that the Parable's number is the **product of its three clause sums**; it is not evidence that the number is an RSA modulus, a keystream, or a key for LP2 pages 0–55. No unknown plaintext or destination was recovered.

## Reproduction

From the repository root:

```sh
node sims/lp2_p57_parable_clause_gematria_sft.cjs
```

The reproducer reads only `resources/liber-primus/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`, checks the original p57 rune count and word segmentation, verifies the three sums and primality, and asserts the product.
