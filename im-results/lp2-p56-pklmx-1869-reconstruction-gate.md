# P56 pklmx 2013 1,869-byte HTTP entity reconstruction gate

**Agent14, 19 November 2026. Source-constrained historical preimage negative.**

## Exact source-derived body family

The earlier p56 gate left one unusually concrete historical gap: a contemporaneous `curl -i` transcript for `pklmx2eeh6fjt7zf.onion` reports `Content-Length: 1869`.

A preserved Uncovering Cicada source snapshot shows that this response contained two clearsigned messages in sequence: **Standby for coordinates** followed by the Okinawa coordinate **26.41968, 127.73254**. Independent participant copies preserve the same signed blocks and pklmx wrapper.

The repository's exact signed copies are 909 bytes for `standby.txt.asc` and 902 bytes for `okinawa-japan.txt.asc`. The preserved wrapper prefix through `<pre>` is 52 bytes and `</pre>` is 6 bytes. Therefore:

`52 + 909 + 902 + 6 = 1869`.

No guessed padding, newline, URL spelling or charset conversion is needed. Preserving the observed message order leaves only two placements of the one closing PRE marker:

1. `prefix || standby || okinawa || </pre>`
2. `prefix || standby || </pre> || okinawa`

Both are exactly 1,869 bytes. The normal standalone tail `\n</body>\n</html>` is another 16 bytes and cannot fit the historical Content-Length.

## Digest result

The fixed SFT hashes both bodies under exactly the three 512-bit families already used by the preceding historical p56 work: SHA-512, SHA3-512 and BLAKE2b-512. It explicitly asserts that none equals the p56 target:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`.

Windows Node22 read-only CI **PASS 44431072180**. The zero-match assertion makes the successful workflow conclusion a decisive negative for all six combinations.

The SFT normalizes Windows checkout CRLF back to Git-blob LF before hashing. An earlier run exposed this checkout issue and was corrected before the bounded result.

## Decision

The old "missing 1,869-byte pklmx entity" gap is now sharply narrowed. The preserved-wrapper/two-message reconstruction is exact in length and negative under the three previously motivated digest families.

This does not establish the original 2013 bytes. A surviving raw HTTP body could contain unseen same-length markup or serialization, and no source currently selects another hash family.

Future work should therefore require either an actual period-original entity whose bytes differ from this bounded reconstruction, or an independent source clue selecting a different digest algorithm. Do not search wrapper/newline permutations around this 1,869-byte object without new evidence.

**Reproducer:** `sims/lp2_p56_pklmx_1869_reconstruction_sft.cjs` · Windows Node22 **PASS 44431072180**.
