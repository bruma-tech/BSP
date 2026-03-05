'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function UnauthorizedModal() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'unauthorized') {
      setOpen(true)
    }
  }, [searchParams])

  const handleClose = () => {
    setOpen(false)
    const url = new URL(window.location.href)
    url.searchParams.delete('error')
    router.replace(url.pathname)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
        <h2 className="text-lg font-semibold mb-3 text-red-600">
          Access Denied
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          You are not authorized to access that page.
        </p>

        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 transition"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  )
}