// Halaman Login — gerbang tampilan sebelum App mount. SEMUA data (data.jsx + modules/*/data/*.jsx)
// tetap dimuat lewat <script> tags di index.html seperti biasa TERLEPAS dari status login (itu
// jalan sebelum satupun komponen React dirender, lihat komentar #app-loading) — login ini cuma
// menentukan komponen apa yang dirender duluan (LoginPage vs App), bukan kapan data dimuat.
// Kredensial SENGAJA tidak divalidasi (prototipe tampilan) — Kode User & Password apa saja lolos.

function LoginInfoIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <circle cx="12" cy="7.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LoginPage({ onLogin }) {
  const [kodeUser, setKodeUser] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [semuaSesi, setSemuaSesi] = React.useState(false);
  const [perusahaan, setPerusahaan] = React.useState('PT CPI');

  const submit = (e) => {
    e.preventDefault();
    onLogin({ kodeUser: kodeUser.trim() || 'demo', perusahaan });
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-card-accent" />
        <div className="login-card-body">
          <div className="login-logo"><img src="assets/login-logo.png" alt="PDJ ERP" /></div>
          <h1 className="login-title">Pacific Data Jaya</h1>
          <div className="login-subtitle">Portal ERP</div>

          <form onSubmit={submit}>
            <div className="field">
              <label>Perusahaan</label>
              <select className="input" value={perusahaan} onChange={e => setPerusahaan(e.target.value)}>
                <option value="PT CPI">PT CPI</option>
                <option value="PT MJM">PT MJM</option>
              </select>
            </div>
            <div className="field" style={{marginTop:14}}>
              <label>Kode User</label>
              <input className="input" placeholder="Masukkan Kode User" value={kodeUser}
                onChange={e => setKodeUser(e.target.value)} autoFocus required />
            </div>
            <div className="field" style={{marginTop:14}}>
              <label>Password</label>
              <input className="input" type="password" placeholder="Masukkan Password" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>

            <label className="login-remember">
              <input type="checkbox" checked={semuaSesi} onChange={e => setSemuaSesi(e.target.checked)} />
              Keluarkan semua sesi anda dari perangkat lain.
            </label>

            <button type="submit" className="btn btn-primary login-submit">Masuk</button>
          </form>

          <div className="login-demo-hint">
            <LoginInfoIcon />
            <span><b>Demo Info:</b> User: <code>demo</code>&nbsp;&nbsp;Password: <code>demo</code></span>
          </div>
        </div>
      </div>
      <div className="login-footer">Powered by PDJ ERP System — © {new Date().getFullYear()}. All rights reserved.</div>
    </div>
  );
}
