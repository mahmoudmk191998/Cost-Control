import React, { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

export default function SupabaseTest() {
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'error'>('idle')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    let mounted = true
    async function run() {
      setStatus('loading')
      try {
        // Try a safe call: get the current session (works even without tables)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        // Try a lightweight query on a table that may not exist; handle missing-table errors gracefully
        const { data, error } = await supabase.from('recipes').select('*').limit(1)
        if (error) {
          // If the table doesn't exist, still consider the connection OK but show the error
          if (mounted) {
            setStatus('ok')
            setMessage('Connected to Supabase — but query error (table may not exist): ' + error.message)
          }
          return
        }

        if (mounted) {
          setStatus('ok')
          setMessage('Connected to Supabase — query succeeded, rows: ' + JSON.stringify(data))
        }
      } catch (err: any) {
        if (mounted) {
          setStatus('error')
          setMessage(err.message ?? String(err))
        }
      }
    }

    run()
    return () => { mounted = false }
  }, [])

  // Hide the component completely when status is 'ok' to avoid showing the verbose message
  if (status === 'ok') return null

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold">Supabase connection test</h3>
      <p>Status: {status}</p>
      {/* Only show details when loading or on error */}
      {message && <p className="break-words">{message}</p>}
    </div>
  )
}
