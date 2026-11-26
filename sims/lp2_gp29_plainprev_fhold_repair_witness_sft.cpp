#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <random>
#include <string>
#include <vector>
using namespace std;using U=uint32_t;
struct Tape{vector<int> c,d;};
struct Score{int repairs=0,failed=0;uint64_t support=0;array<int,29> failures{};double energy(int N)const{return repairs+.005*failed-.10*double(support)/(29*N);}bool better(const Score& b,int N)const{return energy(N)<b.energy(N);}};
struct Engine{
 int n=29,N=0;U all;vector<Tape> frames;array<array<U,256>,4> lut{};uint64_t evaluations=0;
 Engine(int a,const vector<vector<int>>& raw):n(a),all((U(1)<<a)-1){for(auto c:raw){Tape f;f.c=move(c);f.d.resize(f.c.size());N+=int(f.c.size())-1;for(size_t j=1;j<f.c.size();j++)f.d[j]=(f.c[j]-f.c[j-1]+n)%n;frames.push_back(move(f));}}
 void tables(const vector<int>& k){for(int b=0;b<4;b++){lut[b][0]=0;for(int x=1;x<256;x++){int q=b*8+__builtin_ctz(unsigned(x));lut[b][x]=lut[b][x&(x-1)]|(q<n?(U(1)<<k[q]):0);}}}
 U image(U S)const{return lut[0][S&255]|lut[1][(S>>8)&255]|lut[2][(S>>16)&255]|lut[3][S>>24];}
 U rot(U x,int d)const{return d?((x<<d)|(x>>(n-d)))&all:x;}
 Score score(const vector<int>& k){++evaluations;tables(k);Score out;for(auto& f:frames){U S=1;int fail=0;for(size_t j=1;j<f.c.size();j++){U T=rot(image(S),f.d[j])&~U(1);if(f.c[j]==0)T|=S;if(!T){assert(__builtin_popcount(S)==1);int q=__builtin_ctz(S);assert((f.d[j]+k[q])%n==0);out.failures[q]++;fail++;S=all;}else S=T;out.support+=__builtin_popcount(S);}out.repairs+=fail;out.failed+=fail>0;}return out;}
};
static int exactRepair(const vector<int>& f,const vector<int>& k){int n=k.size(),INF=1000000;vector<int> dp(n,INF);dp[0]=0;for(size_t j=1;j<f.size();j++){int d=(f[j]-f[j-1]+n)%n;int mn=*min_element(dp.begin(),dp.end());vector<int> next(n,mn+1);for(int q=0;q<n;q++)if(dp[q]<INF){int p=(d+k[q])%n;if(p)next[p]=min(next[p],dp[q]);if(f[j]==0)next[q]=min(next[q],dp[q]);}dp.swap(next);}return *min_element(dp.begin(),dp.end());}
static vector<int> encode(const vector<int>& p,const vector<int>& k,int iv){vector<int> c{iv};int q=0,n=k.size();for(int x:p){if(x==0)c.push_back(0);else{c.push_back((c.back()+x-k[q]+n)%n);q=x;}}return c;}
struct Run{Score best;vector<int> key;uint64_t eval=0;int moves=0;double seconds=0;};
Run search(Engine& eng,int k0,uint64_t seed,int maxMoves,double timeCap){mt19937_64 rng(seed);int n=eng.n;vector<int> k(n);iota(k.begin(),k.end(),0);shuffle(k.begin(),k.end(),rng);swap(k[0],*find(k.begin(),k.end(),k0));auto s=eng.score(k);Run out{s,k,0,0,0};auto begin=chrono::steady_clock::now();array<array<int,29>,29> tabu{};int stall=0;
 for(int it=1;it<=maxMoves;it++){
  if(timeCap>0&&chrono::duration<double>(chrono::steady_clock::now()-begin).count()>=timeCap)break;
  if(!out.best.repairs)break;
  if(stall>=100){k=out.key;int changes=3+int(rng()%8);for(int j=0;j<changes;j++){int a=1+rng()%(n-1),b=1+rng()%(n-1);swap(k[a],k[b]);}s=eng.score(k);for(auto& a:tabu)a.fill(0);stall=0;}
  int a=1+rng()%(n-1);if((rng()%100)<75){int total=accumulate(s.failures.begin()+1,s.failures.begin()+n,0);if(total){int x=rng()%total;for(int q=1;q<n;q++){x-=s.failures[q];if(x<0){a=q;break;}}}}
  int partner=-1;Score choice;double bestEnergy=1e100;
  for(int b=1;b<n;b++)if(b!=a){swap(k[a],k[b]);auto t=eng.score(k);swap(k[a],k[b]);double e=t.energy(eng.N);bool aspiration=t.better(out.best,eng.N);if((it>=tabu[a][b]||aspiration)&&e<bestEnergy){partner=b;choice=t;bestEnergy=e;}}
  if(partner<0){for(auto& t:tabu)t.fill(0);continue;}
  swap(k[a],k[partner]);s=choice;int tenure=5+rng()%15;tabu[a][partner]=tabu[partner][a]=it+tenure;
  if(s.better(out.best,eng.N)){out.best=s;out.key=k;stall=0;}else stall++;
  out.moves=it;
 }
 out.eval=eng.evaluations;out.seconds=chrono::duration<double>(chrono::steady_clock::now()-begin).count();return out;
}
static vector<vector<int>> read(){vector<vector<int>> f;string s;while(cin>>s){vector<int> t;for(char c:s)t.push_back(c<='9'?c-'0':c-'a'+10);f.push_back(move(t));}return f;}
void print(const Run& r,int k0){cout<<"{\"k0\":"<<k0<<",\"repairs\":"<<r.best.repairs<<",\"failedFrames\":"<<r.best.failed<<",\"support\":"<<r.best.support<<",\"evaluations\":"<<r.eval<<",\"moves\":"<<r.moves<<",\"seconds\":"<<r.seconds<<",\"key\":[";for(size_t i=0;i<r.key.size();i++){if(i)cout<<',';cout<<r.key[i];}cout<<"]}"<<endl;}
int main(int argc,char** argv){string mode=argc>1?argv[1]:"controls";if(mode=="controls"){
 mt19937 rng(3045);int total=0;for(int n=2;n<=10;n++)for(int t=0;t<200;t++){vector<int> k(n);iota(k.begin(),k.end(),0);shuffle(k.begin(),k.end(),rng);vector<int> f(3+rng()%100);for(auto& x:f)x=rng()%n;Engine e(n,{f});auto s=e.score(k);assert(s.repairs==exactRepair(f,k));total++;}
 int plants=0;for(int t=0;t<20;t++){vector<int> k(29);iota(k.begin(),k.end(),0);shuffle(k.begin(),k.end(),rng);vector<vector<int>> f;for(int j=0;j<55;j++){vector<int> p(100+rng()%200);for(int& x:p)x=rng()%29;f.push_back(encode(p,k,rng()%29));}Engine e(29,f);assert(e.score(k).repairs==0);plants++;}
 cout<<"{\"repairExactControls\":"<<total<<",\"gp29PlantedLegality\":"<<plants<<"}"<<endl;return 0;}
 auto f=read();int k0=stoi(argv[2]);int moves=argc>3?stoi(argv[3]):10000;double sec=argc>4?stod(argv[4]):0;uint64_t seed=argc>5?stoull(argv[5]):3045;Engine e(29,f);auto r=search(e,k0,seed,moves,sec);print(r,k0);
}
