#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <queue>
#include <string>
#include <vector>
using namespace std;

static constexpr uint64_t P=1259, Q=1031, R=1229;
static constexpr uint64_t N=P*Q*R;
static constexpr int M=29, HEAD=28, MAX_SKIPS=4, KEEP=800;
static constexpr double PENALTY=3.5;

struct Candidate { double score; uint32_t state; int sign; };
struct MinCmp { bool operator()(const Candidate&a,const Candidate&b)const{return a.score>b.score;} };

static double uni[29], bi[841], tri[24389];
static int cipher[HEAD];

static uint64_t invmod(uint64_t a,uint64_t m){
  int64_t t=0,nt=1,r=(int64_t)m,nr=(int64_t)a;
  while(nr){int64_t q=r/nr;int64_t z=t-q*nt;t=nt;nt=z;z=r-q*nr;r=nr;nr=z;}
  if(r!=1)throw runtime_error("CRT inverse missing");
  if(t<0)t+=(int64_t)m;
  return (uint64_t)t;
}
static int mod29(int x){x%=M;return x<0?x+M:x;}

static void makeKey(uint64_t first,uint8_t*out,int length){
  uint64_t x=first;
  for(int i=0;i<length;i++){
    int v=0;
    for(int b=0;b<5;b++){
      v=(v<<1)|(int)(x&1ULL);
      x=(x*x)%N;
    }
    out[i]=(uint8_t)(v%M);
  }
}

static double headScore(const uint8_t*key,int sign){
  double dp[2*(MAX_SKIPS+1)],nx[2*(MAX_SKIPS+1)];
  for(double &v:dp)v=-numeric_limits<double>::infinity();
  auto get=[&](int i,int e){return mod29(cipher[i]-sign*(int)key[i+e]);};
  dp[0]=uni[get(0,0)];
  for(int i=1;i<HEAD;i++){
    for(double &v:nx)v=-numeric_limits<double>::infinity();
    for(int e=0;e<=MAX_SKIPS;e++)for(int prevSkip=0;prevSkip<=1;prevSkip++){
      int st=2*e+prevSkip;double old=dp[st];
      if(!isfinite(old))continue;
      int pprev=get(i-1,e);
      int pprev2=i>1?get(i-2,e-prevSkip):0;
      for(int skip=0;skip<=1&&e+skip<=MAX_SKIPS;skip++){
        int p=get(i,e+skip);
        if(skip&&mod29(p+sign*(int)key[i+e])!=cipher[i-1])continue;
        double logv=(i==1)?bi[pprev*M+p]:tri[(pprev2*M+pprev)*M+p];
        double next=old+logv-PENALTY*skip;
        int target=2*(e+skip)+skip;
        if(next>nx[target])nx[target]=next;
      }
    }
    for(int j=0;j<2*(MAX_SKIPS+1);j++)dp[j]=nx[j];
  }
  double best=-numeric_limits<double>::infinity();
  for(double v:dp)if(v>best)best=v;
  return best/HEAD;
}

static vector<int> qr(uint64_t p){
  vector<uint8_t> seen(p,0);
  for(uint64_t x=0;x<p;x++)seen[(x*x)%p]=1;
  vector<int> out;
  for(uint64_t x=0;x<p;x++)if(seen[x])out.push_back((int)x);
  return out;
}

int main(int argc,char**argv){
  if(argc!=2){cerr<<"usage: search run-artifacts\n";return 2;}
  string dir=argv[1];
  {
    ifstream f(dir+"/lm.bin",ios::binary);
    if(!f)throw runtime_error("lm.bin missing");
    f.read((char*)uni,sizeof(uni));f.read((char*)bi,sizeof(bi));f.read((char*)tri,sizeof(tri));
    if(!f||f.peek()!=EOF)throw runtime_error("LM binary size mismatch");
  }
  {
    ifstream f(dir+"/cipher.bin",ios::binary);
    if(!f)throw runtime_error("cipher.bin missing");
    uint8_t c[HEAD];f.read((char*)c,HEAD);if(!f||f.peek()!=EOF)throw runtime_error("cipher size mismatch");
    for(int i=0;i<HEAD;i++){cipher[i]=c[i];if(cipher[i]>=M)throw runtime_error("cipher rune out of range");}
  }
  uint64_t trueState=0;
  {ifstream f(dir+"/true_state.txt");if(!(f>>trueState))throw runtime_error("true state missing");}
  uint8_t trueKey[320],computed[320];
  {ifstream f(dir+"/truekey.bin",ios::binary);f.read((char*)trueKey,320);if(!f||f.peek()!=EOF)throw runtime_error("true key size mismatch");}
  makeKey(trueState,computed,320);
  for(int i=0;i<320;i++)if(computed[i]!=trueKey[i])throw runtime_error("fivebits-msb key stream disagrees with established generator");

  auto rp=qr(P),rq=qr(Q),rr=qr(R);
  if(rp.size()!=630||rq.size()!=516||rr.size()!=615)throw runtime_error("quadratic residue set sizes mismatch");
  const uint64_t cp=(N/P)*invmod((N/P)%P,P);
  const uint64_t cq=(N/Q)*invmod((N/Q)%Q,Q);
  const uint64_t cr=(N/R)*invmod((N/R)%R,R);
  if(cp%P!=1||cp%Q!=0||cp%R!=0||cq%P!=0||cq%Q!=1||cq%R!=0||cr%P!=0||cr%Q!=0||cr%R!=1)throw runtime_error("CRT coefficients invalid");
  uint64_t a=trueState%P,b=trueState%Q,c=trueState%R;
  uint64_t recon=(a*cp+b*cq+c*cr)%N;
  if(recon!=trueState)throw runtime_error("CRT does not reconstruct known source state");
  if(!((a*cp+b*cq+c*cr)%N==trueState))throw runtime_error("known state absent from CRT domain");

  priority_queue<Candidate,vector<Candidate>,MinCmp> heap;
  uint64_t processed=0;
  uint8_t key[HEAD+MAX_SKIPS+4];
  for(int av:rp)for(int bv:rq)for(int cv:rr){
    uint64_t state=((uint64_t)av*cp+(uint64_t)bv*cq+(uint64_t)cv*cr)%N;
    makeKey(state,key,HEAD+MAX_SKIPS+4);
    for(int sign: {-1,1}){
      Candidate hit{headScore(key,sign),(uint32_t)state,sign};
      if(heap.size()<KEEP)heap.push(hit);
      else if(hit.score>heap.top().score){heap.pop();heap.push(hit);}
    }
    processed++;
    if(processed%10000000ULL==0)cerr<<"states "<<processed<<" / 199924200\n";
  }
  if(processed!=199924200ULL)throw runtime_error("state enumeration count mismatch");
  vector<Candidate> top;
  while(!heap.empty()){top.push_back(heap.top());heap.pop();}
  sort(top.begin(),top.end(),[](const Candidate&a,const Candidate&b){return a.score>b.score;});
  ofstream out(dir+"/top800.tsv");
  if(!out)throw runtime_error("cannot write top800.tsv");
  out<<setprecision(17);
  for(const auto&x:top)out<<x.score<<"\t"<<x.state<<"\t"<<x.sign<<"\n";
  out.close();
  cout<<"{\"states_enumerated\":"<<processed<<",\"candidate_decodes\":"<<processed*2
      <<",\"qr_sizes\":["<<rp.size()<<","<<rq.size()<<","<<rr.size()<<"]"
      <<",\"known_seed3301_state\":"<<trueState
      <<",\"known_key_match\":true,\"top_score\":"<<setprecision(17)<<top.front().score
      <<",\"top_state\":"<<top.front().state<<",\"top_sign\":"<<top.front().sign<<"}\n";
  return 0;
}
