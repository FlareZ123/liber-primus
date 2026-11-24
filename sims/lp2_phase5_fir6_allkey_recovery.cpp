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
using Key=array<int,5>;
int mod(int n){return (n%Q+Q)%Q;}
int inv(int a){for(int x=1;x<Q;x++)if(a*x%Q==1)return x;assert(false);return 0;}
vector<int> read(string s){vector<int> r;for(char c:s){int a=c<='9'?c-'0':c-'a'+10;assert(a>=0&&a<Q);r.push_back(a);}return r;}
struct Best{int score=-1,idx=-1;};
Key key(int idx){Key h{};for(int j=4;j>=0;j--){h[j]=idx%Q;idx/=Q;}return h;}
Best search(const vector<int>& c,const vector<int>& pos){
 int n=pos.size();vector<uint8_t> a(A*n),b(B*n);
 for(int h=0;h<A;h++)for(int j=0;j<n;j++){int i=pos[j];a[h*n+j]=(c[i]+(h/Q)*c[i-1]+(h%Q)*c[i-2])%Q;}
 for(int h=0;h<B;h++)for(int j=0;j<n;j++){int i=pos[j];b[h*n+j]=((h/A)*c[i-3]+((h/Q)%Q)*c[i-4]+(h%Q)*c[i-5])%Q;}
 Best best;
 #pragma omp parallel
 {Best local;
 #pragma omp for schedule(static)
 for(int j=0;j<B;j++){const uint8_t* pb=b.data()+j*n;for(int k=0;k<A;k++){const uint8_t* pa=a.data()+k*n;uint16_t hist[Q]{};int score=0;for(int i=0;i<n;i++){unsigned x=pa[i]+pb[i];x-=Q*(x>=Q);score+=hist[x]++;}int idx=k*B+j;if(score>local.score||(score==local.score&&idx<local.idx))local={score,idx};}}
 #pragma omp critical
 {if(local.score>best.score||(local.score==best.score&&local.idx<best.idx))best=local;}}
 return best;
}
vector<int> project(const vector<int>& c,Key h,const vector<int>& pos){vector<int> p;for(int i:pos){int v=c[i];for(int j=0;j<5;j++)v+=h[j]*c[i-j-1];p.push_back(v%Q);}return p;}
int collisions(const vector<int>& p){int hist[Q]{},v=0;for(int x:p)v+=hist[x]++;return v;}
struct Affine{int a=0,b=0;double score=-numeric_limits<double>::infinity();};
Affine recoverAffine(const vector<int>& p,const array<double,Q>& logprob){Affine best;int hist[Q]{};for(int x:p)hist[x]++;for(int a=1;a<Q;a++)for(int b=0;b<Q;b++){double s=0;for(int x=0;x<Q;x++)s+=hist[x]*logprob[(a*x+b)%Q];if(s>best.score)best={a,b,s};}return best;}
struct PhaseKey{Key h;int a,b;};
using Phases=array<PhaseKey,5>;
vector<int> encrypt(const vector<int>& p,const Phases& k){vector<int> c;for(int i=0;i<(int)p.size();i++){auto z=k[i%5];int n=inv(z.a)*mod(p[i]-z.b);for(int j=0;j<5;j++)if(i>j)n-=z.h[j]*c[i-j-1];c.push_back(mod(n));}return c;}
void printkey(Key h){for(int x:h)cout<<x<<',';}
vector<int> positions(int phase,int start,int end){vector<int> p;for(int i=start;i<end;i++)if(i%5==phase)p.push_back(i);return p;}
long long denom(int start,int end){long long n=0;for(int f=0;f<5;f++){auto s=positions(f,start,end).size();n+=s*(s-1)/2;}return n;}
int nativePairs(const vector<int>& p,int start,int n){int count=0;for(int phase=0;phase<5;phase++){vector<int> a;for(int i=phase;i<n;i+=5)a.push_back(p[start+i]);count+=collisions(a);}return count;}
void test(const string& name,const vector<int>& c,const array<double,Q>& logprob,const vector<int>* truth=nullptr,const Phases* planted=nullptr){
 auto start=chrono::steady_clock::now();Phases keys{};vector<int> p(FULL,-1);int sTrain=0,sTest=0,matched=0;
 for(int f=0;f<5;f++){auto train=positions(f,5,TRAIN),hold=positions(f,TRAIN,FULL);auto best=search(c,train);auto h=key(best.idx);auto q=project(c,h,train);assert(collisions(q)==best.score);auto a=recoverAffine(q,logprob);keys[f]={h,a.a,a.b};if(planted){auto t=(*planted)[f];matched+=(t.h==h&&t.a==a.a&&t.b==a.b);}sTrain+=best.score;auto r=project(c,h,hold);sTest+=collisions(r);for(size_t i=0;i<train.size();i++)p[train[i]]=(a.a*q[i]+a.b)%Q;for(size_t i=0;i<hold.size();i++)p[hold[i]]=(a.a*r[i]+a.b)%Q;cout<<name<<" phase="<<f<<" train_pairs="<<best.score<<" holdout_pairs="<<collisions(r)<<" h=";printkey(h);cout<<" a="<<a.a<<" b="<<a.b<<endl;}
 cout<<name<<" train_pairs="<<sTrain<<" train_ioc="<<double(sTrain)/denom(5,TRAIN)<<" holdout_pairs="<<sTest<<" holdout_ioc="<<double(sTest)/denom(TRAIN,FULL)<<" time_sec="<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<endl;
 if(truth){int t=0,u=0;for(int i=5;i<TRAIN;i++)t+=(p[i]==(*truth)[i]);for(int i=TRAIN;i<FULL;i++)u+=(p[i]==(*truth)[i]);cout<<"exact_phase_keys="<<matched<<"/5 exact_training="<<t<<"/"<<TRAIN-5<<" exact_holdout="<<u<<"/"<<FULL-TRAIN<<endl;}
 vector<int> out(c.begin(),c.begin()+5);for(int i=5;i<FULL;i++){auto z=keys[i%5];int n=inv(z.a)*mod(p[i]-z.b);for(int j=0;j<5;j++)n-=z.h[j]*out[i-j-1];out.push_back(mod(n));}assert(out==c);cout<<"decoded=";for(int i=5;i<FULL;i++)cout<<"0123456789abcdefghijklmnopqrs"[p[i]];cout<<endl;
}
int main(){string s,t;cin>>s>>t;auto c=read(s),native=read(t);assert(c.size()==FULL&&native.size()==2979);omp_set_num_threads(4);array<double,Q> freq{},logprob{};freq.fill(1);for(int i=FULL;i<(int)native.size()-FULL;i++)freq[native[i]]++;for(int i=0;i<Q;i++)logprob[i]=log(freq[i]/(native.size()-2*FULL+Q));
 vector<int> p1(native.begin(),native.begin()+FULL),p2(native.end()-FULL,native.end());
 Phases a={PhaseKey{{19,7,24,16,12},13,4},PhaseKey{{8,27,5,3,21},24,17},PhaseKey{{12,2,1,8,3},11,9},PhaseKey{{1,28,13,6,15},17,2},PhaseKey{{18,8,21,4,25},3,15}};
 Phases b={PhaseKey{{9,2,17,8,5},2,7},PhaseKey{{11,20,3,15,25},19,26},PhaseKey{{4,13,24,18,2},22,1},PhaseKey{{1,3,17,8,29-1},6,5},PhaseKey{{23,14,2,17,8},11,19}};
 test("plant1",encrypt(p1,a),logprob,&p1,&a);test("plant2",encrypt(p2,b),logprob,&p2,&b);test("original",c,logprob);
 int sum=0;for(int f=0;f<5;f++){auto x=search(c,positions(f,5,FULL));sum+=x.score;cout<<"full phase="<<f<<" max_pairs="<<x.score<<" key=";printkey(key(x.idx));cout<<endl;}
 cout<<"full_max_pairs="<<sum<<" ioc="<<double(sum)/denom(5,FULL)<<endl;
 for(int n:{TRAIN-5,FULL-5}){int mn=n*n,mx=0;for(int start=0;start+n<=(int)native.size();start++){int v=nativePairs(native,start,n);mn=min(mn,v);mx=max(mx,v);}cout<<"native_windows n="<<n<<" count="<<native.size()-n+1<<" min_pairs="<<mn<<" max_pairs="<<mx<<" min_ioc="<<double(mn)/denom(0,n)<<endl;}
}
