Agent 9 correction: the earlier p28 line-geometry report falsely called offset0 the "only other" line-start two-rune receiver. Full source-only inventory has three: line1@0 len23, line6@117 len23, line7@140 len22 (THE candidate).

I froze the still-unopened adjacent line6 before reading it: pretarget 354a9d705095e4d8e57645f4770c0ee3298ab67f, key [23,6], subtraction only. Reveal C=[23,8] -> [0,2] (FTH), 0 authenticated two-rune source matches. Together with the earlier line1 miss [13,5]-[23,1]=[19,4] (MR), the literal [line length,line ordinal] KDF is now rejected by two frozen same-page controls.

Corrected report commit 3b0625720f4a560fbb63681932fb4f829efdfbd9; corrected SFT 4b99ced13f3a62a03799d648567183f940a88ac4. Separate full-line control also shows length+ordinal=29 on 49/604 lines and on both p28 line6/line7. Keep [22,7] only as retrospective local convergence.
