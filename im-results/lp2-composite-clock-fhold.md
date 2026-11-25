# Issue #2663 — exact complementary composite clock decision

**Decision:** both signs of the fixed consecutive-composite-minus-one clock, with literal plaintext-F holds and origin zero at each chapter opening, are incompatible with every original LP2 unsolved chapter. There is no legal full plaintext, regardless of language or segmentation. The historical solved p56 prime clock motivates the comparison; no independent authored cue selects the complement. This is a narrow exclusion, not evidence against all composite-dependent keys.

## Exact mechanism and test

For j starting at zero, let b_j be the consecutive composite integers 4,6,8,9,10,12,14,15,16,18,20,21,... . For sign s in {+1,-1}, a nonzero GP29 plaintext rune P consumes j and emits C=(P+s(b_j-1)) mod29; plaintext zero emits zero without advancing. For every reachable j on each ciphertext symbol x, branch to j if x=0 (literal F), and to j+1 if (x-s(b_j-1)) mod29 is nonzero (consuming). This is complete by induction: those are exactly the forward alternatives, and future feasibility depends only on j. BigInt counts retain multiplicities. There is no beam, clock-offset search, word constraint or language assumption.

Input: canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; physical ranges below total 12,956 runes; runeless p50 included as empty. Native rune reference blob 1b064ef6d85819b7d96adaff31a82d1ec551598f. Issue #2653 tested decimated primes, not composites. Searches of current sims/im-results tree names and issue titles for composite/nonprime/complement clocks identified no exact previous test; not an exhaustive code audit.

| Pages | Length | Legal prefix + | Legal prefix - | First impossible x / j (+) | First impossible x / j (-) |
|---|---:|---:|---:|---|---|
| 0–2 |729|16|34|25 /15|9 /33|
| 3–7 |1145|3|12|8 /3|8 /12|
| 8–14 |1729|20|24|3 /20|21 /24|
| 15–22 |1903|198|60|17 /195|4 /59|
| 23–27 |1255|2|1|7 /2|24 /1|
| 28–32 |1199|1|104|5 /1|11 /101|
| 33–39 |1680|64|37|28 /62|4 /37|
| 40–53 |3008|110|52|26 /107|14 /51|
| 54–55 |308|12|89|21 /12|26 /88|

Each first impossible rune is nonzero and equals the shift at the only remaining consumed-index state. It could neither be a literal F nor be emitted by a consuming nonzero plaintext. Maximum legal prefix 198, peak frontier 3 across originals. No original survives; language scoring unnecessary.

## Controls and ambiguity

Authentic p56 under consecutive primes, positive sign, reproduces all 85 original runes from pinned native plaintext. Exact inverse retains 22 legal paths across five terminal states, including the authentic one. Feasibility alone does not identify plaintext.

Four constructed plants encrypt distinct solved native GP29 sections with the composite clock. Exact support retains all four and eliminates the opposite sign in all four. A target-excluded interpolated rune trigram (add-one unigram, bigram/trigram prior mass five) Viterbi decoder over consumed index and last two plaintext symbols gives:

| Plant | Sign | Runes | Complete legal paths | Plaintext matches | Exact replay |
|---|---|---:|---:|---:|---|
| KOAN 1 |+|780|690633191|778|yes|
| LOSS OF DIVINITY |-|755|20628|755|yes|
| WELCOME |+|515|1872720|515|yes|
| PARABLE |-|95|30|95|yes|

Constructed controls are whole-text decoding, not held-out forecasts; 2143/2145 native runes recovered. Exact replay is a consistency invariant, not proof of the true hold history. No original plaintext, key or selector recovered.

## Reproduce

Run `node sims/lp2_composite_clock_fhold_sft.cjs` from repository root. The equivalent JavaScript experiment ran successfully in the connected tool runtime; no CI execution is claimed. The script outputs all rows, path counts, failure states, and native controls. Retire these two fixed clocks; do not add offsets or alternative sequences without a new source selector.
