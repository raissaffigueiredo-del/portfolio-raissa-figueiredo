/* Runtime mínimo que interpreta os componentes do portfólio (templates com {{ }}, <sc-for>, <sc-if>). */
(function () {
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(patch) {
      const p = typeof patch === 'function' ? patch(this.state) : patch;
      this.state = Object.assign({}, this.state, p);
      if (!this.__q) { this.__q = true; queueMicrotask(() => { this.__q = false; this.__render(); }); }
    }
  }
  window.DCLogic = DCLogic;

  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  const ONLY = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  function get(scope, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
  }
  function str(v) { return v == null || v === false ? '' : String(v); }

  function build(node, scope, out) {
    if (node.nodeType === 3) { out.push(document.createTextNode(node.nodeValue.replace(HOLE, (_, p) => str(get(scope, p))))); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === 'sc-for') {
      const m = (node.getAttribute('list') || '').match(ONLY);
      const list = m ? get(scope, m[1]) : [];
      const as = node.getAttribute('as') || 'item';
      (list || []).forEach((item, i) => {
        const s = Object.create(scope); s[as] = item; s.$index = i;
        node.childNodes.forEach((c) => build(c, s, out));
      });
      return;
    }
    if (tag === 'sc-if') {
      const m = (node.getAttribute('value') || '').match(ONLY);
      if (m && get(scope, m[1])) node.childNodes.forEach((c) => build(c, scope, out));
      return;
    }
    const el = document.createElementNS(node.namespaceURI, node.localName);
    el.__on = {};
    for (const a of node.attributes) {
      if (a.name.startsWith('hint-placeholder')) continue;
      if (/^on/i.test(a.name)) {
        const m = a.value.match(ONLY);
        if (m) { const fn = get(scope, m[1]); if (typeof fn === 'function') el.__on[a.name.slice(2).toLowerCase()] = fn; }
        continue;
      }
      el.setAttribute(a.name, a.value.replace(HOLE, (_, p) => str(get(scope, p))));
    }
    const kids = [];
    (node.content || node).childNodes.forEach((c) => build(c, scope, kids));
    kids.forEach((k) => el.appendChild(k));
    out.push(el);
  }

  function dispatch(e) { const h = e.currentTarget.__on && e.currentTarget.__on[e.type]; if (h) h(e); }
  function bind(el, on) {
    el.__on = on;
    for (const t of Object.keys(on)) { if (!(el.__bound || (el.__bound = {}))[t]) { el.addEventListener(t, dispatch); el.__bound[t] = true; } }
  }
  function bindAll(el) {
    if (el.nodeType !== 1) return;
    bind(el, el.__on || {});
    el.childNodes.forEach(bindAll);
  }

  function morph(old, nu) {
    if (old.nodeType !== nu.nodeType || old.nodeName !== nu.nodeName) { bindAll(nu); old.replaceWith(nu); return; }
    if (old.nodeType === 3) { if (old.nodeValue !== nu.nodeValue) old.nodeValue = nu.nodeValue; return; }
    for (const a of [...old.attributes]) if (!nu.hasAttribute(a.name)) old.removeAttribute(a.name);
    for (const a of nu.attributes) if (old.getAttribute(a.name) !== a.value) old.setAttribute(a.name, a.value);
    bind(old, nu.__on || {});
    morphChildren(old, [...nu.childNodes]);
  }
  function morphChildren(parent, next) {
    const cur = [...parent.childNodes];
    next.forEach((n, i) => { if (cur[i]) morph(cur[i], n); else { bindAll(n); parent.appendChild(n); } });
    for (let i = next.length; i < cur.length; i++) cur[i].remove();
  }

  window.addEventListener('DOMContentLoaded', () => {
    const tpl = document.querySelector('template[data-dc]');
    const script = document.querySelector('script[type="text/x-dc"]');
    const root = document.getElementById('app');
    let props = {};
    try {
      const spec = JSON.parse(script.getAttribute('data-props') || '{}');
      for (const k of Object.keys(spec)) if (k[0] !== '$' && spec[k] && 'default' in spec[k]) props[k] = spec[k].default;
    } catch (e) {}
    const Component = new Function('DCLogic', script.textContent + '\nreturn Component;')(DCLogic);
    const inst = new Component(props);
    inst.__render = () => {
      const scope = Object.assign({}, inst.renderVals());
      const out = [];
      tpl.content.childNodes.forEach((c) => build(c, scope, out));
      morphChildren(root, out);
    };
    inst.__render();
    if (inst.componentDidMount) inst.componentDidMount();
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  });
})();
