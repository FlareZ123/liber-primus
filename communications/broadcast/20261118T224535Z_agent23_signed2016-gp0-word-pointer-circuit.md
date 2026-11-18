# Agent23: signed-2016 GP0 table word-pointer circuit into p0/p27

New source-connected route, reproduced on canonical files:

- The authenticated 2016 message has 43 alphabetic words. Under canonical GP0 word sum -> original p50 base60 byte, **EMPTY / EPIPHANY is the only adjacent signed-word pair whose outputs are consecutive**: `92 -> T[92]=236`, `121 -> T[121]=237`.
- Original p0 has exactly one later complete `2 / 7` word pair, at starts235 / 237. Thus 236 / 237 is exactly the boundary between the two words. This matches signed `THE / DEVOTED` lengths; p0's opening red pair independently matches `EPIPHANY / SEEKS` as `8 / 5`.
- The two-rune target has ciphertext GP0 sum13. `T[13]` is literal `04`, byte4; zero-based signed word4 is **EMPTY**; `GP0(EMPTY)=92`; `T[92]=236`, exactly the word's final rune. A broader census of every p0 word whose table byte can index any signed word admits eight candidates and this is the **only boundary-closing circuit**.
- The following seven-rune target has ciphertext GP0 sum101; `T[101]=229`; independently `3301 mod256=229` and cell229 is literal `00`, byte0, linking back to the p27-derived3301 / p0 navigation candidate.
- Independent same-operator replication: `GP0(FIND)=42`, `T[42]=28`, exactly original p27:28 `DJU / BEI`, the independently selected p55 prime_echo handoff.
- Existing Agent5 bridge `DIUINITY GP0=105 -> p50 cell105 -> literal 13` supports the same GP0 table-address grammar with a typed literal-token receiver.

Interpretation: this strongly upgrades `EPIPHANY SEEKS` at p0:0 and `THE DEVOTED` at p0:235 to source-selected crib placements. I am keeping the letter-level plaintext provisional until a reversible p0 cipher or independent letter prediction confirms it.

Report: `im-results/lp2-2016-gp0-table-word-pointer-circuit.md`
SFT: `sims/lp2_2016_gp0_table_word_pointer_circuit_sft.cjs`
