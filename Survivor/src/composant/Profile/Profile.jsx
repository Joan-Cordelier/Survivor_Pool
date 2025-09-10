import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Profile.scss';
import * as UserApi from '../../apis/BackendApi/User.api';
import * as StartupApi from '../../apis/BackendApi/Startup.api';

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('default');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarName, setAvatarName] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [startup, setStartup] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      if (!stored || !token) {
        const from = `${location?.pathname || '/'}${location?.search || ''}${location?.hash || ''}`;
        navigate('/Login', { replace: true, state: { from } });
        return;
      }
      setUser(stored);
      setName(stored?.name || '');
      setRole(stored?.role || 'default');
      setAvatar(stored?.image || null);
    } catch { }
  }, [navigate, location]);

  useEffect(() => {
    const fetchStartup = async () => {
      if (!user || user.role !== 'founder' || !user.founder_id)
        return;
      try {
        const all = await StartupApi.getAllStartups();
        const arr = Array.isArray(all) ? all : (all?.data || []);
        const match = arr.find(s => Array.isArray(s.founders) && s.founders.some(f => f.id === user.founder_id));
        if (match)
          setStartup(match);
      } catch { }
    };
    fetchStartup();
  }, [user]);

  const initials = useMemo(() => {
    const s = (name?.trim() || user?.name || user?.email || 'U').trim();
    return s ? s[0].toUpperCase() : 'U';
  }, [user, name]);

  async function onSave(e) {
    e.preventDefault();
    if (!user?.id)
      return;
    const updateFields = {};
    if (name && name !== user.name)
      updateFields.name = name.trim();
    if (role && role !== user.role)
      updateFields.role = role;
    if (password)
      updateFields.password = password;
    if (avatar && avatar !== user.image)
      updateFields.image = avatar;
    if (!Object.keys(updateFields).length) {
      setMsg('Nothing to update.');
      return;
    }
    try {
      setSaving(true); setMsg(null);
      const token = localStorage.getItem('token');
      const res = await UserApi.updateUser(user.id, { updateFields }, token);
      const updated = res.user || res;
      localStorage.setItem('user', JSON.stringify({ ...user, ...updated }));
      window.dispatchEvent(new Event('auth-changed'));
      setUser(u => ({ ...u, ...updated }));
      if (Object.prototype.hasOwnProperty.call(updated || {}, 'image')) {
        setAvatar(updated.image || null);
      }
      setPassword('');
      setMsg('Saved.');
    } catch (e) {
      setMsg(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (!user)
    return <div className="profile-page" />;

  return (
    <div className="profile-page">
      <div className="profile-card" role="region" aria-label="User profile">
        <div className="profile-header">
          <div className="profile-identity">
            <div className="profile-avatar" aria-hidden>
              {avatar ? <img src={avatar} alt="" /> : initials}
            </div>
            <div>
              <div className="profile-name">{(name && name.trim()) || user.name || 'Unnamed'}</div>
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
              <label>Avatar</label>
              <div className="file-picker">
                <input id="avatar-input" className="visually-hidden" type="file" accept="image/*" onChange={async (e) => {
                  const f = e.currentTarget.files?.[0];
                  if (!f) {
                    setAvatarName('');
                    return;
                  }
                  if (!f.type.startsWith('image/')) {
                    alert('Only image files.');
                    e.currentTarget.value = '';
                    setAvatarName('');
                    return;
                  }
                  setAvatarName(f.name || '');
                  const reader = new FileReader();
                  reader.onload = () => setAvatar(String(reader.result || ''));
                  reader.onerror = () => alert('Failed to read image');
                  reader.readAsDataURL(f);
                }} />
                <label htmlFor="avatar-input" className="btn primary">Choisir une image</label>
              </div>
              {avatar && (
                <div style={{ marginTop: 8 }}>
                  <img src={avatar} alt="preview" style={{ maxWidth: 160, borderRadius: 8 }} />
                </div>
              )}
            </div>
          </div>
          <div className="field-grid">
            <div className="field">
              <label>New password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
            </div>
          </div>
          {user.role === 'founder' && startup && (
            <div style={{ marginTop: 16 }}>
              <div className="section-title">Your startup</div>
              <div className="card" style={{ padding: 12 }}>
                <div><strong>{startup.name}</strong></div>
                <div style={{ opacity: .8 }}>{startup.email || ''}</div>
                <div style={{ opacity: .8 }}>{startup.sector || ''}</div>
              </div>
            </div>
          )}
          {msg && <div style={{ opacity: .9 }}>{msg}</div>}
          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => { setName(user.name || ''); setRole(user.role || 'default'); setAvatar(user.image || null); setAvatarName(''); setPassword(''); setMsg(null); }}>Reset</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}