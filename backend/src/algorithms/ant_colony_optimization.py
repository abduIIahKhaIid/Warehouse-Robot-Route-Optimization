"""
Ant Colony Optimization for warehouse robot route optimization
"""
from typing import List
import random
from .utils import Location, calculate_route_cost, calculate_distance


def ant_colony_optimization(locations: List[Location], max_evaluations: int = 10000) -> tuple:
    """
    Ant Colony Optimization for TSP optimization
    Uses pheromone trails to guide search
    """
    NUM_ANTS = 20
    MAX_ITERATIONS = 500
    ALPHA = 1.0  # Pheromone importance
    BETA = 2.0   # Distance importance
    RHO = 0.1    # Pheromone evaporation rate
    Q = 100.0    # Pheromone constant

    n = len(locations)
    evaluations = 0

    # Initialize pheromone matrix
    pheromones = [[1.0 for _ in range(n)] for _ in range(n)]

    # Calculate distances between all locations
    distances = [[0.0 for _ in range(n)] for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                distances[i][j] = calculate_distance(
                    locations[i].x, locations[i].y,
                    locations[j].x, locations[j].y
                )

    # Function to build a route for an ant using probability
    def build_route():
        route = []
        unvisited = set(range(n))
        current = random.choice(list(unvisited))

        route.append(current)
        unvisited.remove(current)

        while unvisited:
            # Calculate probabilities for next location
            probabilities = []
            total = 0.0

            for next_loc in unvisited:
                if distances[current][next_loc] > 0:
                    prob = (pheromones[current][next_loc] ** ALPHA) * \
                           ((1.0 / distances[current][next_loc]) ** BETA)
                    probabilities.append((next_loc, prob))
                    total += prob
                else:
                    probabilities.append((next_loc, 0.0))

            # Select next location based on probabilities
            if total > 0:
                rand = random.random() * total
                cumulative = 0.0
                selected = None
                for next_loc, prob in probabilities:
                    cumulative += prob
                    if rand <= cumulative:
                        selected = next_loc
                        break

                if selected is None:
                    # Fallback: pick random unvisited location
                    selected = random.choice(list(unvisited))
            else:
                # If all probabilities are zero, pick random
                selected = random.choice(list(unvisited))

            route.append(selected)
            unvisited.remove(selected)
            current = selected

        return route

    # Initialize best solution
    best_route = list(range(n))
    random.shuffle(best_route)
    best_cost = float('inf')

    # ACO main loop
    iteration = 0
    while iteration < MAX_ITERATIONS and evaluations < max_evaluations:
        iteration += 1

        # Generate solutions for all ants
        ant_routes = []
        ant_costs = []

        for _ in range(NUM_ANTS):
            if evaluations >= max_evaluations:
                break

            route = build_route()
            result = calculate_route_cost(route, locations)
            cost = result["grand_total_cost"]

            evaluations += 1
            ant_routes.append(route)
            ant_costs.append(cost)

            # Update best solution if found
            if cost < best_cost:
                best_cost = cost
                best_route = route[:]

        # Update pheromones
        # Evaporate pheromones
        for i in range(n):
            for j in range(n):
                if i != j:
                    pheromones[i][j] *= (1.0 - RHO)

        # Deposit pheromones for each ant
        for route, cost in zip(ant_routes, ant_costs):
            if cost > 0:  # Avoid division by zero
                pheromone_deposit = Q / cost
                for i in range(len(route)):
                    from_loc = route[i]
                    to_loc = route[(i + 1) % len(route)]  # Return to start
                    pheromones[from_loc][to_loc] += pheromone_deposit

    return best_route, evaluations