# Original 729-rune opening square: full secret row-column mask key-recovery attack

**Agent2, 21 November 2026. Evidence class: original-source grid and historical signed heading, explicit direct-GP29 cipher inverse, independently trained language model and exact source-native planted positive. Outcome: negative for this complete additive row-column mechanism; no unknown plaintext.**

## Source-selected opportunity and falsifiable hypothesis

The first original LP2 illustrated chapter comprises physical pages p0/p1/p2 with **262+266+201=729=27²** original GP29 runes. The physically prominent p0 13-rune red heading is retrospectively decodable as **EPIPHANY SEEKS** (`EPIPHANYSEECS` in GP's C/K convention), independently present in the authenticated 2016 Cicada signed sentence. This title can supply a true **13-position known plaintext** if one adopts that prior local solution; its match was not established by the grid-mask mechanism.

The opposing cross illustrations offer a human-observable reason to investigate a **two-dimensional keyed operation** rather than 1D periodic shifts. The simplest nonperiodic 2D additive mask permits *independent arbitrary* GP29 secret offsets for **all 27 rows and all 27 columns**:

`C[27r+c] = (P[27r+c] + R[r] + K[c]) mod29`.

The gauge `R[0]=0` removes the irrelevant common shift. The 13 source red-title ciphertext values then **fix K[0..12] exactly** as `C[0..12] - title[0..12]`. This leaves **26 arbitrary row offsets and 14 arbitrary column offsets = 40 independent GP29 secret variables**, or 29⁴⁰ possible keyed maps. There is **no source instruction that the original square is protected by a separable additive mask**; this is a candidate original-cipher mechanism selected for a serious falsifiable original-body recovery attempt.

The previous 27-phase all-secret equality invariant cannot exclude this row+column mask, since the arbitrary secret row offset makes same-column equality between rows unavailable. This investigation addresses a mathematically distinct, broader nonperiodic family and actually attempts to recover every secret key.

## Complete language-guided inverse

The reproducible Windows Node22/CommonJS solver builds an original-cipher **GP29 trigram log-likelihood** from the independent Shakespeare and Gibran textual control materials, using the same 29 native tokens and canonical C/K, U/V, Q/CW and Z/S spellings. The already-known LP1 solved manuscript is completely **excluded from model training**.

For each random restart, it fixes the title-derived first 13 column offsets, optimizes the remaining **40 variables by coordinate descent** over all 29 possible values each, using incremental rescoring of the affected trigrams, and retains the best full 729-rune original-language hypothesis. All proposed plaintext arrays are explicitly re-encrypted into the *unchanged original ciphertext*. The score is computed for the entire 729 rune source under the independent, fixed language model. There is no prior English-word fitting beyond the first 13-rune historically supplied title, and no per-letter hidden key search.

**Independent positive control, perfect recovery:** Plant a 729-rune native-GP plaintext `EPIPHANYSEECS + [716 original solved-LP1 GP runes]` under arbitrary, frozen random 27-row and 27-column additive keys. Solving the planted ciphertext from only the heading and training corpus recovers **all 729/729 plaintext runes**, **27/27 row offsets**, **27/27 column offsets**, with exact encryption/decryption replay. Its native-language mean trigram log score is **−7.88995**, exactly equal before and after solving. This checks the optimizer's ability to find genuinely unknown row/column keys rather than merely producing an invertible tautology.

**Original untouched p0–p2:** The solver uses 14 random restarts, with up to 22 full variable-coordinate passes per restart. The best hypothesis re-encrypts perfectly and preserves the original red title, but scores only **−11.48224** average native-GP trigram log probability per position, against a **known-source native LP1 median −7.90519**. Among **2,559 independently solved-LP1 windows of 729 GP runes** scored by the same model, the **lowest** score is **−8.07946**, still vastly above the model-fitted original `−11.48224`. Because this is the **best optimized ciphertext output**, the comparison favors the proposed mechanism; failure is not due to choosing a random mask.

The first 180 original-body output GP-normalized letters from the best fitted secret offsets are:

`MXAESESJTHMWRPGCTNOJUSUAXTEARWDUGNGATHMEAUECITHDEITHFDJNEWYHCSITHOADWEAMIAOEMRUEYNGAEFNOFAEHMACEAREAESETYOYUYOUMEEAOYTYNRTHALMCOTIOSHEATHENLACALERMSIADAPNROEDNGENLFDEXUSOPSTLUWFOSIDMXYTIIAEOOEAEONGERISDNGEYTS`

This is nonprose and **not** recovered authentic LP2 plaintext.

## Rank-one bilinear mask rival: independent full-key recovery

A second algebraically distinct source-motivated 2D key is the **outer product** `R[row] × K[column]` over GF(29), motivated by the original prime-field arithmetic and crossed 27×27 page geometry. Its encryption is

`C[27r+c] = P[27r+c] + R[r] × K[c] mod29`.

Fix the multiplicative scale gauge `R[0]=1`. The historical red title again fixes `K[0..12]` via the 13 source ciphertext-minus-plaintext differences. This leaves **40 independent row/column field elements**, identical in count to the additive model, although the nonlinear interaction creates a fundamentally different set of possible masks. The original artifact still does not explicitly authorize this multiplication, and all inferred keys remain hypothetical.

An **independent Windows CJS test** implements this cipher, an exact decryptor/encryptor, and a 14-restart variable-coordinate descent search over the full 729 GP29 original runes under the identical external-source trigram language model. During each trial it changes one secret row/column element, computes the full row- or column-sensitive plaintext updates and rescored trigrams, then retains the highest-scoring result. Its controls decrypt **729/729 planted original-style GP29 runes**, recovering **27/27 unknown row keys and 27/27 column keys** from the same 13-rune title crib. This proves the optimiser can actually recover unknown full-page outer-product keys under an independently written source-native plaintext plant.

The untouched original p0–p2 best decrypts to **−11.51615 mean native trigram log likelihood**. The trained-source-independent solved-LP1 control windows have minimum **−8.07946** (2,559 windows), while the exact planted plaintext scores **−7.88995**. Original body remains nonprose despite fitting all forty secret parameters:

`DOESDMWERHEINAUDDSEAMFWIAEEAIBAISARULDUEONJFEOFDTHERAEADSYTYRXXSBDMEISRHXEELPREAAEOEGLFNIACONOBEWGELLTHEAPANCHEATDONLTHIAFILREATHOUHMIOEDRDOUOSIAAETUNWEAEUNORRXJGSEBYMBEABSJLUNMTHEJEOWSATHLYAEEJOURIDSLLRE`

This is a bounded independent negative for an original-body rank-one product field mask. It is not evidence that a fully general source-authored 2D matrix transform is impossible. No independent clue selects the multiplication itself, the key, or a successor stage.

**Separate reproducible original-bilinear solver:** [sims/lp2_p0_27square_rankone_mask_recovery_sft.cjs](../sims/lp2_p0_27square_rankone_mask_recovery_sft.cjs) · [Windows CI PASS 44949050946](https://github.com/FlareZ123/liber-primus/actions/runs/44949050946).

## Scientific decision

Both directly source-motivated secret matrix masks `R[row]+K[column]` and `R[row]×K[column]` over GF29 are computationally recoverable from known original-style plaintext under the source-fixed 13-rune heading, and the solver is exact on the planted full-cipher 729-rune case. The original 729-rune body remains overwhelmingly unlike the independently held-out known-GP source under the best recovered **40-parameter** secret. These are strong bounded negatives for both the arbitrary separable additive and arbitrary rank-one multiplicative GP29 grid-mask families with direct natural-language plaintext.

The experiment does not exclude a fully general **729-symbol** pad, a nonseparable or nonlinear matrix transform, varying keyed alphabets, dynamic state/ciphertext feedback, further transposition, a compressed/intermediate encrypted layer, or a different plaintext register. It offers no first-party authorship proof for the row-column model and makes no claim to have recovered unknown p0–p2 plaintext or a creator-selected cryptographic operation. Do **not** rescue the branch by introducing untethered per-cell secrets; those can fit arbitrary text and have no source-selected key.

**Reproducer:** [single Windows11-compatible CJS test](../sims/lp2_p0_27square_rowcolumn_mask_recovery_sft.cjs) · [Executed full original-and-planted search, PASS 44948837894](https://github.com/FlareZ123/liber-primus/actions/runs/44948837894). The code asserts exact original page length, native title, planted full-map recovery, exact input reconstruction, and heldout native-language comparison.
