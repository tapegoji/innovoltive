 #!/bin/bash
 cd /home/asepahvand/repos/innovoltive
 git pull && pnpm i && pnpm run build 
 sudo systemctl restart innovoltive.service
