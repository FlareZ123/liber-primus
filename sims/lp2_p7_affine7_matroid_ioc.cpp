#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <iomanip>
#include <numeric>
#include <queue>
#include <random>
#include <string>
#include <tuple>
#include <vector>
#include <omp.h>
#ifdef __AVX2__
#include <immintrin.h>
#endif
using namespace std;
using K=array<int,7>;using V=vector<int>;using M=array<K,7>;
constexpr int Q=29,B=29*29*29,TOP=4096,AF=16;
int mod(int x){x%=29;return x<0?x+29:x;}int inv[29];
K normalize(K k){for(int x:k)if(x){for(int&v:k)v=v*inv[x]%29;return k;}return k;}
int at(int g,int t,int G,bool lane){return lane?t*G+g:7*g+t;}
struct Candidate{int w;K k;};bool better(const Candidate&a,const Candidate&b){return a.w>b.w||(a.w==b.w&&a.k<b.k);}struct HeapCmp{bool operator()(const Candidate&a,const Candidate&b)const{return better(a,b);}};
// Greedy maximum-weight basis. Basis of every score-prefix is preserved by a local optimum.
vector<Candidate> greedy(vector<Candidate> v){sort(v.begin(),v.end(),better);array<K,7> row{};vector<Candidate> out;for(auto&a:v){K k=a.k;for(int j=0;j<7;j++)if(k[j]){if(row[j][j]){int x=k[j];for(int t=j;t<7;t++)k[t]=mod(k[t]-x*row[j][t]);}else{int x=inv[k[j]];for(int t=j;t<7;t++)k[t]=k[t]*x%29;row[j]=k;out.push_back(a);break;}}if(out.size()==7)break;}return out;}
M inverse(M a){M b{};for(int i=0;i<7;i++)b[i][i]=1;for(int j=0;j<7;j++){int r=j;while(r<7&&!a[r][j])r++;if(r==7)return {};swap(a[j],a[r]);swap(b[j],b[r]);int u=inv[a[j][j]];for(int t=0;t<7;t++){a[j][t]=mod(a[j][t]*u);b[j][t]=mod(b[j][t]*u);}for(int i=0;i<7;i++)if(i!=j){int f=a[i][j];for(int t=0;t<7;t++){a[i][t]=mod(a[i][t]-f*a[j][t]);b[i][t]=mod(b[i][t]-f*b[j][t]);}}}return b;}
V decode(const V&c,const M&k,const K&b,bool lane){int G=c.size()/7;V p(c.size());for(int g=0;g<G;g++)for(int t=0;t<7;t++){int s=b[t];for(int j=0;j<7;j++)s+=k[t][j]*c[at(g,j,G,lane)];p[at(g,t,G,lane)]=mod(s);}return p;}
V encode(const V&p,const M&k,const K&b,bool lane){M m=inverse(k);assert(m!=M{});int G=p.size()/7;V c(p.size());for(int g=0;g<G;g++)for(int t=0;t<7;t++){int s=0;for(int j=0;j<7;j++)s+=m[t][j]*(p[at(g,j,G,lane)]-b[j]);c[at(g,t,G,lane)]=mod(s);}return c;}
struct Tables{int n,S;vector<uint8_t>L,R;vector<K> left,right;Tables(const V&c,bool lane,int train):n(train),S((n+31)&~31){int G=c.size()/7;for(int a=0;a<Q;a++)for(int b=0;b<Q;b++)for(int d=0;d<Q;d++)left.push_back({1,a,b,d,0,0,0});for(int b=0;b<Q;b++)for(int d=0;d<Q;d++)left.push_back({0,1,b,d,0,0,0});for(int d=0;d<Q;d++)left.push_back({0,0,1,d,0,0,0});left.push_back({0,0,0,1,0,0,0});left.push_back({0,0,0,0,0,0,0});for(int a=0;a<Q;a++)for(int b=0;b<Q;b++)for(int d=0;d<Q;d++)right.push_back({0,0,0,0,a,b,d});L.resize(size_t(left.size())*S);R.resize(size_t(B)*S);for(int l=0;l<(int)left.size();l++)for(int g=0;g<n;g++){int x=0;for(int j=0;j<4;j++)x+=left[l][j]*c[at(g,j,G,lane)];L[size_t(l)*S+g]=x%29;}for(int r=0;r<B;r++)for(int g=0;g<n;g++){int x=0;for(int j=4;j<7;j++)x+=right[r][j]*c[at(g,j,G,lane)];R[size_t(r)*S+g]=x%29;}}
 int score(int l,int r)const{const uint8_t*a=&L[size_t(l)*S],*b=&R[size_t(r)*S];alignas(32) uint8_t temp[4096];assert(S<=4096);
#ifdef __AVX2__
 const auto z=_mm256_set1_epi8(29);for(int i=0;i<S;i+=32){auto x=_mm256_add_epi8(_mm256_loadu_si256((const __m256i*)(a+i)),_mm256_loadu_si256((const __m256i*)(b+i)));x=_mm256_min_epu8(x,_mm256_sub_epi8(x,z));_mm256_store_si256((__m256i*)(temp+i),x);}
#else
 for(int i=0;i<n;i++){int x=a[i]+b[i];temp[i]=x>=29?x-29:x;}
#endif
 int h[4][32]{};int i=0;for(;i+3<n;i+=4){h[0][temp[i]]++;h[1][temp[i+1]]++;h[2][temp[i+2]]++;h[3][temp[i+3]]++;}for(;i<n;i++)h[0][temp[i]]++;int s=0;for(int j=0;j<Q;j++){int x=h[0][j]+h[1][j]+h[2][j]+h[3][j];s+=x*(x-1);}return s;}
};
struct Scan{vector<Candidate> basis,top;};
Scan scan(const Tables&T){vector<Candidate> all,top;long long n=0;
#pragma omp parallel reduction(+:n)
 {vector<Candidate> basis;priority_queue<Candidate,vector<Candidate>,HeapCmp> heap;
#pragma omp for schedule(dynamic,16)
 for(int l=0;l<(int)T.left.size();l++){for(int r=0;r<B;r++){if(l==(int)T.left.size()-1){auto k=T.right[r];if(k==K{}||normalize(k)!=k)continue;}n++;int w=T.score(l,r);if(basis.size()==7&&heap.size()==TOP&&w<basis.back().w&&w<heap.top().w)continue;K k=T.left[l];for(int j=4;j<7;j++)k[j]=T.right[r][j];Candidate a{w,k};if(basis.size()<7||better(a,basis.back())){basis.push_back(a);basis=greedy(basis);}if(heap.size()<TOP)heap.push(a);else if(better(a,heap.top())){heap.pop();heap.push(a);}}}
#pragma omp critical
 {all.insert(all.end(),basis.begin(),basis.end());while(!heap.empty()){top.push_back(heap.top());heap.pop();}}}
 cout<<"projective="<<n<<"\n";assert(n==616067011);sort(top.begin(),top.end(),better);top.resize(TOP);auto basis=greedy(all);assert(basis.size()==7);return {basis,top};}
struct LM{double u[29]{},bi[29][29]{},tri[29][29][29]{};LM(const vector<V>&ss){double c[29]{},d[29][29]{},e[29][29][29]{},n=0;for(auto&s:ss)for(int i=0;i<(int)s.size();i++){int x=s[i];c[x]++;n++;if(i)d[s[i-1]][x]++;if(i>1)e[s[i-2]][s[i-1]][x]++;}double p[29],pb[29][29];for(int x=0;x<Q;x++){p[x]=(c[x]+.5)/(n+14.5);u[x]=log(p[x]*29);}for(int a=0;a<Q;a++){double N=accumulate(d[a],d[a]+Q,0.0);for(int x=0;x<Q;x++){pb[a][x]=(d[a][x]+8*p[x])/(N+8);bi[a][x]=log(pb[a][x]*29);}}for(int a=0;a<Q;a++)for(int b=0;b<Q;b++){double N=accumulate(e[a][b],e[a][b]+Q,0.0);for(int x=0;x<Q;x++)tri[a][b][x]=log((e[a][b][x]+12*pb[b][x])/(N+12)*29);}}
 double score(const V&p,int G,int train,bool lane,bool fit)const{double s=0;int n=0;auto take=[&](int i){return ((lane?i%G:i/7)<train)==fit;};for(int i=0;i<(int)p.size();i++)if(take(i)){n++;int x=p[i];if(i>1&&take(i-1)&&take(i-2))s+=tri[p[i-2]][p[i-1]][x];else if(i&&take(i-1))s+=bi[p[i-1]][x];else s+=u[x];}return s/n;}};
struct Choice{double score;int a,b;V v;};struct Dir{K k;vector<Choice> aff;};
vector<Dir> selectDirs(const V&c,bool lane,int train,const vector<Candidate>&cand,const LM&lm){int G=c.size()/7;vector<Dir> ds(cand.size());
#pragma omp parallel for schedule(dynamic,8)
 for(int i=0;i<(int)cand.size();i++){auto k=cand[i].k;V v(G);int h[29]{};for(int g=0;g<G;g++){int s=0;for(int j=0;j<7;j++)s+=k[j]*c[at(g,j,G,lane)];v[g]=s%29;if(g<train)h[v[g]]++;}vector<tuple<double,int,int>> q;for(int a=1;a<Q;a++)for(int b=0;b<Q;b++){double s=0;if(!lane){for(int x=0;x<Q;x++)s+=h[x]*lm.u[(a*x+b)%Q];}else{int x=(a*v[0]+b)%29,y=(a*v[1]+b)%29;s=lm.u[x]+lm.bi[x][y];for(int g=2;g<train;g++){int z=(a*v[g]+b)%29;s+=lm.tri[x][y][z];x=y;y=z;}}q.emplace_back(s,a,b);}partial_sort(q.begin(),q.begin()+AF,q.end(),greater<>());Dir d{k,{}};for(int j=0;j<AF;j++){auto[s,a,b]=q[j];V w(G);for(int g=0;g<G;g++)w[g]=(a*v[g]+b)%29;d.aff.push_back({s,a,b,move(w)});}ds[i]=move(d);}
 sort(ds.begin(),ds.end(),[](auto&a,auto&b){return a.aff[0].score>b.aff[0].score||(a.aff[0].score==b.aff[0].score&&a.k<b.k);});vector<Dir> sel;vector<Candidate> basis;for(auto&d:ds){auto a=basis;a.push_back({0,d.k});if(greedy(a).size()>basis.size()){basis.push_back({0,d.k});sel.push_back(move(d));if(sel.size()==7)break;}}assert(sel.size()==7);return sel;}
// Exact bigram Hamiltonian path on seven independent rows, with a next-group seam.
vector<int> orderRows(const vector<Dir>&d,int train,const LM&lm){int N=7*AF;vector<vector<double>> same(N,vector<double>(N)),cross=same;for(int i=0;i<N;i++)for(int j=0;j<N;j++)if(i/AF!=j/AF){auto&a=d[i/AF].aff[i%AF].v;auto&b=d[j/AF].aff[j%AF].v;for(int g=0;g<train;g++)same[i][j]+=lm.bi[a[g]][b[g]];for(int g=1;g<train;g++)cross[i][j]+=lm.bi[a[g-1]][b[g]];}
 double best=-1e99;vector<int> path;for(int start=0;start<N;start++){vector<double> dp(128*N,-1e99);vector<int> prev(128*N,-1);int mask0=1<<(start/AF);dp[mask0*N+start]=lm.u[d[start/AF].aff[start%AF].v[0]];for(int mask=1;mask<128;mask++)if(mask&mask0)for(int i=0;i<N;i++)if(dp[mask*N+i]>-1e98)for(int j=0;j<N;j++)if(!(mask&(1<<(j/AF)))){int nm=mask|(1<<(j/AF)),idx=nm*N+j;double s=dp[mask*N+i]+same[i][j];if(s>dp[idx]){dp[idx]=s;prev[idx]=i;}}for(int last=0;last<N;last++){double s=dp[127*N+last]+cross[last][start];if(s>best){best=s;path.clear();int mask=127,i=last;while(i>=0){path.push_back(i);int p=prev[mask*N+i];mask^=1<<(i/AF);i=p;}reverse(path.begin(),path.end());}}}assert(path.size()==7);return path;}
int paircount(const V&p,int G,int train,bool lane){int total=0;for(int t=0;t<7;t++){int h[29]{};for(int g=0;g<train;g++)h[p[at(g,t,G,lane)]]++;for(int x:h)total+=x*(x-1);}return total;}
uint32_t hashv(const V&v){uint32_t h=2166136261u;for(int x:v)h=(h^uint32_t(x))*16777619u;return h;}
void printk(K k){for(int x:k)cout<<x<<",";}
int main(int argc,char**argv){assert(argc==4);for(int a=1;a<Q;a++)for(int b=1;b<Q;b++)if(a*b%Q==1)inv[a]=b;ifstream in(argv[1]);assert(in);vector<V> src;string s;while(in>>s){V v;for(char x:s){int d=x>='a'?x-'a'+10:x-'0';assert(d>=0&&d<Q);v.push_back(d);}src.push_back(move(v));}assert(src.size()==10);const uint32_t hashes[]={1603621047u,798070602u,954790970u,2234481871u,800926877u,3128993256u,3724526490u,1105541379u,760315280u,2331769834u};const int sizes[]={1729,184,515,157,780,755,319,89,85,95};for(int i=0;i<10;i++)assert(src[i].size()==sizes[i]&&hashv(src[i])==hashes[i]);bool lane=string(argv[2])=="lanes",plant=string(argv[3])=="plant";assert(lane||string(argv[2])=="groups");assert(plant||string(argv[3])=="original");V c=src[0],p;vector<V> lmsec;M truth{};K tb{};for(int j=1;j<10;j++){bool a=(j==2||j==4||j==6);bool donor=lane?!a:a;if(plant&&donor)p.insert(p.end(),src[j].begin(),src[j].end());else lmsec.push_back(src[j]);}if(plant){p.resize(p.size()/7*7);mt19937 rng(lane?460741:460740);do{for(auto&r:truth)for(int&x:r)x=rng()%29;}while(inverse(truth)==M{});for(int&x:tb)x=rng()%29;c=encode(p,truth,tb,lane);assert(decode(c,truth,tb,lane)==p);}int G=c.size()/7,train=G*65/100;cout<<"mode="<<argv[2]<<"/"<<argv[3]<<" train="<<train*7<<" held="<<(G-train)*7<<"\n"<<flush;Tables T(c,lane,train);auto sc=scan(T);int maxpairs=0;for(auto&a:sc.basis)maxpairs+=a.w;double den=7.0*train*(train-1);cout<<setprecision(12)<<"max_mean_ioc="<<maxpairs/den<<" pairs="<<maxpairs<<" row_cutoff_ioc="<<double(sc.top.back().w)/(train*(train-1.0))<<"\n";LM lm(lmsec);auto d=selectDirs(c,lane,train,sc.top,lm);vector<int> order;if(lane){for(int t=0;t<7;t++)order.push_back(t*AF);}else order=orderRows(d,train,lm);M key{};K bias{};for(int t=0;t<7;t++){int i=order[t]/AF,j=order[t]%AF;auto a=d[i].aff[j];for(int u=0;u<7;u++)key[t][u]=d[i].k[u]*a.a%29;bias[t]=a.b;}V out=decode(c,key,bias,lane);assert(encode(out,key,bias,lane)==c);cout<<"selected_fit_ioc="<<paircount(out,G,train,lane)/den<<" train_LLR="<<lm.score(out,G,train,lane,true)<<" held_LLR="<<lm.score(out,G,train,lane,false)<<"\n";for(int t=0;t<7;t++){cout<<"row "<<t<<" ";printk(key[t]);cout<<" bias="<<bias[t]<<"\n";}if(plant){int topdir=0,basisdir=0,selecteddir=0,exactrows=0,held=0,unordered=0;for(int t=0;t<7;t++){K k=normalize(truth[t]);for(auto&a:sc.top)if(a.k==k){topdir++;break;}for(auto&a:sc.basis)if(a.k==k){basisdir++;break;}for(int u=0;u<7;u++)if(normalize(key[u])==k){selecteddir++;if(key[u]==truth[t]&&bias[u]==tb[t])exactrows++;for(int g=train;g<G;g++)unordered+=out[at(g,u,G,lane)]==p[at(g,t,G,lane)];}for(int g=train;g<G;g++)held+=out[at(g,t,G,lane)]==p[at(g,t,G,lane)];}cout<<"truth_train_ioc="<<paircount(p,G,train,lane)/den<<" truth_train_LLR="<<lm.score(p,G,train,lane,true)<<" truth_held_LLR="<<lm.score(p,G,train,lane,false)<<" top_true_dirs="<<topdir<<" max_basis_true_dirs="<<basisdir<<" selected_true_dirs="<<selecteddir<<" exact_rows_unordered="<<exactrows<<" held_ordered="<<held<<"/"<<(G-train)*7<<" held_direction_matched="<<unordered<<"/"<<(G-train)*7<<"\n";}cout<<"decoded=";for(int x:out)cout<<"0123456789abcdefghijklmnopqrs"[x];cout<<"\n";}
