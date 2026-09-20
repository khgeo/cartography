"""Keep the readable site self-contained on each MkDocs build."""
from pathlib import Path
import json

def on_config(config):
    # Resolve snippets from the project, regardless of the build command's cwd.
    # Missing figures must fail the build instead of silently disappearing.
    snippets=config.mdx_configs.setdefault('pymdownx.snippets', {})
    snippets['base_path']=[config.docs_dir]
    snippets['check_paths']=True
    return config

def on_pre_build(config):
    docs=Path(config.docs_dir)
    data=docs/'assets/data'
    bundle={p.relative_to(data).as_posix():json.loads(p.read_text(encoding='utf-8'))
            for p in data.rglob('*') if p.suffix in ('.json','.geojson')}
    loader=''';\nwindow.cartoData=async function(path){const key=String(path).split('assets/data/').pop();if(Object.prototype.hasOwnProperty.call(window.CARTO_DATA,key))return window.CARTO_DATA[key];throw new Error('Missing bundled dataset: '+key);};\n'''
    (docs/'assets/js/offline-data.js').write_text('/* Generated from local course datasets. */\nwindow.CARTO_DATA='+json.dumps(bundle,ensure_ascii=False,separators=(',',':'))+loader,encoding='utf-8')

def on_post_build(config):
    p=Path(config.site_dir)/'404.html'
    if p.exists():
        s=p.read_text(encoding='utf-8').replace('"/cartography/','"./')
        p.write_text(s,encoding='utf-8')
