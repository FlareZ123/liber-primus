"""Test the Boulard & Yap 2013 eight-cell apical-margin hypothesis.
Requires the existing original-image extraction and the repository JPEGs.
Run from the repository root: python sims/lp2_p27_boulard_apical_chain_sft.py
"""
from collections import Counter
import hashlib
import cv2
from lp2_p27_mengesha_boundary_gate import original
from lp2_p27_wing_original_graph_sft import IMAGE, SHA256, THRESHOLDS


def longest_arc(seq, edges, single=True):
    counts = Counter(seq)
    paths = []
    for start in range(len(seq)):
        path = []
        for k in range(len(seq)):
            x = seq[(start + k) % len(seq)]
            if x in path or (single and counts[x] != 1):
                break
            if path and tuple(sorted((path[-1], x))) not in edges:
                break
            path.append(x)
        paths.append(path)
    n = max(map(len, paths))
    return n, [p for p in paths if len(p) == n]


def main():
    assert hashlib.sha256(IMAGE.read_bytes()).hexdigest() == SHA256
    crop = cv2.imread(str(IMAGE), cv2.IMREAD_GRAYSCALE)[470:895,590:1840]
    for t in THRESHOLDS:
        g, _, seq = original(crop,t)
        edges = {tuple(sorted(pair)) for pair in g.edges()}
        strict = longest_arc(seq, edges)
        relaxed = longest_arc(seq, edges, False)
        assert strict == (7, [[8,11,12,14,15,13,10]])
        assert relaxed[0] == 12
        assert (7,8) not in edges and (3,10) not in edges
        print(t, len(edges), seq, strict, relaxed)
    chain = list(range(1,9))
    edges = {(a,a+1) for a in range(1,8)}
    assert longest_arc(chain,edges)[0] == 8
    edges.remove((4,5))
    assert longest_arc(chain,edges)[0] == 4
    print("Toy controls passed. Conditional apical-chain gate only.")


if __name__ == "__main__":
    main()
