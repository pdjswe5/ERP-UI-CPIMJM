// App shell — routing + Tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#003366",
  "accentColor": "#3399cc",
  "density": "regular",
  "showKpi": true,
  "tableZebra": false,
  "primaryAlt": "default"
}/*EDITMODE-END*/;

const PRIMARY_PRESETS = {
  default: { primaryColor: '#003366', accentColor: '#3399cc' },
  teal:    { primaryColor: '#0f766e', accentColor: '#14b8a6' },
  graphite:{ primaryColor: '#1f2937', accentColor: '#6366f1' },
  rust:    { primaryColor: '#9a3412', accentColor: '#f59e0b' },
};

const INITIAL_TAB_GROUPS = () => {
  const groups = {};
  MODULES.forEach(m => { groups[m.id] = { openSubs: [], activeSub: null, collapsed: false }; });
  return groups;
};

function App({ session, onLogout, t, setTweak }) {
  const [activeGroup, setActiveGroup] = React.useState('home');
  const [tabGroups, setTabGroups] = React.useState(INITIAL_TAB_GROUPS);
  const [toast, setToast] = React.useState(null);
  const [moduleOrder, setModuleOrder] = React.useState(() => MODULES.map(m => m.id));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(()=>setToast(null), 2200);
  };

  // Opens a sub-tab in a group; collapses previous group if switching modules
  const openSubTab = (modId, subId) => {
    setTabGroups(prev => {
      const updates = {};
      if (activeGroup !== modId && prev[activeGroup].openSubs.length > 0) {
        updates[activeGroup] = { ...prev[activeGroup], collapsed: true };
      }
      const group = prev[modId];
      const openSubs = group.openSubs.includes(subId) ? group.openSubs : [...group.openSubs, subId];
      updates[modId] = { ...group, openSubs, activeSub: subId, collapsed: false };
      return { ...prev, ...updates };
    });
    setActiveGroup(modId);
  };

  // Removes a sub-tab; falls back to previous open sub or null (dashboard)
  const closeSubTab = (modId, subId) => {
    setTabGroups(prev => {
      const group = prev[modId];
      const newOpenSubs = group.openSubs.filter(id => id !== subId);
      const newActiveSub = group.activeSub === subId
        ? (newOpenSubs[newOpenSubs.length - 1] ?? null)
        : group.activeSub;
      return { ...prev, [modId]: { ...group, openSubs: newOpenSubs, activeSub: newActiveSub } };
    });
  };

  // Collapse/expand a group
  const toggleGroupCollapse = (modId) => {
    setTabGroups(prev => ({
      ...prev,
      [modId]: { ...prev[modId], collapsed: !prev[modId].collapsed }
    }));
  };

  // Click on a group chip: if same group, go to dashboard; if different, collapse old and expand new
  const activateGroup = (modId) => {
    if (modId === activeGroup) {
      setTabGroups(prev => ({ ...prev, [modId]: { ...prev[modId], activeSub: null, collapsed: false } }));
    } else {
      setTabGroups(prev => ({
        ...prev,
        [activeGroup]: { ...prev[activeGroup], collapsed: true },
        [modId]:       { ...prev[modId],       collapsed: false },
      }));
      setActiveGroup(modId);
    }
  };

  // Reorder module group chips by swapping fromId with toId
  const reorderGroups = (fromId, toId) => {
    setModuleOrder(prev => {
      const arr = [...prev];
      const fi = arr.indexOf(fromId), ti = arr.indexOf(toId);
      if (fi < 0 || ti < 0) return prev;
      arr.splice(fi, 1);
      arr.splice(ti, 0, fromId);
      return arr;
    });
  };

  // Reorder sub-tabs within a group
  const reorderSubTabs = (modId, fromIdx, toIdx) => {
    setTabGroups(prev => {
      const subs = [...prev[modId].openSubs];
      const [moved] = subs.splice(fromIdx, 1);
      subs.splice(toIdx, 0, moved);
      return { ...prev, [modId]: { ...prev[modId], openSubs: subs } };
    });
  };

  // Navigate from burger menu: sub = null goes to module dashboard, sub = id opens sub-tab
  const navigateTo = (modId, subId = null) => {
    if (subId !== null) openSubTab(modId, subId);
    else activateGroup(modId);
  };

  // Called by module pages: null = back to dashboard, string = open sub-tab
  const onSubChange = (modId, subId) => {
    if (subId === null) {
      setTabGroups(prev => ({ ...prev, [modId]: { ...prev[modId], activeSub: null } }));
    } else {
      openSubTab(modId, subId);
    }
  };

  React.useEffect(() => { window.__erpToast = showToast; }, []);

  const g = activeGroup;
  const sub = tabGroups[g]?.activeSub ?? null;

  const renderContent = () => {
    if (g === 'home')        return <HomeDashboard onNavigate={navigateTo} session={session} />;
    if (g === 'pembelian')   return <PembelianPage   activeSub={sub} onSubChange={id => onSubChange('pembelian', id)}   onNavigate={navigateTo} />;
    if (g === 'barang')      return <BarangPage      activeSub={sub} onSubChange={id => onSubChange('barang', id)}      onNavigate={navigateTo} />;
    if (g === 'kataloglain') return <KatalogLainPage activeSub={sub} onSubChange={id => onSubChange('kataloglain', id)} onNavigate={navigateTo} />;
    if (g === 'sales')       return <PenjualanPage   activeSub={sub} onSubChange={id => onSubChange('sales', id)}       onNavigate={navigateTo} />;
    if (g === 'keuangan')   return <KeuanganPage    activeSub={sub} onSubChange={id => onSubChange('keuangan', id)}   onNavigate={navigateTo} />;
    if (g === 'laporan')    return <LaporanPage     activeSub={sub} onSubChange={id => onSubChange('laporan', id)}    onNavigate={navigateTo} />;
    if (g === 'pengaturan')  return <PengaturanPage  activeSub={sub} onSubChange={id => onSubChange('pengaturan', id)}  onNavigate={navigateTo} />;
    if (g === 'inventory')   return <InventoryPage   activeSub={sub} onSubChange={id => onSubChange('inventory', id)}   onNavigate={navigateTo} />;
    return null;
  };

  return (
    <>
      <TopBar onHome={() => activateGroup('home')} onNavigate={navigateTo} session={session} onLogout={onLogout} />
      <MultiTabNav
        tabGroups={tabGroups}
        activeGroup={activeGroup}
        onGroupClick={activateGroup}
        onTabClick={openSubTab}
        onTabClose={closeSubTab}
        onToggleCollapse={toggleGroupCollapse}
        moduleOrder={moduleOrder}
        onReorderGroups={reorderGroups}
        onReorderSubTabs={reorderSubTabs}
      />

      {renderContent()}

      <Toast msg={toast} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakRadio label="Color preset" value={t.primaryAlt}
          options={[
            {value:'default', label:'Navy'},
            {value:'teal', label:'Teal'},
            {value:'graphite', label:'Graphite'},
            {value:'rust', label:'Rust'},
          ]}
          onChange={v=>setTweak('primaryAlt', v)} />
        <TweakColor label="Primary"  value={t.primaryColor} onChange={v=>setTweak({primaryColor:v, primaryAlt:'custom'})} />
        <TweakColor label="Accent"   value={t.accentColor}  onChange={v=>setTweak({accentColor:v,  primaryAlt:'custom'})} />

        <TweakSection label="Layout" />
        <TweakRadio label="Density"
          value={t.density}
          options={['compact','regular','comfy']}
          onChange={v=>setTweak('density', v)} />
        <TweakToggle label="Show KPI strip" value={t.showKpi}    onChange={v=>setTweak('showKpi', v)} />

        <TweakSection label="Navigation" />
        <TweakButton label="Go to Dashboard"       onClick={() => activateGroup('home')} />
        <TweakButton label="Go to Pembelian"       onClick={() => activateGroup('pembelian')} secondary />
        <TweakButton label="Go to Inventory"       onClick={() => activateGroup('inventory')} secondary />
        <TweakButton label="Go to Pelanggan"       onClick={() => activateGroup('sales')} secondary />
        <TweakButton label="Go to Keuangan"        onClick={() => activateGroup('keuangan')} secondary />
      </TweaksPanel>

      {!t.showKpi && <style>{`.kpi-strip{display:none !important}`}</style>}
    </>
  );
}

// Gerbang login — session cuma di memori (bukan localStorage), jadi refresh halaman kembali ke
// LoginPage. Ini SENGAJA (prototipe tampilan, "sementara"): data tetap dimuat lewat <script> tags
// di index.html seperti biasa terlepas dari status login, cuma komponen yang dirender yang beda.
// Tweaks (warna primary/accent dkk) dipindah ke sini (bukan di dalam App) supaya CSS var-nya
// SUDAH aktif sebelum login — LoginPage jadi ikut warna tema yang sama dgn dashboard, bukan warna
// default stylesheet.
function AppRoot() {
  const [session, setSession] = React.useState(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // apply primary preset to colors when preset changes
  React.useEffect(() => {
    if (t.primaryAlt && t.primaryAlt !== 'custom' && PRIMARY_PRESETS[t.primaryAlt]) {
      const p = PRIMARY_PRESETS[t.primaryAlt];
      if (p.primaryColor !== t.primaryColor || p.accentColor !== t.accentColor) {
        setTweak({ primaryColor: p.primaryColor, accentColor: p.accentColor });
      }
    }
  }, [t.primaryAlt]);

  // apply CSS variables
  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--primary', t.primaryColor);
    r.style.setProperty('--accent', t.accentColor);
    r.style.setProperty('--primary-50',  t.primaryColor + '0d');
    r.style.setProperty('--primary-100', t.primaryColor + '1f');
    r.style.setProperty('--accent-soft', t.accentColor + '1f');
    r.dataset.density = t.density;
  }, [t.primaryColor, t.accentColor, t.density]);

  if (!session) return <LoginPage onLogin={setSession} />;
  return <App session={session} onLogout={() => setSession(null)} t={t} setTweak={setTweak} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppRoot />);
