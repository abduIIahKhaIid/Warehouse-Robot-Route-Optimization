"""
Genetic Algorithm for warehouse robot route optimization
"""
from typing import List, Dict
from .utils import Location, calculate_route_cost
import random


def genetic_algorithm(locations: List[Location], max_evaluations: int = 10000) -> tuple:
    """
    Genetic Algorithm for TSP optimization
    Uses Order Crossover (OX) and swap mutation
    """
    POPULATION_SIZE = 50
    GENERATIONS = 200
    MUTATION_RATE = 0.15
    ELITE_SIZE = 5

    n = len(locations)
    evaluations = 0

    # Initialize random population
    def create_individual():
        return random.sample(range(n), n)

    population = [create_individual() for _ in range(POPULATION_SIZE)]

    # Fitness function (lower is better)
    def fitness(route_indices):
        nonlocal evaluations
        evaluations += 1
        result = calculate_route_cost(route_indices, locations)
        return result["grand_total_cost"]

    # Tournament selection
    def select(pop, fitnesses):
        tournament_size = 5
        tournament = random.sample(list(zip(pop, fitnesses)), tournament_size)
        return min(tournament, key=lambda x: x[1])[0]

    # Order Crossover (OX)
    def crossover(parent1, parent2):
        size = len(parent1)
        start, end = sorted(random.sample(range(size), 2))

        child = [None] * size
        child[start:end] = parent1[start:end]

        pointer = end
        for gene in parent2[end:] + parent2[:end]:
            if gene not in child:
                if pointer >= size:
                    pointer = 0
                child[pointer] = gene
                pointer += 1

        return child

    # Swap mutation
    def mutate(route):
        if random.random() < MUTATION_RATE:
            i, j = random.sample(range(len(route)), 2)
            route[i], route[j] = route[j], route[i]
        return route

    # Evolution loop
    best_ever_route = None
    best_ever_fitness = float('inf')

    for generation in range(GENERATIONS):
        if evaluations >= max_evaluations:
            break

        fitnesses = [fitness(ind) for ind in population]

        # Track best solution
        best_idx = fitnesses.index(min(fitnesses))
        if fitnesses[best_idx] < best_ever_fitness:
            best_ever_fitness = fitnesses[best_idx]
            best_ever_route = population[best_idx][:]

        # Elitism
        elite_indices = sorted(range(len(fitnesses)), key=lambda i: fitnesses[i])[:ELITE_SIZE]
        new_population = [population[i][:] for i in elite_indices]

        # Create offspring
        while len(new_population) < POPULATION_SIZE:
            if evaluations >= max_evaluations:
                break
            parent1 = select(population, fitnesses)
            parent2 = select(population, fitnesses)
            child = crossover(parent1, parent2)
            child = mutate(child)
            new_population.append(child)

        population = new_population

    return best_ever_route, evaluations