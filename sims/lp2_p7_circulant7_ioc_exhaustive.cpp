#include <algorithm>
#include <array>
#include <atomic>
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
#include <chrono>
#include <omp.h>
#ifdef __AVX2__
#include <immintrin.h>
#endif
using namespace std;
using K=array<int,7>; using V=vector<int>;
constexpr int Q=29, B=29*29*29, TOP=64;
int mod(int x){x%=Q;return x<0?x+Q:x;}
int inv[29], ratio29[29][29], zpow[7][7];
vector<int> allowed[29][29];
void setup(){for(int a=1;a<Q;a++)for(int b=1;b<Q;b++)if(a*b%Q==1)inv[a]=b;
 for(int a=0;a<Q;a++)for(int b=0;b<Q;b++)ratio29[a][b]=a?b*inv[a]%Q:-1;
 int z=1;for(int r=0;r<7;r++){int x=1;for(int j=0;j<7;j++){zpow[r][j]=x;x=x*z%Q;}z=z*20%Q;}
 for(int r=0;r<Q;r++)for(int a=0;a<Q;a++)for(int b=0;b<Q;b++)if(!a||ratio29[a][b]<=r)allowed[r][a].push_back(b);
}
bool nonsingular(const K& k){for(int r=0;r<7;r++){int s=0;for(int j=0;j<7;j++)s+=k[j]*zpow[r][j];if(s%Q==0)return false;}return true;}
bool canonical(const K& k){for(int j=1;j<7;j++)if(k[j]&&ratio29[k[j]][k[(j+1)%7]]==k[1]){for(int t=2;t<7;t++){int x=ratio29[k[j]][k[(j+t)%7]];if(x>k[t])return false;if(x<k[t])break;}}return true;}
K canonicalize(K k){K best{};for(int r=0;r<7;r++)if(k[r]){K a{};for(int j=0;j<7;j++)a[j]=ratio29[k[r]][k[(r+j)%7]];best=max(best,a);}return best;}
int at(int g,int t,int G,bool lane){return lane?t*G+g:7*g+t;}
V decode(const V& c,K k,int b,bool lane){int G=c.size()/7;V p(c.size());for(int g=0;g<G;g++)for(int t=0;t<7;t++){int s=b;for(int j=0;j<7;j++)s+=k[j]*c[at(g,(t+j)%7,G,lane)];p[at(g,t,G,lane)]=mod(s);}return p;}
V encode(const V& p,K k,int b,bool lane){array<array<int,14>,7> a{};for(int i=0;i<7;i++){for(int j=0;j<7;j++)a[i][j]=k[(j-i+7)%7];a[i][7+i]=1;}for(int j=0;j<7;j++){int r=j;while(r<7&&!a[r][j])r++;assert(r<7);swap(a[j],a[r]);int u=inv[a[j][j]];for(int t=0;t<14;t++)a[j][t]=mod(a[j][t]*u);for(int i=0;i<7;i++)if(i!=j){int f=a[i][j];for(int t=0;t<14;t++)a[i][t]=mod(a[i][t]-f*a[j][t]);}}
 int G=p.size()/7;V c(p.size());for(int g=0;g<G;g++)for(int t=0;t<7;t++){int s=0;for(int j=0;j<7;j++)s+=a[t][7+j]*(p[at(g,j,G,lane)]-b);c[at(g,t,G,lane)]=mod(s);}return c;}
struct Candidate{int pairs;K k;};bool better(const Candidate&a,const Candidate&b){return a.pairs>b.pairs||(a.pairs==b.pairs&&a.k<b.k);}struct WorseHeap{bool operator()(const Candidate&a,const Candidate&b)const{return better(a,b);}};
struct Tables{int n,S;vector<uint8_t>L,R;vector<array<uint8_t,7>> lf,rf;Tables(const V& c,bool lane,int train){int G=c.size()/7;n=train*7;S=(n+31)&~31;L.resize(size_t(B)*S);R.resize(size_t(B)*S);lf.resize(B);rf.resize(B);vector<K> rows;for(int g=0;g<train;g++)for(int t=0;t<7;t++){K row;for(int j=0;j<7;j++)row[j]=c[at(g,(t+j)%7,G,lane)];rows.push_back(row);}for(int a=0;a<Q;a++)for(int b=0;b<Q;b++)for(int d=0;d<Q;d++){int u=(a*Q+b)*Q+d;auto*l=&L[size_t(u)*S];auto*r=&R[size_t(u)*S];for(int i=0;i<n;i++){auto& x=rows[i];l[i]=(x[0]+a*x[1]+b*x[2]+d*x[3])%Q;r[i]=(a*x[4]+b*x[5]+d*x[6])%Q;}for(int j=0;j<7;j++){lf[u][j]=(1+a*zpow[j][1]+b*zpow[j][2]+d*zpow[j][3])%Q;rf[u][j]=(a*zpow[j][4]+b*zpow[j][5]+d*zpow[j][6])%Q;}}}
 bool invertible(int l,int r)const{for(int i=0;i<7;i++){int x=lf[l][i]+rf[r][i];if(x==0||x==29)return false;}return true;}
 int score(int l,int r)const{const uint8_t*a=&L[size_t(l)*S],*b=&R[size_t(r)*S];alignas(32) uint8_t temp[4096];assert(S<=4096);
#ifdef __AVX2__
 const auto z=_mm256_set1_epi8(29);for(int i=0;i<S;i+=32){auto x=_mm256_add_epi8(_mm256_loadu_si256((const __m256i*)(a+i)),_mm256_loadu_si256((const __m256i*)(b+i)));x=_mm256_min_epu8(x,_mm256_sub_epi8(x,z));_mm256_store_si256((__m256i*)(temp+i),x);}
#else
 for(int i=0;i<n;i++){int x=a[i]+b[i];temp[i]=x>=29?x-29:x;}
#endif
 int h[4][32]{};int i=0;for(;i+3<n;i+=4){h[0][temp[i]]++;h[1][temp[i+1]]++;h[2][temp[i+2]]++;h[3][temp[i+3]]++;}for(;i<n;i++)h[0][temp[i]]++;int s=0;for(int j=0;j<Q;j++){int x=h[0][j]+h[1][j]+h[2][j]+h[3][j];s+=x*(x-1);}return s;}
};
vector<Candidate> scan(const Tables&T){vector<Candidate> all;long long orbit=0,valid=0;atomic<int> done{0};auto start=chrono::steady_clock::now();
#pragma omp parallel reduction(+:orbit,valid)
 {priority_queue<Candidate,vector<Candidate>,WorseHeap> best;
#pragma omp for schedule(dynamic,1)
 for(int task=0;task<841;task++){int r=task/29,a=task%29;if(!r||ratio29[r][a]<=r){for(int b:allowed[r][a]){int l=(r*29+a)*29+b;for(int c:allowed[r][b])for(int d:allowed[r][c])for(int e:allowed[r][d]){if(e&&ratio29[e][1]>r)continue;K k{1,r,a,b,c,d,e};if(!canonical(k))continue;orbit++;int u=(c*29+d)*29+e;if(!T.invertible(l,u))continue;valid++;int s=T.score(l,u);Candidate ca{s,k};if(best.size()<TOP)best.push(ca);else if(better(ca,best.top())){best.pop();best.push(ca);}}}}int n=++done;if(n%100==0){
#pragma omp critical
 {cerr<<"tasks "<<n<<"/841 after "<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<" s\n";}}}
#pragma omp critical
 {while(!best.empty()){all.push_back(best.top());best.pop();}}}
 sort(all.begin(),all.end(),better);if(all.size()>TOP)all.resize(TOP);cout<<"orbits="<<orbit<<" invertible="<<valid<<"\n";assert(orbit==88009579&&valid==68841472);return all;}
struct LM{double u[29]{},bi[29][29]{},tri[29][29][29]{};LM(const vector<V>&sections){double c[29]{},d[29][29]{},e[29][29][29]{},n=0;for(auto&s:sections)for(int i=0;i<(int)s.size();i++){int x=s[i];c[x]++;n++;if(i)d[s[i-1]][x]++;if(i>1)e[s[i-2]][s[i-1]][x]++;}double p[29],pb[29][29];for(int x=0;x<Q;x++){p[x]=(c[x]+0.5)/(n+14.5);u[x]=log(p[x]*29);}for(int a=0;a<Q;a++){double N=accumulate(d[a],d[a]+Q,0.0);for(int x=0;x<Q;x++){pb[a][x]=(d[a][x]+8*p[x])/(N+8);bi[a][x]=log(pb[a][x]*29);}}for(int a=0;a<Q;a++)for(int b=0;b<Q;b++){double N=accumulate(e[a][b],e[a][b]+Q,0.0);for(int x=0;x<Q;x++)tri[a][b][x]=log((e[a][b][x]+12*pb[b][x])/(N+12)*29);}}
 double score(const V&p,const vector<bool>&fit,bool want)const{double s=0;int n=0;for(int i=0;i<(int)p.size();i++)if(fit[i]==want){n++;int x=p[i];if(i>1&&fit[i-1]==want&&fit[i-2]==want)s+=tri[p[i-2]][p[i-1]][x];else if(i&&fit[i-1]==want)s+=bi[p[i-1]][x];else s+=u[x];}return s/n;}};
int paircount(const V&v,const vector<bool>&fit,bool want){int h[29]{};for(size_t i=0;i<v.size();i++)if(fit[i]==want)h[v[i]]++;int n=0;for(int x:h)n+=x*(x-1);return n;}
struct Result{double train=-1e99,held=0;K k{};int b=0,rank=-1;V p;};
Result select(const V&c,bool lane,const vector<Candidate>&cand,const LM&lm,const vector<bool>&fit){Result best;for(int ri=0;ri<(int)cand.size();ri++){auto key=cand[ri].k;V p0=decode(c,key,0,lane);int h[29]{};for(size_t i=0;i<c.size();i++)if(fit[i])h[p0[i]]++;vector<tuple<double,int,int>> affine;for(int a=1;a<Q;a++)for(int b=0;b<Q;b++){double s=0;for(int x=0;x<Q;x++)s+=h[x]*lm.u[(a*x+b)%Q];affine.emplace_back(s,a,b);}sort(affine.begin(),affine.end(),greater<>());affine.resize(16);for(auto [u,a,b]:affine)for(int r=0;r<7;r++){K k;for(int j=0;j<7;j++)k[j]=a*key[(j+r)%7]%Q;V p=decode(c,k,b,lane);double s=lm.score(p,fit,true);if(s>best.train){best.train=s;best.k=k;best.b=b;best.rank=ri;best.p=move(p);}}}best.held=lm.score(best.p,fit,false);return best;}
uint32_t hashv(const V&v){uint32_t h=2166136261u;for(int x:v)h=(h^uint32_t(x))*16777619u;return h;}
string digits(const V&v){string s;for(int x:v)s+="0123456789abcdefghijklmnopqrs"[x];return s;}
void printk(K k){for(int x:k)cout<<x<<",";}
int main(int argc,char**argv){assert(argc==4);setup();ifstream in(argv[1]);assert(in);vector<V> src;string s;while(in>>s){V v;for(char x:s){int d=x>='a'?x-'a'+10:x-'0';assert(d>=0&&d<Q);v.push_back(d);}src.push_back(move(v));}assert(src.size()==10);const uint32_t hashes[]={1603621047u,798070602u,954790970u,2234481871u,800926877u,3128993256u,3724526490u,1105541379u,760315280u,2331769834u};const int sizes[]={1729,184,515,157,780,755,319,89,85,95};for(int i=0;i<10;i++)assert(src[i].size()==sizes[i]&&hashv(src[i])==hashes[i]);bool lane=string(argv[2])=="lanes",plant=string(argv[3])=="plant";assert(lane||string(argv[2])=="groups");assert(plant||string(argv[3])=="original");V c=src[0],p;vector<V> lmsec;K truth{};int tb=0;for(int j=1;j<10;j++){bool a=(j==2||j==4||j==6);bool donor=lane?!a:a;if(plant&&donor)p.insert(p.end(),src[j].begin(),src[j].end());else lmsec.push_back(src[j]);}if(plant){p.resize(p.size()/7*7);mt19937 rng(lane?460731:460730);do{for(int&x:truth)x=rng()%29;}while(!nonsingular(truth));tb=rng()%29;c=encode(p,truth,tb,lane);assert(decode(c,truth,tb,lane)==p);}int G=c.size()/7,train=G*65/100;vector<bool> fit(c.size());for(int g=0;g<G;g++)for(int t=0;t<7;t++)fit[at(g,t,G,lane)]=g<train;int nf=train*7,nh=c.size()-nf;cout<<"mode="<<argv[2]<<"/"<<argv[3]<<" train="<<nf<<" held="<<nh<<"\n"<<flush;Tables T(c,lane,train);auto cand=scan(T);LM lm(lmsec);auto out=select(c,lane,cand,lm,fit);assert(encode(out.p,out.k,out.b,lane)==c);cout<<setprecision(12)<<"max_ioc="<<double(cand[0].pairs)/(nf*(nf-1.0))<<" pairs="<<cand[0].pairs<<" cutoff_ioc="<<double(cand.back().pairs)/(nf*(nf-1.0))<<"\n";cout<<"selected_key=";printk(out.k);cout<<" bias="<<out.b<<" rank="<<out.rank<<" train_LLR="<<out.train<<" held_LLR="<<out.held<<" held_ioc="<<double(paircount(out.p,fit,false))/(nh*(nh-1.0))<<"\n";if(plant){K tk=canonicalize(truth);int rank=-1;for(int i=0;i<(int)cand.size();i++)if(cand[i].k==tk)rank=i;int hit=0;for(int i=0;i<(int)p.size();i++)if(!fit[i]&&p[i]==out.p[i])hit++;cout<<"true_key=";printk(truth);cout<<" bias="<<tb<<" true_direction_rank="<<rank<<" held_hits="<<hit<<"/"<<nh<<" exact="<<(out.p==p)<<" truth_train_ioc="<<double(paircount(p,fit,true))/(nf*(nf-1.0))<<" truth_train_LLR="<<lm.score(p,fit,true)<<" truth_held_LLR="<<lm.score(p,fit,false)<<"\n";}cout<<"decoded="<<digits(out.p)<<"\n";}
