### **🖧 NLP-Driven Intent-Based Networking Layered Architecture for SDNs**

**🔍 Research Project | Final Year Computer Engineering**

This repository encompasses the implementation, experiments, and documentation of our research on **NLP-driven Intent-Based Networking (IBN) for Software-Defined Networks (SDNs)**. Our approach integrates **Natural Language Processing (NLP), Reinforcement Learning (RL), and SDN programmability** to facilitate dynamic, intelligent, and adaptive network configurations based on high-level user intents.

---

## **📌 Project Overview**

**🔹 Goal:**
Develop a scalable and intelligent **NLP-driven IBN Architecture** for SDNs, enabling dynamic policy adaptation, monitoring transparency, and intelligent reasoning.

**🔹 Key Components:**

* **NLP Processing & Intent Recognition:**
  Utilizes Large Language Models (LLMs) and Named Entity Recognition (NER) to interpret user-defined intents expressed in natural language.

* **SDN Intent Enforcement:**
  Leverages ONOS SDN Controller, OpenFlow protocols to implement and enforce the generated policies within the network infrastructure.

* **Emulation & Testing:**
  Utilizes Containernet, Mininet, and OpenFlow switches to simulate and evaluate the performance of the proposed architecture.

---

## **⚙️ Methodology**

Our methodology involves the following steps:

1. **Intent Recognition:**

   * **Objective:** Accurately interpret user-defined intents expressed in natural language.
   * **Approach:** Employ NLP techniques, including Large Language Models (LLMs) and Named Entity Recognition (NER), to parse and understand the intents.

2. **Policy Generation:**

   * **Objective:** Translate recognized intents into actionable network policies.
   * **Approach:** Utilize machine learning models to map structured intents to network policies, considering factors such as traffic patterns and resource availability.

3. **Policy Optimization:**

   * **Objective:** Refine and adapt policies to optimize network performance.
   * **Approach:** Apply Reinforcement Learning (RL) techniques to continuously learn and adjust policies based on real-time network conditions.

4. **Policy Enforcement:**

   * **Objective:** Implement and enforce the generated policies within the network infrastructure.
   * **Approach:** Leverage SDN controllers and protocols, such as ONOS, P4, and OpenFlow, to enforce policies and ensure the network operates according to the defined intents.

---



## **🧪 Experiment Setup and Implementation**

Our experimental setup includes:

* **Network Emulator:**

  * **Tool:** Containernet and Mininet.
  * **Purpose:** Simulate network environments to test and evaluate the proposed architecture.

* **SDN Controller:**

  * **Tool:** ONOS SDN Controller.
  * **Purpose:** Manage and control the network infrastructure, facilitating the enforcement of policies.

* **Switches:**

  * **Tools:** OpenFlow switches.
  * **Purpose:** Implement data plane functionalities, enabling the enforcement of network policies.

* **Traffic Generation:**

  * **Tool:** Cisco TRex.
  * **Purpose:** Generate realistic and high-performance network traffic to stress-test and evaluate network behavior under various load conditions.

* **Monitoring and Visualization:**

  * **Tools:** Prometheus and Grafana.
  * **Purpose:** Collect, store, and visualize real-time network metrics to monitor the network’s performance, detect anomalies, and ensure policy compliance.

---
## **📚 Related Works**

Our research builds upon and contributes to existing literature in the field of Intent-Based Networking (IBN) and Software-Defined Networking (SDN). Notable references include:

* A. S. Jacobs et al., “Hey, Lumi! Using Natural Language for Intent-Based Network Management”.
  *This work explores the use of natural language processing to facilitate user-friendly intent specification in network management.*

* M. Riftadi and F. Kuipers, “P4I/O: Intent-Based Networking with P4,” in 2019 IEEE Conference on Network Softwarization (NetSoft), Paris, France: IEEE, Jun. 2019, pp. 438–443. doi: 10.1109/NETSOFT.2019.8806662.
  *This paper presents a framework integrating P4 programmable data planes with intent-based networking to improve network flexibility.*

* D. Comer and A. Rastegarnia, “OSDF: A Framework For Software Defined Network Programming,” in 2018 15th IEEE Annual Consumer Communications & Networking Conference (CCNC), Jan. 2018, pp. 1–4. doi: 10.1109/CCNC.2018.8319173.
  *This framework proposes a method for software-defined network programming aimed at simplifying network control and automation.*

* D. Comer and A. Rastegarnia, “OSDF: An Intent-based Software Defined Network Programming Framework,” Jul. 06, 2018, arXiv: arXiv:1807.02205. doi: 10.48550/arXiv.1807.02205.
  *An extended version of OSDF focusing on intent-based abstractions to enable more intuitive SDN programming.*

---

## **📌 Conclusion**

This project presents an innovative approach to network management by integrating NLP-driven intent recognition with SDN programmability. The proposed architecture enables dynamic, intelligent, and adaptive network configurations based on high-level user intents, paving the way for more autonomous and efficient network systems.

---

## **📌 Stay Tuned**

For updates and further developments, please refer to the [project website](https://cepdnaclk.github.io/e19-4yp-NLP-Driven-IBN-Layered-Architecture-for-SDNs/).

---
