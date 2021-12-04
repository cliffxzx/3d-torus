# %%
import math
import numpy as np
import pandas as pd
import networkx as nx
import matplotlib
import matplotlib.pyplot as plt
import sklearn
import json
import scipy
import scipy.sparse as sp
from scipy.linalg import eigh
from sklearn.manifold import spectral_embedding
from sklearn import preprocessing

from mpl_toolkits.mplot3d import Axes3D

# %%
def calc_sym_renorm_mag_adj(dir_adj, g):
    n_vertex = dir_adj.shape[0]
    id = sp.csc_matrix(sp.identity(n_vertex))

    adj = dir_adj + dir_adj.T.multiply(dir_adj.T > dir_adj) - dir_adj.multiply(dir_adj.T > dir_adj)
    adj_ = adj + id

    row_sum = adj_.sum(axis=1).A1
    row_sum_inv_sqrt = np.power(row_sum, -0.5)
    row_sum_inv_sqrt[np.isinf(row_sum_inv_sqrt)] = 0.
    deg_inv_sqrt_ = sp.diags(row_sum_inv_sqrt)

    sym_renorm_adj = deg_inv_sqrt_.dot(adj_).dot(deg_inv_sqrt_)

    if g == 0:
        sym_renorm_mag_adj = sym_renorm_adj.toarray()
    else:
        trs = np.exp(1j * 2 * math.pi * g * (dir_adj - dir_adj.T).toarray())
        #trs = np.exp(1j * 2 * math.pi * g * (dir_adj.T - dir_adj).toarray())
        sym_renorm_mag_adj = np.multiply(sym_renorm_adj.toarray(), trs)
        sym_renorm_mag_adj = np.array(sym_renorm_mag_adj, dtype=np.complex64)

    return sym_renorm_mag_adj

# %%
dir_adj = np.genfromtxt('/home/jovyan/projects/3d-torus/examples/dir_adj.csv', delimiter=',')
dir_adj = sp.csc_matrix(dir_adj)

# %%
g = 1/3
sym_renorm_mag_adj = calc_sym_renorm_mag_adj(dir_adj, g)
sym_renorm_adj = calc_sym_renorm_mag_adj(dir_adj, 0)
w, v = scipy.linalg.eigh(sym_renorm_mag_adj)
Min_Max_Scaler = preprocessing.MinMaxScaler( feature_range=(0,1) )
Min_Max_Scaler03 = preprocessing.MinMaxScaler( feature_range=(0,3) )# 設定縮放的區間上下限
all_cos_sin = np.exp(1j * w)
all_cos = all_cos_sin.real.reshape(-1, 1)
all_sin = all_cos_sin.imag.reshape(-1, 1)
MM_cos = Min_Max_Scaler03.fit_transform(all_cos)
Pi_cos = MM_cos*2.*np.pi
MM_sin = Min_Max_Scaler03.fit_transform(all_sin)
Pi_sin = MM_sin*2.*np.pi
# %%
text = np.arange(0, Pi_cos.shape[0])[..., np.newaxis]
thetas = np.asarray(np.concatenate((Pi_sin, Pi_cos), axis=1).tolist() + [None])[:-1][..., np.newaxis]
color = np.repeat(0x0000ff, Pi_cos.shape[0])[..., np.newaxis]
r = np.repeat(5, Pi_cos.shape[0])[..., np.newaxis]
opacity = np.repeat(0.65, Pi_cos.shape[0])[..., np.newaxis]
size = np.repeat(0.3, Pi_cos.shape[0])[..., np.newaxis]

data = np.concatenate((thetas, r, size, color, opacity, text), axis=1)
data_json = json.dumps(data.tolist())

with open("example.json", "w") as f:
    f.write(data_json);

# %%
