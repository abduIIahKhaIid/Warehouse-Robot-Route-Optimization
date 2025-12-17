"""
Simulated Annealing for warehouse robot route optimization
"""
from typing import List, Dict
from .utils import Location, calculate_route_cost
import random
import math


def simulated_annealing(locations: List[Location], max_evaluations: int = 10000) -> tuple:
    """
    Simulated Annealing for TSP optimization
    Uses 2-opt swap for neighborhood generation
    """
    INITIAL_TEMP = 1000
    COOLING_RATE = 0.995
    MIN_TEMP = 0.1

    n = len(locations)
    evaluations = 0

    # Initialize with random solution
    current_route = list(range(n))
    random.shuffle(current_route)

    def cost(route_indices):
        nonlocal evaluations
        evaluations += 1
        result = calculate_route_cost(route_indices, locations)
        return result["grand_total_cost"]

    current_cost = cost(current_route)
    best_route = current_route[:]
    best_cost = current_cost

    temperature = INITIAL_TEMP

    while temperature > MIN_TEMP and evaluations < max_evaluations:
        # Generate neighbor using 2-opt swap
        new_route = current_route[:]
        i, j = sorted(random.sample(range(n), 2))
        new_route[i:j+1] = reversed(new_route[i:j+1])

        new_cost = cost(new_route)
        delta = new_cost - current_cost

        # Accept or reject
        if delta < 0 or random.random() < math.exp(-delta / temperature):
            current_route = new_route
            current_cost = new_cost

            if current_cost < best_cost:
                best_route = current_route[:]
                best_cost = current_cost

        temperature *= COOLING_RATE

    return best_route, evaluations