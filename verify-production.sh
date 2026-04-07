#!/bin/bash

# Production Readiness Check Script
# Run this before deploying to production

set -e

echo "🔍 Production Readiness Verification..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

check() {
  local message=$1
  local condition=$2
  
  if eval "$condition"; then
    echo -e "${GREEN}✓${NC} $message"
  else
    echo -e "${RED}✗${NC} $message"
    ((errors++))
  fi
}

warn() {
  local message=$1
  echo -e "${YELLOW}⚠${NC} $message"
  ((warnings++))
}

echo "=== Code Quality ==="
check "server/src/server.ts exists" "test -f server/src/server.ts"
check "client/src/App.tsx exists" "test -f client/src/App.tsx"
check "tsconfig.json in server exists" "test -f server/tsconfig.json"
check "tsconfig.json in client exists" "test -f client/tsconfig.json"
check "package.json in root exists" "test -f package.json"

echo ""
echo "=== Environment Files ==="
check "server/.env.example exists" "test -f server/.env.example"
check "client/.env.example exists" "test -f client/.env.example"
check ".gitignore exists" "test -f .gitignore"

if [ -f "server/.env" ]; then
  warn "server/.env file exists (should not be committed)"
fi

if [ -f "client/.env" ]; then
  warn "client/.env file exists (should not be committed)"
fi

echo ""
echo "=== Documentation ==="
check "README.md exists" "test -f README.md"
check "DEPLOYMENT.md exists" "test -f DEPLOYMENT.md"
check "SECURITY.md exists" "test -f SECURITY.md"

echo ""
echo "=== Docker Configuration ==="
check "Dockerfile exists" "test -f Dockerfile"
check "docker-compose.yml exists" "test -f docker-compose.yml"
check "nginx.conf exists" "test -f nginx.conf"
check "Procfile exists" "test -f Procfile"

echo ""
echo "=== CI/CD Configuration ==="
check ".github/workflows/build.yml exists" "test -f .github/workflows/build.yml"

echo ""
echo "=== Security ==="
check "Security headers in server" "grep -q 'X-Frame-Options' server/src/server.ts"
check "CORS configuration in server" "grep -q 'cors' server/src/server.ts"
check "Input validation in server" "grep -q 'validate\\|validation' server/src/server.ts"
check "Error handling in server" "grep -q 'try\\|catch' server/src/server.ts"

echo ""
echo "=== Build Files ==="
if [ -d "node_modules" ]; then
  warn "node_modules exists locally (will be recreated during deployment)"
fi

if [ -d "server/dist" ]; then
  warn "server/dist exists locally (should be generated during build)"
fi

if [ -d "client/build" ]; then
  warn "client/build exists locally (should be generated during build)"
fi

echo ""
echo "=== Deployment Files ==="
check "Error boundary component exists" "test -f client/src/components/ErrorBoundary.tsx"
check "Chat context exists" "test -f client/src/context/ChatContext.tsx"
check "Theme context exists" "test -f client/src/context/ThemeContext.tsx"

echo ""
echo "=========================================="
if [ $errors -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo "Application is ready for production deployment."
else
  echo -e "${RED}✗ $errors check(s) failed${NC}"
  echo "Please fix the failing checks before deploying."
fi

if [ $warnings -gt 0 ]; then
  echo -e "${YELLOW}⚠ $warnings warning(s)${NC}"
fi

echo "=========================================="
echo ""
echo "📋 Pre-deployment Checklist:"
echo "  [ ] Set REACT_APP_DEMO_MODE=false in client/.env"
echo "  [ ] Update CLIENT_URL to production domain"
echo "  [ ] Change JWT_SECRET to a strong random string"
echo "  [ ] Configure MongoDB connection string"
echo "  [ ] Set up HTTPS/SSL certificate"
echo "  [ ] Configure backup strategy"
echo "  [ ] Set up monitoring and alerting"
echo "  [ ] Test on staging environment first"
echo "  [ ] Run 'npm run build' successfully"
echo "  [ ] Verify all environment variables"
echo ""

exit $errors
