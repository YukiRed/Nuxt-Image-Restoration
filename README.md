# Nuxt 3 Minimal Starter

This project is a Nuxt.js 3 application integrated with a Python backend for tasks like image colorization, with GPU support enabled via Docker and NVIDIA.

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more about the framework.

## Setup

### Cloning the Repository (Including Models)

This project uses Git LFS (Large File Storage) to store model files like `.pth` files. To ensure you clone the repository along with these model files, follow these steps:

1. **Install Git LFS**:

   ```bash
   git lfs install
   ```

2. **Clone the repository** (Git LFS will automatically download the model files):

   ```bash
   git clone https://github.com/yourusername/yourrepository.git
   cd yourrepository
   ```

3. **Pull the LFS-tracked files** (if not downloaded automatically):

   ```bash
   git lfs pull
   ```

### Install Dependencies

If you want to run the project locally, you can install the necessary dependencies using one of the following package managers:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

### Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Preview the production build locally:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

---

## Docker Setup

This project is fully Dockerized and includes GPU support through the NVIDIA runtime. Follow these steps to build the Docker image and set up the Docker environment.

### Building the Docker Image

To build the Docker image for production, run the following command from the root of the project:

```bash
docker build -t nuxt-python-app .
```

This command will create a Docker image named `nuxt-python-app` by using a multi-stage build. The Node.js application is built in the first stage, and the production environment (with Python dependencies) is set up in the second stage.

### Running with Docker Compose

This project uses Docker Compose for orchestrating the containers and enabling GPU access. To run the project with Docker Compose, follow these steps:

1. Ensure that you have the **NVIDIA Container Toolkit** installed and properly configured to enable GPU access. You can install it with:

   ```bash
   sudo apt-get install -y nvidia-container-toolkit
   sudo systemctl restart docker
   ```

2. To verify GPU access, you can run the following command:

   ```bash
   docker run --gpus all nvidia/cuda:11.0-base nvidia-smi
   ```

   If successful, you should see information about your GPU.

3. Run Docker Compose to start the application:

   ```bash
   docker-compose up --build
   ```

This will:

- Build the Docker image if it hasn’t been built yet.
- Start the service with GPU access using NVIDIA's runtime.
- Expose the application on `http://localhost:3000`.

### Docker Compose Configuration

The `docker-compose.yml` is configured to expose the Nuxt.js application on port `3000` and mount the following directories:

- **./tmp:/app/tmp**: The temporary directory used by the application.
- **./models:/app/models**: The directory containing the model files (tracked by Git LFS).

It also specifies the NVIDIA runtime for GPU access:

```yaml
version: "3.9"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NVIDIA_VISIBLE_DEVICES=all # Make all GPUs visible inside the container
      - NVIDIA_DRIVER_CAPABILITIES=compute,utility # Limit to only what is needed for CUDA
    volumes:
      - .:/app
      - ./tmp:/app/tmp
      - ./models:/app/models
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]
    runtime: nvidia
    restart: always
```

### Accessing the Application

Once the container is up, the application will be running on `http://localhost:3000`. The application should now be ready to handle tasks like image colorization with GPU acceleration.

### Stop the Services

To stop the Docker containers, use:

```bash
docker-compose down
```

This will gracefully stop the running containers.

---

## Deployment

For deployment to a production server or cloud provider, check out the [Nuxt 3 deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information on deploying Nuxt.js apps.

---

### Key Points

- **Dockerized**: The project is containerized with GPU support using Docker and the NVIDIA runtime.
- **Multi-Stage Build**: The Dockerfile leverages multi-stage builds for an optimized production environment, separating the Node.js build from the final Python runtime environment.
- **GPU Support**: The Docker Compose file is configured to support GPU-based computation, crucial for tasks involving deep learning models like DeOldify.
