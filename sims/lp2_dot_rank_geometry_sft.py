"""Source-only geometry rank test. Requires numpy, scipy, opencv-python.
Run: python sims/lp2_dot_rank_geometry_sft.py [PATH_TO_75_JPEGS] [--output path.json]
No ciphertext, key or language model is used.
"""
import argparse
from collections import Counter
from pathlib import Path
import json
import cv2
import numpy as np
from scipy.optimize import linprog
from scipy.spatial import cKDTree
from scipy.spatial.distance import pdist


def clusters(image, color):
    b, g, r = (a.astype(np.int16) for a in cv2.split(image))
    mask = ((r-g > 60) & (r-b > 60)) if color == 'red' else ((r < 100) & (g < 100) & (b < 100))
    _, _, s, c = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
    keep = ((s[:,4] >= 36) & (s[:,4] <= 180) & (s[:,2] >= 6) & (s[:,2] <= 15)
            & (s[:,3] >= 6) & (s[:,3] <= 15) & (s[:,4] >= .70*s[:,2]*s[:,3]))
    c, s = c[keep], s[keep]
    if not len(c):
        return []
    parents = list(range(len(c)))
    def root(i):
        while parents[i] != i:
            i = parents[i]
        return i
    for i,j in cKDTree(c).query_pairs(24):
        parents[root(i)] = root(j)
    groups = {}
    for i in range(len(c)):
        groups.setdefault(root(i), []).append(i)
    return [(c[ids], s[ids]) for ids in groups.values()]


def ordered(c):
    c = np.asarray(c)
    column = np.rint((c[:,0]-c[:,0].min()) / 15)
    return c[np.lexsort((c[:,1], column))], tuple(int(sum(column == i)) for i in np.unique(column))


def common_translation_error(a):
    # Minimize epsilon over a shared continuous stencil q and per-instance translation t.
    # |observed[i,j] - t[i] - q[j]| <= epsilon. No rotation, scaling or permutations.
    M,N,_ = a.shape
    out = []
    for d in range(2):
        A, b = [], []
        for i in range(M):
            for j in range(N):
                row = np.zeros(M+N+1)
                row[i] = row[M+j] = 1
                row[-1] = -1
                A.append(row.copy()); b.append(a[i,j,d])
                row *= -1; row[-1] = -1
                A.append(row); b.append(-a[i,j,d])
        cost = np.zeros(M+N+1); cost[-1] = 1
        result = linprog(cost, A_ub=A, b_ub=b, bounds=[(0,0)]+[(None,None)]*(M+N-1)+[(0,None)], method='highs')
        assert result.success
        assert np.max(np.abs(a[:,:,d]-result.x[:M,None]-result.x[None,M:M+N])) <= result.fun+1e-7
        out.append(float(result.fun))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('images', type=Path, nargs='?', default=Path(__file__).resolve().parents[1]/'resources'/'liber-primus')
    ap.add_argument('--output', type=Path)
    args = ap.parse_args()
    cv2.setNumThreads(1)
    marks, background = [], Counter()
    for p in range(58):
        im = cv2.imread(str(args.images/f'{p+17:02}.jpg'))
        assert im.shape == (3600,2400,3)
        for color in ('red','black'):
            for c,s in clusters(im,color):
                if len(c) >= 8:
                    z, columns = ordered(c)
                    marks.append(dict(page=p,color=color,count=len(c),centroids=c.tolist(),components=s.tolist(),columns=columns))
                else:
                    background[(color,len(c))] += 1
    counts = Counter((m['color'],m['count']) for m in marks)
    assert counts == Counter({('red',13):30,('black',13):1,('red',10):4,('red',23):1})
    assert len(marks) == 36
    by_count = {}
    for k,columns in ((10,(3,4,3)),(13,(4,5,4))):
        group = [m for m in marks if m['count']==k]
        assert all(m['columns']==columns for m in group)
        a = np.array([ordered(m['centroids'])[0] for m in group])
        ref = ordered(next(m['centroids'] for m in group if m['page']==56))[0]
        centered = a-a.mean(axis=1,keepdims=True)
        ref_centered = ref-ref.mean(axis=0)
        err = np.linalg.norm(centered-ref_centered,axis=2).max(axis=1)
        assert err.max() < .75
        # Normalizing isotropic scale by vertical extent gives a second comparison.
        scaled = centered / np.ptp(a[:,:,1],axis=1)[:,None,None] * np.ptp(ref[:,1])
        scaled_err = np.linalg.norm(scaled-ref_centered,axis=2).max(axis=1)
        # Distances are translation invariant. If each point differs <= .75px,
        # each difference between two pairwise distances differs <=3px.
        distances = np.array([pdist(z) for z in a]); ref_d = pdist(ref)
        i,j = np.triu_indices(len(ref_d),1)
        delta = ref_d[i]-ref_d[j]; robust = abs(delta)>3
        flips = np.sign(distances[:,i]-distances[:,j]) != np.sign(delta)[None,:]
        assert not np.any(flips[:,robust])
        # Perturb one point by 4px: a changed stencil must fail this reference gate.
        moved = ref.copy(); moved[0,1] += 4
        moved -= moved.mean(axis=0)
        assert np.linalg.norm(moved-ref_centered,axis=1).max()>3
        fit = common_translation_error(a)
        assert max(fit)<.5
        by_count[k] = dict(instances=len(group),columns=columns,reference_page=56,max_translated_error_px=float(err.max()),
                          max_translation_scale_error_px=float(scaled_err.max()),minimax_axis_translation_error_px=fit,
                          distance_comparisons=len(i),robust_comparisons=int(robust.sum()),robust_flips=int(np.any(flips[:,robust],axis=0).sum()),
                          all_changed_comparisons=int(np.any(flips,axis=0).sum()))
    # p57's terminal shape: extend the 13-dot stencil by two copies of the inner column.
    # Freeze p56 geometry and a 15px column pitch; preserve vertical layout.
    p56 = ordered(next(m['centroids'] for m in marks if m['page']==56 and m['count']==13))[0]
    q = p56-p56.min(axis=0); left,inner,right = q[:4],q[4:9],q[9:]
    predicted = np.concatenate([left,inner,inner+[15,0],inner+[30,0],right+[30,0]])
    terminal = next(m for m in marks if m['count']==23)
    assert terminal['page']==57 and terminal['columns']==(4,5,5,5,4)
    observed = ordered(terminal['centroids'])[0]
    pred_error = float(np.linalg.norm((observed-observed.mean(axis=0))-(predicted-predicted.mean(axis=0)),axis=1).max())
    assert pred_error < 1
    result = dict(marks=marks,nonlarge_clusters={f'{c}:{k}':v for (c,k),v in sorted(background.items())},
                  by_count=by_count,p57_23_extension_max_error_px=pred_error)
    print(json.dumps({k:v for k,v in result.items() if k!='marks'},indent=2))
    if args.output:
        args.output.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')


if __name__=='__main__':
    main()
