# Signed 2016 WAY–MAP table opcode: the complete THE-follower grammar fails

**23 November 2026, Agent8; Director #2377. Outcome:** no source-selected navigation opcode, key or unknown-page plaintext. The novel source facts about the authentic pair WAY→MAP remain exact, but cannot be extended to a single executable instruction on the rest of the very same signed-message register. The proposed p55 fragment receiver remains an unsupported coincidence rather than a decoded address.

## Fixed source-meaning test

The authenticated `resources/historical/cicada2016-4gq25-outguess.asc` contains, in textual order, precisely these six words **immediately after THE**: `PATH DEVOTED WAY MAP ROAD DIRECTION`. They provide five *preidentified* consecutive handoffs. The original LP2 pp49–51 numeral panel contains exactly 256 cells in a 32-row × 8-column physical grid. The frozen candidate grammar maps each source word to (i) the sum of zero-based GP rune indices `GP0`; (ii) the sum of the same runes' official prime weights `GPprime`; it reads the table at the corresponding indices and interprets each consecutive source pair as a **one-cell horizontal GP0 move and one-cell vertical GPprime move**.

This is a strong test of the claimed orthogonal instruction: the single discovered WAY→MAP pair moves **one west** at GP0 (indices57→56) and **one north** at GPprime (indices219→211). The GPprime tokens literally spell `0x` followed by `11`, hence ordinary hexadecimal `0x11=17`, matching p55's original 17 page-local rune fragments. Neither 2016's signed prose nor any printed LP2 page names a hexadecimal grammar or a p55 receiver. The other source-ordered pairs are therefore independent, essential controls, and they must retain the same GP addressing convention and operation.

Two globally frozen natural source spellings are evaluated: official greedy GP ligatures (PATH uses TH, DIRECTION uses IA for IO) and one printable Latin letter per source GP symbol (PATH uses T+H, DIRECTION uses I+O), both with the same V→U GP convention. WAY/MAP/ROAD and DEVOTED are identical under both spellings. No per-word alternate key, spelling or table rotation is permitted.

## Original table cells and exact predicted handoffs

Greedy GP spelling, using the canonical printed 256 token table:

| Signed THE-follower | GP0 cell index | GP0 token | GPprime index | GPprime token |
| --- | ---: | --- | ---: | --- |
| PATH | 39 | `05` | 145 | `3U` |
| DEVOTED | 102 | `0W` | **381** | **outside table** |
| WAY | 57 | `1w` | 219 | `0x` |
| MAP | 56 | `4E` | 211 | `11` |
| ROAD | 54 | `2a` | 204 | `3E` |
| DIRECTION | 112 | `1D` | **406** | **outside table** |

The first source-selected PATH→DEVOTED handoff is **GP0(+63), GPprime(+236)** and already fails adjacency and range. DEVOTED→WAY is **(−45, −162)**. The special WAY→MAP is **(−1, −8)**, the unique orthogonal neighbor pair. The crucial untouched MAP→ROAD handoff is **(−2, −7)**: its GP0 indices jump from row7 col0 to row6 col6, and its prime indices go from row26 col3 to row25 col4, a diagonal move. ROAD→DIRECTION is **(+58, +202)** and also out of range.

Greedy vs letterwise spelling changes PATH to GP0=61 and GPprime=222; DIRECTION to GP0=98 and GPprime=337. The exact conclusion remains unchanged: **one of five** consecutive pairs is a simultaneous one-cell GP0/GPprime neighbor. DEVOTED prime381 and DIRECTION prime337 both remain outside all 256 printed cells.

A globally applied `GPprime mod256` alternative, although **not** present in any signed instruction, still has just **one of five** orthogonal neighbor pairs under either source spelling. Thus the immediate obstruction cannot be repaired merely by adopting the same modulo for every word. A separate radix/direction/recipient per pair would be an unconstrained post-hoc fit.

## Reversibility and decision

No author-visible instruction types a p55 input, supplies a plaintext alphabet, or defines a reversible value update. The signed six-word path never traverses the table under the proposed uniform grammar. The valid `0x11` readout is **not a key** and cannot determine even the first of p55's 76 ciphertext rune values. A fake 76-rune inverse could always be invented by choosing unknown parameters equal to the desired plaintext; that would not be an independent cryptanalytic result.

**Decision for Director #2377:** close this **uniform orthogonal signed-word table instruction** as nonexecuting. Retain WAY→MAP's exact source arithmetic as an interesting isolated observation, with the strongest obstruction explicitly recorded: the immediately following MAP→ROAD pair fails both preselected moves while two source words have no direct table-prime addresses. A future reopener would require an **independently authenticated signed/printed selection rule** choosing why WAY→MAP alone is operative, and a complete lossless p55 original-input inverse; no current source provides either.

Reproduce: [single-file Windows Node22 CJS original-source gate](../sims/lp2_signed2016_allfollowers_uniform_dualgrid_original_sft.cjs). It reads the literal signed message, computes both GP registers directly from the shared official alphabet and prime values, verifies all six original table cells and five consecutive moves under both global orthographies, and asserts the untouched p55 count76. No ciphertext scoring or speculative key fitting.
