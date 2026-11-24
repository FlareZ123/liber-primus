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
constexpr int Q=29, A=Q*Q, B=Q*Q*Q, TRAIN=756, FULL=1021;
using Key=array<int,5>;
int mod(int n){return (n%Q+Q)%Q;}
int inv(int a){for(int x=1;x<Q;x++)if(a*x%Q==1)return x;assert(false);return 0;}
vector<int> read(string s){vector<int> r;for(char c:s){int a=c<='9'?c-'0':c-'a'+10;assert(a>=0&&a<Q);r.push_back(a);}return r;}
struct Best{int score=-1,idx=-1;};
Key key(int idx){Key h{};for(int j=4;j>=0;j--){h[j]=idx%Q;idx/=Q;}return h;}
Best search(const vector<int>& c,int end){
 const int n=end-5;vector<uint8_t> a(A*n),b(B*n);
 for(int h=0;h<A;h++)for(int i=0;i<n;i++)a[h*n+i]=(c[i+5]+(h/Q)*c[i+4]+(h%Q)*c[i+3])%Q;
 for(int h=0;h<B;h++)for(int i=0;i<n;i++)b[h*n+i]=((h/A)*c[i+2]+((h/Q)%Q)*c[i+1]+(h%Q)*c[i])%Q;
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
    int idx=k*B+j;if(score>local.score||(score==local.score&&idx<local.idx))local={score,idx};
   }
  }
  #pragma omp critical
  {if(local.score>best.score||(local.score==best.score&&local.idx<best.idx))best=local;}
 }
 return best;
}
vector<int> project(const vector<int>& c,Key h){vector<int> p;for(int i=5;i<(int)c.size();i++){int v=c[i];for(int j=0;j<5;j++)v+=h[j]*c[i-j-1];p.push_back(v%Q);}return p;}
int collisions(const vector<int>& p,int start,int end){int hist[Q]{},v=0;for(int i=start;i<end;i++)v+=hist[p[i]]++;return v;}
struct Affine{int a=0,b=0;double score=-numeric_limits<double>::infinity();};
Affine recoverAffine(const vector<int>& p,const array<double,Q>& logprob){Affine best;int hist[Q]{};for(int i=0;i<TRAIN-5;i++)hist[p[i]]++;for(int a=1;a<Q;a++)for(int b=0;b<Q;b++){double s=0;for(int x=0;x<Q;x++)s+=hist[x]*logprob[(a*x+b)%Q];if(s>best.score)best={a,b,s};}return best;}
vector<int> encrypt(const vector<int>& p,Key h,int a,int b){vector<int> c;int ai=inv(a);for(int i=0;i<(int)p.size();i++){int n=ai*mod(p[i]-b);for(int j=0;j<5;j++)if(i>j)n-=h[j]*c[i-j-1];c.push_back(mod(n));}return c;}
void printkey(Key h){for(int x:h)cout<<x<<',';}
void test(const string& name,const vector<int>& c,const array<double,Q>& logprob,const vector<int>* trueP=nullptr){
 auto start=chrono::steady_clock::now();auto best=search(c,TRAIN);Key h=key(best.idx);auto p=project(c,h);assert(collisions(p,0,TRAIN-5)==best.score);auto a=recoverAffine(p,logprob);for(int& x:p)x=(a.a*x+a.b)%Q;
 int test=collisions(p,TRAIN-5,FULL-5);cout<<name<<" best_training_pairs="<<best.score<<" train_ioc="<<(2.0*best.score/((TRAIN-5)*(TRAIN-6)))<<" h=";printkey(h);cout<<" a="<<a.a<<" b="<<a.b<<" holdout_ioc="<<2.0*test/((FULL-TRAIN)*(FULL-TRAIN-1))<<" time_sec="<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<'\n';
 if(trueP){int t=0,u=0;for(int i=5;i<TRAIN;i++)t+=(p[i-5]==(*trueP)[i]);for(int i=TRAIN;i<FULL;i++)u+=(p[i-5]==(*trueP)[i]);cout<<"exact_training="<<t<<"/"<<TRAIN-5<<" exact_holdout="<<u<<"/"<<FULL-TRAIN<<'\n';}
 vector<int> out(c.begin(),c.begin()+5);int ai=inv(a.a);for(int i=5;i<FULL;i++){int n=ai*mod(p[i-5]-a.b);for(int j=0;j<5;j++)n-=h[j]*out[i-j-1];out.push_back(mod(n));}assert(out==c);
 cout<<"decoded=";for(int x:p)cout<<"0123456789abcdefghijklmnopqrs"[x];cout<<endl;
}
int main(int argc,char**argv){string s,t;cin>>s>>t;auto c=read(s),native=read(t);assert(c.size()==FULL&&native.size()==2979);omp_set_num_threads(4);array<double,Q> freq{},logprob{};freq.fill(1);for(int i=FULL;i<(int)native.size()-FULL;i++)freq[native[i]]++;for(int i=0;i<Q;i++)logprob[i]=log(freq[i]/(native.size()-2*FULL+Q));
 vector<int> p1(native.begin(),native.begin()+FULL),p2(native.end()-FULL,native.end());
 Key h1={19,7,24,16,12},h2={8,27,5,3,21};string which=argc>1?argv[1]:"all";
 if(which=="plant1"||which=="all")test("plant1",encrypt(p1,h1,13,4),logprob,&p1);
 if(which=="plant2"||which=="all")test("plant2",encrypt(p2,h2,24,17),logprob,&p2);
 if(which=="original"||which=="all")test("original",c,logprob);
 if(which=="full"||which=="all"){auto f=search(c,FULL);cout<<"original_full_allkey_pairs="<<f.score<<" full_ioc="<<2.0*f.score/((FULL-5)*(FULL-6))<<" key=";printkey(key(f.idx));cout<<endl;
 for(int n:{TRAIN-5,FULL-5}){int mn=n*n,mx=0;for(int start=0;start+n<=(int)native.size();start++){int count=collisions(native,start,start+n);mn=min(mn,count);mx=max(mx,count);}cout<<"native_windows n="<<n<<" count="<<native.size()-n+1<<" min_pairs="<<mn<<" max_pairs="<<mx<<" min_ioc="<<2.0*mn/(n*(n-1))<<endl;}}
}
