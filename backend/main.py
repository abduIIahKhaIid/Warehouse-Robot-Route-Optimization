from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from src.algorithms.utils import Location, LocationDetail
from src.algorithms.algorithms import genetic_algorithm, simulated_annealing, particle_swarm_optimization, ant_colony_optimization, tabu_search, differential_evolution, artificial_bee_colony, hybrid_aco_tabu, modified_abc

app = FastAPI(title="Warehouse Robot Optimizer API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class OptimizationRequest(BaseModel):
    locations: List[Location]
    algorithm: str = "GA"

class OptimizationResponse(BaseModel):
    route: List[str]
    coordinates: List[List[float]]
    totalDistance: float
    totalLoadingTime: float
    totalPenalty: float
    grandTotalCost: float
    routeSequence: List[str]
    penalties: Dict[str, float]
    algorithmUsed: str
    locationDetails: List[LocationDetail]
    evaluationsUsed: int

from src.algorithms.utils import calculate_route_cost

@app.get("/")
def read_root():
    return {
        "message": "Warehouse Robot Optimizer API",
        "status": "running",
        "algorithms": ["GA", "SA", "PSO", "ACO", "HYBRID"]
    }

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_route(request: OptimizationRequest):
    """
    Optimize warehouse robot route based on locations and algorithm.
    Robot travels at 1 unit/min and must return to (0,0).
    """
    try:
        if len(request.locations) < 2:
            raise HTTPException(status_code=400, detail="At least 2 locations required")

        if request.algorithm == "GA":
            best_route, evaluations = genetic_algorithm(request.locations)
            algorithm_name = "Genetic Algorithm"
        elif request.algorithm == "SA":
            best_route, evaluations = simulated_annealing(request.locations)
            algorithm_name = "Simulated Annealing"
        elif request.algorithm == "PSO":
            best_route, evaluations = particle_swarm_optimization(request.locations)
            algorithm_name = "Particle Swarm Optimization"
        elif request.algorithm == "ACO":
            best_route, evaluations = ant_colony_optimization(request.locations)
            algorithm_name = "Ant Colony Optimization"
        elif request.algorithm in ["TS", "TABU"]:
            best_route, evaluations = tabu_search(request.locations)
            algorithm_name = "Tabu Search"
        elif request.algorithm == "DE":
            best_route, evaluations = differential_evolution(request.locations)
            algorithm_name = "Differential Evolution"
        elif request.algorithm == "ABC":
            best_route, evaluations = artificial_bee_colony(request.locations)
            algorithm_name = "Artificial Bee Colony"
        elif request.algorithm == "MABC":
            best_route, evaluations = modified_abc(request.locations)
            algorithm_name = "Modified Artificial Bee Colony"
        elif request.algorithm == "HYBRID":
            best_route, evaluations = hybrid_aco_tabu(request.locations)
            algorithm_name = "Hybrid (ACO + Tabu Search)"
        else:
            # Default to GA for other algorithms
            best_route, evaluations = genetic_algorithm(request.locations)
            algorithm_name = request.algorithm

        # Calculate final route metrics
        result = calculate_route_cost(best_route, request.locations)

        # Build response
        route_ids = [request.locations[i].id for i in best_route]
        route_sequence = ["Start (0,0)"] + route_ids + ["Return to Start"]

        return OptimizationResponse(
            route=route_ids,
            coordinates=result["coordinates"],
            totalDistance=round(result["total_distance"], 2),
            totalLoadingTime=round(result["total_loading_time"], 2),
            totalPenalty=round(result["total_penalty"], 2),
            grandTotalCost=round(result["grand_total_cost"], 2),
            routeSequence=route_sequence,
            penalties={k: round(v, 2) for k, v in result["penalties"].items()},
            algorithmUsed=algorithm_name,
            locationDetails=result["location_details"],
            evaluationsUsed=evaluations
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")
