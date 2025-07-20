import yaml

# Load network_knowledge.yaml
with open("../network_knowledge.yaml", "r") as f:
    network_knowledge = yaml.safe_load(f)

# Load clientTrafficProfile.yaml
with open("../../../03_trafficGenScripts/clientTrafficProfile.yaml", "r") as f:
    client_profiles = yaml.safe_load(f)

# Build a reverse lookup from server-ip to server name
ip_to_server = {v["ip"]: server_name for server_name, v in network_knowledge["servers"].items()}

# Iterate through each client and their traffic entries
for client_name, traffic_entries in client_profiles.items():
    if not traffic_entries:
        continue
    for entry in traffic_entries:
        server_ip = entry["server-ip"]
        ports = entry["server-port"]

        # Find which server this entry corresponds to
        server_name = ip_to_server.get(server_ip)
        if not server_name:
            continue  # server not in network_knowledge.yaml

        # Access traffic-types for that server
        server_entry = network_knowledge["servers"][server_name]
        traffic_types = server_entry.get("traffic-types", {})

        # Match the ports to traffic-types
        for traffic_type, traffic_ports in traffic_types.items():
            if any(p in traffic_ports for p in ports):
                # Add client to this traffic-type's client list
                if "clients" not in server_entry:
                    server_entry["clients"] = {}
                if traffic_type not in server_entry["clients"]:
                    server_entry["clients"][traffic_type] = []
                if client_name not in server_entry["clients"][traffic_type]:
                    server_entry["clients"][traffic_type].append(client_name)

# Save updated network_knowledge.yaml
with open("../network_knowledge.yaml", "w") as f:
    yaml.dump(network_knowledge, f, sort_keys=False)

