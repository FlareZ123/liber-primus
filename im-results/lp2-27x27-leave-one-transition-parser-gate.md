# 27×27 proposed route: leave-one-transition-out parser gate

**Agent2, 18 November 2026. Decision: negative.** The current 27×27 proposal supplies
retrospective transition filters, but no plaintext-blind parser that uniquely predicts the
next source node, ciphertext segment, transform and stop. The proposed English route remains
a conditional constructed output, not recovered LP2 plaintext.

This decision deliberately does **not** replay the 38 published block subtractions. Those
were already independently reproduced on all selected original cells in #30. The question
here is narrower: can the route select the *next* operation before the next plaintext is read?

## Frozen candidate grammar

I used the external project's current documented grammar rather than inventing a new one:

- Reports 00–15: key-node, phase, axis/parity/ray/radius/GCD filters;
- Report 17: next key-center column XOR/Möbius filter;
- Report 18: three next-ciphertext geometry bits;
- Report 19: next-start near/far distance filter.

Report 16 is **excluded from a plaintext-blind parser** because its rule is that an
independently decrypted block must segment into one or more complete English words. That
uses the candidate plaintext as an acceptance condition and therefore violates Director
#1502's precommit/withhold requirement.

The external README itself states that its transition reports predict or filter properties
of the next block while **selecting an exact next location remains open**. It also states
that the branch containing `THE KEY IS TO GO TO THE EAST OF THE MAP` was found by computer
brute force and that its genuineness is uncertain.

## Test 1 — interior transition block02 → block03

This is an already-frozen source-only leave-one-step test from #259 and is not rerun.

Starting from the published block02 state and applying the p0-derived geometry rules before
looking at block03 plaintext leaves:

- **129** admissible source-key variants;
- **86** geometric source nodes;
- **84** ciphertext paths;
- **4,108** source/path assignments.

Even if the published five-cell ciphertext path is granted, **64 key variants at 40 source
nodes** survive. Granting both the exact published H–NG–C physical source and exact path
still leaves the center-operation choice unresolved: the direct center gives the proposed
`TURNS`, while the center-totient variant gives `TIRNA`; both exactly re-encrypt the same
original ciphertext.

Thus the parser does not predict the exact source/transform/segment at an early interior
transition. English feedback is doing unresolved selection work.

## Test 2 — prospective chronological holdout inside Report 18

Report 18 documents a stronger prospective check on its own fitted formula family. When the
strongest geometric target predictor was selected using only the **first 33 transitions**,
that frozen predictor matched only **one of the final four** recorded transitions.

This is directly contrary to the desired leave-one-transition-out behavior. The final
published Report-18 formulas achieve 37/37 only after retrospective selection on the
recorded route. Its own search-conditioned controls explicitly classify the formulas as
experimental filters whose reliability on a new route remained to be tested.

Report 19 improves one geometric bit but does not repair exact selection. Its target and
distance threshold seven were identified using the full recorded route; the report therefore
cannot serve as an independent withheld-transition parser either.

## Test 3 — complete plaintext-blind grammar after I ASK

The strongest simple adversarial test is the next transition after published block38
`I ASK`, because all earlier route state is available and no proposed next plaintext need
be used.

The external project's own enumerations give:

| frozen filters | geometries | ordered ciphertext segments |
| --- | ---: | ---: |
| through Reports 00–15 + 17 + 18 | **1,080** | **21** |
| add Report 19 | **966** | **19** |

Before Report19 there are six possible starts; after Report19 five remain. Report17 still
allows all **39** candidate key centers represented in the Report18 pool. The project
explicitly records `DIE` as one admissible continuation under Report18 and records
`HOW` as another. Report19 removes only two of the 21 ordered segments; it does not select
DIE uniquely.

The later argument that DIE is terminal is conditional on **first selecting the DIE
geometry**. From that fixed geometry, Report19 eliminates all three proposed following
segments. That can explain a stop *after a chosen DIE*, but it is not a parser for choosing
DIE from I ASK.

## Test 4 — known THE/YE ambiguity

The independent #30 update of 18 November records that Agent27's audit of Reports17–19 still
leaves the earlier **THE/YE same-cell ambiguity**. That ambiguity predates this task and is
retained as an adversarial control in Director #1502. The later source-selective red-heading
construction does not resolve the opening/transition selector and was explicitly reported
without overturning that ambiguity.

This gives a second interior failure independent of the block02→03 center-transform
ambiguity. I did not introduce a language tie-break, because doing so would simply reproduce
Report16's prohibited plaintext feedback.

## Why the new 3301 endpoint equations do not solve the parser problem

The current external branch also contains exact endpoint equations involving 3301 that can
recover `I ASK` when a long recorded prefix is held fixed. They are mathematically
reproducible, but they are terminal constraints on a selected route rather than a local
transition law.

Director #1502 was opened after the Critic measured two newer I ASK→DIE handoff equations:
each succeeds only on that target transition and fails every other evaluable transition
(**1/29** and **1/34**). A one-transition equation cannot be used as the missing reusable
parser. I therefore did not treat endpoint uniqueness as evidence that the preceding
transition sequence was prospectively generated.

## Decision

The proposed route fails the required parser gate in three independent ways:

1. an early interior transition remains combinatorially underselected even under source
   geometry;
2. a predictor selected on the first 33 transitions fails three of four chronological
   holdouts;
3. the complete current plaintext-blind filter stack leaves 19 next ciphertext segments
   after I ASK rather than one.

Using Report16 would repair some branches only by inspecting English output, which is
exactly the forbidden feedback channel. Adding a new fitted equation after each ambiguity
would no longer constitute one compact reusable parser.

Therefore:

- do **not** accumulate AS-I-GO… / THE-KEY… / I-ASK / DIE fragments as authenticated LP2
  plaintext evidence;
- preserve the arithmetic and source geometry as conditional compatibility evidence;
- do not commission another transition formula search on the same selected route;
- reopen only if an independently authored rule fixes the exact next source, segment,
  transform and stop on several withheld original transitions before plaintext is read.

No unknown LP2 plaintext or key is established by this gate.

## Pinned evidence

Repository evidence:
- #30 — independent 38-block original-cipher reconstruction and current underselection decision.
- #259 — exact block02→03 source-only ambiguity certificate.
- `im-results/lp2-27x27-published-nextblock-branching.md` — existing route ambiguity synthesis.

External proposal, current files inspected:
- `README.md`, blob `af78b8303258a4736097522c9548387250c0f72f` when fetched during this audit.
- `Start-reading-here/17-xor-next-key-center-column.md`, blob `4bf1d4e803c77efac8aeecc476f952b8af6443b4`.
- `Start-reading-here/18-predicting-next-ciphertext-start-and-end.md`, blob `5451fe292447207d5ffa6b844e9686e3b9c69ce7`.
- `Start-reading-here/19-predicting-next-ciphertext-start-distance.md`.
- `plaintext-i-found/40-why-die-is-the-final-word.md`, blob `6c2076317baa834431b5bd97d56348975415a408`.
