"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchRapper,
  fetchRappers,
  fetchRanking,
} from "@/features/rappers/rapper.service";

export function useRappersQuery() {
  return useQuery({
    queryKey: ["rappers"],
    queryFn: fetchRappers,
  });
}

export function useRapperQuery(rapperId: string) {
  return useQuery({
    queryKey: ["rappers", rapperId],
    queryFn: () => fetchRapper(rapperId),
  });
}

export function useRankingQuery() {
  return useQuery({
    queryKey: ["rappers", "ranking"],
    queryFn: fetchRanking,
  });
}
