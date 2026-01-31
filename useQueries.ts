import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ShopDataInput, ShopData } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllShops() {
  const { actor, isFetching } = useActor();

  return useQuery<ShopData[]>({
    queryKey: ['shops'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllShops();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetShop(shopId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<ShopData | null>({
    queryKey: ['shop', shopId],
    queryFn: async () => {
      if (!actor || !shopId) return null;
      return actor.getShop(shopId);
    },
    enabled: !!actor && !isFetching && !!shopId,
  });
}

export function useCreateShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shopId, input }: { shopId: string; input: ShopDataInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createShop(shopId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
}

export function useUpdateShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shopId, input }: { shopId: string; input: ShopDataInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateShop(shopId, input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['shop', variables.shopId] });
    },
  });
}

export function useDeleteShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteShop(shopId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
}

export function useStoreRawDataEmbedding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shopId, rawData, embedding }: { shopId: string; rawData: string; embedding: number[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.storeRawDataEmbedding(shopId, rawData, embedding);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shop', variables.shopId] });
    },
  });
}

export function useGetShopAnalytics(shopId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint | null>({
    queryKey: ['shopAnalytics', shopId],
    queryFn: async () => {
      if (!actor || !shopId) return null;
      return actor.getShopAnalytics(shopId);
    },
    enabled: !!actor && !isFetching && !!shopId,
  });
}

export function useRecordTokenCount() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ shopId, count }: { shopId: string; count: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordTokenCount(shopId, count);
    },
  });
}

export function useFindMostSimilarShop() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ embedding, topN, threshold }: { embedding: number[]; topN: bigint; threshold: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.findMostSimilarShop(embedding, topN, threshold);
    },
  });
}
