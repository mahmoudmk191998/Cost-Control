import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '@/lib/supabase'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (mounted) setSession((data as any).session)
      } catch (err) {
        // ignore
      }
    })()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
    })

    return () => {
      // unsubscribe listener when available
      try {
        ;(listener as any)?.subscription?.unsubscribe()
      } catch (e) {}
      mounted = false
    }
  }, [])

  const validate = () => {
    const e: typeof errors = {}
    if (!email) e.email = 'البريد الإلكتروني مطلوب'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'صيغة بريد إلكتروني غير صحيحة'
    if (!password) e.password = 'كلمة المرور مطلوبة'
    else if (password.length < 6) e.password = 'كلمة المرور قصيرة (6 أحرف على الأقل)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const signIn = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('تم تسجيل الدخول')
      navigate('/')
    } catch (err: any) {
      toast.error(err?.message ?? 'حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      toast.success('تم إنشاء الحساب — تحقق من بريدك إذا طُلب')
      navigate('/')
    } catch (err: any) {
      toast.error(err?.message ?? 'حدث خطأ أثناء إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('تم تسجيل الخروج')
      navigate('/login')
    } catch (err: any) {
      toast.error(err?.message ?? 'حدث خطأ أثناء تسجيل الخروج')
    } finally {
      setLoading(false)
    }
  }

  // Keyboard: Enter to submit
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') signIn()
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl shadow-md transition-smooth px-3 sm:px-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <img src="/pwa-192x192.png" alt="app icon" className="h-10 w-10 rounded-md shadow-sm" />
              <div>
                <CardTitle className="text-lg">مرحباً بك</CardTitle>
                <CardDescription className="text-sm">سجّل الدخول لحفظ وصفاتك ومقاديرك والوصول إليها من أي مكان</CardDescription>
              </div>
            </div>
            <div className="text-sm text-muted-foreground hidden sm:block">تطبيق الوصفات</div>
          </div>
        </CardHeader>

        <CardContent>
          {session ? (
            <div className="space-y-4">
              <p className="text-sm">مسجل دخول كـ: <strong>{session.user?.email ?? 'مستخدم'}</strong></p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/')} className="shadow-sm">الصفحة الرئيسية</Button>
                <Button variant="destructive" onClick={signOut} disabled={loading} className="shadow-glow">{loading ? 'جاري...' : 'تسجيل الخروج'}</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm mb-1 block">البريد الإلكتروني</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  onKeyDown={onKeyDown}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs mt-1 text-destructive">{errors.email}</p>}
              </div>

              <div>
                <label className="text-sm mb-1 block">كلمة المرور</label>
                <div className="relative">
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    onKeyDown={onKeyDown}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={0}
                    aria-label={showPassword ? 'اخفاء كلمة المرور' : 'اظهار كلمة المرور'}
                    className="absolute inset-y-0 left-3 flex items-center px-2 text-muted-foreground"
                    type="button"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1 text-destructive">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  تذكرني
                </label>
                <a className="text-sm text-primary underline-offset-4 hover:underline" href="#">نسيت كلمة المرور؟</a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button onClick={signIn} className="w-full gradient-primary text-primary-foreground shadow-glow transition-smooth" disabled={loading}>{loading ? 'جاري...' : 'تسجيل الدخول'}</Button>
                <Button variant="secondary" onClick={signUp} className="w-full shadow-sm" disabled={loading}>{loading ? 'جاري...' : 'إنشاء حساب'}</Button>
              </div>

              {/* social sign-in removed per user request */}
            </div>
          )}
        </CardContent>

        {/* footer terms removed per user request */}
      </Card>
    </div>
  )
}

export default Login
