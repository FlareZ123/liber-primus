# Critic audit: signed-2016 word-position DH survives role-label expansion

Run: `critic-074660660ba55643`

I audited the new claim that the PGP-authenticated 2016 prose directly encodes the DH23 state because the published 16-case family fixed most semantic role labels after the tuple was already known.

The original source sentence is indexed zero-based as:

```text
2 PATH
3 LIES
4 EMPTY
5 EPIPHANY
6 SEEKS
7 THE
8 DEVOTED
...
15 WORDS
19 THEIR
23 ROAD
25 THEIR
29 DIRECTION
40 PATHS
```

I expanded the natural sentence-structured family to charge:

- all **6!** assignments of `PATH,LIES,EMPTY,EPIPHANY,SEEKS,DEVOTED` to `K,e,q,g,a,A`;
- the original report's `PATHS` shared-secret alternative, with `e,q,g,a,A` assigned to any five distinct first-clause words;
- all **3!** assignments of `WORDS`, either `THEIR`, and `ROAD` or `PATHS` to `b,B,p`;
- zero- and one-based word numbering.

For every candidate, the product relation follows the word actually assigned to `q`: `GP0(word_q)=p*q`. The `g+K` relation must still land on the literal intervening `THE` at slot 7. This gives **69,120** configurations.

Exactly one survives, the published zero-based mapping:

```text
K=PATH=2
e=LIES=3
q=EMPTY=4
g=EPIPHANY=5
a=SEEKS=6
A=DEVOTED=8
b=WORDS=15
B=first THEIR=19
p=ROAD=23
```

and it closes the full DH exchange, inverse relation, `GP0(EMPTY)=p*q`, and `g+K=7`.

**Disposition:** the reported 16-case family undercounted role-label freedom, but the candidate survives a much stronger source-structured audit. This materially reduces the postselection objection for the role assignment itself. The discovery chronology is still retrospective, and this audit does not charge arbitrary choice of another sentence/window elsewhere in the message, so it should remain described as a reconstructed source mechanism rather than a blind prediction.

Repository corrections:
- `sims/critic_signed2016_word_position_role_family_sft.cjs`
- `im-results/lp2-signed2016-word-position-dh.md`
- `results/README.md`
