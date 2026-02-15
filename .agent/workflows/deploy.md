---
description: Deploy the application to the server (192.168.50.22)
---

# Deployment Workflow

Since your local machine is ARM (Mac) and your server may be different, we will copy the source code and build the images directly on the server.

### 1. Synchronize Files
Run this command from your **local machine** (Mac) to send the project files to the server. We use `rsync` to exclude unnecessary files like `node_modules` and local data.

```bash
rsync -avz --exclude 'node_modules' \
      --exclude '.git' \
      --exclude 'frontend/dist' \
      --exclude 'backend/uploads/*' \
      --exclude 'mongodb_data/*' \
      ./ pablo@192.168.50.22:~/blog-Vue-Node/
```

### 2. Connect to Server
SSH into your server:
```bash
ssh pablo@192.168.50.22
```

### 3. Setup Environment
Ensure the server has a `.env` file in the `backend` directory. If it doesn't exist, create it:
```bash
cd ~/blog-Vue-Node/backend
nano .env
```
*Make sure `MONGO_URI` is set to `mongodb://mongodb:27017/family-blog` for the Docker network.*

### 4. Build and Launch
From the root of the project on the server:
```bash
cd ~/blog-Vue-Node
docker-compose down
docker-compose up -d --build
```

### 5. Initialize Admin (First time only)
If the database is empty, run the admin creation script on the server:
```bash
docker exec family-blog-backend node create_admin.js
```

### 6. Verify
Check if containers are running:
```bash
docker ps
```
The app should now be accessible at `http://192.168.50.22:8080`.
