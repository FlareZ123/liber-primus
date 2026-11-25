// Agent37: full two-history quadratic inverse. Search engine adapted from
// sims/lp2_fir6_allkey_recovery.cpp (Agent5).
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
constexpr int Q=29, A=Q*Q, B=A*Q, TRAIN=756, FULL=1021;
using Key=array<int,5>;
int mod(int n){return (n%Q+Q)%Q;}
int inv(int a){for(int x=1;x<Q;x++)if(a*x%Q==1)return x;assert(false);return 0;}
vector<int> read(string s){vector<int> r;for(char c:s){int a=c<='9'?c-'0':c-'a'+10;assert(a>=0&&a<Q);r.push_back(a);}return r;}
Key features(int x,int y){return {x,y,x*x%Q,x*y%Q,y*y%Q};}
Key key(int idx){Key h{};for(int j=4;j>=0;j--){h[j]=idx%Q;idx/=Q;}return h;}
struct Best{int score=-1,idx=-1,ties=0;};
void combine(Best& z,int score,int idx,int ties=1){if(score>z.score)z={score,idx,ties};else if(score==z.score){z.ties+=ties;if(idx<z.idx)z.idx=idx;}}
Best search(const vector<int>& c,int end){
 const int n=end-5;vector<uint8_t> a(A*n),b(B*n);vector<Key> f;for(int i=5;i<end;i++)f.push_back(features(c[i-1],c[i-5]));
 for(int h=0;h<A;h++)for(int i=0;i<n;i++)a[h*n+i]=(c[i+5]+(h/Q)*f[i][0]+(h%Q)*f[i][1])%Q;
 for(int h=0;h<B;h++)for(int i=0;i<n;i++)b[h*n+i]=((h/A)*f[i][2]+((h/Q)%Q)*f[i][3]+(h%Q)*f[i][4])%Q;
 Best best;
 #pragma omp parallel
 {
 Best local;
 #pragma omp for schedule(static)
 for(int j=0;j<B;j++){
 auto pb=b.data()+j*n;
 for(int k=0;k<A;k++){
 auto pa=a.data()+k*n;uint16_t hist[Q]{};int score=0;
 for(int i=0;i<n;i++){unsigned x=pa[i]+pb[i];x-=Q*(x>=Q);score+=hist[x]++;}
 combine(local,score,k*B+j);
 }}
 #pragma omp critical
 combine(best,local.score,local.idx,local.ties);
 }
 return best;
}
int poly(Key h,int x,int y){auto f=features(x,y);int v=0;for(int j=0;j<5;j++)v+=h[j]*f[j];return v;}
vector<int> project(const vector<int>& c,Key h){vector<int> p;for(int i=5;i<(int)c.size();i++)p.push_back(mod(c[i]+poly(h,c[i-1],c[i-5])));return p;}
int collisions(const vector<int>& p,int start,int end){int hist[Q]{},v=0;for(int i=start;i<end;i++)v+=hist[p[i]]++;return v;}
struct Affine{int a=0,b=0;double score=-numeric_limits<double>::infinity();};
Affine recoverAffine(const vector<int>& p,const array<double,Q>& logprob){Affine best;int hist[Q]{};for(int i=0;i<TRAIN-5;i++)hist[p[i]]++;for(int a=1;a<Q;a++)for(int b=0;b<Q;b++){double s=0;for(int x=0;x<Q;x++)s+=hist[x]*logprob[(a*x+b)%Q];if(s>best.score)best={a,b,s};}return best;}
vector<int> encrypt(const vector<int>& p,Key h,int a,int b,const vector<int>& iv){vector<int> c=iv;int ai=inv(a);for(int i=5;i<(int)p.size();i++)c.push_back(mod(ai*mod(p[i]-b)-poly(h,c[i-1],c[i-5])));return c;}
void printkey(Key h){for(int x:h)cout<<x<<',';}
void test(const string& name,const vector<int>& c,const array<double,Q>& logprob,const vector<int>* trueP=nullptr){
 auto start=chrono::steady_clock::now();auto best=search(c,TRAIN);Key h=key(best.idx);auto p=project(c,h);assert(collisions(p,0,TRAIN-5)==best.score);auto a=recoverAffine(p,logprob);for(int& x:p)x=(a.a*x+a.b)%Q;
 int v=collisions(p,TRAIN-5,FULL-5);cout<<name<<" train_pairs="<<best.score<<" ties="<<best.ties<<" train_ioc="<<2.0*best.score/((TRAIN-5)*(TRAIN-6))<<" h=";printkey(h);cout<<" a="<<a.a<<" b="<<a.b<<" hold_pairs="<<v<<" hold_ioc="<<2.0*v/((FULL-TRAIN)*(FULL-TRAIN-1))<<" time_sec="<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<'\n';
 if(trueP){int t=0,u=0;for(int i=5;i<TRAIN;i++)t+=(p[i-5]==(*trueP)[i]);for(int i=TRAIN;i<FULL;i++)u+=(p[i-5]==(*trueP)[i]);cout<<"exact_training="<<t<<"/"<<TRAIN-5<<" exact_holdout="<<u<<"/"<<FULL-TRAIN<<'\n';}
 vector<int> pref=c;for(int i=5;i<FULL;i++)pref[i]=p[i-5];assert(encrypt(pref,h,a.a,a.b,vector<int>(c.begin(),c.begin()+5))==c);
 cout<<"decoded=";for(int x:p)cout<<"0123456789abcdefghijklmnopqrs"[x];cout<<endl;
}
int main(int argc,char**argv){string s,t;cin>>s>>t;auto c=read(s),native=read(t);assert(c.size()==FULL&&native.size()==2979);omp_set_num_threads(4);array<double,Q> freq{},logprob{};freq.fill(1);for(int i=FULL;i<(int)native.size()-FULL;i++)freq[native[i]]++;for(int i=0;i<Q;i++)logprob[i]=log(freq[i]/(native.size()-2*FULL+Q));
 vector<int> p1(native.begin(),native.begin()+FULL),p2(native.end()-FULL,native.end());
 Key h1={19,7,24,16,12},h2={8,27,5,3,21};string which=argc>1?argv[1]:"all";
 if(which=="plant1"||which=="all")test("plant1",encrypt(p1,h1,13,4,{7,16,3,21,8}),logprob,&p1);
 if(which=="plant2"||which=="all")test("plant2",encrypt(p2,h2,24,17,{28,9,11,17,2}),logprob,&p2);
 if(which=="original"||which=="all")test("original",c,logprob);
 if(which=="full"||which=="all"){auto f=search(c,FULL);cout<<"original_full_allkey_pairs="<<f.score<<" ties="<<f.ties<<" full_ioc="<<2.0*f.score/((FULL-5)*(FULL-6))<<" key=";printkey(key(f.idx));cout<<endl;
 for(int n:{TRAIN-5,FULL-5}){int mn=n*n,mx=0;for(int start=0;start+n<=(int)native.size();start++){int count=collisions(native,start,start+n);mn=min(mn,count);mx=max(mx,count);}cout<<"native_windows n="<<n<<" count="<<native.size()-n+1<<" min_pairs="<<mn<<" max_pairs="<<mx<<" min_ioc="<<2.0*mn/(n*(n-1))<<endl;}}
}
