"""
Common utility functions for warehouse robot route optimization algorithms
"""
from typing import List, Dict
from pydantic import BaseModel, Field
import math


class Location(BaseModel):
    id: str
    x: float = Field(ge=0)
    y: float = Field(ge=0)
    loadingTime: float = Field(gt=0)
    penaltyTime: float = Field(gt=0)
    penaltyRate: float = Field(ge=0)


class LocationDetail(BaseModel):
    id: str
    arrivalTime: float
    loadingTime: float
    penalty: float
    penaltyApplied: bool
    distance: float
    travelTime: float
    x: float
    y: float


def calculate_distance(x1: float, y1: float, x2: float, y2: float) -> float:
    """Calculate Euclidean distance between two points"""
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def calculate_route_cost(route_indices: List[int], locations: List[Location]) -> Dict:
    """Calculate total cost for a given route including penalties"""
    total_distance = 0
    total_loading_time = 0
    total_penalty = 0
    penalties = {}
    coordinates = [[0, 0]]
    location_details = []

    current_x, current_y = 0, 0
    cumulative_time = 0

    for idx in route_indices:
        loc = locations[idx]
        distance = calculate_distance(current_x, current_y, loc.x, loc.y)
        travel_time = distance  # 1 unit/min

        cumulative_time += travel_time

        # Check penalty
        is_penalty = cumulative_time > loc.penaltyTime
        penalty_amount = (cumulative_time - loc.penaltyTime) * loc.penaltyRate if is_penalty else 0

        if is_penalty:
            penalties[loc.id] = penalty_amount
            total_penalty += penalty_amount

        cumulative_time += loc.loadingTime
        total_distance += distance
        total_loading_time += loc.loadingTime

        coordinates.append([loc.x, loc.y])

        location_details.append(LocationDetail(
            id=loc.id,
            arrivalTime=round(cumulative_time - loc.loadingTime, 2),
            loadingTime=loc.loadingTime,
            penalty=round(penalty_amount, 2),
            penaltyApplied=is_penalty,
            distance=round(distance, 2),
            travelTime=round(travel_time, 2),
            x=loc.x,
            y=loc.y
        ))

        current_x, current_y = loc.x, loc.y

    return_distance = calculate_distance(current_x, current_y, 0, 0)
    total_distance += return_distance
    coordinates.append([0, 0])

    grand_total_cost = cumulative_time + return_distance + total_penalty

    return {
        "total_distance": total_distance,
        "total_loading_time": total_loading_time,
        "total_penalty": total_penalty,
        "grand_total_cost": grand_total_cost,
        "penalties": penalties,
        "coordinates": coordinates,
        "location_details": location_details,
        "total_time": cumulative_time + return_distance
    }