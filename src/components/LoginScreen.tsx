import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const ok = onLogin(username.trim(), password);
    if (!ok) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'hsl(220,28%,8%)' }}
    >
      {/* Retro grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(hsl(38,80%,92%) 1px, transparent 1px), linear-gradient(90deg, hsl(38,80%,92%) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-[-100px] right-[-80px] w-96 h-96 rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, hsl(28,100%,55%) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-80px] left-[-60px] w-80 h-80 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, hsl(220,60%,40%) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-md mx-4">
        {/* Retro top accent line */}
        <div className="h-1 w-full rounded-t-xl" style={{ background: 'linear-gradient(90deg, hsl(28,100%,55%), hsl(38,90%,65%), hsl(28,100%,55%))' }} />

        {/* Card */}
        <div
          className="shadow-2xl overflow-hidden"
          style={{
            background: 'hsl(220,30%,12%)',
            border: '1px solid hsl(220,22%,22%)',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
          }}
        >
          {/* Header */}
          <div
            className="px-8 pt-8 pb-6 text-center"
            style={{ borderBottom: '1px solid hsl(220,22%,20%)' }}
          >
            {/* Logo icon */}
            <div
              className="inline-flex items-center justify-center w-16 h-16 mb-4"
              style={{
                background: 'hsl(220,35%,8%)',
                border: '2px solid hsl(28,100%,55%)',
                borderRadius: '8px',
                boxShadow: '0 0 18px hsl(28,100%,55%,0.25)',
              }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
                style={{ color: 'hsl(28,100%,55%)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1
              className="text-xl font-bold tracking-wide"
              style={{ color: 'hsl(38,80%,92%)', fontFamily: 'var(--font-heading)' }}
            >
              Hệ thống TNHS - BHXH
            </h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(220,15%,55%)' }}>
              Vui lòng đăng nhập để tiếp tục
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            {/* Username */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'hsl(220,15%,55%)' }}
              >
                Tên đăng nhập
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(220,15%,45%)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  autoFocus
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-sm focus:outline-none transition"
                  style={{
                    background: 'hsl(220,28%,10%)',
                    border: '1px solid hsl(220,22%,22%)',
                    borderRadius: '5px',
                    color: 'hsl(38,80%,92%)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'hsl(28,100%,55%)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px hsl(28,100%,55%,0.2)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'hsl(220,22%,22%)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'hsl(220,15%,55%)' }}
              >
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(220,15%,45%)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm focus:outline-none transition"
                  style={{
                    background: 'hsl(220,28%,10%)',
                    border: '1px solid hsl(220,22%,22%)',
                    borderRadius: '5px',
                    color: 'hsl(38,80%,92%)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'hsl(28,100%,55%)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px hsl(28,100%,55%,0.2)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'hsl(220,22%,22%)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'hsl(220,15%,45%)' }}
                  tabIndex={-1}
                  onMouseEnter={e => (e.currentTarget.style.color = 'hsl(28,100%,55%)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'hsl(220,15%,45%)')}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 text-sm"
                style={{
                  background: 'hsl(0,72%,38%,0.15)',
                  border: '1px solid hsl(0,72%,38%,0.4)',
                  borderRadius: '5px',
                  color: 'hsl(0,78%,70%)',
                }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-bold tracking-wide uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: loading ? 'hsl(220,25%,20%)' : 'hsl(28,100%,55%)',
                color: loading ? 'hsl(220,15%,55%)' : 'hsl(220,40%,8%)',
                borderRadius: '5px',
                boxShadow: loading ? 'none' : '0 0 16px hsl(28,100%,55%,0.35)',
                letterSpacing: '0.08em',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(28,100%,48%)'; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(28,100%,55%)'; }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>

          {/* Footer */}
          <div
            className="px-8 pb-6 text-center text-xs"
            style={{ color: 'hsl(220,15%,40%)' }}
          >
            © 2026 BHXH — Hệ thống quản lý hồ sơ
          </div>
        </div>
      </div>
    </div>
  );
}
