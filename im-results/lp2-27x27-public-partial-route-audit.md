# 27×27 public partial-route claim: source reproduction and selection audit

**Decision (17 November 2026):** classify the current 27×27 / three-rune-node route as an **unverified partial-plaintext hypothesis**, not a recovered decryption. The arithmetic for its first four blocks reproduces exactly against the repository's canonical original GP29 corpus. The missing requirement is not arithmetic: the published method does not provide an independently source-selected, deterministic rule that uniquely chooses each next key node, ciphertext path, and block length before inspecting the output.

## What reproduces

The external proposal is [2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption), current HEAD at review: `5601b919ea0230780c964ef3ac1d52cb61acfdb5`. It flattens the first three source pages (262 + 266 + 201 = **729** runes) into a row-major 27×27 grid.

Using the unchanged `resources/liber-primus/lp2-corpus.json`, I independently checked the first four documented blocks:

| Block | Original node and derived/aligned key | Ciphertext cells in reading order | Exact GP29 output |
|---|---|---|---|
| 01 | `AE–J–EA` at (13,11–13); center φ(11)=10 gives `AE–I–EA`, phase 0 | (13,25) through (13,27), then (14,1–4): `L AE N TH P U X` | `A S I G O TH E` |
| 02 | `X–OE–X` at (14,4–6); φ(22)=10 gives `X–I–X`; μ(φ(k))=(+1,0,+1), left rotation 2 gives `X–X–I` | (14,14–18): `NG P EO O E` | `W EA TH E R` |
| 03 | `H–NG–C` at (4,23), (14,23), (24,23), unchanged key | (14,19), (13,19), (12,19), (11,19), (10,19): `A OE N B W` | `T U R N S` |
| 04 | `H–TH–H` at (26,19); φ(2)=1 and phase 1 give `U–H–H` | (14,7), (13,7), (12,7), (11,7): `G J EA A` | `C O L D` |

Thus the first four outputs genuinely concatenate to **“AS I GO, THE WEATHER TURNS COLD”** under the published per-block keys and coordinates. This verifies those subtractions, not the mechanism that selected the coordinates or the plaintext segmentation.

## Why the full route is not yet a decryption

The current proposal reports 38 blocks, 45 words and 115 ciphertext visits, but those visits use only **54 distinct cells** of the 729-cell matrix. The remaining 675 cells are not used as ciphertext positions in this route. Re-reading cells is not inherently invalid, but it makes a deterministic state/selection rule essential.

The published method defines the local block inverse once a node and ciphertext segment have been supplied:
- optionally transform the node centre by Euler's φ;
- calculate the three-component phase from μ(φ(k));
- repeat the aligned three-rune key and subtract modulo 29.

That inverse is reproducible. The unresolved step is selecting the next node and segment. Reports 01–15 successively predict properties such as phase/signature, reflected mode, reading boundary, axis, mirror status, ray deviation and radius parity. Those constraints still do not independently determine the exact next node centre, radius, ray distance, ciphertext start, block length or plaintext word. Report 16 adds a whole-word boundary acceptance rule. The proposal's own evidence discussion acknowledges that its candidate catalogue is not exhaustive and that several numerical relationships were investigated after the candidate sentence had been found.

The latest 3301 endpoint report reduces 21,342 candidate assignments to one using arithmetic involving π(3301), φ(464), key values and selected plaintext/source positions. These are interesting coincidences on the selected route, but no first-party instruction independently selects those combined equations. Likewise, the three-F-rune `ODE` extraction is a post-selection observation, not an independently specified decryption step. It should not be counted as a second plaintext confirmation.

An independent 15 October 2026 audit by SECRA examined an earlier 17-block version. It reproduced the documented subtractions and signature forecasts, but found that the route choices were supplied as inputs and that the forecast rules did not independently select the movements. That audit predates the current 38-block extension; it is not a direct test of the new blocks. The same core selection problem remains visible in the newer proposal's own method and caveats.

## Research decision

Do **not** promote the 27×27 route to `results/`, treat its 115 runes as established plaintext, or launch further numerical tuning around it.

Reopen it only if one of the following becomes available:

1. A complete frozen algorithm, derived from original visible clues alone, that selects every key node, exact coordinate, reading direction and block length without looking at plaintext or consulting an English word list.
2. A genuinely independent, withheld ciphertext window on which that frozen algorithm predicts a unique readable result with exact forward reencryption.
3. An independently authenticated source that selects the 27×27 layout and the φ/μ coordinate operations, rather than merely making them possible.

Until then, preserve the first-four-block arithmetic as a reproducible observation, but keep the full route classified as an unverified hypothesis. This report belongs in `im-results/`, not the authoritative established-results synthesis.
