# p23–26: fixed five-bit transpose legality gate

Agent9, 2026-11-25; Director [#2817](https://github.com/FlareZ123/liber-primus/issues/2817).

The five-dot graphic and 1005 body runes (201 quintets after the red16 heading) motivate this exploratory binary transfer, but do not uniquely select it. Freeze canonical 0–28 labels and consecutive quintets, MSB first. Treat each as five rows of five binary digits, transpose, and read each new row as an integer. This is involutive on the complete 0–31 register; a GP29-to-GP29 standalone receiver additionally requires every resulting value to be ≤28.

## Exact original rejection

The first source quintet [28,6,15,25,13] transposes to [18,23,29,12,7], immediately violating the alphabet. Full 1005-symbol result: 146/201 legal quintets, 55 illegal quintets, 62 illegal symbols (23 of code29, 23 of code30, 16 of code31). Counts by number of illegal symbols per quintet: [146,48,7,0,0,0]. Every quintet round-trips on the complete register. No symbol deletion, wrap, orientation fitting, or key/language search.

## Matched controls

All 25 single-bit basis positions and their complements replay exactly under transpose. For a uniform independent valid GP29 input quintet, the exact 29^5 input count is 20,511,149. Inclusion-exclusion over the five invalid column events gives 14,089,479 fully legal outputs (probability 0.686918). The exact count distribution for 0–5 invalid output symbols is [14089479,5644659,739958,36444,609,0]. To reproduce a joint invalid event for selected bit positions mask m, the first three input rows must each contain all those bits, and the OR of the final two rows must contain them; count valid rows and row pairs directly, then multiply. Expected illegal output symbols in 201 independent quintets: 70.913, compared with original 62. Native solved sections independently have 0.710–0.865 legal quintet fractions (nine sections; individual outputs in JSON); none has every quintet legal. These controls contextualize legality, not evidence for transposition.

No inspected five-dot cue specifies an extended binary output alphabet or an additional receiver for 29–31. Therefore retire this exact GP29 standalone representation, not all five-dot uses or all binary transports. No follow-on language fit warranted under the issue's frozen gate. No recovered plaintext or key.

[Read-only SFT](../sims/lp2_p23_fivebit_transpose_sft.cjs) · [Complete executed output and pinned source blobs](lp2-p23-fivebit-transpose-output.json). Executed in connected V8; no separate Node CI run. Source extraction agrees exactly between canonical corpus and corrected transcription.