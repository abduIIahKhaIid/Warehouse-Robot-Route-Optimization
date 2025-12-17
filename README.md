# Warehouse Robot Route Optimization

An advanced optimization system for warehouse robot navigation that implements multiple algorithms to find the most efficient routes for robots moving through a warehouse environment.

## 🚀 Overview

This project optimizes warehouse robot routes using several advanced metaheuristic algorithms to minimize travel time and costs. The system features both a backend API and a modern frontend interface for managing and visualizing optimization results.

### Key Features
- Multiple optimization algorithms (Genetic Algorithm, Simulated Annealing, Particle Swarm, Ant Colony, Tabu Search, etc.)
- RESTful API backend built with FastAPI
- Modern web interface using Next.js
- Real-time route visualization
- Cost calculation including distance, loading time, and penalties

## 🛠️ Architecture

### Backend
- **Framework**: FastAPI
- **Algorithms**:
  - Genetic Algorithm (GA)
  - Simulated Annealing (SA)
  - Particle Swarm Optimization (PSO)
  - Ant Colony Optimization (ACO)
  - Tabu Search (TS)
  - Differential Evolution (DE)
  - Artificial Bee Colony (ABC)
  - Hybrid ACO + Tabu Search
- **Languages**: Python 3.12+

### Frontend
- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **Components**: Radix UI
- **Icons**: Lucide React
- **Languages**: TypeScript, React

## 🏗️ Project Structure

```
Warehouse-Robot-Route-Optimization/
├── backend/                  # FastAPI backend with optimization algorithms
│   ├── main.py              # Main API entry point
│   ├── src/
│   │   └── algorithms/      # Various optimization implementations
│   └── pyproject.toml       # Python dependencies
└── frontend/                # Next.js web interface
    ├── src/
    ├── package.json         # Node.js dependencies
    └── next.config.ts       # Next.js configuration
```

## 📋 Prerequisites

- Python 3.12+
- Node.js (latest LTS)
- npm or yarn package manager

## 🔧 Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
uv pip install -r uv.lock
# or if using pip
pip install -e .
```

4. Run the backend server:
```bash
uvicorn main:app --reload
```
By default, the API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```
The frontend will be available at `http://localhost:3000`

## 🧪 API Endpoints

### GET /
- **Description**: Health check endpoint
- **Response**: Status information and available algorithms

### POST /optimize
- **Description**: Optimize robot route based on provided locations
- **Body**:
```json
{
  "locations": [
    {
      "id": "A",
      "x": 10,
      "y": 15,
      "loadingTime": 5
    }
  ],
  "algorithm": "GA"
}
```
- **Supported Algorithms**: `GA`, `SA`, `PSO`, `ACO`, `TS`, `DE`, `ABC`, `MABC`, `HYBRID`
- **Response**: Optimized route with cost breakdown

## 🤖 Optimization Algorithms

The system implements several metaheuristic algorithms:

- **Genetic Algorithm (GA)**: Population-based evolutionary optimization
- **Simulated Annealing (SA)**: Probabilistic technique for global optimization
- **Particle Swarm Optimization (PSO)**: Population-based stochastic optimization
- **Ant Colony Optimization (ACO)**: Mimics ant behavior for pathfinding
- **Tabu Search (TS)**: Memory-based local search technique
- **Differential Evolution (DE)**: Stochastic population-based method
- **Artificial Bee Colony (ABC)**: Swarm intelligence algorithm
- **Hybrid ACO-Tabu**: Combined approach for improved performance

## 💡 Usage

1. Start both the backend and frontend servers
2. Access the web interface at `http://localhost:3000`
3. Input warehouse locations with coordinates and loading times
4. Select an optimization algorithm
5. Submit the optimization request
6. View the optimal route and cost breakdown

## 📊 Metrics Calculated

- **Total Distance**: Cumulative distance traveled by the robot
- **Loading Time**: Total time spent loading/unloading at locations
- **Penalties**: Additional costs based on constraints
- **Grand Total Cost**: Combined cost metric for optimization
- **Algorithm Performance**: Number of evaluations used

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 🐛 Issues & Support

If you encounter any issues or have questions, please file an issue in the GitHub repository.

## 🙏 Acknowledgments

- FastAPI for the robust backend framework
- Next.js for the modern frontend architecture
- Various optimization algorithm implementations

## 🚀 Deploying to Vercel

To deploy the frontend application to Vercel:

1. Install the Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Run the deploy command:
   ```bash
   vercel --prod
   ```

### Environment Variables for Vercel Deployment

Before deploying, you'll need to set the following environment variable in your Vercel dashboard:

- `NEXT_PUBLIC_API_URL`: The URL of your deployed backend API (e.g., `https://your-backend-app.onrender.com`)

### Alternative Deployment Method

You can also link your GitHub repository to Vercel and deploy directly through the Vercel dashboard. Once linked, Vercel will automatically deploy on every push to your repository.

### Backend Deployment

For the backend API, you have several options:

1. Deploy to a cloud service like Render, Railway, or Heroku
2. Use a container platform like AWS ECS, Google Cloud Run, or Azure Container Instances
3. Deploy to a VPS or cloud VM

Make sure to update the `NEXT_PUBLIC_API_URL` environment variable in Vercel with the URL of your deployed backend API.