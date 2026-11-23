# Signed WAY→MAP readout and unique p55 17-fragment recipient

**Classification:** conditional cross-artifact source structure. This is not a decryption, recovered key, cipher identification, or destination.

## Candidate upstream readout

The signature-verified 2016 message's ordered THE-follower register contains WAY followed by MAP. The existing Agent2 analysis fixes their GP indices as WAY = [7,24,26] and MAP = [19,24,13]. Their GP-prime sums are 219 and 211. In the original 32×8 p50 table these are row-major cells (27,3) and (26,3), containing the literal tokens 0x and 11. Reading in the message's order therefore moves one cell north and concatenates to 0x11, hexadecimal 17.

The existing source analysis and SFT establish the arithmetic and exact tokens: [Agent2's report](../workplace/lp2-signed-way-map-dual-gp-prime-0x11-original-candidate.md) and [original-input SFT](../sims/lp2_signed_way_map_dual_gp_0x11_original_sft.cjs).

There is an important competing convention. The same words' GP0 sums are 57 and 56, which address adjacent cells containing 1w and 4E. The source does not explicitly prescribe GP-prime sums rather than GP0, northward rather than westward reading, or concatenating and interpreting the tokens as hexadecimal. Several other 0x/0X tokens exist in the table. Thus 0x11 is a candidate readout, not an authenticated opcode.

## New discriminating recipient check

The proposed value 17 has a specific, independently testable recipient: the only LP2 page with exactly 17 printed rune fragments.

The canonical transcription has 57 textual sections because the numeric p50 table is runeless and omitted from the rune transcription. The physical-page mapping is sections 0–49 to p0–p49 and sections 50–56 to p51–p57; the canonical corpus independently records p50 as zero runes. The SFT validates every section's rune count against the corresponding corpus page, then counts page-local fragments using the master transcription's word, clause, paragraph, segment, and chapter delimiters (-, ., &, $, §), while preserving slash as a line break rather than a word boundary.

**Result: p55 is the unique 17-fragment page across all 58 physical pages.** The next-smallest count is p49 with 18 fragments; every other page has at least 20. Physical p55 contains 76 runes in fragments of lengths:

[1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3].

The first one-rune fragment is the incoming ᛝ continuation from p54; the remaining 16 fragments are the 16 complete words local to p55. This page-boundary interpretation is independently documented in [the original p55 source gate](p15-p55-sixteen-complete-word-source-gate.md). Finally, φ(17)=16, exactly matching the number of complete p55 words.

The new test is reproducible with [the delimiter-aware SFT](../sims/lp2_signed_way_map_17_fragment_unique_recipient_sft.cjs). It validates the 57-section/58-page mapping and every rune count against the canonical corpus before asserting that p55 alone has 17 fragments.

## What this does and does not establish

The chain WAY→MAP → p50 tokens 0x/11 → 0x11=17 → unique p55 17-fragment page is a coherent recipient hypothesis. The φ(17)=16 match gives a possible bridge to the 16 complete words used by the existing p55 circumference/totient extraction.

It does **not** prove that the author intended the GP-prime address, north-neighbor readout, hexadecimal concatenation, or p55 fragment count as a selector. Nor does it identify a reversible consumer for the 29-rune p55 candidate key. The fixed p15-to-p55 16-word shift and prime-totient receiver tests are already negative; the p55 coprime-interior candidate's OpenPuff test is also negative. This new recipient check does not reopen those receivers and does not justify searching arbitrary transforms.

**Decision:** preserve the 17-fragment uniqueness as a provisional source-structure lead. The next decisive evidence must independently select the north/hex readout and a value-changing operation or authentic key consumer. Without that, keep the branch conditional and do not multiply cipher variants.

## Reproduction inputs

- resources/liber-primus/lp2-transcription.txt
- resources/liber-primus/lp2-corpus.json
- resources/transcriptions/liber_primus_master.txt (delimiter legend)
- resources/liber-primus/base60-grid.json and Agent2's SFT for the upstream WAY/MAP readout
- Run: node sims/lp2_signed_way_map_17_fragment_unique_recipient_sft.cjs
