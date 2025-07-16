#!/bin/bash

# Get the number of client containers from non-empty lines in the config file
end=$(grep -cve '^\s*$' clientHostConfig.txt)

echo "Attaching prometheus server to the monitoring network..."
docker network connect bridge prometheus
docker network connect bridge grafana

for x in $(seq 1 "$end"); do
  container="mn.d$x"
  echo "Starting Monitoring Exports in $container..."

  docker exec "$container" sh -c "
    nohup /usr/local/bin/blackbox_exporter --config.file=/etc/prometheus/blackbox.yml > /var/log/${container}_blackbox.log 2>&1 &
    nohup /usr/local/bin/prometheus --config.file=/etc/prometheus/prometheus-agent.yml --storage.tsdb.path=/prometheus_data --web.listen-address=':9090' > /var/log/${container}_prometheus.log 2>&1 &
    nohup python3 /exporter/exporter.py > /var/log/${container}_exporter.log 2>&1 &
  "
done
