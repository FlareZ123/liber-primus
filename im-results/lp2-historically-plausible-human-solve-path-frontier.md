# Historically plausible human solve path frontier

**Agent18, Director #1628, 18 November 2026. Research-design synthesis.** The surviving Cicada record supports a simple standard for LP2 work: a player should be able to see or obtain the clue, identify a small typed operation, receive its parameters from the source, and recognize the result without plaintext scoring. Current LP2 research has one route that now approaches that standard structurally, the p55→p27 red13/DH circuit, while every live route still lacks a source-selected reversible receiver for unknown ciphertext.

## Evidence hierarchy used here

First-party signed messages, original program bytes, original image pixels, and solved-page exact inverses are treated as direct evidence. Contemporaneous participant records establish what solvers actually tried or observed, while later reconstructions remain secondary. Modern statistical discoveries can identify promising source objects, then the intended-path question must be answered again from the artifacts a 2014 player had.

## What successful historical Cicada steps look like

| Historical object | Player-visible clue | Motivated operation and supplied input | Confirmation available to the player | Relevance to LP2 |
|---|---|---|---|---|
| 2012 signed book-code stages | signed coordinates plus the named textual context | apply explicit line/character coordinates to the selected text | exact readable continuation or network destination | author-supplied receiver and coordinate convention mattered more than numerical fit |
| 2013 CicadaOS `prime_echo` | executable program visibly prints primes; 1033 and3301 pause for 2 s instead of 0.05 s | observe the ordered timing emphasis while the same stream continues | after terminal3301 the parent script clears the screen and displays the signed message | special numbers are genuine segmentation markers; the source supplies no reset cipher at1033 ([exact pause semantics](lp2-primeecho-player-visible-pause-semantics.md)) |
| signed 2013 TCP `BASE29` | protocol documentation names the command and numeral alphabet | send an integer; server returns its textual base29 representation | deterministic textual result, for example the documented `3301 -> 3QO` behavior | typed conversion is explicit; it does not define an LP2 rune/byte serializer ([signed source](../resources/external/2013-tcp-server-signed-source.md)) |
| signed 2013 TCP `DH` | protocol explicitly names `DH [p]` and supplies a worked example | server chooses base/secret/public share, client sends its share, server returns the shared integer | worked example `(23,5,8,19,2)` plus live-session values | the signed object is authentic, while the exact full toy tuple already appears in a 17-Apr-2012 teaching deck; the numbers identify generic DH semantics rather than Cicada-specific provenance; a later p28 center-line object now supplies the LP2-native DH23 handoff ([historical gate](cicada2013-dh23-worked-example-player-visible-gate.md); [p28 route](lp2-p57-find28-p28-centerword-dh87-loop.md); [#1625](https://github.com/FlareZ123/liber-primus/issues/1625)) |
| 2014 LP1 p05 word-to-number stage | published Gematria Primus prime weights and the printed rune words | sum each printed word's prime weights | all 25 values populate the supplied numerical square used by the stage | a real precedent for word→prime-sum conversion when the receiver is visibly present ([source gate](lp1-p05-word-number-direction-source-gate.md)) |
| 2014 Fifth Onion GEB book code | source supplies title abbreviations and dialogue-exchange:word:letter records | use the named external book and explicit coordinate grammar | exact next onion | external resources work when the puzzle names both codebook and coordinate grammar ([historical control](lp2-p55-2014-geb-43interior-direct-number-gate.md)) |
| 2014 Stage11 handoff | signed message gives the seventh onion; that onion distributes `0.jpg`–`57.jpg` | verify, fetch, then read the supplied image sequence | the complete LP image corpus | page order is source-authenticated even though most LP2 content remains encrypted ([authoritative synthesis](../results/README.md)) |
| solved LP2 p56 | original ciphertext plus a recovered prime/totient transparent-F rule | reversible source-derived prime/totient transform with the exact F exception | full known plaintext and exact reencryption | strongest cipher control: a real LP2 mechanism has a precise inverse and reconstructs source bytes/runes ([physical-line gate uses the solved control](lp2-p56-phi-physical-line-reset-gate.md)) |
| clear LP2 p57 | readable rune plaintext | follow literal semantic instructions such as `FIND THE DIVINITY WITHIN` | ordinary language is already visible | semantic words may select objects, while arithmetic matches alone remain intermediate until an operation is specified ([p27 operation gate](lp2-p27-find-divinity-operation-gate.md)) |
| signed 2016 message | authenticated words concerning words, numbers, map, road, direction and emptiness | candidate interpretations must still choose an LP object and typed operation | no LP2 decoder is stated in the message | useful semantic constraints; existing p50/path tests remain underselected ([2016 grammar gate](lp2-signed2016-manuscript-grammar-source-gate.md)) |

The repeated pattern is operational. Successful stages type the data, identify the receiver, and make success recognizable. Historical participant habits can show plausibility, while authorship requires source support.

## Current LP2 candidates through that lens

### 1. p50 low60 / bit0 surface state

**Visible prompt.** The numerical table is unquestionably original, and the leading-zero/low-value class is stable under the two frozen numeral maps. The conventional-base60 even-low bit0 state shows a strong unknown-LP2 repeat association and passes clear-GP specificity controls.

**Human step available in 2014.** A contemporary solver did interpret the table as conventional base60 bytes, so byte parsing was historically available. The original images and signed messages do not label bit0, choose its clock, or name the ciphertext receiver.

**Weakest assumption.** A modern statistical feature is being promoted into an operator without a source instruction. #1623 closes that receiver claim; the new red13 circuit also gives base59 a different, source-internal role.

**Decision.** Preserve low60/bit0 as a diagnostic. A human solve path is incomplete until an original clue binds radix, state clock, receiver, and reversible transition.

### 2. p55 framing and the p55→p27 handoff

**Visible prompt.** The authenticated 2013 `prime_echo` program makes 1033 and3301 deliberate timing markers. Exhaustive finite-list consumption on original p55 has a unique stronger boundary result: the histories that consume both marked primes stop at boundary300, and the first two intact complete words after that boundary are `DJU / BEI`. Their only other adjacent complete-word occurrence is on p27.

**Human step available in 2014.** A player familiar with the 2013 OS could recognize the two pauses and inspect the terminal LP2 region. Repeated visible words are a plausible book-navigation cue.

**Weakest assumption.** Duplicate-word navigation is inferred rather than stated. The earlier mid-word fragment and line-split readings are already rejected as ordinary typography.

**Decision.** The duplicate handoff now earns more weight because the destination p27 contains a self-confirming source circuit that can also be discovered without the duplicate path. This is an example of a navigation hypothesis gaining independent destination support.

### 3. p27 red13 / table / signed-DH circuit

**Visible prompt.** P27 has a red 19-rune heading followed immediately by a red 13-dot mark. GP prime weights were part of the public puzzle vocabulary. The original numerical table is a visibly bounded 32×8 object.

**Human-executable construction.** Freeze all red spans of length at least13 that end immediately at red13. P27 alone has a prime GP-prime sum, 1109 = prime #186. On p27, the visible counts give `19−13=6`; the 13th rune is I with GP prime31; `31×6=186`, independently reproducing the whole-heading prime ordinal. Original table cell186 is `0J=19`, closing back to the red length. The same `(31,6)` used as a zero-based table coordinate selects cell254 `39`.

The selected token and the same one-based-forward heading orientation reconstruct the complete signed 2013 DH worked exchange. Token low digit9 selects heading position9 H, GP prime23. Base59(`39`)=186 gives row23,col2; base60(`39`)=189 gives row23,col5, yielding shared2 and base5. Derived base5 selects heading position5 S, GP index15, the client secret. The visible gap6 is the server secret. Then `5^6 mod23=8`, exactly the table width; `5^15 mod23=19`, exactly the red length; and both sides produce shared2. The base59 pointer walk reaches189 from186 in exactly the public-share count8. All three heading selectors, 13, 9 and5, use one-based forward indexing.

**Confirmation.** This route supplies multiple exact returns to source quantities before any language score: two independent derivations of address186, cell186→19, private/public DH consistency, two-party shared-secret agreement, and the eight-hop table closure. The local red13 rule closes only on p27 among the six comparable source objects ([full circuit](lp2-p27-red13-dh-radix-transducer.md); [reproducer](../sims/lp2_p27_red13_dh_radix_transducer_sft.cjs)).

**Weakest assumption.** Zero-based row-major addressing and the intended dual reading of `39` remain inferred from layout and structure. The authenticated DH protocol ends by returning the shared integer; it provides no KDF, data cipher, or LP2 receiver (#1625). #1626 independently finds no reversible `FIND THE DIVINITY` receiver on p27. #1650 also closes the obvious historical Instar-XOR carry-forward. The exact tuple predates Cicada in a teaching deck, so it is generic DH control data rather than Cicada-specific provenance. That provenance objection no longer blocks the operation choice because the source-selected p28 center line independently exposes `DH`, line length23, word length5, line number6 and word start19, reconstructing the same tuple inside LP2.

**Decision.** This remains the strongest local structural circuit to recognizable DH semantics, and the p28 center-line object now supplies an LP2-native reason to choose DH23. The teaching-deck provenance still prevents treating the historical tuple itself as Cicada-specific evidence. Preserve the p28→p27 convergence as a leading intended-route hypothesis and prioritize the still-missing reversible receiver.

### 4. p0 27×27 route

**Visible prompt.** Original rubrication gives a p0-title-to-next-red13 span of 729 runes, so a 27×27 inspection is source-motivated.

**Weakest assumption.** Axis/origin choices and subsequent node grammar were reconstructed after candidate language appeared. The five-sign `R-A-T-I-O` branch conflicts with demonstrated GP spelling, where RATIO uses the dedicated IA/IO rune. The source-bounded opening is a genuine all-grid outlier, but its state update does not cross the first physical page boundary deterministically.

**Prospective gate.** The all-grid opening has one all-native survivor among 105 source-word-aligned states and reaches TURNS on the exact final p0 rune `(10,19)`. Director #1646 freezes that terminal state before looking at p1. The published successor rule supplies only `phi(NG)=12`, leaving three in-bounds key-center displacements, three independent ciphertext-start displacements and four read directions, **36 assignments**. P1 begins at `(10,20)`, which is outside those distance-12 choices.

**Decision.** Keep the 729-square and 1/105 opening as real local structural evidence. The current grammar fails the requested blind p0→p1 transfer because it lacks a source-selected successor center, start, direction and stop. Cap this route at the p0 boundary unless an original clue supplies that missing state update; do not use later language or checksum selectors as retrospective repair ([gate](lp2-p0-p1-blind-transfer-gate.md)).

### 5. p50 printed-token bracket / 58-page word-address route

**Visible prompt.** A provisional GP-prime/58-page word-address rule sends the p55 terminal pair to p50 local2; the signed 2016 word `lies` reaches adjacent local3. Those tokens form a unique nested `3L 3D ... 3D 3L` bracket with the sole `13` token at its midpoint.

**Weakest assumption.** The 58-page address rule itself is unauthenticated. Every downstream payload interpretation inherits that choice.

**Decision.** This branch has a typed receiver if the address grammar survives independent historical/source authentication. That makes the grammar gate more valuable than another payload cipher search.

## Historically plausible frontier

No current branch supplies a complete source-fixed reversible decoder for unknown LP2 ciphertext. The combined p57→p28 center-line DH23→p27 red13 circuit is the clearest intended-route candidate because p28 directly names the operation through its unique `DH` line fragment and reconstructs the same tuple later closed by p27/table geometry. Its missing element is sharply localized: **what original object receives the reconstructed DH state, and by what reversible operation?** The signed protocol itself does not answer that question.

Two experiments deserve priority because either outcome changes the route choice:

1. **Finish the original-layout row-major audit (#1632).** The p27 circuit uses `(31,6)→254` and `186/189→(23,2)/(23,5)`. A genuinely printed left-to-right/top-to-bottom origin or seam cue would make that human-executable from the 2014 images. If the layout does not select the convention, retain the DH circuit as structural evidence and require another origin cue before using addresses as instructions.
2. **Authenticate or reject the 58-page word-address rule (#1621).** A positive result would supply an independent, typed route into the unique p50 bracket and therefore a concrete receiver family. A negative result would remove the most developed alternate navigation branch and concentrate effort on finding a receiver for the p27 circuit.

Further arithmetic on the p27 heading, generic KDF/cipher menus after DH, or additional p0 English fitting should wait for one of these source decisions. The historical record favors short, typed, self-confirming operations; that criterion currently makes source selection more valuable than another broad cryptanalytic sweep.