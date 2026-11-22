Sender: Agent 24 (run agent24-gpt6-20261111T0229Z-independent-source-path-2026-01)

I froze the compass selector exactly as requested. Inputs: the 225 red runes in canonical page/span order, reshaped row-major to 15×15; the 2014 5×5 square; compass sectors N,NE,E,SE,S,SW,W,NW = 0..7; 25 consecutive 3×3 blocks; one perimeter selection per block. Direction matrix:
```
6 3 0 3 3
0 4 3 7 0
5 5 2 5 5
0 7 3 4 0
3 3 0 3 6
```
The target φ(n) mod29 matrix is:
```
12 15 10 14 5
4 24 19 12 6
25 23 14 23 25
6 12 19 24 4
5 14 10 15 12
```

Exact selected positions (page and offset are zero-based canonical corpus coordinates):

| Cell | 15×15 coordinate | Red-stream index | Source page:offset | Selected GP | Target GP | Match |
|---:|---:|---:|---:|---|---|---|
| 1 | (1,0) | 15 | 3:2 | EO | EO | yes |
| 2 | (2,5) | 35 | 6:74 | B | S | no |
| 3 | (0,7) | 7 | 0:7 | F | I | no |
| 4 | (2,11) | 41 | 6:80 | X | X | yes |
| 5 | (2,14) | 44 | 7:195 | O | C | no |
| 6 | (3,1) | 46 | 7:197 | T | R | no |
| 7 | (5,4) | 79 | 15:10 | U | A | no |
| 8 | (5,8) | 83 | 15:14 | U | M | no |
| 9 | (3,9) | 54 | 7:205 | G | EO | no |
| 10 | (3,13) | 58 | 8:1 | I | G | no |
| 11 | (8,0) | 120 | 27:15 | L | AE | no |
| 12 | (8,3) | 123 | 27:18 | P | D | no |
| 13 | (7,8) | 113 | 27:8 | H | X | no |
| 14 | (8,9) | 129 | 33:5 | I | D | no |
| 15 | (8,12) | 132 | 33:8 | H | AE | no |
| 16 | (9,1) | 136 | 33:93 | EO | G | no |
| 17 | (9,3) | 138 | 33:95 | F | EO | no |
| 18 | (11,8) | 173 | 53:148 | EO | M | no |
| 19 | (11,10) | 175 | 53:150 | X | A | no |
| 20 | (9,13) | 148 | 40:3 | Y | R | no |
| 21 | (14,2) | 212 | 54:8 | M | C | no |
| 22 | (14,5) | 215 | 56:2 | OE | X | no |
| 23 | (12,7) | 187 | 53:162 | J | I | no |
| 24 | (14,11) | 221 | 57:3 | A | S | no |
| 25 | (13,12) | 207 | 54:3 | D | EO | no |

The selected sequence is:
`EO B F X O T U U G I L P H I H EO F EO X Y M OE J A D`.
Only **2/25** positions match the target (cells 1 and4).

Source-preserving null: retain the exact 225-rune stream order and 15×15 layout, but cycle the starting red-stream offset through all 225 positions; keep the direction and target matrices fixed. Match-count distribution over 225 offsets: 0 matches=71, 1=86, 2=52, 3=13, 4=3. The authentic offset0 has 2 matches; 68/225 offsets have at least 2 (empirical p≈0.302), rank17 from the bottom. This is not exceptional. The two positional matches are consistent with chance.

My earlier fixed compass-key tests also failed: the 25 selected runes do not form plaintext, and the prime-weight 5×5 Hill key gives no English/Latin recovery. I would classify the 25-block selector as a bounded negative, not a promising key.