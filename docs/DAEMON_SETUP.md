# InnoVoltive HTTPS Server Daemon Setup

This document explains how to set up the InnoVoltive HTTPS server as a systemd daemon service that starts automatically on system boot.

## Prerequisites

- Ubuntu/Debian Linux system with systemd
- Node.js v18.17+ installed (we use v20.19.4 via NVM)
- SSL certificates from Let's Encrypt for `innovoltive.com`
- Root/sudo access

### Important: Node.js Version Requirements

⚠️ **Critical**: Next.js 15.5.2 requires Node.js 18.17 or higher. If you encounter syntax errors when running with `sudo`, you have a Node.js version conflict (see Troubleshooting section).

### pnpm Build Scripts (If Needed)

Some systems with pnpm v10+ may show warnings about ignored build scripts. If you encounter build script warnings, you have two options:

**Option 1 - Install with scripts enabled:**
```bash
pnpm install --ignore-scripts=false
```

**Option 2 - Configure pnpm globally:**
```bash
pnpm config set ignore-scripts false
```

This is **only needed if you see warnings** about ignored build dependencies like `@clerk/shared`, `@tailwindcss/oxide`, `sharp`, etc.

## Service Configuration

The service is configured to:
- Run on port 443 (HTTPS)
- Start automatically on system boot
- Restart automatically if the process crashes
- Run as root user (required for port 443)
- Log to syslog

## Installation Steps

### 1. Copy Service File

Copy the systemd service file to the system directory:

```bash
sudo cp docs/innovoltive.service /etc/systemd/system/
```

### 2. Reload Systemd

Reload systemd to recognize the new service:

```bash
sudo systemctl daemon-reload
```

### 3. Enable Service

Enable the service to start on boot:

```bash
sudo systemctl enable innovoltive.service
```

### 4. Start Service

Start the service immediately:

```bash
sudo systemctl start innovoltive.service
```

## Service Management Commands

### Check Service Status
```bash
sudo systemctl status innovoltive.service
```

### Start the Service
```bash
sudo systemctl start innovoltive.service
```

### Stop the Service
```bash
sudo systemctl stop innovoltive.service
```

### Restart the Service
```bash
sudo systemctl restart innovoltive.service
```

### Disable Auto-Start
```bash
sudo systemctl disable innovoltive.service
```

### View Real-time Logs
```bash
sudo journalctl -u innovoltive.service -f
```

### View All Logs
```bash
sudo journalctl -u innovoltive.service
```

## Service File Explanation

The service file (`innovoltive.service`) contains:

- **Description**: Human-readable service description
- **After**: Ensures network is available before starting
- **Type**: Simple service type for long-running processes
- **Restart**: Always restart if the process exits
- **RestartSec**: Wait 1 second before restarting
- **User**: Run as root (required for port 443)
- **ExecStart**: Full path to Node.js and server script
- **WorkingDirectory**: Project directory
- **Environment**: Set NODE_ENV to production
- **StandardOutput/Error**: Send logs to syslog
- **WantedBy**: Start in multi-user mode

## Troubleshooting

### Node.js Version Conflict (Critical Issue)

**Problem**: When using `sudo` to run Node.js commands, the system uses the system's Node.js version instead of your NVM-managed version. This can cause syntax errors like:

```
SyntaxError: Unexpected token '?'
```

**Root Cause**: Next.js 15.5.2 requires Node.js 18.17+ but the system's Node.js might be older (e.g., v12.22.9).

**Solution Steps**:

1. **Check Node.js versions**:
   ```bash
   # Your user's Node.js version
   node --version
   # Output: v20.19.4 (good)
   
   # System's Node.js version when using sudo
   sudo node --version
   # Output: v12.22.9 (too old for Next.js 15)
   ```

2. **Find your NVM Node.js path**:
   ```bash
   which node
   # Output: /home/asepahvand/.nvm/versions/node/v20.19.4/bin/node
   ```

3. **Update service file to use full Node.js path**:
   In the `innovoltive.service` file, use the full path to your NVM Node.js:
   ```ini
   ExecStart=/home/asepahvand/.nvm/versions/node/v20.19.4/bin/node /home/asepahvand/repos/innovoltive/server.js
   ```

4. **Manual testing**:
   ```bash
   # Test with full path
   sudo /home/asepahvand/.nvm/versions/node/v20.19.4/bin/node server.js
   ```

**Why This Happens**: 
- `sudo` resets the PATH environment variable
- NVM installs Node.js in user directory, not system-wide
- The service needs explicit path to use the correct Node.js version

### Service Won't Start
1. Check service status: `sudo systemctl status innovoltive.service`
2. Check logs: `sudo journalctl -u innovoltive.service`
3. Verify Node.js path: `/home/asepahvand/.nvm/versions/node/v20.19.4/bin/node --version`
4. Check SSL certificates: `sudo ls -la /etc/letsencrypt/live/innovoltive.com/`

### Port 443 Already in Use
Check what's using port 443:
```bash
sudo netstat -tlnp | grep :443
sudo lsof -i :443
```

### SSL Certificate Issues
Verify certificates exist and are readable:
```bash
sudo ls -la /etc/letsencrypt/live/innovoltive.com/
sudo openssl x509 -in /etc/letsencrypt/live/innovoltive.com/cert.pem -text -noout
```

### Node.js Version Issues
The service uses the specific Node.js version from NVM. If you update Node.js, update the service file path accordingly.

## Security Notes

- The service runs as root to bind to port 443
- SSL certificates are read at startup
- Consider using a reverse proxy (nginx) for additional security layers
- Regularly update SSL certificates (Let's Encrypt auto-renewal)

## Files

- Service file: `docs/innovoltive.service`
- Server script: `server.js`
- SSL certificates: `/etc/letsencrypt/live/innovoltive.com/`

## Verification

After setup, verify the service is working:

```bash
# Check service is running
sudo systemctl status innovoltive.service

# Test HTTPS connection
curl -I https://innovoltive.com

# Check if running on port 443
sudo netstat -tlnp | grep :443
```

The website should be accessible at: https://innovoltive.com
