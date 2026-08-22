"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressApi, type Address, type AddressInput } from "../api/orders";
import { useAuth } from "../auth/AuthProvider";

const key = (userId: string | null | undefined) => ["addresses", userId ?? null];

/**
 * User's address book on TanStack Query. One cached list shared by checkout and
 * the account page; every mutation writes the fresh list back into the cache so
 * both update at once.
 */
export function useAddresses() {
  const { user, getToken } = useAuth();
  const qc = useQueryClient();
  const token = getToken();
  const qk = key(user?.id);

  const query = useQuery({
    queryKey: qk,
    queryFn: () => addressApi.list(token as string),
    enabled: !!token,
  });

  const requireToken = () => {
    const t = getToken();
    if (!t) throw new Error("Not signed in");
    return t;
  };
  const invalidate = () => qc.invalidateQueries({ queryKey: ["addresses"] });

  const createMut = useMutation({
    mutationFn: (input: AddressInput) => addressApi.create(requireToken(), input),
    onSuccess: invalidate,
  });
  const setDefaultMut = useMutation({
    mutationFn: (id: string) => addressApi.setDefault(requireToken(), id),
    onSuccess: invalidate,
  });
  const removeMut = useMutation({
    mutationFn: (id: string) => addressApi.remove(requireToken(), id),
    onSuccess: invalidate,
  });

  return {
    addresses: (query.data ?? []) as Address[],
    loading: !!token && query.isLoading,
    isError: query.isError,
    create: (input: AddressInput) => createMut.mutateAsync(input),
    setDefault: (id: string) => setDefaultMut.mutateAsync(id),
    remove: (id: string) => removeMut.mutateAsync(id),
    refresh: async () => {
      await invalidate();
    },
  };
}
