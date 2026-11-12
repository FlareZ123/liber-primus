# P55's two source-selected 23-rune extractions × historical DATA/560.13: direct XOR fails

**Status (12 November 2026, Agent44):** four bounded, source-derived 23-byte direct XOR transfers are negative. This consolidates the earlier central-slice test and the newly distinct **twice-peeled complete-word** test. Neither yields plaintext, a historically valid v2 onion destination, a key, or an LP2 decipherment. The original-source mechanism remains conditional.

## The independently available human operations

The authentic solved LP2 p57 PARABLE orders a reader to shed word circumferences and find the divinity within. The original unknown physical p55 page has **16 complete words**, 75 runes plus an incoming p54 word-ending rune, and original p57 has one unique **23-dot terminal mark**. Two geometrically natural source-to-23 selections must be kept separate:

| 23-rune selector | Exact rule on p55 complete words | Original GP index sequence |
| --- | --- | --- |
| **Previously tested central23** | Remove one rune from each end of each complete word, yielding 43 symbols; take the central 23, deleting ten symbols from both ends | `[28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15]` |
| **New nested23** | Remove **two rune pairs from each complete word**, without fitting any global slice offset; the original word lengths give exactly **23** survivors | `[6,23,24,17,0,14,10,19,1,5,13,8,21,23,27,10,6,14,12,2,2,10,19]` |

The nested case belongs to the original p55 recursive `75→43→23→9→5→3→1` source pattern, giving a stronger operational reason to choose its 23 than an unmarked central slice of the 43. The unique red dot stencil only selects **the number 23**; the source does not explicitly direct which extraction to use. Neither is an authenticated ciphertext decoding.

The nine original p15 red-title runes have GP BASE29 integer **29,553,734,724**. Its exact Euclidean division `29,553,734,724 = 3301×8,952,964 + 560` nominates the historical `DATA/560.13` source and **byte offset 8,952,964**. The authentic 2013 puzzle used bytewise XOR to decode a **23-byte** old Tor v2 address. That public historical operation supplies one finite test of both new GP encodings.

## Authenticated historical control and four exact original outputs

The full source file is **118,818,811 bytes**, SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`. The file was downloaded and verified on the actual CI runner, and its **original known** offset-12821 positive precisely recovers `gbyh7znm6c7ezsmr.onion\n`.

The 23-byte pad at the p15-fixed offset is `7e663f6bef914d184e56ca13dfa01d661e6947893ef1d4`. Both input selections are encoded either as their GP29 **alphabet indices** 0..28 or as each rune's original **GP prime weight** 2..109. Exactly four 23-byte buffers result, with **no fit to the output**:

| Original p55 23-rune selector and byte encoding | XOR result hex | Printable ASCII | Exact historical `[a-z2-7]{16}.onion\n`? |
| --- | --- | ---: | --- |
| Central23, GP indices | `62663161fc9048154643de1cc8bb106e127b4d8f30f7db` | 11/23 | No |
| Central23, GP prime weights | `13641074a89240335919832686cb3671372a589811e0e1` | 11/23 | No |
| **Nested23, GP indices** | `7871277aef9f470b4f53c71bcab7066c18674b8b3cfbc7` | **11/23** | **No** |
| **Nested23, GP prime weights** | `6f3f5e56edbe525f4d5be10490f976790f466e8c3bee93` | **13/23** | **No** |

The new index-buffer ASCII begins `xq'z..G.OS...`; the new prime-weight-buffer ASCII begins `o?^V..R_M[...`. Neither begins with normal file magic or a printable onion address. The original 2013 known plaintext positive proves the implementation's XOR behavior independently. The original exact input mappings and source hashes are asserted before either new transform executes.

The [updated original-input CommonJS SFT](../sims/lp2_p55_circumference_23byte_56013_sft.cjs) now prints all four readings with the exact source-constrained address predicate. It runs in the existing **manual-only** [historical source workflow](../.github/workflows/lp2-p15-56013-quotient-offset.yml); full-input [CI run 43145647103](https://github.com/FlareZ123/liber-primus/actions/runs/43145647103) passed. The original central23 was established earlier in [run 43108404847](https://github.com/FlareZ123/liber-primus/actions/runs/43108404847).

## Cryptanalytic decision

**Retire these four source-frozen 2013 byte-XOR interpretations** of the original p55 ciphertext. Do not retry changed DATA offsets, fitted byte encodings, arbitrary reversals or extra stages absent a new original-source instruction. The new nested23 source selector remains valuable **independently of this XOR negative**, particularly its nine- and five-rune deeper layers and the original 23-dot lattice [analyzed separately](lp2-p55-nested-23dot-rowcol-inverse.md). No unknown LP2 plaintext, original cryptographic key, final destination or solved hash preimage resulted.
