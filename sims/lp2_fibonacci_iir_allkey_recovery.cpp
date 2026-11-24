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
struct Best{int score=-1,idx=-1;};
struct Key{int u,v,x,y;};
Key key(int i){return {i/(Q*N),i/N%Q,i/Q%Q,i%Q};}
struct Basis{vector<uint8_t> drive,hom;};
Basis basis(const vector<int>& c,int len){
 vector<int> z(len),h1(len),h2(len);int p=0,q=0;
 for(int i=0;i<len;i++){int v=(c[i]+p+q)%Q;z[i]=v;q=p;p=v;}
 p=1;q=0;for(int i=0;i<len;i++){h1[i]=(p+q)%Q;q=p;p=h1[i];}
 p=0;q=1;for(int i=0;i<len;i++){h2[i]=(p+q)%Q;q=p;p=h2[i];}
 Basis b{vector<uint8_t>(N*len),vector<uint8_t>(N*len)};
 for(int u=0;u<Q;u++)for(int v=0;v<Q;v++){int k=u*Q+v;for(int i=0;i<len;i++)b.drive[k*len+i]=(z[i]+(i>0?u*z[i-1]:0)+(i>1?v*z[i-2]:0))%Q;}
 for(int x=0;x<Q;x++)for(int y=0;y<Q;y++){int k=x*Q+y;for(int i=0;i<len;i++)b.hom[k*len+i]=(x*h1[i]+y*h2[i])%Q;}
 return b;
}
Best search(const vector<int>& c,int len){auto b=basis(c,len);Best best;
 #pragma omp parallel
 {Best local;
 #pragma omp for schedule(static)
 for(int a=0;a<N;a++)for(int h=0;h<N;h++){const uint8_t* p=b.drive.data()+a*len,*q=b.hom.data()+h*len;int hist[Q]{},score=0;for(int i=0;i<len;i++){int x=p[i]+q[i];x-=Q*(x>=Q);score+=hist[x]++;}int k=a*N+h;if(score>local.score||(score==local.score&&k<local.idx))local={score,k};}
 #pragma omp critical
 {if(local.score>best.score||(local.score==best.score&&local.idx<best.idx))best=local;}}
 return best;}
vector<int> decode(const vector<int>& c,Key k){vector<int> out;int p=k.x,q=k.y;for(int i=0;i<(int)c.size();i++){int z=mod(c[i]+(i>0?k.u*c[i-1]:0)+(i>1?k.v*c[i-2]:0)+p+q);out.push_back(z);q=p;p=z;}return out;}
vector<int> encode(const vector<int>& p,Key k,int a,int b){vector<int> c;int x=k.x,y=k.y,ai=inv(a);for(int i=0;i<(int)p.size();i++){int z=mod(ai*(p[i]-b));c.push_back(mod(z-x-y-(i>0?k.u*c[i-1]:0)-(i>1?k.v*c[i-2]:0)));y=x;x=z;}return c;}
int pairs(const vector<int>& p,int from,int to){int hist[Q]{},r=0;for(int i=from;i<to;i++)r+=hist[p[i]]++;return r;}
double ioc(int pairs,int n){return 2.*pairs/(n*(n-1));}
struct Aff{int a,b;double score;};
Aff fit(const vector<int>& q,const vector<int>& prior){array<double,Q> w{};w.fill(1);for(int x:prior)w[x]++;for(auto& x:w)x=log(x/(prior.size()+Q));int hist[Q]{};for(int i=0;i<TRAIN;i++)hist[q[i]]++;Aff best{0,0,-numeric_limits<double>::infinity()};for(int a=1;a<Q;a++)for(int b=0;b<Q;b++){double s=0;for(int x=0;x<Q;x++)s+=hist[x]*w[(a*x+b)%Q];if(s>best.score)best={a,b,s};}return best;}
void test(string name,const vector<int>& c,const vector<int>& prior,const vector<int>* truth=nullptr){auto best=search(c,TRAIN);auto k=key(best.idx);auto q=decode(c,k);assert(pairs(q,0,TRAIN)==best.score);auto a=fit(q,prior);vector<int> p;for(int x:q)p.push_back((a.a*x+a.b)%Q);assert(encode(p,k,a.a,a.b)==c);cout<<name<<" train_pairs="<<best.score<<" train_ioc="<<ioc(best.score,TRAIN)<<" holdout_ioc="<<ioc(pairs(p,TRAIN,FULL),FULL-TRAIN)<<" key="<<k.u<<","<<k.v<<","<<k.x<<","<<k.y<<","<<a.a<<","<<a.b<<"\n";if(truth){int n=0,m=0;for(int i=0;i<FULL;i++)(i<TRAIN?n:m)+=(p[i]==(*truth)[i]);cout<<"exact_training="<<n<<"/"<<TRAIN<<" exact_holdout="<<m<<"/"<<FULL-TRAIN<<"\n";}else{cout<<"decoded=";for(int x:p)cout<<"0123456789abcdefghijklmnopqrs"[x];cout<<"\n";}cout.flush();}
int main(){string s,t;cin>>s>>t;auto c=read(s),d=read(t);assert(c.size()==FULL&&d.size()==2979);omp_set_num_threads(4);vector<int> p1(d.begin(),d.begin()+FULL),prior1(d.begin()+FULL,d.end()),p2(d.end()-FULL,d.end()),prior2(d.begin(),d.end()-FULL);test("plant1",encode(p1,{9,16,22,21},13,4),prior1,&p1);test("plant2",encode(p2,{4,27,6,17},24,17),prior2,&p2);test("original",c,prior1);auto b=search(c,FULL);auto k=key(b.idx);cout<<"full_allkey_pairs="<<b.score<<" full_ioc="<<ioc(b.score,FULL)<<" key="<<k.u<<","<<k.v<<","<<k.x<<","<<k.y<<"\n";for(int n:{TRAIN,FULL}){int mn=n*n;for(int i=0;i+n<=(int)d.size();i++)mn=min(mn,pairs(d,i,i+n));cout<<"native_min n="<<n<<" pairs="<<mn<<" ioc="<<ioc(mn,n)<<" windows="<<d.size()-n+1<<"\n";}}
