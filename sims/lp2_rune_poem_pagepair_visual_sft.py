"""Reproduce Agent20's shuffled-image Rune Poem page-pair gate.

The visual inventory was recorded in shuffled ID order from the original JPEGs
before the page map was printed; the evaluator knew the hypothesis and some
familiar artwork, so this is a masked-order test, not a naive independent oracle.
No plaintext or cipher claims. Standard library only for numerical reproduction.
"""
import json
import random
from collections import Counter

SEED = 202611250614
ORDER = list(range(56))
random.Random(SEED).shuffle(ORDER)
assert ORDER == [49,42,7,50,32,13,20,15,19,22,35,47,45,53,10,24,41,17,36,33,39,34,12,21,52,25,38,2,11,48,51,31,43,40,28,23,29,14,0,44,5,27,26,30,37,4,55,46,18,3,1,9,16,6,8,54]
# Each entry describes one masked thumbnail, ID 00..55.
FEATURES = [
"rooted winged vines; numeric grid under text", "rooted winged vines", "curled lines; five black dots; red title-like line", "rooted winged vines; numeric grid only", "blurred tree; short text", "right bare rooted branch", "plain text", "4x4 numeric grid; infinity loop; red heading and giant initial", "plain text", "horizontal black cross-like object; recumbent human figure; short text", "small wedge-shaped symbols above text", "rooted winged vines", "rooted winged vines", "rooted winged vines; red lines; moth",
"left bare rooted branch", "paired faint insect-like figures", "rooted winged vines", "plain text", "wedge-shaped symbols above text; short red initial", "two red giant initials; three dots; wedge-shaped symbols below", "wedge-shaped symbols above; three dots; red giant initial", "wedge-shaped symbols above text", "left bare rooted branch", "plain text", "rooted winged vines", "paired faint insect-like figures", "wedge-shaped symbols above text; short red initial", "two black cross-like forms; cicada-like insect",
"right bare rooted branch", "rooted winged vines", "rooted winged vines; numeric grid above short text", "plain text", "rooted winged vines", "rooted winged vines; red giant initial", "plain text", "five black dots; red giant initial", "plain text", "left bare rooted branch; side-view winged insect", "black cross-like forms; red giant initial", "rooted winged vines", "curled lines", "oval veined wing-like shape; red giant initial",
"paired faint insect-like figures", "plain text", "wedge-shaped symbols above; red numbered lines", "curled lines", "rooted winged vines; pale tree; moth; short text", "rooted winged vines", "plain text", "curled lines; two red giant initials", "black cross-like forms", "right bare rooted branch", "plain text", "curled lines; red giant initial", "left bare rooted branch; red giant initial", "rooted winged vines; red giant initial"]
# Dickins 1915, English translation. Own short descriptors, not a claimed
# literal translation. Strict targets and extra permissive targets.
THEMES = [
("Feoh","wealth, freely shared",[],[]),
("Ur","aurochs, horns, moor",[],[]),
("Thorn","sharp thorn",[],["plant"]),
("Os","language and wisdom",[],[]),
("Rad","horseback journey",[],[]),
("Cen","bright torch flame",[],[]),
("Gyfu","generosity and aid",[],[]),
("Wynn","happiness, prosperity and home",[],[]),
("Haegl","hail, wind and melting water",[],["dots"]),
("Nyd","trouble that can bring help",[],[]),
("Is","ice, frost and glass-like surface",[],[]),
("Ger","summer and fruit-bearing earth",[],["plant"]),
("Eoh","rooted yew tree",["tree"],["plant"]),
("Peorth","amusement at a warriors' feast",[],[]),
("Eolh","marsh sedge and wounds",[],["plant"]),
("Sigel","sun guiding seafarers",[],[]),
("Tir","guiding star at night",[],["dots"]),
("Beorc","poplar branches and leaves",["tree"],["plant"]),
("Eh","horse",[],[]),
("Man","kinsmen, mortality and burial",["recumbent"],[]),
("Lagu","ocean, waves and boat",[],[]),
("Ing","hero, eastward departure and chariot",[],[]),
("Ethel","estate and home",[],[]),
("Daeg","daylight",[],[]),
("Ac","oak, acorns and seaworthiness",["tree"],["plant"]),
("Aesc","tall ash, sturdy trunk",["tree"],["plant"]),
("Yr","princely gear, travel and war",[],[]),
("Iar","river fish, land and water",[],[]),
("Ear","death, grave and decay",["recumbent"],[])]
assert len(FEATURES)==56 and len(THEMES)==29

def tags(desc):
    ret=set()
    if "tree" in desc or "rooted branch" in desc: ret.add("tree")
    if "tree" in ret or "rooted winged vines" in desc: ret.add("plant")
    if "recumbent human figure" in desc: ret.add("recumbent")
    if " dots" in desc: ret.add("dots")
    return ret

BY_PAGE={p:{"description":f,"tags":sorted(tags(f)),"id":i}
         for i,(p,f) in enumerate(zip(ORDER,FEATURES))}

def evaluate(offset, broad):
    units=[((2*i+offset)%56,(2*i+1+offset)%56) for i in range(28)]
    sets=[set(BY_PAGE[a]["tags"])|set(BY_PAGE[b]["tags"]) for a,b in units]
    wanted=[set(t[2])|(set(t[3]) if broad else set()) for t in THEMES[:28]]
    matrix=[[bool(x&y) for y in wanted] for x in sets]
    score=sum(matrix[i][i] for i in range(28))
    matches=[{"pair":list(units[i]),"stanza":THEMES[i][0],
              "tags":sorted(sets[i]&wanted[i])} for i in range(28) if matrix[i][i]]
    rng=random.Random(20261125)
    ids=list(range(28))
    counts=Counter()
    for _ in range(200000):
        rng.shuffle(ids)
        counts[sum(matrix[i][j] for i,j in enumerate(ids))]+=1
    return {"offset":offset,"broad":broad,"score":score,"matches":matches,
            "null_mean":sum(k*v for k,v in counts.items())/200000,
            "null_ge":sum(v for k,v in counts.items() if k>=score),
            "null_counts":dict(sorted(counts.items())),"n":200000,
            "rows":[{"pair":list(u),"stanza":THEMES[i][0],"tags":sorted(sets[i]),
                     "wanted":sorted(wanted[i]),"match":matrix[i][i]} for i,u in enumerate(units)]}

def main():
    results=[evaluate(o,b) for o in (0,1) for b in (False,True)]
    assert [(r["score"],r["null_ge"]) for r in results]==[(0,200000),(3,159984),(0,200000),(3,170993)]
    print(json.dumps({"pages":BY_PAGE,"themes":THEMES,"results":results},indent=2))

if __name__=="__main__":
    main()
