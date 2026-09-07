# sn8w Portal
> Generated: 2026-09-07 | Path: `C:\dev\angular\08_sn8w-portal`

## Purpose
This is the public site and private toolkit for `www.sn8w.com`. It includes a public landing page plus private admin, todo, and diary tools.

## Why This Exists
The project consolidates a personal/public web presence with small operational tools behind authentication. It is designed for OVH shared hosting with an Angular frontend and PHP/MySQL API.

## What Has Been Done
- Built a public landing page with product/lab sections.
- Added multilingual support for English, French, German, Korean, Japanese, and Spanish.
- Added switchable visual themes.
- Added login-protected admin area.
- Added todo board and diary workflows.
- Added version badge metadata in the header.
- Added `SPEC.md` and a README that documents the shipped state.
- Git history shows todo/diary integration, Jira-style todo redesign, database cleanup notes, and footer contact email fixes.

## When
- Recent commits are from 2026-08-17.
- Local files were refreshed around 2026-09-06.

## Technical Stack
- Frontend: Angular, Angular Material, Angular CDK, TypeScript, RxJS.
- Backend/API: PHP/MySQL API according to README.
- Tooling: Angular CLI, Vitest/jsdom, Prettier.
- Deployment: OVH shared hosting.

## How To Run
- Install: `npm install`
- Start dev server: `npm start`
- Build: `npm run build`
- Test: `npm test`

## AI Notes
Read `README.md` and `SPEC.md` before editing. This project mixes public-facing content and private tools, so preserve route/auth boundaries.
