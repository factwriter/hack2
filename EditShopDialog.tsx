import { useState, useEffect } from 'react';
import type { ShopData } from '../backend';
import { useUpdateShop, useStoreRawDataEmbedding } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { generateEmbedding } from '../lib/openai';

interface EditShopDialogProps {
  shop: ShopData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditShopDialog({ shop, open, onOpenChange }: EditShopDialogProps) {
  const [formData, setFormData] = useState({
    name: shop.name,
    hours: shop.hours,
    pricing: shop.pricing,
    services: shop.services,
    parking: shop.parking,
    payments: shop.payments,
    notes: shop.notes,
  });
  const [isGeneratingEmbedding, setIsGeneratingEmbedding] = useState(false);

  const updateShop = useUpdateShop();
  const storeEmbedding = useStoreRawDataEmbedding();

  useEffect(() => {
    if (open) {
      setFormData({
        name: shop.name,
        hours: shop.hours,
        pricing: shop.pricing,
        services: shop.services,
        parking: shop.parking,
        payments: shop.payments,
        notes: shop.notes,
      });
    }
  }, [open, shop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Shop name is required');
      return;
    }

    try {
      // Update shop data
      await updateShop.mutateAsync({ shopId: shop.id, input: formData });

      // Regenerate embedding
      setIsGeneratingEmbedding(true);
      const rawData = `Shop: ${formData.name}\nHours: ${formData.hours}\nServices: ${formData.services}\nPricing: ${formData.pricing}\nParking: ${formData.parking}\nPayments: ${formData.payments}\nNotes: ${formData.notes}`;
      
      const embedding = await generateEmbedding(rawData);
      await storeEmbedding.mutateAsync({ shopId: shop.id, rawData, embedding });

      toast.success('Shop updated successfully!');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to update shop:', error);
      toast.error(error.message || 'Failed to update shop');
    } finally {
      setIsGeneratingEmbedding(false);
    }
  };

  const isLoading = updateShop.isPending || storeEmbedding.isPending || isGeneratingEmbedding;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Shop</DialogTitle>
          <DialogDescription>
            Update your shop information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Shop Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Coffee Shop"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-hours">Business Hours</Label>
            <Input
              id="edit-hours"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              placeholder="Mon-Fri: 8am-6pm, Sat-Sun: 9am-5pm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-services">Services Offered</Label>
            <Textarea
              id="edit-services"
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              placeholder="Coffee, pastries, sandwiches, catering"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-pricing">Pricing Information</Label>
            <Textarea
              id="edit-pricing"
              value={formData.pricing}
              onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
              placeholder="Coffee: $3-5, Sandwiches: $8-12"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-parking">Parking Information</Label>
            <Input
              id="edit-parking"
              value={formData.parking}
              onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
              placeholder="Free parking in rear lot"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-payments">Accepted Payments</Label>
            <Input
              id="edit-payments"
              value={formData.payments}
              onChange={(e) => setFormData({ ...formData, payments: e.target.value })}
              placeholder="Cash, Credit Cards, Apple Pay"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Additional Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="WiFi available, pet-friendly patio"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Shop'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
