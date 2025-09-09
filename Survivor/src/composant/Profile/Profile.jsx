import { useEffect, useMemo, useState } from 'react';
import './Profile.scss';
import * as UserApi from '../../apis/BackendApi/User.api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('default');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(stored);
      setName(stored?.name || '');
      setRole(stored?.role || 'default');
    } catch {}
  }, []);

  const initials = useMemo(() => {
    const s = (user?.name || user?.email || 'U').trim();
    return s ? s[0].toUpperCase() : 'U';
  }, [user]);

  async function onSave(e) {
    e.preventDefault();
    if (!user?.id) return;
    const updateFields = {};
    if (name && name !== user.name) updateFields.name = name.trim();
    if (role && role !== user.role) updateFields.role = role;
    if (!Object.keys(updateFields).length) { setMsg('Nothing to update.'); return; }
    try {
      setSaving(true); setMsg(null);
      const token = localStorage.getItem('token');
      const res = await UserApi.updateUser(user.id, { updateFields }, token);
      const updated = res.user || res;
      localStorage.setItem('user', JSON.stringify({ ...user, ...updated }));
      window.dispatchEvent(new Event('auth-changed'));
      setUser(u => ({ ...u, ...updated }));
      setMsg('Saved.');
    } catch (e) {
      setMsg(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <div className="profile-page" />;

  return (
    <div className="profile-page">
      <div className="profile-card" role="region" aria-label="User profile">
        <div className="profile-header">
          <div className="profile-identity">
            <div className="profile-avatar" aria-hidden>
              {user.image ? <img src={user.image} alt="" /> : initials}
            </div>
            <div>
              <div className="profile-name">{user.name || 'Unnamed'}</div>
              <div className="profile-email">{user.email}</div>
            </div>
            <span className="profile-role">{user.role}</span>
          </div>
        </div>
        <form className="profile-body" onSubmit={onSave}>
          <div className="section-title">Account</div>
          <div className="field-grid">
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={user.email} disabled />
            </div>
          </div>
          <div className="field-grid">
            <div className="field">
              <label>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} disabled={user.role !== 'admin'}>
                <option value="default">default</option>
                <option value="admin">admin</option>
                <option value="investor">investor</option>
                <option value="founder">founder</option>
              </select>
            </div>
            <div className="field">
              <label>Avatar</label>
              <input placeholder="Set in Dashboard or by admin" disabled />
            </div>
          </div>
          {msg && <div style={{opacity:.9}}>{msg}</div>}
          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => { setName(user.name||''); setRole(user.role||'default'); setMsg(null); }}>Reset</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}