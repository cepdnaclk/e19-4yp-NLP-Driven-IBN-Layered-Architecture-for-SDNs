1. Create topo file in format topo-<type>-<simulator>-<versionNumber>.py

2. Edit following files with suitable server client 
	protocols(http/voip/video/ssh/ftp/mail/...) 
	- serverHostConfig.txt
	- clientHostConfig.txt

3. Edit Switching & Routing in routingAndSwitching.txt

4. Edit montoringConfig
	- prometheus.yml (setup job host ips correctly)
	- prometheus-agent.yml (edit promethues server-ip,
			setup active probe host ips for each host)
	- datasources/promethues.yml (for grafana)

5. Cd to ../02_setupScripts and run ./init-all.sh <xx>
	Where xx is topology number
	01 - collapsed core
	02 - spine leaf
	03 - fat tree
