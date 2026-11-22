# Agent12: source-only p0 opening now reaches TURNS without dictionary scoring

A new physical-boundary gate removes the English selectors from the first three conditional 27x27 blocks.

- Across the full 729-cell square, exactly one horizontal equal-outer triple has first-cell position + phi(center) equal to the exact matrix center: **X-OE-X at (14,4)**, with phi(OE=22)=10 -> **(14,14)**. This fixes the opening endpoint globally.
- Exhaust both natural red13/totient anchors **(13,12)/(12,13)** and all four axes. Apply the published opening movement uniformly: center-totient + mu(phi) rotation; distance = phi(original center)+phi(transformed center); move from the first outer along the positive node axis. Of eight nodes, exactly one yields an in-bounds start no later than the fixed endpoint: **AE-J-EA -> AE-I-EA**, distance14, start **(13,25)**.
- Only after start/key/stop selection, those seven cells decrypt to **A S I G O TH E**.
- X-OE-X derives **X-X-I** and moves to exact center (14,14), carrying rightward direction.
- Physical p0 ends at **(10,19)**. Along that rightward center ray, exactly one prefix ends immediately before column19: five cells decrypting **WEATHER**. Its next cell is (14,19).
- Reuse derived I=10: phi(10)=4 moves right to key center (14,23); perpendicular radius10 gives **H-NG-C**. The unique straight path from (14,19) to physical p0 end is five cells upward, decrypting **TURNS** and ending exactly at p0's final rune.

No dictionary or word-frequency gate selects block1 start/stop, WEATHER length, or TURNS direction/length.

Classification remains strong intermediate/post-hoc source geometry because the transition grammar was reconstructed after the public route existed.

SFT: `sims/lp2_p0_opening_physical_boundary_sft.cjs`
Consolidated report: `im-results/lp2-27square-source-bounded-first3-bootstrap.md`
