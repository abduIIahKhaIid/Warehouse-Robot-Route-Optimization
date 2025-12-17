"""
Particle Swarm Optimization for warehouse robot route optimization
"""
from typing import List
from .utils import Location, calculate_route_cost
import random


def particle_swarm_optimization(locations: List[Location], max_evaluations: int = 10000) -> tuple:
    """
    Particle Swarm Optimization for TSP optimization
    Uses particle representation as permutations of location indices
    """
    POPULATION_SIZE = 30
    MAX_ITERATIONS = 1000
    C1 = 1.5  # Cognitive parameter
    C2 = 1.5  # Social parameter

    n = len(locations)
    evaluations = 0

    # Function to create a new random route
    def create_random_route():
        route = list(range(n))
        random.shuffle(route)
        return route

    # Function to calculate fitness (lower is better)
    def calculate_fitness(route_indices):
        nonlocal evaluations
        evaluations += 1
        result = calculate_route_cost(route_indices, locations)
        return result["grand_total_cost"]

    # Initialize swarm
    swarm = []
    fitnesses = []

    for _ in range(POPULATION_SIZE):
        if evaluations >= max_evaluations:
            break
        route = create_random_route()
        swarm.append(route)
        fitness = calculate_fitness(route)
        fitnesses.append(fitness)

    # Track personal bests
    personal_best_positions = [route[:] for route in swarm]
    personal_best_fitnesses = fitnesses[:]

    # Find initial global best
    global_best_idx = fitnesses.index(min(fitnesses))
    global_best_position = swarm[global_best_idx][:]
    global_best_fitness = fitnesses[global_best_idx]

    # PSO main loop
    iteration = 0
    while iteration < MAX_ITERATIONS and evaluations < max_evaluations:
        iteration += 1

        for i in range(len(swarm)):
            if evaluations >= max_evaluations:
                break

            # Update velocity and position for particle i
            current_route = swarm[i][:]

            # Create new position based on current, personal best, and global best
            new_route = current_route[:]

            # Apply changes based on personal best
            for _ in range(int(C1 * random.random())):
                if evaluations >= max_evaluations:
                    break
                if random.random() < 0.5 and len(personal_best_positions[i]) > 1:
                    # Perform a random swap towards personal best
                    idx1, idx2 = random.sample(range(len(new_route)), 2)
                    new_route[idx1], new_route[idx2] = new_route[idx2], new_route[idx1]
                    evaluations += 1

            # Apply changes based on global best
            for _ in range(int(C2 * random.random())):
                if evaluations >= max_evaluations:
                    break
                if random.random() < 0.5 and len(global_best_position) > 1:
                    # Try to incorporate elements from global best
                    # Find a location in global best and try to move it toward its position
                    pos_in_global = random.randint(0, len(global_best_position) - 1)
                    target_location = global_best_position[pos_in_global]

                    # Find where this location currently is in the current route
                    pos_in_current = new_route.index(target_location)

                    # If not in the right position, try to move it closer
                    if pos_in_current != pos_in_global and len(new_route) > 1:
                        # Perform adjacent swap to move element closer to target position
                        if pos_in_current < pos_in_global:
                            swap_idx = min(pos_in_current + 1, len(new_route) - 1)
                        else:
                            swap_idx = max(pos_in_current - 1, 0)
                        new_route[pos_in_current], new_route[swap_idx] = new_route[swap_idx], new_route[pos_in_current]
                        evaluations += 1

            # Ensure the new route is a valid permutation
            if len(set(new_route)) != len(new_route):
                # If there are duplicates, fix by creating a random permutation of missing items
                all_indices = set(range(n))
                current_indices = set(new_route)
                missing_indices = list(all_indices - current_indices)
                extra_indices = []

                # Find duplicate indices
                seen = set()
                for idx in new_route:
                    if idx in seen:
                        extra_indices.append(idx)
                    else:
                        seen.add(idx)

                # Replace extras with missing indices
                for j in range(len(new_route)):
                    if new_route[j] in [x for k, x in enumerate(new_route) if k != j]:
                        if missing_indices:
                            new_route[j] = missing_indices.pop(0)

            # Calculate fitness of new position
            new_fitness = calculate_fitness(new_route)

            # Update personal best if new position is better
            if new_fitness < personal_best_fitnesses[i]:
                personal_best_positions[i] = new_route[:]
                personal_best_fitnesses[i] = new_fitness

            # Update global best if new position is better
            if new_fitness < global_best_fitness:
                global_best_position = new_route[:]
                global_best_fitness = new_fitness

            # Update swarm with new position
            swarm[i] = new_route[:]
            fitnesses[i] = new_fitness

    return global_best_position, evaluations