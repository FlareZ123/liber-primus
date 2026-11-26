"""Search all periodic shifts with exact historical F-hold, independent blocks."""
import concurrent.futures, hashlib, json, pathlib, subprocess, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(sys.argv[1])
OUT.mkdir(parents=True,exist_ok=True)
exe=pathlib.Path(sys.argv[2]).resolve()
q=int(sys.argv[3])
corpus=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf8'))
C=[x for p in corpus['pages'][:56] for x in p['indices']]
assert len(C)==12956
(OUT/'original-all.csv').write_text(','.join(map(str,C)),encoding='ascii')
def split(start,end):
 if C[start:end].count(0)<=12:return [(start,end)]
 mid=(start+end)//2
 return split(start,mid)+split(mid,end)
blocks=[]
for start in range(0,len(C),179):
 blocks.extend(split(start,min(start+179,len(C))))
assert sum(b-a for a,b in blocks)==len(C)
def search(ab):
 a,b=ab
 v=subprocess.run([str(exe),str(OUT/'model.bin'),str(OUT/'original-all.csv'),str(q),str(a),str(b-a),'1','0'],check=True,capture_output=True,text=True).stdout
 print(v.splitlines()[0],flush=True)
 return {'start':a,'end':b,'raw':v}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 rows=list(pool.map(search,blocks))
data={'period':q,'cipher_sha256':hashlib.sha256(bytes(C)).hexdigest(),'model_sha256':hashlib.sha256((OUT/'model.bin').read_bytes()).hexdigest(),'rows':rows}
(OUT/f'period-{q}.json').write_text(json.dumps(data,indent=2),encoding='utf8')
