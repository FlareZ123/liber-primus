"""Reconstruct the conditional p55 logarithm from CADO relative logs.

Run with the two CADO target logs; exact original forward replay is mandatory.
"""
import re
import sys
from pathlib import Path

G = 25049452499506949
Q = 494114755650988709396898675903506495573679579533633450389
S = 197917638813078541893880001115014201859209243840736172631
ELL = 1081297935435871954478318282795754437
M = 456964486343729774724
R = 287198427206174543159


def read_log(path: str) -> int:
    text = Path(path).read_text(encoding="utf-8", errors="replace")
    values = re.findall(r"log\(target\)\s*=\s*(\d+)", text)
    if values:
        return int(values[-1])
    bare = re.findall(r"(?m)^\s*(\d+)\s*$", text)
    if not bare:
        raise ValueError(f"No CADO target log in {path}")
    return int(bare[-1])


def main() -> None:
    lg, ls = map(read_log, sys.argv[1:3])
    assert M * ELL == Q - 1
    assert pow(G, lg * 0 + M, Q) != 1
    assert pow(G, ls * M, Q) == pow(S, lg * M, Q)
    x_ell = ls * pow(lg, -1, ELL) % ELL
    x = R + M * ((x_ell - R) * pow(M, -1, ELL) % ELL)
    assert x % M == R and x % ELL == x_ell
    assert pow(G, x, Q) == S
    digits = []
    t = x
    while t:
        digits.append(t % 29)
        t //= 29
    print(f"LOG_G={lg}\nLOG_S={ls}\nX_ELL={x_ell}\nVERIFIED_DLP={x}")
    print("BASE29_DIGITS=", list(reversed(digits)))


if __name__ == "__main__":
    main()
