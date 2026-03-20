export function AuthLoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v18m-6-6h12M6 3h12v6H6V3z"
            />
          </svg>
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
