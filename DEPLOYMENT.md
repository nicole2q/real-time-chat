# Production Deployment Guide

## Pre-deployment Checklist

### Code Quality
- [ ] All TypeScript strict mode checks pass
- [ ] No console.log statements (use proper logging)
- [ ] Error handling in all critical paths
- [ ] No hardcoded credentials or secrets
- [ ] Unit tests pass
- [ ] No unused dependencies

### Security
- [ ] Environment variables configured correctly
- [ ] HTTPS/SSL certificate obtained
- [ ] CORS properly configured for production domain
- [ ] Security headers enabled
- [ ] Input validation on all endpoints
- [ ] Rate limiting enabled
- [ ] Database password changed from default
- [ ] API keys and secrets rotated

### Configuration
- [ ] NODE_ENV=production
- [ ] CLIENT_URL set to production domain
- [ ] REACT_APP_DEMO_MODE=false
- [ ] Database connection configured
- [ ] Backup strategy in place
- [ ] Monitoring/alerting set up
- [ ] Logging configured

## Deployment Steps

### Option 1: Traditional Server (Ubuntu/Debian)

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# 4. Clone repository
cd /var/www
sudo git clone <repo-url> chat-app
cd chat-app

# 5. Install dependencies
npm run install-all

# 6. Set up environment files
sudo cp server/.env.example server/.env
sudo cp client/.env.example client/.env
sudo nano server/.env  # Edit with production values
sudo nano client/.env

# 7. Build application
npm run build

# 8. Create systemd service for Node.js
sudo tee /etc/systemd/system/chat-app.service > /dev/null <<EOF
[Unit]
Description=Chat App Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/chat-app
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/var/www/chat-app/server/.env
ExecStart=/usr/bin/node /var/www/chat-app/server/dist/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 9. Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable chat-app
sudo systemctl start chat-app

# 10. Configure Nginx (use nginx.conf in repo)
sudo cp nginx.conf /etc/nginx/sites-available/chat-app
sudo ln -s /etc/nginx/sites-available/chat-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 11. Set up SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com

# 12. Set up monitoring
# Install PM2 or similar for process management
sudo npm install -g pm2
pm2 start /var/www/chat-app/server/dist/server.js --name "chat-app"
pm2 startup
pm2 save
```

### Option 2: Docker Deployment

```bash
# 1. Build Docker image
docker build -t chat-app:latest .

# 2. Run with docker-compose
docker-compose up -d

# 3. Configure Nginx reverse proxy
# Use nginx.conf provided
```

### Option 3: Heroku Deployment

```bash
# 1. Install Heroku CLI
brew tap heroku/brew && brew install heroku

# 2. Login to Heroku
heroku login

# 3. Create app
heroku create chat-app-production

# 4. Add MongoDB addon (optional)
heroku addons:create mongolab

# 5. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CLIENT_URL=https://chat-app-production.herokuapp.com
heroku config:set REACT_APP_DEMO_MODE=false

# 6. Create Procfile
echo "web: npm run start:prod" > Procfile

# 7. Deploy
git push heroku main

# 8. Monitor logs
heroku logs --tail
```

### Option 4: AWS EC2 Deployment

```bash
# 1. Launch EC2 instance (Node.js AMI recommended)
# 2. Connect via SSH
# 3. Follow "Traditional Server" steps above
# 4. Set up RDS for MongoDB (or use local MongoDB)
# 5. Configure security groups for ports 80, 443, 5000
# 6. Set up Route53 for domain
# 7. Use AWS Certificate Manager for SSL
# 8. Set up CloudWatch for monitoring
# 9. Configure auto-scaling if needed
```

## Post-deployment

### Monitoring
- Set up health checks
- Configure error logging (Sentry, New Relic, etc.)
- Monitor server performance
- Set up alerts for errors

### Maintenance
- Regular security updates
- Database backups
- Log rotation
- Dependency updates

### Scaling
- Load balancer configuration
- Database replication
- Caching layer (Redis)
- Static asset CDN

## Troubleshooting

### Server won't start
```bash
# Check logs
tail -f /var/log/chat-app.log
pm2 logs chat-app
```

### Connection timeout
- Check firewall rules
- Verify CORS configuration
- Check database connection

### High memory usage
- Check for memory leaks
- Implement connection pooling
- Monitor active connections

### Database issues
- Verify MongoDB is running
- Check connection string
- Verify authentication

## Performance Tuning

```javascript
// Add to server.ts for production optimization
const compression = require('compression');
app.use(compression());

// Redis session store
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
```

## Security Hardening

- [ ] Enable HTTPS/TLS
- [ ] Configure WAF (Web Application Firewall)
- [ ] Set up DDoS protection (Cloudflare, AWS Shield)
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Keep dependencies updated
- [ ] Monitor for vulnerabilities

## Support

For deployment issues:
1. Check logs carefully
2. Review environment variables
3. Test locally first
4. Check network connectivity
5. Verify file permissions
