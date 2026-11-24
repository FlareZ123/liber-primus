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
constexpr int Q=29,A=Q*Q,B=Q*Q*Q,TRAIN=756,FULL=1021;
using Key=array<int,6>; // alpha, h1..h5
int mod(int n){return (n%Q+Q)%Q;}
int inv(int a){for(int x=1;x<Q;x++)if(a*x%Q==1)return x;assert(false);return 0;}
vector<int> read(string s){vector<int> r;for(char c:s){int a=c<='9'?c-'0':c-'a'+10;assert(a>=0&&a<Q);r.push_back(a);}return r;}
vector<int> primes(){vector<int> v;for(int n=2;(int)v.size()<FULL;n++){bool ok=true;for(int j=2;j*j<=n;j++)if(n%j==0){ok=false;break;}if(ok)v.push_back((n-1)%29);}return v;}
struct Best{int score=-1,idx=-1;};
Key key(int idx){Key h{};for(int j=5;j>=0;j--){h[j]=idx%Q;idx/=Q;}return h;}
int index(Key h){int n=0;for(int x:h)n=n*Q+x;return n;}
Best search(const vector<int>& c,const vector<int>& t,int end,bool reuse){
 int n=end-5;vector<uint8_t> a(B*n),b(B*n);
 for(int h=0;h<B;h++)for(int i=0;i<n;i++)a[h*n+i]=(c[i+5]+(h/A)*t[i+5]+((h/Q)%Q)*c[i+4]+(h%Q)*c[i+3])%Q;
 for(int h=0;h<B;h++)for(int i=0;i<n;i++)b[h*n+i]=((h/A)*c[i+2]+((h/Q)%Q)*c[i+1]+(h%Q)*c[i])%Q;
 Best best;if(reuse)best={10527,index({0,12,8,27,14,7})};
 auto start=chrono::steady_clock::now();
 #pragma omp parallel
 {Best local;
 #pragma omp for schedule(dynamic,1)
 for(int alpha=0;alpha<Q;alpha++){
  if(reuse&&alpha==0)continue;
  for(int aidx=alpha*A;aidx<(alpha+1)*A;aidx++){auto pa=a.data()+aidx*n;for(int j=0;j<B;j++){auto pb=b.data()+j*n;uint16_t hist[Q]{};int s=0;for(int i=0;i<n;i++){unsigned x=pa[i]+pb[i];x-=Q*(x>=Q);s+=hist[x]++;}int idx=aidx*B+j;if(s>local.score||(s==local.score&&idx<local.idx))local={s,idx};}}
  #pragma omp critical
  {if(local.score>best.score||(local.score==best.score&&local.idx<best.idx))best=local;cout<<"progress alpha="<<alpha<<" best="<<best.score<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<endl;}
 }}
 return best;
}
vector<int> project(const vector<int>& c,const vector<int>& t,Key h){vector<int> p;for(int i=5;i<(int)c.size();i++){int v=c[i]+h[0]*t[i];for(int j=0;j<5;j++)v+=h[j+1]*c[i-j-1];p.push_back(v%Q);}return p;}
int pairs(const vector<int>& p,int start,int end){int hist[Q]{},v=0;for(int i=start;i<end;i++)v+=hist[p[i]]++;return v;}
struct Affine{int a=0,b=0;double score=-numeric_limits<double>::infinity();};
Affine fit(const vector<int>& p,const array<double,Q>& logprob){Affine best;int hist[Q]{};for(int i=0;i<TRAIN-5;i++)hist[p[i]]++;for(int a=1;a<Q;a++)for(int b=0;b<Q;b++){double s=0;for(int x=0;x<Q;x++)s+=hist[x]*logprob[(a*x+b)%Q];if(s>best.score)best={a,b,s};}return best;}
vector<int> encrypt(const vector<int>& p,const vector<int>& t,Key h,int a,int b){vector<int> c;int ai=inv(a);for(int i=0;i<(int)p.size();i++){int n=ai*mod(p[i]-b)-h[0]*t[i];for(int j=0;j<5;j++)if(i>j)n-=h[j+1]*c[i-j-1];c.push_back(mod(n));}return c;}
void run(const string& name,const vector<int>& c,const vector<int>& t,const array<double,Q>& prob,const vector<int>* truth=nullptr,bool reuse=false){auto best=search(c,t,TRAIN,reuse);auto h=key(best.idx);auto p=project(c,t,h);assert(pairs(p,0,TRAIN-5)==best.score);auto a=fit(p,prob);for(int& x:p)x=(a.a*x+a.b)%Q;int held=pairs(p,TRAIN-5,FULL-5);cout<<name<<" train_pairs="<<best.score<<" ioc="<<2.*best.score/((TRAIN-5)*(TRAIN-6))<<" holdout_pairs="<<held<<" holdout_ioc="<<2.*held/((FULL-TRAIN)*(FULL-TRAIN-1))<<" key=";for(int x:h)cout<<x<<',';cout<<a.a<<','<<a.b<<endl;
 if(truth){int n=0,m=0;for(int i=5;i<FULL;i++)(i<TRAIN?n:m)+=(p[i-5]==(*truth)[i]);cout<<"exact_training="<<n<<"/751 exact_holdout="<<m<<"/265"<<endl;}
 vector<int> out(c.begin(),c.begin()+5);int ai=inv(a.a);for(int i=5;i<FULL;i++){int n=ai*mod(p[i-5]-a.b)-h[0]*t[i];for(int j=0;j<5;j++)n-=h[j+1]*out[i-j-1];out.push_back(mod(n));}assert(out==c);
 cout<<"decoded=";for(int x:p)cout<<"0123456789abcdefghijklmnopqrs"[x];cout<<endl;
}
int main(int argc,char**argv){string s,t;cin>>s>>t;auto c=read(s),d=read(t),q=primes();assert(c.size()==FULL&&d.size()==2979);omp_set_num_threads(4);array<double,Q> freq{},prob{};freq.fill(1);for(int i=FULL;i<(int)d.size();i++)freq[d[i]]++;for(int i=0;i<Q;i++)prob[i]=log(freq[i]/(d.size()-FULL+Q));vector<int> p(d.begin(),d.begin()+FULL);string mode=argc>1?argv[1]:"all";
 if(mode=="all"||mode=="plant")run("plant",encrypt(p,q,{7,19,7,24,16,12},13,4),q,prob,&p);
 if(mode=="all"||mode=="original"||mode=="original-reuse"){run("original",c,q,prob,nullptr,mode=="original-reuse");int mn=751*751;for(int i=0;i+751<=(int)d.size();i++)mn=min(mn,pairs(d,i,i+751));cout<<"native_min_pairs="<<mn<<" native_min_ioc="<<2.*mn/(751*750)<<endl;}}
