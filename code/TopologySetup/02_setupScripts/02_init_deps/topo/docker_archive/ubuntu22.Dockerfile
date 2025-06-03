FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    iputils-ping \
    net-tools \
    iproute2 \
    dnsutils \
    curl \
    wget \
    tar \
    python3 \
    python3-pip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python Prometheus libraries
RUN pip3 install psutil prometheus_client

# Set DNS resolver (in case of internal DNS issues)
# RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf

# Install Prometheus Agent
RUN wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz && \
    tar xvf prometheus-2.48.0.linux-amd64.tar.gz && \
    mv prometheus-2.48.0.linux-amd64/prometheus /usr/local/bin/prometheus && \
    mv prometheus-2.48.0.linux-amd64/promtool /usr/local/bin/promtool && \
    rm -rf prometheus-2.48.0.linux-amd64*

# Install Blackbox Exporter
RUN wget https://github.com/prometheus/blackbox_exporter/releases/download/v0.24.0/blackbox_exporter-0.24.0.linux-amd64.tar.gz && \
    tar xvf blackbox_exporter-0.24.0.linux-amd64.tar.gz && \
    mv blackbox_exporter-0.24.0.linux-amd64/blackbox_exporter /usr/local/bin/blackbox_exporter && \
    rm -rf blackbox_exporter-0.24.0.linux-amd64*

# Create directories for configuration and Prometheus data
RUN mkdir -p /etc/prometheus /prometheus_data /exporter

# Copy configuration and Python exporter script
COPY prometheus-agent.yml /etc/prometheus/prometheus-agent.yml
COPY blackbox.yml /etc/prometheus/blackbox.yml
COPY exporter.py /exporter/exporter.py

# Expose required ports
EXPOSE 9090 9115 8000

# Set working directory for Python script
WORKDIR /exporter

# Run all three processes
CMD bash -c "\
  /usr/local/bin/blackbox_exporter --config.file=/etc/prometheus/blackbox.yml & \
  /usr/local/bin/prometheus --config.file=/etc/prometheus/prometheus-agent.yml --storage.tsdb.path=/prometheus_data --web.listen-address=':9090' & \
  python3 exporter.py \
"

