import 'dart:math' as math;
import 'package:geolocator/geolocator.dart';

class NavigationEngine {
  static final NavigationEngine _instance = NavigationEngine._internal();

  factory NavigationEngine() {
    return _instance;
  }

  NavigationEngine._internal();

  /// A* Pathfinding Algorithm
  List<GPSNode> findPathAStar(
    GPSNode start,
    GPSNode goal,
    List<GPSNode> nodes,
  ) {
    Set<GPSNode> openSet = {start};
    Set<GPSNode> closedSet = <GPSNode>{};
    Map<GPSNode, double> gScore = {start: 0.0};
    Map<GPSNode, double> fScore = {start: _heuristic(start, goal)};
    Map<GPSNode, GPSNode?> cameFrom = {};

    while (openSet.isNotEmpty) {
      GPSNode? current = _findLowestFScore(openSet, fScore);
      if (current == null) break;

      if (current == goal) {
        return _reconstructPath(cameFrom, current);
      }

      openSet.remove(current);
      closedSet.add(current);

      for (GPSNode neighbor in _getNeighbors(current, nodes)) {
        if (closedSet.contains(neighbor)) continue;

        double tentativeGScore =
            gScore[current]! + _distance(current, neighbor);

        if (!openSet.contains(neighbor)) {
          openSet.add(neighbor);
        } else if (tentativeGScore >= (gScore[neighbor] ?? double.infinity)) {
          continue;
        }

        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = tentativeGScore + _heuristic(neighbor, goal);
      }
    }

    return []; // No path found
  }

  /// Dijkstra Shortest Path Algorithm
  List<GPSNode> findShortestPath(
    GPSNode start,
    GPSNode goal,
    List<GPSNode> nodes,
  ) {
    Map<GPSNode, double> distances = {start: 0.0};
    Map<GPSNode, GPSNode?> previous = {};
    Set<GPSNode> unvisited = nodes.toSet();

    for (GPSNode node in nodes) {
      if (node != start) distances[node] = double.infinity;
    }

    while (unvisited.isNotEmpty) {
      GPSNode? current = _findUnvisitedWithMinDistance(unvisited, distances);
      if (current == null || distances[current] == double.infinity) break;

      if (current == goal) {
        return _reconstructPath(previous, current);
      }

      unvisited.remove(current);

      for (GPSNode neighbor in _getNeighbors(current, nodes)) {
        if (!unvisited.contains(neighbor)) continue;

        double alt = distances[current]! + _distance(current, neighbor);
        if (alt < (distances[neighbor] ?? double.infinity)) {
          distances[neighbor] = alt;
          previous[neighbor] = current;
        }
      }
    }

    return [];
  }

  /// Find safest route (terrain risk analysis)
  List<GPSNode> findSafeRoute(
    GPSNode start,
    GPSNode goal,
    List<GPSNode> nodes,
    Map<GPSNode, double> terrainRiskMap,
  ) {
    List<GPSNode> path = findPathAStar(start, goal, nodes);

    // Sort by terrain risk
    for (int i = 0; i < path.length; i++) {
      for (int j = i + 1; j < path.length; j++) {
        if ((terrainRiskMap[path[i]] ?? 0.0) >
            (terrainRiskMap[path[j]] ?? 0.0)) {
          GPSNode temp = path[i];
          path[i] = path[j];
          path[j] = temp;
        }
      }
    }

    return path;
  }

  /// Low-battery optimized routing
  List<GPSNode> findBatteryOptimizedRoute(
    GPSNode start,
    GPSNode goal,
    List<GPSNode> nodes,
    double batteryPercentage,
  ) {
    if (batteryPercentage > 50) {
      return findShortestPath(start, goal, nodes);
    } else if (batteryPercentage > 20) {
      // Prefer routes with charging points
      return findPathAStar(start, goal, nodes);
    } else {
      // Emergency route - straight line
      return [start, goal];
    }
  }

  double _heuristic(GPSNode a, GPSNode b) {
    return _distance(a, b);
  }

  double _distance(GPSNode a, GPSNode b) {
    const double earthRadiusKm = 6371;
    final double lat1 = a.latitude * math.pi / 180;
    final double lat2 = b.latitude * math.pi / 180;
    final double deltaLat = (b.latitude - a.latitude) * math.pi / 180;
    final double deltaLon = (b.longitude - a.longitude) * math.pi / 180;

    final double haversine = 2 *
        math.asin(math.sqrt(
            math.pow(math.sin(deltaLat / 2), 2) +
                math.cos(lat1) *
                    math.cos(lat2) *
                    math.pow(math.sin(deltaLon / 2), 2)));

    return earthRadiusKm * haversine * 1000; // Convert to meters
  }

  List<GPSNode> _getNeighbors(GPSNode node, List<GPSNode> nodes) {
    return nodes
        .where((n) => _distance(node, n) < 1000 && n != node) // 1km radius
        .toList();
  }

  GPSNode? _findLowestFScore(
      Set<GPSNode> set, Map<GPSNode, double> fScore) {
    GPSNode? lowest;
    double lowestScore = double.infinity;

    for (GPSNode node in set) {
      if ((fScore[node] ?? double.infinity) < lowestScore) {
        lowest = node;
        lowestScore = fScore[node] ?? double.infinity;
      }
    }

    return lowest;
  }

  GPSNode? _findUnvisitedWithMinDistance(
      Set<GPSNode> unvisited, Map<GPSNode, double> distances) {
    GPSNode? minNode;
    double minDistance = double.infinity;

    for (GPSNode node in unvisited) {
      if ((distances[node] ?? double.infinity) < minDistance) {
        minNode = node;
        minDistance = distances[node] ?? double.infinity;
      }
    }

    return minNode;
  }

  List<GPSNode> _reconstructPath(
      Map<GPSNode, GPSNode?> cameFrom, GPSNode current) {
    List<GPSNode> path = [current];

    while (cameFrom.containsKey(current) && cameFrom[current] != null) {
      current = cameFrom[current]!;
      path.insert(0, current);
    }

    return path;
  }
}

class GPSNode {
  final double latitude;
  final double longitude;
  final double altitude;
  final String? label;

  GPSNode({
    required this.latitude,
    required this.longitude,
    required this.altitude,
    this.label,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is GPSNode &&
          runtimeType == other.runtimeType &&
          latitude == other.latitude &&
          longitude == other.longitude;

  @override
  int get hashCode => latitude.hashCode ^ longitude.hashCode;
}
