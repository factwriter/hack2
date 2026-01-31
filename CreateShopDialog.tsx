import { useState } from 'react';
import { useCreateShop, useStoreRawDataEmbedding } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { generateEmbedding } from '../lib/openai';

interface CreateShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateShopDialog({ open, onOpenChange }: CreateShopDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    hours: '',
    pricing: '',
    services: '',
    parking: '',
    payments: '',
    notes: '',
  });
  const [isGeneratingEmbedding, setIsGeneratingEmbedding] = useState(false);

  const createShop = useCreateShop();
  const storeEmbedding = useStoreRawDataEmbedding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Shop name is required');
      return;
    }

    const shopId = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      // Create shop first
      await createShop.mutateAsync({ shopId, input: formData });

      // Generate embedding for shop data
      setIsGeneratingEmbedding(true);
      const rawData = `Shop: ${formData.name}\nHours: ${formData.hours}\nServices: ${formData.services}\nPricing: ${formData.pricing}\nParking: ${formData.parking}\nPayments: ${formData.payments}\nNotes: ${formData.notes}`;
      
      const embedding = await generateEmbedding(rawData);
      await storeEmbedding.mutateAsync({ shopId, rawData, embedding });

      toast.success('Shop created successfully!');
      onOpenChange(false);
      setFormData({
        name: '',
        hours: '',
        pricing: '',
        services: '',
        parking: '',
        payments: '',
        notes: '',
      });
    } catch (error: any) {
      console.error('Failed to create shop:', error);
      toast.error(error.message || 'Failed to create shop');
    } finally {
      setIsGeneratingEmbedding(false);
    }
  };

  const isLoading = createShop.isPending || storeEmbedding.isPending || isGeneratingEmbedding;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shop</DialogTitle>
          <DialogDescription>
            Enter your shop information to create an AI-powered chatbot
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Shop Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Coffee Shop"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Business Hours</Label>
            <Input
              id="hours"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              placeholder="Mon-Fri: 8am-6pm, Sat-Sun: 9am-5pm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="services">Services Offered</Label>
            <Textarea
              id="services"
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              placeholder="Coffee, pastries, sandwiches, catering"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricing">Pricing Information</Label>
            <Textarea
              id="pricing"
              value={formData.pricing}
              onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
              placeholder="Coffee: $3-5, Sandwiches: $8-12"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parking">Parking Information</Label>
            <Input
              id="parking"
              value={formData.parking}
              onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
              placeholder="Free parking in rear lot"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payments">Accepted Payments</Label>
            <Input
              id="payments"
              value={formData.payments}
              onChange={(e) => setFormData({ ...formData, payments: e.target.value })}
              placeholder="Cash, Credit Cards, Apple Pay"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
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
                  Creating...
                </>
              ) : (
                'Create Shop'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
