import math

def find_nearest_mesh_node(lat, lon):
    """Finds the closest node ID in the navigation mesh to a given GPS coordinate."""
    nearest_node = None
    min_distance = float('inf')
    
    for node_id, (node_lat, node_lon, _) in nav_mesh.nodes.items():
        # Simple Euclidean distance approximation for nearby points
        distance = math.sqrt((lat - node_lat)**2 + (lon - node_lon)**2)
        if distance < min_distance:
            min_distance = distance
            nearest_node = node_id
            
    return nearest_node

@app.route('/api/navigation/plan', methods=['POST'])
def plan_tactical_route():
    payload = request.get_json() or {}
    current_lat = payload.get("latitude")
    current_lon = payload.get("longitude")
    routing_mode = payload.get("routing_mode", "SAFEST") # Options: SAFEST, LOW_BATTERY, SHORTEST

    if current_lat is None or current_lon is None:
        return jsonify({"status": "ERROR", "message": "Missing telemetry coordinates"}), 400

    # 1. Locate where the user is on our local map mesh
    start_node = find_nearest_mesh_node(current_lat, current_lon)
    
    # 2. Set the destination back to Base Camp (Node N0 defined in app.py)
    target_node = "N0" 

    if not start_node:
        return jsonify({"status": "ERROR", "message": "No nearby tactical nodes found"}), 404

    # 3. Compute optimal survival path using our localized math engine
    node_path, total_cost = nav_mesh.compute_path(start_node, target_node, routing_mode=routing_mode)

    # 4. Translate calculated Node IDs back to coordinate points for Flutter to draw
    geometry_path = []
    for node_id in node_path:
        node_lat, node_lon, _ = nav_mesh.nodes[node_id]
        geometry_path.append({
            "latitude": node_lat,
            "longitude": node_lon
        })

    return jsonify({
        "status": "SUCCESS",
        "mode_executed": routing_mode,
        "estimated_weight": total_cost,
        "coordinates": geometry_path
    }), 200
