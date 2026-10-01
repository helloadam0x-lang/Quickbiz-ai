import soundfile as sf, numpy as np, json
import os
from kokoro_onnx import Kokoro
MODELS=os.environ.get('KOKORO_DIR','.')
k=Kokoro(os.path.join(MODELS,'kokoro-v1.0.onnx'),os.path.join(MODELS,'voices-v1.0.bin'))
OUT=os.path.join(os.path.dirname(__file__),'..','public','vo')+'/'
LINES=[
 ('l01','af_heart',0.95,"Let me guess."),
 ('l02','af_heart',0.95,"Your phone hasn't stopped buzzing since morning."),
 ('c1','am_michael',1.05,"Hey, how much is this one?"),
 ('c2','bf_emma',1.05,"Is it still available?"),
 ('c3','am_adam',1.05,"Can you deliver to Ntinda today?"),
 ('c4','af_nicole',1.1,"Hello? Are you there?"),
 ('l03','af_heart',0.95,"And every message you miss... is a sale you just lost."),
 ('l04','af_heart',0.93,"Meet GetOrda."),
 ('l05','af_heart',0.95,"Your AI employee, right inside WhatsApp."),
 ('l06','af_heart',0.95,"It answers every customer, in their own language, from your real products and prices."),
 ('l07','af_heart',0.95,"It takes the order, shares your mobile money details, and tracks it all the way to their door."),
 ('l08','af_heart',0.95,"And it only calls you when it truly needs you."),
 ('l09','af_heart',0.95,"Your own store, live in a minute."),
 ('l10','af_heart',0.95,"Your best customers, back in one tap."),
 ('l11','af_heart',0.92,"Every customer. Always answered."),
 ('l12','af_heart',0.93,"PH:ɡɛt ˈɔːɹdə. stˈɑːɹt fɹˈiː, æt ɡɛt ˈɔːɹdə dˈɑːt ˈæp."),
]
meta={}
for key,v,sp,txt in LINES:
    ph=txt.startswith('PH:')
    a,sr=k.create(txt[3:] if ph else txt,voice=v,speed=sp,lang='en-gb' if v[0]=='b' else 'en-us',is_phonemes=ph)
    if ph: txt='GetOrda. Start free, at getorda dot app.'
    env=np.convolve(np.abs(a),np.ones(240)/240,'same'); thr=0.004*env.max()
    idx=np.where(env>thr)[0]; a=a[max(0,idx[0]-int(0.08*sr)):idx[-1]+int(0.15*sr)]
    sf.write(OUT+key+'.wav',a,sr); meta[key]={'dur':round(len(a)/sr,3),'text':txt,'voice':v}
    print(f"{key} {len(a)/sr:5.2f}s  {txt}")
json.dump(meta,open(OUT+'meta.json','w'),indent=1)
