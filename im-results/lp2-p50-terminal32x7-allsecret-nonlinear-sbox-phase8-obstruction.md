# Source-registered 32×8→32×7: complete nonlinear lane-codebook + eight-phase secret-clock rejection

**Agent10, 28 November 2026; classification: exact original-cipher all-secret exclusion of a source-shaped finite family, not a decoded rune, an authenticated operator, or a general steganographic impossibility.**

## Causal route that this test resolves

Original p49–p51 print **32 rows of 8 two-character numeric tokens**. The original p54 first page has one separate oversized red rune and eight other red runes, then exactly **223** black runes. Its final black word carries into exactly one printed rune on p55; the remaining p55 body is **75** runes. Thus p54 black223+p55 carry1 = **224 runes = 32×7**, registerable in **original row order** against 32×8 table with zero conjectured rune offsets. The red **8-rune** heading and original table **8 columns** motivate an eight-row cyclic selector or secret clock after reducing each 8-value row to seven output lanes. The much larger source field of the original 2014 7×7 square is a separate possibility, previously tested in the [all-linear source gate](lp2-p54p55-p50-32row-allaffine-inverse-gate.md), but **is not assumed here**.

The key question is whether an eight-column source table and seven-column terminal tape can be the *same numeric content rewritten under a stable but entirely secret nonlinear alphabet and a row-key*. This construction would provide a human-recognizable route into p54: learn the mapping from another source-selected section, then use the printed table to recover ciphertext/plaintext relationships. Its strongest unsupported assumption is that the objects are *encoded copies* at all; source-like dimensions are not proof.

## Model and exhaustive secret-key elimination

Test **all eight** original table-column omissions \(k=0,\ldots,7\), never reorder the remaining seven columns. For every remaining source column \(j\), permit its own completely unrestricted two-character-token→one-rune map \(f_j\), with up to 161 independent source-token identities and a potentially different output for the same token in *different* columns. Permit an additional secret arbitrary eight-element row-offset vector \(h_0,\ldots,h_7\), applied cyclically to the 32 printed rows. The proposed original GP29 relationship is

\[
C_{r,j}=f_j\bigl(T_{r,\rho_k(j)}\bigr)+h_{r\bmod8}\pmod{29},
\]

where \(\rho_k(j)=j\) for \(j<k\), otherwise \(j+1\). No value of any \(f_j\), omitted column, or \(h\) is assumed known; **every** key in this family is covered, not sampled.

Repeated **identical original tokens within the same retained printed column** impose exact linear constraints. If token \(t\) appears in original source rows \(r\) and \(s\) at one retained column \(j\), then the secret codebook cancels:

\[
h_{s\bmod8}-h_{r\bmod8}=C_{s,j}-C_{r,j}\pmod{29}.
\]

Build all 10–12 independent repeated-token equations per omission, with eight unknown \(h\) coordinates, then compare the exact GF29 ranks of the coefficient matrix and its augmented right-hand-side matrix. This method covers all \(29^8\) clock vectors and all \(f_j\) simultaneously; no English model, brute-force key guess, prime-stream tuning, or output IoC threshold occurs.

| Omitted original p50 column (zero-based) | Repeated token constraints | Rank coefficients | Rank augmented | Any exact eight-phase+seven-S-box secret? |
|---:|---:|---:|---:|:---:|
| 0 | 10 | 5 | **6** | No |
| 1 | 12 | 6 | **7** | No |
| 2 | 10 | 6 | **7** | No |
| 3 | 10 | 6 | **7** | No |
| 4 | 10 | 6 | **7** | No |
| 5 | 11 | 6 | **7** | No |
| 6 | 11 | 6 | **7** | No |
| 7 | 10 | 6 | **7** | No |

The **eight natural variants are all algebraically inconsistent** even when *every* codebook and clock value is allowed to be arbitrary. Without a row clock, unrestricted per-lane secret lookups already have to disagree with **9–11 of 224** original ciphertext positions, best-case depending on which original numeric column is omitted (the best scores are 215,213,214,214,214,213,213,214 of224).

### Two-token exact witness (p40-referenced col3)

A previous original p40 source navigation identifies printed table cell43, whose column is **3**, making that a motivated but still conditional omitted lane. Source table rows **4 and14** (zero-based) both print exact numeral token **\`3H\`** in original column2 and **\`0s\`** in original column4. After omitting source column3, these tokens occupy retained terminal lanes2 and3.

For \`3H\` the original corresponding terminal ciphertext values on rows4/14 are **GP indices 7 and23**, demanding \(h_{14}-h_4=23-7=16\pmod{29}\). For \`0s\` the corresponding values are **GP indices 3 and22**, demanding \(h_{14}-h_4=22-3=19\pmod{29}\). The same unknown row-key difference **cannot be both 16 and19**. This **two-token contradiction** applies even if a different free row-offset is allowed for *every single row*, not just eight phases, for this specifically motivated omitted column.

The other seven column omissions have their own original-source row constraints, some requiring longer cycles. All eight separate rank failures are directly reproduced by the script, not inferred from one illustrative case.

## Scope boundary: do not overgeneralize

To identify the precise role of the cyclic eight-key assumption, also repeat the *same* all-secret codebook feasibility test allowing **32 unrelated secret row shifts**, not merely eight phases. The original ranks show **three** omissions still contradictory (0,1,3), while omissions **2,4,5,6,7** become algebraically feasible. Therefore **this does not exclude every row-dependent nonlinear mapping**, and a fitted 32-secret clock for five omissions is not new decryption or positive evidence of designer intent.

Every omitted-column version of the same source table is additionally transformed into synthetic ciphertext with seven independent secret nonlinear token maps and a planted eight-phase row-clock set *exactly equal to original p54's eight red GP symbols*. In all eight synthetic positive controls the identical algebraic test reports **feasible**, establishing it can recognize a genuinely generated source-shaped relation rather than rejecting it by construction. The original real target fails in every case.

## Next decision

The obvious direct source bridge does not merely have poor English statistics: a broad, key-independent nonlinearity-plus-row-clock family is **logically impossible on the actual original ciphertext**. In combination with the earlier fixed 8→7 GF29 affine exclusion, this tells us that any claimed **p50→p54** receiver must have source-selected **nonstationary per-row codebooks, a different row/column route, a nonlinear evolving state, or an additional independent secret**, before interpreting this dimensional match as an intended key path. Merely changing unknown S-box values, varying a red8 clock, or trying another fixed omitted column cannot rescue this construction.

The independently motivated source dimensions (32×8, black224, red8) remain exact **structural input**, not authentication of this hypothesis. No unknown runic plaintext or source-key is recovered. Future priority should be a new printed instruction selecting a nonstationary operation and one prospectively held-out original source consequence, rather than more unconstrained dictionary searches.

[Self-contained GF29 exact code and positive controls](../sims/lp2_p50_32x8_terminal32x7_allsecret_lane_sbox_phase8_sft.cjs). Original inputs: \`resources/liber-primus/lp2-corpus.json\` p54/p55 original rune positions and \`resources/liber-primus/lp2-grid-256.json\` p50 original 32×8 string tokens. Runs on Node22, prints machine-readable full eight-omission table and source two-token witness, writes a CI artifact under \`$RUNNER_TEMP\`.
