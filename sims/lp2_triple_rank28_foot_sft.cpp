// Three-way predecessor-excluding rank28 shared-pad inverse.
// All reserved GP29 runes, both repeat-clock laws, exact trigram marginals.
// Fixed foot alignment: 75 observed differences from each last76-rune page window.
#include <algorithm>
#include <array>
#include <atomic>
#include <cassert>
#include <chrono>
#include <cmath>
#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <sstream>
#include <string>
#include <thread>
#include <vector>
using namespace std;
constexpr int Q=29,K=28,S=30,W=32,START=29,L=75,H=47;
using Tape=vector<int>;using Triple=array<Tape,3>;using Row=array<double,W>;
double M[S][S][Q];
int mod(int x,int m){return (x%m+m)%m;}
vector<int> arr(const string&s,const string&key){
 auto p=s.find("\""+key+"\"");assert(p!=string::npos);p=s.find('[',p);
 vector<int> out;int d=0;do{char c=s[p];if(c=='[')++d;else if(c==']')--d;
 else if(c>='0'&&c<='9'){int v=0;do{v=v*10+s[p]-'0';++p;}while(s[p]>='0'&&s[p]<='9');out.push_back(v);continue;}++p;}while(d);return out;
}
int integer(const string&s,const string&key){auto p=s.find("\""+key+"\"");assert(p!=string::npos);return stoi(s.substr(s.find(':',p)+1));}
Triple split(const vector<int>&v){assert(v.size()==3*L);return {Tape(v.begin(),v.begin()+L),Tape(v.begin()+L,v.begin()+2*L),Tape(v.begin()+2*L,v.end())};}
Triple prefix(const Triple&t,int n){Triple p;for(int j=0;j<3;j++)p[j]=Tape(t[j].begin(),t[j].begin()+n);return p;}
int plain(int d,int key,int R){if(!d)return R;int q=mod(d-1-key,K);return q<R?q:q+1;}
int delta(int p,int key,int R){if(p==R)return 0;return 1+mod((p<R?p:p-1)+key,K);}
struct Group{int d,h,tail;};
vector<Group> groups(const Tape&t,bool skip){
 vector<Group> g;int h=0;for(int d:t){if(skip&&!d)h++;else{g.push_back({d,h,0});h=0;}}
 assert(!g.empty()&&h<=1);g.back().tail=h;return g;
}
struct Cache{
 int R;vector<Row> rows;Row unit;
 size_t id(int tail,int a,int b,int d)const{return (((size_t)tail*S+a)*S+b)*Q+d;}
 Cache(int r):R(r),rows(2*S*S*Q){
  unit.fill(1);for(int k=K;k<W;k++)unit[k]=0;
  for(int tail=0;tail<=1;tail++)for(int a=0;a<S;a++)for(int b=0;b<S;b++)for(int d=0;d<Q;d++){
   auto&row=rows[id(tail,a,b,d)];for(int k=0;k<K;k++){int p=plain(d,k,R);row[k]=M[a][b][p]*(tail?M[b][p][R]:1);}
  }
 }
 struct Factor{const Row*r;double w;};
 Factor factor(const vector<Group>&g,int t,int i,int j)const{
  if(t>=int(g.size()))return{&unit,1};
  int b=t?plain(g[t-1].d,j,R):START,a=START;
  if(t&&g[t-1].h)a=R;else if(t>=2)a=plain(g[t-2].d,i,R);
  double w=1;for(int h=0;h<g[t].h;h++){w*=M[a][b][R];a=b;b=R;}
  return{&rows[id(g[t].tail,a,b,g[t].d)],w};
 }
 double single(const Tape&t)const{
  array<double,S*W>p{},n{};p[START*W+START]=1;
  for(int d:t){n.fill(0);for(int a=0;a<S;a++)for(int b=0;b<S;b++){
   double v=p[a*W+b];if(!v)continue;
   if(!d)n[b*W+R]+=v*M[a][b][R];
   else{v/=K;for(int k=0;k<Q;k++)if(k!=R)n[b*W+k]+=v*M[a][b][k];}
  }p=n;}
  double x=accumulate(p.begin(),p.end(),0.0);assert(isfinite(x)&&x>0);return log(x);
 }
 struct Val{double loglr=0,map=0;Tape key;Triple p;};
 Val joint(const Triple&t,bool skip,bool trace=false)const{
  auto a=groups(t[0],skip),b=groups(t[1],skip),c=groups(t[2],skip);int len=max({a.size(),b.size(),c.size()});
  array<double,S*W>p{},n{},v{},u{};p[START*W+START]=v[START*W+START]=1;
  vector<array<unsigned char,S*W>>back;if(trace)back.resize(len);
  for(int z=0;z<len;z++){
   n.fill(0);if(trace)u.fill(0);
   int is=z<2?START:0,ie=z<2?START+1:K,js=z==0?START:0,je=z==0?START+1:K;
   for(int i=is;i<ie;i++)for(int j=js;j<je;j++){
    int ij=i*W+j;double pv=p[ij],vv=trace?v[ij]:0;if(!pv&&!vv)continue;
    auto A=factor(a,z,i,j),B=factor(b,z,i,j),C=factor(c,z,i,j);
    double w=A.w*B.w*C.w/K;const Row&ra=*A.r,&rb=*B.r,&rc=*C.r;
    double q=pv*w;for(int k=0;k<K;k++)n[j*W+k]+=q*ra[k]*rb[k]*rc[k];
    if(trace){double qv=vv*w;for(int k=0;k<K;k++){double x=qv*ra[k]*rb[k]*rc[k];if(x>u[j*W+k]){u[j*W+k]=x;back[z][j*W+k]=i;}}}
   }p=n;if(trace)v=u;
  }
  Val out;double lr=accumulate(p.begin(),p.end(),0.0);assert(isfinite(lr)&&lr>0);out.loglr=log(lr);
  if(trace){
   int idx=max_element(v.begin(),v.end())-v.begin();out.map=log(v[idx]);assert(isfinite(out.map));out.key.resize(len);
   for(int z=len-1;z>=0;z--){int j=idx/W,k=idx%W;assert(k<K);out.key[z]=k;idx=back[z][idx]*W+j;}
   for(int j=0;j<3;j++){auto g=groups(t[j],skip);int k=0;for(auto&x:g){out.p[j].insert(out.p[j].end(),x.h,R);out.p[j].push_back(plain(x.d,out.key[k++],R));out.p[j].insert(out.p[j].end(),x.tail,R);}
    Tape replay;int i=0;for(int x:out.p[j]){if(skip&&x==R)replay.push_back(0);else replay.push_back(delta(x,out.key[i++],R));}assert(replay==t[j]);}
  }return out;
 }
};
double lse(const vector<double>&v){double m=*max_element(v.begin(),v.end()),s=0;for(double x:v)s+=exp(x-m);return m+log(s);}
struct RowResult{int R;double den,denPrefix,ordinary,skip,prefix;};
struct Result{int R,skip,correct,total,keyCorrect,keyTotal;double bf,prefix,held,posterior,seconds;Cache::Val decode;};
Result test(const Triple&t,int trueR,int trueSkip,const Triple&trueP,const Tape&trueK){
 auto start=chrono::steady_clock::now();
 vector<RowResult>r(Q);auto pr=prefix(t,H);atomic<int>cur{0};
 auto work=[&](){for(;;){int R=cur.fetch_add(1);if(R>=Q)return;Cache c(R);double den=0,dp=0;for(int j=0;j<3;j++){den+=c.single(t[j]);dp+=c.single(pr[j]);}
  r[R]={R,den,dp,c.joint(t,false).loglr,c.joint(t,true).loglr,c.joint(pr,false).loglr};}};
 vector<thread>th;int nt=max(1u,min(4u,thread::hardware_concurrency()));for(int j=0;j<nt;j++)th.emplace_back(work);for(auto&x:th)x.join();
 vector<double>num,den,np,dp;int Rbest=0,sbest=0;double best=-1e300;
 for(auto&x:r){den.push_back(x.den);den.push_back(x.den);dp.push_back(x.denPrefix);dp.push_back(x.denPrefix);
  np.push_back(x.prefix);np.push_back(x.prefix);for(int s=0;s<2;s++){double val=s?x.skip:x.ordinary;num.push_back(val);if(val>best){best=val;Rbest=x.R;sbest=s;}}}
 double n=lse(num),bf=n-lse(den),pref=lse(np)-lse(dp);Cache c(Rbest);auto d=c.joint(t,sbest,true);assert(abs(d.loglr-best)<1e-8);
 int correct=0,total=0,kc=0,kt=0;if(trueR>=0){
  for(int j=0;j<3;j++)for(int i=0;i<L;i++){correct+=d.p[j][i]==trueP[j][i];total++;}
  kt=L;if(trueSkip)for(auto&p:trueP)kt=min(kt,int(count_if(p.begin(),p.end(),[&](int x){return x!=trueR;})));
  if(Rbest==trueR&&sbest==trueSkip)for(int i=0;i<min(kt,int(d.key.size()));i++)kc+=d.key[i]==trueK[i];
 }
 double secs=chrono::duration<double>(chrono::steady_clock::now()-start).count();
 return {Rbest,sbest,correct,total,kc,kt,bf,pref,bf-pref,exp(best-n),secs,move(d)};
}
template<typename T>string nums(const T&x){ostringstream o;o<<"[";bool first=true;for(int y:x){if(!first)o<<",";first=false;o<<y;}o<<"]";return o.str();}
string json(const Result&r,bool trace=true){
 ostringstream o;o<<setprecision(12)<<"{\"R\":"<<r.R<<",\"skip\":"<<r.skip<<",\"correct\":"<<r.correct<<",\"total\":"<<r.total<<",\"key_correct\":"<<r.keyCorrect<<",\"key_total\":"<<r.keyTotal<<",\"bf\":"<<r.bf<<",\"prefix_bf\":"<<r.prefix<<",\"held_bf\":"<<r.held<<",\"model_posterior\":"<<r.posterior<<",\"seconds\":"<<r.seconds;
 if(trace)o<<",\"key\":"<<nums(r.decode.key)<<",\"plain\":["<<nums(r.decode.p[0])<<","<<nums(r.decode.p[1])<<","<<nums(r.decode.p[2])<<"]";o<<"}";return o.str();
}
int main(){
 ifstream f("im-results/lp2-triple-rank28-foot-fixtures.json");assert(f);string s((istreambuf_iterator<char>(f)),{});
 auto u=arr(s,"n1"),b=arr(s,"n2"),tri=arr(s,"n3");assert(u.size()==Q&&b.size()==Q*Q&&tri.size()==Q*Q*Q);
 double N=accumulate(u.begin(),u.end(),0.0),U[Q],B[Q][Q];
 for(int p=0;p<Q;p++)U[p]=(u[p]+.5)/(N+14.5);
 for(int p=0;p<Q;p++){double row=accumulate(b.begin()+p*Q,b.begin()+(p+1)*Q,0.0);for(int q=0;q<Q;q++)B[p][q]=(b[p*Q+q]+12*U[q])/(row+12);}
 for(int a=0;a<S;a++)for(int b=0;b<S;b++){
  double sum=0;if(a<Q&&b<Q)for(int k=0;k<Q;k++)sum+=tri[(a*Q+b)*Q+k];
  for(int k=0;k<Q;k++)M[a][b][k]=Q*(b==START?U[k]:a==START?B[b][k]:(tri[(a*Q+b)*Q+k]+9*B[b][k])/(sum+9));
 }
 int pf=0,ph=0,nf=0,rec=0,models=0;vector<string>rs;auto i=s.find("\"controls\"");
 for(int t=0;t<8;t++){
  i=s.find('{',i);auto j=s.find('}',i);string x=s.substr(i,j-i+1);i=j+1;int R=integer(x,"R"),sk=integer(x,"skip");
  auto p=test(split(arr(x,"positive")),R,sk,split(arr(x,"p")),arr(x,"k"));pf+=p.bf>0;ph+=p.held>0;rec+=p.correct>=.7*p.total;models+=p.R==R&&p.skip==sk;
  cout<<"positive "<<t<<" "<<json(p,false)<<endl;
  auto n=test(split(arr(x,"negative")),-1,-1,{},{});nf+=n.bf<0;cout<<"negative "<<t<<" "<<json(n,false)<<endl;
  rs.push_back("{\"trial\":"+to_string(t)+",\"true_R\":"+to_string(R)+",\"true_skip\":"+to_string(sk)+",\"positive\":"+json(p)+",\"negative\":"+json(n)+"}");
 }
 bool pass=pf>=6&&ph>=6&&nf>=7&&rec>=6;cout<<"gate "<<pf<<" "<<ph<<" "<<nf<<" "<<rec<<" "<<models<<" "<<pass<<endl;
 string orig="null";if(pass){orig=json(test(split(arr(s,"original")),-1,-1,{},{}));cout<<"original "<<orig<<endl;}
 ostringstream out;out<<"{\"controls\":[";for(int i=0;i<8;i++){if(i)out<<",";out<<rs[i];}out<<"],\"gate\":{\"positive_full\":"<<pf<<",\"positive_held\":"<<ph<<",\"negative_full\":"<<nf<<",\"recovered\":"<<rec<<",\"correct_model\":"<<models<<",\"pass\":"<<(pass?"true":"false")<<"},\"original\":"<<orig<<"}";
 cout<<out.str()<<endl;if(const char*p=getenv("SFT_OUTPUT")){ofstream o(p);o<<out.str()<<endl;}
}
