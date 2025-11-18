# Troubleshooting Documentation

## Overview

This directory contains troubleshooting guides for common issues encountered during development and deployment.

## Guides

1. **[Database Connection Issues](./database-connection.md)** - PostgreSQL/Supabase connection problems
2. **[Vercel Deployment Issues](./vercel-deployment.md)** - Common Vercel deployment problems
3. **[Prepared Statement Errors](./prepared-statements.md)** - PgBouncer transaction pooler issues
4. **[CORS Issues](./cors-issues.md)** - Cross-origin resource sharing problems
5. **[Auto-Deploy Issues](./auto-deploy.md)** - GitHub-Vercel integration problems

## Quick Troubleshooting

### Database Connection Errors
- See [database-connection.md](./database-connection.md)

### Deployment Limit Errors
- Vercel free tier: 100 deployments/day
- See [vercel-deployment.md](./vercel-deployment.md#deployment-limits)

### Prepared Statement Errors
- Use Direct Connection (port 5432) instead of Transaction Pooler (port 6543)
- See [prepared-statements.md](./prepared-statements.md)

### CORS Errors
- Configure CORS_ORIGINS environment variable
- See [cors-issues.md](./cors-issues.md)

## Getting Help

If you encounter an issue not covered here:
1. Check the main [README.md](../../README.md)
2. Review deployment logs
3. Check environment variables configuration
