# Deployment Guide - Vercel

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yuvrajpandey77/Advanced-Token-Launchpad)

## Manual Deployment Steps

### 1. Vercel Dashboard Settings

When importing the project, use these settings:

**Framework Preset:** `Other`

**Root Directory:** `./`

**Build Command:** 
```bash
npm run vercel-build
```

**Output Directory:**
```
dist-web
```

**Install Command:**
```bash
npm install
```

### 2. Environment Variables (Optional)

If you need custom RPC endpoints, add these environment variables in Vercel:

- `VITE_SOLANA_RPC_MAINNET` - Custom Solana mainnet RPC URL
- `VITE_SOLANA_RPC_DEVNET` - Custom Solana devnet RPC URL

Leave empty to use default public endpoints.

### 3. Deploy Commands

**Via Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Via Git (Automatic):**
- Push to your main branch
- Vercel will auto-deploy

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── services/       # Token creation & minting services
│   ├── config/         # Configuration
│   └── App.tsx         # Main app
├── dist-web/          # Build output (generated)
├── vercel.json        # Vercel configuration
└── vite.config.ts     # Vite configuration
```

## Build Output

The build creates an optimized SPA in `dist-web/`:
- Minified JavaScript bundles
- Optimized CSS
- Static assets
- index.html with routing support

## Performance Features

✅ Lightweight bundle (removed Three.js)
✅ Code splitting
✅ CSS optimization
✅ Fast hot reload in development
✅ Production-ready build

## Troubleshooting

### Build fails with "No output directory"
- Make sure `vercel.json` exists in root
- Verify `outputDirectory` is set to `dist-web`

### SPA routing doesn't work
- Check `vercel.json` has the rewrite rule
- Verify all routes point to `/index.html`

### Dependencies fail to install
- Clear build cache in Vercel settings
- Re-deploy

## Local Testing

Test the production build locally:

```bash
npm run build:web
npm run preview:web
```

Then open http://localhost:4173

