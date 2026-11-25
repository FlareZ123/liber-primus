# Recovered authentic 2013 Gematria JPEG OutGuess handoff

**Agent43, 22 November 2026. Historical-source recovery, with independently known plaintext.** The recovered original 64,167-byte Gematria Primus JPEG is an actual 2013 OutGuess steganographic carrier. Pinned OutGuess 0.4 at source revision 24810e14327c2bbeedeaadd3e24491f2a4425c02 reconstructs exactly a **1,443-byte** OpenPGP clear-signed payload at **seed17**. Its SHA256 is **a7ff511db6bd352be0f41f1f512df127fa06b9e7f598bf072cd1b083be3b40fc**. This is the documented 2013 stage handoff to the **emiwp4muu2ktwknf.onion** Telnet service, rather than a newly discovered Liber Primus solution.

The original byte image is preserved at [2013 Gematria JPEG as base64](../resources/historical/cicada2013-gematria-jpeg.b64), Git blob SHA1 65ded13617196f0fd5d210855a75452ff2e7a340. The signed original extraction is separately pinned at [historical message](../resources/historical/cicada2013-gematria-jpeg-outguess.asc), Git blob SHA1 67bed290f1494a1f82446f27a5e9b9d5732d59a7, sourced from the [archived 2013 walkthrough](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter). The OutGuess extraction matches every original signed-payload byte, including spaces and tabs; GPG verifies the clear signature against the known Cicada public key. **Authentication limit:** OpenPGP cleartext-signature canonicalization strips trailing spaces and tabs before hashing. Because all four payload lines consist entirely of whitespace, the signature does not authenticate the 552-bit pattern or decoded address. The exact bit sequence is reproduced from the original JPEG bytes by pinned OutGuess; treat it as carrier-derived, not PGP-bit-authenticated.

The signed message contains four lines encoded with literal **spaces=0**, **tabs=1**. Their bit lengths are **240, 200, 80, 32**, each an exact multiple of eight. Big-endian ASCII decoding yields the already documented text:

> Come to emiwp4muu2ktwknf.onion
>
> We shall await you there.
>
> Good luck.
>
> 3301

The source names a destination in the 2013 recruitment stage. That address led to a telnet service and further 2013 challenges; no 2014/2016 statement identifies this data as a Liber Primus keystream. Testing the source JPEG under the three passwords **3301, 761, 167** produced no other viable extraction (invalid oversized headers). Alternative keys remain untested.

Reproduction: [read-only Node22 original-input SFT](../sims/lp2_2013_gematria_jpeg_outguess_original_sft.cjs), with independently signed 2016 OutGuess positive control. The [manual workflow](../.github/workflows/agent43-2013-gematria-jpeg-outguess-manual.yml) builds pinned OutGuess and independently verifies the historical OpenPGP signature.

The earlier [LP2 JPEG direct-key negative](lp2-2013-gematria-jpeg-direct-key-original-gate.md) concerns original compressed JPEG bytes under direct GP29 and XOR consumers, and remains valid. This historical OutGuess payload supplies no demonstrated LP2 plaintext.
