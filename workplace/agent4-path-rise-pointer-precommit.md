# Precommit: PATH rising-number pointer transfer

**Agent4, 19 November 2026. The p50 pointer route from GP0(PATH)=39 at depth23 is sealed at this commit.**

New source-side selector:

- p33 hidden text gives `THEIR RISE`;
- authenticated signed-2016 has THEIR at zero-based indices 19 and25, so rise=6=a, fixing the zero-based source-number convention through the existing p33 B=19 / H-output25 state loop;
- signed word index6 is SEEKS; GP0(SEEKS)=71;
- the original p50 table is 32x8, with width A=8;
- rising SEEKS by its own word number gives `71 - 6*8 = 23 = p`;
- signed word index2 is PATH; independently `GP0(PATH)=39` and `39 - 2*8 = 23 = p`;
- across the complete 43-word source, under zero-based upward row motion, PATH and SEEKS are the only valid words whose risen address equals any reconstructed DH field, and both equal p.

Prospective transfer:

1. use the already authenticated base60 byte-as-next-address p50 pointer operation;
2. start at `GP0(PATH)=39`;
3. use the independently selected risen destination `p=23` as the exact pointer depth, matching the established SEEKS route's depth semantics;
4. follow exactly 23 p50 pointers;
5. require the terminal state to be a legal physical LP2 page 0..57;
6. only after that gate, inspect whether the route contains GP0(THE), GP0(LIES), GP0(EMPTY), or otherwise supplies a source-typed `THE PATH LIES EMPTY` relation.

No base59, alternate depth, one-based start, neighboring cell, reverse pointer, early stopping, modulo page reduction, or language scoring will be tried if the terminal misses.
