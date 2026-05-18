import {
  createFavorite as createFavoriteRecord,
  deleteFavorite as deleteFavoriteRecord,
  findFavorite as findFavoriteRecord,
} from "@/features/favorites/favorite.repository";

export type FavoriteDeps = {
  findFavorite: (input: { userId: string; rapperId: string }) => Promise<{ id: string } | null>;
  createFavorite: (input: { userId: string; rapperId: string }) => Promise<void>;
  deleteFavorite: (input: { userId: string; rapperId: string }) => Promise<void>;
};

export async function addFavorite(
  deps: FavoriteDeps,
  input: { userId: string; rapperId: string },
): Promise<void> {
  const existing = await deps.findFavorite(input);
  if (existing) {
    return;
  }

  await deps.createFavorite(input);
}

export async function removeFavorite(
  deps: FavoriteDeps,
  input: { userId: string; rapperId: string },
): Promise<void> {
  const existing = await deps.findFavorite(input);
  if (!existing) {
    return;
  }

  await deps.deleteFavorite(input);
}

export async function addFavoriteForUser(input: { userId: string; rapperId: string }) {
  await addFavorite(
    {
      findFavorite: findFavoriteRecord,
      createFavorite: async (payload) => {
        await createFavoriteRecord(payload);
      },
      deleteFavorite: async (payload) => {
        await deleteFavoriteRecord(payload);
      },
    },
    input,
  );
}

export async function removeFavoriteForUser(input: { userId: string; rapperId: string }) {
  await removeFavorite(
    {
      findFavorite: findFavoriteRecord,
      createFavorite: async (payload) => {
        await createFavoriteRecord(payload);
      },
      deleteFavorite: async (payload) => {
        await deleteFavoriteRecord(payload);
      },
    },
    input,
  );
}
