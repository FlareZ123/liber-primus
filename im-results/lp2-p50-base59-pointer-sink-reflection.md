# p50 base59 pointer graph converges through the source-selected mirror to the independent DH19 cell

**Agent13, 28 November 2026. Classification: source-motivated structural/state selection. No unknown LP2 plaintext, payload key, complete cipher inverse, or continuation endpoint is recovered.**

## Decision

A literal interpretation of the original 32×8 p49–51 numeric panel as an address map produces a new discriminating result. Treat each cell's decoded integer as the address of the next cell,

`i_(t+1) = V(i_t)`.

This operation is motivated before language scoring by three source facts already established elsewhere: the panel has exactly 256 addressable cells; the signed 2016 text says that the words are the map, their meaning is the road, and **their numbers are the direction**; and the original p50 mirror-tree artwork independently selects horizontal reflection `c -> 7-c` on the eight-column table.

Under the two surviving positional radices, the functional graphs differ sharply:

- **base60:** two recurrent cycles. A length-11 cycle `[0,203,68,199,47,76,114,197,115,247,192]` has basin 252, and a length-2 cycle `[158,249]` has basin 4.
- **base59 with the uniquely unused low digit `f` removed:** one recurrent class, the fixed point **cell189**. **All 256 cells flow to cell189**, so this interpretation removes the otherwise unsourced start-cell choice. The maximum path depth is 38.

Cell189 is token `3C`: it is 192 in base60 but exactly `3*59+12 = 189` in base59, hence a self-pointer only in the base59 graph. The source-selected horizontal reflection maps cell189 `(row23,col5)` to **cell186 `(row23,col2)`**. Cell186 is token `0J`, value **19 under both radices**.

That endpoint was not selected from this graph. The 18 November p27 red13/DH audit independently selected **cell186 = 0J = 19**, and 19 is the established p27/p28 DH public state `B`. The later p50 address-origin audit preserved that chronology and endpoint before this pointer experiment. Thus the new route is:

`all p50 addresses --base59 value-as-next-address--> 189 --source mirror--> 186 = 0J = 19 = DH B`.

This materially strengthens base59 and p50-to-DH state navigation under one compact pointer grammar. It is not a payload decryption: Cicada never explicitly says that a table number is a *next address*, nor that the mirror must be applied to the terminal cell.

## Exact source checks

Input is the scan-verified canonical `resources/liber-primus/lp2-grid-256.json`. Its 60-character alphabet is

`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`.

Across all 256 printed tokens, lowercase `f` is the **only** alphabet symbol absent from the second/low digit position. Removing it gives the existing base59 rival. Every base59 token value lies in `0..251`, so the pointer map is total on the 256-cell address space without modulus or clipping. Base60 values are the canonical `0..255` bytes and are likewise total.

The exact graph census is deterministic and uses no plaintext or language model. Re-encoding the canonical base60 bytes reproduces every two-character token before either radix is evaluated.

## Locked-target permutation controls

The endpoint target is frozen by prior work: the source mirror maps only cell189 to independently selected cell186. The Monte Carlo therefore asks for the exact event **all 256 nodes flow to a fixed point at cell189**, while charging either surviving radix.

### Whole-table token permutation

500,000 deterministic Fisher-Yates shuffles preserve the exact 256 token multiset and apply the *same token permutation* to the base59/base60 interpretations. Seed `20261128`:

- base59 target hits: **80**;
- base60 target hits: **18**;
- either-radix target hits: **98 / 500,000 = 0.000196** (about 1 in 5,102; Wilson 95% interval approximately 0.000161–0.000239).

This is a locked-target permutation rate, not a look-elsewhere-corrected discovery probability for all p50 patterns.

### Row-conditioned permutation

A more conservative matched control holds each physical row's eight-token multiset fixed and shuffles only within rows. With 200,000 deterministic trials and seed derived from the same frozen seed:

- base59 target hits: **346**;
- base60 target hits: **0**;
- either-radix target hits: **346 / 200,000 = 0.00173** (about 1 in 578).

This demonstrates that part of the signal is carried by the authored row allocation, so the whole-table rate must not be treated as a universal chance probability. The target remains unusual even after conditioning on those row contents.

## Relationship to the existing p50 scaffold

This route does not use the conditional zero-based signed-word register. It therefore survives #3354's DIRECTION29 downgrade. It also does not need a chosen start cell, unlike earlier movement-token walks: base59 convergence makes every start equivalent at the recurrent endpoint.

The source-selected mirror is not newly inferred here. Original p50 left/right tree components have IoU 0.988541 and independently select the eight-column involution `c -> 7-c`; this experiment merely applies that already-established positional operation to the pointer sink. The sink then lands on the already-established p27/DH target cell, rather than selecting a new endpoint after seeing the graph.

The result changes the next research decision. Future p50 work should prioritize tests that can explain or consume the **base59 pointer sink → mirror → DH19** state handoff. It should not resume free radix, start-address, or table-offset sweeps. A genuine cipher successor still needs an authored rule for how DH19 changes cipher state or selects a recipient and must make an untouched original-cipher prediction.

## Reproduction

Run:

`node sims/lp2_p50_pointer_sink_reflection_sft.cjs`

The SFT reconstructs both radices from the canonical source, proves the low-digit omission, enumerates both complete functional graphs, verifies the reflection and `0J=19` endpoint, measures path depth, and executes both frozen permutation controls. The committed raw JSON preserves the default-run output.

Related prior evidence:

- `im-results/lp2-p50-tree-reflection-selector.md` — source-visible horizontal reflection selector.
- `im-results/lp2-p50-signed-register-index-origin-gate.md` — origin-invariant scaffold and signed-word-origin limits.
- `im-results/lp2-p50-scaffold-address-origin-dh19-gate.md` — independently preselected cell186/DH19 endpoint and finite address-origin audit.
