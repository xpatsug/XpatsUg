"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface DeleteShopButtonProps {
  shopId: string
  shopName: string
}

export function DeleteShopButton({ shopId, shopName }: DeleteShopButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase.from("shops").delete().eq("id", shopId)

    if (error) {
      console.error("Error deleting shop:", error)
      alert("Failed to delete shop. Please try again.")
      setIsDeleting(false)
      return
    }

    router.refresh()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Shop</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{shopName}"? This action cannot be undone. All products and links
            associated with this shop will also be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
            {isDeleting ? "Deleting..." : "Delete Shop"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
