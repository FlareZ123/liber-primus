"""Boulard & Yap (2013), Fig. 4: bounded manually annotated face-graph test.

Input: Agent40 artifact 15163743081, run 45920605570, printed p.287.
Source PDF SHA256 1c69d1f55edeb779aaf6908f02f96916994043fb7de4b241c0dc8859427b3382.
The figure labels sixteen regions including cl (clavus); omit cl only for
the conditional 15-cell interpretation, not as an established cipher rule.
Eight uncertain contacts are independently granted. This is not an
exhaustive arbitrary-deletion or redraw test.
"""
from collections import Counter
from itertools import product
from pathlib import Path
from hashlib import sha256
import json
import cv2
import networkx as nx
from lp2_p27_myers_1929_facegraph_sft import graph, THRESHOLDS

LABELS = ["cb", "cR", "cCu", "cM", "u1", "u2", "u3"] + [f"a{i}" for i in range(1, 9)]
FIXED = [
    ("cb", "cCu"), ("cR", "cCu"), ("cR", "u2"), ("cR", "u3"),
    ("cCu", "cM"), ("u1", "u2"), ("u2", "u3"), ("u3", "cM"),
    ("u1", "a1"), ("u1", "a2"), ("u1", "a3"), ("u3", "a4"),
    ("u3", "a5"), ("cM", "a7"), ("cM", "a8"),
] + [(f"a{i}", f"a{i+1}") for i in range(1, 8)]
OPTIONAL = [
    ("cb", "cR"), ("cR", "u1"), ("u2", "a4"), ("u3", "a3"),
    ("u3", "a6"), ("cM", "a6"), ("u2", "a3"), ("cR", "cM"),
]

def main():
    p = Path("resources/liber-primus/44.jpg")
    assert sha256(p.read_bytes()).hexdigest() == "c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e"
    im = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)[470:895, 590:1840]
    refs = [graph(im, t) for t in THRESHOLDS]
    assert [(len(g), g.number_of_edges()) for g in refs] == [
        (15,25),(15,25),(15,24),(15,24),(15,24),(15,25),(15,25)]
    counts = Counter()
    matches = []
    for bits in product((0, 1), repeat=len(OPTIONAL)):
        g = nx.Graph()
        g.add_nodes_from(LABELS)
        g.add_edges_from(FIXED + [e for e, b in zip(OPTIONAL, bits) if b])
        counts[g.number_of_edges()] += 1
        for t, r in zip(THRESHOLDS, refs):
            if nx.is_isomorphic(g, r):
                matches.append({"bits": bits, "threshold": t,
                                "mapping": next(nx.algorithms.isomorphism.GraphMatcher(g,r).isomorphisms_iter())})
    print(json.dumps({"fixed": FIXED, "optional": OPTIONAL, "variants": sum(counts.values()),
                      "edge_counts": dict(counts), "matches": matches}, indent=2))

if __name__ == "__main__":
    main()
