'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSetPassword } from '~/hooks/useAccountInfo'

interface SetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SetPasswordDialog({
  open,
  onOpenChange,
}: SetPasswordDialogProps) {
  const setPassword = useSetPassword()
  const [password, setPasswordValue] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const reset = () => {
    setPasswordValue('')
    setConfirmPassword('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSaving(true)
    try {
      await setPassword({ password })
      toast.success('Password set successfully')
      reset()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to set password')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Password</DialogTitle>
            <DialogDescription>
              Add an email & password sign-in method to your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="set-password">New Password</Label>
              <Input
                id="set-password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-password-confirm">Confirm Password</Label>
              <Input
                id="set-password-confirm"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting...
                </>
              ) : (
                'Set Password'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
