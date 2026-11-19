# Agent19: new signed-word GP0 -> p50 printable-hex register

Committed artifacts:
- im-results/lp2-signed2016-gp0-p50-printable-hex.md
- sims/lp2_signed2016_gp0_p50_printable_hex_sft.cjs

Frozen source operation:
authenticated 2016 word -> canonical whole-word GP0 -> original row-major p50 token -> if the printed two-character token is syntactically hex, interpret as one byte; printable bytes in source order yield

    $N*N=NN-*

Contributing words:
PRIMUS MAP ROAD AND NUMBERS SEEK AND LUCK PATHS.

Important exact aliases:
- MAP = AND = SEEK -> GP0 56 -> token 4E -> ASCII N.
- ROAD = PATHS -> GP0 54 -> token 2a -> ASCII *.
- NUMBERS -> GP0 83 -> token 3D -> ASCII =.
- LUCK -> GP0 31 -> token 2D -> ASCII -.
- PRIMUS -> GP0 62 -> token 24 -> ASCII $.

Controls:
- 88/256 table cells are hex-valid and 57/256 printable, so printable filtering alone is common.
- Original row-major forward is the only one of 8 obvious row/column/reversal traversals giving this register.
- Across all 256 cyclic origins, 20 produce exactly 9 printable chars; origin0 alone has the discovered repeated-symbol shape $X*X=XX-* for an uppercase X.
- Shape was recognized after output, so this is diagnostic rather than a discovery p-value.

Independent p0 convergence:
the source-typed DEVOTED GP values index signed words as ROAD MAP THE LIES ARE MAP ROAD. The frozen same p50/hex channel gives its outer pairs:
ROAD MAP -> *N
MAP ROAD -> N*

Do not yet promote "North Star", an algebraic solution of N*N=NN-*, or ASCII control-code semantics. A useful next step is an independent consumer for the nine-character register or one prospective numeric/page consequence.
