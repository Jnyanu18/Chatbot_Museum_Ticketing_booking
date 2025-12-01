
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export default function PromotionsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline text-2xl">Promotions</CardTitle>
            <CardDescription>
                Manage your promotional campaigns.
            </CardDescription>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Promotion
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">No promotions created yet.</p>
        </div>
      </CardContent>
    </Card>
  )
}
