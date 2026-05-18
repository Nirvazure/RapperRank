# Real Backend Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate RapperRank from static local data and browser persistence to PostgreSQL, Prisma, anonymous sessions, and server-backed APIs.

**Architecture:** The app will use Prisma models for rappers, anonymous users, sessions, ratings, and favorites. Server pages and route handlers will share server-only services, while client components will become presentation and mutation shells that no longer read static data or business Zustand state.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma, PostgreSQL, Zod, Vitest, Testing Library, GSAP, ECharts

---

This implementation follows the approved architecture and checklist captured in the planning phase on 2026-05-18. Execution details are tracked directly in the working thread.
