function normalizePublicUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  const normalized = value.trim()
  if (!normalized) {
    return undefined
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized.replace(/\/+$/, "")
  }

  return `https://${normalized.replace(/^\/+/, "")}`.replace(/\/+$/, "")
}

function resolveTargetEnv(): string {
  return process.env.VERCEL_TARGET_ENV ?? process.env.APP_ENV ?? process.env.NODE_ENV ?? "development"
}

function resolvePublicDemoUrl(frontendPort: number, targetEnv: string): string {
  if (targetEnv === "preview") {
    return (
      normalizePublicUrl(process.env.VERCEL_BRANCH_URL) ??
      normalizePublicUrl(process.env.VERCEL_URL) ??
      normalizePublicUrl(process.env.PUBLIC_DEMO_URL) ??
      `http://localhost:${frontendPort}`
    )
  }

  return (
    normalizePublicUrl(process.env.PUBLIC_DEMO_URL) ??
    (targetEnv === "production"
      ? normalizePublicUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
        normalizePublicUrl(process.env.VERCEL_URL)
      : undefined) ??
    `http://localhost:${frontendPort}`
  )
}

function resolvePortalUrl(demoUrl: string, targetEnv: string): string {
  if (targetEnv === "preview") {
    return `${demoUrl}/pro`
  }

  return normalizePublicUrl(process.env.PUBLIC_DEMO_URL_PORTAL) ?? `${demoUrl}/pro`
}

function resolveAppUrl(demoUrl: string, targetEnv: string): string {
  if (targetEnv === "preview") {
    return `${demoUrl}/app`
  }

  return normalizePublicUrl(process.env.PUBLIC_DEMO_URL_APP) ?? `${demoUrl}/app`
}

export function getRuntimeConfig() {
  const appName = process.env.APP_NAME ?? "proto3"
  const frontendPort = Number(process.env.FRONTEND_PORT ?? process.env.PORT ?? "3001")
  const targetEnv = resolveTargetEnv()
  const demoUrl = resolvePublicDemoUrl(frontendPort, targetEnv)

  return {
    appName,
    appEnv: targetEnv,
    demoUrl,
    portalUrl: resolvePortalUrl(demoUrl, targetEnv),
    appUrl: resolveAppUrl(demoUrl, targetEnv),
    projectName: process.env.PROJECT_NAME ?? process.env.NEXT_PUBLIC_PROJECT_NAME ?? appName,
    headline:
      process.env.WAITLIST_HEADLINE ??
      process.env.NEXT_PUBLIC_WAITLIST_HEADLINE ??
      "We are building this prototype live today.",
  }
}
