"use client"

import { useState } from "react"
import { neonAuthClient as auth } from "@/lib/auth/neon-client"

export default function SignUpTest() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [result, setResult] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await auth.signUp.email({ email, password, name })
      setResult(res)
      if (!res.error) getSession()
    } catch (err: any) {
      setResult({ error: err?.message ?? String(err) })
    } finally {
      setLoading(false)
    }
  }

  async function getSession() {
    const res = await auth.getSession()
    setSession(res.data ?? null)
  }

  return (
    <div style={{ maxWidth: 480, margin: "4rem auto", fontFamily: "sans-serif" }}>
      <h1>Neon Auth — Sign Up Test</h1>
      <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        <button type="submit" disabled={loading}>
          {loading ? "Signing up…" : "Sign Up"}
        </button>
      </form>

      {result && (
        <pre style={{ background: "#f5f5f5", padding: 12, marginTop: 16, borderRadius: 4 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      {session && (
        <>
          <h2>Current Session</h2>
          <pre>{JSON.stringify(session, null, 2)}</pre>
          <button onClick={() => auth.signOut()} style={{ marginTop: 8 }}>Sign Out</button>
        </>
      )}
    </div>
  )
}