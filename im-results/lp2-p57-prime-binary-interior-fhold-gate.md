# p57 prime-binary interior key: fixed original-cipher decision

**Decision:** retire the fixed per-rune binary-interior GP29 additive key described below. No new plaintext, authenticated key or decoder. The literal p57 wording is authentic; the binary representation and use of all 95 runes as a key are hypotheses, not authored instructions.

## Fixed receiver

The solved p57 parable invites shedding circumferences. Interpret the prime value of each of its 95 GP29 runes as an unpadded binary string; remove its first and last bit, parse the remainder as a nonnegative integer (empty = 0), reduce mod 29. Preserve the printed rune order and repeat the resulting 95-value tape. The first 13 p0 red runes are excluded from the independently selected black-body start. For each of p55, p0 black body, p16 and continuous p54–55, independently start the tape at zero. Test both additive signs; the literal plaintext-F convention emits F without consuming a key value. Ciphertext F may alternatively be a non-F encrypted symbol. No phase searches, arbitrary padding, or additional transforms.

Exact dynamic programming over the consuming position and two previous plaintext runes counts every legal path and selects the maximum fixed smoothed trigram score. Training uses the editor-normalized LP1 Latin transcription (sections separated, GP spelling conversion specified in code); solved LP2 p56/p57 are excluded from the training. This is a heuristic register, not the original native rune transcription. DP legality is independent of the scoring corpus.

## Executed result

| Original target | sign | runes | exact paths / first impossible zero-based rune | best score nats/rune |
|---|---:|---:|---|---:|
| p55 | 1 | 76 | 0 / 58 | — |
| p55 | -1 | 76 | 1 | -3.528082 |
| p0body | 1 | 249 | 0 / 23 | — |
| p0body | -1 | 249 | 6 | -3.522604 |
| p16 | 1 | 267 | 0 / 22 | — |
| p16 | -1 | 267 | 0 / 6 | — |
| p54p55 | 1 | 308 | 0 / 17 | — |
| p54p55 | -1 | 308 | 0 / 0 | — |

Every legal result re-encrypts exactly. Neither surviving inverse is coherent prose. The p55 survivor is unique under this exact key, sign and origin. Six of eight receivers have zero legal paths even before language scoring.

### Constructive planted controls

The same fixed key is used to encrypt three separate portions of LP1 normalized plaintext, with each entire target section held out of training. The inverse has the following exact recovery counts:

| Held-out section | sign | exact / total | legal paths | replay |
|---|---:|---:|---:|---|
| 1 | 1 | 184/184 | 8 | true |
| 1 | -1 | 184/184 | 9 | true |
| 3 | 1 | 260/260 | 72 | true |
| 3 | -1 | 260/260 | 328 | true |
| 16 | 1 | 28/28 | 2 | true |
| 16 | -1 | 28/28 | 8 | true |

These are synthetic plants on normalized solved-source words, not an independent historical cipher recovery. Exact replay is an implementation invariant, not evidence of the key.

Reproduce with `node sims/lp2_p57_prime_binary_interior_fhold_sft.cjs` from the repo root. [Code](../sims/lp2_p57_prime_binary_interior_fhold_sft.cjs) · [full output](../im-results/lp2-p57-prime-binary-interior-fhold-output.json). Inputs: canonical `lp2-corpus.json` blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, normalized `lp1-plaintext-reference.txt` blob 8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d. Executed in connected JS runtime; no CI required.

**Next:** do not expand binary padding, arbitrary bit packing, unknown phases or rank variants without a separate source-selected operation. This single direct key construction is negative; it does not establish an all-key or all-binary representation exclusion. The authoritative state is unchanged.
