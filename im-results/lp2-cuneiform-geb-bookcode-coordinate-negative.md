# LP2 sexagesimal seal versus the 2014 GEB book code: negative test

**Status: the obvious cross-round mappings are not source-locked; retire them. No LP2 plaintext or key was recovered.**

## Evidence

The p34–39 seals are transcribed as the base-60 values **1033** and **3301**, giving digit pairs **(17,13)** and **(55,1)**. See `im-results/lp2-sexagesimal-seal-to-terminal-byte-interface-gate.md`.

The 2014 Stage08 GEB book code uses the format:

`<chapter/dialogue title>:<dialogue exchange>:<word>:<letter>`

The preserved Stage08 source gives, among others:

- `C[1]:4:5:3` → `d`, from the 4th exchange of *Contracrostipunctus*, word 5 (`bad`), letter 3.
- `C[2]:2:17:5` → `v`, from the 2nd exchange of *Contrafactus*, word 17 (`beloved`), letter 5.

These controls are documented in the [2014 Stage08 solver README](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/007-fifth-onion/README.md). The corresponding dialogue transcripts are [Contracrostipunctus](https://imagineworld.net/corpus/0_self-orient/identity-continuity/self-reference/godel-escher-bach/dialogue/node-book_godel-escher-bach_dialogue-04-contracrostipunctus/) and [Contrafactus](https://imagineworld.net/corpus/0_self-orient/identity-continuity/self-reference/godel-escher-bach/dialogue/node-book_godel-escher-bach_dialogue-19-contrafactus/). The ImagineWorld corpus identifies its source as a 20th-anniversary edition; it reproduces both Stage08 control extractions, but is not asserted to be the exact 2014 physical edition.

## Tests

### 1. Two seal pairs as coordinates in the two C-labelled dialogues

The most direct mapping is:

- `(17,13)` → exchange 17, word 13 in `C[1]` (*Contracrostipunctus*).
- `(55,1)` → exchange 55, word 1 in `C[2]` (*Contrafactus*).

The first coordinate fails in the accessible transcript: exchange 17 of *Contracrostipunctus* is the short question “Rather unusual. Was it a present for the Crab?” (nine words). Word 13 is out of range. This rejects the natural pair-to-dialogue mapping before any letter-position convention is needed. The second pair cannot rescue a mapping whose first coordinate is invalid.

### 2. One four-field coordinate: `17:13:55:1`

Reading this as chapter 17, exchange/line 13, word 55, letter 1 is not established by the Stage08 convention. Stage08 selects sections by **title** (including the disambiguated labels `C[1]` and `C[2]`); it does not demonstrate a bare numeric chapter/dialogue selector such as `C[17]`. Further, Chapter XVII, “Church, Turing, Tarski, and Others,” is prose rather than a dialogue, so interpreting field 13 as a dialogue exchange requires a new, unsupported paragraph/section rule.

Do not silently substitute a paragraph, section, printed line, zero-based index, or another GEB edition to force a valid extraction.

### 3. Direct LP2 page/word coordinates

The alternative reading of the pairs as LP2 page/word addresses was already checked in `im-results/prime-echo-pageword-period7-gate.md`; it selects ciphertext fragments rather than plaintext. Do not retune that interpretation.

## Decision and scope

Retire the current GEB book-code interpretations of these seals. Reopen only if an independent LP2 clue supplies a unique GEB section/title and a reproducible coordinate convention. The 2016 signed message's general language about words and numbers does not, by itself, select GEB or resolve the missing fields.

This is an intermediate negative finding, not an overall change to the established cipher status. No unknown LP2 plaintext, authentic key, complete inverse, or final destination was recovered.
