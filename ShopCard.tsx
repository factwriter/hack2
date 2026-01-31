import { useState } from 'react';
import type { ShopData } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Edit, Trash2, BarChart3 } from 'lucide-react';
import { useDeleteShop, useGetShopAnalytics } from '../hooks/useQueries';
import { toast } from 'sonner';
import EditShopDialog from './EditShopDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ShopCardProps {
  shop: ShopData;
}

export default function ShopCard({ shop }: ShopCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteShop = useDeleteShop();
  const { data: analytics } = useGetShopAnalytics(shop.id);

  const chatUrl = `${window.location.origin}/shop/${shop.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(chatUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleDelete = async () => {
    try {
      await deleteShop.mutateAsync(shop.id);
      toast.success('Shop deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete shop:', error);
      toast.error('Failed to delete shop');
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="truncate">{shop.name}</span>
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {shop.services || 'No services listed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics !== null && analytics !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>{analytics.toString()} questions asked</span>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditShopDialog shop={shop} open={showEditDialog} onOpenChange={setShowEditDialog} />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{shop.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteShop.isPending}>
              {deleteShop.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
