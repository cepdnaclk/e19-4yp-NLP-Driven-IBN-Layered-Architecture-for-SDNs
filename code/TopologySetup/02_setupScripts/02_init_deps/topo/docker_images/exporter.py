from prometheus_client import start_http_server, Gauge
import time
import psutil
import os

# Network Gauges
rx_bytes = Gauge('net_rx_bytes', 'Received bytes', ['interface'])
tx_bytes = Gauge('net_tx_bytes', 'Transmitted bytes', ['interface'])
rx_packets = Gauge('net_rx_packets', 'Received packets', ['interface'])
tx_packets = Gauge('net_tx_packets', 'Transmitted packets', ['interface'])
rx_errors = Gauge('net_rx_errors', 'Receive errors', ['interface'])
tx_errors = Gauge('net_tx_errors', 'Transmit errors', ['interface'])
rx_drops = Gauge('net_rx_drops', 'Receive drops', ['interface'])
tx_drops = Gauge('net_tx_drops', 'Transmit drops', ['interface'])

# Gauges for TOS (QoS)
rx_tos_packets = Gauge('net_rx_tos_packets', 'Received packets per TOS', ['interface', 'tos'])
tx_tos_packets = Gauge('net_tx_tos_packets', 'Transmitted packets per TOS', ['interface', 'tos'])

# Gauge for tcp states
tcp_states = Gauge('tcp_connection_states', 'TCP connection states', ['state'])

# Gauge for System Metrics
cpu_usage = Gauge('cpu_usage_percent', 'CPU usage percentage')
mem_usage = Gauge('memory_usage_percent', 'Memory usage percentage')
disk_usage = Gauge('disk_usage_percent', 'Disk usage percentage', ['mountpoint'])

# Track TOS counters in memory
tos_rx_count = {}
tos_tx_count = {}
interfaces = [iface for iface in psutil.net_if_addrs().keys() if iface != 'lo']
local_ips = {addr.address for iface in psutil.net_if_addrs().values() for addr in iface if addr.family.name == "AF_INET"}

def sniff_packets(interface):
    def process(packet):
        if IP in packet:
            tos = str(packet[IP].tos)
            direction = ''
            if packet[IP].src in local_ips:
				direction = 'tx'
			elif packet[IP].dst in local_ips:
				direction = 'rx'
				
            if direction == 'rx':
                tos_rx_count[(interface, tos)] = tos_rx_count.get((interface, tos), 0) + 1
            else:
                tos_tx_count[(interface, tos)] = tos_tx_count.get((interface, tos), 0) + 1

    sniff(iface=interface, prn=process, store=False)

def start_sniffing():
    for iface in interfaces:
        t = threading.Thread(target=sniff_packets, args=(iface,), daemon=True)
        t.start()
        
def update_network_metrics():
    with open('/proc/net/dev', 'r') as f:
        lines = f.readlines()[2:]
    for line in lines:
        if ":" not in line:
            continue
        iface, data = line.strip().split(":", 1)
        fields = data.split()
        iface = iface.strip()
        rx_bytes.labels(interface=iface).set(int(fields[0]))
        rx_packets.labels(interface=iface).set(int(fields[1]))
        rx_errors.labels(interface=iface).set(int(fields[2]))
        rx_drops.labels(interface=iface).set(int(fields[3]))
        tx_bytes.labels(interface=iface).set(int(fields[8]))
        tx_packets.labels(interface=iface).set(int(fields[9]))
        tx_errors.labels(interface=iface).set(int(fields[10]))
        tx_drops.labels(interface=iface).set(int(fields[11]))

def update_tos_metrics():
    for (iface, tos), count in tos_rx_count.items():
        rx_tos_packets.labels(interface=iface, tos=tos).set(count)
    for (iface, tos), count in tos_tx_count.items():
        tx_tos_packets.labels(interface=iface, tos=tos).set(count)
        
def update_tcp_states():
    conn_states = {}
    for conn in psutil.net_connections(kind='tcp'):
        state = conn.status
        conn_states[state] = conn_states.get(state, 0) + 1
    for state, count in conn_states.items():
        tcp_states.labels(state=state).set(count)

def update_system_metrics():
    cpu_usage.set(psutil.cpu_percent(interval=0.1))
    mem_usage.set(psutil.virtual_memory().percent)
    for part in psutil.disk_partitions(all=False):
        try:
            usage = psutil.disk_usage(part.mountpoint).percent
            disk_usage.labels(mountpoint=part.mountpoint).set(usage)
        except PermissionError:
            continue

if __name__ == '__main__':
    start_http_server(8000)
    start_sniffing() 
    while True:
        update_network_metrics()
        update_tcp_states()
        update_system_metrics()
        update_tos_metrics()
        time.sleep(5)

