"use client"

import { useEffect, useState } from "react"

type Providers = {
  mongo: { configured: boolean; connected?: boolean }
  openai: { configured: boolean; liveValidated?: boolean }
  voyage: { configured: boolean; liveValidated?: boolean }
}

export function ProviderStatus() {
  const [providers, setProviders] = useState<Providers | null>(null)

  useEffect(() => {
    fetch("/api/health")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setProviders(data.providers))
      .catch(() => {})
  }, [])

  return (
    <div className="status-row-inline">
      <Dot
        label="MongoDB"
        active={Boolean(providers?.mongo.connected)}
        standby={Boolean(providers?.mongo.configured && !providers?.mongo.connected)}
      />
      <Dot
        label="OpenAI"
        active={Boolean(providers?.openai.liveValidated)}
        standby={Boolean(providers?.openai.configured && !providers?.openai.liveValidated)}
      />
      <Dot
        label="Voyage"
        active={Boolean(providers?.voyage.liveValidated)}
        standby={Boolean(providers?.voyage.configured && !providers?.voyage.liveValidated)}
      />
    </div>
  )
}

function Dot({ label, active, standby = false }: { label: string; active: boolean; standby?: boolean }) {
  return (
    <span className="status-dot-item">
      <span className={`status-dot ${active ? "dot-ready" : standby ? "dot-warning" : "dot-idle"}`} />
      {label}
    </span>
  )
}
