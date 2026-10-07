import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, Stethoscope, Building2 } from 'lucide-react';
import logo from '../assets/logo.png';

interface LoginScreenProps {
  onLoginSuccess: (role: 'SHPH' | 'DOCTOR', username: string) => void;
}

const ROLE_PREFIXES = [
  { 
    code: 'SHPH', 
    label: 'เจ้าหน้าที่ รพ.สต.', 
    icon: Building2, 
    tint: 'text-emerald-800 bg-emerald-50 border-emerald-300' 
  },
  { 
    code: 'DOC', 
    label: 'แพทย์ / ทีมสหวิชาชีพ', 
    icon: Stethoscope, 
    tint: 'text-sky-800 bg-sky-50 border-sky-300' 
  },
] as const;

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('SHPH001');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUser = username.trim().toUpperCase();

    if (trimmedUser.startsWith('DOC')) {
      onLoginSuccess('DOCTOR', trimmedUser);
    } else if (trimmedUser.startsWith('SHPH') || trimmedUser.startsWith('NUR')) {
      onLoginSuccess('SHPH', trimmedUser);
    } else {
      setErrorMessage('รหัสเจ้าหน้าที่ไม่ถูกต้อง ต้องขึ้นต้นด้วย SHPH (รพ.สต.) หรือ DOC (รพ.ศูนย์)');
    }
  };

  const applyPrefix = (code: string) => {
    setUsername(code + '001');
  };

  const activePrefix = username.trim().toUpperCase().slice(0, 4).startsWith('DOC') ? 'DOC' : 'SHPH';

  return (
    <div className="min-h-screen bg-[#F5F7F4] flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-[28px] border border-[#E4E9E1] shadow-[0_1px_2px_rgba(15,23,18,0.04),0_12px_32px_-16px_rgba(15,23,18,0.12)] overflow-hidden">
          {/* Brand strip */}
          <div className="h-1.5 bg-gradient-to-r from-[#0B6B38] via-[#12864A] to-[#0B6B38]" />

          <div className="px-8 pt-8 pb-8 space-y-7">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-3">
              <img
                src={logo}
                alt="กระทรวงสาธารณสุข"
                className="w-14 h-14 object-contain"
              />
              <div className="space-y-1">
                <h1 className="text-[17px] font-semibold text-[#16241A] leading-snug">
                  ระบบประเมินและเฝ้าระวังความเสี่ยงภาวะ MALA
                </h1>
                <p className="text-[13px] text-[#6C7A70]">
                  โรงพยาบาลเชียงรายประชานุเคราะห์ และเครือข่าย รพ.สต.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-[#3B4A40]">
                  เลือกบทบาทผู้ใช้งาน / รหัสประจำตัว
                </label>

                {/* ปุ่มเลือก 2 Roles ตามสไลด์ */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {ROLE_PREFIXES.map(({ code, label, icon: Icon, tint }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => applyPrefix(code)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-[11.5px] font-semibold transition text-center gap-1.5 ${
                        activePrefix === code
                          ? tint + ' ring-2 ring-emerald-600/20'
                          : 'text-[#8B958E] bg-[#FAFBF9] border-[#E4E9E1] hover:bg-[#F0F2ED]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                <div className="relative pt-1">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA69C]" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น SHPH001 หรือ DOC001"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAFBF9] border border-[#DEE4DB] rounded-xl text-[14px] text-[#16241A] placeholder:text-[#AFB8AC] outline-none transition focus:border-[#0B6B38] focus:bg-white focus:ring-2 focus:ring-[#0B6B38]/12"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-[#3B4A40]">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA69C]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านของท่าน"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAFBF9] border border-[#DEE4DB] rounded-xl text-[14px] text-[#16241A] placeholder:text-[#AFB8AC] outline-none transition focus:border-[#0B6B38] focus:bg-white focus:ring-2 focus:ring-[#0B6B38]/12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9AA69C] hover:text-[#3B4A40] transition"
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember + forgot */}
              <div className="flex justify-between items-center text-[12.5px] text-[#6C7A70] pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-3.5 h-3.5 rounded border-[#C7D0C3] text-[#0B6B38] focus:ring-[#0B6B38]/30"
                  />
                  <span>จดจำการเข้าสู่ระบบ</span>
                </label>
                <button type="button" className="text-[#3B4A40] hover:text-[#0B6B38] font-medium transition">
                  ลืมรหัสผ่าน?
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-xl text-[12.5px] text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#0B6B38] hover:bg-[#08532b] active:bg-[#073e21] text-white font-semibold rounded-xl transition text-[14.5px] shadow-sm"
              >
                เข้าสู่ระบบ
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-[#FAFBF9] border-t border-[#EDF1EB] text-center">
            <p className="text-[12px] text-[#9AA69C]">
              ศูนย์ข้อมูลยาและเภสัชสนเทศ รพ.เชียงรายประชานุเคราะห์
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;