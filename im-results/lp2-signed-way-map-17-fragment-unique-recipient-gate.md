# Additional signed WAY→MAP 0x11 corroboration of p55's 17-fragment target

**Classification:** conditional cross-artifact source structure. This is an additional candidate selector for an already-known p55 property, not a new page discovery, decryption, recovered key, cipher identification, or destination.

## Candidate upstream readout

The signature-verified 2016 message's ordered THE-follower register contains WAY followed by MAP. The existing Agent2 analysis fixes their GP indices as WAY = [7,24,26] and MAP = [19,24,13]. Their GP-prime sums are 219 and 211. In the original 32×8 p50 table these are row-major cells (27,3) and (26,3), containing the literal tokens 0x and 11. Reading in the message's order therefore moves one cell north and concatenates to 0x11, hexadecimal 17.

The existing source analysis and SFT establish the arithmetic and exact tokens: [Agent2's report](../workplace/lp2-signed-way-map-dual-gp-prime-0x11-original-candidate.md) and [original-input SFT](../sims/lp2_signed_way_map_dual_gp_0x11_original_sft.cjs).

This is distinct from the rejected mixed-rank, nonlocal 0x4E join and contiguous east-neighbor parser in [#2275's source gate](lp2-way-0x-typed-hex-original-source-gate.md): here both WAY and MAP use the same GP-prime sum convention, and MAP selects the north neighbor. The old east-only test does not adjudicate this orientation. The earlier source gate also found WAY to be the only one of the 43 signed-message word occurrences whose GP0 or GP-prime sum addresses any of the three literal lowercase 0x cells. However, several case-insensitive 0x/0X prefixes have valid north neighbors, so the table alone still does not authenticate this operator.

There is an important competing convention. The same words' GP0 sums are 57 and 56, which address adjacent cells containing 1w and 4E. The source does not explicitly prescribe GP-prime sums rather than GP0, northward rather than westward reading, or concatenating and interpreting the tokens as hexadecimal. Several other 0x/0X tokens exist in the table. Thus 0x11 is a candidate readout, not an authenticated opcode.

## Unique-page control for the already-known 17-fragment target

The 17-fragment p55 property is not new. Two prior, materially different source hypotheses already selected it:

- The p50 low-degree degree-16 factor yields 17 coefficients, which were assigned to the p54→p55 carry plus 16 complete p55 words. The exact frozen additive inverse was nonlinguistic and was retired: [p50 factor16 → p55 17-word gate](lp2-p50-factor16-p55-17word-complete-gate.md).
- The p33→p39 red-heading pointer graph yields 17 nodes and a terminal value matching p55's 76-rune length. The fixed p56 prime-totient wordwise inverse was nonlinguistic and was retired: [pointer17 → p55 totient inverse gate](lp2-p33-p39-pointer17-p55-solved-totient-inverse-gate.md).

The new WAY→MAP readout is therefore a **third conditional source path** to the same already-known 17-fragment target. Its incremental value is the all-page uniqueness control below, not discovery of the p55 segmentation.

The canonical transcription has 57 textual sections because the numeric p50 table is runeless and omitted from the rune transcription. The physical-page mapping is sections 0–49 to p0–p49 and sections 50–56 to p51–p57; the canonical corpus independently records p50 as zero runes. The SFT validates every section's rune count against the corresponding corpus page, then counts page-local fragments using the master transcription's word, clause, paragraph, segment, and chapter delimiters (-, ., &, $, §), while preserving slash as a line break rather than a word boundary.

**Result: p55 is the unique 17-fragment page across all 58 physical pages.** The next-smallest count is p49 with 18 fragments; every other page has at least 20. Physical p55 contains 76 runes in fragments of lengths:

[1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3].

The first one-rune fragment is the incoming ᛝ continuation from p54; the remaining 16 fragments are the 16 complete words local to p55. This page-boundary interpretation is independently documented in [the original p55 source gate](p15-p55-sixteen-complete-word-source-gate.md). Finally, φ(17)=16, exactly matching the number of complete p55 words.

The test is reproducible with [the delimiter-aware SFT](../sims/lp2_signed_way_map_17_fragment_unique_recipient_sft.cjs). It validates the 57-section/58-page mapping and every rune count against the canonical corpus before asserting that p55 alone has 17 fragments.

## What this does and does not establish

The chain WAY→MAP → p50 tokens 0x/11 → 0x11=17 → the unique p55 17-fragment page is a third candidate source path to an established structural target. The φ(17)=16 match gives a possible bridge to the 16 complete words used by the existing p55 circumference/totient extraction.

It does **not** prove that the author intended the GP-prime address, north-neighbor readout, hexadecimal concatenation, or p55 fragment count as a selector. It does not revive the retired mixed-rank 0x4E join or the east-neighbor parser; it is a separate north-neighbor hypothesis. Nor does it identify a reversible consumer for the 29-rune p55 candidate key. The earlier p50 factor16 wordwise additive inverse, p33 pointer17 prime-totient inverse, p15-to-p55 16-word transfers, direct DIVINITY receiver, and p55 coprime-interior OpenPuff test are all already negative. This additional pointer does not reopen those receivers and does not justify searching arbitrary transforms.

**Decision:** preserve the WAY→MAP 0x11 result as a third provisional selector hypothesis and the all-page census as a reproducible uniqueness control. The next decisive evidence must independently select the north/hex readout and a value-changing operation or authentic key consumer. Without that, keep the branch conditional and do not multiply cipher variants.

## Reproduction inputs

- resources/liber-primus/lp2-transcription.txt
- resources/liber-primus/lp2-corpus.json
- resources/transcriptions/liber_primus_master.txt (delimiter legend)
- resources/liber-primus/base60-grid.json and Agent2's SFT for the upstream WAY/MAP readout
- Run: node sims/lp2_signed_way_map_17_fragment_unique_recipient_sft.cjs
