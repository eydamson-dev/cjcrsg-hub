export function AuthLoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center">
          <img
            src="/cjcrsg-logo.png"
            alt="CJCRSG Logo"
            className="h-12 w-12 object-contain"
          />
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold">CJCRSG Hub</p>
          <p className="text-sm text-muted-foreground">
            Church Management System
          </p>
        </div>

        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />

        <p className="text-sm text-muted-foreground">Authenticating...</p>
      </div>
    </div>
  )
}
