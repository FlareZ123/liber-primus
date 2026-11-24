#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <limits>
#include <string>
#include <vector>
#include <omp.h>
using namespace std;
constexpr int Q=29, TRAIN=1340, FULL=1744, N=Q*Q;
int mod(int n){return (n%Q+Q)%Q;}
int inv(int a){for(int x=1;x<Q;x++)if(a*x%Q==1)return x;assert(false);return 0;}
vector<int> read(string s){vector<int> r;for(char c:s){int a=c<='9'?c-'0':c-'a'+10;assert(a>=0&&a<Q);r.push_back(a);}return r;}
int pairs(const vector<int>& p,int from,int to){int hist[Q]{},r=0;for(int i=from;i<to;i++)r+=hist[p[i]]++;return r;}
double ioc(int pairs,int n){return 2.*pairs/(n*(n-1));}
struct Key{int A,B,u,v,x,y,d;};
struct Best{int score=-1;long long order=-1;Key key{};};
vector<int> decode(const vector<int>& c,Key k){vector<int> r;int x=k.x,y=k.y;for(int i=0;i<(int)c.size();i++){int z=mod(k.A*x+k.B*y+c[i]+(i?k.u*c[i-1]:0)+(i>1?k.v*c[i-2]:0)+k.d);r.push_back(z);y=x;x=z;}return r;}
vector<int> encode(const vector<int>& p,Key k,int a,int b){vector<int> c;int ai=inv(a),x=k.x,y=k.y;for(int i=0;i<(int)p.size();i++){int z=mod(ai*(p[i]-b));c.push_back(mod(z-k.A*x-k.B*y-(i?k.u*c[i-1]:0)-(i>1?k.v*c[i-2]:0)-k.d));y=x;x=z;}return c;}
void print(Key k){cout<<k.A<<","<<k.B<<","<<k.u<<","<<k.v<<","<<k.x<<","<<k.y<<","<<k.d;}
Best search(const vector<int>& c,int len,bool reuse=false){
 Best best;long long examined=0;auto t0=chrono::steady_clock::now();
 if(reuse){best={32178,((long long)(Q+1)*N+12*Q+9)*N+12*Q+8,{1,1,12,9,12,8,0}};assert(pairs(decode(c,best.key),0,len)==best.score);}
 #pragma omp parallel for schedule(dynamic,1) num_threads(4)
 for(int den=0;den<N;den++){
  int A=den/Q,B=den%Q;if(reuse&&A==1&&B==1)continue;
  bool singular=(A+B)%Q==1;
  vector<int> z(len),h1(len),h2(len);int p=0,q=0;
  for(int i=0;i<len;i++){int v=(A*p+B*q+c[i])%Q;z[i]=v;q=p;p=v;}
  p=1;q=0;for(int i=0;i<len;i++){int v=(A*p+B*q)%Q;h1[i]=v;q=p;p=v;}
  p=0;q=singular?0:1;for(int i=0;i<len;i++){int v=(A*p+B*q+(singular?1:0))%Q;h2[i]=v;q=p;p=v;}
  int nx=Q,ny=Q;if(B==0){if(singular)nx=1;else ny=1;}
  int H=nx*ny;vector<uint8_t> drive(N*len),hom(H*len);
  for(int u=0;u<Q;u++)for(int v=0;v<Q;v++){int k=u*Q+v;for(int i=0;i<len;i++)drive[k*len+i]=(z[i]+(i?u*z[i-1]:0)+(i>1?v*z[i-2]:0))%Q;}
  for(int x=0;x<nx;x++)for(int y=0;y<ny;y++){int k=x*ny+y;for(int i=0;i<len;i++)hom[k*len+i]=(x*h1[i]+y*h2[i])%Q;}
  Best local;
  for(int a=0;a<N;a++)for(int h=0;h<H;h++){
   const uint8_t* f=drive.data()+a*len,*g=hom.data()+h*len;int hist[Q]{},s=0;
   for(int i=0;i<len;i++){int v=f[i]+g[i];v-=Q*(v>=Q);s+=hist[v]++;}
   long long order=((long long)den*N+a)*N+h/ny*Q+h%ny;
   if(s>local.score||(s==local.score&&order<local.order))local={s,order,{A,B,a/Q,a%Q,h/ny,singular?0:h%ny,singular?h%ny:0}};
  }
  #pragma omp critical
  {examined+=(long long)N*H;if(local.score>best.score||(local.score==best.score&&local.order<best.order)){best=local;cout<<"new_best den="<<den<<" pairs="<<best.score<<" key=";print(best.key);cout<<"\n";}if(den%29==0){cout<<"progress den="<<den<<" tested="<<examined<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-t0).count()<<"\n";}cout.flush();}
 }
 assert(pairs(decode(c,best.key),0,len)==best.score);
 cout<<"complete examined="<<examined<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-t0).count()<<"\n";
 return best;
}
struct Aff{int a,b;double score;};
Aff fit(const vector<int>& p,int train,const vector<int>& prior){array<double,Q> w{};w.fill(1);for(int x:prior)w[x]++;for(auto& x:w)x=log(x/(prior.size()+Q));int hist[Q]{};for(int i=0;i<train;i++)hist[p[i]]++;Aff best{0,0,-numeric_limits<double>::infinity()};for(int a=1;a<Q;a++)for(int b=0;b<Q;b++){double s=0;for(int x=0;x<Q;x++)s+=hist[x]*w[(a*x+b)%Q];if(s>best.score)best={a,b,s};}return best;}
void run(string name,const vector<int>& c,int train,const vector<int>& prior,const vector<int>* truth=nullptr,bool reuse=false){auto best=search(c,train,reuse);auto p=decode(c,best.key);auto f=fit(p,train,prior);for(int& x:p)x=(f.a*x+f.b)%Q;assert(encode(p,best.key,f.a,f.b)==c);cout<<name<<" best_pairs="<<best.score<<" train_ioc="<<ioc(best.score,train)<<" holdout_ioc="<<ioc(pairs(p,train,p.size()),p.size()-train)<<" key=";print(best.key);cout<<","<<f.a<<","<<f.b<<"\n";if(truth){int n=0,m=0;for(int i=0;i<(int)p.size();i++)(i<train?n:m)+=(p[i]==(*truth)[i]);cout<<"exact_train="<<n<<"/"<<train<<" exact_holdout="<<m<<"/"<<p.size()-train<<"\n";}else{cout<<"decoded=";for(int x:p)cout<<"0123456789abcdefghijklmnopqrs"[x];cout<<"\n";}cout.flush();}
int main(int argc,char**argv){string s,t;cin>>s>>t;auto c=read(s),d=read(t);assert(c.size()==1744&&d.size()==2979);string mode=argc>1?argv[1]:"all";
 if(mode=="all"||mode=="plant"){vector<int> p(d.begin(),d.begin()+800),prior(d.begin()+800,d.end());run("plant",encode(p,{7,23,14,3,9,0,11},19,4),600,prior,&p);}
 if(mode=="all"||mode=="original"||mode=="original-reuse"){vector<int> prior(d.begin()+1744,d.end());run("original",c,1340,prior,nullptr,mode=="original-reuse");int mn=1340*1340;for(int i=0;i+1340<=(int)d.size();i++)mn=min(mn,pairs(d,i,i+1340));cout<<"native_min="<<mn<<" ioc="<<ioc(mn,1340)<<"\n";}
}
