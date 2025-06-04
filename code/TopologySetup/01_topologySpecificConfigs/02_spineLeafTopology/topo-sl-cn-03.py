#!/usr/bin/python

from mininet.net import Containernet
from mininet.node import RemoteController, OVSSwitch
from mininet.cli import CLI
from mininet.link import TCLink
from mininet.log import info, setLogLevel

setLogLevel('info')
info('*** Starting Spine Leaf Topology\n')

net = Containernet(controller=lambda name: RemoteController(name,ip='172.23.0.2'),switch=OVSSwitch)

info('*** Adding controller\n')
net.addController('c0')

info('*** Adding docker containers\n')
d1 = net.addDocker('d1', ip='192.168.0.1/24', dimage="ubuntu22")
d2 = net.addDocker('d2', ip='192.168.2.1/24', dimage="ubuntu22")
d3 = net.addDocker('d3', ip='192.168.1.1/24', dimage="ubuntu22")
d4 = net.addDocker('d4', ip='192.168.1.2/24', dimage="ubuntu22")
d5 = net.addDocker('d5', ip='192.168.0.2/24', dimage="ubuntu22")
d6 = net.addDocker('d6', ip='192.168.2.2/24', dimage="ubuntu22")
d7 = net.addDocker('d7', ip='10.0.0.1/8', dimage="ubuntu22")


info('*** Adding switches\n')
s1 = net.addSwitch('s1',protocols='OpenFlow13')
s2 = net.addSwitch('s2',protocols='OpenFlow13')
s3 = net.addSwitch('s3',protocols='OpenFlow13')
s4 = net.addSwitch('s4',protocols='OpenFlow13')

s4 = net.addSwitch('s5',protocols='OpenFlow13')
s5 = net.addSwitch('s6',protocols='OpenFlow13')
s6 = net.addSwitch('s7',protocols='OpenFlow13')

s7 = net.addSwitch('s8',protocols='OpenFlow13')

info('*** Creating links\n')
net.addLink(d1, s1)
net.addLink(d2, s1)
net.addLink(d3, s2)
net.addLink(d4, s3)
net.addLink(d5, s4)
net.addLink(d6, s4)
net.addLink(s1, s5)
net.addLink(s2, s5)
net.addLink(s2, s6)
net.addLink(s3, s6)
net.addLink(s3, s7)
net.addLink(s4, s7)
net.addLink(s5, s8, cls=TCLink, delay='100ms', bw=1)
net.addLink(s6, s8, cls=TCLink, delay='100ms', bw=1)
net.addLink(s7, s8, cls=TCLink, delay='100ms', bw=1)

#net.addLink(d5, s4)
#net.addLink(s1, s3, cls=TCLink, delay='100ms', bw=1)
#net.addLink(s2, s3, cls=TCLink, delay='100ms', bw=1)
#net.addLink(s3, s4, cls=TCLink, delay='100ms', bw=1)

info('*** Starting network\n')
net.start()
info('*** Testing connectivity\n')
net.ping([d1, d2, d3, d4, d5, d6, d7])
info('*** Running CLI\n')
CLI(net)
info('*** Stopping network')
net.stop()

