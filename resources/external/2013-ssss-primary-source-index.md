# 2013 SSSS primary artifacts and implementation reference

## Primary Cicada artifacts

The public archive `Dukotah/cicada3301`, branch `master`, commit `c3a51cc2b719b01473058933b564afab183c5e4c`, mirrors three original 2013 cleartext-PGP-signed SSSS share messages from the ibotpeaches corpus:

- [ssss-03.asc](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/ibotpeaches/messages/2013/ssss-03.asc) — share 03, Git blob `80a1375b0b689639c71b72fa3cfa172243035a03`
- [ssss-09.asc](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/ibotpeaches/messages/2013/ssss-09.asc) — share 09, Git blob `356acc7b55021d6ff01d2610e3a7a1c77bceb37e`
- [ssss-10.asc](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/ibotpeaches/messages/2013/ssss-10.asc) — share 10, Git blob `95624e32c42b2e5a1b4bad81a5c1b8c94b96099e`

Verbatim copies are retained in `resources/historical/2013-ssss-03.asc`, `2013-ssss-09.asc` and `2013-ssss-10.asc`. Each message labels the scheme `ssss, Threshold:5` and carries one two-digit index followed by 44 hexadecimal characters. The archive's associated public-key artifact is [67F363C61BA8FB6FDBA9C47D0670B0E57A35090F.asc](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/ibotpeaches/keys/67F363C61BA8FB6FDBA9C47D0670B0E57A35090F.asc); the filename supplies the key fingerprint. The message files contain PGP signature blocks. This note records the archive and key reference; it does not claim an independent GPG verification.

Only shares 03, 09 and 10 are present in this primary-artifact set. These three alone cannot reconstruct the secret; secondary transcriptions supply four further numerical shares and allow a complete reconstruction. The highest surviving index is 10; the documented 5-of-10 interpretation is consistent with the primary share labels, but the three messages alone do not prove that no index above 10 existed.

## Preserved implementation

The preserved B. Poettering `ssss` v0.5 implementation is available at [osresearch/ssss, ssss.c, commit `e2d11c3c128c992947afbe18accb7be1ac55feed`](https://github.com/osresearch/ssss/blob/e2d11c3c128c992947afbe18accb7be1ac55feed/ssss.c), source blob `0955e250971da324412fdc8454888881df9d3411`. The source identifies itself as version 0.5 (copyright 2005–2006, B. Poettering).

- The combine path derives the field degree from the hexadecimal share width: `4 * strlen(share_hex)`. A 44-character share therefore selects degree 176.
- The degree-176 irreducible polynomial selected by the source's `irred_coeff` table is (x^{176}+x^{11}+x^3+x^2+1), so the shares are single field elements in GF(2^176), not 22 independent GF(256) elements and not GP29 values.
- The split path uses (x=i+1); the two-digit share prefix is the coordinate. The native sender evaluates a monic degree-threshold polynomial; combine XORs off x^5 before interpolating the degree-at-most-four polynomial at x=0. The x^5 term is essential for held-out predictions.
- The signed message header fixes threshold 5. The original archive's surviving labels 03, 09 and 10 are coordinates (x=3,9,10).
- The v0.5 default enables its diffusion layer; `-D` disables it. The signed 2013 messages do not preserve the exact command line/version, but the source-compatible default diffusion reproduces the independently recorded historical destination exactly; disabling diffusion leaves the nontext constant.

## Relevance to LP2 p7

LP2 p7's five red-word products are GP29 scalars ([11,26,8,15,2]), not 44-hex 176-bit share values. The five dots do not provide ten historical share coordinates, and no primary source selects an encoding from GP29 into GF(2^176). A shared threshold numeral 5 is not a cryptographic bridge. See `im-results/lp2-p7-fivedot-shamir-dual-dh-source-gate.md` for the bounded rejection.

## Public numerical shares and exact historical reconstruction (27 November 2026)

[Connor Tumbleson, 25 January 2021, Puzzle 2 Solve](https://connortumbleson.com/2021/01/25/the-cicada-3301-mystery-puzzle-2/) records the five-share combine transcript (02,03,05,07,09) and the destination. [scream314/2013.md](https://github.com/scream314/cicada3301/blob/master/2013.md) and [the contemporary wiki overview](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282013%29) report the location-linked values, including 08. [Tumbleson's slides](https://connortumbleson.com/slides/2021-02-11-NeonTempleCicada3301.pdf) also list 08 and 10. These secondary witnesses may share common upstream sources; the additional numerical values have not been independently signature-verified.

| Index | 44-hex value | Evidence class |
|---:|---|---|
| 02 | `41cc481a51fe77f91600f593c1db2ce9babd2626ea6e` | secondary transcription |
| 03 | `7678a5f6b72042d839151b34b02ffe161cf997fed484` | preserved signed message |
| 05 | `fcd82965b6632ea25d80edc3e58baafb4b2938895cbd` | secondary transcription |
| 07 | `f3adb3aacb0b4336fa28178bc1e5edce940c16ce5caa` | secondary transcription |
| 08 | `b970e507dbc4ac115a273126f62671654c480fce32e5` | secondary transcription |
| 09 | `82a98a7fe06014f783b752506cf6cd1fabaa3d8b3750` | preserved signed message |
| 10 | `1668a611ba9fccddee2a0d8fd7e05df4d01c6d42a26d` | preserved signed message |

[Executable historical control](../../sims/cicada_2013_ssss_recovery_sft.cjs): 21/21 distinct five-share subsets recover the same GF(2^176) constant `65b9c4065cc47a4a48e01d17de166a94252dfbb44e69`; 42/42 withheld-share predictions reproduce the archival values exactly. Undo the native rotating 64-bit diffusion over the 22-byte field element to obtain the documented destination `p7amjopgric7dfdi.onion`. The undiffused interpretation is not printable text. A separate Python implementation run locally agreed.

The following are **mathematically interpolated predictions, not recovered primary artifacts**: `01-c59f624527a7bd26326fb88ee142d5f1c37d733cd4d7`, `04-2d9336c7808cc461da52f2df7d1e78c32d0127e20684`, `06-b574e7a760595bb8286043a917d0526cb23030f5a2c7`. If any original signed copies surface, these predictions give a fixed comparison. The seven-value set cannot supply independent signature provenance for the four transcriptions, but the exact held-out consistency and known plaintext are strong computational confirmation. No LP2 key binding follows from this control.


## Contemporaneous IRC capture search — 27 November 2026 (#3256)

The [pinned January 2013 participant IRC archive](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/irc-logs/%2333012013.freenode.log) (13,345,841 bytes, Git blob `f81e20129fb6dff69e0f614746089b8c6cbc8130`, 190,209 lines) contains all seven known numeric shares. [Targeted search](../../sims/2013_ssss_signed_wrapper_irc_search.py), [initial Windows run](https://github.com/FlareZ123/liber-primus/actions/runs/46076660561), [unfiltered context run](https://github.com/FlareZ123/liber-primus/actions/runs/46076776895), both successful. Exact numeric-string occurrence counts for 02/03/05/07/08/09/10 are 1/6/2/3/1/4/5 respectively. The full context windows were examined; unlike the share-10 control, none of the four missing shares has a pasted signature packet in its local window.

| Share | Historical capture location | IRC witness (1-based archive lines) | Wrapper disposition |
|---|---|---|---|
| 02 Dallas | `y2wyuvrqraowagc5.onion` | 34200–34208, Jan 18 20:23–25: discovery, decimal offset 33461, exact share, immediately reported good Cicada signature | Numeric and contemporary verification report; no armor or full signed text |
| 05 Moscow | `qw7mhchzvuq6f2mf.onion` | 39183–39198, Jan 21 15:42–50: threshold 5, two exact share transcriptions, same-message/destination discussion, location wiki link | Partial body; no armor or independent verification report |
| 07 Little Rock | `4l6uipnstbggwjyv.onion` | 39426–39446, Jan 21 16:48–50: SHA1, threshold 5, exact value, Good luck, reported good RSA signature key 7A35090F; repeated 41531, 41547–41551 | Contemporary verification report and partial body, no signature bytes or complete framing |
| 08 Annapolis | `erwfcsdvx6pm2rsk.onion` | 35116, Jan 19 02:23: exact value; nearby 35112–35119 signature discussion concerns the just-reached test onion and cannot securely be attributed to share 08 | Numeric only; no armor or share-specific verification report |

Capture locations are independently listed in [iBotPeaches' SSSS extraction table](https://github.com/iBotPeaches/cicada_3301/blob/master/other/2013_SSSS_Extractions.md). Exact missing paths `messages/2013/ssss-{02,05,07,08}.asc` have no commits in the iBotPeaches repository path history. The Complete Cicada3301 Archive and its mirrored archive trees do not supply additional share-specific signed files; the Dukotah and iBotPeaches primary collections preserve 03/09/10 only. The location wiki pages have secondary values/partial cleartext; coordinate-message signatures are not signatures of the share text.

Positive source-control: share 10 is pasted as a complete signed-message block at 33207–33229, with the visible signature armor and author line, independently corroborating the already-preserved wrapper. IRC omits blank lines, so this is a transport transcription, not a new byte-exact original. The other four local contexts contain no armor payload to reconstruct; the 02 and 07 verification reports are contemporary participant testimony, not present-day cryptographic verification.

**Decision:** stronger historical witnesses for all four values, but zero newly recovered first-party wrappers and zero newly typed LP2 operands. Do not interpolate again or infer a new operation from identical boilerplate. Retire this acquisition branch until a new original capture of the specific four host responses or a complete preserved signature packet appears. No claim of unknown LP2 plaintext or key.
