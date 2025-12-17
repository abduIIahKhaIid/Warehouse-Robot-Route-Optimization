"""
Artificial Bee Colony for warehouse robot route optimization
"""
from typing import List
import random
from .utils import Location, calculate_route_cost


def artificial_bee_colony(locations: List[Location], max_evaluations: int = 10000) -> tuple:
    """
    Artificial Bee Colony for TSP optimization
    Simulates the foraging behavior of honey bees
    """
    POPULATION_SIZE = 30  # Total number of bees (employed + onlooker)
    MAX_GENERATIONS = 500
    LIMIT = 100  # Limit for abandoning a food source (solution)

    n = len(locations)
    evaluations = 0

    # Function to create a random route (permutation)
    def create_random_route():
        route = list(range(n))
        random.shuffle(route)
        return route

    # Function to generate a neighbor solution (using swap mutation)
    def generate_neighbor_solution(base_route):
        neighbor = base_route[:]
        # Perform random swaps to create a neighbor
        num_swaps = random.randint(1, 3)  # Random number of swaps
        for _ in range(num_swaps):
            i, j = random.sample(range(len(neighbor)), 2)
            neighbor[i], neighbor[j] = neighbor[j], neighbor[i]
        return neighbor

    # Initialize population (food sources)
    population = []
    fitnesses = []
    trial_counts = []  # Count of trials without improvement for each solution

    for _ in range(POPULATION_SIZE):
        if evaluations >= max_evaluations:
            break
        route = create_random_route()
        population.append(route)
        result = calculate_route_cost(route, locations)
        fitness = result["grand_total_cost"]
        fitnesses.append(fitness)
        trial_counts.append(0)
        evaluations += 1

    if evaluations >= max_evaluations:
        best_idx = fitnesses.index(min(fitnesses))
        return population[best_idx], evaluations

    # ABC main loop
    generation = 0
    while generation < MAX_GENERATIONS and evaluations < max_evaluations:
        generation += 1

        # Employed bee phase: each bee searches around its food source
        for i in range(POPULATION_SIZE):
            if evaluations >= max_evaluations:
                break

            # Generate a neighbor solution for employed bee i
            neighbor = generate_neighbor_solution(population[i])
            result = calculate_route_cost(neighbor, locations)
            neighbor_fitness = result["grand_total_cost"]
            evaluations += 1

            # Greedy selection: keep better solution
            if neighbor_fitness < fitnesses[i]:
                population[i] = neighbor
                fitnesses[i] = neighbor_fitness
                trial_counts[i] = 0  # Reset trial count
            else:
                trial_counts[i] += 1  # Increment trial count

        # Calculate selection probabilities for onlooker bees
        # Convert cost to fitness (lower cost = higher fitness)
        inverse_fitnesses = [1.0 / (1.0 + fit) for fit in fitnesses]  # Convert cost to fitness
        total_fitness = sum(inverse_fitnesses)

        if total_fitness == 0:
            # If all solutions have very high cost, assign equal probabilities
            probabilities = [1.0 / POPULATION_SIZE] * POPULATION_SIZE
        else:
            probabilities = [inv_fit / total_fitness for inv_fit in inverse_fitnesses]

        # Onlooker bee phase: probabilistically select food sources and search around them
        for i in range(POPULATION_SIZE):
            if evaluations >= max_evaluations:
                break

            # Select a food source using roulette wheel selection
            rand = random.random()
            cumulative_prob = 0.0
            selected_source = 0
            for idx, prob in enumerate(probabilities):
                cumulative_prob += prob
                if rand <= cumulative_prob:
                    selected_source = idx
                    break

            # Generate a neighbor solution for the selected food source
            neighbor = generate_neighbor_solution(population[selected_source])
            result = calculate_route_cost(neighbor, locations)
            neighbor_fitness = result["grand_total_cost"]
            evaluations += 1

            # Greedy selection: keep better solution
            if neighbor_fitness < fitnesses[selected_source]:
                population[selected_source] = neighbor
                fitnesses[selected_source] = neighbor_fitness
                trial_counts[selected_source] = 0  # Reset trial count
            else:
                trial_counts[selected_source] += 1  # Increment trial count

        # Scout bee phase: abandon poor solutions and generate new ones
        for i in range(POPULATION_SIZE):
            if trial_counts[i] >= LIMIT:
                # Replace with a new random solution
                new_route = create_random_route()
                population[i] = new_route
                result = calculate_route_cost(new_route, locations)
                fitnesses[i] = result["grand_total_cost"]
                trial_counts[i] = 0
                evaluations += 1

    # Find best solution
    best_idx = fitnesses.index(min(fitnesses))
    best_route = population[best_idx]
    best_fitness = fitnesses[best_idx]

    return best_route, evaluations