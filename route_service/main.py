from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import math
import heapq

app = FastAPI(title="CleanPulse Route Optimizer")

class Point(BaseModel):
    id: str
    lat: float
    lng: float

class RouteRequest(BaseModel):
    start: Point
    complaints: List[Point]

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Radius of earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Greedy fallback for larger sets to keep execution lightweight
def greedy_tsp(start: Point, points: List[Point]) -> List[Point]:
    unvisited = points.copy()
    current = start
    path = []
    
    while unvisited:
        nearest = min(unvisited, key=lambda p: haversine(current.lat, current.lng, p.lat, p.lng))
        path.append(nearest)
        current = nearest
        unvisited.remove(nearest)
        
    return path

# A* Algorithm to find shortest path visiting all points
def a_star_tsp(start: Point, points: List[Point]) -> List[Point]:
    # For small sets (<= 12), we use A* for the exact TSP.
    if len(points) > 12:
        return greedy_tsp(start, points)
        
    points_dict = {p.id: p for p in points}
    
    # Priority Queue elements: (f_cost, g_cost, current_id, visited_ids_tuple, path)
    pq = []
    
    def heuristic(curr_id, visited):
        unvisited = [pid for pid in points_dict if pid not in visited]
        if not unvisited:
            return 0
        curr_p = points_dict[curr_id] if curr_id != start.id else start
        # Simple accessible heuristic: distance to nearest unvisited node
        return min(haversine(curr_p.lat, curr_p.lng, points_dict[p].lat, points_dict[p].lng) for p in unvisited)

    initial_visited = frozenset()
    heapq.heappush(pq, (heuristic(start.id, initial_visited), 0, start.id, initial_visited, []))
    
    best_path = []
    
    # Track minimum g_cost to reach a specific state to prune suboptimal paths
    min_cost = {}
    
    while pq:
        f, g, curr_id, visited, path = heapq.heappop(pq)
        
        state = (curr_id, visited)
        if state in min_cost and min_cost[state] <= g:
            continue
        min_cost[state] = g
        
        if len(visited) == len(points):
            best_path = path
            break
            
        unvisited = [pid for pid in points_dict if pid not in visited]
        curr_p = points_dict[curr_id] if curr_id != start.id else start
        
        for next_id in unvisited:
            next_p = points_dict[next_id]
            dist = haversine(curr_p.lat, curr_p.lng, next_p.lat, next_p.lng)
            
            new_g = g + dist
            new_visited = visited | frozenset([next_id])
            new_path = path + [next_p]
            new_f = new_g + heuristic(next_id, new_visited)
            
            heapq.heappush(pq, (new_f, new_g, next_id, new_visited, new_path))
            
    return best_path

@app.post("/api/optimize-route")
def optimize_route(req: RouteRequest):
    if not req.complaints:
        return {
            "status": "success",
            "optimized_route": [],
            "google_maps_url": "",
            "osm_url": ""
        }
        
    optimized_route = a_star_tsp(req.start, req.complaints)
    
    # Integrate Generate Google Maps directions URL
    waypoints = "/".join([f"{p.lat},{p.lng}" for p in optimized_route])
    gmaps_url = f"https://www.google.com/maps/dir/{req.start.lat},{req.start.lng}/{waypoints}"
    
    # OpenStreetMap integration point (using OSRM Trip API format for visualization)
    osm_coords = f"{req.start.lng},{req.start.lat};" + ";".join([f"{p.lng},{p.lat}" for p in optimized_route])
    osm_url = f"https://router.project-osrm.org/trip/v1/driving/{osm_coords}?source=first"
    
    return {
        "status": "success",
        "algorithm": "A* Search" if len(req.complaints) <= 12 else "Greedy A* (Nearest Neighbor)",
        "start_point": req.start,
        "optimized_route": optimized_route,
        "google_maps_url": gmaps_url,
        "osm_url": osm_url
    }
