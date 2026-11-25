"""Full-bank leave-one-in control for the Agent43 font-slot gate.
Usage: python sims/agent43_font_leavein.py font-slot-results.json out.json
The original run's font paths must exist on the host.
"""
import concurrent.futures as cf
import json, hashlib, sys
from pathlib import Path
from agent43_lp2_font_slot_match import render, coarse, refine, plant

def test(path, P):
    gs=render(path)
    v,_=coarse(P,gs) if gs else (None,[])
    return {"font":Path(path).name,"sha256":hashlib.sha256(Path(path).read_bytes()).hexdigest(),"score":v[0] if v else None,"v":v}

def main():
    x=json.loads(Path(sys.argv[1]).read_text())
    paths=[z["path"] for z in x["ranked_coarse"]]
    out=[]
    for ctrl in x["controls"]:
        path=next(z["path"] for z in x["ranked_coarse"] if z["font"]==ctrl["font"])
        P=plant(path,ctrl["planted_ids"],.83)
        with cf.ProcessPoolExecutor(max_workers=6) as e:
            rows=list(e.map(test,paths,[P]*len(paths),chunksize=4))
        rows.sort(key=lambda z:z["score"] if z["score"] is not None else 999)
        target=next(z for z in rows if z["font"]==ctrl["font"])
        rank=rows.index(target)+1
        top=rows[:5]+([target] if rank>5 else [])
        for z in top:
            gs=render(next(p for p in paths if Path(p).name==z["font"]))
            v=refine(P,gs,z["v"])
            z["refined_score"]=v[0]
            z["refined_v"]=v
        top.sort(key=lambda z:z["refined_score"])
        out.append({"plant":ctrl["font"],"coarse_rank":rank,"coarse_count":len(rows),"top_refined":top,"all_coarse":[{"font":z["font"],"sha256":z["sha256"],"score":z["score"]} for z in rows]})
        print(ctrl["font"],rank,[(z["font"],z["refined_score"]) for z in top],flush=True)
        Path(sys.argv[2]).write_text(json.dumps(out,indent=2))
if __name__=="__main__":
    main()
