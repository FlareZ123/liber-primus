# `SEQUENDI RATIO` and Caesar, *De Bello Civili* I.30.1

**Agents 28 and 44, 18 November 2026. Classification:** bounded source-motivated follow-up to the conditional red-heading result. The classical textual association is exact enough to record, but Director #1503 found no independent 2012–2014 Cicada-authored selector for Caesar, *De Bello Civili* I.30.1, Pompey, Hispania, `sequendi`, or `rationem`. The two cheapest direct cipher interpretations are also rejected on the original p0 body. Treat the Caesar/Civil-War association as a post-hoc literary coincidence candidate unless new first-party evidence supplies the missing selector.

## Source lead

The candidate red heading recovered in `im-results/lp2-p0-red-heading-sequendi-ratio-route-check.md` is literally

```
SECUENDI RATIO
```

with the GP C/K rune naturally read as Q for Latin:

```
SEQUENDI RATIO
```

A classical near-match occurs in Julius Caesar, *De Bello Civili*, Book I, 30.1:

```
Itaque in praesentia Pompei sequendi rationem omittit,
in Hispaniam proficisci constituit ...
```

The phrase `Pompei sequendi rationem` means the plan/method of following Pompey. This association is notable because the work is explicitly *Liber Primus* at Book I, and Cicada's 2012 opening puzzle deliberately used a Latin `... CAESAR` clue to select a Caesar operation.

Stable source texts:
- Corpus Corporum, Caesar *De bello civili*, caput 30: https://mlat.uzh.ch/browser?path=%2F&text=12634
- Packard Humanities Institute, Caesar *Bellum Civile* I.29-30: https://latin.packhum.org/loc/448/2/15/404-409

This is a **hypothesis lead**, not evidence that Caesar's text is the missing LP2 key.

## Independent historical source-selection audit (#1503)

The source gate asks whether anything available independently of the candidate red reading would lead a 2012–2014 solver to Julius Caesar's *De Bello Civili* I.30.1, Pompey/Hispania, or the exact `sequendi rationem` phrase.

The preserved authenticated/original-era text corpus was searched directly for `Caesar`, `Pompei/Pompey`, `Hispania`, `Bellum Civile`, `De Bello`, `sequendi`, and `rationem`. The first-party material includes the preserved signed 2012–2014 messages, original onion/stage text, signed 2013 server material, the 2014 May reply, Stage04/Stage11 source text, and other byte-pinned historical files already indexed in `resources/`. No first-party source contains a pointer to the Civil War work, Book I chapter 30, Pompey/Hispania, or the target phrase.

There is one genuine historical Caesar precedent: the 2012 opening artifact exposes `TIBERIVS CLAVDIVS CAESAR` and thereby motivates an ASCII Caesar shift by four. The byte-pinned source note preserves that operation. This demonstrates that Cicada used a Caesar clue as an operation selector, but it does not select Julius Caesar as an author, a particular classical work, or *De Bello Civili* I.30.1.

As a contemporaneous-community control, `sims/lp2_2014_irc_caesar_source_selector_scan.cjs` scans three exact Git-blob-verified solver IRC exports while accepting only timestamped 2012–2014 lines. Windows Node22 run [44397268478](https://github.com/FlareZ123/liber-primus/actions/runs/44397268478) passed all byte-identity checks. Across 54,351,077 source bytes it finds:

- `#cicadasolvers.freenode.log`: 57 `caesar` mentions, 13 `Pompei/Pompey` regex hits, and zero `Hispania`, `Bellum Civile`, `De Bello`, `sequendi`, or `rationem`;
- `#cicadasolvers.freenode.2.log`: 28 `caesar` mentions and zero for every other target term;
- `#33012014.freenode.log`: 18 `caesar` mentions and zero for every other target term.

The 13 first-log `Pompei/Pompey` hits are unrelated uses such as Pompeii and the SATOR square. One especially relevant solver-authored line on 8 January 2014 links “Another Liber Primus” to Caesar's *De Bello Gallico* Book I. That line shows that contemporary solvers were already generating many Latin “Book I” associations from the title; it points to a different Caesar work and has no Cicada-authored provenance. A later `De Bello` bot hit seen in an unrestricted pilot was dated 2016 and disappears under the required 2012–2014 period gate.

**Decision:** no independent first-party selector for *De Bello Civili* I.30.1 survives the bounded audit. The literary near-match remains worth recording as context for the conditional title, while it cannot select a Caesar book-code, `POMPEI` key, running-text offset, or ciphertext target. Reopening this branch requires new Cicada-authored or contemporaneous source evidence that fixes the work/location independently of the candidate reading.

## Cheapest direct interpretations fail

The most obvious omitted word adjacent to the recovered phrase is `POMPEI`. I tested the original p0 body after the 13 red heading under:

1. every fixed GP29 Caesar shift;
2. repeating `POMPEI`, all six initial phases and both add/subtract directions;
3. the same `POMPEI` family with the historically licensed LP-style literal-ciphertext-F bypass/no-key-advance convention.

The p0 body has 249 runes and IoC **0.03436325949**. The solved native p57 plaintext control has IoC **0.06270996641**. A fixed Caesar shift preserves the complete rune histogram and therefore cannot change that IoC. Exhausting all 29 shifts also leaves the best English quadgram score at **-7.1052220848 per quadgram**, versus **-4.4206334171** for solved p57 under the same GP transliteration scorer.

For `POMPEI`:

- best ordinary repeating-key branch: subtract, phase 0, **-7.2788573704**;
- best all-ciphertext-F-bypass branch: subtract, phase 3, **-7.3219583992**.

These remain random-like and do not support a direct whole-body Caesar/Vigenere interpretation.

## Current scope after the source audit

Director #1503 closes the Caesar/*De Bello Civili* source-selection branch at the current evidence boundary. Do not search arbitrary Caesar-text offsets, derive `POMPEI` variants, or use the classical phrase to choose among underselected 27×27 coordinate conventions. The red-heading geometry remains a separate conditional result and still needs an independently authored rule or a prospective consequence on untouched original ciphertext.

A future Caesar/book-source test becomes justified only if a newly recovered first-party artifact independently identifies Julius Caesar, the Civil War text, Book I chapter 30, Pompey/Hispania, or an equivalent deterministic source coordinate.

## Reproduction

Run:

```
node sims/lp2_p0_caesar_source_direct_gate_sft.cjs
```
