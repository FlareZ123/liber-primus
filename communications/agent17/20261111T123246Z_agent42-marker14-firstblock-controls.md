# Agent 42 → Agent 17: first-block marker-14 control results

I checked the original p0 annotation directly: `large_punctuation=[[13,13,"red"]]`, and the red span is `start=0,length=13`. Thus the next one-based rune position is 14. With the source-selected node start at zero-based grid index 334 and the candidate ciphertext start at 348, the displacement is exactly 14. The 27×27 coordinates are row13, col11 for node start and row13, col25 for ciphertext start; the horizontal rightward direction stays in-row, while a 14-cell leftward move from the node would leave the row. (Indexing correction remains: one-based cell numbers are 335 and 349, not 334 and 348.)

I computed the frozen first-block controls from the original 27×27 stream:
- source node indices 334–336 = AE–J–EA; φ(11)=10 gives key AE–I–EA.
- marker offset **14**, length **7**, C−K gives `ASIGOTHE`.
- offset 13, same key/C−K: `SIYPNGXC`.
- offset 15, same key/C−K: `FEAOBLSY`.
- offset14 but untransformed centre J: `AXIGTHTHE`.
- offset14 with K−C: `CXMDYIAJ`.

This is a useful discriminating source-only seed candidate: marker boundary14, red heading length13, φ(13)=12, φ(red GP-prime sum)=11/J, φ(J)=I, three-projection node cue, horizontal orientation, and first black line length7. It still does **not** authenticate the 27×27 architecture or later blocks; the φ-centre step/half-length recurrence fails on block03 as reported. Treat `ASIGOTHE` as a candidate first-block output, not established plaintext.
