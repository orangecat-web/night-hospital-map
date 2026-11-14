"""地圖可見性／Chrome F12 尺寸回歸。先啟動 npm run dev，再執行本檔。
需要 Python Playwright 與 Chromium；外部地圖使用測試回應，不會致電或導航。
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE = os.environ.get('VET_UI_BASE_URL', 'http://localhost:5174/')
CHROMIUM = os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE')
if not CHROMIUM and Path('/usr/bin/chromium').is_file():
 CHROMIUM = '/usr/bin/chromium'
HTML='''<meta charset="utf-8"><body style="margin:0"><div id="mapDiv"></div><script>const w=innerWidth,h=innerHeight;document.querySelector('#mapDiv').style.cssText='width:'+w+'px;height:'+h+'px;background:#ccdcb9';parent.postMessage({source:'frame-size-fixture',width:w,height:h,ratio:devicePixelRatio},'*')</script></body>'''
INIT='''window.__mapBoots=[];addEventListener('message',e=>{if(e.data?.source==='frame-size-fixture')window.__mapBoots.push(e.data)});
const native=HTMLDialogElement.prototype.showModal;
HTMLDialogElement.prototype.showModal=function(){const dialog=this;setTimeout(()=>native.call(dialog),650)};'''
with sync_playwright() as p:
 options = {'headless': True}
 if CHROMIUM: options['executable_path'] = CHROMIUM
 b=p.chromium.launch(**options)
 c=b.new_context(viewport={'width':417,'height':700},is_mobile=True,has_touch=True,device_scale_factor=1)
 page=c.new_page();page.add_init_script(INIT)
 page.route('https://data.moa.gov.tw/**',lambda r:r.abort())
 page.route('https://*.google.com/**',lambda r:r.fulfill(status=200,content_type='text/html',body=HTML))
 page.goto(BASE,wait_until='networkidle')
 page.get_by_role('button',name='打開地圖',exact=True).click()
 page.wait_for_timeout(300)
 assert page.locator('.map-iframe').count()==0
 assert page.evaluate('window.__mapBoots.length')==0
 page.locator('.mobile-map-dialog[open]').wait_for()
 iframe=page.locator('.map-iframe');iframe.wait_for()
 page.wait_for_function('window.__mapBoots.length>0')
 first=page.evaluate('window.__mapBoots.at(-1)')
 assert first['width']>250 and first['height']>250,first
 assert int(iframe.get_attribute('width'))==iframe.evaluate('(e)=>e.clientWidth')
 assert int(iframe.get_attribute('height'))==iframe.evaluate('(e)=>e.clientHeight')
 print('PASS delayed dialog: no hidden iframe; valid initial viewport',first,flush=True)
 page.wait_for_timeout(1100)
 assert page.evaluate('window.__mapBoots.length')==1
 print('PASS idle: no repeated iframe loads',flush=True)
 # 模擬 F12 同一 CSS 尺寸只把 DPR 由 1 改 3。
 old=iframe.element_handle();cdp=c.new_cdp_session(page)
 cdp.send('Emulation.setDeviceMetricsOverride',{'width':417,'height':700,'deviceScaleFactor':3,'mobile':True})
 page.wait_for_function('devicePixelRatio===3')
 page.wait_for_function('(e)=>!e.isConnected',arg=old)
 page.wait_for_function('window.__mapBoots.length>=2')
 assert page.evaluate('window.__mapBoots.at(-1).width')==first['width']
 print('PASS F12 DPR-only change: same CSS size, iframe reinitialized at DPR 3',flush=True)
 # 裝置寬高變化也需使用目前尺寸重新初始化。
 old=iframe.element_handle()
 cdp.send('Emulation.setDeviceMetricsOverride',{'width':320,'height':640,'deviceScaleFactor':3,'mobile':True})
 page.wait_for_function('(e)=>!e.isConnected',arg=old)
 page.wait_for_function('window.__mapBoots.at(-1)?.width<300')
 latest=page.evaluate('window.__mapBoots.at(-1)')
 assert latest['width']==iframe.evaluate('(e)=>e.clientWidth')
 assert latest['height']==iframe.evaluate('(e)=>e.clientHeight')
 print('PASS F12 dimension change:',latest,flush=True)
 page.get_by_role('button',name='關閉地圖',exact=True).click();page.wait_for_timeout(250)
 assert page.locator('.map-iframe').count()==0
 assert page.evaluate('window.__mapBoots.length')==3
 print('PASS close: no pending iframe recreated',flush=True)
 c.close()
 # 平板隱藏分頁不建立地圖；切換後才建立，回列表後卸載。
 c=b.new_context(viewport={'width':768,'height':1024})
 page=c.new_page();page.route('https://data.moa.gov.tw/**',lambda r:r.abort())
 page.route('https://*.google.com/**',lambda r:r.fulfill(status=200,content_type='text/html',body=HTML))
 page.goto(BASE,wait_until='networkidle')
 assert page.locator('.map-iframe').count()==0
 page.get_by_role('button',name='地圖',exact=True).click();page.locator('.map-iframe').wait_for()
 assert page.locator('.map-iframe').evaluate('(e)=>e.clientWidth')>500
 page.get_by_role('button',name='返回院所列表',exact=True).click();page.wait_for_timeout(200)
 assert page.locator('.map-iframe').count()==0
 print('PASS tablet tab visibility gating',flush=True)
 b.close()
