# 2013 SSSS primary artifacts and implementation reference

## Primary Cicada artifacts

The public archive `Dukotah/cicada3301`, branch `master`, commit `c3a51cc2b719b01473058933b564afab183c5e4c`, mirrors three original 2013 cleartext-PGP-signed SSSS share messages from the ibotpeaches corpus:

- [ssss-03.asc](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/ibotpeaches/messages/2013/ssss-03.asc) — share 03, Git blob `80a1375b0b689639c71b72fa3cfa172243035a03`
- [ssss-09.asc](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/ibotpeaches/messages/2013/ssss-09.asc) — share 09, Git blob `356acc7b55021d6ff01d2610e3a7a1c77bceb37e`
- [ssss-10.asc](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/ibotpeaches/messages/2013/ssss-10.asc) — share 10, Git blob `95624e32c42b2e5a1b4bad81a5c1b8c94b96099e`

Verbatim copies are retained in `resources/historical/2013-ssss-03.asc`, `2013-ssss-09.asc` and `2013-ssss-10.asc`. Each message labels the scheme `ssss, Threshold:5` and carries one two-digit index followed by 44 hexadecimal characters. The archive's associated public-key artifact is [67F363C61BA8FB6FDBA9C47D0670B0E57A35090F.asc](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/ibotpeaches/keys/67F363C61BA8FB6FDBA9C47D0670B0E57A35090F.asc); the filename supplies the key fingerprint. The message files contain PGP signature blocks. This note records the archive and key reference; it does not claim an independent GPG verification.

Only shares 03, 09 and 10 are present in this public primary-artifact set. The threshold is 5, so these three alone cannot reconstruct the secret. The highest surviving index is 10; the documented 5-of-10 interpretation is consistent with the primary share labels, but the three messages alone do not prove that no index above 10 existed.

## Preserved implementation

The preserved B. Poettering `ssss` v0.5 implementation is available at [osresearch/ssss, ssss.c, commit `e2d11c3c128c992947afbe18accb7be1ac55feed`](https://github.com/osresearch/ssss/blob/e2d11c3c128c992947afbe18accb7be1ac55feed/ssss.c), source blob `0955e250971da324412fdc8454888881df9d3411`. The source identifies itself as version 0.5 (copyright 2005–2006, B. Poettering).

- The combine path derives the field degree from the hexadecimal share width: `4 * strlen(share_hex)`. A 44-character share therefore selects degree 176.
- The degree-176 irreducible polynomial selected by the source's `irred_coeff` table is (x^{176}+x^{11}+x^3+x^2+1), so the shares are single field elements in GF(2^176), not 22 independent GF(256) elements and not GP29 values.
- The split path uses (x=i+1); the two-digit share prefix is the coordinate. Combine interpolates at (x=0).
- The signed message header fixes threshold 5. The original archive's surviving labels 03, 09 and 10 are coordinates (x=3,9,10).
- The v0.5 default enables its diffusion layer; `-D` disables it. The signed 2013 messages do not preserve the exact command line, so the 2013 invocation's diffusion flag and exact version remain uncertain.

## Relevance to LP2 p7

LP2 p7's five red-word products are GP29 scalars ([11,26,8,15,2]), not 44-hex 176-bit share values. The five dots do not provide ten historical share coordinates, and no primary source selects an encoding from GP29 into GF(2^176). A shared threshold numeral 5 is not a cryptographic bridge. See `im-results/lp2-p7-fivedot-shamir-dual-dh-source-gate.md` for the bounded rejection.
