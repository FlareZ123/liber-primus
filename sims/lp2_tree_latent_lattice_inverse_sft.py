"""Reconstruct the shared low-resolution tree artwork; no rune decoder inferred."""
import argparse
import io
import json
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, gaussian_filter, label, shift
from scipy.optimize import minimize


def source_image(name, box, archive):
    if archive:
        with zipfile.ZipFile(archive) as z:
            im = Image.open(io.BytesIO(z.read(f"liber-primus-jpegs/{name}.jpg")))
    else:
        im = Image.open(Path("resources/liber-primus") / f"{name}.jpg")
    return 255.0 - np.asarray(im.convert("L").crop(box))


def latent(image):
    indexes, diagnostics = [], []
    cut = int(image.shape[0] * .67)
    for axis, size in enumerate(image.shape):
        d = np.abs(np.diff(image, axis=axis))
        train_rows = np.arange(d.shape[0])[:, None] >= cut
        train = np.where(train_rows, d, 0).sum(axis=1-axis)
        test = np.where(~train_rows, d, 0).sum(axis=1-axis)
        candidates = []
        for phase in range(50):
            idx = (np.arange(size) * 9 + phase) // 50
            boundary = np.diff(idx) > 0
            candidates.append((train[boundary].sum()/train.sum(), phase,
                               test[boundary].sum()/test.sum()))
        train_score, phase, test_score = max(candidates)
        indexes.append((np.arange(size) * 9 + phase) // 50)
        diagnostics.append(dict(phase=phase, train_fraction=train_score,
                                crown_fraction=test_score))
    yy, xx = indexes
    raster = np.zeros((yy[-1]+1, xx[-1]+1))
    for y in range(raster.shape[0]):
        for x in range(raster.shape[1]):
            raster[y, x] = np.median(image[np.ix_(yy == y, xx == x)])
    expanded = raster[yy[:, None], xx]
    diagnostics = dict(axes=diagnostics, shape=list(raster.shape),
                       pixel_rmse=float(np.sqrt(np.mean((image-expanded)**2))))
    return raster, diagnostics


def fit_trunk(mask, target):
    # Fit only the vertical trunk, never the root or crown.
    train = target[170:190, 75:135]
    best = None
    for sigma in np.arange(3, 8.01, .25):
        z = gaussian_filter(mask.astype(float), sigma, mode="constant")
        for dy in range(16):
            for dx in range(-8, 6):
                a = z[170-dy:190-dy, 75-dx:135-dx]
                gain = (a*train).sum()/(a*a).sum()
                rmse = np.sqrt(np.mean((gain*a-train)**2))
                if best is None or rmse < best[0]:
                    best = (rmse, dy, dx, sigma, gain)
    rmse, dy, dx, sigma, gain = best
    prediction = shift(gaussian_filter(mask.astype(float), sigma, mode="constant"),
                       (dy, dx), order=0, prefilter=False, mode="constant") * gain
    def metrics(s):
        a, b = target[s], prediction[s]
        return dict(rmse=float(np.sqrt(np.mean((a-b)**2))),
                    correlation=float(np.corrcoef(a.ravel(), b.ravel())[0, 1]))
    return dict(train_rmse=float(rmse), dy=dy, dx=dx, sigma=float(sigma), gain=float(gain),
                root=metrics(np.s_[194:230, 65:140]), crown=metrics(np.s_[30:150, 20:230]))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", type=Path)
    args = parser.parse_args()
    a, da = latent(source_image("49", (650,2070,1810,3230), args.zip))
    b, db = latent(source_image("72", (625,1430,1735,2510), args.zip))
    p = np.pad(a, ((20,20),(20,20)))
    q = np.pad(b, ((20,35),(20,30)))
    assert p.shape == q.shape == (250,250)
    assert [d["phase"] for d in da["axes"]] == [45,22]
    assert [d["phase"] for d in db["axes"]] == [26,2]
    # Outline support (nominal black at 25% opacity); label free-space regions.
    lab, _ = label(q <= 15)
    counts = np.bincount(lab.ravel())
    order = np.argsort(counts[1:])[::-1]+1
    interior = lab == order[1]
    exterior = (lab != 0) & ~interior
    edge = lab == 0
    d1 = distance_transform_edt(~interior)
    d0 = distance_transform_edt(~exterior)
    nearest = np.where(d0 > d1, 1., np.where(d0 == d1, .5, 0.))
    nearest[interior] = 1
    nearest[exterior] = 0
    models = {
        "fill_all": lab != order[0],
        "interior_plus_edge": interior | edge,
        "nearest_side": nearest,
        "nearest_plus_thin_0.125": np.maximum(nearest, np.where(edge, .125*q/64, 0)),
        "nearest_plus_thin_0.25": np.maximum(nearest, np.where(edge, .25*q/64, 0)),
        "nearest_plus_thin_0.5": np.maximum(nearest, np.where(edge, .5*q/64, 0)),
    }
    predictions = {name: fit_trunk(m,p) for name,m in models.items()}
    # Fit a compatible shared master: not an independent root/crown prediction.
    # Global alignment/sigma from the trunk above, use physical 0..255 gain.
    target = shift(p, (-6,1), order=0, prefilter=False, mode="constant")/255
    def blur(x):
        return gaussian_filter(x, 5, mode="constant")
    initial = models["nearest_plus_thin_0.5"]
    fixed = initial.copy()
    fixed[edge] = 0
    offset = blur(fixed)-target
    def fun(x):
        m = np.zeros_like(p)
        m[edge] = x
        delta = blur(m)+offset
        return (delta*delta).sum()/2, blur(delta)[edge]
    fit = minimize(fun, initial[edge], jac=True, method="L-BFGS-B",
                   bounds=[(0,1)]*int(edge.sum()),
                   options=dict(maxiter=250, ftol=1e-11, gtol=1e-7, maxcor=10))
    master = fixed.copy()
    master[edge] = fit.x
    residual = blur(master)-target
    # Explicit counterexample to exact master identifiability.
    alt = master.copy()
    blocks = 0
    for y in range(0, len(master)-1, 2):
        for x in range(0, master.shape[1]-1, 2):
            a = master[y:y+2,x:x+2]
            if np.all(edge[y:y+2,x:x+2]) and np.all((a>.1)&(a<.9)):
                alt[y:y+2,x:x+2] += .1*np.array([[1,-1],[-1,1]])
                blocks += 1
    rms = lambda x: float(np.sqrt(np.mean(x*x))*255)
    output = dict(lattice={"p32":da,"p55":db}, outline_cells=int(edge.sum()),
                  trunk_selected=predictions,
                  compatible_master=dict(iterations=int(fit.nit),
                                         optimizer_success=bool(fit.success),
                                         rmse=rms(residual),
                                         crown_rmse=rms(residual[24:144,20:230]),
                                         maximum_error=float(np.abs(residual).max()*255),
                                         alternative_blocks=blocks,
                                         alternative_cells=int(np.count_nonzero(alt!=master)),
                                         alternative_master_rmse=rms(alt-master),
                                         alternative_blur_rmse=rms(blur(alt)-blur(master)),
                                         alternative_fit_rmse=rms(blur(alt)-target)))
    assert predictions["nearest_plus_thin_0.125"]["root"]["rmse"] < 1
    assert output["compatible_master"]["rmse"] < .35
    assert output["compatible_master"]["alternative_cells"] > 1000
    assert output["compatible_master"]["alternative_blur_rmse"] < .01
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
