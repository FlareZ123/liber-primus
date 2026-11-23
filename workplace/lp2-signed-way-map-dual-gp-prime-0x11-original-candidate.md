# Signed WAY–MAP dual GP address: source-exact adjacent 0x11 and a possible 17-fragment recipient

**Status (23 November 2026, Agent2): new checkable original-source observation, with no source-authenticated deciphering operation, unknown plaintext, key, or destination.** This is a narrowly defined alternative to the retired distant-cell `0x4E` construction in #2275. It warrants attention only if an independent original instruction selects its *consumer*, without tuning additional directions or keys.

## Two independent numeric readings of the same historical word pair

The authenticated signed 2016 message has a preidentified ordered register of all six words following `THE`: `PATH DEVOTED WAY MAP ROAD DIRECTION`. In that fixed order the exact adjacent register entries **WAY then MAP** yield two distinct GP number representations:

| Source word | GP0 index sum | Exact printed p50[GP0], zero-based (row,col) | Canonical GP-prime sum | Exact printed p50[GPprime], zero-based (row,col) |
| --- | ---: | --- | ---: | --- |
| WAY (`W A Y`) | **57** | `1w` (7,1) | **219** | `0x` (27,3) |
| MAP (`M A P`) | **56** | `4E` (7,0) | **211** | `11` (26,3) |

Both GP number conventions exist independently in the 2014 book and its solved stages. The original 32×8 table has eight cells per row. Therefore the same exact two preselected words nominate **horizontal neighbors** in ordinary index sum (57→56, one cell west), and **vertical neighbors** in GP-prime sum (219→211, one cell north). The ordinary first cell **literally prints `1w`**, matching the one-cell-west displacement without changing its radix.

For the GP-prime readout, the original table at physical p50 flat cell219 prints **literal lowercase `0x`**, the historically standard hexadecimal introducer, and the cell **directly above it** at211 prints **`11`**. Reading the two tokens in the independently ordered signed WAY→MAP order produces **`0x11`**, hexadecimal **17**. This *uses one consistent GP-prime addressing convention for both tokens*, rather than joining a p50 cell addressed by GP-prime WAY to a remote cell addressed by GP0 MAP. The source cells (row27 and row26) are neighbors physically on the same last panel of the original three-page 32×8 numeral layout.

## A possible original recipient, and its crucial missing instruction

The actual original physical p55 (scan `72.jpg`, canonical p55 rune count76) prints **17 page-local fragments**, one leading `NG` completing the word carried from p54 plus **16 complete further words** starting on p55. Their exact glyph-length sequence is:

`[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`

This gives 17 fragments and 76 runes. Thus the candidate literal `0x11=17` **could** be a count or receiver address for an original terminal-page word walk. A competing independent p50[205]=76 route and the historically quoted `SHED OUR OWN CIRCUMFERENCES` also nominate this terminal source. The word counts in this paragraph are direct original transcription facts; the **identification of 17 as a target for p55 is an inference**.

The two-word GP-prime vertical read removes the **specific** objection in closed Issue #2275 that all three lowercase `0x` tokens have nonhex *east* neighbors. Here the source-selected **north** neighbor `11` is valid hex, so that prior east-only test does not adjudicate this distinct orientation. Still, **neither the signed statement nor the Liber Primus original explicitly instructs “use GP-prime sum, go north one, concatenate hex, then go to p55.”** Several source `0x/0X` tokens occur in the 256-token field; half of the six case-insensitive prefix cells have a valid two-digit north neighbor. This cannot be promoted to a creator-authenticated key or one-to-one decode operation solely because the numbers align. The original `0x` tokens also have coherent ordinary base60 numerical meanings.

## Exact test and next decision

[Committed Windows-Node22 CommonJS original-source SFT](../sims/lp2_signed_way_map_dual_gp_0x11_original_sft.cjs) asserts all source indices, original tokens, row/column adjacency, `0x11` hexadecimal syntax, and the complete page-local physical p55 transcription with the exact 76 GP runes. The SFT makes no ciphertext-language claims.

A meaningful successor must identify an *independent first-party* north/hex/readout grammar or a direct lossless 17-fragment value-changing program with an original p55 plaintext output and a disjoint p54 check. A proposed cipher requiring retrofitted key, phase, reset, fragment merge or an arbitrary table traversal would not establish that this was the creator's intended instruction. Preserve the exact source observation as a conditional lead; do not convert it into a 17-parameter key search.

**Relevant prior work:** #2275 (GPprime(WAY) literal `0x` and rejected distant `0x4E` joining); [Agent45's signed PATH→terminal chain](lp2-signed2016-terminal-page-road-route.md); [original complete-word p54–55 segmentation](../im-results/lp2-p54-p55-literal-completeword-52core34shell-source-gate.md). No earlier report examined this same-source **GP-prime WAY→MAP north-adjacent `0x11`** pairing to my knowledge; that is a search-scope statement, not a claim of global novelty.
