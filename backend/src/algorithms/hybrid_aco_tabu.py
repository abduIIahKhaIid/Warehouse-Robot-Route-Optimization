"""
Hybrid ACO + Tabu Search for warehouse robot route optimization
"""
from typing import List
import random
from .utils import Location, calculate_route_cost


def hybrid_aco_tabu(locations: List[Location], max_evaluations: int = 10000) -> tuple:
    """
    Hybrid algorithm combining Ant Colony Optimization and Tabu Search
    Uses ACO for global exploration and Tabu Search for local refinement
    """
    # ACO Parameters
    NUM_ANTS = 15
    ACO_ITERATIONS = 100
    ALPHA = 1.0  # Pheromone importance
    BETA = 2.0   # Distance importance
    RHO = 0.1    # Pheromone evaporation rate
    Q = 100.0    # Pheromone constant

    # Tabu Search Parameters
    TS_ITERATIONS = 50
    TABU_TENURE = 10

    n = len(locations)
    evaluations = 0

    # Initialize pheromone matrix
    pheromones = [[1.0 for _ in range(n)] for _ in range(n)]

    # Calculate distances between all locations
    from .utils import calculate_distance
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
    for aco_iter in range(ACO_ITERATIONS):
        if evaluations >= max_evaluations:
            break

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

        if evaluations >= max_evaluations:
            break

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

    # Now apply Tabu Search to refine the best solution found by ACO
    current_route = best_route[:]
    current_cost = best_cost

    # Tabu Search phase
    tabu_list = set()
    best_local_route = current_route[:]
    best_local_cost = current_cost

    for ts_iter in range(TS_ITERATIONS):
        if evaluations >= max_evaluations:
            break

        # Generate neighbors using 2-opt swap
        neighbors = []
        for i in range(len(current_route)):
            for j in range(i + 1, len(current_route)):
                if evaluations >= max_evaluations:
                    break

                neighbor_route = current_route[:]
                neighbor_route[i:j+1] = reversed(neighbor_route[i:j+1])  # 2-opt swap
                move = tuple(sorted([i, j]))

                if move not in tabu_list:
                    result = calculate_route_cost(neighbor_route, locations)
                    neighbor_cost = result["grand_total_cost"]
                    evaluations += 1

                    neighbors.append((neighbor_route, neighbor_cost, move))

        if evaluations >= max_evaluations:
            break

        # Find best non-tabu neighbor
        if neighbors:
            best_neighbor_route, best_neighbor_cost, best_move = min(neighbors, key=lambda x: x[1])

            # Apply aspiration criterion: accept if it's better than best local
            if best_neighbor_cost < best_local_cost or best_move not in tabu_list:
                current_route = best_neighbor_route[:]
                current_cost = best_neighbor_cost

                # Update best local solution
                if current_cost < best_local_cost:
                    best_local_route = current_route[:]
                    best_local_cost = current_cost

                # Add move to tabu list
                tabu_list.add(best_move)
                # Maintain tabu list size
                if len(tabu_list) > TABU_TENURE:
                    # Remove oldest entries (simplified by removing random entries)
                    tabu_list = set(list(tabu_list)[-TABU_TENURE:])

    return best_local_route, evaluations