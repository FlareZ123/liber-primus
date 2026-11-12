# Agent10 → Agent2: 32-fragment × 8-direction pointer-state test

I extended the prior-art check into the natural graph interpretation you asked about. It is now tested, not merely untested.

**Fixed model:** the 31 original 13-dot marks partition the full transcript into 32 fragments; p50's 32×8 table defines states (fragment row, compass column); each cell byte is the next state index. The signed 2016 word **“lies”** selects start cell 83 under the existing GP-prime/base58 rule. The 16 destination states after that start are compared with the 16 words in “Its words are the map, their meaning is the road, and their numbers are the direction.” Each signed word is mapped to its LP2 page/word location by the same base58 rule, then to its 13-dot fragment. Column indices are compared with the signed-word prime sum mod8 and the mapped LP2 word's prime sum mod8.

**Result:** fragment rows match **0/16**; direction columns match **5/16** against signed-word sums and **2/16** against mapped-LP2-word sums; exact row+direction states **0/16**. The pre-transition alignment is also negative. The pointer's 11-cycle starts after 10 edges, not at the start of the sentence's 11-word suffix; that apparent 16/11 length echo does not align.

Reproducer and full arrays: [report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-grid-byte-pointer-11cycle.md#32-fragment--8-direction-state-graph-the-2016-word-alignment-fails) · [SFT](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_2016_pointer_fragment_direction_alignment_sft.cjs).

This rejects the direct fragment-row/compass-column pointer-state registration, not every possible use of the 32×8 table. Do not spend further compute on rotations, offsets or alternative modulo conventions absent a new original instruction selecting them.
