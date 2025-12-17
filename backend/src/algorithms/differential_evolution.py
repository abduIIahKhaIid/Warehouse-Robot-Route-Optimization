"""
Differential Evolution for warehouse robot route optimization
"""
from typing import List
import random
from .utils import Location, calculate_route_cost


def differential_evolution(locations: List[Location], max_evaluations: int = 10000) -> tuple:
    """
    Differential Evolution for TSP optimization
    Uses vector operations to guide search in discrete space
    """
    POPULATION_SIZE = 30
    MAX_GENERATIONS = 500
    F = 0.8  # Differential weight
    CR = 0.7  # Crossover probability

    n = len(locations)
    evaluations = 0

    # Function to create a random route (permutation)
    def create_random_route():
        route = list(range(n))
        random.shuffle(route)
        return route

    # Function to perform crossover operation adapted for permutations
    def crossover(target, mutant):
        # For permutations, we use order-based crossover (OX) approach
        if random.random() > CR:
            return target[:]  # Return target if no crossover

        # Create a trial vector using a crossover-like approach
        trial = target[:]
        # Randomly select some positions to take from mutant
        for i in range(len(trial)):
            if random.random() < CR:
                # Find the value in mutant at position i
                value = mutant[i]
                # Find where this value is in the trial
                pos_in_trial = trial.index(value)
                # Swap with current position
                trial[i], trial[pos_in_trial] = trial[pos_in_trial], trial[i]

        # Fix any potential duplicates by ensuring it's a valid permutation
        all_indices = set(range(n))
        current_indices = set(trial)
        missing_indices = list(all_indices - current_indices)

        if missing_indices:
            # Fill in missing indices randomly
            for i in range(len(trial)):
                if trial[i] in [x for j, x in enumerate(trial) if j != i]:  # If duplicate
                    if missing_indices:
                        trial[i] = missing_indices.pop(0)

        return trial

    # Initialize population
    population = []
    fitnesses = []

    for _ in range(POPULATION_SIZE):
        if evaluations >= max_evaluations:
            break
        route = create_random_route()
        population.append(route)
        result = calculate_route_cost(route, locations)
        fitness = result["grand_total_cost"]
        fitnesses.append(fitness)
        evaluations += 1

    if evaluations >= max_evaluations:
        best_idx = fitnesses.index(min(fitnesses))
        return population[best_idx], evaluations

    # DE main loop
    generation = 0
    while generation < MAX_GENERATIONS and evaluations < max_evaluations:
        generation += 1
        new_population = []
        new_fitnesses = []

        for i in range(POPULATION_SIZE):
            if evaluations >= max_evaluations:
                break

            # Select three random individuals different from current
            candidates = list(range(POPULATION_SIZE))
            candidates.remove(i)
            r1, r2, r3 = random.sample(candidates, 3)

            # Create mutant vector (adapted for permutations)
            target = population[i]
            x1 = population[r1]
            x2 = population[r2]
            x3 = population[r3]

            # For permutations, create a mutant by combining the three vectors
            # We'll use a simplified approach that creates a new permutation based on the three vectors
            mutant = target[:]

            # Apply differential evolution concept to permutations
            # Randomly select elements from x2 and x3 based on F parameter
            for j in range(len(mutant)):
                if random.random() < F:
                    # Pick from x2 or x3 at random positions
                    if random.random() < 0.5 and len(x2) > j:
                        val = x2[j % len(x2)]
                    else:
                        val = x3[j % len(x3)]

                    # Find where this value is in the current mutant
                    if val in mutant:
                        pos = mutant.index(val)
                        # Swap to position j
                        mutant[j], mutant[pos] = mutant[pos], mutant[j]

            # Ensure it's a valid permutation
            all_vals = set(range(n))
            current_vals = set(mutant)
            missing_vals = list(all_vals - current_vals)

            if missing_vals:
                # Replace duplicates with missing values
                seen = set()
                for idx in range(len(mutant)):
                    if mutant[idx] in seen:  # duplicate found
                        if missing_vals:
                            mutant[idx] = missing_vals.pop(0)
                    else:
                        seen.add(mutant[idx])

            # Perform crossover between target and mutant
            trial = crossover(target, mutant)

            # Evaluate trial
            result = calculate_route_cost(trial, locations)
            trial_fitness = result["grand_total_cost"]
            evaluations += 1

            # Selection: keep better of target or trial
            if trial_fitness < fitnesses[i]:
                new_population.append(trial)
                new_fitnesses.append(trial_fitness)
            else:
                new_population.append(target)
                new_fitnesses.append(fitnesses[i])

        population = new_population
        fitnesses = new_fitnesses

    # Find best solution
    best_idx = fitnesses.index(min(fitnesses))
    best_route = population[best_idx]
    best_fitness = fitnesses[best_idx]

    return best_route, evaluations