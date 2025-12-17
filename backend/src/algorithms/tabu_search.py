"""
Tabu Search for warehouse robot route optimization
"""
from typing import List, Set, Tuple
import random
from .utils import Location, calculate_route_cost


def tabu_search(locations: List[Location], max_evaluations: int = 10000) -> tuple:
    """
    Tabu Search for TSP optimization
    Uses a tabu list to prevent cycling and local search
    """
    n = len(locations)
    evaluations = 0

    # Function to generate neighbor using 2-opt swap
    def get_neighbor(route: List[int]) -> List[int]:
        new_route = route[:]
        i, j = sorted(random.sample(range(len(new_route)), 2))
        new_route[i:j+1] = reversed(new_route[i:j+1])  # 2-opt swap
        return new_route

    # Initialize with random solution
    current_route = list(range(n))
    random.shuffle(current_route)

    current_result = calculate_route_cost(current_route, locations)
    current_cost = current_result["grand_total_cost"]
    evaluations += 1

    best_route = current_route[:]
    best_cost = current_cost

    # Tabu list to store recent moves
    tabu_list: Set[Tuple[int, int]] = set()
    tabu_tenure = min(10, n // 2)  # Dynamic tenure based on problem size

    # Tabu Search main loop
    iterations = 0
    max_iterations = 2000
    aspiration_threshold = 0.01  # Accept non-tabu moves if they're significantly better

    while iterations < max_iterations and evaluations < max_evaluations:
        iterations += 1

        # Generate neighbors and find the best non-tabu move
        best_neighbor = None
        best_neighbor_cost = float('inf')
        best_move = None

        # Generate a set of candidate neighbors
        candidates = []
        for _ in range(min(50, n * (n - 1) // 2)):  # Limit candidates to avoid too many evaluations
            neighbor_route = get_neighbor(current_route)
            i, j = sorted([current_route.index(neighbor_route[k]) for k in range(len(neighbor_route))
                          if neighbor_route[k] != current_route[k]][:2])
            move = (min(i, j), max(i, j))

            if move not in tabu_list or current_cost - current_cost * aspiration_threshold > best_neighbor_cost:
                candidates.append((neighbor_route, move))

        # Evaluate candidates
        for neighbor_route, move in candidates:
            if evaluations >= max_evaluations:
                break

            result = calculate_route_cost(neighbor_route, locations)
            neighbor_cost = result["grand_total_cost"]
            evaluations += 1

            # Check if move is tabu and if it satisfies aspiration criteria
            is_tabu = move in tabu_list
            aspiration_criteria = neighbor_cost < best_cost

            if not is_tabu or aspiration_criteria:
                if neighbor_cost < best_neighbor_cost:
                    best_neighbor = neighbor_route
                    best_neighbor_cost = neighbor_cost
                    best_move = move

        if evaluations >= max_evaluations:
            break

        # If no valid neighbor found, generate a random move
        if best_neighbor is None:
            best_neighbor = get_neighbor(current_route)
            result = calculate_route_cost(best_neighbor, locations)
            best_neighbor_cost = result["grand_total_cost"]
            evaluations += 1

        # Update current solution
        current_route = best_neighbor[:]
        current_cost = best_neighbor_cost

        # Update best solution if improved
        if current_cost < best_cost:
            best_route = current_route[:]
            best_cost = current_cost

        # Add move to tabu list
        if best_move:
            tabu_list.add(best_move)
            # Remove oldest moves from tabu list if it exceeds tenure
            if len(tabu_list) > tabu_tenure:
                # Remove the oldest entries (simplified by removing random entries)
                tabu_list = set(list(tabu_list)[-tabu_tenure:])

    return best_route, evaluations