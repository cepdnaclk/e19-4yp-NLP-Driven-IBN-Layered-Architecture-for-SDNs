#!/bin/bash

# Validate input
if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <number between 01-03>"
  exit 1
fi

case "$1" in
  01|02|03) ;;
  *) echo "Invalid input. Please provide 01, 02, or 03."
     exit 1
     ;;
esac

# Locate the folder that starts with given number
FOLDER=$(ls -d ${1}_*/ 2>/dev/null | head -n 1)

if [[ -z "$FOLDER" ]]; then
  echo "Folder starting with ${1}_ not found."
  exit 1
fi

echo "Using source folder: $FOLDER"

# Define destination root
DEST_ROOT="../02_setupScripts"

# Copy prometheus.yml
mkdir -p "${DEST_ROOT}/01_init_setup/configs/datasources"
cp "${FOLDER}/monitoringConfig/prometheus.yml" "${DEST_ROOT}/01_init_setup/configs/prometheus.yml"

# Copy Grafana datascources.yml
cp "${FOLDER}/monitoringConfig/datasources.yml" "${DEST_ROOT}/01_init_setup/configs/datasources/prometheus.yml"

# Copy topo-*.py
rm "${DEST_ROOT}/02_init_deps/topo"/topo-*.py
cp "${FOLDER}"/topo*.py "${DEST_ROOT}/02_init_deps/topo/"

# Copy prometheus-agent.yml
cp "${FOLDER}/monitoringConfig/prometheus-agent.yml" "${DEST_ROOT}/02_init_deps/topo/docker_images/prometheus-agent.yml"

# Move serverProfile.yaml and clientTrafficProfile.yaml
mv "${FOLDER}/serverProfile.yaml" "${DEST_ROOT}/05_init_hosts/serverProfile.yaml"
mv "${FOLDER}/clientTrafficProfile.yaml" "../03_trafficGenScripts/clientTrafficProfile.yaml"

# Copy dashboards directory
find "${DEST_ROOT}/07_init_dashboards/dashboards/" -maxdepth 1 -type f -name 'd*.json' -exec rm -f {} \;
cp -r "${FOLDER}/dashboards/"* "${DEST_ROOT}/07_init_dashboards/dashboards/"

# Copy routingAndSwitching.txt
cp "${FOLDER}/routingAndSwitching.txt" "${DEST_ROOT}/06_init_intents/05_init_intents.txt"

# Copy grafana_admin_config.txt
cp "./common/grafana_admin_config.txt" "${DEST_ROOT}/07_init_dashboards/02_grafana_config.txt"

# remove temporary files
rm "${FOLDER}/__hostIpMapping.txt"
rm -rf "${FOLDER}/dashboards/"

echo "✅ All files copied successfully from $FOLDER."
