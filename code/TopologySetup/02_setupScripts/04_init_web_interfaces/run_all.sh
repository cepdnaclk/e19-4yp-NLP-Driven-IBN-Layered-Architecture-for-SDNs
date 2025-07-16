#!/bin/bash

echo "🔗 Opening all Web UIs in your browser..."
echo

# Function to open a URL with description and suppress GTK messages
open_url() {
    local desc="$1"
    local url="$2"

    echo "🌐 $desc → $url"
    nohup xdg-open "$url" >/dev/null 2>&1 &
}

# Topology and SDN Controller dashboard
open_url "ONOS UI (Topology View)" "http://localhost:8181/onos/ui"

# SDN Controller APIs
open_url "ONOS REST API Docs" "http://localhost:8181/onos/v1/docs/"
open_url "ONOS ACL Rules API" "http://localhost:8181/onos/v1/acl/rules"

# Data logs UI (Prometheus)
open_url "Prometheus Targets Page" "http://localhost:9090/targets"

# Monitoring dashboard (Grafana)
open_url "Grafana Dashboard" "http://localhost:3000"

echo
echo "✅ All UIs are being opened in your default browser."

