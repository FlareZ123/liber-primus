"""Original-page GIMP Dissolve source reconstruction on a multiscale native grid.

Run: python sims/lp2_p57_gimp_multiscale_source_sft.py
Needs NumPy, SciPy, Pillow, GLib2 and the existing original-source SFT beside
this file. Fits only the previous 80% training native cells. Writes no files.
"""
from __future__ import annotations

import time
import numpy as np
from scipy.ndimage import gaussian_filter, map_coordinates
from scipy.optimize import minimize
from scipy.special import expit
import lp2_p57_gimp_curved_holdout_original_sft as prior


def stats(actual, pred, mask):
    tp = int((actual & pred & mask).sum())
    fp = int((~actual & pred & mask).sum())
    fn = int((actual & ~pred & mask).sum())
    return tp, fp, fn, 2 * tp / (2 * tp + fp + fn)


def stage(X, Y, actual, held, random_field, gray, base_x, base_y,
          base_gain, grid, spread, xy_scale, gain_scale, sigma, maxiter):
    u = (X - 288) / 115
    v = (Y - 620) / 131
    centers = np.linspace(-1.05, 1.05, grid) if grid == 8 else (
        np.linspace(-1.1, 1.1, grid) if grid == 12 else
        np.linspace(-0.96, 0.96, grid))
    basis = np.stack([
        np.exp(-((u - cu)**2 + (v - cv)**2) / spread**2)
        for cu in centers for cv in centers
    ], axis=-1).astype("float32")
    n = basis.shape[-1]
    scales = np.r_[np.full(n, xy_scale), np.full(n, xy_scale),
                   np.full(n, gain_scale)]
    training = ~held
    basis_train = basis[training]
    target = actual[training].astype(float)
    threshold = random_field[training].astype(float)
    source = gaussian_filter(gray, sigma) if sigma else gray

    def forward(vector, derivative):
        d = vector * scales
        xx = base_x + basis @ d[:n]
        yy = base_y + basis @ d[n:2*n]
        gain = base_gain * np.exp(basis @ d[2*n:])
        value = map_coordinates(source, [yy, xx], order=1,
                                mode="nearest", prefilter=False)
        unbounded = gain * (255 - value)
        alpha = np.clip(unbounded, 0, 255)
        if not derivative:
            return alpha, xx, yy, gain
        ix = np.floor(xx).astype(int)
        iy = np.floor(yy).astype(int)
        fx, fy = xx - ix, yy - iy
        p00 = source[iy, ix]
        p10 = source[iy, ix + 1]
        p01 = source[iy + 1, ix]
        p11 = source[iy + 1, ix + 1]
        derivative_x = (1-fy)*(p10-p00) + fy*(p11-p01)
        derivative_y = (1-fx)*(p01-p00) + fx*(p11-p10)
        return alpha, unbounded, gain, derivative_x, derivative_y

    penalty = 0.75 if grid == 4 else 1.0 if grid == 8 else 1.8

    def objective(vector):
        alpha, unbounded, gain, dx, dy = forward(vector, True)
        logits = (alpha[training] - threshold) / 2.3
        loss = np.logaddexp(0, logits).sum() - (target*logits).sum()
        loss += penalty * (vector @ vector)
        slope = (expit(logits) - target) / 2.3
        slope *= (unbounded[training] < 255)
        gradient = np.r_[
            (-slope * gain[training] * dx[training]) @ basis_train,
            (-slope * gain[training] * dy[training]) @ basis_train,
            (slope * alpha[training]) @ basis_train,
        ] * scales + 2 * penalty * vector
        return float(loss), gradient

    result = minimize(objective, np.zeros(n*3), jac=True,
                      method="L-BFGS-B", bounds=[(-1.5, 1.5)] * (n*3),
                      options={"maxiter": maxiter, "ftol": 1e-9})
    alpha, xx, yy, gain = forward(result.x, False)
    prediction = random_field < alpha
    print(f"{grid}x{grid} sigma={sigma}: n={3*n} iterations={result.nit} "
          f"loss={result.fun:.3f} errors={int((prediction!=actual).sum())} "
          f"train={stats(actual,prediction,training)} "
          f"held={stats(actual,prediction,held)}", flush=True)
    return xx, yy, gain


def main():
    t0 = time.time()
    field = prior.gimp_field()
    actual, held, X, Y = prior.native_p57()
    image = prior.read_image(41)
    cx, cy, ax, bx, by, ay, gain0 = prior.BASE
    x = cx + ax*(X-288) + bx*(Y-546)
    y = cy + by*(X-288) + ay*(Y-546)
    u, v = (X-288)/115, (Y-620)/131
    monomials = [u*u, u*v, v*v, u*u*u, u*u*v, u*v*v, v*v*v]
    gains = [u, v, u*u, u*v, v*v]
    x += sum(prior.CURVE[i]*z for i, z in enumerate(monomials))
    y += sum(prior.CURVE[i+7]*z for i, z in enumerate(monomials))
    gain = gain0 * np.maximum(.12, 1 + sum(
        prior.CURVE[i+14]*z for i, z in enumerate(gains)))

    x, y, gain = stage(X,Y,actual,held,field,image,x,y,gain,
                       4,.62,6.,.16,1.2,100)
    x, y, gain = stage(X,Y,actual,held,field,image,x,y,gain,
                       8,.34,2.5,.10,0.,260)
    x, y, gain = stage(X,Y,actual,held,field,image,x,y,gain,
                       12,.24,1.5,.08,0.,45)
    final_alpha = np.clip(gain*(255-map_coordinates(image,[y,x],
                          order=1,mode="nearest",prefilter=False)),0,255)
    prediction = field < final_alpha
    train = stats(actual,prediction,~held)
    test = stats(actual,prediction,held)
    print("FINAL", train, test, "all_errors",
          int((prediction!=actual).sum()), "seconds", round(time.time()-t0,2))
    assert test[3] > .90, "historical source model lost holdout sensitivity"
    assert int((prediction!=actual).sum()) < 400


if __name__ == "__main__":
    main()
