# InnoVoltive Documentation

This folder contains documentation for setting up and managing the InnoVoltive HTTPS server.

## Files

- **`DAEMON_SETUP.md`** - Complete guide for setting up the server as a systemd daemon
- **`innovoltive.service`** - Systemd service file for the HTTPS server

## Quick Start

To set up the daemon service:

1. Follow the instructions in `DAEMON_SETUP.md`
2. Use the provided `innovoltive.service` file
3. The server will run on https://innovoltive.com:443

## Service Management

```bash
# Start service
sudo systemctl start innovoltive.service


# Retart service
sudo systemctl restart innovoltive.service
# Check status  
sudo systemctl status innovoltive.service

# View logs
sudo journalctl -u innovoltive.service -f
```

## Support

For issues or questions, refer to the troubleshooting section in `DAEMON_SETUP.md`.
