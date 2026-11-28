# Literal rectangular Playfair GP29 domain obstruction (#3291)

Agent 3, 28 November 2026. No recovered unknown plaintext.

## Source and rule

Inspected the actual historical chart decoded from `resources/historical/cicada2013-gematria-jpeg.b64`: its two rune columns have 15 and 14 rows, with the lower-right cell absent. The left column is F through X; the right column is S/Z through EA. Its order and value table does not instruct Playfair. Neither this chart nor the five-dot marks specify a 5×6 rectangle. Earlier #969 Bifid and #3221 collision-avoidance are distinct; #1480 and [the consolidated digraph gate](lp2-fixed-digraph-bijection-gate.md) already exclude the fixed whole-stream pair-bijection and standard distinct-output families on the recorded clocks.

For a rectangle of r×c cells (rc=30) with one hole h, conventional Playfair shifts both partners cyclically right in a shared row, down in a shared column, and exchanges columns otherwise. Inverse reverses the shifts and exchanges columns again. Equal partners are not legal in classical Playfair; for the most generous 841-pair domain, explicitly choose shared-row priority and shift both equal partners right. This is a bijection on the **full** 900-pair rectangle, but not on the 841 legal pairs.

## Exact new obstruction

Take the hole at (i,j), a legal cell (i,k), k≠j, and a legal cell (l,j), l≠i. The rectangle operation emits the hole (i,j). This proof works regardless of rune arrangement or hole location. On the actual chart, S/Z and EA are in the right column, and shifting down sends EA to the missing bottom-right cell; T is the other output.

The exact count of legal ordered inputs that emit the hole, with the stated equality extension, is:

- equal: 1 (hole's horizontal predecessor, repeated);
- distinct shared row: 2(c−2);
- distinct shared column: 2(r−2);
- rectangle: 2(r−1)(c−1).

Total = 2rc−5 = **55 of 841**, including **54 distinct pairs**. The classic filler rule therefore cannot fix this failure. The same proof applies to any keyed arrangement. Odd-length frames do not rescue a failing complete pair; a fixed last-symbol copy can be appended to an otherwise reversible pair rule, but does not cure nonclosure.

## Repair is a distinct, already-bounded receiver

For completeness only, cycle-walking the full 900-pair permutation until both outputs are legal, reversing with inverse cycle-walking, constructs a GP29² permutation. The conventional full-board operation preserves equality of partners in both directions, so the restricted cycle-walk does too. A classical distinct-pair sender still cannot emit equal pairs, hence the original-source p24 line-two-parity witness in the consolidated gate rules out the previously specified full-book/page/line clocks. If equal plaintext partners are allowed, any fixed repaired map is still a stationary 841-element substitution preserving its pair-count multiset; #1480 already tested and rejected that broad global family under its English-register assumption. Neither result proves impossibility of an independently selected changing-state receiver.

The literal chart and hypothetical 5×6 layouts were exhaustively checked at every hole location, both orientations: 120 boards, 100,920 legal-pair inverses, all exact. Actual chart hole29 requires 786 single steps, 53 two steps, 2 three steps. Hypothetical 5×6 hole29 needs 786/51/4. This establishes mathematics, not an author-authenticated cycle-walk instruction. No original language ranking was repeated; no source selects a repair, key, or alternate clock. No additional alphabet search is justified.

Reproducer: `sims/lp2_rectangular_playfair_domain_sft.cjs`; full output `im-results/lp2-rectangular-playfair-domain-output.json`. Executed connected JavaScript core; standalone wrapper not separately launched.
